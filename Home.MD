# Estructura de Página de Inicio (Home)

## 📋 Descripción General

La página de inicio está compuesta por bloques modulares (posts CMS) que se pueden agregar, reordenar y personalizar. Cada bloque tiene una categoría específica que define su tipo y comportamiento.

---

## 🏠 Post Raíz: Página de Inicio

```json
{
  "slug": "ecommerce-home",
  "title": "Inicio",
  "categories": [
    { "name": "Page", "slug": "page" },
    { "name": "Home", "slug": "home" }
  ],
  "parent": null
}
```

**Propósito:** Contenedor principal de la página. Este post actúa como referencia para todos los bloques secundarios.

---

## 🎨 Tipos de Bloques Disponibles

| Tipo | Slug | Descripción | Uso |
|------|------|-------------|-----|
| **Banner** | `home-banner` | Imagen grande con título y enlace | Promociones destacadas |
| **Banner Slider** | `home-banner-slider` | Carrusel de banners (completos o simples) | Múltiples promociones |
| **Categorías** | `home-categories` | Grilla de categorías con imágenes | Navegación visual |
| **Productos** | `home-products-by-category` | Lista de productos de una categoría | Mostrar stock destacado |
| **HTML Libre** | `home-html` | HTML personalizado | Anuncios, promos, dividers |

---

## 🔧 Estructura de Cada Bloque

### 1️⃣ Banner

**Slug:** `home-banner` | **Ordering:** 1, 2, 3... (orden de aparición)

```json
{
  "slug": "ecommerce-home-banner-1",
  "title": "Nueva colección",
  "excerpt": null,
  "body": "{\"subtitle\": \"Temporada 2026\", \"autoplay\": true}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Banner", "slug": "home-banner" }
  ],
  "link": "/coleccion/nueva",
  "featured_image": "/img/banner1.jpg",
  "ordering": 1,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: JSON con `subtitle` (texto secundario) y `autoplay` (rotación automática)
- `featured_image`: Imagen principal (recomendado: 1920x600px)
- `link`: Destino al hacer click
- `title`: Título principal

---

### 2️⃣ Categorías Destacadas

**Slug:** `home-categories` | **Típicamente:** Ordering 2

```json
{
  "slug": "ecommerce-home-categories",
  "title": "Categorías",
  "excerpt": null,
  "body": "{\"items\": [{\"slug\": \"maquillaje\", \"image\": \"/img/maq.jpg\"}, {\"slug\": \"perfumes\", \"image\": \"/img/perf.jpg\"}]}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Categorías", "slug": "home-categories" }
  ],
  "ordering": 2,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: JSON con array `items`:
  - `slug`: Slug de la categoría (navegación)
  - `image`: Imagen de la categoría (recomendado: 300x300px)

---

### 3️⃣ Productos por Categoría

**Slug:** `home-products-by-category` | **Típicamente:** Ordering 3+

```json
{
  "slug": "ecommerce-home-products-maquillaje",
  "title": "Maquillaje destacado",
  "excerpt": null,
  "body": "{\"category_slug\": \"maquillaje\", \"limit\": 8, \"order\": \"popular\"}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Productos", "slug": "home-products-by-category" }
  ],
  "ordering": 3,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: JSON con:
  - `category_slug`: Slug de la categoría a filtrar
  - `limit`: Cantidad de productos (4-12 recomendado)
  - `order`: Orden (`popular`, `new`, `price_asc`, `price_desc`)

---

### 4️⃣ Banner Slider (Contenedor)

**Slug:** `home-banner-slider` | **Típicamente:** Ordering 2-3

Este es un bloque **contenedor** que agrupa múltiples items tipo banner que se renderizan en un carrusel.

```json
{
  "slug": "ecommerce-home-banner-slider-main",
  "title": "Slider Principal",
  "excerpt": null,
  "body": "{\"autoplay\": true, \"duration\": 5000}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Banner Slider", "slug": "home-banner-slider" }
  ],
  "ordering": 2,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: JSON con configuración del slider:
  - `autoplay` (boolean): Rotación automática
  - `duration` (number): Tiempo en ms entre cambios (default 5000)

---

### 4.1 Items del Slider - Banner Completo

**Slug:** Personalizado | **Parent:** `ecommerce-home-banner-slider-main` | **Ordering:** 1, 2, 3...

Reutiliza la estructura de `home-banner` pero como child del slider:

