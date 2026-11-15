---
title: "Connect Meta Ads and Google Ads"
description: "Connect Meta Ads and Google Ads to Optifin to see ad spend inside net profit, with ROAS and POAS side by side. Read-only access."
sidebar:
  order: 1
# Hidden until Meta Ads and Google Ads are live (LAUNCH in src/data/site.ts);
# remove this line and restore the "Ads and marketing" sidebar group then.
draft: true
---

Connecting an ad platform brings your ad spend into Optifin, so net profit, profit after ads and POAS include what you actually paid for advertising.

## Connect

1. Go to **Settings → Integrations** and choose **Connect** next to Meta Ads or Google Ads.
2. Sign in to the platform and approve **read-only** access.
3. Choose the ad account. For Google Ads, choose the client account that runs your ads, not a manager (MCC) account.
4. Check the account's currency, time zone and the import window (up to 365 days), then choose **Start import**. Nothing is imported until you confirm.

Use **Verify connection** to check access without importing anything.

## What is imported

- Daily spend, impressions and clicks by campaign, ad set or ad group, and ad.
- Conversions and conversion value as the platform reports them.
- For Google Shopping and Performance Max, which products the spend went to.

Optifin never changes your campaigns, budgets or bids, and does not read audiences or targeting.

## How often it updates

Spend refreshes automatically twice an hour, and you can refresh on demand. Amounts stay in the ad account's currency and are converted to your store currency with the exchange rate for each day. If a rate is missing, those days are marked partial and left out of profit rather than converted 1:1.

## Ad spend check

Every day Optifin compares the spend it imported with the ad account's own daily total. Differences of up to 1% are normal and ignored. A bigger gap opens an Action Center case to refresh or reconnect the account, and when 5% or more is missing, ad figures (ad spend, ROAS, POAS, profit after ads) show a note such as "Ad spend: 85% of Meta's reported spend imported". The case closes by itself once the numbers match.

## Platform numbers vs Shopify numbers

Ad platforms count conversions with their own attribution windows, so they often claim more sales than Shopify recorded. Optifin shows both, always labelled **Platform reported** or **Shopify verified**, and calculates profit from Shopify's orders.

## Plans

Starter connects one ad platform of your choice. Growth and Scale connect both Meta Ads and Google Ads.

## Disconnect

Choose **Disconnect** in Settings → Integrations, or remove Optifin in the platform's own settings. Access stops immediately.

## Related

- [Break-even ROAS calculator](/tools/break-even-roas-calculator/)
- [How net profit is calculated](/docs/numbers/how-profit-is-calculated/)
