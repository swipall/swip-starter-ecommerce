# Flujo de precios — `customer_id` y lista de precios

Este documento describe el patrón de precios por cliente usado en los proyectos ecommerce del stack Swip. Explica cómo se obtiene el `customer_id` tras el login, cómo se propaga a las peticiones de inventario para obtener precios personalizados, y cómo se detecta y aplica un cambio de lista de precios en tiempo de ejecución.

> Este documento es agnóstico al proyecto. Los nombres de archivo y rutas API son convenciones del stack — cada proyecto puede tenerlos en rutas ligeramente distintas.

---

## Concepto central

El backend puede asignar a un cliente una **lista de precios** (`price_list`), pero no es obligatorio — el campo es opcional. Cuando el frontend consulta ítems del catálogo o el detalle de un producto, envía el `customer_id` como query param para que la API resuelva y devuelva el precio correspondiente. Si el cliente no tiene lista asignada, la API devuelve el precio base.

```
cliente autenticado + price_list asignada → customer_id → API resuelve price_list → precio personalizado
cliente autenticado sin price_list        → customer_id → API devuelve precio base
cliente anónimo                           → (sin customer_id) → API devuelve precio base
```

---

## Diagrama de flujo

```
┌─────────────────────────────────────────────────────────────────────┐
│                          APP STARTUP / LOGIN                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  login()                    │
                    │  POST /api/v1/shop/login/   │ (sin token — axios directo)
                    │  → LoginResponse {          │
                    │      access_token,          │
                    │      refresh_token,         │
                    │      user (básico)          │
                    │    }                        │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  SessionProvider.signIn()   │
                    │  1. Persiste tokens en      │
                    │     storage local           │
                    │  2. Inyecta Authorization:  │
                    │     Bearer <token> en       │
                    │     config global de axios  │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  fetchCustomerInfo()        │
                    │  GET /api/v1/shop/          │
                    │      customer/info          │ ← interceptor añade Bearer
                    │  → CustomerInfo {           │
                    │      id,                    │ ← este es el customer_id
                    │      price_list?: {         │ ← opcional, puede ser null
                    │        id,                  │ ← id de lista de precios
                    │        description,         │
                    │        minimal_amount       │
                    │      },                     │
                    │      store, credit, ...     │
                    │    }                        │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  SessionProvider (contexto) │
                    │  user.id      → customer_id │
                    │  user.price_list → lista de │
                    │    precios activa (o null   │
                    │    si no tiene asignada)    │
                    └─────────────┬───────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐      ┌──────────────────┐     ┌──────────────────────┐
│ CATÁLOGO      │      │ DETALLE PRODUCTO  │     │ PRICE LIST SYNC      │
│               │      │                  │     │ (app regresa a       │
│ fetchItems()  │      │ fetchItemDetail() │     │  primer plano)       │
│  params +=    │      │  params +=        │     │                      │
│  customer_id: │      │  customer_id:     │     │ hook de sincronización
│  user.id      │      │  user.id          │     │  → repriceIfNeeded() │
│               │      │                  │     └──────────┬───────────┘
│GET /shop/items│      │GET /shop/item/:id │               │
│  ?customer_id │      │  ?customer_id     │     ┌──────────▼───────────┐
│               │      │                  │     │ refreshUser()        │
│ API devuelve  │      │ API devuelve      │     │ GET /customer/info   │
│ precio de la  │      │ precio específico │     │                      │
│ price_list    │      │ para ese cliente  │     │ Compara              │
│ del cliente   │      │                  │     │ local price_list.id  │
└───────────────┘      └──────────────────┘     │  vs                  │
                                                │ remote price_list.id │
                                                └──────────┬───────────┘
                                                           │
                                          ┌────────────────┴──────────┐
                                          │ ¿price_list cambió?       │
                                          └────────────────┬──────────┘
                                               │           │
                                              NO          SÍ
                                               │           │
                                               ▼           ▼
                                           (nada)   repriceCart(cartId)
                                                    POST /cart/:id/reprice
                                                           │
                                                           ▼
                                                    recarga la app
```

---

## Resumen por etapa

