// Landing page scenes: hero reveal + 3D settle + parallax floats + count-up,
// the revenue-to-profit ledger, the horizontal product tour and the briefing
// callouts. All scenes are skipped under reduced motion (content is static
// and fully visible), and the tour is vertical below 900px.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function countUp(el: HTMLElement, to: number, prefix = "", decimals = 2, duration = 1.6) {
  const state = { v: 0 };
  return gsap.to(state, {
    v: to, duration, ease: "power2.out",
    onUpdate: () => { el.textContent = `${prefix}${state.v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`; },
  });
}

export function initHome() {
  const mm = gsap.matchMedia();

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 901px)" }, (ctx) => {
    const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
    if (!motion) return;

    // HERO: the headline paints immediately (it is the LCP element, so it is
    // never hidden); the supporting copy, screenshot and cards follow.
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from("[data-hero-fade]", { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.1 }, 0.15)
      .from("[data-hero-screen]", { autoAlpha: 0, y: 80, duration: 1.2 }, 0.5)
      .from(".float", { autoAlpha: 0, scale: 0.85, y: 30, duration: 0.8, stagger: 0.12, ease: "back.out(1.6)" }, 1.0);

    const value = document.querySelector<HTMLElement>("[data-count]");
    if (value) tl.add(countUp(value, Number(value.dataset.count), value.dataset.prefix || ""), 1.1);

    // Screenshot settles from a 3D tilt to flat while scrolling.
    gsap.fromTo("[data-hero-screen]",
      { rotateX: desktop ? 18 : 8, scale: desktop ? 0.92 : 0.97 },
      { rotateX: 0, scale: 1, ease: "none", scrollTrigger: { trigger: "[data-hero-stage]", start: "top 85%", end: "top 15%", scrub: true } });

    // Floating cards drift at different speeds (parallax).
    gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el) => {
      const depth = Number(el.dataset.float) || 1;
      gsap.to(el, { y: -90 * depth, ease: "none", scrollTrigger: { trigger: "[data-hero-stage]", start: "top bottom", end: "bottom top", scrub: true } });
    });

    // SCENE: costs land one by one and the revenue counts down to profit.
    const scene = document.querySelector<HTMLElement>("[data-scene]");
    const revenueEl = document.querySelector<HTMLElement>("[data-ledger-revenue]");
    if (scene && revenueEl) {
      const start = Number(revenueEl.dataset.value);
      const costs = gsap.utils.toArray<HTMLElement>("[data-ledger-cost]");
      const st = { v: start };
      // Once costs start landing, the figure is what is left, not revenue.
      const label = document.querySelector<HTMLElement>("[data-ledger-label]");
      const render = () => {
        revenueEl.textContent = `${Math.round(st.v).toLocaleString("en-US")}`;
        if (label) label.textContent = st.v < start - 1 ? "What's left" : "Revenue";
      };
      const stl = gsap.timeline({
        scrollTrigger: desktop
          ? { trigger: scene, start: "top top", end: "+=140%", pin: true, scrub: 0.6, anticipatePin: 1 }
          : { trigger: scene, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
      });
      let remaining = start;
      costs.forEach((li, i) => {
        const v = Number(li.dataset.value);
        remaining -= v;
        const target = remaining;
        stl.from(li, { autoAlpha: 0, x: 40, duration: 0.5 }, i * 0.6)
          .from(li.querySelector(".ledger-track span"), { scaleX: 0, duration: 0.5 }, i * 0.6)
          .to(st, { v: target, duration: 0.5, onUpdate: render }, i * 0.6)
          .to("[data-ledger-fill]", { scaleX: target / start, duration: 0.5 }, i * 0.6);
      });
      stl.from("[data-ledger-result]", { autoAlpha: 0, y: 24, duration: 0.6 }, costs.length * 0.6);
    }

    // TOUR: horizontal scroll through real screens (desktop only).
    const tour = document.querySelector<HTMLElement>("[data-tour]");
    const track = document.querySelector<HTMLElement>("[data-tour-track]");
    if (desktop && tour && track) {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: {
          trigger: tour, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8,
          anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => gsap.set("[data-tour-progress]", { scaleX: self.progress }),
        },
      });
    }

    // CALLOUTS: dashed lines draw in, labels follow.
    const callouts = document.querySelector<HTMLElement>("[data-callouts]");
    if (callouts) {
      const paths = callouts.querySelectorAll<SVGPathElement>(".callout-lines path");
      paths.forEach((p) => { const len = p.getTotalLength(); gsap.set(p, { strokeDasharray: `${len}`, strokeDashoffset: len }); });
      gsap.timeline({ scrollTrigger: { trigger: callouts, start: "top 70%", once: true } })
        .to(paths, { strokeDashoffset: 0, duration: 1, stagger: 0.2, ease: "power2.inOut" })
        .from(callouts.querySelectorAll(".callout"), { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.15 }, "-=0.3");
    }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
