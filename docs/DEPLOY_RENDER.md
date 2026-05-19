# Guía de Deployment en Render — SmartStore

**Proyecto:** SmartStore (E-commerce con búsqueda semántica y ontología SPARQL)  
**Repositorio:** github.com/juanchin0/smartstore  
**Stack:** Django 5.1 + React 18 + PostgreSQL  
**Plataforma:** [render.com](https://render.com) (Plan Free)

---

## Índice

1. [Preparar el código para Render](#1-preparar-el-código-para-render)
2. [Conectar GitHub a Render](#2-conectar-github-a-render)
3. [Crear la base de datos PostgreSQL](#3-crear-la-base-de-datos-postgresql)
4. [Crear el servicio Backend (Django)](#4-crear-el-servicio-backend-django)
5. [Crear el servicio Frontend (React)](#5-crear-el-servicio-frontend-react)
6. [Git Push — deploy automático](#6-git-push--deploy-automático)
7. [Verificar funcionamiento](#7-verificar-funcionamiento)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Preparar el código para Render

Estos cambios deben hacerse **antes** de crear los servicios en Render.

### 1.1 Agregar dependencias al backend

Editar `backend/requirements.txt` — agregar al final:

```txt
gunicorn==23.0.0
dj-database-url==2.3.0
whitenoise==6.8.0
```

El archivo final debe quedar:

```txt
Django==5.1.4
djangorestframework==3.15.2
django-cors-headers==4.6.0
psycopg2-binary==2.9.10
rdflib==7.1.1
SPARQLWrapper==2.0.0
Pillow==11.0.0
python-decouple==3.8
django-filter==24.3
djangorestframework-simplejwt==5.3.1
gunicorn==23.0.0
dj-database-url==2.3.0
whitenoise==6.8.0
```

### 1.2 Crear `backend/runtime.txt`

```txt
python-3.12.0
```

### 1.3 Actualizar `backend/config/settings.py`

Agregar los siguientes bloques al final del archivo (no reemplazar, **agregar**):

```python
import os
import dj_database_url

# --- Configuración para Render ---

# Permitir que DATABASE_URL de Render sobreescriba las variables individuales
DATABASE_URL = config('DATABASE_URL', default=None)
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }

# WhiteNoise para servir archivos estáticos sin nginx
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Render inyecta PORT automáticamente
PORT = os.environ.get('PORT', '8000')
```

> **Por qué WhiteNoise:** Render no tiene nginx en el plan Free. WhiteNoise permite que Django sirva los archivos estáticos del admin directamente.

### 1.4 Crear `backend/build.sh`

Este script ejecuta las tareas de build una sola vez:

```bash
#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
```

Dar permisos de ejecución (en Linux/Mac):
```bash
chmod +x backend/build.sh
```

### 1.5 Crear `.gitignore` en la raíz (si no existe)

```gitignore
# Python
backend/venv/
backend/__pycache__/
backend/*.pyc
backend/db.sqlite3
backend/.env
backend/staticfiles/
backend/media/

# Node
frontend/node_modules/
frontend/dist/
frontend/.env
frontend/.env.local

# Sistema
.DS_Store
Thumbs.db
```

### 1.6 Hacer commit de los cambios

```bash
git add backend/requirements.txt backend/runtime.txt backend/config/settings.py backend/build.sh .gitignore
git commit -m "feat: add Render deployment configuration"
git push origin main
```

---

## 2. Conectar GitHub a Render

1. Ir a [render.com](https://render.com) → **Sign Up** (con tu cuenta de GitHub preferiblemente)
2. En el dashboard, hacer clic en **New +** → **Web Service**
3. En la sección **Connect a repository**, seleccionar **GitHub**
4. Hacer clic en **Connect GitHub** → aparece una ventana de autorización de GitHub
5. Seleccionar **Only select repositories** → buscar y seleccionar **juanchin0/smartstore**
6. Hacer clic en **Install** → volver al dashboard de Render

> El repositorio ahora aparece listado y listo para usar en cualquier servicio.

---

## 3. Crear la base de datos PostgreSQL

**Dashboard Render** → **New +** → **PostgreSQL**

| Campo | Valor |
|-------|-------|
| Name | `smartstore-db` |
| Database | `smartstore` |
| User | `smartstore_user` |
| Region | `Oregon (US West)` o `Frankfurt (EU)` *(Free no tiene Latam)* |
| Plan | **Free** |

Hacer clic en **Create Database**.

> El plan Free de Render no incluye São Paulo. La región más cercana disponible es Oregon (US West).

### Copiar la DATABASE_URL

Una vez creada la base de datos:

1. Ir al servicio `smartstore-db` → pestaña **Info**
2. Buscar **Internal Database URL** (usar esta para servicios dentro de Render)
3. Copiar el valor — se ve así:
   ```
   postgresql://smartstore_user:PASSWORD@dpg-XXXXXXXX-a/smartstore
   ```
4. Guardar este valor, se usará en el paso siguiente.

> **Internal vs External URL:** Usar la **Internal** para el backend en Render (más rápida, sin latencia). La **External** es para conectar desde tu máquina local.

---

## 4. Crear el servicio Backend (Django)

**Dashboard Render** → **New +** → **Web Service**

Seleccionar el repositorio **juanchin0/smartstore**.

### Configuración del servicio

| Campo | Valor |
|-------|-------|
| Name | `smartstore-backend` |
| Region | La misma que la DB (ej: Oregon) |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | **Python 3** |
| Build Command | `./build.sh` |
| Start Command | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2` |
| Plan | **Free** |

### Variables de entorno

En la sección **Environment Variables**, agregar una por una:

| Variable | Valor |
|----------|-------|
| `SECRET_KEY` | *(ver instrucción abajo)* |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `smartstore-backend.onrender.com` |
| `DATABASE_URL` | *(la Internal URL copiada en el paso 3)* |
| `CORS_ALLOWED_ORIGINS` | `https://smartstore-frontend.onrender.com` |
| `USE_SQLITE` | `False` |

**Generar SECRET_KEY segura:**

En tu terminal local:
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Copiar el resultado y pegarlo como valor de `SECRET_KEY`.

### Hacer clic en **Create Web Service**

Render comenzará el build. El primer deploy tarda ~3-5 minutos.

---

## 5. Crear el servicio Frontend (React)

**Dashboard Render** → **New +** → **Static Site**

Seleccionar el repositorio **juanchin0/smartstore**.

### Configuración del servicio

| Campo | Valor |
|-------|-------|
| Name | `smartstore-frontend` |
| Branch | `main` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Plan | **Free** |

### Variables de entorno

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://smartstore-backend.onrender.com/api` |

### Configurar redirect para React Router

En la pestaña **Redirects/Rewrites**, agregar:

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | **Rewrite** |

> Esto es necesario para que React Router funcione al navegar directamente a rutas como `/productos` o `/tiendas`.

### Hacer clic en **Create Static Site**

---

## 6. Git Push — deploy automático

Una vez configurados los servicios, cada `git push` a `main` dispara un deploy automático en ambos servicios.

### Flujo de trabajo

```bash
# Hacer cambios en el código
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```

Render detecta el push y:
1. Hace build del **backend** (ejecuta `build.sh`)
2. Hace build del **frontend** (ejecuta `npm run build`)
3. Despliega ambos servicios en paralelo

### Verificar el deploy en Render

1. Ir al dashboard → seleccionar el servicio
2. Pestaña **Logs** — ver el progreso en tiempo real
3. El estado cambia de `Building` → `Live` cuando termina

---

## 7. Verificar funcionamiento

Una vez que ambos servicios muestren estado **Live**:

### URLs de producción

| Servicio | URL |
|---------|-----|
| Frontend | `https://smartstore-frontend.onrender.com` |
| Backend API | `https://smartstore-backend.onrender.com/api/` |
| Admin Django | `https://smartstore-backend.onrender.com/admin/` |

### Verificaciones manuales

**1. Backend — health check:**
```
GET https://smartstore-backend.onrender.com/api/stores/
```
Debe devolver JSON con la lista de tiendas (array vacío `[]` si la DB está vacía).

**2. Backend — admin:**
```
GET https://smartstore-backend.onrender.com/admin/
```
Debe mostrar la pantalla de login de Django Admin.

**3. Frontend — página principal:**
```
GET https://smartstore-frontend.onrender.com
```
Debe cargar la aplicación React.

**4. Conexión frontend-backend:**
- Abrir el frontend en el navegador
- Abrir DevTools → pestaña Network
- Navegar a "Tiendas" o "Productos"
- Verificar que las peticiones a `smartstore-backend.onrender.com/api/` retornan 200

### Crear superusuario Django

Para acceder al admin, crear un superusuario vía **Shell** en Render:

1. Dashboard → servicio `smartstore-backend`
2. Pestaña **Shell**
3. Ejecutar:
   ```bash
   python manage.py createsuperuser
   ```
4. Ingresar usuario, email y contraseña cuando se solicite

---

## 8. Troubleshooting

### Error: `ModuleNotFoundError` durante el build

**Síntoma:** El build falla con `ModuleNotFoundError: No module named 'gunicorn'`

**Causa:** El `requirements.txt` no tiene las dependencias nuevas.

**Solución:**
```bash
# Verificar que requirements.txt tenga gunicorn, dj-database-url, whitenoise
cat backend/requirements.txt
git add backend/requirements.txt
git commit -m "fix: add missing dependencies"
git push origin main
```

---

### Error: `DisallowedHost` al acceder al backend

**Síntoma:** La API devuelve `Invalid HTTP_HOST header`

**Causa:** La variable `ALLOWED_HOSTS` no incluye el dominio de Render.

**Solución:** En Render → servicio backend → Environment → actualizar:
```
ALLOWED_HOSTS = smartstore-backend.onrender.com
```
Si tienes dominio custom: `smartstore-backend.onrender.com,tudominio.com`

---

### Error: CORS bloqueando peticiones del frontend

**Síntoma:** DevTools muestra `CORS policy: No 'Access-Control-Allow-Origin' header`

**Causa:** `CORS_ALLOWED_ORIGINS` no incluye la URL exacta del frontend.

**Solución:** Verificar que la variable en el backend sea exactamente:
```
CORS_ALLOWED_ORIGINS = https://smartstore-frontend.onrender.com
```
Sin barra final `/`. Sin `http://`, solo `https://`.

---

### Error: `OperationalError` — no puede conectar a la DB

**Síntoma:** El backend arranca pero las peticiones fallan con error de base de datos.

**Causas y soluciones:**

1. `DATABASE_URL` incorrecta → verificar que se copió la **Internal** URL, no la External
2. La DB aún está creándose → esperar 2-3 minutos y reintentar
3. Las migraciones no corrieron → en la Shell del servicio:
   ```bash
   python manage.py migrate
   ```

---

### Error: página en blanco en el frontend

**Síntoma:** El frontend carga pero se ve en blanco, sin contenido.

**Causa:** `VITE_API_URL` apunta a la URL incorrecta del backend.

**Solución:**
1. Abrir DevTools → Console → ver si hay errores de `fetch`
2. Verificar que `VITE_API_URL` en el servicio frontend sea:
   ```
   https://smartstore-backend.onrender.com/api
   ```
3. Después de cambiar la variable, hacer **Manual Deploy** en Render para que el build tome el nuevo valor

---

### El servicio se "duerme" (spin down)

**Síntoma:** La primera petición tarda 30-60 segundos en responder.

**Causa:** El plan Free de Render suspende los servicios web después de 15 minutos de inactividad.

**Solución temporal (plan Free):**
- Usar [UptimeRobot](https://uptimerobot.com) (gratuito) para hacer ping cada 14 minutos:
  ```
  URL: https://smartstore-backend.onrender.com/api/stores/
  Intervalo: 14 minutos
  ```

**Solución definitiva:** Actualizar al plan **Starter** ($7/mes) que no tiene spin down.

---

### Los archivos estáticos del admin no cargan

**Síntoma:** Django Admin muestra HTML sin CSS.

**Causa:** `collectstatic` no se ejecutó o WhiteNoise no está configurado.

**Solución:**
1. Verificar que `build.sh` incluye `python manage.py collectstatic --no-input`
2. Verificar que `whitenoise.middleware.WhiteNoiseMiddleware` está en `MIDDLEWARE` en `settings.py`
3. Re-deploy manual desde el dashboard de Render

---

### Ver logs en tiempo real

```
Dashboard → Servicio → pestaña "Logs"
```

Filtros útiles:
- `ERROR` — solo errores
- `WARNING` — advertencias
- Buscar por texto específico, ej: `migrate`, `gunicorn`

Para logs del build (no del runtime):
```
Dashboard → Servicio → pestaña "Events" → clic en el deploy → "View Logs"
```

---

## Resumen de URLs y variables

### Variables de entorno — Backend

| Variable | Valor |
|----------|-------|
| `SECRET_KEY` | Cadena aleatoria de 50 chars |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `smartstore-backend.onrender.com` |
| `DATABASE_URL` | Internal URL de PostgreSQL en Render |
| `CORS_ALLOWED_ORIGINS` | `https://smartstore-frontend.onrender.com` |
| `USE_SQLITE` | `False` |

### Variables de entorno — Frontend

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://smartstore-backend.onrender.com/api` |

### URLs de producción

| Servicio | URL |
|---------|-----|
| Frontend | `https://smartstore-frontend.onrender.com` |
| Backend API | `https://smartstore-backend.onrender.com/api/` |
| Admin Django | `https://smartstore-backend.onrender.com/admin/` |

---

*Guía preparada para SmartStore — Ingeniería del Conocimiento 2026*
