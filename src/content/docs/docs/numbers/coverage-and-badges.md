---
title: "Coverage notes"
description: "What “Based on 93% of product costs” and “Includes estimated costs” mean on Optifin cards, and why a missing cost is never shown as $0."
sidebar:
  order: 2
---

Every number in Optifin knows what it is based on. When a figure uses an incomplete input, a quiet note at the bottom of the card says how much of that input is in, with a link to finish it.

## Card notes

| Note | Meaning |
|---|---|
| **Based on 93% of product costs** | 93% of the units sold in the period have a product cost. The bar shows the same share. The rest are missing, so profit leaves them out. |
| **Based on 80% of shipping costs** / **payment fees** | The same, counted per order for shipping labels or payment fees. |
| **Includes estimated costs** | Part of the figure comes from a rule or estimate rather than an actual record. |

In lists and tables the same note is shortened, for example **93% of costs**. Coverage is not accuracy: 93% coverage means 7% of units have no cost yet, not that the number is 93% right.

## Missing is never $0

If a product has no cost, Optifin does **not** treat it as free. Profit that depends on it is marked, and the product appears in **Costs → Product costs** and the **Action Center**.

## How to clear a note

Use **Add missing costs** (or **Add shipping costs**, **Add payment fees**) on the card, or the readiness checklist. The note disappears as soon as coverage is complete.

## Related

- [Add your product costs](/docs/getting-started/add-product-costs/)
- [Why a comparison is paused](/docs/numbers/held-back-comparisons/)

Still stuck? Email [support@optifin.app](mailto:support@optifin.app).
