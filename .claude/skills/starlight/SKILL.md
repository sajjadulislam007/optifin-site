---
name: starlight
description: Starlight 0.43 rules for the Optifin docs under /docs (content location, sidebar, theming, overrides). Use when adding or editing documentation pages or the docs configuration.
---

# Starlight docs on optifin-site

- Docs live in `src/content/docs/docs/**` so they are served at `/docs/...`.
  `src/content/docs/docs/index.mdx` is the docs home (`/docs/`).
- The site root and marketing pages are plain Astro pages; Starlight must not
  own `/`.
- Sidebar groups must use `items`; since 0.39 `{ label, autogenerate }` on a
  single object throws. Use `{ label, items: [{ autogenerate: { directory: 'docs/guides' } }] }`.
- `social` is an array of `{ icon, label, href }`.
- Theme: `customCss: ['./src/styles/tokens.css', './src/styles/starlight.css']`.
  Starlight's `:root` is the dark theme and `:root[data-theme='light']` the
  light theme; set `--sl-color-accent-low/--sl-color-accent/--sl-color-accent-high`
  for both (they are reversed between themes) and `--sl-font`.
- Starlight styles are in `@layer starlight`; unlayered CSS overrides them.
- Each docs page frontmatter: `title`, `description` (unique, for SEO),
  optional `sidebar.order`. Use task-first titles ("Add product costs").
- Only document features that are available in the released V1 app. Coming
  soon features go on the single `docs/coming-soon` page.
- Screenshots in docs: import from `src/assets/screens` and use `<Image>`
  with descriptive alt text.
