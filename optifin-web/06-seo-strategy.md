# 06. SEO Strategy

Honest goal: rank on the first page for the searches merchants actually make
about Shopify profit, and convert that traffic. No one can guarantee position
one; this plan gives the site every technical and content advantage.

Merchants find apps in two places. Plan for both.

## 1. Shopify App Store (often the bigger channel)

- **App name + subtitle:** include the main search terms naturally, e.g.
  "Optifin: Profit Analytics" with a subtitle like "True profit, costs and
  margins, with coverage you can trust". Follow listing character limits.
- **Search terms field:** profit, profit tracker, profit analytics, net profit,
  COGS, cost of goods, margin, P&L, profit and loss, LTV.
- **Screenshots and video:** the first two screenshots carry the message
  (dashboard with coverage badges; the revenue-to-profit breakdown).
- **Reviews:** ask satisfied beta merchants for honest reviews after they reach
  trusted profit (in-app prompt after a success moment, never incentivised).
- **Built for Shopify badge:** meeting its performance and design requirements
  improves App Store ranking and trust.

## 2. Google

### Technical (built in from day one)
- Static HTML for every page (Astro); Core Web Vitals green (LCP < 2.5 s,
  CLS < 0.1, INP < 200 ms).
- Unique `<title>` (≤ 60 chars) and meta description (≤ 155 chars) per page.
- Canonical URLs, `sitemap.xml` (`@astrojs/sitemap`), `robots.txt`.
- Structured data (JSON-LD): `Organization`, `WebSite` with `SearchAction`,
  `SoftwareApplication` (name, category "BusinessApplication", offers from the
  pricing page, operatingSystem "Shopify"), `FAQPage` on FAQ blocks,
  `BreadcrumbList`, `Article` on guides, `HowTo` on step-by-step docs.
- Open Graph and Twitter cards with a designed image per page (generated at
  build).
- Image SEO: descriptive file names, alt text, AVIF/WebP, lazy loading below
  the fold.
- Clean URLs, internal links between features, docs and guides.
- Google Search Console and Bing Webmaster Tools verified; sitemap submitted.

### Keyword targets (start here, validate with Search Console data)

| Intent | Example searches | Page |
|---|---|---|
| Product | shopify profit tracker, shopify profit analytics app, shopify net profit app | `/`, `/features` |
| Problem | how to calculate profit on shopify, shopify profit margin, shopify cogs tracking | `/guides/...` |
| Concepts | break-even roas, poas vs roas, contribution margin ecommerce, mer marketing efficiency ratio | `/guides/...`, glossary |
| Tools | shopify profit margin calculator, break-even roas calculator | `/tools/...` |
| Comparison | trueprofit alternative, beprofit alternative, lifetimely alternative | `/compare/...` |
| Feature | shopify p&l report, shopify customer lifetime value | `/features/...` |

### Content plan (first 12 weeks, one piece a week)
1. How to calculate true profit on Shopify (pillar guide).
2. Shopify profit margin calculator (tool) + guide.
3. Break-even ROAS: what it is and how to calculate it (tool + guide).
4. POAS vs ROAS for Shopify stores.
5. How to track COGS in Shopify (and keep it accurate over time).
6. Contribution margin for e-commerce, explained.
7. Why your Shopify profit numbers don't match (fees, refunds, timezones).
8. Shopify P&L: building a monthly profit and loss.
9. Customer lifetime value for Shopify stores.
10. Payment processing fees on Shopify: what they really cost.
11. Comparison pages (one per competitor), factual and dated.
12. Glossary hub linking every metric definition.

Each guide: original examples, a screenshot or calculator, a clear "try it in
Optifin" link, internal links to two related guides.

### Comparison pages (rules)
- Facts only, each with a source link and "checked on <date>".
- Strengths of the other app stated fairly; our difference is coverage and
  trust, shown with screenshots.
- Re-check every quarter.

### Authority (links)
- Free calculators are the main link magnets.
- Listings: Shopify App Store, Product Hunt launch, relevant e-commerce
  directories.
- Guest guides on e-commerce blogs; partner agencies' resource pages.

## Measurement

- Cloudflare Web Analytics (free, cookie-free) for traffic.
- Google Search Console for queries, positions and clicks.
- Track installs from the website with a UTM on every App Store link
  (`?utm_source=optifin.app&utm_medium=website&utm_campaign=<page>`).
- Monthly review: top queries, pages gaining or losing, new content ideas.
