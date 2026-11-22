# Optifin website instructions

This repository is the marketing site and docs only (`optifin.app`). The Shopify
app lives in a separate repository at `../optifin` (`app.optifin.app`). Keep them
separate: everything about the site (code, docs, deployment, Jenkins job) stays in
this repository; never write site files into the app repository, and never put app
code here. The app repository is a read-only source of truth for this site.

## Keep the site in step with the app

Whenever the site is updated, first check what the released app really does, then
change the site to match. Do not describe anything the app does not do.

1. Read the app's source of truth in `../optifin`:
   - `docs/modules/README.md`, `docs/modules/CURRENT_PRODUCT_BOUNDARIES.md` and the
     relevant module document (what each feature does and its limits);
   - `docs/modules/REMAINING_WORK.md` (what is not finished);
   - `app/utils/planCatalog.js` (plans, prices, order limits);
   - recent changes: `git -C ../optifin log --oneline -30`.
2. Compare with `src/data/site.ts` (the single source of facts: features, coming
   soon, plans, FAQ), the pages in `src/pages/` and the docs in `src/content/docs/`.
3. Update the site: move features between "live" and "Coming soon" only when the app
   ships or removes them, match prices to `planCatalog.js`, update the docs pages
   and the changelog, and refresh screenshots when the app UI changed.
4. Follow `.claude/skills/optifin-seo-and-claims/SKILL.md` for claims and SEO.
5. Tell the user which app facts the change is based on.

## Deployment

Two environments built by Jenkins job `optifin-site` on the Contabo server:
development (`https://dev.optifin.app`) and live (`https://optifin.app`, main only).
Everything is in `ops/` (see `ops/README.md`). Check changes on development first.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
