# 09. Design System

Modern, calm, precise: a finance product that feels trustworthy, with motion
used to explain, not decorate.

## Layout

- Max content width 1200 px; generous whitespace; 12-column grid used for
  **asymmetric** compositions (bento grids, offset images, pinned scenes)
  instead of 50/50 columns.
- Section rhythm: 120–160 px vertical spacing on desktop, 72–96 px on mobile.
- Mobile first; every section has a designed mobile layout (not just stacked).

## Colour (tokens)

| Token | Use |
|---|---|
| `--ink` #0B1220 | Headlines, primary text |
| `--ink-soft` #4A5568 | Body text |
| `--surface` #FFFFFF / `--surface-2` #F5F7FA | Backgrounds |
| `--brand-400…600` #2DD4BF → #3B82F6 → #2563EB | Teal → blue brand gradient from the logo: primary actions, highlights |
| `--navy-900` #071529 | Brand navy from the logo: dark sections, hero |
| `--profit` #0F9F6E | Profit, success ticks |
| `--accent` #F5B544 | "Partial / coverage" badges (matches the app's amber) |
| `--critical` #D64545 | Losses, errors |
| `--line` #E3E8EF | Borders, dividers |

Dark sections use `--ink` backgrounds with `--brand-glow` accents. All text
meets WCAG AA (4.5:1). Colours come from the Optifin logo (teal → blue gradient and navy), implemented in
`src/styles/tokens.css`.

## Typography

- Logo: `src/assets/brand/logo.svg` (ring + rising bars icon, Audiowide wordmark converted to paths; "OPTI" uses currentColor, "FIN" and icon use the gradient). Variants in `public/brand/`, favicon `public/favicon.svg`.
- Headings: Outfit (geometric, pairs with the wide logo wordmark), tight
  tracking, large scale (hero 64–88 px desktop).
- Body: "Inter" 17–18 px, line height 1.6.
- Numbers: tabular figures for every metric.
- Self-host fonts (Fontsource) with `font-display: swap`.

## Components

- Buttons: primary (filled brand), secondary (outline), text link with arrow.
- Cards: 16 px radius, 1 px `--line` border, soft shadow on hover.
- Badges: "Coming soon" (neutral), "Partial" / "93% covered" (amber), "New".
- Screenshot frame: minimal admin-style frame, 12 px radius, layered shadow.
- Bento tiles, tour rail, FAQ accordion, plan cards, calculator inputs.

## Motion

- Durations 0.4–0.9 s; ease `power3.out` for entrances, `none` for scrub.
- One idea per scene; no looping distractions near text.
- Reduced motion: no scrub, no parallax, instant final state.

## Imagery

- Real product screenshots (07) as the main visual.
- Abstract gradient meshes behind screenshots; no stock photos of people.
- Icons: one line-icon set (e.g. Lucide), 1.5 px stroke.
