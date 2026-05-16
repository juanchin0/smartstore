from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Store
from .serializers import StoreListSerializer, StoreDetailSerializer


class StoreViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    queryset = Store.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StoreDetailSerializer
        return StoreListSerializer

    @action(detail=True, methods=['get'], url_path='products')
    def products(self, request, slug=None):
        """GET /api/stores/{slug}/products/ — productos activos de una tienda."""
        from apps.products.models import Product
        from apps.products.serializers import ProductListSerializer
        from apps.products.filters import ProductFilter, apply_semantic_tag_filters

        store = self.get_object()
        queryset = Product.objects.filter(store=store, is_active=True).select_related('store')

        # Standard field filters (price, rating, discount, ontology_class…)
        filterset = ProductFilter(request.query_params, queryset=queryset)
        if filterset.is_valid():
            queryset = filterset.qs

        # Dynamic ontology semantic-tag filters (?hasSurface=Trail, ?hasCushioningType=Máxima…)
        queryset = apply_semantic_tag_filters(queryset, request.query_params)

        # Text search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        # Ordering
        ordering = request.query_params.get('ordering', '-created_at')
        allowed_orderings = ['price', '-price', 'rating', '-rating', 'created_at', '-created_at', 'name', '-name']
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)

        serializer = ProductListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
