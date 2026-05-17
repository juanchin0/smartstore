from rest_framework import serializers
from apps.products.models import Product
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = OrderItem
        fields = ['product', 'product_id', 'name', 'quantity', 'price_at_purchase', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'subtotal', 'tax', 'total', 'status', 'created_at', 'items']
        read_only_fields = ['order_number', 'status']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(user=self.context['request'].user, **validated_data)
        for item_data in items_data:
            product_id = item_data.pop('product_id', None)
            product = Product.objects.filter(pk=product_id).first() if product_id else None
            OrderItem.objects.create(order=order, product=product, **item_data)
        return order
