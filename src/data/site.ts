// Single source for site-wide facts. Every claim here must be true for the
// released V1 app (see plan/04-features.md). Prices mirror
// optifin/app/utils/planCatalog.js and must match the App Store listing.

export const SITE = {
  name: "Optifin",
  url: "https://optifin.app",
  appUrl: "https://app.optifin.app",
  // TODO(before launch): confirm the final App Store handle.
  appStoreUrl: "https://apps.shopify.com/optifin",
  supportEmail: "support@optifin.app",
  tagline: "Your true Shopify profit, with nothing hidden.",
  description:
    "Optifin shows your real Shopify profit after product costs, fees, shipping, ads and operating costs, and tells you exactly how complete every number is.",
};

/** App Store link with campaign tracking for the page it is used on. */
export function installUrl(campaign: string) {
  const params = new URLSearchParams({
    utm_source: "optifin.app",
    utm_medium: "website",
    utm_campaign: campaign,
  });
  return `${SITE.appStoreUrl}?${params}`;
}

// Header navigation lives in components/Header.astro and data/nav.ts.

export type Feature = {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  summary: string;
  screen: string;
  points: { title: string; body: string }[];
  docs: string;
  seoTitle: string;
  // Launch items this feature depends on; hidden until they are live.
  launch?: LaunchKey[];
  seoDescription: string;
};

// V1 launch scope (owner decision 2026-11-15, optifin V1 checklist "V1 Launch
// Scope Decision"). Each item is live only after its release gate passes. If
// one misses go/no-go, set it to false: it then leaves the feature pages and
// returns to Coming soon everywhere on the site.
//
// Production state 2026-11-15 (app.optifin.app first deploy): Meta Ads and
// Google Ads wait for platform approval (the app keeps them off until
// certified); Google Sheets waits for its production OAuth app. Slack was
// removed from V1 (owner decision 2026-11-16: no merchant demand).
export const LAUNCH = {
  metaAds: false,
  googleAds: false,
  // Parked 2026-11-15 (no merchant demand); not shown anywhere on the site.
  productFunnel: false,
  surveys: false,
  alerts: true,
  reportDelivery: true, // profit digest email and scheduled email reports
  googleSheets: false, // Google Sheets sync
} as const;
export type LaunchKey = keyof typeof LAUNCH;
export const launched = (keys: LaunchKey[] = []) => keys.every((k) => LAUNCH[k]);
const when = <T,>(keys: LaunchKey[], items: T[]): T[] => (launched(keys) ? items : []);

