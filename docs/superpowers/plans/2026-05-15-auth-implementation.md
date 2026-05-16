# Auth & User Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement JWT authentication and user profile system for SmartStore, covering a new Django `apps/users/` backend app and six new/modified React files on the frontend.

**Architecture:** Django `apps/users/` handles all auth logic; `UserProfile` extends Django's built-in `User` via OneToOne; simplejwt provides JWT tokens with blacklist-based logout. On the frontend, `AuthContext` owns auth state and hydrates from localStorage on mount; `ProtectedRoute` wraps private pages; the existing `axiosConfig` gains a request interceptor that attaches the Bearer token automatically.

**Tech Stack:** Django 5.1, DRF, djangorestframework-simplejwt 5.3.1, React 18, Tailwind v4, react-router-dom, axios.

---

## File Map

### Backend — create
| File | Responsibility |
|------|----------------|
| `backend/apps/users/__init__.py` | App package marker |
| `backend/apps/users/apps.py` | App config |
| `backend/apps/users/admin.py` | Admin registration |
| `backend/apps/users/models.py` | `UserProfile` model |
| `backend/apps/users/serializers.py` | `RegisterSerializer`, `UserSerializer`, `ProfileUpdateSerializer`, `EmailTokenSerializer` |
| `backend/apps/users/views.py` | `RegisterView`, `LoginView`, `LogoutView`, `MeView`, `ProfileView` |
| `backend/apps/users/urls.py` | URL patterns for all auth endpoints |
| `backend/apps/users/tests.py` | APITestCase for all endpoints |

### Backend — modify
| File | What changes |
|------|-------------|
| `backend/config/settings.py` | Add `apps.users` + `token_blacklist` to `LOCAL_APPS`/`THIRD_PARTY_APPS`; add `SIMPLE_JWT` block |
| `backend/config/urls.py` | Add `include('apps.users.urls')`; remove raw `TokenObtainPairView` (login now lives in users app) |

### Frontend — create
| File | Responsibility |
|------|----------------|
| `frontend/src/api/auth.js` | Thin API wrappers for all auth endpoints |
| `frontend/src/context/AuthContext.jsx` | `AuthProvider` + `useAuth` hook — owns user state, tokens |
| `frontend/src/components/auth/ProtectedRoute.jsx` | Redirects unauthenticated users to `/login?next=<path>` |
| `frontend/src/pages/LoginPage.jsx` | `/login` page |
| `frontend/src/pages/RegisterPage.jsx` | `/registro` page |
| `frontend/src/pages/ProfilePage.jsx` | `/perfil` page (protected) |

### Frontend — modify
| File | What changes |
|------|-------------|
| `frontend/src/api/axiosConfig.js` | Add request interceptor that attaches `Authorization: Bearer <token>` |
| `frontend/src/App.jsx` | Wrap with `AuthProvider`; add `/login`, `/registro`, `/perfil` routes; wrap `/checkout` + `/perfil` in `ProtectedRoute` |
| `frontend/src/components/layout/Header.jsx` | Replace static `<User>` button with auth-aware UI (two buttons vs avatar+dropdown) |
| `frontend/src/pages/CheckoutPage.jsx` | Pre-fill form from `useAuth().user` on mount |

---

## Task 1: Backend settings + users app scaffold

**Files:**
- Modify: `backend/config/settings.py`
- Create: `backend/apps/users/__init__.py`, `backend/apps/users/apps.py`, `backend/apps/users/admin.py`

- [ ] **Step 1.1: Update settings.py**

Add `token_blacklist` to `THIRD_PARTY_APPS` and `apps.users` to `LOCAL_APPS`, then add `SIMPLE_JWT` block. Edit `backend/config/settings.py`:

```python
# Replace the existing THIRD_PARTY_APPS list:
THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
]

# Replace the existing LOCAL_APPS list:
LOCAL_APPS = [
    'apps.users',
    'apps.stores',
    'apps.products',
    'apps.ontology',
]
```

Then add this block at the bottom of settings.py (after CORS_ALLOWED_ORIGINS):

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

- [ ] **Step 1.2: Create app files**

Create `backend/apps/users/__init__.py` (empty file).

Create `backend/apps/users/apps.py`:
```python
from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    verbose_name = 'Users'
```

Create `backend/apps/users/admin.py`:
```python
from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'city')
    raw_id_fields = ('user',)
```

