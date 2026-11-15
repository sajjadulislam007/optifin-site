# 10. Launch Checklist

## Content and claims
- [ ] Every feature claim checked against the released V1 app (04).
- [ ] Coming-soon items clearly labelled; none described as available.
- [ ] Prices and plan limits identical to the Shopify App Store listing.
- [ ] In-app plan text (`app/data/pricing.js`) corrected to match V1, so app,
      listing and website agree.
- [ ] No "best", "#1", "only", invented statistics or unapproved testimonials.
- [ ] Privacy policy, terms and support pages published and linked in the
      footer and from the app.
- [ ] Security / data page reviewed against what the app actually reads.

## Technical
- [ ] Lighthouse 95+ (Performance, Accessibility, Best Practices, SEO) on the
      landing page, one feature page and one docs page.
- [ ] Reduced-motion and keyboard checks on every animated section.
- [ ] 360 px mobile: no horizontal scroll; tour falls back to a list.
- [ ] All links valid (build-time link check); 404 page works.
- [ ] Sitemap, robots.txt, canonical tags, JSON-LD validated (Rich Results
      Test).
- [ ] Open Graph images render (LinkedIn, X, Slack previews).

## Domains and app
- [ ] `optifin.app` served by Cloudflare Pages with HTTPS.
- [ ] `app.optifin.app` pointing at the app server.
- [ ] App settings updated: `SHOPIFY_APP_URL`, auth redirect URLs, privacy
      policy URL, support URL in the Shopify Partner/Dev Dashboard.
- [ ] Every "Install on Shopify" link goes to the App Store listing with UTM.

## Measurement
- [ ] Cloudflare Web Analytics on.
- [ ] Google Search Console and Bing verified; sitemap submitted.
- [ ] Coming-soon email form works and stores consent.

## After launch
- [ ] Weekly guide (06 content plan) for 12 weeks.
- [ ] Monthly Search Console review.
- [ ] Quarterly re-check of comparison pages and the Coming soon list.
- [ ] Update screenshots whenever the dashboard changes.
