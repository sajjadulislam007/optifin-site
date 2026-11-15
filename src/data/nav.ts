// Header menus: Product (what Optifin does), Solutions (the problems it
// solves, and for whom). Links point at existing feature pages, tools and
// docs, so the menus never promise a page that does not exist. Launch-gated
// features drop out automatically through FEATURES.
import { FEATURES, launched } from "./site";

// One-line descriptions and icons for the Product menu, keyed by feature slug.
const PRODUCT_META: Record<string, { icon: string; blurb: string }> = {
  "profit-dashboard": { icon: "chart", blurb: "True profit, with coverage on every number" },
  costs: { icon: "coins", blurb: "COGS, shipping, fees and operating costs" },
  "orders-and-products": { icon: "box", blurb: "Profit for every order and product" },
  customers: { icon: "users", blurb: "Lifetime value, cohorts and segments" },
  marketing: { icon: "target", blurb: "Meta and Google Ads judged on profit" },
  "alerts-and-delivery": { icon: "bell", blurb: launched(["slack"]) ? "Daily email, Slack and alerts" : "Daily profit email and alerts" },
  reports: { icon: "doc", blurb: "Profit and Loss and custom reports" },
  "action-center": { icon: "shield", blurb: "Problems turned into a to-do list" },
  simulator: { icon: "sliders", blurb: "Test prices, costs and ad budgets" },
};

export const PRODUCT_ITEMS = FEATURES.map((f) => ({
  href: `/features/${f.slug}/`,
  label: f.name,
  icon: PRODUCT_META[f.slug]?.icon || "check",
  blurb: PRODUCT_META[f.slug]?.blurb || f.summary,
}));

const has = (slug: string) => FEATURES.some((f) => f.slug === slug);

// Problems merchants describe in their own words, mapped to where Optifin
// answers them.
export const SOLUTION_PROBLEMS = [
  { href: "/features/profit-dashboard/", icon: "eye", label: "“I don't know my real profit”", blurb: "Shopify shows sales. See what you kept after every cost." },
  { href: "/features/costs/", icon: "coins", label: "“My costs are missing or out of date”", blurb: "Find every product and order without a cost, and fix it." },
  ...(has("marketing")
    ? [{ href: "/features/marketing/", icon: "target", label: "“My ads look profitable but aren't”", blurb: "ROAS next to POAS and profit after ads, per campaign." }]
    : [{ href: "/tools/break-even-roas-calculator/", icon: "target", label: "“Are my ads making money?”", blurb: "Find the ROAS at which your ads stop losing money." }]),
  { href: "/features/orders-and-products/", icon: "box", label: "“Which products actually make money?”", blurb: "Rank products by profit, not revenue." },
  { href: "/features/customers/", icon: "users", label: "“Are my customers worth what I pay for them?”", blurb: "Lifetime value on profit, next to acquisition cost." },
  ...(has("alerts-and-delivery")
    ? [{ href: "/features/alerts-and-delivery/", icon: "bell", label: "“I find problems too late”", blurb: "Alerts and a daily profit email when something moves." }]
    : [{ href: "/features/action-center/", icon: "bell", label: "“I find problems too late”", blurb: "Missing costs and data issues as a prioritised to-do list." }]),
];

export const SOLUTION_ROLES = [
  { href: "/features/profit-dashboard/", label: "Store owners and founders" },
  { href: has("marketing") ? "/features/marketing/" : "/features/customers/", label: "Marketing and ads managers" },
  { href: "/features/reports/", label: "Finance and bookkeeping" },
  { href: "/features/costs/", label: "Operations and merchandising" },
];
