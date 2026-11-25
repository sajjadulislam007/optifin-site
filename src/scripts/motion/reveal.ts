// Site-wide entrance reveals. Elements marked [data-reveal] (or children of
// [data-reveal-group]) are hidden by motion.css only when JS runs and the
// visitor allows motion; this reveals them as they scroll into view.
//
// [data-reveal="head"] is a section heading block: the eyebrow and the
// paragraph fade up, and the <h2> rises line by line out of a mask.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

function revealHead(el: HTMLElement) {
  const title = el.querySelector<HTMLElement>("h2");
  const rest = Array.from(el.children).filter((c) => c !== title) as HTMLElement[];
  let shown = false;
  let split: SplitText | null = null;

  gsap.set(rest, { autoAlpha: 0, y: 22 });
  const build = () => {
    if (!title) return;
    split = SplitText.create(title, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) => {
        // A re-split after a resize must not hide a heading that is already shown.
        if (!shown) gsap.set(self.lines, { yPercent: 108 });
      },
    });
  };
  // Split after the fonts load so line breaks match the final text.
  (document.fonts?.ready ?? Promise.resolve()).then(build);

  ScrollTrigger.create({
    trigger: el,
    start: "top 86%",
    once: true,
    onEnter: () => {
      shown = true;
      gsap.set(el, { autoAlpha: 1 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (split) tl.to(split.lines, { yPercent: 0, duration: 0.95, stagger: 0.09 }, 0.05);
      tl.to(rest, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.15);
    },
  });
}

export function initReveals() {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.dataset.reveal === "head") return revealHead(el);
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
