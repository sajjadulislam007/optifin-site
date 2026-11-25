// Hero data layer (HeroChart.astro) and pointer light.
//  - The revenue and profit lines draw themselves in, then the area fades up.
//  - A brighter copy of the grid is revealed only around the cursor, so the
//    grid seems to light up where you point (fine pointers only).
//  - The chart drifts a few pixels against the pointer for depth.
// Reduced motion: not called; the chart is already fully drawn in the markup.
import { gsap } from "gsap";

export function initHeroData() {
  const hero = document.querySelector<HTMLElement>(".hero");
  if (!hero) return;

  const revenue = hero.querySelector<SVGPathElement>(".hc-revenue");
  const profit = hero.querySelector<SVGPathElement>(".hc-profit");
  const area = hero.querySelector<SVGPathElement>(".hc-area");
  const end = hero.querySelector<SVGGElement>(".hc-end");
  if (revenue && profit && area && end) {
    // pathLength="1" lets one dash value draw any path.
    gsap.set([revenue, profit], { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(area, { opacity: 0 });
    gsap.set(end, { opacity: 0 });
    gsap.timeline({ defaults: { ease: "power2.inOut" }, delay: 0.25 })
      .to(revenue, { strokeDashoffset: 0, duration: 2.2 }, 0)
      .to(profit, { strokeDashoffset: 0, duration: 2.4 }, 0.15)
      .to(area, { opacity: 1, duration: 1.6, ease: "power1.out" }, 1.2)
      .to(end, { opacity: 1, duration: 0.5 }, 2.4);
  }

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const chart = hero.querySelector<SVGElement>(".hero-chart svg");
  const px = gsap.quickTo(chart, "x", { duration: 1.2, ease: "power3.out" });
  const py = gsap.quickTo(chart, "y", { duration: 1.2, ease: "power3.out" });
  // Smoothed cursor position drives the CSS variables for the lit grid.
  const cur = { x: 0, y: 0 };
  const set = () => {
    hero.style.setProperty("--hx", `${cur.x}px`);
    hero.style.setProperty("--hy", `${cur.y}px`);
  };
  const lx = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3.out", onUpdate: set });
  const ly = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3.out", onUpdate: set });

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    lx(x);
    ly(y);
    hero.classList.add("is-lit");
    if (chart) {
      px(-(x / r.width - 0.5) * 22);
      py(-(y / r.height - 0.5) * 14);
    }
  }, { passive: true });
  hero.addEventListener("pointerleave", () => hero.classList.remove("is-lit"));
}