- [ ] **Step 1.3: Update config/urls.py**

Replace the current content of `backend/config/urls.py` with:

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/stores/', include('apps.stores.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/ontology/', include('apps.ontology.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

---

## Task 2: UserProfile model + migration

**Files:**
- Create: `backend/apps/users/models.py`

- [ ] **Step 2.1: Write the failing test**

Create `backend/apps/users/tests.py`:
```python
from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileModelTest(TestCase):
    def test_profile_created_with_user(self):
        user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123',
        )
        UserProfile.objects.create(user=user, phone='5551234567', city='CDMX')
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.phone, '5551234567')
        self.assertEqual(profile.city, 'CDMX')

    def test_profile_deleted_with_user(self):
        user = User.objects.create_user(
            username='del@example.com',
            email='del@example.com',
            password='testpass123',
        )
        UserProfile.objects.create(user=user)
        user_id = user.id
        user.delete()
        self.assertFalse(UserProfile.objects.filter(user_id=user_id).exists())
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
cd backend
python manage.py test apps.users.tests.UserProfileModelTest -v 2
```
Expected: ImportError or ModuleNotFoundError (models.py not created yet).

- [ ] **Step 2.3: Create models.py**

Create `backend/apps/users/models.py`:
```python
from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return f'Profile({self.user.email})'
```

- [ ] **Step 2.4: Run migrations**

```bash
python manage.py makemigrations users
python manage.py migrate
```
Expected output: `Creating tables... Running deferred SQL... OK`
Also migrates `token_blacklist` tables.

- [ ] **Step 2.5: Run tests to verify they pass**

```bash
python manage.py test apps.users.tests.UserProfileModelTest -v 2
```
Expected: `OK` — 2 tests passed.

- [ ] **Step 2.6: Commit**

```bash
cd ..
git add backend/apps/users/ backend/config/settings.py backend/config/urls.py
git commit -m "feat: add users app with UserProfile model and JWT blacklist settings"
```

---

## Task 3: Auth serializers

**Files:**
- Create: `backend/apps/users/serializers.py`

- [ ] **Step 3.1: Write failing serializer tests**

Add to `backend/apps/users/tests.py`:
```python
from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import RegisterSerializer, UserSerializer

class RegisterSerializerTest(TestCase):
    def _valid_data(self, email='a@b.com'):
        return {
            'email': email,
            'password': 'Str0ngPass!',
            'password2': 'Str0ngPass!',
            'full_name': 'Ana García',
            'phone': '5551111111',
            'city': 'CDMX',
        }

    def test_valid_registration_creates_user_and_profile(self):
        s = RegisterSerializer(data=self._valid_data())
        self.assertTrue(s.is_valid(), s.errors)
        user = s.save()
        self.assertEqual(user.email, 'a@b.com')
        self.assertEqual(user.username, 'a@b.com')
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.city, 'CDMX')

    def test_duplicate_email_is_invalid(self):
        User.objects.create_user(username='a@b.com', email='a@b.com', password='x')
        s = RegisterSerializer(data=self._valid_data())
        self.assertFalse(s.is_valid())
        self.assertIn('email', s.errors)

    def test_password_mismatch_is_invalid(self):
        data = self._valid_data()
        data['password2'] = 'different'
        s = RegisterSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn('password', s.errors)

class UserSerializerTest(TestCase):
    def test_serializes_user_and_profile(self):
        user = User.objects.create_user(
            username='x@y.com', email='x@y.com',
            password='pass', first_name='Luis', last_name='López',
        )
        UserProfile.objects.create(user=user, phone='5552222222', city='GDL')
        data = UserSerializer(user).data
        self.assertEqual(data['email'], 'x@y.com')
        self.assertEqual(data['full_name'], 'Luis López')
        self.assertEqual(data['profile']['city'], 'GDL')
```

- [ ] **Step 3.2: Run test to verify it fails**

```bash
python manage.py test apps.users.tests.RegisterSerializerTest apps.users.tests.UserSerializerTest -v 2
```
Expected: ImportError — serializers.py not created yet.

- [ ] **Step 3.3: Create serializers.py**

