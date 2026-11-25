---
name: astro
description: Astro 7 rules for the Optifin website (pages, layouts, components, scripts, images, content collections, sitemap). Use for any change under src/ in this project.
---

# Astro 7 for optifin-site

Installed: astro 7.4.x, Node >= 22.23.4 (local Node 24). Static output is the
default (`output: 'static'`; `'hybrid'` throws). Verified November 14, 2026
from the installed package and docs.astro.build.

## Pages and routing
- Marketing pages live in `src/pages/*.astro`; they take priority over
  Starlight's injected `[...slug]` route. Never create
  `src/content/docs/index.md(x)` (that would claim `/`).
- Custom 404 is `src/pages/404.astro` with `disable404Route: true` in the
  Starlight config.
- `src/fetch.ts` is reserved in Astro 7; do not create it.

## Markup rules that changed in Astro 6/7
- The Rust compiler rejects unclosed tags and does NOT auto-fix invalid HTML
  (no `<div>` inside `<p>`, no block elements inside `<a>` unless valid).
- `compressHTML` defaults to `'jsx'`: whitespace between inline elements is
  removed. Write `{" "}` between adjacent inline elements
  (`<strong>a</strong>{" "}<em>b</em>`), especially inside headings that
  SplitText animates.
- `<script>` and `<style>` render in source order.

## Scripts
- A plain `<script>` (no attributes) is bundled as a module, deduplicated per
  page, and can `import` npm packages (gsap). Adding any attribute or
  `is:inline` disables processing.
- Module scripts are deferred, so the DOM is ready; call init directly. The
  site does not use `ClientRouter`, so `astro:page-load` is not needed.

## Images
- Use `astro:assets` `<Image>` / `<Picture>` for every raster image.
  `<Picture formats={['avif','webp']} />` for screenshots; always pass
  `alt`, `widths`, and `sizes`. Setting both `width` and `height` crops.
- Images are never upscaled; source screenshots are captured at 2x.

## Content
- Collections are defined in `src/content.config.ts` with loaders. Docs use
  Starlight's `docsLoader()`/`docsSchema()`. Guides use
  `glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' })`.
- Use `getCollection`, `getEntry`, `render(entry)` from `astro:content`;
  entries use `id` (no `slug`). Zod comes from `astro/zod`.

## SEO plumbing
- `site: 'https://www.optifin.app'` in `astro.config.mjs` (www is the main address) (required for sitemap
  and canonical URLs). Starlight adds `@astrojs/sitemap` automatically.
- Every page sets a unique title and description through the shared
  `BaseLayout` props, plus JSON-LD where applicable.

## Checks before finishing
- `npm run build` must pass with no warnings about invalid HTML.
- Preview with `npm run preview` and verify pages at 360, 768 and 1440 px.
