# Optifin website

Marketing site, feature pages, guides, free tools and documentation for
Optifin (`https://optifin.app`). Built with **Astro 7**, **Starlight**
(docs under `/docs`) and **GSAP**, deployed to **Cloudflare Pages**.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (Node 22.23+ / 24) |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built site locally |

## Structure

```
plan/                     Planning docs (brand, sitemap, SEO, screenshots...)
.claude/skills/           Project-only skills: astro, gsap, starlight, SEO/claims
public/                   favicon, og.png, robots.txt, _headers
src/data/site.ts          Single source of facts: features, coming soon, plans, FAQ
src/pages/                Marketing pages (home, features, pricing, tools, legal...)
src/content/docs/docs/    Documentation (Starlight) served at /docs
src/content/guides/       SEO guides served at /guides
src/components/           Header, Footer, Screen (screenshots), Icon, PageHero...
src/scripts/motion/       GSAP scenes (reduced-motion aware)
src/styles/               tokens.css (brand), global.css, motion.css, starlight.css
src/assets/screens/       App screenshots (synthetic demo data, 2x)
src/assets/brand/         Logo and icon (from the Optifin logo)
```

## Rules

- Only claim what the released V1 app does; everything else is "Coming soon"
  (`src/data/site.ts`). Prices must match the App Store listing.
- Screenshots come from the synthetic demo store and carry "Shown with sample
  data".
- See `.claude/skills/*/SKILL.md` for Astro 7, GSAP, Starlight and SEO rules.

## Deploy (Cloudflare Pages)

1. Push this folder to a Git repository.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Build command `npm run build`, output directory `dist`, Node version 24.
4. Add the custom domain `optifin.app`. Point `app.optifin.app` at the app
   server and update the app's `SHOPIFY_APP_URL` and redirect URLs.

## Before launch

- Confirm the App Store URL in `src/data/site.ts` (`appStoreUrl`).
- Have the privacy policy and terms reviewed (they are drafts based on the
  app's documented data handling).
- Verify prices against the final App Store listing.
- Submit `https://optifin.app/sitemap-index.xml` in Google Search Console.
