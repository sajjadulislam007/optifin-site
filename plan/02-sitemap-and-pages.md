# 02. Sitemap and Pages

## Domains

- `optifin.app` → this website (Cloudflare Pages)
- `app.optifin.app` → the Shopify app (embedded in the Shopify admin)
- `docs` live under `optifin.app/docs` (same site, better for SEO than a
  subdomain)

## Pages

| URL | Page | Purpose | Primary action |
|---|---|---|---|
| `/` | Landing | Explain the value in seconds, show the product | Install on Shopify |
| `/features` | Features overview | Every current feature, grouped by question | Install |
| `/features/profit-dashboard` | Profit dashboard | Net profit, coverage, briefing, trend | Install |
| `/features/costs` | Costs | Product costs, shipping, fees, custom costs | Install |
| `/features/orders-and-products` | Orders and products | Order and product profitability | Install |
| `/features/customers` | Customers | LTV, cohorts, segments, CAC | Install |
| `/features/reports` | Reports | P&L, custom reports, exports | Install |
| `/features/action-center` | Action Center | Problems turned into a to-do list | Install |
| `/features/simulator` | Profit simulator | Price, cost and ad-spend what-ifs | Install |
| `/coming-soon` | Coming soon | Roadmap after V1, clearly labelled | Get notified (email) |
| `/pricing` | Pricing | Starter / Growth / Scale, identical to the listing | Install |
| `/docs` | Documentation home | Getting started and every guide | Read |
| `/guides` | Learn (blog) | SEO articles on Shopify profit | Read, then Install |
| `/tools/profit-margin-calculator` | Free tool | SEO and links | Use, then Install |
| `/tools/break-even-roas-calculator` | Free tool | SEO and links | Use, then Install |
| `/compare` | Comparisons | Factual comparisons with sources and dates | Install |
| `/security` | Security and data | What data we read, how it is protected | Read |
| `/privacy` | Privacy policy | Required by the App Store | — |
| `/terms` | Terms of service | Required by the App Store | — |
| `/support` | Support | Contact, response times, help links | Email support |
| `/changelog` | Changelog | What shipped and when | — |
| `/404` | Not found | Friendly, links home and docs | Home |

"Install on Shopify" always links to the Shopify App Store listing, never to a
shop-domain form (App Store rule: installs start from a Shopify surface).

## Navigation

- **Header:** Features (mega menu), Pricing, Docs, Coming soon, Learn; button
  "Install on Shopify".
- **Footer:** Product (features, pricing, changelog, coming soon), Resources
  (docs, guides, calculators, compare), Company (security, privacy, terms,
  support), contact email.

## Global elements

- Sticky header that shrinks on scroll.
- One consistent call to action: "Install on Shopify" plus a secondary "See how
  it works" (scrolls to the product tour).
- Breadcrumbs on feature, docs and guide pages (also structured data).
