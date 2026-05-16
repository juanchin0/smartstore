from rest_framework import serializers
from .models import Product


class ProductListSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_slug = serializers.CharField(source='store.slug', read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'store', 'store_name', 'store_slug',
            'name', 'slug', 'price', 'compare_price', 'discount_percent',
            'image', 'rating', 'rating_count',
            'semantic_tags', 'ontology_class', 'is_active',
        ]
        read_only_fields = ['id', 'slug', 'store_name', 'store_slug', 'discount_percent']


class ProductDetailSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_slug = serializers.CharField(source='store.slug', read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'store', 'store_name', 'store_slug',
            'name', 'slug', 'description',
            'price', 'compare_price', 'discount_percent',
            'image', 'rating', 'rating_count',
            'semantic_tags', 'ontology_class',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'store_name', 'store_slug', 'discount_percent', 'created_at', 'updated_at']


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'store', 'name', 'description', 'price', 'compare_price',
            'image', 'semantic_tags', 'ontology_class',
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('El precio no puede ser negativo.')
        return value

    def validate_compare_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('El precio comparativo no puede ser negativo.')
        return value

    def validate_semantic_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError('semantic_tags debe ser una lista.')
        return value

    def validate(self, attrs):
        price = attrs.get('price')
        compare_price = attrs.get('compare_price')
        if compare_price is not None and price is not None and compare_price <= price:
            raise serializers.ValidationError(
                {'compare_price': 'El precio comparativo debe ser mayor que el precio actual.'}
            )
        return attrs
