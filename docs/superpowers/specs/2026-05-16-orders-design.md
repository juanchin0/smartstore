# Order History Design

**Date:** 2026-05-16
**Status:** Approved

## Goal

Add a real order history system to SmartStore: Django `Order`/`OrderItem` models, REST endpoints, real checkout creation on the frontend, and an order history table in the profile page.

---

## Architecture

A new Django app `apps/orders` owns the `Order` and `OrderItem` models and their REST views. The app's URLs are mounted at `/api/auth/` alongside the existing users URLs so all authenticated endpoints share the same prefix. The frontend gains two new API functions, and both `CheckoutPage` and `ProfilePage` are updated to use them.

**Tech stack:** Django 5.1, DRF, djangorestframework-simplejwt, React 18, Tailwind v4, Vite, SQLite (dev).

---

## Data Models

### Order

```
apps/orders/models.py
```

| Field | Type | Notes |
|---|---|---|
| user | FK(settings.AUTH_USER_MODEL, CASCADE) | Owner |
| order_number | CharField(20, unique=True, editable=False) | Auto UUID4[:8].upper() |
| subtotal | DecimalField(12, 2) | |
| tax | DecimalField(12, 2) | |
| total | DecimalField(12, 2) | |
| status | CharField(20, choices) | `pending` default |
| created_at | DateTimeField(auto_now_add) | |
| updated_at | DateTimeField(auto_now) | |

Status choices: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`.

Auto-generation of `order_number`: `uuid.uuid4().hex[:8].upper()` in `save()` before calling super.

### OrderItem

| Field | Type | Notes |
|---|---|---|
| order | FK(Order, CASCADE) | |
| product | FK(Product, null=True, SET_NULL) | Nullable to survive product deletion |
| name | CharField(300) | Snapshot of product name at purchase time |
| quantity | PositiveIntegerField | |
| price_at_purchase | DecimalField(12, 2) | |
| subtotal | DecimalField(12, 2) | price_at_purchase × quantity |

---

## Serializers

### OrderItemSerializer

- Fields: `product` (PK, read-only), `name`, `quantity`, `price_at_purchase`, `subtotal`
- Read: nested inside OrderSerializer
- Write: accepts `product_id`, `name`, `quantity`, `price_at_purchase`, `subtotal`

### OrderSerializer

- Fields: `id`, `order_number`, `subtotal`, `tax`, `total`, `status`, `created_at`, `items` (nested)
- Read: `items` is a nested `OrderItemSerializer(many=True)`
- Write: accepts `subtotal`, `tax`, `total`, `items` list; creates Order + all OrderItems atomically

---

## API Endpoints

Both require `IsAuthenticated`.

### GET /api/auth/orders/

Returns the authenticated user's orders, newest first.

```json
[
  {
    "id": 1,
    "order_number": "A1B2C3D4",
    "subtotal": "90.91",
    "tax": "9.09",
    "total": "100.00",
    "status": "pending",
    "created_at": "2026-05-16T12:00:00Z",
    "items": [
      {
        "product": 5,
        "name": "Laptop Pro",
        "quantity": 1,
        "price_at_purchase": "90.91",
        "subtotal": "90.91"
      }
    ]
  }
]
```

### POST /api/auth/orders/

Creates an order. Request body:

```json
{
  "subtotal": "90.91",
  "tax": "9.09",
  "total": "100.00",
  "items": [
    {
      "product_id": 5,
      "name": "Laptop Pro",
      "quantity": 1,
      "price_at_purchase": "90.91",
      "subtotal": "90.91"
    }
  ]
}
```

Returns the created order (same shape as GET item, 201).

---

## URL Configuration

**`apps/orders/urls.py`:**
```python
path('orders/', OrderListCreateView.as_view(), name='order-list-create')
```

**`config/urls.py`** — add alongside existing users include:
```python
path('api/auth/', include('apps.orders.urls')),
```

**`config/settings.py`** — add to `LOCAL_APPS`:
```python
'apps.orders',
```

---

## Frontend Changes

### `frontend/src/api/auth.js`

Add two functions to `authApi`:

```js
getOrders: () =>
  api.get('/api/auth/orders/').then(r => r.data),

createOrder: (data) =>
  api.post('/api/auth/orders/', data).then(r => r.data),
```

### `frontend/src/pages/CheckoutPage.jsx`

Replace the `setTimeout` simulation in `handleSubmit` with a real API call:

1. Build `orderPayload`:
   ```js
   {
     subtotal: subtotal,
     tax: taxes,
     total: total,
     items: items.map(item => ({
       product_id: item.product_id,
       name: item.name,
       quantity: item.quantity,
       price_at_purchase: item.price,
       subtotal: item.price * item.quantity,
     }))
   }
   ```
2. `await authApi.createOrder(orderPayload)` — use returned `order.order_number` to replace the local `orderNumber` state
3. On success: `clearCart()`, set `orderedItems`, `orderedTotal`, `setSuccess(true)`
4. On error: show toast `'Error al procesar el pedido'` with `type: 'error'`, `setLoading(false)`

Remove the static `orderNumber` useState initializer and replace with state that starts null and is set from the API response.

### `frontend/src/pages/ProfilePage.jsx`

Replace the "Sin compras aún" placeholder section with a real order history table:

1. Add state: `orders` (array, default `[]`), `ordersLoading` (bool)
2. `useEffect`: call `authApi.getOrders()` when `user` is available; set `orders`
3. Render:
   - While loading: spinner or skeleton
   - Empty state: keep existing "Sin compras aún" UI
   - With orders: table rows showing `order_number`, formatted `created_at` date, status badge (color-coded), `total`
   - Each row has an expand toggle; expanded row shows `items` list (name, qty, price_at_purchase × qty)

---

## Error Handling

- `createOrder` failure: toast error, stay on checkout form (do NOT clear cart)
- `getOrders` failure: silent (empty state shown, no toast needed for profile load failures)
- Product FK null in items (deleted product): frontend falls back to stored `name` field

---

## Tests

**`apps/orders/tests.py`** — test cases:

1. `test_create_order_authenticated` — POST creates order + items, returns 201 with order_number
2. `test_create_order_unauthenticated` — returns 401
3. `test_list_orders_authenticated` — GET returns only the requesting user's orders
4. `test_list_orders_unauthenticated` — returns 401
5. `test_order_number_unique` — two orders have different order_numbers
6. `test_order_items_nested` — GET response contains nested items with correct fields
