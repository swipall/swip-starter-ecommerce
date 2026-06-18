# Constitution — Immutable Rules

These rules apply to every change in this repository, without exception.
If a suggestion conflicts with any rule here, the rule wins.

---

## Scope

- This repository is a **Next.js 16 App Router** storefront for the Swipall REST API.
- It is a customer-facing e-commerce application, not an admin panel or internal tool.
- The runtime target is server + client React (React 19, RSC-first).

---

## Non-negotiable Architectural Principles

- **Server Components are the default.** Components are client only when they require browser APIs, interactivity, or React hooks. Never add `'use client'` without a concrete reason.
- **Server Actions handle all mutations.** Form submissions, cart operations, and auth flows go through `actions.ts` files co-located with their route. No mutation via client-side fetch to internal routes.
- **The API layer is layered and must not be bypassed.** Pages and actions import from `rest-adapter.ts`. They never call `api.ts` or `api-server.ts` directly.
- **Authentication state belongs in cookies, not localStorage.** The JWT lives in `httpOnly` cookies managed by `lib/auth.ts`. `localStorage` is only used for non-sensitive user display data (name, id) via `lib/auth-client.ts`.

---

## Layer Dependency Rules

```
app/ (pages, layouts, server actions)
    ↓
lib/swipall/rest-adapter.ts  (domain functions)
    ↓
lib/swipall/api-server.ts    (auth-aware fetch wrapper, server only)
    ↓
lib/swipall/api.ts           (raw fetch client)
```

- `app/` may import from `rest-adapter.ts`, `lib/auth.ts`, `lib/cart.ts`, `lib/models/`, `lib/strategies/`, and `components/`.
- `rest-adapter.ts` imports only from `api-server.ts` and `types/`.
- `api-server.ts` imports only from `api.ts` and `lib/auth.ts`.
- `api.ts` has no internal imports.
- No circular dependencies between layers.

---

## Add-to-Cart Rules

- Adding a product to the cart must always go through the strategy factory (`AddItemStrategyFactory`).
- Adding a new product kind requires a new strategy implementing `AddItemToCartStrategy` — never a conditional branch inside an existing strategy.
- Stock validation is mandatory in every strategy before calling the API.

---

## Pricing Rules

- `price` is always the final selling price displayed to the customer.
- `web_price` is displayed crossed out only when it is higher than `price`.
- Never compute or override prices in the frontend. Display only what the API returns.
- Price list minimum amount must be enforced before allowing checkout progression.

---

## Authentication and Cookie Rules

- JWT tokens (`swipall-auth-token`, `swipall-refresh-token`) must be stored exclusively in `httpOnly` cookies.
- Token refresh is handled transparently by `getAuthToken()` in `lib/auth.ts`. No component or action should implement its own refresh logic.
- Never send auth tokens to external origins outside `SWIPALL_SHOP_API_URL`.
- Middleware (`middleware.ts`) is the sole enforcer of route protection for `/account/*` and `/checkout/*`.

---

## Caching Rules

- Data caching uses Next.js `'use cache'` + `cacheLife` + `cacheTag`. No manual `fetch` cache headers outside `lib/swipall/api.ts`.
- Cache invalidation is triggered by `revalidateTag()`. The `/api/revalidate` route is the backend-facing entry point.
- Never cache user-specific or cart data. Only catalog, channel, and country data is cacheable.

---

## Component Rules

- `src/components/ui/` contains only shadcn/ui primitives. No business logic.
- `src/components/commerce/` contains domain components. They may receive data as props but do not fetch data themselves.
- No business calculations inside components. Price formatting and stock logic belong in `lib/` utilities.
- Skeleton components in `shared/skeletons/` must match the layout of the component they represent.

---

## Type Safety Rules

- All public function signatures in `lib/` must be strongly typed.
- Avoid `any`. Use types from `lib/swipall/types/types.ts` and `lib/swipall/users/user.types.ts`.
- DTO-to-domain mapping happens in `rest-adapter.ts`, not in components or pages.
- Run `npm run check-types` before every commit. A commit that breaks type checking is invalid.

---

## Documentation Rules

- Every non-trivial feature must have a spec document in `docs/features/` before implementation begins.
- Spec files follow the format: `{feature-name}.md` (e.g., `pricing-customer-id-flow.md`).
- Specs must list the files to be created or modified and describe the expected behavior.
- Implementation must not start if the corresponding spec does not exist for complex features.

---

## Code Style Rules

- No commented-out code.
- No `console.log` in production paths.
- Files have a single responsibility — co-locate by route or feature, not by file type.
- Commits follow Conventional Commits as defined in `docs/commit-convention.md`.
- Commit messages are written in English.

---

## What Never Changes

- The three-layer API stack: `api.ts` → `api-server.ts` → `rest-adapter.ts`.
- JWT token storage in `httpOnly` cookies.
- The strategy pattern for add-to-cart operations.
- Middleware as the sole route protection mechanism.
- `price` as the final price; `web_price` as the reference/crossed-out price.
