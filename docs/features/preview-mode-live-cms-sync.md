# Feature Spec — Preview Mode: Live CMS Sync for the Home Page

**Date:** 2026-07-13
**Status:** Approved — open questions resolved, ready for implementation
**Origin:** Requested by the CMS editor team (`swip-cms-front`), see their `docs/specs/011-preview-viewer-live-storefront.md`. This document is the mirror spec on the storefront side, defining exactly what this repo must implement to satisfy that contract.

---

## 1. Context and motivation

`swip-cms-front` is building a live preview panel (`WebAppViewer`) inside its home layout editor. It shows an `<iframe>` next to the block list/editor, so a merchant sees the real storefront home update as they edit blocks — before saving anything to the CMS.

Today there is **no way to do this**. The home page (`src/app/page.tsx` → `HomePageComponent`) always fetches blocks from the live CMS via `getPosts({ parent__slug: "ecommerce-home" })`, cached with `"use cache"` + `cacheLife("hours")` (`home-page-component.tsx:10-17`). There is no draft mode, no `?preview=true` query param, and no mechanism to inject an in-memory block list instead of querying the CMS.

This spec defines a new route, `/preview/home`, that renders the exact same section components the real home uses, but sources its block list from `postMessage` events sent by the CMS editor's parent window instead of from the CMS API — with caching fully disabled for that route.

### 1.1 Why a separate route instead of a query param on `/`

`/` is cached (`"use cache"`) and is a public, indexable, customer-facing route. Preview must never be reachable by search engines or by a customer stumbling on a leaked URL, and must never accidentally get cached by the `"use cache"` layer that governs `/`. A dedicated route (`/preview/home`) makes it trivial to:
- Exclude it from caching entirely, with no risk of the exclusion leaking into `/`'s cache logic.
- Gate it behind its own auth check (§4), independent from customer-facing middleware rules.
- Keep `HomePageComponent` (the real, cached, public home) completely untouched.

---

## 2. Contract with the CMS editor (source of truth: `swip-cms-front` spec 011 §4.1–§4.4)

### 2.1 Outbound messages (CMS → this route, via `iframe.contentWindow.postMessage`)

```ts
interface PreviewSyncMessage {
  type: 'swipall-cms:sync-layout';
  payload: {
    blocks: SerializedBlockNode[]; // see §3 for the exact shape received
    activeBlockId: string | null;
  };
}
```

### 2.2 Inbound messages (this route → CMS, via `window.parent.postMessage`)

```ts
interface PreviewReadyMessage {
  type: 'swipall-cms:ready';
}

interface PreviewBlockRenderedMessage {
  type: 'swipall-cms:block-rendered';
  payload: {
    blockId: string;
    status: 'hydrated' | 'loading' | 'out-of-stock' | 'unknown-type';
    boundingRect: { top: number; height: number }; // relative to this document, in px
  };
}
```

- `swipall-cms:ready` must be sent once, right after the page mounts and is ready to receive `sync-layout` messages.
- `swipall-cms:block-rendered` must be sent once per rendered block, every time that block's render output changes (mount, re-render after a sync, or status transition e.g. loading → hydrated).

### 2.3 Security requirements (non-negotiable, per CMS spec §4.4)

- This route's outbound `postMessage` calls **must target an explicit origin allowlist**, read from an env var (`CMS_EDITOR_ORIGIN` — see §6), never `"*"`.
- Inbound `message` events **must validate `event.origin`** against the same allowlist before touching `event.data`.
- Inbound payloads must be validated against an expected shape (a type guard, not `JSON.parse` + trust) before being used to render anything. Never `eval`/`Function`.
- This route must require the same authenticated merchant/preview-token guard used elsewhere in this app (see §4) — it must not be reachable by an anonymous customer.

---

## 3. Data shape mismatch: `SerializedBlockNode` vs. `CmsPost`

The CMS editor sends `SerializedBlockNode[]` (its own wire format), **not** this repo's `CmsPost`. Every existing section component (`HomeBannerSection`, `HomeCategoriesSection`, etc.) takes a `post: CmsPost` prop (`src/lib/swipall/types/types.ts:248-262`). This spec requires an **adapter function**, not changes to the section components or to `CmsPost` itself.

