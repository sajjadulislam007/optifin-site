---
name: optifin-seo-and-claims
description: SEO and truthful-claims rules for every Optifin page, guide and docs entry (titles, descriptions, JSON-LD, keywords, App Store links, what may and may not be claimed). Use when writing or editing any page copy.
---

# SEO and claims for optifin-site

Planning source: `plan/06-seo-strategy.md` and `plan/01-brand-and-messaging.md`.

## Every page
- Unique `<title>` (<= 60 chars) and meta description (<= 155 chars) via
  `BaseLayout` props; one `<h1>`; logical heading order.
- Canonical URL from `Astro.site`; Open Graph image (default `/og.png`).
- JSON-LD: `Organization` + `WebSite` sitewide; `SoftwareApplication` on the
  landing and pricing pages (offers must equal the App Store prices);
  `FAQPage` where an FAQ is shown; `BreadcrumbList` on nested pages;
  `Article` on guides.
- Images: descriptive file names and alt text.
- Internal links: every feature page links to its docs page and one guide.
- "Install on Shopify" links go to the App Store listing with
  `?utm_source=optifin.app&utm_medium=website&utm_campaign=<page>`, never to
  a shop-domain form.

## Claims
- Only what the released V1 app does. Built-but-disabled features are labelled
  "Coming soon": daily profit email/Slack, today vs yesterday glance,
  click-through to orders/products, custom-metric upgrades, alerts, scheduled
  reports and Google Sheets, ad platform connections, more cost sources,
  Klaviyo, post-purchase surveys, product funnel.
- No "best", "#1", "first", "only", "most accurate", invented statistics, or
  testimonials without written permission. No AI claims.
- Prices: Starter free (100 eligible orders), Growth $19.99/month base
  (500 orders, $0.02/extra to 2,000, max $49.99), Scale $49.99/month base
  (2,000 orders, $0.01/extra to 10,000, max $129.99). Re-check against
  `optifin/app/utils/planCatalog.js` and the listing before publishing.
- App screenshots come from synthetic demo data and carry the caption
  "Shown with sample data".
- Comparison content: facts with a source link and "checked on <date>".
