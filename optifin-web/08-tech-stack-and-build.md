# 08. Tech Stack and Build

## Stack (all free)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro** (latest stable) | Static HTML by default: fastest pages and best SEO |
| Docs | **Starlight** (Astro docs theme) | Sidebar, search (Pagefind), dark mode, i18n-ready |
| Animation | **GSAP** + ScrollTrigger, SplitText, Flip | Free for commercial use; smooth, precise scroll scenes |
| Interactive islands | React (only where needed: calculators, pricing toggle) | Small, hydrated on demand |
| Styling | Plain CSS with design tokens (CSS custom properties) | No framework lock-in; tiny CSS |
| Content | Markdown/MDX in content collections | Guides, docs and changelog as files |
| Images | `astro:assets` (AVIF/WebP, responsive sizes) | Fast, no layout shift |
| SEO | `@astrojs/sitemap`, JSON-LD components, OG image generation | Built in at build time |
| Hosting | **Cloudflare Pages** | Free, global CDN, HTTPS, preview per branch |
| Analytics | Cloudflare Web Analytics | Free, no cookies |
| Forms (Coming soon email) | Cloudflare Pages Function + an email list provider's free tier | No server to run |

## Project structure

```
optifin-website/
  astro.config.mjs        # site: https://optifin.app, integrations
  public/                 # robots.txt, favicons, og defaults
  src/
    assets/screens/       # app screenshots (07)
    components/           # Header, Footer, Hero, Bento, TourRail, FAQ, PlanCard...
    components/motion/    # GSAP setups (one file per scene), reduced-motion aware
    layouts/              # Base, Feature, Guide
    pages/                # index, features/*, pricing, coming-soon, tools/*, compare/*, legal
    content/
      docs/               # Starlight docs (05)
      guides/             # SEO articles (06)
      changelog/
    styles/tokens.css     # design tokens (09)
```

## Animation rules

- GSAP is loaded after first paint; scenes register on `astro:page-load`.
- `gsap.matchMedia()` for desktop vs mobile scenes and
  `(prefers-reduced-motion: reduce)` (show final states, no scrubbing).
- Animate only `transform` and `opacity` (and `clip-path` sparingly).
- Kill ScrollTriggers on navigation; no layout thrash.

## Build and deploy

- Node LTS; `npm create astro@latest`, add Starlight.
- Git repository → Cloudflare Pages: build `npm run build`, output `dist/`.
- Every branch gets a preview URL; `main` deploys to `optifin.app`.
- DNS (Cloudflare): `optifin.app` → Pages; `app.optifin.app` → the app server
  (set when the app is deployed). Update the app's `SHOPIFY_APP_URL`, redirect
  URLs and listing URLs to `app.optifin.app` at that time.

## Quality gates

- Lighthouse 95+ on Performance, Accessibility, Best Practices and SEO for the
  landing page and one docs page.
- No horizontal scroll at 360 px; keyboard reachable; visible focus.
- All links checked at build (link checker in CI).
