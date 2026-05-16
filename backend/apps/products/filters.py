import django_filters
from django.db.models import F, Q
from .models import Product

# Params consumed by ProductFilter, DRF, or pagination — must NOT be
# re-processed as semantic-tag filters.
KNOWN_FILTER_PARAMS = frozenset([
    'price_min', 'price_max', 'rating_min', 'store_slug', 'ontology_class',
    'has_discount', 'ordering', 'search', 'store', 'page', 'page_size', 'format',
])


def apply_semantic_tag_filters(queryset, query_params):
    """
    For every query param whose key is NOT in KNOWN_FILTER_PARAMS, treat its
    value as a semantic_tags filter.

    Single value:  ?hasSurface=Asfalto
    Multi-value:   ?hasSurface=Asfalto,Trail   → OR within one key
    Multiple keys: ?hasSurface=Trail&hasCushioningType=Máxima  → AND between keys

    SQLite: uses json_each() which returns properly-decoded Unicode strings,
            so accented values like "Máxima" match correctly.
    PostgreSQL: uses JSONField __contains (subset) per value, OR-ed together.
    """
    from django.db import connection

    for key, raw_value in query_params.items():
        if key in KNOWN_FILTER_PARAMS or not raw_value:
            continue
        if key.endswith(('_min', '_max')):
            continue
        if raw_value.lower() in ('true', 'false'):
            continue
        values = [v.strip() for v in raw_value.split(',') if v.strip()]
        if not values:
            continue

        if connection.vendor == 'sqlite':
            # json_each() iterates JSON array elements and returns decoded Unicode
            # values, so "Máxima" in stored JSON compares equal to "Máxima"
            table = queryset.model._meta.db_table
            placeholders = ', '.join(['%s'] * len(values))
            queryset = queryset.extra(
                where=[
                    f'EXISTS ('
                    f'  SELECT 1 FROM json_each("{table}"."semantic_tags")'
                    f'  WHERE value IN ({placeholders})'
                    f')'
                ],
                params=values,
            )
        else:
            # PostgreSQL: JSONField __contains checks array subset (proper JSON op)
            tag_q = Q()
            for v in values:
                tag_q |= Q(semantic_tags__contains=[v])
            queryset = queryset.filter(tag_q)

    return queryset


class ProductFilter(django_filters.FilterSet):
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte', label='Precio mínimo')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte', label='Precio máximo')
    rating_min = django_filters.NumberFilter(field_name='rating', lookup_expr='gte', label='Valoración mínima')
    store_slug = django_filters.CharFilter(field_name='store__slug', label='Slug de tienda')
    ontology_class = django_filters.CharFilter(lookup_expr='icontains', label='Clase ontológica')
    has_discount = django_filters.BooleanFilter(
        method='filter_has_discount', label='Tiene descuento'
    )

    class Meta:
        model = Product
        fields = ['store', 'store_slug', 'ontology_class', 'price_min', 'price_max', 'rating_min']

    def filter_has_discount(self, queryset, name, value):
        if value:
            return queryset.filter(compare_price__isnull=False, compare_price__gt=F('price'))
        return queryset
