# Project Architecture Spec

## Overview

Next.js 16 App Router storefront for the **Swipall REST API** (Django backend). Migrated from a Vendure GraphQL starter. Uses TypeScript, Tailwind CSS v4, and shadcn/ui (Radix primitives).

---

## Directory Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/           # UI components
│   ├── commerce/         # Domain-specific e-commerce components
│   ├── layout/           # Navbar, footer, home sections
│   ├── providers/        # React context providers
│   ├── shared/           # Generic shared components + skeletons
│   └── ui/               # shadcn/ui primitive components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
└── lib/                  # Business logic and API layer
    ├── models/           # Business logic models (shop, user)
    ├── strategies/       # Strategy pattern for cart operations
    ├── swipall/          # All API integration code
    │   ├── auth/         # Auth service (server-side)
    │   ├── types/        # Shared TypeScript types
    │   └── users/        # User service (server-side)
    └── utils/            # Utility helpers
```

---

## API Layer

Three-layer stack. Always import from the highest layer that fits.

```
api.ts          ← raw fetch wrapper, no auth injection
    ↓
api-server.ts   ← auto-injects JWT from cookies (server only)
    ↓
rest-adapter.ts ← domain functions; use this in pages and server actions
```

### `api.ts`

Raw HTTP client. Exports: `get`, `post`, `put`, `patch`, `remove`.

- `SwipallAPIError` class with `status`, `method`, `endpoint`, `errorData`.
- Reads `SWIPALL_SHOP_API_URL` (or `NEXT_PUBLIC_SWIPALL_SHOP_API_URL`).
- Build-time safe: skips network calls when `NEXT_PHASE === 'phase-production-build'`.

### `api-server.ts`

Thin wrapper over `api.ts`. Calls `getAuthToken()` before every request when `useAuthToken: true` is passed. Use this for all server-side authenticated calls.

### `rest-adapter.ts`

All domain API functions. Imports from `api-server.ts`.

| Domain | Key functions |
|---|---|
| Customer | `getCurrentCustomer`, `updateCustomer`, `updateCustomerPassword` |
| Addresses | `updateCustomerAddress`, `deleteCustomerAddress`, `setDefaultShippingAddress`, `setDefaultBillingAddress` |
| Products | `getProduct`, `getGroupVariants`, `getCollection`, `getPosts`, `getPostDetail` |
| Catalogs | `getTaxonomies`, `getCatalogs`, `getAvailableCountries`, `getActiveChannel` |
| Search | `searchProducts` |
| Cart | `createShopCart`, `addToCart`, `addProductToCart`, `updateProductInCart`, `removeFromCart`, `repriceCart`, `applyPromotionCode`, `removePromotionCode` |
| Checkout | `updateCartDeliveryInfo`, `setOrderRequested`, `createMpPreference`, `validateOrderStatus` |
| Orders | `getCustomerOrders`, `getOrderDetail` |
| Email verification | `verifyCustomerAccount`, `requestUpdateCustomerEmailAddress`, `updateCustomerEmailAddress` |

### `cached.ts`

Wrappers using Next.js `'use cache'` + `cacheLife` + `cacheTag` for infrequently-changing data (channel config, countries, catalogs). Use `revalidateTag()` to invalidate.

### `inventory.ts`

Helpers for product variants and compound materials: `getGroupVariantByTaxonomies`, `fetchCompoundMaterials`.

---

## Authentication

| File | Scope | Responsibility |
|---|---|---|
| `lib/auth.ts` | Server | Read/write JWT cookies; auto-refresh via refresh token |
| `lib/swipall/auth/index.ts` | Server | Login, logout, register server actions |
| `lib/auth-client.ts` | Client | Read/write user info from `localStorage` |
| `hooks/use-auth-user.ts` | Client | Hook: `{ user, isLoading, isAuthenticated, logout }` |
| `contexts/auth-context.tsx` | Client | Promise-based active customer context |

**Token storage:** `httpOnly` cookies (`swipall-auth-token`, `swipall-refresh-token`).

**Cookie names** are configurable via env vars: `SWIPALL_AUTH_TOKEN_COOKIE`, `SWIPALL_REFRESH_TOKEN_COOKIE`.

**Middleware** (`middleware.ts`) protects `/account/*` and `/checkout/*` — redirects to `/sign-in` if neither token cookie is present.

---

## Cart

Cart ID stored as cookie (`swipall-cart-id`, configurable via `SWIPALL_CART_ID_COOKIE`).

`lib/cart.ts` exports: `getCartId`, `setCartId`, `clearCartId`.

---

## Strategy Pattern — Add to Cart

`src/lib/strategies/shop/cart/add-item/`

Handles the different behaviors required when adding different product types to the cart.

```
AddItemStrategyFactory
├── AddSimpleItemToCartStrategy  → kinds: 'product', 'group'
│     Merges quantity if item already in cart.
│     Throws if requested quantity exceeds available stock.
└── AddCompoundItemToCartStrategy → kind: 'compound'
      Always adds as a new line (different material combos = different lines).
```

**Interface:** `addItemToCart(cartId, itemId, body, product?)` + `canHandle(item)`.

---

## Pricing

Products expose two price fields:

- **`price`** — final selling price shown to the customer.
- **`web_price`** — original/crossed-out price (shown when `web_price > price`).

Price list minimum amount is enforced at cart and checkout. Price list is customer-specific and synced via `usePriceListSync` / `usePriceListReprice` hooks when the browser tab becomes visible.

---

## Hooks

| Hook | Description |
|---|---|
| `use-auth-user.ts` | Authenticated user from `localStorage`; listens to storage events |
| `use-mobile.ts` | `isMobile` boolean, breakpoint < 768px |
| `use-price-list-sync.ts` | Detects price list changes on tab visibility change |
| `use-price-list-reprice.ts` | Orchestrates price list sync + cart repricing, calls `router.refresh()` |
| `use-zip-auto-complete.ts` | Postal code autocomplete |

---

## Checkout Flow

Multi-step checkout at `src/app/checkout/`:

1. **`shipping-address-step.tsx`** — Select or enter shipping address
2. **`delivery-step.tsx`** — Choose delivery method
3. **`payment-step.tsx`** — Payment method selection
4. **`review-step.tsx`** — Order review before confirmation

Payment provider: **MercadoPago** (`/shop/mp/order/` handles the post-payment callback and cart cleanup).

---

## Home Page Architecture

`src/components/layout/home/` uses a dynamic section renderer pattern:

- **`home-page-component.tsx`** — orchestrates the page
- **`home-section-renderer.tsx`** — renders sections by type
- **`home-section-types.ts`** — type definitions for all section variants
- **Sections:** `home-banner-section`, `home-banner-slider-section`, `home-categories-section`, `home-products-by-category-section`, `home-html-section`

---

## Key Types

**`src/lib/swipall/types/types.ts`**

| Interface | Description |
|---|---|
| `InterfaceInventoryItem` | Product with pricing, images, taxonomy, variants |
| `ProductVariant` | Single variant with options and stock |
| `ProductKind` | `'group' \| 'product' \| 'compound' \| 'service'` |
| `ShopCart` | Cart/order without line items |
| `ShopCartItem` | Cart line item with quantity and materials |
| `Order` | Cart with `lines: ShopCartItem[]` |
| `InterfaceApiListResponse<T>` | Paginated list: `{ results, count, next, previous }` |
| `InterfaceApiDetailResponse<T>` | Single item response wrapper |
| `AddProductToCartBody` | `{ item, quantity, extra_materials?, price? }` |

**`src/lib/swipall/users/user.types.ts`**

| Interface | Description |
|---|---|
| `CustomerInfoInterface` | Customer profile with address and price list |
| `PriceListInterface` | Price list with `minimal_amount` |
| `OrderDetailInterface` | Full order with items and shipment address |
| `OrderItemDetailInterface` | Order item with materials |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SWIPALL_SHOP_API_URL` | Yes (server) | Backend API base URL |
| `NEXT_PUBLIC_SWIPALL_SHOP_API_URL` | Yes (client) | Backend API base URL (public) |
| `SWIPALL_AUTH_TOKEN_HEADER` | No | Auth header name (default: `Authorization`) |
| `SWIPALL_AUTH_TOKEN_COOKIE` | No | Access token cookie name (default: `swipall-auth-token`) |
| `SWIPALL_REFRESH_TOKEN_COOKIE` | No | Refresh token cookie name (default: `swipall-refresh-token`) |
| `SWIPALL_CART_ID_COOKIE` | No | Cart ID cookie name (default: `swipall-cart-id`) |
