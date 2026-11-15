---
title: "How net profit is calculated"
description: "The exact formula Optifin uses for revenue, contribution profit and net profit, and which costs are included."
sidebar:
  order: 1
---

Optifin calculates every figure with one engine, so the dashboard, reports and exports always agree.

## The formula

| Line | Meaning |
|---|---|
| **Gross sales** | Product prices before discounts |
| − Discounts | Order and line discounts |
| − Refunds | Money returned to customers |
| **= Net sales (revenue)** | What the store earned from products |
| − Product costs (COGS) | The cost of the units sold |
| − Shipping costs | What you paid to ship |
| − Payment fees | Gateway and processing fees |
| − Variable custom costs | Your per-order costs (packaging, handling) |
| **= Contribution profit** | Profit before marketing and overheads |
| − Advertising | Ad spend for the period, where available |
| − Operating costs | Fixed costs you add (apps, rent, salaries) |
| **= Net profit** | What you actually kept |

Taxes collected for the government are not revenue and are excluded. If your prices include VAT, Optifin removes the VAT from sales, shipping and refunds, so a €100 order with €16.67 VAT counts as €83.33 of sales. Your accounting policy (**Settings → Accounting**) controls choices such as whether shipping charged to customers counts as revenue.

## Margins

- **Net margin** = net profit ÷ net sales.
- **Contribution margin** = contribution profit ÷ net sales.

## Related

- [Coverage notes](/docs/numbers/coverage-and-badges/)
- [Metric glossary](/docs/numbers/glossary/)

Still stuck? Email [support@optifin.app](mailto:support@optifin.app).
