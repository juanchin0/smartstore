<!--
  SMARTSTORE — MANUAL DE USUARIO
  Conforme a ISO/IEC 26514:2008 (Software and systems engineering — Requirements for designers
  and developers of user documentation) y principios de ISO 9001:2015 (calidad documental).
-->

---

# MANUAL DE USUARIO

---

## PORTADA

| Campo | Valor |
|---|---|
| **Título del documento** | Manual de Usuario — SmartStore |
| **Subtítulo** | Plataforma de E-commerce con Búsqueda Semántica |
| **Referencia del documento** | SS-MU-001 |
| **Versión** | 1.0.0 |
| **Estado** | Publicado |
| **Fecha de emisión** | 18 de mayo de 2026 |
| **Fecha de revisión** | 18 de mayo de 2027 |
| **Autor** | Equipo de Desarrollo SmartStore |
| **Revisado por** | Ingeniería del Conocimiento — UNAM |
| **Aprobado por** | Coordinación Académica |
| **Empresa / Institución** | Universidad Nacional Autónoma de México |
| **Clasificación** | Público |
| **Idioma** | Español (México) |

---

## HISTORIAL DE REVISIONES

| Versión | Fecha | Autor | Descripción del cambio |
|---------|-------|-------|------------------------|
| 0.1 | 01-may-2026 | Equipo SmartStore | Borrador inicial |
| 0.9 | 15-may-2026 | Equipo SmartStore | Revisión de procedimientos |
| 1.0.0 | 18-may-2026 | Equipo SmartStore | Versión publicada |

---

## AVISO LEGAL

Este documento es propiedad de la Universidad Nacional Autónoma de México (UNAM). Queda prohibida su reproducción total o parcial sin autorización expresa. SmartStore es un sistema desarrollado con fines académicos en el marco del curso de Ingeniería del Conocimiento.

---

## TABLA DE CONTENIDOS

