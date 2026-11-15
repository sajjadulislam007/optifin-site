// Integration pages. Facts come from the app's module docs and provider
// clients (docs/modules/15-advertising-integrations.md, 02-shopify-api-and-
// webhooks.md, app/services/integrations/*). Meta and Google launch with V1
// (owner decision 2026-11-15) once certified; their status follows LAUNCH in
// site.ts, so a missed gate turns them back into "Coming soon".
import { LAUNCH } from "./site";

export type IntegrationStatus = "live" | "soon";

export interface Integration {
  slug: string;
  name: string;
  status: IntegrationStatus;
  title: string; // SEO title
  description: string;
  headline: string;
  lead: string;
  reads: string[];
  notRead: string[];
  permission: string;
  setup: { step: string; detail: string }[];
  unlocks: string[];
  sync: string[];
  limits: string[];
  faq: [string, string][];
}

const AD_SHARED_SYNC = [
  "Up to 365 days of history on the first import, which starts only when you confirm the account.",
  "Refreshed automatically twice an hour, and on demand.",
  "Spend stays in the ad account's currency and is converted to your store currency with dated exchange rates. If a rate is missing, those rows are marked partial and left out of profit rather than converted 1:1.",
];

const AD_SHARED_UNLOCKS = [
  "Ad spend inside net profit and profit after ads",
  "ROAS next to POAS (profit on ad spend), so a campaign that brings revenue but loses money stands out",
  "New-customer CAC from Shopify orders",
  "Platform-reported conversions shown next to Shopify-verified orders, always labelled which is which",
];

