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


class OrderAPITest(APITestCase):
    def setUp(self):
        self.user = make_user('buyer@test.com')
        self.other_user = make_user('other@test.com')
        self.store = make_store()
        self.product = make_product(self.store)
        self.payload = {
            'subtotal': '9.09',
            'tax': '0.91',
            'total': '10.00',
            'items': [
                {
                    'product_id': self.product.pk,
                    'name': 'Widget',
                    'quantity': 1,
                    'price_at_purchase': '9.09',
                    'subtotal': '9.09',
                }
            ],
        }

    def test_create_order_authenticated_returns_201(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/orders/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('order_number', response.data)
        self.assertEqual(len(response.data['order_number']), 8)

    def test_create_order_unauthenticated_returns_401(self):
        response = self.client.post('/api/auth/orders/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_persists_to_db(self):
        from .models import Order
        self.client.force_authenticate(user=self.user)
        self.client.post('/api/auth/orders/', self.payload, format='json')
        self.assertEqual(Order.objects.filter(user=self.user).count(), 1)

    def test_create_order_response_includes_nested_items(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/orders/', self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        items = response.data['items']
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['name'], 'Widget')
        self.assertEqual(items[0]['quantity'], 1)

    def test_list_orders_authenticated_returns_only_own_orders(self):
        from .models import Order
        self.client.force_authenticate(user=self.user)
        Order.objects.create(user=self.user, subtotal='9.09', tax='0.91', total='10.00')
        Order.objects.create(user=self.other_user, subtotal='9.09', tax='0.91', total='10.00')
        response = self.client.get('/api/auth/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_orders_unauthenticated_returns_401(self):
        response = self.client.get('/api/auth/orders/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_orders_includes_nested_items(self):
        self.client.force_authenticate(user=self.user)
        self.client.post('/api/auth/orders/', self.payload, format='json')
        response = self.client.get('/api/auth/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data[0]['items']), 1)
