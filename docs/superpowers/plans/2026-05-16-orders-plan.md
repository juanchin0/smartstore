# Order History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real order persistence — Django Order/OrderItem models, REST endpoints for create/list, and frontend integration in CheckoutPage (real POST) and ProfilePage (live history table).

**Architecture:** New `apps/orders` Django app owns models and views; its URLs are mounted at `/api/auth/` so authenticated endpoints stay grouped. The frontend gains two API functions (`createOrder`, `getOrders`) in `auth.js`. CheckoutPage replaces its `setTimeout` mock with a real POST; ProfilePage replaces its static placeholder with a live orders table.

**Tech Stack:** Django 5.1, Django REST Framework, djangorestframework-simplejwt, React 18, Tailwind v4, SQLite (dev).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/apps/orders/__init__.py` | Create | Empty marker |
| `backend/apps/orders/apps.py` | Create | AppConfig |
| `backend/apps/orders/models.py` | Create | Order, OrderItem models |
| `backend/apps/orders/serializers.py` | Create | OrderItemSerializer, OrderSerializer |
| `backend/apps/orders/views.py` | Create | OrderListCreateView |
| `backend/apps/orders/urls.py` | Create | `orders/` route |
| `backend/apps/orders/admin.py` | Create | Register both models in admin |
| `backend/apps/orders/tests.py` | Create | Model + API tests |
| `backend/apps/orders/migrations/__init__.py` | Create | Empty migrations package |
| `backend/config/settings.py` | Modify | Add `'apps.orders'` to LOCAL_APPS |
| `backend/config/urls.py` | Modify | Add `include('apps.orders.urls')` at `api/auth/` |
| `frontend/src/api/auth.js` | Modify | Add `getOrders`, `createOrder` functions |
| `frontend/src/pages/CheckoutPage.jsx` | Modify | Replace setTimeout with real API call |
| `frontend/src/pages/ProfilePage.jsx` | Modify | Replace placeholder with orders table |

---

## Working Directory Note

All `python manage.py` commands run from `backend/` (`C:\proyecto-ingenieria-del-conocimiento\smartstore\backend`).
All frontend commands run from `frontend/` (`C:\proyecto-ingenieria-del-conocimiento\smartstore\frontend`).

---

### Task 1: Scaffold `apps/orders` and register in Django

**Files:**
- Create: `backend/apps/orders/__init__.py`
- Create: `backend/apps/orders/apps.py`
- Create: `backend/apps/orders/admin.py`
- Create: `backend/apps/orders/models.py`
- Create: `backend/apps/orders/serializers.py`
- Create: `backend/apps/orders/views.py`
- Create: `backend/apps/orders/urls.py`
- Create: `backend/apps/orders/tests.py`
- Create: `backend/apps/orders/migrations/__init__.py`
- Modify: `backend/config/settings.py`
- Modify: `backend/config/urls.py`

- [ ] **Step 1: Create app package files**

Create `backend/apps/orders/__init__.py` (empty file).

Create `backend/apps/orders/apps.py`:
```python
from django.apps import AppConfig


class OrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.orders'
    verbose_name = 'Órdenes'
```

Create `backend/apps/orders/migrations/__init__.py` (empty file).

- [ ] **Step 2: Create stub source files**

Create `backend/apps/orders/models.py`:
```python
from django.db import models
```

Create `backend/apps/orders/serializers.py`:
```python
```

Create `backend/apps/orders/views.py`:
```python
```

Create `backend/apps/orders/admin.py`:
```python
from django.contrib import admin
```

Create `backend/apps/orders/urls.py`:
```python
from django.urls import path

