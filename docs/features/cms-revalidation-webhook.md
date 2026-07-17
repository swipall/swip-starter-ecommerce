# Feature Spec — On-Demand Cache Revalidation Webhook for CMS Publishes

**Date:** 2026-07-16
**Status:** Draft — open questions in §8 must be resolved before implementation
**Origin:** Follow-up to a caching bug fix (see git history: `fix(cache): stop serving stale CMS content on home, navbar, and preview`). That fix shortened `cacheLife` on home blocks, navbar collections, and taxonomy lookups from `hours`/`days` down to `minutes` because CMS edits were invisible on the public storefront for up to a day. This spec proposes the proper fix: push-based invalidation triggered by the CMS at publish time, so edits appear immediately without relying on a short TTL as the only mechanism.

---

## 1. Context and motivation

This repo's `docs/constitution.md` currently states, as a deliberate rule:

> Cache invalidation relies solely on `cacheLife` time-based expiry. There is no on-demand revalidation endpoint.

That rule was fine when caches were short-lived, but three CMS-driven caches ended up with long lifetimes and no invalidation path at all:

| Cache | Location | Old `cacheLife` | `cacheTag` |
|---|---|---|---|
| Home blocks | `getHomeBlocks` in [`home-page-component.tsx:10-17`](../../src/components/layout/home/home-page-component.tsx) | `hours` | `home-blocks` (added, unused until this spec) |
| Home section render | `CachedSectionRenderer` in [`home-section-renderer.tsx:32-39`](../../src/components/layout/home/home-section-renderer.tsx) | `hours` | `home-section-${post.slug}` (added, unused until this spec) |
| Navbar menu | `NavbarCollections` in [`navbar-collections.tsx:8-12`](../../src/components/layout/navbar/navbar-collections.tsx) | `days` | `navbar-collections` (added, unused until this spec) |
| Taxonomy lookups | `getTaxonomyBySlugCached` / `getTaxonomyChildrenCached` in [`cached.ts:64-83`](../../src/lib/swipall/cached.ts) | `hours` | `taxonomy-${slug}` / `taxonomy-children-${parentId}` (pre-existing, unused) |

All four now carry a `cacheTag`, and `cacheLife` was reduced to `minutes` as a stopgap. This spec defines the webhook that lets the CMS call `revalidateTag()` directly on publish, so `cacheLife` can go back up to `hours`/`days` (cheaper, fewer origin calls) without reintroducing the staleness bug.

### 1.1 Why this needs a spec and not just a quick endpoint

- It changes a documented constitutional rule (`docs/constitution.md` §"Caching Rules") — that document must be updated in the same change.
- It's a new unauthenticated-by-default surface (an HTTP endpoint the CMS calls) — needs the same shared-secret rigor already established for `/preview/home` (see [`preview-mode-live-cms-sync.md`](preview-mode-live-cms-sync.md) §4.4), not a fresh ad-hoc auth scheme.
- The CMS side (`swip-cms-front`) needs to know the contract (URL, payload shape, auth header) to call it — same cross-repo contract pattern as the preview feature.

---

## 2. Contract with the CMS editor

### 2.1 Trigger

`swip-cms-front` calls this webhook server-to-server (not from the browser) immediately after a successful publish/save of:
- A home block post (`parent__slug: "ecommerce-home"` or any of its children/container posts).
- A menu post (`parent__slug: "menu-principal"` or any of its children).
- A taxonomy record.

### 2.2 Request shape

```
POST https://<merchant-storefront>/api/revalidate
Content-Type: application/json
Authorization: Bearer <REVALIDATE_WEBHOOK_SECRET>

{
  "scope": "home" | "navbar" | "taxonomy",
  "slug": string | null   // required when scope is "taxonomy"; the taxonomy slug that changed
}
```

- `scope: "home"` → revalidates `home-blocks` and every `home-section-*` tag known to have been issued. See §3.1 for why "every" is non-trivial and the proposed resolution.
- `scope: "navbar"` → revalidates `navbar-collections`.
- `scope: "taxonomy"` → revalidates `taxonomy-${slug}` and `taxonomy-children-${slug}` for the given `slug`.

### 2.3 Response shape

```ts
// 200
{ "revalidated": true, "tags": string[] }

// 401 — missing/invalid Authorization header
{ "error": "Unauthorized" }

// 400 — malformed body (unknown scope, missing slug for scope "taxonomy")
{ "error": "Invalid request" }
```

---

## 3. Open design problem: per-slug home section tags aren't enumerable

`CachedSectionRenderer`'s tag is `home-section-${post.slug}` — one tag per CMS post, generated dynamically. `revalidateTag()` can only invalidate a tag it's given; there is no `revalidateTag("home-section-*")` wildcard in Next.js.

Two ways to resolve this (pick one — see §8 Q1):

**Option A — Drop the per-slug tag, revalidate the whole home in one shot.**
Remove `home-section-${post.slug}` from `CachedSectionRenderer` and rely solely on the outer `home-blocks` tag on `getHomeBlocks`. Since `HomePageComponent` calls `getHomeBlocks()` first and then renders `CachedSectionRenderer` per post, revalidating `home-blocks` alone won't bust the *inner* per-section cache — this only works if `CachedSectionRenderer`'s `"use cache"` boundary is removed entirely and section rendering is folded into the same cache scope as `getHomeBlocks` (i.e., `HomePageComponent` itself wraps everything in one `"use cache"` + `cacheTag("home-blocks")`, and per-section granularity is given up).