export const INTEGRATIONS: Integration[] = [
  {
    slug: "shopify",
    name: "Shopify",
    status: "live",
    title: "Shopify Profit Analytics Integration | Optifin",
    description: "How Optifin connects to Shopify: read-only access to orders, products, customers, inventory, fulfilments and returns to calculate true profit.",
    headline: "Built on your Shopify data, read-only.",
    lead: "Optifin installs from the Shopify App Store and reads your orders, products and costs to calculate profit. It never changes anything in your store.",
    reads: ["Orders, line items, discounts, refunds and taxes", "Products, variants and their unit costs", "Customers (subject to Shopify's protected customer data approval)", "Inventory levels and locations", "Fulfilments and returns"],
    notRead: ["Write access of any kind: Optifin cannot edit products, orders or prices", "Payment card details", "Your storefront theme"],
    permission: "read_products, read_orders, read_all_orders, read_customers, read_inventory, read_locations, read_fulfillments, read_returns",
    setup: [
      { step: "Install from the Shopify App Store", detail: "Approve the read-only permissions. No API keys to copy." },
      { step: "First sync", detail: "Orders and products import in the background; the dashboard shows what is synced so far." },
      { step: "Add costs", detail: "Product costs from Shopify are used automatically; fill the gaps, shipping and fees in Costs." },
    ],
    unlocks: ["Net profit, contribution profit and margin for any period", "Profit by order, product and customer", "Coverage on every figure, so missing costs are never shown as $0"],
    sync: ["Initial import on install, then historical sync in resumable steps.", "New and changed orders arrive through Shopify webhooks in near real time, with a scheduled catch-up sync and reconciliation.", "Refresh on demand on every plan."],
    limits: ["Customer-level data depends on Shopify approving protected customer data access.", "Very large histories take longer to import; comparisons pause until a period is fully synced."],
    faq: [
      ["Can Optifin change my store?", "No. Every permission Optifin requests is read-only."],
      ["Does Optifin use my Shopify product costs?", "Yes. The cost per item you enter in Shopify is used automatically, and you can override or add costs in Optifin."],
      ["What happens when I uninstall?", "Access stops immediately and your data is deleted according to Shopify's data-deletion requests and our privacy policy."],
    ],
  },
  {
    slug: "meta-ads",
    name: "Meta Ads",
    status: LAUNCH.metaAds ? "live" : "soon",
    title: "Meta Ads + Shopify Profit Integration | Optifin",
    description: "Connect Meta Ads to Optifin: read-only Facebook and Instagram ad spend set against Shopify orders and costs for ROAS and POAS.",
    headline: "Meta ad spend, measured in profit.",
    lead: "Bring Facebook and Instagram ad spend into Optifin so every campaign is judged on profit after costs, not just platform-reported revenue.",
    reads: ["Ad account name, currency and time zone", "Daily spend, impressions and clicks by campaign, ad set and ad", "Platform-reported conversions and conversion value", "Ad names, status and creative thumbnails"],
    notRead: ["Audiences and targeting", "Budgets and bids", "Anything that changes your ads: access is read-only"],
    permission: "ads_read",
    setup: [
      { step: "Connect", detail: "In Optifin go to Settings → Integrations and choose Connect next to Meta Ads. Sign in to Meta and approve read-only access." },
      { step: "Choose the ad account", detail: "Review the account, its currency and time zone, and the 365-day import window." },
      { step: "Start import", detail: "Nothing is imported until you confirm. Use Verify connection to test access first." },
    ],
    unlocks: AD_SHARED_UNLOCKS,
    sync: AD_SHARED_SYNC,
    limits: ["Meta reports conversions with its own attribution setting; Optifin labels them platform-reported and does not treat them as verified sales.", "Disconnecting in Meta removes Optifin's access immediately, and Meta data-deletion requests remove the imported data."],
    faq: [
      ["Which plans include Meta Ads?", "Every plan. Starter connects one ad platform (Meta Ads or Google Ads); Growth and Scale connect both."],
      ["Can Optifin change my Meta campaigns?", "No. It requests only the ads_read permission."],
      ["Why does Optifin show fewer conversions than Ads Manager?", "Meta counts conversions with its own attribution window. Optifin shows Meta's number next to the orders Shopify actually recorded, so you can see both."],
    ],
  },
  {
    slug: "google-ads",
    name: "Google Ads",
    status: LAUNCH.googleAds ? "live" : "soon",
    title: "Google Ads + Shopify Profit Integration | Optifin",
    description: "Connect Google Ads to Optifin: read-only campaign, ad group and Shopping spend set against Shopify orders and costs.",
    headline: "Google Ads judged on profit.",
    lead: "Import Google Ads spend, including Shopping and Performance Max, and see which campaigns make money after product, shipping and fees.",
    reads: ["Campaign, ad group and ad: daily cost, impressions, clicks", "Platform-reported conversions and conversion value", "Shopping and Performance Max product breakdown (item ID and title)", "Account currency and time zone"],
    notRead: ["Keywords bids and budgets", "Audience lists", "Anything that changes your campaigns"],
    permission: "Google Ads API (adwords) via OAuth, used for read-only reporting queries",
    setup: [
      { step: "Connect", detail: "Settings → Integrations → Connect next to Google Ads, then sign in to Google." },
      { step: "Choose a client account", detail: "Manager (MCC) accounts are not imported; pick the account that runs the ads." },
      { step: "Start import", detail: "Confirm the account and the 365-day window to begin." },
    ],
    unlocks: AD_SHARED_UNLOCKS,
    sync: AD_SHARED_SYNC,
    limits: ["Campaign-level daily cost is the financial source; product rows explain it and are never counted twice.", "Removed campaigns and ads are excluded."],
    faq: [
      ["Which plans include Google Ads?", "Every plan. Starter connects one ad platform (Meta Ads or Google Ads); Growth and Scale connect both."],
      ["Does it support Performance Max?", "Yes, cost is imported at campaign level and the product breakdown shows which items it was spent on."],
      ["Can I connect a manager account?", "You sign in with any account that has access, then choose the client account to import. A manager account itself is not imported."],
    ],
  },
  {
    slug: "tiktok-ads",
    name: "TikTok Ads",
    status: "soon",
    title: "TikTok Ads + Shopify Profit Integration | Optifin",
    description: "Optifin's TikTok Ads connection (coming soon): read-only campaign and ad spend set against Shopify orders and costs for real profit on TikTok.",
    headline: "TikTok ads, with the costs included.",
    lead: "See whether TikTok campaigns earn money once product cost, shipping and fees are taken out of the orders they drive.",
    reads: ["Advertiser name, currency and time zone", "Daily spend, impressions and clicks by campaign, ad group and ad", "Platform-reported purchases"],
    notRead: ["Audiences and targeting", "Budgets and bids", "Creative content", "Anything that changes your ads"],
    permission: "Read-only Ad Account Information and Reporting",
    setup: [
      { step: "Connect", detail: "Settings → Integrations → Connect next to TikTok Ads, then sign in to TikTok for Business." },
      { step: "Choose the advertiser", detail: "Review its currency, time zone and the 365-day import window." },
      { step: "Start import", detail: "Confirm to begin. Disconnecting revokes Optifin's token with TikTok." },
    ],
    unlocks: AD_SHARED_UNLOCKS,
    sync: AD_SHARED_SYNC,
    limits: ["TikTok purchases are platform-reported and labelled as such.", "The advertiser must be linked to a TikTok Business Center."],
    faq: [
      ["When will TikTok Ads be available?", "After launch. The connection is built and will open once TikTok's review is complete. Email us to be told when it is ready."],
      ["Does Optifin support TikTok Shop?", "Not yet. This connection covers TikTok ad spend for your Shopify store."],
      ["Can Optifin change my TikTok campaigns?", "No. Access is read-only."],
    ],
  },
];

export const integrationUrl = (slug: string) => `/integrations/${slug}/`;
export const STATUS_LABEL: Record<IntegrationStatus, string> = { live: "Available", soon: "Coming soon" };
// Only items already on the Coming soon page (src/data/site.ts COMING_SOON).
export const PLANNED = [
  { name: "Microsoft, Pinterest and Snapchat Ads", body: "More ad platforms set against profit." },
];
