# CMS Live Preview

## Overview

The CMS live preview renders home page blocks (banners, categories, product
carousels, etc.) inside an iframe so editors can see changes before
publishing. It is a **separate, parallel rendering path** from the real home
page — not a wrapper around it.

```
src/app/api/preview/render-block/route.tsx                     # POST route handler
src/components/layout/home/preview/preview-section-renderer.tsx # block renderer used only by preview
src/components/layout/home/preview/preview-home-client.tsx      # iframe-side client logic
src/components/layout/home/preview/serialized-block-adapter.ts  # CMS payload → CmsPost adapter
```

## Why preview can't reuse the home components directly

The route handler renders blocks with `renderToReadableStream` from
`react-dom/server.edge` — React's raw server renderer, invoked **outside**
Next's own request pipeline (no RSC client manifest, no `next/image` loader
context, no `"use cache"` context).

Because of that, `preview-section-renderer.tsx` cannot use:

- `next/image` or `next/link` (needs Next's request-scoped module wiring)
- Any `"use client"` component (carousels, hooks, etc. — needs the client
  manifest Next generates during its own build/render)
- Any `"use cache"` boundary

Instead it renders plain, static HTML equivalents (`<img>`, `<a>`) that
approximate what the real component looks like — e.g. the banner slider
preview shows only the first slide, since there's no carousel JS running.

## The mirror rule

**If you add, remove, or visually change a home block component under
`src/components/layout/home/sections/`, update its counterpart in
`preview-section-renderer.tsx` in the same change.**

Preview exists to show editors an accurate approximation of the real home
page. If the two drift, the preview lies to whoever is using the CMS. Treat
`preview-section-renderer.tsx` as a required companion diff whenever you
touch:

- A block's markup/props in `src/components/layout/home/sections/*`
- `getHomeBlockType` / `HOME_BLOCK_TYPES` in `home-section-types.ts` (adding
  a new block type means adding a new `case` in the preview renderer too)
- The shape of a block's JSON `body` (parsed via `parsePostBody`)

You don't need pixel-perfect parity (no carousel autoplay, no client-side
interactivity), but the static layout, spacing, and content shown must match
what a shopper would actually see.