### 3.1 `SerializedBlockNode` shape (as sent by `swip-cms-front`)

```ts
interface SerializedBlockNode {
  id: string;
  type: BlockType;        // 'home-banner' | 'home-banner-slider' | 'home-promo-banner'
                          // | 'home-categories' | 'home-products-by-category'
                          // | 'home-html' | 'home-company-info'
  slug: string;
  title: string;
  excerpt: string;
  categories: { id: string; slug: string; name: string }[];
  ordering: number;
  link: string;
  featured_image: string;
  body: string;           // JSON.stringify(BlockBody), except home-html (raw HTML)
  parent?: string;        // UUID of the parent container block, if any
}
```

### 3.2 Adapter: `SerializedBlockNode` → `CmsPost`

A pure mapping function (no fetch, no side effects) must convert each `SerializedBlockNode` into a `CmsPost`:

```ts
function toCmsPost(node: SerializedBlockNode, parentUuid: string | null): CmsPost {
  return {
    slug: node.slug,
    title: node.title,
    excerpt: node.excerpt || null,
    body: node.body,
    categories: node.categories.map((c) => ({ name: c.name, slug: c.slug })),
    link: node.link || null,
    updated_at: new Date().toISOString(), // not meaningful in preview — never displayed
    featured_image: node.featured_image || null,
    ordering: node.ordering,
    author: null,
    modified_by: null,
    version: 0,
    parent: parentUuid ? /* resolved parent CmsPost, or null if not yet available */ null : null,
  };
}
```

Container blocks (`home-banner-slider`, `home-company-info`) carry their children flattened in the same `SerializedBlockNode[]` array (identified by `parent` pointing to the container's `id`), exactly like the CMS editor's own internal model (`CMSBlockNode.children`, flattened by `serializeBlocks()` in `swip-cms-front`). The adapter must:
1. Partition the incoming array into root nodes (`parent` undefined) and child nodes (`parent` set).
2. Build each root `CmsPost` first.
3. For container types, attach children as `CmsPost[]` via the same grouping `HomeBannerSliderSectionWrapper` already expects (see §3.3) — do not invent a new children-passing convention.

### 3.3 Reusing existing section components as-is

Per the CMS spec's Option A (§2 of the mirror spec), **no section component changes**. `HomeSectionRenderer` (`home-section-renderer.tsx:17-25`) and its `SECTION_RENDERERS` map are reused unmodified. The preview route's only job is to produce `CmsPost[]` (root blocks, with children already attached where the renderer expects them) and feed them into the same `<HomeSectionRenderer post={post} />` loop that `HomePageComponent` uses today (`home-page-component.tsx:26-33`), swapping only:
- The **data source** (postMessage payload instead of `getPosts()`).
- The **caching** (none — see §5).
- Wrapping each rendered block in a `<div data-block-id={post_original_node_id}>` (see §4.2) instead of a bare `<Suspense>`.

---

## 4. Route implementation

### 4.1 File layout

```
src/app/preview/home/
├── page.tsx           # Server Component — auth guard, renders <PreviewHomeClient />
└── preview-home-client.tsx   # Client Component ('use client') — postMessage listener + render
```

`page.tsx` stays a Server Component per this repo's constitution ("Server Components are the default" — `docs/constitution.md`); only the postMessage-driven piece becomes a Client Component, which is a concrete, justified reason to opt out of the default.

### 4.2 `page.tsx` (Server Component)

Responsibilities:
- Enforce the auth guard (§4.4) — redirect or return 403/404 if the request isn't an authorized merchant/preview session.
- Read `CMS_EDITOR_ORIGIN` from the environment and pass it down as a prop (never trust a client-supplied origin).
- Render `<PreviewHomeClient allowedOrigin={...} />`. No data fetching happens here — the block list arrives entirely via `postMessage` after mount.

### 4.3 `preview-home-client.tsx` (Client Component)

Responsibilities:
- On mount: attach a `message` listener; validate `event.origin === allowedOrigin`; validate `event.data` against a type guard for `PreviewSyncMessage`.
- Send `swipall-cms:ready` to `window.parent` once mounted (targeting `allowedOrigin`, never `"*"`).
- On each valid `sync-layout` message: run the adapter (§3.2) to build `CmsPost[]`, then re-render the block list.
- For each rendered block, attach `data-block-id={originalNodeId}` on the section's outer wrapper element, and report `swipall-cms:block-rendered` (§2.2) with its `getBoundingClientRect()` — recomputed on every re-render and on `resize`/`scroll` if the CMS highlight is expected to track layout shifts (out of scope to make this perfectly pixel-accurate on every scroll event; a `ResizeObserver` + re-measure on sync is sufficient).
- Renders blocks using **the exact same `<Suspense fallback={...}>` + `HomeSectionRenderer` loop** as `HomePageComponent`, with one deliberate divergence: use a real skeleton fallback instead of `fallback={null}` (see §5.2), and set each block's `status` to `'loading'` until its `Suspense` boundary resolves — this requires converting each fallback into a signal the parent client component can observe (e.g., a lightweight `onBlockSettled` callback per block wrapper, since `Suspense` itself doesn't expose a resolution callback — a straightforward pattern is wrapping each section in its own error/loading boundary component that reports status via `useEffect` on mount).
- Reports `status: 'unknown-type'` for any `SerializedBlockNode` whose `type` doesn't resolve via `getHomeBlockType` (mirrors `ux-spec`'s "collapse unknown blocks to 0px in production" rule from the CMS side — but here, since this is *always* preview/editor context, the block can render its 22px dashed-border editor affordance directly, because this route is never reached by real customers).
- Reports `status: 'out-of-stock'` for `home-products-by-category` blocks where all returned products have zero stock (best-effort — this repo's product data doesn't currently expose a single top-level "block is fully out of stock" flag, so this is computed client-side from the same `searchProducts` result the section already fetches).