const ALL_FEATURES: Feature[] = [
  {
    slug: "profit-dashboard",
    name: "Profit dashboard",
    eyebrow: "Dashboard",
    title: "Net profit first. Every number shows how complete it is.",
    summary:
      "See net profit, revenue, margin, orders and contribution profit for any period, with coverage on every card and comparisons that pause when they would mislead.",
    screen: "dashboard-key-performance",
    points: [
      { title: "Coverage on every card", body: "Notes such as “Based on 93% of product costs” show when a number rests on incomplete inputs. Missing costs are never shown as $0." },
      { title: "Honest comparisons", body: "Compare with the previous period, month or year. When the data would mislead, the change pauses and the card says why." },
      { title: "Today so far", body: "Revenue, orders, AOV and gross profit for today, compared with yesterday up to the same time, so half a day is never set against a whole one." },
      { title: "Click any number", body: "Open the orders or products behind any card, on the same dates, sorted by what drives the figure." },
      { title: "Executive briefing", body: "The biggest changes for the period in plain language, next to the actions that need a decision." },
      { title: "Performance trend", body: "Chart up to four metrics together, daily, weekly or monthly, with partial data clearly marked." },
      { title: "Make it yours", body: "Saved views with revision history, templates, custom formula metrics and targets with pacing." },
      { title: "Export", body: "Download the dashboard as CSV, Excel or PDF, depending on your plan." },
    ],
    docs: "/docs/dashboard/overview/",
    seoTitle: "Shopify Profit Dashboard with Cost Coverage | Optifin",
    seoDescription:
      "A Shopify profit dashboard that shows net profit, margin and contribution profit, with coverage on every number so missing costs are never hidden.",
  },
  {
    slug: "costs",
    name: "Costs",
    eyebrow: "Costs",
    title: "Every cost in one place, with nothing silently missing.",
    summary:
      "Product costs with effective dates, shipping, payment fees and your own operating costs. Optifin shows how much of each is covered and what changes when you edit a cost.",
    screen: "costs-overview",
    points: [
      { title: "Product costs over time", body: "Effective-dated costs with supplier details, CSV import and full history, so past periods use the cost that applied then." },
      { title: "Shipping and payment fees", body: "Rules for shipping costs and payment gateway fees, applied to every order." },
      { title: "Custom costs", body: "Recurring or one-off, per order or operating, with conditions such as country or sales channel." },
      { title: "Coverage you can see", body: "Know exactly which products and orders still lack a cost, and fix them from the same screen." },
      { title: "Split shipments and VAT done right", body: "An order shipped in parts counts every label, and VAT inside tax-inclusive prices is never counted as sales." },
    ],
    docs: "/docs/costs/product-costs/",
    seoTitle: "Shopify COGS and Cost Tracking | Optifin",
    seoDescription:
      "Track product costs (COGS), shipping, payment fees and operating costs for your Shopify store, with coverage that shows what is still missing.",
  },
  {
    slug: "orders-and-products",
    name: "Orders and products",
    eyebrow: "Orders & products",
    title: "Profit for every order and every product.",
    summary:
      "Open any order to see exactly how its profit was calculated, and rank products by real profit, not just sales.",
    screen: "orders",
    points: [
      { title: "Order profit breakdown", body: "Revenue, discounts, refunds, product costs, shipping and fees for each order." },
      { title: "Product profitability", body: "Margins, missing-cost flags and side-by-side comparison of up to five products." },
      { title: "Reconciliation", body: "Check Optifin's figures against Shopify's own and investigate any difference." },
    ],
    docs: "/docs/orders-and-products/order-profit/",
    seoTitle: "Shopify Order and Product Profitability | Optifin",
    seoDescription:
      "See profit for every Shopify order and product, with a full cost breakdown, missing-cost flags and reconciliation against Shopify.",
  },
  {
    slug: "customers",
    name: "Customers",
    eyebrow: "Customers",
    title: "Know what a customer is really worth.",
    summary:
      "Customer lifetime value on revenue and on profit, retention curves, cohorts and segments built on contribution, not just order counts.",
    screen: "customer-value",
    points: [
      { title: "Lifetime value", body: "Revenue LTV and contribution LTV side by side, with CAC where ad spend is available." },
      { title: "Cohorts and retention", body: "Compare cohorts by month and see how many customers come back, and when." },
      { title: "Segments", body: "Built-in segments based on recency, frequency and profit, plus your own rules." },
    ],
    docs: "/docs/customers/lifetime-value/",
    seoTitle: "Shopify Customer Lifetime Value and Cohorts | Optifin",
    seoDescription:
      "Measure Shopify customer lifetime value on revenue and profit, with cohorts, retention curves and profit-based customer segments.",
  },
  {
    slug: "marketing",
    name: "Ads and marketing",
    eyebrow: "Meta Ads, Google Ads & attribution",
    title: "Judge every campaign on profit, not platform revenue.",
    summary:
      "Connect Meta Ads and Google Ads, see ad spend inside net profit, and compare what platforms claim with the orders Shopify actually recorded.",
    screen: "marketing-trend",
    points: [
      { title: "Meta Ads and Google Ads", body: "Read-only connections import daily spend, clicks and platform conversions by campaign, ad set and ad. Starter connects one platform, Growth and Scale connect both." },
      { title: "Profit after ads", body: "ROAS next to POAS and profit after ads, so a campaign that brings revenue but loses money stands out." },
      { title: "Platform vs Shopify", body: "Platform-reported conversions sit next to Shopify-verified orders, always labelled which is which." },
      { title: "Ad spend you can trust", body: "Every day Optifin checks the imported spend against each ad account's own total, so a gap is flagged instead of silently understating your costs." },
      { title: "UTM and channel analysis", body: "Attribution from Shopify order data works even before any ad platform is connected." },
    ],
    docs: "/docs/marketing/ad-connections/",
    seoTitle: "Meta Ads and Google Ads Profit Tracking for Shopify | Optifin",
    seoDescription:
      "Connect Meta Ads and Google Ads to see Shopify profit after ad spend, POAS and ROAS side by side, with a daily check that every dollar of ad spend was imported.",
    launch: ["metaAds", "googleAds"],
  },
  {
    slug: "alerts-and-delivery",
    name: "Alerts and delivery",
    eyebrow: "Alerts & email reports",
    title: "Your numbers come to you.",
    summary:
      "A daily profit email, scheduled reports and alerts when profit, costs or data move unusually, all with the same coverage notes as the app.",
    screen: "alerts",
    points: [
      { title: "Profit digest", body: "Revenue, contribution profit, net profit and margin with the change from the last period. Weekly or monthly on Starter, daily on Growth and Scale." },
      { title: "Scheduled reports", body: "Profit and Loss, saved custom reports and dashboards delivered as CSV, Excel or PDF on your schedule." },
      ...when(["googleSheets"], [{ title: "Google Sheets", body: "Keep a saved report in sync with a spreadsheet you choose. Scale plan." }]),
      { title: "Smart alerts", body: "Net profit drops, fee and shipping spikes, unprofitable promotions and more, only when the change is material and unusual for your store." },
      { title: "Protection that is always on", body: "Missing product costs, sync failures and missing exchange rates are flagged on every plan, so incomplete profit is never presented as final." },
    ],
    docs: "/docs/delivery/profit-digest/",
    seoTitle: "Shopify Profit Alerts and Daily Profit Email | Optifin",
    seoDescription:
      "Get a daily Shopify profit email, scheduled reports and smart alerts when profit or costs move unusually, with coverage notes on every number.",
    launch: ["alerts", "reportDelivery"],
  },
  {
    slug: "reports",
    name: "Reports",
    eyebrow: "Reports",
    title: "A real profit and loss, and reports you can build.",
    summary:
      "A Profit and Loss report for any period, plus a custom report builder with templates and exports.",
    screen: "profit-and-loss",
    points: [
      { title: "Profit and Loss", body: "From gross sales to net profit, line by line, for any date range." },
      { title: "Custom reports", body: "Start from a template or build your own, then save and export it." },
      { title: "Exports", body: "CSV on every plan; Excel and PDF on Growth and Scale." },
    ],
    docs: "/docs/reports/profit-and-loss/",
    seoTitle: "Shopify Profit and Loss Report | Optifin",
    seoDescription:
      "Build a Shopify profit and loss report from gross sales to net profit, plus custom reports with CSV, Excel and PDF export.",
  },
  {
    slug: "action-center",
    name: "Action Center",
    eyebrow: "Action Center",
    title: "Problems become a short to-do list.",
    summary:
      "Missing costs, unusual changes and data issues turn into cases with clear next steps, so you fix what matters first.",
    screen: "action-center",
    points: [
      { title: "Prioritised cases", body: "Each case explains what happened, how much it affects profit and what to do." },
      { title: "Fix and verify", body: "Work a case from open to resolved, and see when the fix took effect." },
      { title: "Data health", body: "One page shows what is complete, what is still syncing and what happened, so you know when to trust a number." },
    ],
    docs: "/docs/action-center/cases/",
    seoTitle: "Shopify Profit Action Center | Optifin",
    seoDescription:
      "Optifin turns missing costs, unusual changes and data issues into a prioritised to-do list with clear next steps.",
  },
  {
    slug: "simulator",
    name: "Profit simulator",
    eyebrow: "Simulator & planning",
    title: "Test a decision before you make it.",
    summary:
      "See what a price change, cost change or new ad budget does to profit, and plan your months and quarters against actual results.",
    screen: "simulator",
    points: [
      { title: "What-if scenarios", body: "Change price, product cost, shipping or ad spend and see the effect on profit and break-even." },
      { title: "Profit planning", body: "Monthly or quarterly plans with base, best and downside scenarios, then actual versus plan." },
      { title: "Targets", body: "Publish plan targets to your dashboard and track pacing." },
    ],
    docs: "/docs/planning/simulator/",
    seoTitle: "Shopify Profit Simulator and Planning | Optifin",
    seoDescription:
      "Simulate price, cost and ad-spend changes for your Shopify store, and plan monthly or quarterly profit against actual results.",
  },
];

