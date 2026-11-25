// Smooth scrolling (Lenis) driven by GSAP's ticker, so ScrollTrigger scenes,
// pinned sections and the scroll progress line all read the same eased
// position. Skipped under reduced motion: the browser scrolls natively.
// Touch devices keep their native momentum scrolling (Lenis only smooths the
// wheel), and anything marked [data-lenis-prevent] (menus) scrolls natively.
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  lenis = new Lenis({
    lerp: 0.11, // lower = floatier; 0.11 feels smooth without lagging behind the hand
    wheelMultiplier: 1,
    anchors: { offset: -84 }, // clear the sticky header for #links
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;