```json
{
  "slug": "ecommerce-home-banner-slider-item-1",
  "title": "Colección Verano",
  "excerpt": "Descubre lo último en moda",
  "body": "{\"subtitle\": \"Temporada 2026\"}",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Banner", "slug": "home-banner" }
  ],
  "link": "/coleccion/verano",
  "featured_image": "/img/banner-summer.jpg",
  "ordering": 1,
  "parent": {
    "slug": "ecommerce-home-banner-slider-main",
    "title": "Slider Principal"
  }
}
```

**Campos importantes:**
- `title`: Título principal (visible en el banner)
- `excerpt`: Subtítulo o descripción (visible en el banner)
- `body`: JSON con `subtitle` (texto secundario adicional)
- `featured_image`: Imagen principal (1920x600px)
- `link`: Destino al hacer click
- `categories`: Debe incluir `home-banner` para identificar como banner completo

---

### 4.2 Items del Slider - Imagen Simple

**Slug:** Personalizado | **Parent:** `ecommerce-home-banner-slider-main` | **Ordering:** 1, 2, 3...

Solo imagen, opcionalmente con link (sin botón visible):

```json
{
  "slug": "ecommerce-home-banner-slider-item-promo",
  "title": null,
  "excerpt": null,
  "body": null,
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "Banner Slider Item", "slug": "home-banner-slider-item-image" }
  ],
  "link": "/shop",
  "featured_image": "/img/promo-banner.jpg",
  "ordering": 2,
  "parent": {
    "slug": "ecommerce-home-banner-slider-main",
    "title": "Slider Principal"
  }
}
```

**Campos importantes:**
- `featured_image`: Imagen principal (1920x600px)
- `link`: URL destino (opcional, si está presente toda la imagen es clickeable)
- `title`, `excerpt`, `body`: Todos null/vacíos
- `categories`: Debe incluir `home-banner-slider-item-image` para identificar como imagen simple

---

### 5️⃣ HTML Personalizado

**Slug:** `home-html` | **Típicamente:** Ordering final

```json
{
  "slug": "ecommerce-home-html-promo",
  "title": null,
  "excerpt": null,
  "body": "<div class=\"promo\">Envíos gratis desde $999</div>",
  "categories": [
    { "name": "Home", "slug": "home-block" },
    { "name": "HTML", "slug": "home-html" }
  ],
  "ordering": 4,
  "parent": {
    "slug": "ecommerce-home",
    "title": "Inicio"
  }
}
```

**Campos importantes:**
- `body`: HTML puro (sin escapar)
- `title`: Opcional (puede ser null)
- Uso: Dividers, banners, texto libre, widgets personalizados

---

## 📐 Orden Recomendado

```
ordering: 1 → Banner (Hero) - único
ordering: 2 → Banner Slider (contenedor con items)
            ├─ Item 1: Banner completo o imagen simple
            ├─ Item 2: Banner completo o imagen simple
            └─ Item N: ...
ordering: 3 → Categorías destacadas
ordering: 4 → Productos - Categoría 1
ordering: 5 → HTML - Promo
ordering: 6 → Productos - Categoría 2
ordering: 7+ → Más bloques según necesites
```

---

## ✅ Checklist de Validación

**Bloque contenedor `home-banner-slider`:**
- [ ] Tiene `parent: { slug: "ecommerce-home", title: "Inicio" }`
- [ ] El `body` solo contiene configuración (`autoplay`, `duration`)
- [ ] Las `categories` contienen `home-block` + `home-banner-slider`

**Items del slider (children):**
- [ ] Cada item tiene `parent: { slug: "ecommerce-home-banner-slider-main", ... }`
- [ ] Los items están ordenados por `ordering` secuencial
- [ ] Items tipo `home-banner`: incluyen `title`, `featured_image`, `link` y category `home-banner`
- [ ] Items tipo `home-banner-slider-item-image`: solo `featured_image` + opcionalmente `link`, category `home-banner-slider-item-image`
- [ ] Todas las imágenes existen y tienen peso adecuado (1920x600px)

---

## 📝 Notas

- Los bloques se renderizan por `ordering` de menor a mayor
- Los items dentro de un slider se renderizan por `ordering` dentro de su contenedor
- Puedes agregar múltiples bloques del mismo tipo
- Las imágenes van en CDN externo
- El HTML personalizado no se sanitiza (cuidado con inyecciones)
- **Arquitectura parent-child**: El slider puede contener items de diferentes tipos (banners completos e imágenes simples)
