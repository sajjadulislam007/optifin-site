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
