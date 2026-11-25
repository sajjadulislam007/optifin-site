---
name: gsap
description: GSAP 3.15 animation rules for the Optifin website (ScrollTrigger, SplitText, matchMedia, reduced motion, performance). Use whenever adding or changing an animation.
---

# GSAP on optifin-site

Licence: the standard "No Charge" GSAP licence (since 2025-04-30) allows
commercial use of GSAP and all plugins; it only forbids building no-code
visual animation tools that compete with Webflow. A marketing site is fine.

## Imports (bundled module script)
```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);
```
Keep all scene setup in `src/scripts/motion/*.ts`, one file per scene,
imported from the component's `<script>`.

## Pattern for every scene
```js
const mm = gsap.matchMedia();
mm.add(
  { motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 960px)" },
  (ctx) => {
    const { motion, desktop } = ctx.conditions;
    if (!motion) return;            // reduced motion: content is already visible
    // build tweens / ScrollTriggers here; matchMedia reverts them automatically
  },
);
```
- Content must be readable without JavaScript and with reduced motion.
  Elements are only hidden for animation under `html.js` and
  `(prefers-reduced-motion: no-preference)` (see `src/styles/motion.css`).
- SplitText: `SplitText.create(el, { type: "lines,words", mask: "lines",
  autoSplit: true, onSplit: (self) => gsap.from(self.lines, {...}) })` and
  return the tween from `onSplit` so re-splits rebuild it.

## Performance and feel
- Animate `transform`, `opacity` and `clip-path` only. Never animate layout
  properties (width, height, top, margin).
- Durations 0.5–0.9 s, `ease: "power3.out"` for entrances; `ease: "none"` and
  `scrub` for scroll-linked scenes.
- Pinned scenes: one per viewport at most, `anticipatePin: 1`, and test that
  the page height does not jump.
- No infinite loops near text. One idea per scene.
- Call `ScrollTrigger.refresh()` after images that affect layout load.

## Accessibility
- Never trap scroll; horizontal tours must also be reachable by keyboard
  (focusable cards) and fall back to a vertical list on mobile and reduced
  motion.
- Counting numbers end on the exact value present in the HTML.

## Smooth scroll, pointer effects and data visuals (added with the UX/UI redesign)
- Lenis (`src/scripts/motion/smooth.ts`) drives scrolling from GSAP's ticker and
  feeds `ScrollTrigger.update`; it is off under reduced motion. Anything that
  scrolls inside the page (menus, panels) needs `data-lenis-prevent`.
- `data-reveal="head"` on a section heading block: eyebrow and paragraph fade up,
  the `<h2>` rises line by line (SplitText mask). Plain `data-reveal` still fades.
- `data-spotlight` on a card adds the cursor glow and lit edge (CSS in
  `global.css`, pointer tracking in `spotlight.ts`); set `--spot: r g b` for dark
  cards. Fine pointers and no-reduced-motion only.
- Hero data layer: `HeroChart.astro` + `heroData.ts` (self-drawing revenue and
  profit lines, grid that lights near the cursor). The chart is abstract: no axis
  labels or numbers, so it cannot read as a claim.
- `CostTicker.astro` and `ProfitPlayground.astro` use only figures and costs the
  released app really handles; the playground uses the same illustrative store as
  the revenue-to-profit scene and says sales are held constant.
- Keep animated SVG children (pulses, filters) out of the hero: they repaint the
  whole layer every frame. Do not put `filter: blur()` on large animated
  gradients; the gradients are already soft.
- Home hero (`scripts/motion/heroScene.ts`): a deep, slow analytics scene in the
  background: two growth charts at different distances (bars, trend line with a
  soft area, gridlines, counting labels, a quiet arrowhead, slow lights on the
  line) seen through dark water (light rays, a soft surface glow, drifting specks,
  a few bubbles, haze; no caustic pattern or refraction wobble: too noisy), rendered at
  low resolution so it reads soft and far away, dimmer behind the headline.
  Keep it dark and slow: new bars every 8-11 s. Bars have permanent ids so their
  look never flips when a new bar arrives. The settled headline sways in a very
  gentle wave (about 1-2 px); there is no click effect (ripples and light bands
  were tried and felt too much). Labels are abstract numbers, never
  currency. The headline is built only from particles that fly in from depth;
  the settled particles are the finished text (no second, crisp-text step).
  Changes sweep particles back into depth left to right and re-form the next
  slogan from `heroPhrases` (index.astro). The real `<h1>` stays in the page
  (transparent while this runs; it fades back in if the script never starts).
  Slogans must be claims the app supports.
- Intro (`components/IntroLoader.astro`): animates the real logo SVG (ring, bars,
  Audiowide wordmark as paths), once per session, then fires
  `optifin:intro-done`; the hero starts on that event. Skipped under reduced
  motion; a CSS timeout removes it if the script never runs.
