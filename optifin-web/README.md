# Optifin Website: Planning Docs

This folder is the complete plan for the Optifin marketing website, feature
pages and documentation. It is self-contained: move it anywhere, and use it as
the brief to build the site.

- **Website:** `https://optifin.app` (this project)
- **Shopify app:** `https://app.optifin.app` (the existing app; moves from the
  root domain to this subdomain at deploy)
- **Stack:** Astro + Starlight (docs) + GSAP (animation), hosted on
  Cloudflare Pages. All free; only the domain renewal costs money.

## Files

| File | What it covers |
|---|---|
| [01-brand-and-messaging.md](01-brand-and-messaging.md) | Positioning, audience, voice, key messages, claims rules |
| [02-sitemap-and-pages.md](02-sitemap-and-pages.md) | Every page, URL and purpose |
| [03-landing-page.md](03-landing-page.md) | The landing page, section by section, with GSAP motion |
| [04-features.md](04-features.md) | Current V1 features and the Coming soon list |
| [05-docs-content.md](05-docs-content.md) | The documentation site: every guide to write |
| [06-seo-strategy.md](06-seo-strategy.md) | Technical SEO, content, App Store listing, measurement |
| [07-screenshots-plan.md](07-screenshots-plan.md) | Which app screens to capture and how |
| [08-tech-stack-and-build.md](08-tech-stack-and-build.md) | Project structure, tools, build and deploy |
| [09-design-system.md](09-design-system.md) | Colours, type, layout, components, motion rules |
| [10-launch-checklist.md](10-launch-checklist.md) | Everything to finish before and after launch |

## Build order

1. Confirm messaging and the feature list (01, 04). These decide all copy.
2. Capture screenshots from the app with the synthetic demo data (07).
3. Scaffold Astro + Starlight, design tokens and layout (08, 09).
4. Build the landing page and feature pages (02, 03).
5. Write the docs (05) and the SEO content (06).
6. Launch checklist (10), then point `optifin.app` at Cloudflare Pages.

## Non-negotiable rules

- Every claim on the site must be true for the released V1 app. Features that
  are built but switched off for V1 are shown only as **Coming soon**.
- No "best", "#1", "first" or "only" claims, no invented statistics, no fake
  testimonials. Shopify's App Store rules forbid them and they cost trust.
- No competitor named in a negative way without evidence. Comparison pages
  state facts with sources and a "checked on" date.
- Prices on the site must match the Shopify App Store listing exactly.