Create `backend/apps/users/serializers.py`:
```python
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('phone', 'city', 'address', 'avatar')


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'profile')

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=150, default='')
    phone = serializers.CharField(max_length=20, default='', allow_blank=True)
    city = serializers.CharField(max_length=100, default='', allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Ya existe una cuenta con este email.')
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden.'})
        return attrs

    def save(self):
        data = self.validated_data
        parts = data.get('full_name', '').split(' ', 1)
        first_name = parts[0] if parts else ''
        last_name = parts[1] if len(parts) > 1 else ''
        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            first_name=first_name,
            last_name=last_name,
        )
        UserProfile.objects.create(
            user=user,
            phone=data.get('phone', ''),
            city=data.get('city', ''),
        )
        return user


class ProfileUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError('Email ya en uso.')
        return value.lower()

    def save(self):
        user = self.context['request'].user
        data = self.validated_data
        if 'full_name' in data:
            parts = data['full_name'].split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
        if 'email' in data:
            user.email = data['email']
            user.username = data['email']
        user.save()
        profile = user.profile
        for field in ('phone', 'city', 'address'):
            if field in data:
                setattr(profile, field, data[field])
        profile.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        attrs[User.USERNAME_FIELD] = attrs.pop('email', '')
        return super().validate(attrs)
```

- [ ] **Step 3.4: Run tests to verify they pass**

```bash
python manage.py test apps.users.tests.RegisterSerializerTest apps.users.tests.UserSerializerTest -v 2
```
Expected: `OK` — 4 tests passed.

- [ ] **Step 3.5: Commit**

```bash
git add backend/apps/users/serializers.py backend/apps/users/tests.py
git commit -m "feat: auth serializers (register, user, profile update, email token)"
```

---

## Task 4: Auth views + URL routing + endpoint tests

**Files:**
- Create: `backend/apps/users/views.py`, `backend/apps/users/urls.py`

- [ ] **Step 4.1: Write failing endpoint tests**

Add to `backend/apps/users/tests.py`:
```python
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import UserProfile

class AuthEndpointsTest(APITestCase):
    def _register(self, email='user@test.com', password='Str0ngPass!'):
        return self.client.post('/api/auth/register/', {
            'email': email, 'password': password, 'password2': password,
            'full_name': 'Test User', 'phone': '', 'city': '',
        }, format='json')

    def test_register_returns_tokens(self):
        res = self._register()
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertIn('user', res.data)

    def test_login_returns_tokens(self):
        self._register()
        res = self.client.post('/api/auth/login/', {
            'email': 'user@test.com', 'password': 'Str0ngPass!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_me_requires_auth(self):
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_user_data(self):
        reg = self._register()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {reg.data["access"]}')
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'user@test.com')

    def test_profile_update(self):
        reg = self._register()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {reg.data["access"]}')
        res = self.client.put('/api/auth/profile/', {
            'full_name': 'Ana López', 'phone': '5551234567', 'city': 'GDL', 'address': '',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['full_name'], 'Ana López')
        self.assertEqual(res.data['profile']['city'], 'GDL')

    def test_logout_blacklists_token(self):
        reg = self._register()
        res = self.client.post('/api/auth/logout/', {
            'refresh': reg.data['refresh'],
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
```

- [ ] **Step 4.2: Run tests to verify they fail**

```bash
python manage.py test apps.users.tests.AuthEndpointsTest -v 2
```
Expected: Error — no URLs or views yet.

- [ ] **Step 4.3: Create views.py**

Create `backend/apps/users/views.py`:
```python
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    EmailTokenObtainPairSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
        except Exception:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def put(self, request):
        serializer = ProfileUpdateSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        return Response(UserSerializer(user).data)
```

- [ ] **Step 4.4: Create urls.py**

Create `backend/apps/users/urls.py`:
```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, LogoutView, MeView, ProfileView, RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
```

- [ ] **Step 4.5: Run all backend tests**

```bash
python manage.py test apps.users -v 2
```
Expected: `OK` — all tests pass (model + serializer + endpoint tests).

- [ ] **Step 4.6: Commit**

```bash
git add backend/apps/users/views.py backend/apps/users/urls.py backend/apps/users/tests.py
git commit -m "feat: auth views and URL routes (register, login, logout, me, profile)"
```

---

## Task 5: Frontend — api/auth.js + axiosConfig interceptor

**Files:**
- Create: `frontend/src/api/auth.js`
- Modify: `frontend/src/api/axiosConfig.js`

