from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from apps.products.serializers import ProductListSerializer
from apps.products.models import Product
from .services import OntologyService
from .serializers import SemanticSearchRequestSerializer, InferTagsRequestSerializer


def _service() -> OntologyService:
    return OntologyService()


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/ontology/suggestions/?q=query
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def search_suggestions(request):
    """
    Autocomplete: busca tiendas y productos cuyo nombre contenga la query.
    Usado por el header mientras el usuario escribe (debounce 300ms).

    Respuesta:
    {
      "stores":   [ <StoreListSerializer × 5> ],
      "products": [ <ProductListSerializer × 6> ]
    }
    """
    q = request.query_params.get('q', '').strip()
    if len(q) < 2:
        return Response({'stores': [], 'products': []})

    from apps.stores.models import Store
    from apps.products.models import Product
    from apps.stores.serializers import StoreListSerializer
    from apps.products.serializers import ProductListSerializer

    stores = Store.objects.filter(name__icontains=q, is_active=True).order_by('name')[:5]
    products = (
        Product.objects
        .filter(name__icontains=q, is_active=True)
        .select_related('store')
        .order_by('-rating')[:6]
    )

    return Response({
        'stores': StoreListSerializer(stores, many=True, context={'request': request}).data,
        'products': ProductListSerializer(products, many=True, context={'request': request}).data,
    })


# ──────────���──────────────────────────��───────────────────────────────────────
# GET /api/ontology/classes/
# ────────────────────────────────────────────���────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def product_classes(request):
    """
    Lista todas las clases de producto definidas en la ontología.

    Respuesta:
    [
      {
        "uri": "http://www.smartstore.org/ontology#Smartphone",
        "local_name": "Smartphone",
        "label": "Smartphone",
        "comment": "Teléfonos inteligentes...",
        "parent": "ElectronicProduct"
      },
      ...
    ]
    """
    return Response(_service().get_product_classes())


# ─────────────────────────────��────────────────────────────────��──────────────
# GET /api/ontology/filters/?class=Smartphone
# ───────────────────────────────────────────��─────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def dynamic_filters(request):
    """
    Retorna filtros dinámicos de UI para una clase de producto OWL.
    Acepta nombre corto (Smartphone) o URI completa.

    Respuesta:
    {
      "hasBrand":     {"label": "Marca", "type": "select", "values": ["Samsung", ...]},
      "hasColor":     {"label": "Color", "type": "select", "values": ["Negro", ...]},
      "hasScreenSize":{"label": "Tamaño de pantalla", "type": "range", "values": null},
      "has5G":        {"label": "Tiene 5G", "type": "boolean", "values": null}
    }
    """
    ontology_class = request.query_params.get('class', '').strip()
    if not ontology_class:
        return Response(
            {'error': 'Parámetro "class" requerido. Ej: ?class=Smartphone'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        filters = _service().get_dynamic_filters(ontology_class)
    except Exception as exc:
        return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "class": ontology_class,
        "filters": filters,
        "filter_count": len(filters),
    })


# ───────────────────────────────────────────��─────────────────────────────────
# POST /api/ontology/semantic-search/
# ────────────────────────────��───────────────────────────────────���────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def semantic_search(request):
    """
    Búsqueda semántica: tokeniza la query, resuelve clases OWL via label/synonyms,
    expande a subclases y busca en la DB.

    Body:
    {
      "query": "zapatillas running ligeras",
      "store_id": 1          // opcional
    }

    Respuesta:
    {
      "query": "zapatillas running ligeras",
      "inferred_class": "RunningShoe",
      "inferred_class_uri": "http://...#RunningShoe",
      "confidence": 0.95,
      "matched_tokens": ["zapatillas", "running", "ligeras"],
      "expanded_classes": ["RunningShoe", "SportswearProduct"],
      "count": 5,
      "products": [ <ProductListSerializer data> ]
    }
    """
    serializer = SemanticSearchRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    query_text = serializer.validated_data['query']
    store_id = serializer.validated_data.get('store_id')

    try:
        result = _service().semantic_search(query_text, store_id=store_id)
    except Exception as exc:
        logger_msg = f"semantic_search error: {exc}"
        return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Hidratar IDs → objetos Product serializados
    product_ids = result.pop('products', [])
    products_qs = Product.objects.filter(
        id__in=product_ids, is_active=True
    ).select_related('store')

    product_data = ProductListSerializer(
        products_qs, many=True, context={'request': request}
    ).data

    return Response({
        "query": query_text,
        **result,
        "count": len(product_data),
        "products": product_data,
    })


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/ontology/infer/
# ─────────────────────────────────────────────────���───────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def infer_tags(request):
    """
    Infiere etiquetas semánticas para un producto usando las InferenceRule
    de la ontología y las relaciones ss:compatibleWith.

    Body:
    {
      "product_id": 42
    }

    Respuesta:
    {
      "product_id": 42,
      "tags": ["Muy valorado", "Compatible con Auriculares", "Producto Premium"],
      "confidence": [0.95, 0.95, 0.9],
      "rules_evaluated": 12,
      "rules_matched": 3
    }
    """
    serializer = InferTagsRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    product_id = serializer.validated_data['product_id']

    try:
        result = _service().infer_tags(product_id)
    except Exception as exc:
        return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "product_id": product_id,
        **result,
    })


# ──────────────���────────────────────────────────��─────────────────────────────
# GET /api/ontology/reload/ (solo DEBUG)
# ───────────────────────────────────────���──────────────────────────────��──────

@api_view(['POST'])
def reload_ontology(request):
    """Recarga el grafo OWL en memoria. Solo disponible en DEBUG=True."""
    from django.conf import settings
    if not settings.DEBUG:
        return Response(
            {'error': 'Solo disponible en DEBUG mode'},
            status=status.HTTP_403_FORBIDDEN
        )
    from .services import reload_graph
    reload_graph()
    return Response({'status': 'Ontología recargada correctamente'})
