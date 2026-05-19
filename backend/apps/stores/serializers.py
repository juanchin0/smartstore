from rest_framework import serializers
from .models import Store


class StoreListSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(
        source='products.count', read_only=True
    )

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'banner',
            'categories', 'product_count', 'is_active',
        ]
        read_only_fields = ['id', 'slug']


class StoreDetailSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(
        source='products.count', read_only=True
    )
    active_product_count = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'banner',
            'categories', 'website', 'product_count', 'active_product_count',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_active_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class StoreWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ['name', 'description', 'logo', 'banner', 'categories', 'website']

    def validate_categories(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError('categories debe ser una lista.')
        if any(not isinstance(c, str) for c in value):
            raise serializers.ValidationError('Cada categoría debe ser un string.')
        return value
