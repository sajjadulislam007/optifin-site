# 07. Screenshots Plan

Screenshots come from the real app with the **synthetic demo data** (USD
store, 1,168 orders), so every screen looks full and no real merchant data is
ever shown. Never use real customer names, emails or order numbers.

## How to capture

- Run the app locally in demo mode (`npm run dev:demo -- USD`) or the local
  preview harness, logged-out of anything personal.
- Browser: Chrome, device scale factor 2 (retina), width 1440 for desktop and
  390 for mobile.
- Hide development-only banners (QA plan, synthetic-data notice) for website
  shots, or crop them out; keep the coverage badges (they are the message).
- Export PNG, then convert to AVIF and WebP at 1x/2x for the site.
- Name files by content: `dashboard-net-profit-coverage.png`, not
  `screenshot1.png`.

## Shot list

| # | Screen | Framing | Used on |
|---|---|---|---|
| 1 | Dashboard, first screen | Header, trust strip, Key performance | Hero, features, listing #1 |
| 2 | KPI card close-up with "Costs 93% covered" | Single card, 3x crop | Trust section |
| 3 | Your metrics grid | Section crop | Dashboard feature page |
| 4 | Executive briefing | Section with findings | "Know what changed" |
| 5 | Performance trend with 3 metrics | Chart card | Dashboard page |
| 6 | Customize editor | Editor open | Docs: customize |
| 7 | Create custom metric dialog with preview | Dialog | Docs: custom metrics |
| 8 | Costs overview | Page top | Costs page |
| 9 | Product costs table with missing-cost flags | Table crop | Costs page, trust |
| 10 | Custom costs | Page | Docs: custom costs |
| 11 | Orders list with profit column | Table | Orders page |
| 12 | Order detail profit breakdown | Detail | Orders page, tour |
| 13 | Products profitability | Page | Products page |
| 14 | Customer value: LTV and cohorts | Charts | Customers page |
| 15 | Customer segments | Page | Customers page |
| 16 | Discounts | Page | Feature grid |
| 17 | Returns | Page | Feature grid |
| 18 | P&L report | Report | Reports page |
| 19 | Custom report builder | Builder | Reports page |
| 20 | Profit simulator result | Result | Simulator page |
| 21 | Action Center case list | Page | Action Center page, tour |
| 22 | Status page | Page | Docs: status |
| 23 | Mobile dashboard (390 px) | Phone frame | Landing, "works on mobile" |

## Presentation on the site

- Desktop shots inside a minimal Shopify-admin-style frame (no fake browser
  chrome with real URLs).
- Close-ups for details; never shrink a full page until text is unreadable.
- Subtle shadow and rounded corners from the design system (09).
- Every image has meaningful alt text.