export const FEATURES: Feature[] = ALL_FEATURES.filter((f) => launched(f.launch));

export const ALSO_INCLUDED = [
  "Discount and promotion profitability",
  "Returns and refund profitability",
  "Customer segments and exports",
  "Attribution and UTM analysis from Shopify data",
  "Currency handling and accounting policies",
  "Readiness checklist to trusted profit",
  "Data health checklist: what is complete and what to fix",
  "Correct VAT handling for tax-inclusive prices",
];

// Items leave Coming soon automatically when their launch keys are live.
const ROADMAP: { title: string; body: string; icon: string; launch?: LaunchKey[] }[] = [
  { title: "Daily profit email", body: "Yesterday's profit, sales and biggest change, every morning.", icon: "mail", launch: ["reportDelivery"] },
  { title: "Smart alerts", body: "Notifications when profit, refunds or costs move unusually.", icon: "bell", launch: ["alerts"] },
  { title: "Scheduled reports", body: "Reports delivered by email on a schedule.", icon: "calendar", launch: ["reportDelivery"] },
  { title: "Google Sheets sync", body: "A saved report kept in sync with a spreadsheet you choose.", icon: "calendar", launch: ["googleSheets"] },
  { title: "Meta Ads and Google Ads", body: "Ad spend imported and set against Shopify profit.", icon: "plug", launch: ["metaAds", "googleAds"] },
  { title: "TikTok Ads and more ad platforms", body: "TikTok, Microsoft, Pinterest and Snapchat ad spend set against profit.", icon: "plug" },
  { title: "Custom-metric upgrades", body: "Choose whether higher is better or worse, and insert metrics into formulas.", icon: "formula" },
];
export const COMING_SOON = ROADMAP.filter((item) => !item.launch || !launched(item.launch));