| Etapa | Qué pasa | Responsable |
|-------|----------|-------------|
| **Login** | Se obtienen tokens y se llama a `fetchCustomerInfo()` para cargar `id` y `price_list` del cliente | `SessionProvider` / `core/context` |
| **Catálogo** | Se agrega `customer_id` como query param en cada request de ítems | `inventory model` |
| **Detalle de producto** | Igual que catálogo — `customer_id` determina el precio mostrado | `inventory model` |
| **Precio personalizado** | La API resuelve el precio según la `price_list` vinculada al cliente | API backend |
| **Sincronización** | Al volver a primer plano, se refresca el usuario y se comparan las `price_list.id` | hook `use-price-list-reprice` |
| **Re-precio del carrito** | Si la `price_list` cambió, se reprecia el carrito y se recarga la app | `shop model` |

---

## Capas del stack involucradas

| Capa | Rol en este flujo |
|------|-------------------|
| `services/http-client/auth` | Login — petición sin token (axios directo) |
| `services/http-client/interceptor` | Inyecta `Bearer` en todas las requests autenticadas; maneja refresh de token |
| `core/context` (SessionProvider) | Almacena sesión, tokens y `CustomerInfo` incluyendo `price_list` |
| `services/http-client/user` | `fetchCustomerInfo()` — obtiene `id` y `price_list` del cliente autenticado |
| `models/inventory` | Agrega `customer_id` a los params de catálogo y detalle |
| hook `use-price-list-sync` | Detecta regreso a primer plano y dispara la comparación |
| hook `use-price-list-reprice` | Compara `price_list.id` local vs remoto y decide si repreciar |
| `models/shop` | `repriceCartIfPriceListMismatch()` — llama al endpoint de re-precio si hay cambio |

---

## Ejemplos de respuesta de la API

### `POST /api/v1/shop/login/`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "pk": "usr_abc123",
    "first_name": "Ana",
    "last_name": "García"
  }
}
```

> El objeto `user` devuelto por el login contiene solo datos básicos de identidad. Los datos completos del cliente (incluyendo `price_list`) se obtienen en el paso siguiente.

---

### `GET /api/v1/shop/customer/info` — cliente con lista de precios asignada

```json
{
  "id": "cust_xyz789",
  "business_name": "Distribuidora Norte S.A.",
  "mobile": "+52 55 1234 5678",
  "email": "ana@distribuidoranorte.com",
  "extra_fields": [],
  "properties": [],
  "address": {
    "id": "addr_001",
    "address": "Av. Insurgentes 1234",
    "suburb": "Del Valle",
    "postal_code": "03100",
    "city": "Ciudad de México",
    "state": "CDMX",
    "country": "MX"
  },
  "price_list": {
    "id": "pl_mayoreo",
    "description": "Lista Mayoreo",
    "minimal_amount": 500.00
  },
  "allow_amount_gifts": "0",
  "allow_credit": true,
  "credit_days": 30,
  "credit_limit": "10000.00",
  "store": {
    "id": "store_01",
    "name": "Tienda Principal"
  }
}
```

### `GET /api/v1/shop/customer/info` — cliente sin lista de precios asignada

```json
{
  "id": "cust_abc456",
  "business_name": "Cliente General",
  "mobile": "+52 55 9876 5432",
  "email": "cliente@example.com",
  "extra_fields": [],
  "properties": [],
  "address": {
    "id": "addr_002",
    "address": "Calle Reforma 56",
    "suburb": "Centro",
    "postal_code": "06000",
    "city": "Ciudad de México",
    "state": "CDMX",
    "country": "MX"
  },
  "price_list": null,
  "allow_amount_gifts": "0",
  "allow_credit": false,
  "credit_days": 0,
  "credit_limit": "0.00",
  "store": {
    "id": "store_01",
    "name": "Tienda Principal"
  }
}
```

> Cuando `price_list` es `null`, el frontend envía igualmente `customer_id` en las peticiones de inventario. La API es responsable de resolver el precio base para ese cliente.

---

## Notas

- El `customer_id` **no es un parámetro de autenticación** — es un hint semántico para que la API resuelva qué `price_list` aplicar al precio de cada ítem.
- `price_list` es **opcional** — un cliente puede no tener lista asignada. En ese caso la API devuelve el precio base, igual que para usuarios anónimos.
- Usuarios no autenticados pueden consultar el catálogo; en ese caso no se envía `customer_id` y la API devuelve el precio base público.
- La sincronización de lista de precios es **best-effort**: si el re-precio falla, el error se silencia para no interrumpir al usuario.
- El dato de referencia para detectar un cambio de lista es `price_list.id`. Si el cliente pasa de tener lista a no tener (`null`), también se debe considerar como cambio.