### 4.4 Auth / access guard — shared-secret cookie, scoped to this storefront only

**Decision:** this route must be reachable **exclusively from inside the CMS microfrontend's embedded iframe** — never directly, never by a customer, never indexed. The mechanism is a static shared secret, propagated as an `httpOnly` cookie that only `middleware.ts` ever reads.

**Why not a cookie "injected by the CMS" directly:** `swip-cms-front` and this storefront are two different origins (the CMS runs embedded via Module Federation inside a host shell, on a different domain than any given merchant's storefront). A cross-origin page cannot set a cookie on another origin from client-side JS — cookies are always written by (or on behalf of) the origin that owns them. So "the CMS injects a cookie" really means: **the CMS puts the secret in the iframe's `src` URL as a query param, and this repo's own server is the one that turns it into a cookie on its first request.**

#### Flow

```
1. swip-cms-front builds the iframe src as:
   https://<merchant-storefront>/preview/home?pk=<PREVIEW_ACCESS_SECRET>

2. Browser loads that URL inside the CMS's iframe.
   → This is a same-origin request from the iframe's own address bar to
     merida-ecommerce's own server — not a cross-origin cookie write.

3. src/app/preview/home/page.tsx (Server Component) reads `pk` from
   searchParams, compares it (constant-time) against
   process.env.PREVIEW_ACCESS_SECRET.

   - Mismatch or missing → 404 (not 403 — never confirm the route exists
     to an unauthenticated caller).
   - Match → set an httpOnly, Secure, SameSite=None cookie
     (`swipall-preview-access`, value = the same secret, or a short-lived
     signed derivative — see §4.4.1) via `cookies().set(...)`, then render
     the page normally.

4. On every subsequent request to /preview/home/* during that session
   (e.g. the client component re-requesting anything, or a reload inside
   the iframe), middleware.ts validates the cookie instead of re-reading
   the query param — so the secret doesn't need to stay in the URL/history
   after the first load.
```

`SameSite=None; Secure` is required (not `Lax`/`Strict`) precisely because this cookie is set and read while the page is embedded in a **cross-site iframe** — the CMS shell's origin differs from the storefront's origin. This must run over HTTPS in every environment where preview is used (including local dev, via a tunneled HTTPS domain if needed) — `SameSite=None` cookies are rejected by browsers over plain HTTP.

#### 4.4.1 Shared secret vs. signed/expiring token

Per team decision, this spec uses the **static shared-secret** approach (not a signed JWT with expiration):

- `PREVIEW_ACCESS_SECRET` is a single, long, random static value, stored as an env var in **both** repos' server-side environments (`merida-ecommerce`'s deployment env, and wherever `swip-cms-front`/its host shell reads config to build the iframe `src`).
- It never expires and is never displayed in any UI — it is a deployment-time secret, rotated manually if ever compromised (same operational model as any other server-to-server API key in this stack).
- The cookie's value does not need to differ from the query param's value — it is the same secret, just moved out of the URL after the first load so it doesn't linger in browser history/referrer headers on subsequent navigations within the iframe.
- No per-merchant or per-session scoping is required by this design — anyone holding the secret can reach `/preview/home` for **any** merchant storefront that shares the same secret. If per-merchant isolation is ever needed, that would require moving to the signed/expiring token approach — out of scope for this spec since it wasn't requested.

