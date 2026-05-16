from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer
from .filters import ProductFilter, apply_semantic_tag_filters


class ProductViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    queryset = Product.objects.filter(is_active=True).select_related('store')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'rating', 'created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def filter_queryset(self, queryset):
        # 1. Standard DRF filters (ProductFilter + search + ordering)
        queryset = super().filter_queryset(queryset)
        # 2. Dynamic ontology semantic-tag filters (?hasSurface=Trail, etc.)
        queryset = apply_semantic_tag_filters(queryset, self.request.query_params)
        return queryset
