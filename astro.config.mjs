// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// Marketing pages live in src/pages; Starlight serves the docs under /docs
// (content in src/content/docs/docs). Starlight adds @astrojs/sitemap.
export default defineConfig({
  site: "https://www.optifin.app",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Optifin Docs",
      description: "Guides for Optifin, the Shopify profit analytics app.",
      logo: { src: "./src/assets/brand/icon.svg", alt: "" },
      favicon: "/favicon.svg",
      disable404Route: true,
      customCss: ["./src/styles/docs-fonts.css", "./src/styles/tokens.css", "./src/styles/starlight.css"],
      social: [{ icon: "email", label: "Email support", href: "mailto:support@optifin.app" }],
      head: [
        { tag: "meta", attrs: { property: "og:image", content: "https://www.optifin.app/og.png" } },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
      ],
      components: {
        SocialIcons: "./src/components/docs/DocsLinks.astro",
      },
      sidebar: [
        {
          label: "Getting started",
          items: [
            { label: "Welcome", slug: "docs" },
            { slug: "docs/getting-started/install" },
            { slug: "docs/getting-started/first-sync" },
            { slug: "docs/getting-started/add-product-costs" },
            { slug: "docs/getting-started/trusted-profit" },
            { slug: "docs/getting-started/dashboard-tour" },
          ],
        },
        { label: "Understanding your numbers", items: [{ autogenerate: { directory: "docs/numbers" } }] },
        { label: "Dashboard", items: [{ autogenerate: { directory: "docs/dashboard" } }] },
        { label: "Costs", items: [{ autogenerate: { directory: "docs/costs" } }] },
        { label: "Orders and products", items: [{ autogenerate: { directory: "docs/orders-and-products" } }] },
        { label: "Customers", items: [{ autogenerate: { directory: "docs/customers" } }] },
        { label: "Reports", items: [{ autogenerate: { directory: "docs/reports" } }] },
        // "Ads and marketing" (docs/marketing) returns when Meta Ads and Google
        // Ads go live; its page is a draft until then.
        { label: "Alerts and delivery", items: [{ autogenerate: { directory: "docs/delivery" } }] },
        { label: "Planning and simulator", items: [{ autogenerate: { directory: "docs/planning" } }] },
        { label: "Action Center and status", items: [{ autogenerate: { directory: "docs/action-center" } }] },
        { label: "Account and help", items: [{ autogenerate: { directory: "docs/account" } }] },
      ],
    }),
  ],
});