- [ ] **Step 5.1: Create api/auth.js**

Create `frontend/src/api/auth.js`:
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

- [ ] **Step 5.2: Update axiosConfig.js**

Replace the content of `frontend/src/api/axiosConfig.js` with:
```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail
      || err.response?.data?.error
      || (typeof err.response?.data === 'object'
          ? Object.values(err.response.data).flat().join(' ')
          : null)
      || err.message
    return Promise.reject(new Error(msg))
  }
)

export default api
```

- [ ] **Step 5.3: Manual test**

Start Django: `python manage.py runserver`
In browser console run:
```js
fetch('http://localhost:8000/api/auth/register/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'prueba@test.com', password: 'testpass123',
    password2: 'testpass123', full_name: 'Prueba User', phone: '', city: ''
  })
}).then(r => r.json()).then(console.log)
```
Expected: `{ access: "...", refresh: "...", user: { id: 1, email: "prueba@test.com", ... } }`

- [ ] **Step 5.4: Commit**

```bash
cd ..
git add frontend/src/api/auth.js frontend/src/api/axiosConfig.js
git commit -m "feat: auth API client and axios auth interceptor"
```

---

## Task 6: AuthContext

**Files:**
- Create: `frontend/src/context/AuthContext.jsx`

- [ ] **Step 6.1: Create AuthContext.jsx**

Create `frontend/src/context/AuthContext.jsx`:
```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ss_access')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem('ss_access')
        localStorage.removeItem('ss_refresh')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('ss_access', data.access)
    localStorage.setItem('ss_refresh', data.refresh)
    const me = await authApi.me()
    setUser(me)
  }

  const logout = async () => {
    const refresh = localStorage.getItem('ss_refresh')
    try { if (refresh) await authApi.logout(refresh) } catch {}
    localStorage.removeItem('ss_access')
    localStorage.removeItem('ss_refresh')
    setUser(null)
  }

  const register = async (formData) => {
    const data = await authApi.register(formData)
    localStorage.setItem('ss_access', data.access)
    localStorage.setItem('ss_refresh', data.refresh)
    setUser(data.user)
  }

  const updateProfile = async (formData) => {
    const updated = await authApi.updateProfile(formData)
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

- [ ] **Step 6.2: Commit**

```bash
git add frontend/src/context/AuthContext.jsx
git commit -m "feat: AuthContext with login, logout, register, updateProfile"
```

---

## Task 7: ProtectedRoute component

**Files:**
- Create: `frontend/src/components/auth/ProtectedRoute.jsx`

- [ ] **Step 7.1: Create ProtectedRoute.jsx**

Create `frontend/src/components/auth/ProtectedRoute.jsx`:
```jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  return children
}
```

- [ ] **Step 7.2: Commit**

```bash
git add frontend/src/components/auth/ProtectedRoute.jsx
git commit -m "feat: ProtectedRoute redirects unauthenticated users to /login"
```

---

## Task 8: LoginPage

**Files:**
- Create: `frontend/src/pages/LoginPage.jsx`

- [ ] **Step 8.1: Create LoginPage.jsx**

Create `frontend/src/pages/LoginPage.jsx`:
```jsx
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

