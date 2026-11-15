---
title: "Why a comparison is paused"
description: "When Optifin pauses a period-over-period change, what the card says instead, and when the comparison comes back."
sidebar:
  order: 3
---

A change such as "+12% vs previous period" is only useful when both periods are complete. When they are not, the card shows a short note under the value instead of a misleading percentage.

## What the card says

| Card note | What it means |
|---|---|
| **Comparison after sync finishes** | Some orders for the selected dates are still importing from Shopify. |
| **Comparison after earlier dates sync** | The period you compare against is still importing. |
| **Comparison after costs are complete** | A profit figure is missing costs in one of the periods, so a change could be caused by missing data rather than real performance. |

Hover the card's info icon for the full explanation.

## What to do

Nothing, if the store is syncing: the comparison appears automatically once it finishes. If costs are missing, use **Add missing costs** at the bottom of the card. Metrics that do not depend on costs (for example revenue and orders) show their comparison as soon as the orders are synced.

## Related

- [Your first sync](/docs/getting-started/first-sync/)
- [Coverage notes](/docs/numbers/coverage-and-badges/)

Still stuck? Email [support@optifin.app](mailto:support@optifin.app).
