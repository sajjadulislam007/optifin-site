// Site-wide entrance reveals. Elements marked [data-reveal] (or children of
// [data-reveal-group]) are hidden by motion.css only when JS runs and the
// visitor allows motion; this reveals them as they scroll into view.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initReveals() {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    });
    gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
      gsap.fromTo(
        group.children,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
        },
      );
    });
  });
  // Layout can shift once images decode; keep trigger positions accurate.
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
