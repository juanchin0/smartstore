# Auth & User Profile — Design Spec
Date: 2026-05-15

## Scope

Implement full authentication and user profile system for SmartStore. Covers Django backend (new `apps/users/` app, JWT auth endpoints) and React frontend (AuthContext, login/register/profile pages, header update, protected routes).

**Out of scope (explicit decisions):**
- Order history model — checkout remains simulated; profile shows "Sin compras aún" placeholder
- Password reset flow — omitted until SMTP is configured

---

## Backend

### New app: `apps/users/`

```
apps/users/
  __init__.py
  apps.py
  admin.py
  models.py
  serializers.py
  views.py
  urls.py
```

Register in `INSTALLED_APPS` as `'apps.users'`.

### Model: `UserProfile`

OneToOne relation to Django's built-in `User`. Created automatically via `post_save` signal on `User` creation (or explicitly in `RegisterView`).

```python
class UserProfile(models.Model):
    user     = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone    = models.CharField(max_length=20, blank=True)
    city     = models.CharField(max_length=100, blank=True)
    address  = models.TextField(blank=True)
    avatar   = models.ImageField(upload_to='avatars/', blank=True, null=True)
```

`full_name` is stored on `User.first_name` + `User.last_name` (no duplication). The serializer exposes it as a computed field.

### Email-based login

Django's `User` model uses `username` by default. Strategy: **store email as both `email` and `username`** during registration (username = email). This keeps simplejwt's `TokenObtainPairSerializer` working without subclassing, since it authenticates via `username` field.

### Endpoints

| Method | URL | Auth required | Description |
|--------|-----|---------------|-------------|
| `POST` | `/api/auth/register/` | No | Create User + UserProfile, return access + refresh tokens |
| `POST` | `/api/auth/login/` | No | simplejwt TokenObtainPairView (username=email, password) |
| `POST` | `/api/auth/logout/` | Yes | Blacklist refresh token |
| `GET`  | `/api/auth/me/` | Yes | Return user + profile data |
| `PUT`  | `/api/auth/profile/` | Yes | Update profile fields + email |

### Serializers

- **`RegisterSerializer`** — validates email uniqueness, password confirmation, creates User and UserProfile
- **`UserSerializer`** — read-only, returns `{ id, email, full_name, profile: { phone, city, address, avatar } }`
- **`ProfileUpdateSerializer`** — writable, updates UserProfile fields + User.email/first_name/last_name

### Token blacklist (logout)

Enable `rest_framework_simplejwt.token_blacklist` in `INSTALLED_APPS`. `LogoutView` receives `{ refresh }` in body and calls `RefreshToken(token).blacklist()`.

### Settings additions

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

---

## Frontend

### New files

```
src/
  api/auth.js
  context/AuthContext.jsx
  components/auth/ProtectedRoute.jsx
  pages/LoginPage.jsx
  pages/RegisterPage.jsx
  pages/ProfilePage.jsx
```

### `AuthContext`

Exposes via `useAuth()`:

```js
{ user, loading, login, logout, register, updateProfile }
```

- **Mount**: reads `access` token from localStorage → calls `GET /api/auth/me/` to hydrate `user`. Sets `loading = false` after.
- **`login(email, password)`**: calls `/api/auth/login/`, stores `access` + `refresh` in localStorage, sets `user`.
- **`logout()`**: calls `/api/auth/logout/` with refresh token, clears localStorage, sets `user = null`.
- **`register(data)`**: calls `/api/auth/register/`, auto-logs in with returned tokens.
- **`updateProfile(data)`**: calls `PUT /api/auth/profile/`, updates `user` state.
- axios interceptor: attaches `Authorization: Bearer <access>` to all requests.

### `ProtectedRoute`

```jsx
// Renders children if authenticated; redirects to /login?next=<current-path> otherwise.
// Shows nothing (null) while auth is loading to avoid flash.
```

### Routes in `App.jsx`

```jsx
/                → StoresCatalog (public)
/tienda/:slug    → StorePage (public)
/carrito         → CartPage (public)
/checkout        → ProtectedRoute → CheckoutPage
/login           → LoginPage (redirects to / if already authed)
/registro        → RegisterPage (redirects to / if already authed)
/perfil          → ProtectedRoute → ProfilePage
/tienda/:storeSlug/producto/:productId → ProductDetailPage (public)
```

### Pages

**`LoginPage` (`/login`)**
- Fields: Email, Password
- Button: "Iniciar sesión"
- Link to `/registro`
- On success: navigates to `?next` param or `/`

**`RegisterPage` (`/registro`)**
- Fields: Email, Contraseña, Confirmar contraseña, Nombre completo, Teléfono, Ciudad
- Button: "Crear cuenta"
- Link to `/login`
- On success: auto-login → navigate to `/`

**`ProfilePage` (`/perfil`)**
- Shows current user data, all fields editable inline
- Fields: Nombre completo, Email, Teléfono, Ciudad, Dirección
- Buttons: "Guardar cambios", "Cerrar sesión"
- "Cambiar contraseña" button → placeholder toast "Próximamente" (no reset flow)
- Purchase history section → placeholder "Sin compras aún"

### Header changes

Replace the static `<User>` icon button with conditional logic:

- **Not authenticated**: two buttons — "Registrarse" (outline) + "Iniciar sesión" (primary, small)
- **Authenticated**: avatar circle (initials fallback) + name truncated + dropdown menu:
  - Mi perfil → `/perfil`
  - Cerrar sesión → calls `logout()`

### CheckoutPage changes

- Wrap route with `ProtectedRoute` in `App.jsx` (no changes inside the component for redirect)
- Pre-fill form fields from `user.profile` on mount: name, email, phone, city, address

---

## Data Flow

```
User visits /checkout (not authed)
→ ProtectedRoute redirects to /login?next=/checkout
→ User logs in → AuthContext.login() stores tokens, sets user
→ Navigate to /checkout
→ CheckoutPage reads user from useAuth(), pre-fills form
```

---

## Error Handling

- API errors (400/401/500) are caught in each page and displayed inline below the form
- 401 on `/api/auth/me/` at mount → clear localStorage, user = null (token expired)
- Network errors → generic "Error de conexión" message
- Form validation is client-side first (empty fields, email format, password match)
