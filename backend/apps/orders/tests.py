from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from apps.stores.models import Store
from apps.products.models import Product


def make_user(email='buyer@test.com'):
    return User.objects.create_user(
        username=email, email=email, password='testpass123',
    )


def make_store():
    return Store.objects.create(name='Test Store')


def make_product(store):
    return Product.objects.create(store=store, name='Widget', price='10.00')


class OrderModelTest(TestCase):
    def setUp(self):
        self.user = make_user()
        self.store = make_store()
        self.product = make_product(self.store)

    def _make_order(self, **kwargs):
        from .models import Order
        defaults = dict(user=self.user, subtotal='9.09', tax='0.91', total='10.00')
        defaults.update(kwargs)
        return Order.objects.create(**defaults)

    def test_order_number_auto_generated(self):
        order = self._make_order()
        self.assertTrue(order.order_number)
        self.assertEqual(len(order.order_number), 8)

    def test_order_default_status_is_pending(self):
        order = self._make_order()
        self.assertEqual(order.status, 'pending')

    def test_order_numbers_are_unique(self):
        o1 = self._make_order()
        o2 = self._make_order()
        self.assertNotEqual(o1.order_number, o2.order_number)

    def test_order_item_creation(self):
        from .models import Order, OrderItem
        order = self._make_order()
        item = OrderItem.objects.create(
            order=order,
            product=self.product,
            name='Widget',
            quantity=2,
            price_at_purchase='5.00',
            subtotal='10.00',
        )
        self.assertEqual(item.order, order)
        self.assertEqual(item.name, 'Widget')
        self.assertEqual(order.items.count(), 1)

    def test_order_item_product_null_on_product_delete(self):
        from .models import Order, OrderItem
        order = self._make_order()
        item = OrderItem.objects.create(
            order=order,
            product=self.product,
            name='Widget',
            quantity=1,
            price_at_purchase='10.00',
            subtotal='10.00',
        )
        self.product.delete()
        item.refresh_from_db()
        self.assertIsNone(item.product)
        self.assertEqual(item.name, 'Widget')
