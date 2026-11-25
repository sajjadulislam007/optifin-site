// Particle headline for the home hero.
//
// On load, particles fly in from across the hero and settle into the
// headline. After a pause they break apart and re-form into a short slogan,
// then the next, and the cycle returns to the headline. The cursor pushes
// particles aside (they spring back) and a click scatters the ones nearby.
//
// The real <h1> stays in the page for search engines and screen readers; it
// is only made transparent while the particles draw it (index.astro CSS). The
// canvas is decorative (aria-hidden). Reduced motion: never started, the <h1>
// shows as normal text. If the canvas cannot start, this returns false and
// the caller falls back to the plain headline.
//
// Slogans come from data-phrases on the <h1>: [{ "t": "plain words", "a": "accent words" }].
// Keep them to claims the released app supports.

interface Phrase { t: string; a: string }
interface Target { x: number; y: number; c: number }
interface P { x: number; y: number; vx: number; vy: number; tx: number; ty: number; c: number; k: number; free: number; wait: number; ph: number }

const HOLD_FIRST = 5200; // ms the headline stays after it forms
const HOLD = 3600; // ms each slogan stays
const TAU = Math.PI * 2;
const ACCENT_STOPS = ["#2dd4bf", "#38bdf8", "#3b82f6"]; // brand gradient, a touch brighter so dots read on navy

