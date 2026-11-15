# 03. Landing Page

Goal: in five seconds a merchant understands "this shows my real profit and
tells me if it is right", and sees the product. No generic two-column
hero-left/image-right layout: the page is built around the product itself,
with asymmetric bento layouts and scroll-driven scenes.

Motion is GSAP (ScrollTrigger, SplitText, Flip). Every animation respects
`prefers-reduced-motion` (show the final state instantly) and never delays
content: text is readable before any animation runs.

## Section 1. Hero: "the profit reveal"

- **Layout:** full-width, centred headline over a large, slightly tilted
  dashboard screenshot that sits "inside" a soft Shopify-admin frame.
  Floating cards break out of the screenshot edges (Net profit, "Costs 93%
  covered", a briefing line), creating depth instead of two columns.
- **Headline:** "Your true Shopify profit, with nothing hidden."
- **Sub:** "Optifin adds product costs, fees, shipping, ads and operating costs
  to your Shopify sales, then shows exactly how complete every number is."
- **Actions:** "Install on Shopify" (primary), "See how it works" (secondary).
- **Trust line:** "Works inside your Shopify admin · Free Starter plan".
- **Motion:**
  1. Headline words rise in with SplitText (stagger 0.04 s).
  2. The screenshot settles from a 3D tilt to flat as the page scrolls
     (ScrollTrigger scrub, perspective 1200px).
  3. The floating cards drift at different speeds (parallax, 3 layers).
  4. The Net profit figure counts up once, ending on the real screenshot value.

## Section 2. "Revenue is not profit" (the problem, as a scene)

- **Layout:** one pinned panel. A large revenue number on the left of the
  viewport; as the merchant scrolls, cost bars slide in and subtract from it
  (product costs, fees, shipping, ads, operating), until only profit remains.
- **Copy:** "Shopify shows you $13,176 in sales. Here is what you actually
  kept." Final state: "$4,514 net profit · 34% margin".
- **Motion:** ScrollTrigger pin for ~150% of viewport height; bars use
  `scaleX` from 0; the revenue number counts down as each cost lands.

## Section 3. "Numbers you can trust" (the differentiator)

- **Layout:** bento grid (one large tile + three small), not columns:
  - Large: a KPI card with its "Costs 93% covered" badge, magnified.
  - Small: "Missing costs are flagged, never $0".
  - Small: "Comparisons held back when data is incomplete".
  - Small: "Every number from one calculation: cards, reports and exports
    always agree".
- **Motion:** tiles reveal with a clip-path wipe; the coverage badge pulses
  once when it enters.

## Section 4. Product tour (horizontal scroll)

- **Layout:** pinned section that scrolls horizontally through 5 real screens:
  Dashboard → Executive briefing → Costs → Orders & products → Action Center.
  Each slide: screenshot + one sentence + "Learn more" to the feature page.
- **Motion:** ScrollTrigger horizontal scroll (`xPercent`), progress bar at the
  top, keyboard and swipe accessible (falls back to a vertical list on mobile
  and with reduced motion).

## Section 5. "Know what changed"

- **Layout:** a large Executive briefing screenshot with three annotated
  callouts connected by drawn lines ("Refunds up 40%", "Biggest cost: product
  costs", "3 products have no cost").
- **Motion:** SVG lines draw in (DrawSVG-style stroke-dashoffset), callouts
  fade in sequence.

## Section 6. Feature grid (everything else)

- **Layout:** compact masonry of feature chips with icons: Customer LTV and
  cohorts, Segments, Discounts, Returns, P&L report, Custom reports and
  exports, Profit simulator, Profit planning and targets, Saved dashboard
  views, Custom metrics, Currency handling. Each links to its page or doc.
- **Motion:** gentle stagger on enter; hover lift.

## Section 7. Coming soon (honest roadmap)

- **Layout:** a short horizontal rail of cards with a "Coming soon" label:
  Daily profit email and Slack, Today vs yesterday glance, Click any number to
  see the orders behind it, Custom-metric builder upgrades, Ad platform
  integrations. Link to `/coming-soon`.
- **Copy:** "We ship what we can prove is right. These are next."

## Section 8. Pricing teaser

- Three compact plan tiles identical to the listing (Starter free, Growth,
  Scale), with "See full pricing".

## Section 9. FAQ

- 6–8 questions in an accordion (also FAQ structured data): Does it work inside
  Shopify? Where do my costs come from? What if some costs are missing? Is my
  data safe? Which currencies? Can I cancel anytime?

## Section 10. Final call to action

- Large centred statement over a subtle animated gradient mesh:
  "Know your real profit today." + "Install on Shopify".

## Performance budget

- LCP under 2.0 s on 4G mobile; the hero screenshot is a responsive AVIF/WebP
  with explicit width and height (no layout shift).
- GSAP and plugins load after first paint (`client:idle` / dynamic import).
- Total JS on the landing page under 90 KB gzipped.