function Field({ label, icon: Icon, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 bg-input border rounded-xl transition-all',
        'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15',
        error ? 'border-destructive/60' : 'border-border',
      )}>
        {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
        <input
          {...props}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={next} replace />

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setServerError('')
  }

  const validate = () => {
    const e = {}
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.password) e.password = 'Requerido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(next, { replace: true })
    } catch (err) {
      setServerError(err.message || 'Credenciales incorrectas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Smart<span className="text-primary">Store</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h1 className="font-display font-bold text-xl text-foreground mb-1">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground mb-6">Accede a tu cuenta SmartStore</p>

          {serverError && (
            <div className="mb-4 px-3 py-2.5 bg-destructive/10 border border-destructive/30
                            rounded-xl text-sm text-destructive">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Email"
              icon={Mail}
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              error={errors.email}
            />
            <Field
              label="Contraseña"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              error={errors.password}
            />

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-xl text-sm font-semibold transition-all mt-2',
                'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 active:scale-[0.98]',
              )}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Entrando…</span>
                : 'Iniciar sesión'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 8.2: Commit**

```bash
git add frontend/src/pages/LoginPage.jsx
git commit -m "feat: LoginPage with email/password form and error handling"
```

---

## Task 9: RegisterPage

**Files:**
- Create: `frontend/src/pages/RegisterPage.jsx`

- [ ] **Step 9.1: Create RegisterPage.jsx**

Create `frontend/src/pages/RegisterPage.jsx`:
```jsx
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, MapPin, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

function Field({ label, icon: Icon, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 bg-input border rounded-xl transition-all',
        'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15',
        error ? 'border-destructive/60' : 'border-border',
      )}>
        {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
        <input
          {...props}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '', password: '', password2: '',
    full_name: '', phone: '', city: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setServerError('')
  }

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (form.password !== form.password2) e.password2 = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(err.message || 'Error al crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Smart<span className="text-primary">Store</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h1 className="font-display font-bold text-xl text-foreground mb-1">Crear cuenta</h1>
          <p className="text-sm text-muted-foreground mb-6">Únete a SmartStore</p>

          {serverError && (
            <div className="mb-4 px-3 py-2.5 bg-destructive/10 border border-destructive/30
                            rounded-xl text-sm text-destructive">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Field
              label="Nombre completo *"
              icon={User}
              type="text"
              placeholder="Ana García"
              value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
              error={errors.full_name}
            />
            <Field
              label="Email *"
              icon={Mail}
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              error={errors.email}
            />
            <Field
              label="Contraseña *"
              icon={Lock}
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              error={errors.password}
            />
            <Field
              label="Confirmar contraseña *"
              icon={Lock}
              type="password"
              placeholder="Repite tu contraseña"
              value={form.password2}
              onChange={e => update('password2', e.target.value)}
              error={errors.password2}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Teléfono"
                icon={Phone}
                type="tel"
                placeholder="+52 55 0000 0000"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                error={errors.phone}
              />
              <Field
                label="Ciudad"
                icon={MapPin}
                type="text"
                placeholder="Ciudad de México"
                value={form.city}
                onChange={e => update('city', e.target.value)}
                error={errors.city}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-xl text-sm font-semibold transition-all mt-1',
                'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 active:scale-[0.98]',
              )}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Creando cuenta…</span>
                : 'Crear cuenta'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 9.2: Commit**

```bash
git add frontend/src/pages/RegisterPage.jsx
git commit -m "feat: RegisterPage with full validation and auto-login on success"
```

---

## Task 10: ProfilePage

**Files:**
- Create: `frontend/src/pages/ProfilePage.jsx`

- [ ] **Step 10.1: Create ProfilePage.jsx**

Create `frontend/src/pages/ProfilePage.jsx`:
```jsx
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

function Field({ label, icon: Icon, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 bg-input border rounded-xl transition-all',
        'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15',
        error ? 'border-destructive/60' : 'border-border',
      )}>
        {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
        <input
          {...props}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function Avatar({ user, size = 'lg' }) {
  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'
  const dim = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-9 h-9 text-sm'
  if (user?.profile?.avatar) {
    return <img src={user.profile.avatar} alt="" className={`${dim} rounded-full object-cover`} />
  }
  return (
    <div className={`${dim} rounded-full bg-primary/10 border-2 border-primary/20
                     flex items-center justify-center font-bold text-primary`}>
      {initials}
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', city: '', address: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        city: user.profile?.city || '',
        address: user.profile?.address || '',
      })
    }
  }, [user])

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setSaved(false)
  }

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await updateProfile(form)
      setSaved(true)
      showToast('Perfil actualizado', 'success')
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleChangePassword = () => {
    showToast('Cambio de contraseña próximamente disponible', 'info')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Profile header */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar user={user} size="lg" />
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">
                {user?.full_name || 'Mi perfil'}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Edit form */}
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
              <h2 className="font-display font-semibold text-base text-foreground mb-5 flex items-center gap-2">
                <User size={16} className="text-primary" />
                Información personal
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Nombre completo *"
                    icon={User}
                    type="text"
                    placeholder="Ana García"
                    value={form.full_name}
                    onChange={e => update('full_name', e.target.value)}
                    error={errors.full_name}
                  />
                  <Field
                    label="Email *"
                    icon={Mail}
                    type="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    error={errors.email}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Teléfono"
                    icon={Phone}
                    type="tel"
                    placeholder="+52 55 0000 0000"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                  />
                  <Field
                    label="Ciudad"
                    icon={MapPin}
                    type="text"
                    placeholder="Ciudad de México"
                    value={form.city}
                    onChange={e => update('city', e.target.value)}
                  />
                </div>
                <Field
                  label="Dirección"
                  icon={Home}
                  type="text"
                  placeholder="Calle, número, colonia"
                  value={form.address}
                  onChange={e => update('address', e.target.value)}
                />

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
                      saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 active:scale-[0.98]',
                    )}
                  >
                    {saving
                      ? <><Loader2 size={14} className="animate-spin" /> Guardando…</>
                      : saved
                        ? <><CheckCircle size={14} /> Guardado</>
                        : <><Save size={14} /> Guardar cambios</>
                    }
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground
                               hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Cambiar contraseña
                  </button>
                </div>
              </form>
            </div>

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

            {/* Danger zone */}
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 10.2: Check that ToastContext exports useToast**