export function initParticleTitle(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const hero = document.querySelector<HTMLElement>(".hero");
  const title = hero?.querySelector<HTMLElement>("[data-particle-title]");
  const copy = hero?.querySelector<HTMLElement>(".hero-copy");
  if (!hero || !title || !copy) return false;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx || !probe) { title.classList.add("pt-off"); return false; }
  canvas.className = "pt-canvas";
  canvas.setAttribute("aria-hidden", "true");
  copy.before(canvas);
  title.classList.add("pt-live");

  // Phrase 0 is the real headline; the slogans follow.
  const accentEl = title.querySelector(".gradient-text");
  const accent = (accentEl?.textContent ?? "").trim();
  const plain = (title.textContent ?? "").replace(accent, "").trim();
  let extra: Phrase[] = [];
  try { extra = JSON.parse(title.dataset.phrases || "[]"); } catch { extra = []; }
  const phrases: Phrase[] = [{ t: plain, a: accent }, ...extra];

  const small = window.matchMedia("(max-width: 700px)").matches;
  const MAX = small ? 1700 : 4200;

  let w = 0, h = 0, dpr = 1;
  let palette: string[] = []; // colour strings; particles store an index into this
  let layouts: Target[][] = [];
  let size = 2.4;
  const parts: P[] = [];
  let current = 0;

  // ---- text layout and sampling -------------------------------------------
  const font = () => {
    const cs = getComputedStyle(title);
    const px = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight) || px * 1.05;
    const ls = parseFloat(cs.letterSpacing) || 0;
    return { px, lh, ls, css: `${cs.fontWeight} ${px}px ${cs.fontFamily}` };
  };

  type Word = { text: string; accent: boolean };
  const words = (p: Phrase): Word[] => [
    ...p.t.split(/\s+/).filter(Boolean).map((text) => ({ text, accent: false })),
    ...p.a.split(/\s+/).filter(Boolean).map((text) => ({ text, accent: true })),
  ];

  // Greedy wrap, then narrow the width while the line count holds, so lines
  // come out balanced like the CSS text-wrap: balance on the real headline.
  const wrap = (list: Word[], maxW: number, space: number, measure: (s: string) => number) => {
    const run = (limit: number) => {
      const lines: Word[][] = [[]];
      let lw = 0;
      for (const wd of list) {
        const ww = measure(wd.text);
        const line = lines[lines.length - 1];
        if (line.length && lw + space + ww > limit) { lines.push([wd]); lw = ww; }
        else { lw += (line.length ? space : 0) + ww; line.push(wd); }
      }
      return lines;
    };
    const count = run(maxW).length;
    let lo = maxW * 0.45, hi = maxW;
    for (let i = 0; i < 14; i++) { const mid = (lo + hi) / 2; if (run(mid).length > count) lo = mid; else hi = mid; }
    return run(hi);
  };

  const layout = () => {
    const hr = hero.getBoundingClientRect();
    const tr = title.getBoundingClientRect();
    const f = font();
    probe.canvas.width = w;
    probe.canvas.height = h;
    probe.font = f.css;
    if ("letterSpacing" in probe) (probe as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${f.ls}px`;
    probe.textBaseline = "middle";
    const space = probe.measureText(" ").width + f.ls;
    const measure = (s: string) => probe.measureText(s).width;
    const box = { left: tr.left - hr.left, top: tr.top - hr.top, width: tr.width, height: tr.height };
    const cx = box.left + box.width / 2;

    // Brand gradient across the headline width for accent words.
    const grad = probe.createLinearGradient(box.left, 0, box.left + box.width, 0);
    ACCENT_STOPS.forEach((c, i) => grad.addColorStop(i / (ACCENT_STOPS.length - 1), c));

    // Sampling step: about one particle per 4px on desktop type, fewer if needed.
    let step = Math.max(2, Math.round(f.px / 22));
    const colourIndex = new Map<string, number>();
    palette = [];

    const sample = (p: Phrase, s: number): Target[] => {
      probe.clearRect(0, 0, w, h);
      const lines = wrap(words(p), box.width, space, measure);
      const total = lines.length * f.lh;
      const top = box.top + (box.height - total) / 2; // shorter slogans sit centred on the headline
      lines.forEach((line, i) => {
        const lineW = line.reduce((sum, wd, j) => sum + measure(wd.text) + (j ? space : 0), 0);
        let x = cx - lineW / 2;
        const y = top + i * f.lh + f.lh / 2;
        for (const wd of line) {
          probe.fillStyle = wd.accent ? grad : "#ffffff";
          probe.fillText(wd.text, x, y);
          x += measure(wd.text) + space;
        }
      });
      const data = probe.getImageData(0, 0, w, h).data;
      const out: Target[] = [];
      for (let y = 0; y < h; y += s) {
        for (let x = 0; x < w; x += s) {
          const i = (y * w + x) * 4;
          if (data[i + 3] < 140) continue;
          // Quantise colours so drawing can be batched by colour.
          const r = data[i] & 0xf0, g = data[i + 1] & 0xf0, b = data[i + 2] & 0xf0;
          const key = `${r},${g},${b}`;
          let c = colourIndex.get(key);
          if (c === undefined) { c = palette.length; palette.push(`rgb(${r + 8},${g + 8},${b + 8})`); colourIndex.set(key, c); }
          out.push({ x: x + (Math.random() - 0.5) * s * 0.7, y: y + (Math.random() - 0.5) * s * 0.7, c });
        }
      }
      return out;
    };

    for (;;) {
      layouts = phrases.map((p) => sample(p, step));
      if (Math.max(...layouts.map((l) => l.length)) <= MAX || step > 8) break;
      step += 1;
    }
    size = Math.max(1.8, step * 0.78);
    layouts.forEach(shuffle);
  };

  const shuffle = <T>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---- particles ------------------------------------------------------------
  const resize = () => {
    const hr = hero.getBoundingClientRect();
    const stage = hero.querySelector<HTMLElement>(".hero-stage");
    w = Math.max(1, Math.round(hr.width));
    h = Math.max(1, Math.round(stage ? stage.offsetTop : hr.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
    const need = Math.max(...layouts.map((l) => l.length));
    while (parts.length < need) {
      // New particles start scattered across the hero and fly in.
      parts.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, tx: 0, ty: 0, c: 0, k: 0.045 + Math.random() * 0.04, free: 0, wait: Math.random() * 40, ph: Math.random() * Math.PI * 2 });
    }
    parts.length = need;
    assign(current, false);
  };

  // Point every particle at a spot in phrase n. Particles beyond the phrase's
  // own count double up on existing spots so the text stays evenly dense.
  const assign = (n: number, explode: boolean) => {
    const t = layouts[n];
    if (!t?.length) return;
    parts.forEach((p, i) => {
      const s = t[i % t.length];
      p.tx = s.x; p.ty = s.y; p.c = s.c;
      if (explode) {
        const a = Math.random() * Math.PI * 2;
        const f = 2 + Math.random() * 6;
        p.vx += Math.cos(a) * f; p.vy += Math.sin(a) * f - 1.2;
        p.free = 14 + Math.random() * 22; // frames of free flight before the spring takes over
      }
    });
  };

  // ---- pointer ----------------------------------------------------------------
  const mouse = { x: -9999, y: -9999, on: false };
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { mouse.on = false; });
  hero.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement).closest("a, button, input, label")) return;
    const r = hero.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    for (const p of parts) {
      const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy);
      if (d < 170 && d > 0.1) { const f = (1 - d / 170) * 9; p.vx += (dx / d) * f; p.vy += (dy / d) * f; p.free = 6 + Math.random() * 10; }
    }
  });

  // ---- loop -------------------------------------------------------------------
  const buckets: number[][] = [];
  let last = performance.now();
  let raf = 0;
  let clock = 0; // ms of visible time, drives the phrase changes
  let nextAt = HOLD_FIRST + 1400; // first change after the headline has formed and held

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const ms = Math.min(now - last, 50);
    const dt = ms / 16.667;
    last = now;
    clock += ms;
    if (clock >= nextAt && phrases.length > 1) {
      current = (current + 1) % phrases.length;
      assign(current, true);
      nextAt = clock + (current === 0 ? HOLD_FIRST : HOLD) + 900;
    }

    ctx.clearRect(0, 0, w, h);
    for (const b of buckets) b.length = 0;
    const R = 90;
    const rad = size * 0.56;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.wait > 0) { p.wait -= dt; }
      else if (p.free > 0) { p.free -= dt; p.vx *= 0.95; p.vy *= 0.95; p.vy += 0.04 * dt; }
      else {
        const wob = clock * 0.0016 + p.ph;
        p.vx = (p.vx + (p.tx + Math.sin(wob) * 0.7 - p.x) * p.k * dt) * 0.8;
        p.vy = (p.vy + (p.ty + Math.cos(wob * 1.3) * 0.7 - p.y) * p.k * dt) * 0.8;
      }
      if (mouse.on) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R && d2 > 0.01) { const d = Math.sqrt(d2); const f = (1 - d / R) * 2.2; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      (buckets[p.c] ??= []).push(i);
    }
    for (let c = 0; c < buckets.length; c++) {
      const b = buckets[c];
      if (!b?.length) continue;
      // Round dots, one path per colour so thousands of dots are a few fills.
      ctx.fillStyle = palette[c] ?? "#fff";
      ctx.beginPath();
      for (const i of b) { const q = parts[i]; ctx.moveTo(q.x + rad, q.y); ctx.arc(q.x, q.y, rad, 0, TAU); }
      ctx.fill();
    }
  };

  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  let visible = true;
  const sync = () => (visible && !document.hidden ? start() : stop());
  new IntersectionObserver((e) => { visible = e[0]?.isIntersecting ?? false; sync(); }).observe(hero);
  document.addEventListener("visibilitychange", sync);

  let t: number | undefined;
  new ResizeObserver(() => { window.clearTimeout(t); t = window.setTimeout(resize, 150); }).observe(hero);

  // Wait for the web font so the particles spell the headline in Outfit.
  (document.fonts?.ready ?? Promise.resolve()).then(() => { resize(); sync(); });
  return true;
}
