// Cursor spotlight on cards: a soft glow and a lit edge follow the pointer.
// Only for fine pointers (mouse, trackpad); touch and reduced motion get the
// plain card. The look itself is in global.css ([data-spotlight]).
export function initSpotlight() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let frame = 0;
  let last: PointerEvent | null = null;
  const paint = () => {
    frame = 0;
    if (!last) return;
    const target = (last.target as Element | null)?.closest<HTMLElement>("[data-spotlight]");
    if (!target) return;
    const r = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${last.clientX - r.left}px`);
    target.style.setProperty("--my", `${last.clientY - r.top}px`);
  };
  document.addEventListener(
    "pointermove",
    (e) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    },
    { passive: true },
  );
}