Read `frontend/src/context/ToastContext.jsx` and confirm `useToast` is exported. If the export is named differently, adjust the import in ProfilePage.jsx to match.

- [ ] **Step 10.3: Commit**

```bash
git add frontend/src/pages/ProfilePage.jsx
git commit -m "feat: ProfilePage with editable form, avatar initials, and purchase history placeholder"
```

---

## Task 11: Header — auth-aware UI

**Files:**
- Modify: `frontend/src/components/layout/Header.jsx`

- [ ] **Step 11.1: Update Header.jsx**

In `frontend/src/components/layout/Header.jsx`:

1. Add these imports at the top (after existing imports):
```jsx
import { useRef as _useRef } from 'react'  // already imported — skip
import { LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate as _useNavigate } from 'react-router-dom' // already imported — skip
```

Only add the imports that are not already present. The file already imports `useRef`, `useNavigate`, `Link`. Add `LogOut` and `ChevronDown` to the existing lucide import line, and add the `useAuth` import.

2. Inside the `Header` component function, add after `const navigate = useNavigate()`:
```jsx
const { user, logout } = useAuth()
const [userMenuOpen, setUserMenuOpen] = useState(false)
const userMenuRef = useRef(null)

useEffect(() => {
  const handler = (e) => {
    if (!userMenuRef.current?.contains(e.target)) setUserMenuOpen(false)
  }
  document.addEventListener('mousedown', handler)
  return () => document.removeEventListener('mousedown', handler)
}, [])

const handleLogout = async () => {
  setUserMenuOpen(false)
  await logout()
  navigate('/')
}

const avatarInitials = user?.full_name
  ? user.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  : user?.email?.[0]?.toUpperCase() ?? '?'
```

3. Replace the `{/* Right actions */}` section (the static `<User>` button at line ~443-472) with:
```jsx
{/* Right actions */}
<div className="flex items-center gap-1 shrink-0">
  <button
    onClick={toggle}
    className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground
               hover:text-foreground hover:bg-secondary transition-colors"
    aria-label="Cambiar tema"
  >
    {isDark ? <Sun size={18} /> : <Moon size={18} />}
  </button>

  {/* Auth UI */}
  {user ? (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setUserMenuOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors"
      >
        {user.profile?.avatar
          ? <img src={user.profile.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
          : (
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20
                            flex items-center justify-center text-[11px] font-bold text-primary">
              {avatarInitials}
            </div>
          )
        }
        <span className="text-sm text-foreground font-medium max-w-[80px] truncate hidden sm:block">
          {user.full_name?.split(' ')[0] || user.email.split('@')[0]}
        </span>
        <ChevronDown size={13} className="text-muted-foreground" />
      </button>

      {userMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border
                        rounded-xl shadow-xl z-50 overflow-hidden fade-up">
          <Link
            to="/perfil"
            onClick={() => setUserMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground
                       hover:bg-secondary transition-colors"
          >
            <User size={14} className="text-muted-foreground" />
            Mi perfil
          </Link>
          <div className="mx-2 h-px bg-border" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive
                       hover:bg-destructive/10 transition-colors"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center gap-1.5">
      <Link
        to="/registro"
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground
                   hover:text-foreground hover:bg-secondary transition-colors hidden sm:block"
      >
        Registrarse
      </Link>
      <Link
        to="/login"
        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground
                   hover:bg-primary/90 transition-colors"
      >
        Iniciar sesión
      </Link>
    </div>
  )}

  <Link
    to="/carrito"
    className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground
               hover:text-foreground hover:bg-secondary transition-colors"
    aria-label="Ver carrito"
  >
    <ShoppingCart size={18} />
    {count > 0 && (
      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground
                       text-[10px] font-bold rounded-full flex items-center justify-center font-data">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </Link>
</div>
```

