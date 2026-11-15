// Hero gradients in slow, continuous motion: the background glows drift and
// breathe (transform/opacity only, so they stay cheap to render) and the
// headline gradient flows through the letters. Everything pauses while the
// hero is off screen. Reduced motion: not called (index.astro guards it).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initHeroGradients() {
  const hero = document.querySelector<HTMLElement>(".hero");
  if (!hero) return;
  const tweens: gsap.core.Tween[] = [];
  const loop = (target: string, vars: gsap.TweenVars) => {
    const el = hero.querySelector(target);
    if (el) tweens.push(gsap.to(el, { repeat: -1, yoyo: true, ease: "sine.inOut", ...vars }));
  };

  // Glows: long, out-of-phase cycles so the light never visibly repeats.
  loop(".glow-a", { xPercent: -50, x: 70, y: -40, scale: 1.12, duration: 11 });
  loop(".glow-b", { x: -120, y: 90, scale: 1.25, opacity: 0.65, duration: 9, delay: -3 });
  loop(".glow-c", { x: 160, y: -70, scale: 1.3, opacity: 0.9, duration: 13, delay: -6 });
  gsap.set(".glow-a", { xPercent: -50 });

  // Headline gradient: heroTitle.ts lays each letter on a double-width
  // gradient; shifting --g-shift by one gradient width loops seamlessly.
  const title = hero.querySelector<HTMLElement>("[data-hero-title]");
  if (title) {
    const flow = { v: 0 };
    tweens.push(gsap.to(flow, {
      v: 1, duration: 7, ease: "none", repeat: -1,
      onUpdate: () => title.style.setProperty("--g-shift", String(flow.v)),
    }));
  }

  ScrollTrigger.create({
    trigger: hero,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
  });
}
