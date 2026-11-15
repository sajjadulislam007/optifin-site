// Free calculators. Every tool runs in the browser, needs no email and shows
// its formula on the page.
export interface Tool {
  slug: string;
  name: string;
  summary: string;
  group: "Profit" | "Pricing" | "Advertising" | "Customers";
}

export const TOOLS: Tool[] = [
  { slug: "profit-margin-calculator", name: "Profit margin calculator", summary: "Profit and margin for one order after product, shipping, fees and ads.", group: "Profit" },
  { slug: "contribution-margin-calculator", name: "Contribution margin calculator", summary: "What each sale leaves to pay for ads and fixed costs.", group: "Profit" },
  { slug: "shopify-fees-calculator", name: "Shopify fees calculator", summary: "Monthly plan, card processing and third-party transaction fees.", group: "Profit" },
  { slug: "pricing-markup-calculator", name: "Price, markup and margin calculator", summary: "Set a price from a target margin and see the markup it implies.", group: "Pricing" },
  { slug: "discount-break-even-calculator", name: "Discount break-even calculator", summary: "How many more sales a discount needs before it pays for itself.", group: "Pricing" },
  { slug: "break-even-roas-calculator", name: "Break-even ROAS calculator", summary: "The return on ad spend at which ads stop losing money.", group: "Advertising" },
  { slug: "poas-mer-calculator", name: "POAS and MER calculator", summary: "Profit on ad spend and blended marketing efficiency side by side.", group: "Advertising" },
  { slug: "ltv-cac-calculator", name: "LTV to CAC and payback calculator", summary: "Customer lifetime value, acquisition cost and months to pay it back.", group: "Customers" },
];

export const toolUrl = (slug: string) => `/tools/${slug}/`;

/** Schema for a calculator page: the app plus its FAQ. */
export function toolSchema(name: string, faq: [string, string][]) {
  return [
    {
      "@context": "https://schema.org", "@type": "WebApplication", name,
      applicationCategory: "BusinessApplication", operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];
}