#### Implementation

- `middleware.ts`'s `matcher` (`middleware.ts:18-20`) gains `/preview/:path*`.
- The middleware function gains a branch: for paths matching `/preview`, check the `swipall-preview-access` cookie against `PREVIEW_ACCESS_SECRET` (not the existing `AUTH_TOKEN_COOKIE`/`REFRESH_TOKEN_COOKIE` check, which is for real customer/merchant login sessions and is unrelated to this guard) — redirect (or 404) on mismatch.
- The query-param-to-cookie exchange (step 3 above) happens in `page.tsx` itself, since `middleware.ts` runs on the Edge runtime and only *reads* cookies for the redirect decision — the actual `Set-Cookie` on first load is simplest to do from the Server Component/Route Handler that owns the request.

> This section is no longer an open question — it replaces the two auth options originally proposed in this spec's first draft.

---

## 5. Caching — must be fully bypassed

Per this repo's constitution ("Data caching uses Next.js `'use cache'`... Never cache user-specific or cart data"), preview content is even more transient than user-specific data — it doesn't exist in the CMS at all. Concretely:

### 5.1 No `"use cache"` anywhere in the preview path

`preview-home-client.tsx` must not call any function marked `"use cache"`. If it needs to resolve product data for a `home-products-by-category` block, it must call `searchProducts()` directly (same function `HomeProductsByCategorySection` already uses), **without** the `CachedSectionRenderer` wrapper (`home-section-renderer.tsx:30-37`) — that wrapper is specific to the real home's caching strategy and must be bypassed here. Reuse `HomeSectionRenderer` (the outer, non-cached-by-default component) is fine since it already branches around `USER_DEPENDENT_SECTIONS` — but note it *still* calls `CachedSectionRenderer` for the other section types (`home-section-renderer.tsx:43-48`). This means `HomeSectionRenderer` as-is is **not** safe to reuse verbatim for every block type in preview.

**Resolution:** introduce a preview-only variant, `PreviewSectionRenderer`, that mirrors `HomeSectionRenderer`'s `SECTION_RENDERERS` map (§3.3 — same map, no duplication of the map itself if it's exported and reused) but always calls the renderer directly, uncached, for every block type — never through `CachedSectionRenderer`.

### 5.2 Skeleton fallback instead of `fallback={null}`

The CMS spec (§5.4 of the mirror doc) explicitly requires visible, layout-stable skeletons in preview, unlike the real home's `fallback={null}` (`home-page-component.tsx:29`). This repo already has skeleton components in `src/components/shared/skeletons/` (`post-skeleton.tsx` etc.) that are not currently wired to the home — this spec requires **new** skeleton components matching each home section's dimensions (hero aspect-ratio, category circle grid, product card grid), living alongside the existing ones, reusing their visual conventions (`docs/constitution.md`: "Skeleton components in `shared/skeletons/` must match the layout of the component they represent").

---

## 6. Environment configuration

```env
# .env.local / deployment env
CMS_EDITOR_ORIGIN=https://cms.swipall.io      # exact origin the CMS editor is served from; no wildcard, no trailing path
PREVIEW_ACCESS_SECRET=<long random static value, shared with the CMS side — see §4.4>
```

