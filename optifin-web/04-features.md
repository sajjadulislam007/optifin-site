# 04. Features: Current and Coming Soon

Source of truth: the V1 release catalogue (`PUBLIC_FEATURES`) and
`docs/modules/CURRENT_PRODUCT_BOUNDARIES.md`. Re-check both before publishing;
anything switched off at release moves to Coming soon.

## Available in V1

### Profit dashboard
- Net profit, revenue, margin, orders, AOV and contribution profit at a glance.
- Coverage on every number ("Costs 93% covered", "Partial"); missing inputs are
  never shown as $0.
- Period comparison (previous period, month, year, custom), held back when the
  data would mislead.
- Executive briefing: the biggest changes for the period in plain language.
- Performance trend chart with up to four metrics.
- Saved dashboard views with revision history, templates, targets with pacing,
  custom formula metrics, reorder and customize.
- Export (CSV, Excel, PDF where the plan allows).

### Costs
- Product costs with effective dates, supplier details and CSV import.
- Shipping costs, payment fees and custom costs (one-off or recurring,
  operating or per-order, conditional rules).
- Coverage of every cost type, and what changes when a cost is edited.

### Orders and products
- Profit for every order, with the full breakdown.
- Product profitability, margins, missing-cost flags and comparisons.
- Bought together and customer product journeys.
- Reconciliation against Shopify's own figures.

### Customers
- Customer lifetime value (revenue and contribution), CAC, retention curves and
  cohorts.
- RFM-style customer segments, with custom rules and exports.

### Discounts and returns
- Discount and promotion profitability.
- Returns and refund profitability.

### Marketing (with Shopify data in V1)
- Attribution views and UTM analysis from Shopify data. Ad platform
  connections are Coming soon.

### Reports
- Profit and Loss report.
- Custom report builder with templates and exports (by plan).

### Planning and simulator
- Profit simulator: test price, cost and ad-spend changes before making them.
- Profit planning with monthly or quarterly plans and actual-versus-plan.

### Action Center and status
- Problems turned into cases with clear next steps (missing costs, unusual
  changes), plus a Status page for data freshness and sync health.

### Settings
- Accounting policies, currency handling, readiness checklist, billing.

## Coming soon (after V1)

Show these with a "Coming soon" label only. No dates unless confirmed.

| Feature | One-line description |
|---|---|
| **Daily profit email and Slack message** | Yesterday's profit, sales and biggest change, every morning. |
| **Today vs yesterday glance** | A quick strip at the top of the dashboard for the current day. |
| **Click any number to see what is behind it** | Open the orders or products behind a dashboard figure. |
| **Custom-metric builder upgrades** | Set whether higher is better or worse, and insert metrics into formulas. |
| **Smart alerts** | Notifications when profit, refunds or costs move unusually. |
| **Scheduled reports and Google Sheets sync** | Reports delivered by email or into a spreadsheet on a schedule. |
| **Ad platform connections** | Meta, Google and TikTok ad spend imported and reconciled to profit. |
| **More cost sources** | Payment processors, shipping and fulfilment apps feeding costs automatically. |
| **Klaviyo audiences** | Send profitable customer segments to Klaviyo. |
| **Post-purchase surveys** | "How did you hear about us?" attribution. |
| **Product conversion funnel** | View-to-purchase economics per product. |

## Plans (must match the App Store listing exactly)

| Plan | Price | Notes |
|---|---|---|
| Starter | Free | 100 eligible orders per billing cycle, 90 days of history |
| Growth | $19.99 / month base | 500 orders included, $0.02 per extra order (to 2,000), max $49.99 |
| Scale | $49.99 / month base | 2,000 orders included, $0.01 per extra order (to 10,000), max $129.99 |

Values from `app/utils/planCatalog.js` on November 14, 2026. Plan feature
lines must exclude V1-disabled items (see 01, Claims rules).