urlpatterns = []
```

Create `backend/apps/orders/tests.py`:
```python
```

- [ ] **Step 3: Register app in settings**

In `backend/config/settings.py`, change LOCAL_APPS from:
```python
LOCAL_APPS = [
    'apps.users',
    'apps.stores',
    'apps.products',
    'apps.ontology',
]
```
to:
```python
LOCAL_APPS = [
    'apps.users',
    'apps.stores',
    'apps.products',
    'apps.ontology',
    'apps.orders',
]
```

- [ ] **Step 4: Wire URLs in config**

In `backend/config/urls.py`, add the orders URL include. Change:
```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/stores/', include('apps.stores.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/ontology/', include('apps.ontology.urls')),
]
```
to:
```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/auth/', include('apps.orders.urls')),
    path('api/stores/', include('apps.stores.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/ontology/', include('apps.ontology.urls')),
]
```

- [ ] **Step 5: Verify Django can import the app**

Run from `backend/`:
```
python manage.py check
```
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 6: Commit**

```bash
git add backend/apps/orders/ backend/config/settings.py backend/config/urls.py
git commit -m "feat(orders): scaffold apps/orders Django app"
```

---

### Task 2: Order + OrderItem models (TDD)

**Files:**
- Modify: `backend/apps/orders/tests.py`
- Modify: `backend/apps/orders/models.py`

- [ ] **Step 1: Write failing model tests**

Replace `backend/apps/orders/tests.py` with:
```python
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
```

- [ ] **Step 2: Run tests to confirm failure**

Run from `backend/`:
```
python manage.py test apps.orders.tests.OrderModelTest -v 2
```
Expected: ERROR — `ImportError` or `ModuleNotFoundError` because `Order` model does not exist yet.

- [ ] **Step 3: Implement Order + OrderItem models**

Replace `backend/apps/orders/models.py` with:
```python
import uuid
from django.conf import settings
from django.db import models
from apps.products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmado'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders',
    )
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Orden'
        verbose_name_plural = 'Órdenes'

    def __str__(self):
        return f'Order #{self.order_number} — {self.user.email}'

    def save(self, *args, **kwargs):
        if not self.order_number:
            while True:
                candidate = uuid.uuid4().hex[:8].upper()
                if not Order.objects.filter(order_number=candidate).exists():
                    self.order_number = candidate
                    break
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items',
    )
    name = models.CharField(max_length=300)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'Línea de orden'
        verbose_name_plural = 'Líneas de orden'

    def __str__(self):
        return f'{self.name} ×{self.quantity}'
```

- [ ] **Step 4: Create and apply migrations**

Run from `backend/`:
```
python manage.py makemigrations orders
python manage.py migrate
```
Expected output from makemigrations:
```
Migrations for 'orders':
  apps/orders/migrations/0001_initial.py
    - Create model Order
    - Create model OrderItem
```
Expected output from migrate:
```
  Applying orders.0001_initial... OK
```

- [ ] **Step 5: Run model tests — expect PASS**

Run from `backend/`:
```
python manage.py test apps.orders.tests.OrderModelTest -v 2
```
Expected: `Ran 5 tests in ...s` — `OK`

- [ ] **Step 6: Commit**

```bash
git add backend/apps/orders/models.py backend/apps/orders/migrations/ backend/apps/orders/tests.py
git commit -m "feat(orders): add Order + OrderItem models with auto order_number"
```

---

### Task 3: Serializers, Views, URLs, Admin (TDD)

**Files:**
- Modify: `backend/apps/orders/tests.py`
- Modify: `backend/apps/orders/serializers.py`
- Modify: `backend/apps/orders/views.py`
- Modify: `backend/apps/orders/urls.py`
- Modify: `backend/apps/orders/admin.py`

- [ ] **Step 1: Append API tests to tests.py**

Append the following class to `backend/apps/orders/tests.py` (after the existing `OrderModelTest` class):
```python

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
```

- [ ] **Step 2: Run API tests to confirm failure**

Run from `backend/`:
```
python manage.py test apps.orders.tests.OrderAPITest -v 2
```
Expected: FAIL — `404 Not Found` because the URL and view don't exist yet.

- [ ] **Step 3: Implement OrderItemSerializer and OrderSerializer**

Replace `backend/apps/orders/serializers.py` with:
```python
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
```

- [ ] **Step 4: Implement OrderListCreateView**

Replace `backend/apps/orders/views.py` with:
```python
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer


class OrderListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related('items')
            .order_by('-created_at')
        )