Both are read server-side only (`page.tsx` for the guard/cookie exchange, `middleware.ts` for the cookie check on subsequent requests), passed down as props where the client component needs the resolved `allowedOrigin` — never read directly inside the client component from `process.env` (would leak into the client bundle unless prefixed `NEXT_PUBLIC_`, which neither of these values should ever be).

---

## 7. Files to create / modify

| File | Change |
|---|---|
| `src/app/preview/home/page.tsx` | **New.** Server Component — auth guard (§4.4), reads `CMS_EDITOR_ORIGIN`, renders client component. |
| `src/app/preview/home/preview-home-client.tsx` | **New.** Client Component — postMessage listener, adapter invocation, render loop, `data-block-id` + status reporting. |
| `src/components/layout/home/preview/serialized-block-adapter.ts` | **New.** Pure `SerializedBlockNode[] → CmsPost[]` mapping function (§3.2), unit-testable in isolation. |
| `src/components/layout/home/preview/preview-section-renderer.tsx` | **New.** Uncached variant of `HomeSectionRenderer` (§5.1) — reuses the `SECTION_RENDERERS` map, no `CachedSectionRenderer` wrapper. |
| `src/components/shared/skeletons/home-hero-skeleton.tsx`, `home-categories-skeleton.tsx`, `home-product-grid-skeleton.tsx` | **New.** Skeleton fallbacks matching each section's real dimensions (§5.2). |
| `middleware.ts` | Add `/preview/:path*` to `matcher` (§4.4), guarded by whichever auth mechanism is chosen. |
| `docs/features/preview-mode-live-cms-sync.md` | This document. |

---

## 8. Out of scope

- Any change to `HomePageComponent`, `HomeSectionRenderer`, `CachedSectionRenderer`, or any individual section component's public props/behavior for the real, public `/` route.
- Editing capability inside the preview route itself — it is read-only, driven entirely by what the CMS sends.
- Persisting or storing preview payloads server-side — everything is transient, in-memory, per browser tab.
- Supporting preview for routes other than the home (`/collection/[slug]`, `/search`, etc.) — matches the CMS editor's own current scope (home only).
- Multi-tab or multi-user collaborative preview — one merchant, one tab, one iframe session.
- Perfect pixel-accurate `boundingRect` tracking on every scroll/resize tick — best-effort re-measurement on sync and `ResizeObserver` is sufficient (§4.3).

---

## 9. Resolved decisions (formerly open questions)

1. **`CMS_EDITOR_ORIGIN` is a single origin, not an allowlist** — `https://cms.swipall.io`. No staging/prod split is required by this spec; if that changes later, this becomes a comma-separated allowlist and the validation in §2.3/§4.3 needs to check membership instead of equality. This is independent of `PREVIEW_ACCESS_SECRET` (§4.4) — the secret gates *access to the route at all*, while `CMS_EDITOR_ORIGIN` gates *which origin the postMessage channel trusts* once inside it. Both checks are required; neither substitutes for the other.
2. **`HOME_TYPE_ORDER`** (`home-section-types.ts:17-25`) stays the single source of truth for block-type priority — `swip-cms-front`'s `BLOCK_TYPE_PRIORITY` must mirror this list exactly; any future addition of a block type here must be communicated to the CMS team so both lists stay in sync (this is already a known coupling flagged in the CMS's own spec 011 §4.7).
3. **`PREVIEW_ACCESS_SECRET` injection on the CMS side** is out of scope for this repo — it is provided to `merida-ecommerce` as a deployment-time env var (§6) and is assumed to already be wired into however `swip-cms-front`'s host shell builds the iframe `src`; no further coordination is required before implementing this repo's side of the contract.

---

## 10. Next steps

1. Implement per §7's file list, following this repo's TDD expectations where applicable (the adapter in §3.2 is a pure function and should have unit tests even though this repo has no configured test suite today — confirm whether to introduce one scoped to this feature, or verify manually and document the verification steps here).
2. Manually verify end-to-end against a running `swip-cms-front` editor instance pointed at this route via `previewUrl`/`previewOrigin` (see the CMS repo's `HomepageLayoutBuilder` props).