export const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "Free",
    note: "For new and small stores",
    highlights: [
      "100 eligible orders per billing cycle",
      "Profit dashboard, costs, orders, products and customers",
      "90 days of reporting history",
      "One saved view per report and three custom metrics",
      "One saved report template with CSV export",
      ...(launched(["reportDelivery"]) ? ["Weekly or monthly profit email"] : []),
      ...((launched(["metaAds"]) || launched(["googleAds"])) ? ["One ad platform: Meta Ads or Google Ads"] : []),
      ...(launched(["alerts"]) ? ["Essential data-safety alerts"] : []),
    ],
  },
  {
    key: "growth",
    name: "Growth",
    price: 19.99,
    priceLabel: "$19.99",
    note: "500 orders included, then $0.02 per order up to 2,000. Maximum $49.99 a month.",
    highlights: [
      "Everything in Starter",
      "365 days of reporting history",
      "Custom report builder, 10 saved reports",
      "CSV, Excel and PDF export",
      "10 saved views per report and 25 custom metrics",
      ...(launched(["reportDelivery"]) ? ["Daily profit email", "Secure report links"] : []),
      ...((launched(["metaAds"]) || launched(["googleAds"])) ? ["Meta Ads and Google Ads together"] : []),
      ...(launched(["alerts"]) ? ["Profit, fee and promotion alerts with your thresholds"] : []),
    ],
    featured: true,
  },
  {
    key: "scale",
    name: "Scale",
    price: 49.99,
    priceLabel: "$49.99",
    note: "2,000 orders included, then $0.01 per order up to 10,000. Maximum $129.99 a month.",
    highlights: [
      "Everything in Growth",
      "Full reporting history",
      "50 saved custom reports with revision history",
      "Designed for higher order volumes",
      ...(launched(["googleSheets"]) ? ["Google Sheets sync"] : []),
      ...(launched(["alerts"]) ? ["Longer alert baselines and advanced scopes"] : []),
    ],
  },
];

export const FAQ = [
  { q: "Does Optifin work inside Shopify?", a: "Yes. You install it from the Shopify App Store and use it inside your Shopify admin. There is no separate account or login." },
  { q: "Where do my costs come from?", a: "Product costs can come from Shopify's cost per item, a CSV import or manual entry. Shipping, payment fees and your own operating costs are added with simple rules." },
  { q: "What happens if some costs are missing?", a: "Optifin shows it. Cards carry a note such as “Based on 93% of product costs”, and a missing cost is never counted as $0. The Action Center lists what to fix." },
  { q: "Why might Optifin differ from Shopify reports?", a: "Shopify reports sales; Optifin subtracts costs Shopify does not track. Timezone, refunds and tax settings can also differ. The docs explain every difference, and the reconciliation view compares the two." },
  { q: "Is my data safe?", a: "Optifin only reads data from Shopify, keeps every store's data separate, and does not intentionally store customer names, emails or addresses. Uninstalling removes access immediately." },
  { q: "Can I cancel anytime?", a: "Yes. Billing runs through Shopify, and you can change plans or uninstall at any time from your Shopify admin." },
];