```

- [ ] **Step 5: Implement URLs**

Replace `backend/apps/orders/urls.py` with:
```python
from django.urls import path
from .views import OrderListCreateView

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
]
```

- [ ] **Step 6: Register in admin**

Replace `backend/apps/orders/admin.py` with:
```python
from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'name', 'quantity', 'price_at_purchase', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'total', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['order_number', 'user__email']
    inlines = [OrderItemInline]
    readonly_fields = ['order_number', 'created_at', 'updated_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'quantity', 'price_at_purchase', 'subtotal']
```

- [ ] **Step 7: Run all order tests — expect PASS**

Run from `backend/`:
```
python manage.py test apps.orders -v 2
```
Expected: `Ran 12 tests in ...s` — `OK`

- [ ] **Step 8: Commit**

```bash
git add backend/apps/orders/serializers.py backend/apps/orders/views.py backend/apps/orders/urls.py backend/apps/orders/admin.py backend/apps/orders/tests.py
git commit -m "feat(orders): add serializers, views, and URL endpoint for order CRUD"
```

---

### Task 4: Frontend — add `getOrders` and `createOrder` to auth.js

**Files:**
- Modify: `frontend/src/api/auth.js`

- [ ] **Step 1: Add order API functions**

In `frontend/src/api/auth.js`, the current content is:
```js
import api from './axiosConfig'

export const authApi = {
  register: (data) =>
    api.post('/api/auth/register/', data).then(r => r.data),

  login: (email, password) =>
    api.post('/api/auth/login/', { email, password }).then(r => r.data),

  logout: (refresh) =>
    api.post('/api/auth/logout/', { refresh }).then(r => r.data),

  me: () =>
    api.get('/api/auth/me/').then(r => r.data),

  updateProfile: (data) =>
    api.put('/api/auth/profile/', data).then(r => r.data),

  refreshToken: (refresh) =>
    api.post('/api/auth/token/refresh/', { refresh }).then(r => r.data),
}
```

Replace it with:
```js
import api from './axiosConfig'

export const authApi = {
  register: (data) =>
    api.post('/api/auth/register/', data).then(r => r.data),

  login: (email, password) =>
    api.post('/api/auth/login/', { email, password }).then(r => r.data),

  logout: (refresh) =>
    api.post('/api/auth/logout/', { refresh }).then(r => r.data),

  me: () =>
    api.get('/api/auth/me/').then(r => r.data),

  updateProfile: (data) =>
    api.put('/api/auth/profile/', data).then(r => r.data),

  refreshToken: (refresh) =>
    api.post('/api/auth/token/refresh/', { refresh }).then(r => r.data),

  getOrders: () =>
    api.get('/api/auth/orders/').then(r => r.data),

  createOrder: (data) =>
    api.post('/api/auth/orders/', data).then(r => r.data),
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/auth.js
git commit -m "feat(orders): add getOrders + createOrder to authApi"
```

---

### Task 5: Frontend — CheckoutPage real API call

**Files:**
- Modify: `frontend/src/pages/CheckoutPage.jsx`

Context: The current `CheckoutPage.jsx` uses `useState(() => Math.floor(10000 + Math.random() * 90000))` for `orderNumber` and fakes the checkout with `await new Promise(r => setTimeout(r, 1400))`. We replace both with a real `authApi.createOrder()` call.

- [ ] **Step 1: Update imports**

At the top of `frontend/src/pages/CheckoutPage.jsx`, change the imports from:
```js
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, CheckCircle, ArrowLeft, Lock,
  User, Mail, MapPin, Phone, CreditCard, Package,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, cn } from '../lib/utils'
```
to:
```js
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, CheckCircle, ArrowLeft, Lock,
  User, Mail, MapPin, Phone, CreditCard, Package,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authApi } from '../api/auth'
import { formatPrice, cn } from '../lib/utils'
```

- [ ] **Step 2: Replace orderNumber state and add toast**

In the `CheckoutPage` function body, change:
```js
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber] = useState(() => Math.floor(10000 + Math.random() * 90000))
```
to:
```js
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState(null)
```

- [ ] **Step 3: Replace handleSubmit with real API call**

Change the `handleSubmit` function from:
```js
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    // Snapshot before anything changes
    const snapshot = [...items]
    const totalSnapshot = total

    await new Promise(r => setTimeout(r, 1400)) // simulate API call

    // Clear cart BEFORE showing success screen
    clearCart()
    setOrderedItems(snapshot)
    setOrderedTotal(totalSnapshot)
    setLoading(false)
    setSuccess(true)
  }
