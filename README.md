# SmartStore - E-commerce con Búsqueda Semántica e IA

Plataforma de e-commerce multi-tienda con búsqueda semántica potenciada por ontologías OWL y SPARQL. Permite a los usuarios explorar más de 300 productos en 20 tiendas, con filtros dinámicos inferidos desde la ontología, autenticación JWT e historial de compras.

## ✨ Características

- **Búsqueda semántica** — consultas SPARQL sobre ontología OWL para encontrar productos por concepto, no solo por palabras clave
- **Filtros dinámicos** — atributos de filtrado inferidos automáticamente según la clase ontológica del producto
- **Logos y banners** — cada tienda tiene imagen de portada e identidad visual
- **300+ productos** en 20 tiendas de distintas categorías
- **Carrito de compras** persistente con control de cantidades
- **Checkout** con resumen de pedido e IVA calculado
- **Autenticación** completa: registro, login, perfil editable
- **Historial de compras** con detalle de cada orden
- **Recomendaciones** basadas en relaciones ontológicas
- **Diseño responsive** — adaptado a móvil, tablet y escritorio
- **Dark mode** nativo con tokens CSS vía Tailwind v4

## 🏗️ Arquitectura

```
smartstore/
├── backend/          # Django 5.1 + Django REST Framework
│   ├── apps/
│   │   ├── stores/   # Tiendas y fixtures de datos
│   │   ├── products/ # Catálogo y filtros
│   │   ├── ontology/ # Motor semántico OWL/SPARQL
│   │   ├── users/    # Auth JWT + perfil
│   │   └── orders/   # Historial de compras
│   └── config/       # Settings, URLs raíz, WSGI/ASGI
└── frontend/         # React 18 + Vite + Tailwind v4
    └── src/
        ├── api/      # Clientes axios por dominio
        ├── components/
        │   ├── layout/  # Header, Footer
        │   └── ui/      # ProductCard, StoreCard, FilterPanel…
        ├── context/  # CartContext, AuthContext, ToastContext
        └── pages/    # HomePage, StorePage, ProductDetailPage…
```

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Django 5.1, Django REST Framework 3.15 |
| Auth | djangorestframework-simplejwt 5.3 |
| Semántica | rdflib 7.1, SPARQLWrapper 2.0 |
| Filtros | django-filter 24.3 |
| CORS | django-cors-headers 4.6 |
| Base de datos | SQLite (desarrollo) / PostgreSQL (producción) |
| Frontend | React 18, Vite, TanStack Query |
| Estilos | Tailwind CSS v4 (CSS variables) |
| Iconos | lucide-react |
| Routing | React Router v6 |

## 📦 Instalación

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- Git

### Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Variables de entorno
cp .env.example .env
# Editar .env con SECRET_KEY y configuración de BD

# Migraciones
python manage.py migrate

# Poblar datos de ejemplo (20 tiendas, 300+ productos)
python manage.py populate_fixtures

# Servidor de desarrollo
python manage.py runserver
```

### Frontend

```bash
cd frontend   # o la raíz donde está package.json

npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173` con el backend en `http://localhost:8000`.

### Repoblar fixtures desde cero

```bash
python manage.py populate_fixtures --flush
```

## 🔌 API Endpoints

### Autenticación — `/api/auth/`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register/` | Crear cuenta |
| `POST` | `/api/auth/login/` | Obtener access + refresh token |
| `POST` | `/api/auth/logout/` | Invalidar token |
| `GET/PATCH` | `/api/auth/me/` | Datos del usuario autenticado |
| `GET/PATCH` | `/api/auth/profile/` | Perfil extendido (teléfono, ciudad…) |
| `POST` | `/api/auth/token/refresh/` | Renovar access token |

### Tiendas — `/api/stores/`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/stores/` | Listar todas las tiendas |
| `GET` | `/api/stores/{slug}/` | Detalle de una tienda |
| `GET` | `/api/stores/{slug}/products/` | Productos de la tienda (con filtros) |

### Productos — `/api/products/`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/products/` | Listar productos (búsqueda, filtros, orden) |
| `GET` | `/api/products/{id}/` | Detalle de un producto |

### Ontología — `/api/ontology/`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/ontology/suggestions/` | Autocompletado semántico |
| `GET` | `/api/ontology/classes/` | Clases de la ontología |
| `GET` | `/api/ontology/filters/` | Filtros dinámicos por clase |
| `POST` | `/api/ontology/semantic-search/` | Búsqueda semántica SPARQL |
| `POST` | `/api/ontology/infer/` | Inferir etiquetas de un producto |
| `POST` | `/api/ontology/reload/` | Recargar ontología en memoria |

### Órdenes — `/api/orders/`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/orders/` | Historial de compras del usuario |
| `POST` | `/api/orders/` | Crear nueva orden |
| `PATCH` | `/api/orders/{id}/` | Actualizar estado de la orden |

## 🗄️ Modelos principales

```
Store         — name, slug, description, logo, banner, categories
Product       — name, store, price, image, rating, semantic_tags, stock
UserProfile   — user (1:1), phone, city, address, avatar
Order         — user, order_number, status, subtotal, tax, total
OrderItem     — order, product_id, name, quantity, price_at_purchase
```

## 🧠 Búsqueda Semántica

La ontología OWL (`ontology/smartstore.owl`) define una jerarquía de clases de productos con propiedades y restricciones. Al hacer una búsqueda:

1. El frontend envía la consulta al endpoint `/api/ontology/suggestions/`
2. El servicio SPARQL busca clases que coincidan semánticamente
3. Se retornan los IDs de productos que pertenecen a esa clase
4. El frontend flota esos productos al inicio del catálogo, resaltándolos con un borde

Los filtros del panel lateral también se generan dinámicamente según la clase ontológica activa (e.g., una clase "Smartphone" expone filtros de RAM, almacenamiento y sistema operativo).

## 📁 Estructura del proyecto

```
smartstore/
├── .gitignore
├── README.md
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── apps/
│       ├── stores/
│       │   ├── models.py       # Store
│       │   ├── serializers.py
│       │   ├── views.py        # StoreViewSet
│       │   └── management/commands/populate_fixtures.py
│       ├── products/
│       │   ├── models.py       # Product
│       │   ├── filters.py      # django-filter
│       │   └── views.py        # ProductViewSet
│       ├── ontology/
│       │   ├── services.py     # OntologyService (rdflib + SPARQL)
│       │   └── views.py
│       ├── users/
│       │   ├── models.py       # UserProfile
│       │   └── views.py        # Register, Login, Me, Profile
│       └── orders/
│           ├── models.py       # Order, OrderItem
│           └── views.py        # OrderListCreateView, OrderStatusUpdateView
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/
        │   ├── auth.js         # authApi (login, register, orders…)
        │   ├── stores.js
        │   └── ontology.js
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── CartContext.jsx
        │   └── ToastContext.jsx
        ├── components/
        │   ├── layout/         # Header, Footer
        │   └── ui/             # ProductCard, StoreCard, FilterPanel…
        └── pages/
            ├── HomePage.jsx
            ├── StorePage.jsx
            ├── ProductDetailPage.jsx
            ├── CartPage.jsx
            ├── CheckoutPage.jsx
            └── ProfilePage.jsx
```

## 📄 Licencia

Proyecto académico — Ingeniería del Conocimiento.