- [ ] **Step 11.2: Commit**

```bash
git add frontend/src/components/layout/Header.jsx
git commit -m "feat: Header auth-aware UI — avatar+dropdown when authed, login/register buttons when not"
```

---

## Task 12: App.jsx routing + CheckoutPage pre-fill

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/pages/CheckoutPage.jsx`

- [ ] **Step 12.1: Update App.jsx**

Replace the content of `frontend/src/App.jsx` with:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import StoresCatalog from './pages/StoresCatalog'
import StorePage from './pages/StorePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProductDetailPage from './pages/ProductDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<StoresCatalog />} />
                  <Route path="/tienda/:slug" element={<StorePage />} />
                  <Route path="/carrito" element={<CartPage />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                  } />
                  <Route path="/tienda/:storeSlug/producto/:productId" element={<ProductDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/registro" element={<RegisterPage />} />
                  <Route path="/perfil" element={
                    <ProtectedRoute><ProfilePage /></ProtectedRoute>
                  } />
                </Routes>
              </BrowserRouter>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 12.2: Update CheckoutPage.jsx — pre-fill from user profile**

In `frontend/src/pages/CheckoutPage.jsx`, add the `useAuth` import and a `useEffect` that pre-fills the form.

Add import at the top (after existing imports):
```jsx
import { useAuth } from '../context/AuthContext'
```

Inside the `CheckoutPage` component, add after the `const navigate = useNavigate()` line:
```jsx
const { user } = useAuth()
```

Replace the `const [form, setForm] = useState({...})` block with:
```jsx
const [form, setForm] = useState({
  name: '', email: '', address: '', city: '', phone: '',
})

useEffect(() => {
  if (user) {
    setForm(f => ({
      ...f,
      name: user.full_name || f.name,
      email: user.email || f.email,
      phone: user.profile?.phone || f.phone,
      city: user.profile?.city || f.city,
      address: user.profile?.address || f.address,
    }))
  }
}, [user])
```

- [ ] **Step 12.3: Verify useToast import in ProfilePage.jsx**

Read `frontend/src/context/ToastContext.jsx` and check what `useToast` exports. Typical pattern:
```jsx
export const useToast = () => useContext(ToastContext)
```
If the hook is named differently (e.g., `useToastNotification`), update the import in `ProfilePage.jsx` to match.

- [ ] **Step 12.4: Commit**

```bash
git add frontend/src/App.jsx frontend/src/pages/CheckoutPage.jsx
git commit -m "feat: wire AuthProvider + ProtectedRoute into app, pre-fill checkout from profile"
```

---

## Task 13: End-to-end manual verification

- [ ] **Step 13.1: Start both servers**

Terminal 1 (backend):
```bash
cd backend && python manage.py runserver
```
Terminal 2 (frontend):
```bash
cd frontend && npm run dev
```

- [ ] **Step 13.2: Test registration flow**
1. Navigate to `http://localhost:5173/registro`
2. Fill all fields and submit → should redirect to `/` with user name visible in Header dropdown
3. Refresh page → should remain logged in (token persists in localStorage)

- [ ] **Step 13.3: Test login + protected routes**
1. Open `http://localhost:5173/checkout` without being logged in → should redirect to `/login?next=%2Fcheckout`
2. Log in → should redirect back to `/checkout` with form pre-filled

- [ ] **Step 13.4: Test profile**
1. Navigate to `/perfil` → shows current data
2. Change phone + city → click "Guardar cambios" → toast "Perfil actualizado"
3. Refresh → changes persist (fetched from backend)

- [ ] **Step 13.5: Test logout**
1. Click "Cerrar sesión" in header dropdown → redirects to `/`
2. Header shows "Iniciar sesión" button again
3. Try navigating to `/perfil` → redirects to `/login`

- [ ] **Step 13.6: Final commit**

```bash
git add .
git commit -m "feat: complete auth & user profile system — register, login, logout, profile edit, protected routes"
```