```
to:
```js
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const snapshot = [...items]
    const totalSnapshot = total

    try {
      const order = await authApi.createOrder({
        subtotal,
        tax: taxes,
        total,
        items: items.map(item => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price_at_purchase: item.price,
          subtotal: item.price * item.quantity,
        })),
      })
      clearCart()
      setOrderedItems(snapshot)
      setOrderedTotal(totalSnapshot)
      setOrderNumber(order.order_number)
      setSuccess(true)
    } catch {
      toast('Error al procesar el pedido. Intenta de nuevo.', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }
```

- [ ] **Step 4: Verify the SuccessScreen still receives orderNumber**

The `SuccessScreen` is rendered as:
```jsx
<SuccessScreen
  orderNumber={orderNumber}
  items={orderedItems}
  total={orderedTotal}
  onContinue={handleContinue}
/>
```
This is already correct — `orderNumber` is now set from `order.order_number` instead of the random initializer. No change needed here.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/CheckoutPage.jsx
git commit -m "feat(orders): CheckoutPage posts real order to API instead of simulating"
```

---

### Task 6: Frontend — ProfilePage order history table

**Files:**
- Modify: `frontend/src/pages/ProfilePage.jsx`

Context: The current `ProfilePage.jsx` has a "Mis compras" section that shows a static "Sin compras aún" placeholder. We replace it with a live table that fetches from `authApi.getOrders()`.

Status badge colors use only tokens defined in `index.css`: `primary`, `semantic` (purple), `sale` (amber), `success` (green), `destructive` (red).

- [ ] **Step 1: Update imports**

Change the imports at the top of `frontend/src/pages/ProfilePage.jsx` from:
```js
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Home, ShoppingBag,
  Save, LogOut, Loader2, CheckCircle,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/utils'
```
to:
```js
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Home, ShoppingBag,
  Save, LogOut, Loader2, CheckCircle, Package, ChevronDown, ChevronUp,
} from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authApi } from '../api/auth'
import { cn, formatPrice } from '../lib/utils'
```

- [ ] **Step 2: Add orders state and STATUS_LABELS constant**

After the existing `const [saved, setSaved] = useState(false)` line, add:
```js
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)
```

Add the status labels constant just above the component function (before `export default function ProfilePage()`):
```js
const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_STYLES = {
  pending: 'bg-sale/10 text-sale',
  confirmed: 'bg-primary/10 text-primary',
  shipped: 'bg-semantic/10 text-semantic',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
}
```

- [ ] **Step 3: Add orders fetch effect**

After the existing `useEffect` block that pre-fills the form from `user`, add:
```js
  useEffect(() => {
    if (!user) return
    setOrdersLoading(true)
    authApi.getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [user])
```

Also add the expand toggle handler after the existing `update` function:
```js
  const toggleExpand = (id) =>
    setExpandedOrder(prev => (prev === id ? null : id))
```

- [ ] **Step 4: Replace "Mis compras" placeholder section**

Find the current "Purchase history placeholder" section (lines 214–228 in the original):
```jsx
            {/* Purchase history placeholder */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
              <h2 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" />
                Mis compras
              </h2>
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <ShoppingBag size={20} className="text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Sin compras aún</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Tu historial de pedidos aparecerá aquí
                </p>
              </div>
            </div>
```

Replace it with:
```jsx
            {/* Order history */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
              <h2 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" />
                Mis compras
              </h2>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <ShoppingBag size={20} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Sin compras aún</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Tu historial de pedidos aparecerá aquí
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {orders.map(order => (
                    <div key={order.id}>
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="w-full flex items-center justify-between py-3 px-1 rounded-lg
                                   hover:bg-muted/40 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Package size={14} className="text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              #{order.order_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('es-MX', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            STATUS_STYLES[order.status] ?? 'bg-muted text-muted-foreground',
                          )}>
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                          <span className="text-sm font-data font-semibold text-foreground">
                            {formatPrice(Number(order.total))}
                          </span>
                          {expandedOrder === order.id
                            ? <ChevronUp size={14} className="text-muted-foreground" />
                            : <ChevronDown size={14} className="text-muted-foreground" />
                          }
                        </div>
                      </button>

                      {expandedOrder === order.id && (
                        <div className="pb-3 px-1">
                          <div className="bg-muted/30 rounded-xl divide-y divide-border/60 overflow-hidden">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between px-3 py-2.5"
                              >
                                <div>
                                  <p className="text-xs text-foreground">{item.name}</p>
                                  <p className="text-[11px] text-muted-foreground">
                                    ×{item.quantity} · {formatPrice(Number(item.price_at_purchase))} c/u
                                  </p>
                                </div>
                                <span className="text-xs font-data text-foreground shrink-0">
                                  {formatPrice(Number(item.subtotal))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ProfilePage.jsx
git commit -m "feat(orders): ProfilePage shows live order history table with expandable items"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Order model (user FK, order_number, subtotal/tax/total, status, timestamps) | Task 2 |
| OrderItem model (order FK, product FK null=True, name snapshot, quantity, price_at_purchase, subtotal) | Task 2 |
| OrderSerializer with nested OrderItemSerializer | Task 3 |
| GET /api/auth/orders/ (IsAuthenticated, user-scoped) | Task 3 |
| POST /api/auth/orders/ (IsAuthenticated, create order + items) | Task 3 |
| makemigrations + migrate | Task 2 |
| Frontend getOrders + createOrder in auth.js | Task 4 |
| CheckoutPage: real POST, use returned order_number | Task 5 |
| CheckoutPage: clear cart on success, show order # | Task 5 |
| CheckoutPage: error toast on failure (no cart clear) | Task 5 |
| ProfilePage: replace placeholder with real table | Task 6 |
| ProfilePage: order number, date, status badge, total, expandable items | Task 6 |
| Tests: create authenticated/unauthenticated, list scoped, nested items | Task 3 |

All spec requirements covered. No gaps found.

**Placeholder scan:** No TBD, TODO, or hand-wavy steps present.

**Type consistency:**
- `authApi.createOrder` defined in Task 4, used in Task 5 ✓
- `authApi.getOrders` defined in Task 4, used in Task 6 ✓
- `order.order_number` (8-char hex) set in Task 2, consumed in Tasks 3/5/6 ✓
- `order.items` related_name set in Task 2, used in serializer Task 3 ✓
- `STATUS_LABELS` / `STATUS_STYLES` defined and used in Task 6 only ✓
- `formatPrice` imported in Task 6, already available in `../lib/utils` ✓
- `toggleExpand` defined and called in Task 6 ✓
