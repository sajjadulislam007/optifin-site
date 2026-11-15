// Hero headline motion. The headline is the LCP element, so it is never
// hidden: it paints as plain text first, and is split into letters only
// after fonts load and the first frames have rendered.
//
// - Entrance: a one-time wave runs through the letters (they move, never fade).
// - Hover (fine pointers only): letters near the cursor lift and grow with a
//   smooth falloff, then spring back when the cursor leaves.
// - The gradient phrase keeps one continuous gradient: every letter shares a
//   background sized to the whole headline and offset to its own position.
// Reduced motion: nothing runs and the headline stays plain text.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const RADIUS = 140; // px of cursor influence
const LIFT = 16; // max lift in px
const GROW = 0.18; // max extra scale

export function initHeroTitle() {
  const title = document.querySelector<HTMLElement>("[data-hero-title]");
  if (!title) return () => {};
  let split: SplitText | null = null;
  let chars: HTMLElement[] = [];
  let setters: { y: gsap.QuickToFunc; s: gsap.QuickToFunc }[] = [];
  // Resting centre of each letter relative to the headline, measured without
  // transforms so lifted letters do not move their own target.
  let centres: { x: number; y: number }[] = [];
  const measure = () => {
    const box = title.getBoundingClientRect();
    centres = chars.map((ch) => {
      const lift = Number(gsap.getProperty(ch, "y")) || 0;
      const r = ch.getBoundingClientRect();
      // Remove the current lift from the measured position.
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 - lift };
    });
  };
  let cancelled = false;
  let wave: gsap.core.Tween | null = null;

  // Paint every gradient letter with the same gradient laid across the full
  // headline width, so the colour flows across letters as before.
  const paintGradient = () => {
    const box = title.getBoundingClientRect();
    title.querySelectorAll<HTMLElement>(".gradient-text .ht-char").forEach((ch) => {
      const r = ch.getBoundingClientRect();
      // Double-width looping gradient; heroGradients.ts moves --g-shift 0→1
      // to make the colours flow (it stays 0 when that script is not running).
      const w = box.width * 2;
      ch.style.backgroundSize = `${w}px 100%`;
      ch.style.backgroundPosition = `calc(${box.left - r.left}px - var(--g-shift, 0) * ${w}px) 0`;
    });
  };

  const onMove = (e: PointerEvent) => {
    // The cursor takes over from the entrance wave.
    if (wave) { wave.progress(1).kill(); wave = null; }
    if (centres.length !== chars.length) measure();
    const box = title.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    chars.forEach((_, i) => {
      const d = Math.hypot(px - centres[i].x, py - centres[i].y);
      const f = Math.max(0, 1 - d / RADIUS);
      const eased = f * f * (3 - 2 * f); // smoothstep
      setters[i].y(-LIFT * eased);
      setters[i].s(1 + GROW * eased);
    });
  };
  // Return to rest through the same quickTo setters. A separate tween with
  // overwrite would kill the quickTo tweens and stop the hover effect.
  const onLeave = () => {
    setters.forEach((set) => {
      set.y(0);
      set.s(1);
    });
  };

  const start = () => {
    if (cancelled) return;
    split = SplitText.create(title, {
      type: "words,chars",
      charsClass: "ht-char",
      wordsClass: "ht-word",
      aria: "auto", // screen readers read the sentence, not single letters
      autoSplit: true, // re-split when fonts or width change
      onSplit(self) {
        chars = self.chars as HTMLElement[];
        title.classList.add("is-split");
        gsap.set(chars, { display: "inline-block", transformOrigin: "50% 80%", willChange: "transform" });
        paintGradient();
        centres = [];
        setters = chars.map((ch) => ({
          y: gsap.quickTo(ch, "y", { duration: 0.45, ease: "power3.out" }),
          s: gsap.quickTo(ch, "scale", { duration: 0.45, ease: "power3.out" }),
        }));
      },
    });

    // Entrance wave: letters rise and settle once, left to right.
    wave = gsap.fromTo(chars, { y: 0 }, {
      keyframes: { y: [0, -14, 0], ease: "sine.inOut" },
      duration: 0.9, stagger: 0.018, delay: 0.15,
    });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      title.addEventListener("pointermove", onMove);
      title.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", paintGradient);
    window.addEventListener("resize", measure);
  };

  // Split only after fonts are ready and two frames have painted.
  document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(start)));

  return () => {
    cancelled = true;
    title.removeEventListener("pointermove", onMove);
    title.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("resize", paintGradient);
    window.removeEventListener("resize", measure);
    split?.revert();
    title.classList.remove("is-split");
  };
}