- [Convenciones del manual](#convenciones-del-manual)
- [Símbolos y notaciones](#símbolos-y-notaciones)
- [Iconografía de la interfaz](#iconografía-de-la-interfaz)
- [**Capítulo 1** — Descripción general del sistema](#capítulo-1--descripción-general-del-sistema)
- [**Capítulo 2** — Requisitos del sistema](#capítulo-2--requisitos-del-sistema)
- [**Capítulo 3** — Instalación y configuración inicial](#capítulo-3--instalación-y-configuración-inicial)
- [**Capítulo 4** — Interfaz de usuario](#capítulo-4--interfaz-de-usuario)
- [**Capítulo 5** — Procedimientos de uso](#capítulo-5--procedimientos-de-uso)
  - [5.1 Registrarse](#51-registrarse)
  - [5.2 Iniciar sesión](#52-iniciar-sesión)
  - [5.3 Búsqueda de tiendas y productos](#53-búsqueda-de-tiendas-y-productos)
  - [5.4 Búsqueda semántica](#54-búsqueda-semántica)
  - [5.5 Filtrado de productos](#55-filtrado-de-productos)
  - [5.6 Ver detalle de producto](#56-ver-detalle-de-producto)
  - [5.7 Agregar producto al carrito](#57-agregar-producto-al-carrito)
  - [5.8 Ver y gestionar el carrito](#58-ver-y-gestionar-el-carrito)
  - [5.9 Realizar una compra](#59-realizar-una-compra)
  - [5.10 Ver historial de compras](#510-ver-historial-de-compras)
  - [5.11 Editar perfil de usuario](#511-editar-perfil-de-usuario)
  - [5.12 Cerrar sesión](#512-cerrar-sesión)
- [**Capítulo 6** — Características avanzadas](#capítulo-6--características-avanzadas)
- [**Capítulo 7** — Solución de problemas](#capítulo-7--solución-de-problemas)
- [**Capítulo 8** — Preguntas frecuentes (FAQ)](#capítulo-8--preguntas-frecuentes-faq)
- [**Capítulo 9** — Glosario de términos](#capítulo-9--glosario-de-términos)
- [**Capítulo 10** — Apéndices](#capítulo-10--apéndices)
- [**Capítulo 11** — Información de contacto y soporte](#capítulo-11--información-de-contacto-y-soporte)

---

## CONVENCIONES DEL MANUAL

Esta sección establece las convenciones tipográficas y visuales empleadas a lo largo del documento para garantizar una interpretación uniforme de las instrucciones.

### Convenciones tipográficas

| Convención | Significado | Ejemplo |
|-----------|-------------|---------|
| **Negrita** | Nombre de elemento de interfaz, botón o campo | Haga clic en **Iniciar sesión** |
| `Monoespaciado` | Texto que el usuario debe escribir literalmente | Ingrese `ana@email.com` |
| *Cursiva* | Término técnico o énfasis especial | El sistema usa *tokens JWT* |
| [Corchetes] | Referencia cruzada interna al manual | Véase [§ 5.4 Búsqueda semántica] |
| → | Secuencia de pasos o navegación | **Menú** → **Perfil** → **Mis compras** |

### Convenciones de elementos de interfaz

| Elemento | Descripción visual | Representación en este manual |
|----------|-------------------|-------------------------------|
| Botón primario | Fondo color primario (azul/índigo), texto blanco, esquinas redondeadas | **\[ Nombre del botón \]** |
| Botón secundario | Fondo gris suave, texto oscuro | *\[ Nombre del botón \]* |
| Campo de texto | Rectángulo con borde fino, ícono interior a la izquierda | `campo` |
| Etiqueta de estado | Píldora de color (naranja/azul/verde/rojo) con texto | `● Estado` |
| Tarjeta | Superficie blanca/gris con sombra y esquinas redondeadas | \[Tarjeta\] |
| Panel lateral | Columna fija a la izquierda con opciones de filtro | [Panel] |
| Menú desplegable | Selector `<select>` o lista emergente | ▾ Opción |

---

## SÍMBOLOS Y NOTACIONES

Los siguientes símbolos aparecen a lo largo del manual para llamar la atención del usuario sobre información relevante:

> **NOTA:** Información adicional útil que complementa el procedimiento.

> **IMPORTANTE:** Información que el usuario debe leer antes de continuar.

> **ADVERTENCIA:** Acción que puede tener consecuencias difíciles de revertir.

> **CONSEJO:** Sugerencia para usar el sistema de forma más eficiente.

**Numeración de pasos:** Los procedimientos se presentan como listas numeradas. Cada paso debe completarse en el orden indicado antes de continuar con el siguiente.

**Rutas URL:** Las rutas se indican como `/ruta/ejemplo` y son relativas al dominio base del sistema (ej. `http://localhost:5173` en entorno local).

---

## ICONOGRAFÍA DE LA INTERFAZ

SmartStore utiliza iconos de la librería **Lucide** en toda su interfaz. La siguiente tabla describe los iconos más frecuentes:

| Ícono | Nombre | Significado en SmartStore |
|-------|--------|--------------------------|
| ✦ | Sparkles | Logo SmartStore / Búsqueda semántica activa |
| 🔍 | Search | Campo de búsqueda semántica en el encabezado |
| 🛒 | ShoppingCart | Carrito de compras; muestra contador de artículos |
| 👤 | User | Menú de usuario autenticado |
| ♥ | Heart | Favoritos (referencial) |
| ⬅ | ArrowLeft | Volver a la página anterior |
| ✕ | X | Cerrar panel / limpiar filtro |
| ▲▼ | ArrowUpDown | Ordenar resultados |
| ✓ | CheckCircle | Operación completada con éxito |
| 📦 | Package | Tienda sin logo / Número de orden |
| 🗑 | Trash2 | Eliminar elemento del carrito |
| + | Plus | Incrementar cantidad |
| − | Minus | Decrementar cantidad |
| 💳 | CreditCard | Sección de pago |
| 🔒 | Lock | Datos de envío seguros |
| 🏷 | Tag | Código de descuento (decorativo) |
| ⭐ | Star | Calificación del producto |
| ✦ | Sparkles | Resultado de búsqueda semántica |
| ✎ | Save | Guardar cambios en el perfil |
| ↩ | LogOut | Cerrar sesión |
| ↕ | ChevronDown/Up | Expandir/colapsar sección |

---

## CAPÍTULO 1 — DESCRIPCIÓN GENERAL DEL SISTEMA

### 1.1 Propósito

SmartStore es una plataforma de comercio electrónico multi-tienda que incorpora tecnologías de inteligencia semántica basadas en ontologías OWL (Web Ontology Language) y consultas SPARQL. El sistema permite a los usuarios explorar, filtrar y adquirir productos de múltiples tiendas especializadas a través de una interfaz web moderna, accesible desde cualquier navegador contemporáneo.

### 1.2 Alcance

Este manual describe la operación de la interfaz de usuario (frontend) de SmartStore, accesible en `http://localhost:5173` en entorno de desarrollo. No cubre la administración del sistema ni la API REST del backend, los cuales se documentan en manuales técnicos separados.

### 1.3 Descripción funcional

SmartStore ofrece las siguientes capacidades principales:

| Capacidad | Descripción |
|-----------|-------------|
| **Catálogo multi-tienda** | 20 tiendas de distintas categorías con más de 300 productos |
| **Búsqueda semántica** | Motor basado en ontología OWL/SPARQL que entiende el significado conceptual de la consulta |
| **Filtros dinámicos** | Atributos de filtrado inferidos automáticamente según la categoría ontológica |
| **Autenticación** | Registro e inicio de sesión con tokens JWT seguros |
| **Carrito de compras** | Persistente entre sesiones, con control granular de cantidades |
| **Checkout** | Proceso de compra con cálculo de IVA y resumen detallado |
| **Historial de órdenes** | Registro permanente de todas las compras realizadas |
| **Perfil editable** | Datos personales y de envío actualizables en cualquier momento |
| **Modo oscuro** | Interfaz adaptada al modo oscuro del sistema operativo |
| **Diseño responsivo** | Compatible con móvil, tableta y escritorio |

### 1.4 Arquitectura del sistema (vista de usuario)

```
Usuario (navegador web)
        │
        ▼
┌───────────────────┐
│   Frontend React  │  ← Interfaz gráfica descrita en este manual
│   (puerto 5173)   │
└─────────┬─────────┘
          │ API REST (HTTP/JSON)
          ▼
┌───────────────────┐
│  Backend Django   │  ← Motor semántico, base de datos, autenticación
│   (puerto 8000)   │
└───────────────────┘
```

### 1.5 Mapa de navegación

```
/ (Inicio — Catálogo de tiendas)
├── /login               → Inicio de sesión
├── /registro            → Crear cuenta nueva
├── /tienda/:slug        → Catálogo de una tienda
│   └── /producto/:slug  → Detalle de producto
├── /carrito             → Carrito de compras
├── /checkout            → Proceso de pago
└── /perfil              → Datos personales e historial
```

---

## CAPÍTULO 2 — REQUISITOS DEL SISTEMA

### 2.1 Requisitos del cliente (usuario final)

Para utilizar SmartStore como usuario final únicamente se requiere:

#### 2.1.1 Navegadores compatibles

| Navegador | Versión mínima | Recomendado |
|-----------|---------------|-------------|
| Google Chrome | 110 | ✅ Sí |
| Mozilla Firefox | 110 | ✅ Sí |
| Microsoft Edge | 110 | ✅ Sí |
| Apple Safari | 16 | ✅ Sí |
| Opera | 96 | ✓ Compatible |
| Internet Explorer | — | ✗ No compatible |

#### 2.1.2 Otros requisitos del cliente

| Requisito | Detalle |
|-----------|---------|
| **Conexión a Internet** | Mínimo 1 Mbps (recomendado 5 Mbps o superior) |
| **JavaScript** | Debe estar habilitado en el navegador |
| **Cookies** | Deben estar habilitadas para mantener la sesión |
| **Resolución de pantalla** | Mínimo 320 px de ancho (optimizado para 1280 px+) |

### 2.2 Requisitos para instalación local (desarrolladores)

> **NOTA:** Esta sección aplica únicamente a personas que instalan y ejecutan SmartStore en su propio equipo. Los usuarios finales que acceden a un servidor ya desplegado pueden omitirla.

| Componente | Versión mínima |
|-----------|---------------|
| Python | 3.11 o superior |
| Node.js | 18 o superior |
| npm | 9 o superior |
| Sistema operativo | Windows 10/11, macOS 12+, Linux (Ubuntu 22.04+) |
| RAM | 4 GB mínimo (8 GB recomendado) |
| Espacio en disco | 500 MB para dependencias y base de datos |

---

## CAPÍTULO 3 — INSTALACIÓN Y CONFIGURACIÓN INICIAL

> **NOTA:** Este capítulo es relevante únicamente para administradores o desarrolladores. Los usuarios finales que acceden a una instancia ya desplegada deben omitir este capítulo y dirigirse directamente al [Capítulo 5 — Procedimientos de uso].

### 3.1 Obtención del código fuente

1. Descargue o clone el repositorio del proyecto en su equipo local.
2. Verifique que la estructura de directorios contenga las carpetas `backend/` y `frontend/` (o la carpeta raíz donde reside `package.json`).

### 3.2 Configuración del backend

1. Abra una terminal y navegue al directorio `backend/`.

2. Cree y active el entorno virtual de Python:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS / Linux:
   source venv/bin/activate
   ```

3. Instale las dependencias del proyecto:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure las variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Edite el archivo `.env` generado y establezca al menos:
   - `SECRET_KEY` — clave secreta de Django (cadena aleatoria larga)
   - `DEBUG=True` (entorno de desarrollo)

5. Ejecute las migraciones de la base de datos:
   ```bash
   python manage.py migrate
   ```

6. Cargue los datos de demostración (20 tiendas, 300+ productos):
   ```bash
   python manage.py populate_fixtures
   ```

   > **NOTA:** Para regenerar los datos desde cero, use la bandera `--flush`:
   > ```bash
   > python manage.py populate_fixtures --flush
   > ```

7. Inicie el servidor de desarrollo del backend:
   ```bash
   python manage.py runserver
   ```
   El backend queda disponible en `http://localhost:8000`.

### 3.3 Configuración del frontend

1. Abra una segunda terminal y navegue al directorio del frontend (donde reside `package.json`).

2. Instale las dependencias de Node.js:
   ```bash
   npm install
   ```

3. Inicie el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El frontend queda disponible en `http://localhost:5173`.

### 3.4 Verificación de la instalación

Una vez iniciados ambos servidores, abra su navegador y acceda a `http://localhost:5173`. Debe visualizarse la página de inicio de SmartStore con el catálogo de tiendas.

> **ADVERTENCIA:** Si la página de inicio muestra el mensaje "Error al cargar tiendas", verifique que el servidor backend esté activo en `http://localhost:8000` y que no existan errores en su terminal.

---

## CAPÍTULO 4 — INTERFAZ DE USUARIO

### 4.1 Estructura general de la interfaz

La interfaz de SmartStore se organiza en tres zonas persistentes:

```
┌─────────────────────────────────────────────────────────┐
│                     ENCABEZADO (Header)                  │
│  [Logo SmartStore]  [Barra de búsqueda semántica]  [🛒] [👤] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                   ÁREA DE CONTENIDO                     │
│              (varía según la página activa)             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                       PIE DE PÁGINA (Footer)            │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Encabezado (Header)

El encabezado permanece visible en todas las páginas y contiene los siguientes elementos:

| Elemento | Ubicación | Función |
|----------|-----------|---------|
| **Logo SmartStore** | Extremo izquierdo | Regresa a la página de inicio (`/`) al hacer clic |
| **Barra de búsqueda semántica** | Centro | Permite buscar productos con inteligencia semántica |
| **Ícono de carrito** `🛒` | Extremo derecho | Muestra el número de artículos; navega a `/carrito` |
| **Botón "Iniciar sesión"** | Extremo derecho | Visible cuando no hay sesión activa; navega a `/login` |
| **Avatar / Menú de usuario** | Extremo derecho | Visible cuando hay sesión activa; despliega opciones de perfil y cierre de sesión |

#### 4.2.1 Barra de búsqueda semántica

La barra de búsqueda en el encabezado es el elemento central del sistema. A medida que el usuario escribe, aparece un panel de sugerencias desplegable con coincidencias semánticas clasificadas por categoría ontológica.

```
┌──────────────────────────────────────┐
│ 🔍  Buscar productos...              │
├──────────────────────────────────────┤
│  Electrónica                         │
│  ● Smartphone Android               │
│  ● Teléfono inteligente             │
│  Calzado Deportivo                   │
│  ● Zapatilla running                │
└──────────────────────────────────────┘
```

### 4.3 Página de inicio — Catálogo de tiendas (`/`)

La página principal muestra:

1. **Sección hero** — encabezado con título, descripción y barra de búsqueda de tiendas por nombre o categoría.
2. **Contador de tiendas** — indica cuántas tiendas coinciden con el filtro activo.
3. **Cuadrícula de tarjetas de tienda** — cada tarjeta muestra:
   - Banner fotográfico de la tienda
   - Logo de la tienda (esquina inferior izquierda del banner)
   - Nombre de la tienda
   - Descripción breve
   - Categorías disponibles (etiquetas de colores)
   - Número de productos

### 4.4 Página de tienda (`/tienda/:slug`)

Muestra el catálogo de productos de una tienda específica. Se compone de:

| Zona | Contenido |
|------|-----------|
| **Banner de tienda** | Imagen a ancho completo con logo, nombre y cantidad de productos |
| **Migas de pan** | Ruta de navegación: `Tiendas › Nombre de tienda` |
| **Banner semántico** | Aparece cuando la búsqueda semántica está activa; muestra la clase buscada y el número de coincidencias |
| **Panel de filtros** | Columna lateral con filtros de precio, calificación, descuentos y atributos dinámicos |
| **Selector de orden** | Ordena por relevancia, precio ascendente/descendente, calificación o fecha |
| **Cuadrícula de productos** | Muestra los productos; los resultados semánticos aparecen al inicio con un borde destacado |

### 4.5 Página de detalle de producto (`/producto/:slug`)

Presenta la información completa de un producto:

- **Panel de imagen** — fotografía ampliable con zoom al pasar el cursor
- **Nombre y tienda**
- **Calificación** (estrellas)
- **Precio** (con precio original tachado si hay descuento)
- **Etiquetas semánticas** — clasificación ontológica del producto
- **Selector de cantidad**
- **Botón "Agregar al carrito"**
- **Descripción extendida**
- **Atributos del producto** (tabla de características)

### 4.6 Página de carrito (`/carrito`)

Muestra todos los productos añadidos al carrito:

- **Lista de artículos** — imagen, nombre, tienda, controles de cantidad, precio por unidad y subtotal
- **Botón eliminar** — ícono de papelera que aparece al pasar el cursor sobre un artículo
- **Panel de resumen** — subtotal, IVA (10%), envío (gratuito) y total
- **Campo de código de descuento** (decorativo en esta versión)
- **Botón "Proceder al pago"**

### 4.7 Página de checkout (`/checkout`)

Formulario de pago estructurado en dos columnas:

| Columna izquierda (2/3) | Columna derecha (1/3) |
|------------------------|-----------------------|
| Formulario de datos de envío | Resumen del pedido con lista de productos |
| Sección de pago simulado | Subtotal, IVA, envío y total |
| Botón "Completar compra" | — |

### 4.8 Página de perfil (`/perfil`)

Accesible únicamente para usuarios autenticados. Contiene:

1. **Cabecera de perfil** — avatar (iniciales o imagen), nombre completo y correo electrónico
2. **Formulario de información personal** — nombre, email, teléfono, ciudad, dirección
3. **Historial de compras** — lista expandible de órdenes con estado, fecha, monto y detalle de artículos
4. **Botón "Cerrar sesión"**

---

## CAPÍTULO 5 — PROCEDIMIENTOS DE USO

> **IMPORTANTE:** Los pasos de cada procedimiento deben seguirse en el orden indicado. Cada procedimiento incluye el resultado esperado al finalizar.

---

### 5.1 Registrarse

**Propósito:** Crear una cuenta de usuario nueva en SmartStore.

**Precondición:** El usuario no debe tener cuenta activa.

**Pasos:**

1. Haga clic en el botón **Iniciar sesión** en el encabezado superior derecho.
2. En la página de inicio de sesión, haga clic en el enlace **Regístrate** al pie del formulario.
3. Complete el formulario de registro con los siguientes datos:

   | Campo | Requerido | Descripción |
   |-------|-----------|-------------|
   | **Nombre completo** | Sí | Su nombre y apellido(s) |
   | **Email** | Sí | Dirección de correo electrónico válida |
   | **Contraseña** | Sí | Mínimo 8 caracteres |
   | **Confirmar contraseña** | Sí | Debe coincidir exactamente con la contraseña |
   | **Teléfono** | No | Número de contacto (ej. `+52 55 1234 5678`) |
   | **Ciudad** | No | Ciudad de residencia |

4. Haga clic en el botón **\[ Crear cuenta \]**.

**Resultado esperado:** El sistema crea la cuenta, inicia sesión automáticamente y redirige a la página de inicio.

> **NOTA:** Si el correo electrónico ya está registrado, aparecerá un mensaje de error en rojo bajo el formulario. Utilice la opción **Inicia sesión** si ya tiene cuenta.

> **ADVERTENCIA:** Utilice una contraseña segura. SmartStore no almacena contraseñas en texto plano, pero es responsabilidad del usuario elegir credenciales robustas.

---

### 5.2 Iniciar sesión

**Propósito:** Acceder a una cuenta existente de SmartStore.

**Precondición:** El usuario debe contar con una cuenta registrada previamente.

**Pasos:**

1. Haga clic en el botón **Iniciar sesión** en el encabezado.
2. Ingrese su **Email** en el primer campo.
3. Ingrese su **Contraseña** en el segundo campo.
4. Haga clic en el botón **\[ Iniciar sesión \]**.

**Resultado esperado:** El sistema valida las credenciales, establece la sesión y redirige a la página de inicio. El encabezado mostrará el avatar del usuario en lugar del botón de inicio de sesión.

> **NOTA:** Si olvida su contraseña, la funcionalidad de recuperación está planificada para versiones futuras del sistema.

> **CONSEJO:** Si accedió a `/login` desde una página protegida (como `/perfil`), el sistema lo redirigirá automáticamente a esa página tras iniciar sesión.

---

### 5.3 Búsqueda de tiendas y productos

**Propósito:** Localizar tiendas o productos de interés.

#### 5.3.1 Buscar tiendas por nombre o categoría

1. Desde la **página de inicio** (`/`), localice la barra de búsqueda en la sección hero.
2. Escriba el nombre o categoría de la tienda que desea encontrar (ej. `electrónica`, `Nike`, `muebles`).
3. La cuadrícula de tiendas se actualiza en tiempo real mostrando únicamente las coincidencias.
4. Para limpiar el filtro, elimine el texto del campo de búsqueda.

#### 5.3.2 Buscar productos dentro de una tienda

1. Ingrese a la tienda de su preferencia haciendo clic sobre su tarjeta.
2. Los productos se muestran en la cuadrícula central.
3. Utilice el **selector de orden** (esquina superior derecha del área de productos) para reorganizar los resultados:

   | Opción | Descripción |
   |--------|-------------|
   | Relevancia | Orden predeterminado del sistema |
   | Precio ↑ | Del más barato al más caro |
   | Precio ↓ | Del más caro al más barato |
   | Valoración ↓ | Mejor calificados primero |
   | Más nuevos | Últimos añadidos primero |

---

### 5.4 Búsqueda semántica

**Propósito:** Encontrar productos mediante conceptos semánticos, no solo palabras exactas. Por ejemplo, buscar "calzado para correr" encontrará zapatillas de running aunque el producto no use exactamente esas palabras.

**Precondición:** Estar en cualquier página del sistema.

**Pasos:**

1. Haga clic en la **barra de búsqueda semántica** ubicada en el encabezado.
2. Escriba el concepto que desea buscar. A medida que escribe, aparecerá un panel de sugerencias clasificadas por categoría ontológica.

   ```
   Ejemplo de sugerencias para "auricular":
   ─────────────────────────────────────
   Electrónica de Audio
     ● Auricular inalámbrico
     ● Headphone Bluetooth
     ● Audífonos premium
   ```

3. Haga clic sobre la sugerencia que mejor describa lo que busca.
4. El sistema redirigirá a la tienda correspondiente con los resultados semánticos destacados:
   - Los productos que coinciden con la clase ontológica aparecen **al inicio** de la cuadrícula.
   - Cada tarjeta de producto semántico muestra un **borde de color** y la etiqueta `✦ Semántico`.
   - Un **banner informativo** en la parte superior indica la clase buscada y el número de coincidencias exactas.
5. Para limpiar la búsqueda semántica, haga clic en el botón **\[ Limpiar \]** del banner.

> **CONSEJO:** La búsqueda semántica funciona mejor con conceptos concretos (ej. "smartphone de gama alta", "tenis para fútbol") que con términos genéricos (ej. "cosas").

**Resultado esperado:** La página de tienda muestra los productos más relevantes semánticamente al inicio, con identificación visual clara.

---

### 5.5 Filtrado de productos

**Propósito:** Acotar los resultados de productos dentro de una tienda usando criterios específicos.

**Precondición:** El usuario debe encontrarse en una página de tienda (`/tienda/:slug`).

**Pasos:**

1. Localice el **panel de filtros** en la columna izquierda de la página de tienda.
2. Aplique los filtros disponibles:

   | Filtro | Cómo usarlo |
   |--------|-------------|
   | **Rango de precio** | Ingrese los valores mínimo y máximo en los campos correspondientes |
   | **Calificación mínima** | Seleccione la calificación mínima deseada (1 a 5 estrellas) |
   | **Solo con descuento** | Active la casilla para mostrar únicamente productos con precio reducido |
   | **Filtros dinámicos** | Aparecen según la categoría ontológica activa (ej. RAM, almacenamiento, material, etc.) |

3. Los productos se actualizan automáticamente con cada cambio de filtro.
4. Para eliminar todos los filtros, haga clic en **Limpiar todos los filtros** (aparece cuando hay filtros activos y no hay resultados).

> **NOTA:** Los filtros dinámicos solo aparecen cuando se ha realizado una búsqueda semántica activa. Están asociados a la clase ontológica del producto buscado. Por ejemplo, al buscar "smartphone" el panel mostrará filtros de sistema operativo, capacidad de almacenamiento y memoria RAM.

---

### 5.6 Ver detalle de producto

**Propósito:** Obtener información completa de un producto antes de decidir la compra.

**Pasos:**

1. Desde el catálogo de cualquier tienda, haga clic sobre la **tarjeta de producto** de su interés.
2. El sistema navega a la página de detalle del producto.
3. Revise la información disponible:
   - **Imagen** — haga clic o pase el cursor para activar el efecto de zoom.
   - **Precio y descuento** — si el producto tiene oferta, se muestra el precio original tachado y el porcentaje de ahorro.
   - **Calificación** — estrellas y puntuación numérica.
   - **Etiquetas semánticas** — categorías ontológicas a las que pertenece el producto.
   - **Descripción** — información extendida del fabricante.
   - **Atributos** — tabla con características técnicas específicas.
4. Para regresar al catálogo de la tienda, haga clic en el botón **← Volver** o en el enlace de las migas de pan.

---

### 5.7 Agregar producto al carrito

**Propósito:** Añadir uno o más productos al carrito de compras para su adquisición posterior.

**Pasos:**

**Desde la página de detalle de producto:**

1. Ingrese a la página de detalle del producto deseado (véase [§ 5.6]).
2. Ajuste la **cantidad** usando los botones `+` y `−`.

   > **NOTA:** La cantidad mínima es 1. No es posible añadir 0 unidades.

3. Haga clic en el botón **\[ Agregar al carrito \]**.
4. Aparecerá una notificación de confirmación (toast) en la esquina de la pantalla.
5. El contador del ícono de carrito en el encabezado se actualizará reflejando el nuevo total.

**Desde la tarjeta de producto en el catálogo:**

1. En la cuadrícula de productos, localice el producto deseado.
2. Haga clic en el botón **\[ Agregar \]** que aparece en la parte inferior de la tarjeta.

> **CONSEJO:** Puede agregar el mismo producto varias veces; las cantidades se acumularán en el carrito.

---

### 5.8 Ver y gestionar el carrito

**Propósito:** Revisar, modificar y preparar el pedido antes de proceder al pago.

**Pasos:**

1. Haga clic en el **ícono de carrito** `🛒` en el encabezado.
2. El sistema navega a la página `/carrito`.
3. Revise la lista de artículos. Para cada producto puede:

   | Acción | Procedimiento |
   |--------|---------------|
   | **Aumentar cantidad** | Haga clic en `+` junto al número de unidades |
   | **Reducir cantidad** | Haga clic en `−`; si llega a 0, el artículo se elimina |
   | **Eliminar artículo** | Pase el cursor sobre el artículo y haga clic en el ícono 🗑 |
   | **Vaciar carrito** | Haga clic en **Vaciar carrito** (esquina superior derecha) |

4. El **panel de resumen** (columna derecha) se actualiza en tiempo real con:
   - Subtotal de productos
   - IVA calculado al 10%
   - Envío (gratuito)
   - **Total a pagar**

5. Cuando el pedido esté listo, haga clic en **\[ Proceder al pago → \]** para continuar al checkout.

> **ADVERTENCIA:** Al hacer clic en **Vaciar carrito** se eliminarán todos los artículos sin confirmación adicional. Esta acción no puede deshacerse.

---

### 5.9 Realizar una compra

**Propósito:** Completar el proceso de pago y generar una orden de compra.

**Precondición:** El carrito debe contener al menos un producto. Se recomienda haber iniciado sesión para que los datos de envío se autocompleten.

**Pasos:**

1. Desde el carrito, haga clic en **\[ Proceder al pago → \]**. El sistema redirige a `/checkout`.

2. **Complete el formulario de datos de envío:**

   | Campo | Requerido | Descripción |
   |-------|-----------|-------------|
   | **Nombre completo** | Sí | Nombre del destinatario |
   | **Email** | Sí | Correo de confirmación |
   | **Dirección** | No | Calle y número |
   | **Ciudad** | No | Ciudad de destino |
   | **Teléfono** | No | Número de contacto |

   > **NOTA:** Si inició sesión, los campos se autorellenan con los datos del perfil. Puede editarlos para esta compra sin que el perfil se vea afectado.

3. Revise el **panel de resumen** en la columna derecha para confirmar los productos y el total.

4. Verifique la sección de **pago simulado** (esta es una plataforma de demostración; no se realizan cobros reales).

5. Haga clic en el botón **\[ Completar compra · $X,XXX.XX \]**.

6. El sistema procesa la orden. Si la operación es exitosa:
   - Aparece la pantalla de confirmación `¡Compra realizada!`
   - Se muestra el número de orden (ej. `Orden #SS-2026-00042`)
   - Se presenta un resumen de los productos adquiridos y el total pagado

7. Seleccione una de las opciones disponibles:
   - **\[ Continuar comprando \]** — regresa a la página de inicio
   - **Ir al inicio** — regresa al catálogo de tiendas

**Resultado esperado:** La orden queda registrada en el sistema con estado `Completada`. Puede consultar el historial en [§ 5.10].

> **ADVERTENCIA:** Una vez confirmada la compra, el carrito se vacía automáticamente. El proceso no puede deshacerse desde la interfaz de usuario.

---

### 5.10 Ver historial de compras

**Propósito:** Consultar el registro de órdenes de compra realizadas anteriormente.

**Precondición:** El usuario debe haber iniciado sesión y contar con al menos una compra realizada.

**Pasos:**

1. Haga clic en su **avatar o ícono de usuario** en el encabezado.
2. En el menú desplegable, seleccione **Mi perfil** (o navegue directamente a `/perfil`).
3. Desplácese hacia abajo hasta la sección **Mis compras**.
4. La lista muestra cada orden con:
   - Número de orden
   - Fecha de realización
   - Estado de la orden (indicador de color)
   - Monto total
5. Haga clic sobre cualquier orden para **expandir el detalle** y ver los productos incluidos, cantidades y precios unitarios.
6. Haga clic de nuevo en la misma orden para **contraer** el detalle.

**Estados de orden posibles:**

| Estado | Color | Significado |
|--------|-------|-------------|
| `● Pendiente` | Naranja | Orden recibida, en proceso de confirmación |
| `● Confirmado` | Azul | Orden confirmada por el sistema |
| `● Enviado` | Morado | Pedido en camino |
| `● Entregado` | Verde | Pedido recibido por el destinatario |
| `● Completada` | Verde | Transacción finalizada |
| `● Cancelado` | Rojo | Orden cancelada |

---

### 5.11 Editar perfil de usuario

**Propósito:** Actualizar los datos personales y de envío asociados a la cuenta.

**Precondición:** El usuario debe haber iniciado sesión.

**Pasos:**

1. Haga clic en su **avatar** en el encabezado.
2. Seleccione **Mi perfil** o navegue a `/perfil`.
3. En la sección **Información personal**, modifique los campos deseados:

   | Campo | Tipo | Notas |
   |-------|------|-------|
   | **Nombre completo** | Texto | Requerido |
   | **Email** | Email | Requerido; debe ser una dirección válida |
   | **Teléfono** | Teléfono | Opcional |
   | **Ciudad** | Texto | Opcional; se usa para autocompletar el checkout |
   | **Dirección** | Texto | Opcional; se usa para autocompletar el checkout |

4. Haga clic en **\[ Guardar cambios \]**.
5. Aparecerá una notificación de confirmación y el botón mostrará `✓ Guardado`.

> **CONSEJO:** Mantener actualizados los campos de ciudad y dirección agiliza el proceso de checkout, ya que se usan para autocompletar el formulario de envío.

> **NOTA:** El cambio de contraseña está disponible mediante el botón **Cambiar contraseña**. Esta funcionalidad estará completamente disponible en versiones futuras.

---

### 5.12 Cerrar sesión

**Propósito:** Finalizar la sesión de usuario activa en el dispositivo.

**Pasos:**

1. Navegue a `/perfil` o haga clic en su avatar en el encabezado.
2. Desplácese hasta el final de la página de perfil.
3. Haga clic en el botón **↩ Cerrar sesión** (texto rojo en la esquina inferior derecha).
4. El sistema cierra la sesión, elimina las credenciales almacenadas localmente y redirige a la página de inicio.
5. Aparecerá una notificación de confirmación: _"Sesión cerrada correctamente"_.

> **IMPORTANTE:** Siempre cierre sesión cuando use SmartStore en un dispositivo compartido o público.

---

## CAPÍTULO 6 — CARACTERÍSTICAS AVANZADAS

### 6.1 Motor de búsqueda semántica

#### 6.1.1 Fundamentos tecnológicos

SmartStore incorpora un motor semántico basado en:

- **OWL (Web Ontology Language)** — Lenguaje estándar W3C para definir ontologías. La ontología de SmartStore describe una jerarquía de clases de productos, sus propiedades y las relaciones entre ellas.
- **SPARQL** — Lenguaje de consulta estándar para grafos RDF. El motor utiliza consultas SPARQL para inferir qué productos pertenecen a una clase buscada.
- **rdflib** — Biblioteca Python que procesa la ontología en memoria del servidor.

#### 6.1.2 Cómo funciona la búsqueda semántica

```
Usuario escribe "auricular bluetooth"
        │
        ▼
Servidor consulta la ontología OWL
        │
        ▼
SPARQL infiere: clase = "AuricularBluetooth"
        │      subclase de "ElectrónicaDeAudio"
        ▼
Sistema retorna IDs de productos etiquetados
con esa clase o sus subclases
        │
        ▼
Frontend flota esos productos al inicio
de la cuadrícula con borde destacado
```

#### 6.1.3 Ventajas sobre búsqueda tradicional

| Búsqueda tradicional | Búsqueda semántica SmartStore |
|---------------------|------------------------------|
| Coincidencia exacta de palabras | Comprensión conceptual |
| "zapatilla running" no encontraría "calzado para correr" | Ambas expresiones llevan al mismo resultado |
| Sin jerarquía de categorías | Respeta herencia: buscar "electrónica" incluye smartphones, laptops, tablets, etc. |
| Resultados rígidos | Resultados con grado de relevancia |

### 6.2 Filtros dinámicos por ontología

Los filtros del panel lateral son **generados dinámicamente** según la clase ontológica activa en la búsqueda semántica. Esto significa que:

- Al buscar **"smartphone"**, el panel mostrará filtros: Sistema operativo, RAM, Almacenamiento, Cámara.
- Al buscar **"zapatilla"**, el panel mostrará filtros: Material, Tipo de superficie, Talla.
- Al navegar sin búsqueda activa, se muestran únicamente los filtros universales: precio, calificación y descuento.

> **NOTA:** Los filtros dinámicos requieren que la búsqueda semántica esté activa. Inicie una búsqueda desde el encabezado para activarlos.

### 6.3 Flotado y resaltado de resultados semánticos

Cuando una búsqueda semántica está activa en la página de tienda:

1. Los productos que coinciden exactamente con la clase buscada se **mueven al inicio** de la cuadrícula.
2. Cada producto semántico muestra un **borde de color** (morado/azul) y la etiqueta `✦ Semántico`.
3. Una **línea divisoria** separa visualmente los resultados semánticos del resto del catálogo.
4. El banner superior indica cuántas coincidencias exactas se encontraron.

### 6.4 Persistencia del carrito

El carrito de compras persiste en el almacenamiento local del navegador (`localStorage`). Esto significa que:

- El carrito **se mantiene entre sesiones** del mismo navegador aunque el usuario cierre la ventana.
- El carrito **es independiente de la sesión** de usuario; los productos se guardan aunque no se haya iniciado sesión.
- Limpiar los datos del navegador o usar un navegador diferente resultará en un carrito vacío.

### 6.5 Modo oscuro

SmartStore detecta automáticamente la preferencia de modo oscuro configurada en el sistema operativo y aplica la paleta correspondiente. No existe un interruptor manual en la interfaz; para cambiar el modo, modifique la configuración de apariencia de su sistema operativo.

---

## CAPÍTULO 7 — SOLUCIÓN DE PROBLEMAS

### 7.1 Tabla de problemas comunes

| # | Síntoma | Causa probable | Solución |
|---|---------|---------------|----------|
| T-001 | La página no carga o muestra una pantalla en blanco | El servidor frontend no está activo | Verifique que el servidor esté corriendo en `http://localhost:5173` |
| T-002 | "Error al cargar tiendas" en la página de inicio | El servidor backend no está activo | Verifique que Django esté corriendo en `http://localhost:8000` |
| T-003 | Las imágenes de productos o tiendas no cargan | Conexión a Internet sin acceso a Unsplash | Verifique su conexión; el sistema mostrará íconos de reemplazo automáticamente |
| T-004 | "Credenciales incorrectas" al iniciar sesión | Email o contraseña incorrectos | Verifique que el email no tenga espacios; use mayúsculas/minúsculas correctas en la contraseña |
| T-005 | El botón "Completar compra" no responde | Campos obligatorios incompletos | Revise que nombre completo y email estén correctamente completados |
| T-006 | No aparecen sugerencias en la búsqueda semántica | El motor ontológico no ha cargado | Espere unos segundos y vuelva a intentar; si persiste, recargue la página |
| T-007 | El carrito muestra 0 artículos después de agregar uno | Los datos de `localStorage` fueron bloqueados | Verifique que las cookies y el almacenamiento local estén habilitados en el navegador |
| T-008 | La página de perfil redirige a login | La sesión expiró | Inicie sesión nuevamente; los tokens JWT tienen una duración limitada |
| T-009 | El historial de compras está vacío pese a haber comprado | La sesión ha cambiado o los datos no se sincronizaron | Cierre sesión, vuelva a iniciarla y recargue la página de perfil |
| T-010 | Los filtros dinámicos no aparecen | No hay búsqueda semántica activa | Realice una búsqueda semántica desde el encabezado antes de usar los filtros |

### 7.2 Pasos de diagnóstico general

Cuando encuentre un comportamiento inesperado, siga este procedimiento de diagnóstico en orden:

1. **Recargue la página** — presione `F5` o `Ctrl+R` (`Cmd+R` en Mac).
2. **Limpie la caché del navegador** — `Ctrl+Shift+Delete` y elimine la caché y los datos del sitio.
3. **Verifique su conexión a Internet** — intente abrir otra página web.
4. **Pruebe en un navegador diferente** — para descartar extensiones o configuraciones específicas del navegador.
5. **Cierre sesión y vuelva a iniciarla** — resuelve la mayoría de los problemas de autenticación.
6. **Contacte al soporte** — si el problema persiste, consulte el [Capítulo 11].

---

## CAPÍTULO 8 — PREGUNTAS FRECUENTES (FAQ)

**P: ¿SmartStore cobra por usar la plataforma?**
R: No. SmartStore es una plataforma académica de demostración. No se realizan cobros reales de ningún tipo.

---

**P: ¿Mis datos personales están seguros?**
R: SmartStore utiliza tokens JWT con caducidad para la autenticación. Las contraseñas se almacenan con hash. Sin embargo, al ser un proyecto académico, no está certificado para entornos de producción con datos sensibles reales.

---

**P: ¿Puedo usar SmartStore sin registrarme?**
R: Sí. La navegación por tiendas y productos, la búsqueda semántica y el uso del carrito son accesibles sin cuenta. Sin embargo, completar una compra y ver el historial de órdenes requieren inicio de sesión.

---

**P: ¿El carrito se guarda si cierro el navegador?**
R: Sí. El carrito se almacena en el navegador y persiste entre sesiones en el mismo dispositivo y navegador. Limpiar los datos del navegador vaciará el carrito.

---

**P: ¿Cómo funciona el cálculo del total en el checkout?**
R: El total se calcula como: `Total = Subtotal × 1.10`. El IVA es del 10% y el envío es siempre gratuito.

---

**P: ¿Puedo cancelar una orden después de realizarla?**
R: En la versión actual de la interfaz de usuario no existe una función de cancelación. Contacte al soporte si necesita gestionar una orden específica.

---

**P: ¿Por qué algunos productos tienen bordes de color en el catálogo?**
R: Los bordes de color indican que ese producto fue identificado como resultado semántico exacto para la búsqueda activa. Son los productos más relevantes según la ontología.

---

**P: ¿Qué navegador se recomienda?**
R: Google Chrome o Microsoft Edge en su versión más reciente ofrecen la mejor experiencia. Firefox es también plenamente compatible.

---

**P: ¿Puedo usar SmartStore desde mi teléfono?**
R: Sí. La interfaz es completamente responsiva y está optimizada para dispositivos móviles.

---

**P: ¿Las imágenes de productos son reales?**
R: Las imágenes provienen de Unsplash (unsplash.com) y se usan con fines de demostración. Los productos son ficticios.

---

## CAPÍTULO 9 — GLOSARIO DE TÉRMINOS

| Término | Definición |
|---------|------------|
| **API REST** | Interfaz de programación que permite la comunicación entre el frontend y el backend mediante peticiones HTTP en formato JSON |
| **Autenticación JWT** | Sistema de autenticación basado en tokens firmados (JSON Web Tokens) que validan la identidad del usuario sin mantener sesión en el servidor |
| **Backend** | Componente servidor del sistema responsable de la lógica de negocio, base de datos y motor semántico (Django) |
| **Banner** | Imagen decorativa de encabezado que identifica visualmente a cada tienda |
| **Carrito de compras** | Lista temporal de productos seleccionados por el usuario antes de confirmar la compra |
| **Checkout** | Proceso formal de revisión y confirmación de una compra; incluye datos de envío y pago |
| **Clase ontológica** | Categoría definida en la ontología OWL que agrupa productos con características semánticas comunes |
| **Dark mode** | Modo de visualización con colores oscuros de fondo, que reduce la fatiga visual en entornos de poca luz |
| **Django** | Framework web de Python utilizado para el backend de SmartStore |
| **Filtros dinámicos** | Criterios de filtrado generados automáticamente según la clase ontológica activa |
| **Frontend** | Componente cliente del sistema; la interfaz gráfica que el usuario ve y manipula (React) |
| **IVA** | Impuesto al Valor Agregado; en SmartStore se aplica el 10% sobre el subtotal |
| **localStorage** | Almacenamiento persistente del navegador web utilizado para guardar el carrito de compras entre sesiones |
| **Logo** | Imagen identificativa de cada tienda, mostrada sobre su banner y en el encabezado de la página de tienda |
| **Lucide** | Biblioteca de íconos vectoriales utilizada en la interfaz de SmartStore |
| **Ontología** | Representación formal del conocimiento sobre un dominio mediante clases, propiedades y relaciones; en SmartStore describe la jerarquía de categorías de productos |
| **Orden de compra** | Registro generado al completar el proceso de pago; incluye número de orden, artículos, precios y estado |
| **OWL** | Web Ontology Language; lenguaje estándar del W3C para expresar ontologías en la Web Semántica |
| **Panel de filtros** | Componente lateral en la página de tienda que permite acotar los productos visibles mediante criterios específicos |
| **Perfil de usuario** | Conjunto de datos personales y de envío asociados a una cuenta: nombre, email, teléfono, ciudad y dirección |
| **React** | Biblioteca JavaScript utilizada para construir la interfaz de usuario de SmartStore |
| **rdflib** | Biblioteca Python para procesamiento de grafos RDF y ontologías OWL |
| **Slug** | Identificador legible usado en URLs para identificar tiendas y productos (ej. `/tienda/nike-store`) |
| **SPARQL** | Lenguaje de consulta estándar para grafos RDF; utilizado para interrogar la ontología de SmartStore |
| **Subtotal** | Suma de los precios de todos los productos en el carrito, antes de aplicar impuestos |
| **TanStack Query** | Biblioteca de gestión de estado y caché de datos remotos usada en el frontend |
| **Toast** | Notificación emergente breve que aparece en la esquina de la pantalla para informar al usuario de una acción completada |
| **Token JWT** | Credencial cifrada que el servidor entrega al usuario tras iniciar sesión; se envía en cada petición para autenticar al usuario |
| **URLField** | Campo de base de datos que almacena URLs externas sin modificarlas (a diferencia de ImageField) |
| **Vite** | Herramienta de construcción y servidor de desarrollo para el frontend React |

---

## CAPÍTULO 10 — APÉNDICES

### Apéndice A — Mapa de URLs del sistema

| URL | Página | Acceso |
|-----|--------|--------|
| `/` | Catálogo de tiendas (inicio) | Público |
| `/login` | Inicio de sesión | Público (redirige si ya hay sesión) |
| `/registro` | Crear cuenta | Público (redirige si ya hay sesión) |
| `/tienda/:slug` | Página de tienda | Público |
| `/producto/:slug` | Detalle de producto | Público |
| `/carrito` | Carrito de compras | Público |
| `/checkout` | Proceso de pago | Requiere artículos en carrito |
| `/perfil` | Perfil e historial | Requiere sesión activa |

### Apéndice B — Endpoints de la API REST

Esta tabla es informativa para usuarios técnicos que deseen integrar o extender el sistema.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/stores/` | Lista de tiendas |
| `GET` | `/api/stores/:slug/` | Detalle de tienda |
| `GET` | `/api/stores/:slug/products/` | Productos de la tienda |
| `GET` | `/api/products/` | Lista de productos |
| `GET` | `/api/products/:id/` | Detalle de producto |
| `POST` | `/api/auth/register/` | Registrar usuario |
| `POST` | `/api/auth/login/` | Iniciar sesión |
| `POST` | `/api/auth/logout/` | Cerrar sesión |
| `GET/PATCH` | `/api/auth/me/` | Datos del usuario |
| `GET/PATCH` | `/api/auth/profile/` | Perfil extendido |
| `GET` | `/api/ontology/suggestions/` | Sugerencias semánticas |
| `GET` | `/api/ontology/filters/` | Filtros dinámicos |
| `POST` | `/api/ontology/semantic-search/` | Búsqueda semántica |
| `GET/POST` | `/api/orders/` | Historial / crear orden |
| `PATCH` | `/api/orders/:id/` | Actualizar estado |

### Apéndice C — Referencias de componentes de interfaz

Esta tabla describe los componentes de interfaz principales y su ubicación en el código fuente para referencia de desarrolladores.

| Componente | Archivo | Función |
|-----------|---------|---------|
| Header | `src/components/layout/Header.jsx` | Barra de navegación global |
| Footer | `src/components/layout/Footer.jsx` | Pie de página |
| StoreCard | `src/components/ui/StoreCard.jsx` | Tarjeta de tienda en catálogo |
| ProductCard | `src/components/ui/ProductCard.jsx` | Tarjeta de producto en cuadrícula |
| FilterPanel | `src/components/ui/FilterPanel.jsx` | Panel de filtros lateral |
| CartContext | `src/context/CartContext.jsx` | Estado global del carrito |
| AuthContext | `src/context/AuthContext.jsx` | Estado global de autenticación |

### Apéndice D — Guía rápida de uso (Quick Reference)

```
┌─────────────────────────────────────────────────┐
│            SMARTSTORE — GUÍA RÁPIDA             │
├─────────────────────────────────────────────────┤
│  EXPLORAR        → Página de inicio `/`         │
│  BUSCAR          → Barra semántica encabezado   │
│  FILTRAR         → Panel izquierdo en tienda    │
│  CARRITO         → Ícono 🛒 en encabezado       │
│  COMPRAR         → Carrito → Proceder al pago   │
│  MI CUENTA       → Avatar en encabezado         │
│  MIS COMPRAS     → Perfil → sección "Mis compras"│
│  CERRAR SESIÓN   → Perfil → botón ↩ inferior   │
└─────────────────────────────────────────────────┘
```

---

## CAPÍTULO 11 — INFORMACIÓN DE CONTACTO Y SOPORTE

### 11.1 Equipo de desarrollo

| Rol | Contacto |
|-----|---------|
| Desarrollo backend y frontend | Equipo SmartStore — UNAM |
| Coordinación académica | Ingeniería del Conocimiento — Facultad de Ingeniería |

### 11.2 Canales de soporte

| Canal | Uso recomendado |
|-------|----------------|
| **Repositorio del proyecto** | Reporte de errores técnicos, solicitudes de funcionalidades |
| **Correo académico** | Consultas sobre funcionalidad, retroalimentación general |
| **Documentación técnica** | `README.md` en la raíz del proyecto |

### 11.3 Cómo reportar un problema

Para reportar un problema de manera efectiva, incluya la siguiente información:

1. **Descripción del problema** — qué ocurrió y qué esperaba que ocurriera.
2. **Pasos para reproducirlo** — secuencia exacta de acciones que llevaron al problema.
3. **Navegador y versión** — ej. "Chrome 124 en Windows 11".
4. **Capturas de pantalla** — si aplica, ayudan a identificar el problema visualmente.
5. **Mensajes de error** — copie cualquier texto de error que aparezca en la pantalla.

### 11.4 Versiones y actualizaciones

Las actualizaciones de SmartStore se publican en el repositorio del proyecto. Consulte el `HISTORIAL DE REVISIONES` al inicio de este documento para conocer los cambios introducidos en cada versión del manual.

### 11.5 Licencia de la documentación

Este manual se distribuye bajo los términos del proyecto académico SmartStore. Su uso está autorizado exclusivamente para fines educativos en el contexto del curso de Ingeniería del Conocimiento, UNAM.

---

## CONTROL DEL DOCUMENTO

| Campo | Valor |
|-------|-------|
| Documento | SS-MU-001 |
| Revisión | 1.0.0 |
| Páginas | Documento digital (Markdown) |
| Idioma | Español (México) |
| Normas de referencia | ISO/IEC 26514:2008, ISO 9001:2015 |
| Próxima revisión | 18 de mayo de 2027 |

---

*Fin del documento — SmartStore Manual de Usuario v1.0.0*
