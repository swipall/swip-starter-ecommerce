# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3001
npm run build        # Production build
npm run lint         # ESLint
npm run check-types  # TypeScript type check (no emit)
```

No test suite is configured.

## Environment

Copy `.env.example` to `.env.local`. Key variable:

```env
SWIPALL_SHOP_API_URL=http://localhost:3001/api
```

Cookie names are configurable via env vars: `SWIPALL_AUTH_TOKEN_COOKIE`, `SWIPALL_REFRESH_TOKEN_COOKIE`, `SWIPALL_CART_ID_COOKIE`.

## Architecture

This is a **Next.js 16 App Router** storefront for the **Swipall REST API** (Django backend). Originally based on a Vendure GraphQL starter — some vestiges of that origin remain.

### API Layer (`src/lib/swipall/`)

Three-layer HTTP stack:

1. **`api.ts`** — raw fetch wrapper (`get`, `post`, `patch`, `put`, `remove`). Used directly in client contexts or when no auth token injection is needed.
2. **`api-server.ts`** — thin wrapper over `api.ts` that auto-injects the JWT access token from cookies (via `getAuthToken()`). **Always use this for server-side calls that require auth.**
3. **`rest-adapter.ts`** — domain functions (products, cart, checkout, orders, auth). Imports from `api-server.ts`. This is the primary API surface consumed by pages and server actions.

### Authentication (`src/lib/auth.ts`)

- JWT access + refresh tokens stored in `httpOnly` cookies.
- `getAuthToken()` — reads access token from cookies, auto-refreshes via refresh token if expired.
- `setAuthToken()` / `clearAuthToken()` — set/clear the access token cookie.
- `src/lib/swipall/auth-client.ts` — client-side auth helpers.
- `src/lib/swipall/auth/index.ts` — server-side auth actions (login, register, logout).
- Middleware in `middleware.ts` protects `/account/*` and `/checkout/*` routes.

### Caching (`src/lib/swipall/cached.ts`)

Uses Next.js `'use cache'` directive with `cacheLife` and `cacheTag`. Cached wrappers live here for data that changes infrequently (channel config, countries, catalogs). Use `revalidateTag()` to invalidate.

### Cart (`src/lib/cart.ts`)

Cart ID stored as a plain cookie (`swipall-cart-id`). Helpers: `getCartId()`, `setCartId()`, `clearCartId()`.

### Key Types (`src/lib/swipall/types/types.ts`)

All shared REST API types live here. User/order-specific types are in `src/lib/swipall/users/user.types.ts`.

### Pricing

Products expose two price fields:
- `price` — the final selling price shown to the customer.
- `web_price` — the crossed-out original price (shown when `price < web_price`).

Price list minimum amount is enforced at cart and checkout.

### Components

- `src/components/ui/` — shadcn/ui primitives (Radix-based).
- `src/components/commerce/` — e-commerce domain components (product cards, cart, checkout steps).
- `src/components/layout/` — navbar, home layout sections.
- `src/components/shared/` — skeletons and generic shared components.

### Checkout Flow

Multi-step checkout at `src/app/checkout/steps/`:
1. `shipping-address-step.tsx`
2. `delivery-step.tsx`
3. `payment-step.tsx`
4. `review-step.tsx`

### Inventory (`src/lib/swipall/inventory.ts`)

Helpers for fetching product variants and compound materials. Available stock is validated against existing cart quantity on add-to-cart.
