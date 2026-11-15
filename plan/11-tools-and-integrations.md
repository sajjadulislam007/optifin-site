# 11. Free calculators and integration pages

Researched and built on 2026-11-14.

## Competitor research

I fetched competitors' first-party pages on 2026-11-14. triplewhale.com refused every fetch, so its details are unverified.

**Calculators**
- Profit margin is the most common calculator: TrueProfit, Lifetimely, BeProfit, Shopify and Polar all have one.
- Pricing/markup (4 competitors), discount break-even (3) and ROAS (3) come next.
- Contribution margin and LTV:CAC each appear at one competitor (Lifetimely).
- No competitor has a standalone POAS calculator, a MER calculator or a CAC payback calculator.
- None of them requires an email to see results.

**Integration pages**
- Polar (/integrations/meta-ads and similar) and Conjura (/integration/…) have the strongest dedicated pages. Each lists the data pulled, setup steps with timings and the metrics unlocked.
- None of them has an FAQ.
- Polar uses figures it labels illustrative.
- Lifetimely, TrueProfit, BeProfit, Peel and Northbeam show logo grids with few or no dedicated pages.

## What we built

**`/tools/`: 8 ungated calculators.** Each page shows its formula, a worked example, what the calculator leaves out, and an FAQ with FAQPage schema.

New:
- contribution margin
- price/markup/margin
- discount break-even
- POAS + MER
- LTV:CAC + payback
- Shopify fees

Existing:
- profit margin
- break-even ROAS

Implementation:
- Data: `src/data/tools.ts`.
- Field component: `CalcField.astro`.
- Helpers: `src/scripts/calc.ts`.
- QA: on 2026-11-14 every page's default output matched the worked example in its copy.

**`/integrations/`: Shopify (Available), plus Meta Ads, Google Ads and TikTok Ads (In certification).**

Data: `src/data/integrations.ts`.

Each page lists:
- the exact data read and not read;
- the permission requested;
- the setup steps;
- the metrics it unlocks;
- sync and currency handling;
- limitations;
- an FAQ.

## Claim rules

- **Ad connections.** `optifin/docs/modules/CURRENT_PRODUCT_BOUNDARIES.md` forbids marketing them as available until live validation passes. Their pages therefore say "In certification", the CTA is "Ask about early access" (an email), and there are no install CTAs promising ad data. Change the status to `live` only after certification sign-off and `PUBLIC_FEATURES` ON.
- **Integration facts.** They come from `docs/modules/15-advertising-integrations.md` and `app/services/integrations/*`. Re-check them when the provider clients change.
- **Shopify fees calculator.** Plan prices and third-party fees (2% / 1% / 0.6%) are the US monthly figures on shopify.com/pricing as of 2026-11-14. Card rates are not published there and vary by country, so the card fields are labelled as example values. Re-check the plan prices before each release.
- **Planned list.** The "Planned" section on /integrations/ lists only items already on the Coming soon page.