**Option B — Keep per-slug tags, have the webhook revalidate a known, fixed set.**
Since `getHomeBlocks` itself is tagged `home-blocks`, revalidating just that tag forces `getHomeBlocks` to refetch on the next request — but `CachedSectionRenderer` per-post entries would still serve stale content until *their own* tags expire, because Next's cache doesn't cascade invalidation from an outer boundary to inner ones it calls. The pragmatic fix: the webhook payload includes `slugs: string[]` (the specific posts that changed, which `swip-cms-front` already knows from its own save operation), and the endpoint calls `revalidateTag("home-blocks")` plus `revalidateTag(`home-section-${slug}`)` for each slug in the payload.

**Recommendation:** Option B, because it preserves per-section cache granularity (a banner edit doesn't force every other home section to refetch), at the cost of requiring `swip-cms-front` to send the specific slugs it changed rather than a bare `scope: "home"`. This changes §2.2's request shape — see §8 Q1 for the exact resolution needed before implementation.

---

## 4. Route implementation

### 4.1 File

```
src/app/api/revalidate/route.ts   # New. POST route handler.
```

### 4.2 Handler sketch

```ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_WEBHOOK_SECRET;
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!secret || !token || !safeEqual(token, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.scope !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tags: string[] = [];

  switch (body.scope) {
    case "home": {
      tags.push("home-blocks");
      const slugs: string[] = Array.isArray(body.slugs) ? body.slugs : [];
      for (const slug of slugs) tags.push(`home-section-${slug}`);
      break;
    }
    case "navbar":
      tags.push("navbar-collections");
      break;
    case "taxonomy": {
      if (typeof body.slug !== "string") {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
      tags.push(`taxonomy-${body.slug}`, `taxonomy-children-${body.slug}`);
      break;
    }
    default:
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  for (const tag of tags) revalidateTag(tag);

  return NextResponse.json({ revalidated: true, tags });
}
```

This follows the same auth pattern already used by `/api/preview/render-block` ([`route.tsx:10-15`](../../src/app/api/preview/render-block/route.tsx)) — a constant-time comparison against an env-var secret — but via a `Bearer` header instead of a cookie, since this is a server-to-server call with no browser/cookie context involved.

### 4.3 Why a new secret, not `PREVIEW_ACCESS_SECRET`

`PREVIEW_ACCESS_SECRET` gates browser access to `/preview/home` via a cookie exchange designed for iframe embedding (see [`preview-mode-live-cms-sync.md`](preview-mode-live-cms-sync.md) §4.4). This webhook is a distinct trust boundary — a server-to-server call, no cookie, no iframe — and reusing the same secret would couple two unrelated rotation schedules. Use a new `REVALIDATE_WEBHOOK_SECRET`.

---

## 5. Environment configuration

```env
# .env.local / deployment env
REVALIDATE_WEBHOOK_SECRET=<long random static value, shared with swip-cms-front's server-side webhook caller>
```

Read server-side only, inside the route handler — never exposed to the client bundle.

---

## 6. Files to create / modify

| File | Change |
|---|---|
| `src/app/api/revalidate/route.ts` | **New.** POST handler per §4.2. |
| `docs/constitution.md` | Update "Caching Rules" — remove "There is no on-demand revalidation endpoint," document the webhook and its secret. |
| `docs/architecture.md` | Update caching section to mention `revalidateTag()` is now actually invoked, by this webhook. |
| `.env.example` | Add `REVALIDATE_WEBHOOK_SECRET=`. |
| `src/components/layout/home/home-section-renderer.tsx` | If Option B (§3, recommended): no change beyond what's already shipped (`cacheTag` already added). If Option A: remove the per-slug tag and restructure caching as described. |
| `docs/features/cms-revalidation-webhook.md` | This document. |

---

## 7. Out of scope

- Reverting `cacheLife` back up to `hours`/`days` — that's a follow-up change made *after* this webhook is live and verified working end-to-end with `swip-cms-front`, not part of this spec.
- Retry/queueing if the webhook call fails on the CMS side (e.g. storefront temporarily down at publish time) — out of scope; the short `cacheLife("minutes")` fallback already shipped covers this gap by design.
- Revalidating catalog/country/channel caches in `cached.ts` (`getActiveChannelCached`, `getAvailableCountriesCached`, `getCatalogs`) — those aren't CMS post content and weren't part of the reported staleness complaint.
- Any change to the `/preview/home` route or `PREVIEW_ACCESS_SECRET` — unrelated trust boundary (§4.3).

---

## 8. Open questions (must resolve before implementation)

1. **Request shape for `scope: "home"`** (§3): does `swip-cms-front` know and want to send the specific `slugs` that changed on each publish, or does it only know "something under the home changed"? If the latter, Option A (collapse to one cache boundary, lose per-section granularity) is the only workable path, and `CachedSectionRenderer`'s per-slug `cacheTag` should be removed rather than shipped as dead code.
2. **Does `swip-cms-front` have (or want) a generic "on publish" hook it can wire this webhook into**, or does each block-type editor need its own explicit call? This determines whether `scope` needs to support multiple simultaneous scopes in one request (e.g. a container block edit touching both `home` and `taxonomy`).
3. **Retry/delivery guarantee expectations** — is a bare 200/401/400 response sufficient, or does the CMS need this to be idempotent/safe to retry (it already is, since `revalidateTag` is naturally idempotent, but worth confirming no additional dedup logic is expected).
4. **Should this endpoint also revalidate `taxonomy` for `getCatalogs`** (`cacheTag("collections")` in [`cached.ts:45`](../../src/lib/swipall/cached.ts)) if collections are managed through the same CMS surface as taxonomies, or are collections and taxonomies edited through entirely separate CMS flows?
