// Home hero scene: a deep, slow analytics scene in the background and a
// headline built from particles that fly in from deep behind it.
//
// Background: two growth charts at different distances (bars, trend line with
// a soft area, gridlines, counting labels, a quiet arrowhead, slow lights on
// the line), seen through dark water: faint light rays and a soft glow from above,
// drifting specks, a few bubbles and a haze. It moves very slowly, is dimmer behind the headline, and
// is rendered at low resolution so it looks soft and far away. The figures
// are abstract (no currency, no axis), so they are not claims.
//
// Headline: particles fly in from depth and settle into the words; that
// settled state is the finished text (tightly packed, softly glowing). Each
// change sends the particles back into depth in a left-to-right wave and
// brings them forward as the next line.
//
// The real <h1> stays in the page (transparent while this runs) for search
// engines and screen readers; the canvas is aria-hidden. Reduced motion:
// returns false and the plain <h1> shows. Slogans come from data-phrases on
// the <h1> ([{ "t": "plain", "a": "accent" }]) and must be claims the released
// app supports.

interface Phrase { t: string; a: string }
interface Target { x: number; y: number; c: number }
interface Line { words: { text: string; accent: boolean }[]; y: number }
interface P {
  ax: number; ay: number; az: number; // path start
  mx: number; my: number; mz: number; // control point (deep)
  bx: number; by: number;             // end, on the text plane
  t0: number; dur: number;            // ms on the scene clock
  c: number; nc: number;              // colour index now / after the move
  ph: number;                         // shimmer phase
}

const HOLD_FIRST = 9000; // ms the headline stays
const HOLD = 6500;       // ms each slogan stays
const ACCENT = ["#2dd4bf", "#38bdf8", "#3b82f6"];
const TAU = Math.PI * 2;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

export function initHeroScene(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const hero = document.querySelector<HTMLElement>(".hero");
  const title = hero?.querySelector<HTMLElement>("[data-particle-title]");
  const copy = hero?.querySelector<HTMLElement>(".hero-copy");
  if (!hero || !title || !copy) return false;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx || !probe) { title.classList.add("pt-off"); return false; }
  canvas.className = "hs-canvas";
  canvas.setAttribute("aria-hidden", "true");
  copy.before(canvas);
  title.classList.add("pt-live");

  const accentEl = title.querySelector(".gradient-text");
  const accent = (accentEl?.textContent ?? "").trim();
  const plain = (title.textContent ?? "").replace(accent, "").trim();
  let extra: Phrase[] = [];
  try { extra = JSON.parse(title.dataset.phrases || "[]"); } catch { extra = []; }
  const phrases: Phrase[] = [{ t: plain, a: accent }, ...extra];

  const small = window.matchMedia("(max-width: 700px)").matches;
  const MAX = small ? 2600 : 8000;

  let w = 0, h = 0, dpr = 1;
  let box = { left: 0, top: 0, width: 0, height: 0 };
  let font = { px: 60, lh: 64, ls: 0, css: "" };
  let palette: string[] = [];
  let glowColour: string[] = [];
  let targets: Target[][] = [];
  let dot = 1.2;
  const parts: P[] = [];
  let current = 0;

  // ---- text layout and sampling --------------------------------------------------
  const readFont = () => {
    const cs = getComputedStyle(title);
    const px = parseFloat(cs.fontSize);
    font = { px, lh: parseFloat(cs.lineHeight) || px * 1.05, ls: parseFloat(cs.letterSpacing) || 0, css: `${cs.fontWeight} ${px}px ${cs.fontFamily}` };
  };
  const splitWords = (p: Phrase) => [
    ...p.t.split(/\s+/).filter(Boolean).map((text) => ({ text, accent: false })),
    ...p.a.split(/\s+/).filter(Boolean).map((text) => ({ text, accent: true })),
  ];
  // Greedy wrap, then narrow while the line count holds (balanced lines).
  const wrap = (p: Phrase, measure: (s: string) => number, space: number): Line[] => {
    const list = splitWords(p);
    const run = (limit: number) => {
      const out: { text: string; accent: boolean }[][] = [[]];
      let lw = 0;
      for (const wd of list) {
        const ww = measure(wd.text);
        const line = out[out.length - 1];
        if (line.length && lw + space + ww > limit) { out.push([wd]); lw = ww; }
        else { lw += (line.length ? space : 0) + ww; line.push(wd); }
      }
      return out;
    };
    const count = run(box.width).length;
    let lo = box.width * 0.45, hi = box.width;
    for (let i = 0; i < 14; i++) { const mid = (lo + hi) / 2; if (run(mid).length > count) lo = mid; else hi = mid; }
    const rows = run(hi);
    const top = box.top + (box.height - rows.length * font.lh) / 2;
    return rows.map((words, i) => ({ words, y: top + i * font.lh + font.lh / 2 }));
  };

  const layout = () => {
    const hr = hero.getBoundingClientRect();
    const tr = title.getBoundingClientRect();
    box = { left: tr.left - hr.left, top: tr.top - hr.top, width: tr.width, height: tr.height };
    readFont();
    probe.canvas.width = w;
    probe.canvas.height = h;
    probe.font = font.css;
    if ("letterSpacing" in probe) (probe as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${font.ls}px`;
    probe.textBaseline = "alphabetic";
    const measure = (s: string) => probe.measureText(s).width;
    const space = measure(" ") + font.ls;
    const m = probe.measureText("Hg");
    const asc = m.fontBoundingBoxAscent ?? font.px * 0.8, desc = m.fontBoundingBoxDescent ?? font.px * 0.2;
    const baseline = (font.lh - (asc + desc)) / 2 + asc; // where CSS puts the baseline in a line box
    const grad = probe.createLinearGradient(box.left, 0, box.left + box.width, 0);
    ACCENT.forEach((c, i) => grad.addColorStop(i / (ACCENT.length - 1), c));
    const cx = box.left + box.width / 2;

    let step = Math.max(2, Math.round(font.px / 30));
    const colourIndex = new Map<string, number>();
    palette = [];
    glowColour = [];
    const sample = (rows: Line[], s: number) => {
      probe.clearRect(0, 0, w, h);
      for (const row of rows) {
        const lineW = row.words.reduce((sum, wd, j) => sum + measure(wd.text) + (j ? space : 0), 0);
        let x = cx - lineW / 2;
        for (const wd of row.words) {
          probe.fillStyle = wd.accent ? grad : "#ffffff";
          probe.fillText(wd.text, x, row.y - font.lh / 2 + baseline);
          x += measure(wd.text) + space;
        }
      }
      const data = probe.getImageData(0, 0, w, h).data;
      const out: Target[] = [];
      for (let y = 0; y < h; y += s) {
        for (let x = 0; x < w; x += s) {
          const i = (y * w + x) * 4;
          if (data[i + 3] < 128) continue;
          const r = data[i] & 0xf0, g = data[i + 1] & 0xf0, b = data[i + 2] & 0xf0;
          const key = `${r},${g},${b}`;
          let c = colourIndex.get(key);
          if (c === undefined) {
            c = palette.length;
            palette.push(`rgb(${r + 8},${g + 8},${b + 8})`);
            glowColour.push(`rgba(${r + 8},${g + 8},${b + 8},0.55)`);
            colourIndex.set(key, c);
          }
          out.push({ x: x + (Math.random() - 0.5) * s * 0.3, y: y + (Math.random() - 0.5) * s * 0.3, c });
        }
      }
      return out.sort((a, b) => a.x - b.x || a.y - b.y); // left to right, for tidy morphs
    };
    const lines = phrases.map((p) => wrap(p, measure, space));
    for (;;) {
      targets = lines.map((rows) => sample(rows, step));
      if (Math.max(...targets.map((t) => t.length)) <= MAX || step > 9) break;
      step += 1;
    }
    dot = Math.max(0.8, step * 0.6); // tight enough that letters read as solid shapes
  };

  // ---- particle paths ------------------------------------------------------------
  const vp = () => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

  const intro = (now: number) => {
    const t = targets[current];
    const v = vp();
    let last = 0;
    parts.forEach((p, i) => {
      const s = t[Math.floor((i * t.length) / parts.length)];
      const z = 2400 + Math.random() * 2600;
      p.ax = s.x + (Math.random() - 0.5) * w * 0.5; p.ay = s.y + (Math.random() - 0.5) * h * 0.5; p.az = z;
      p.mx = v.x + (s.x - v.x) * 0.6; p.my = v.y + (s.y - v.y) * 0.6; p.mz = z * 0.3;
      p.bx = s.x; p.by = s.y;
      p.c = p.nc = s.c;
      p.t0 = now + Math.random() * 700 + ((s.x - box.left) / Math.max(1, box.width)) * 350;
      p.dur = 2300 + Math.random() * 900;
      last = Math.max(last, p.t0 + p.dur);
    });
    return last;
  };

  const morph = (now: number, n: number) => {
    const t = targets[n];
    const v = vp();
    let last = 0;
    parts.forEach((p, i) => {
      const s = t[Math.floor((i * t.length) / parts.length)];
      p.ax = p.bx; p.ay = p.by; p.az = 0;
      const midX = (p.ax + s.x) / 2, midY = (p.ay + s.y) / 2;
      p.mx = v.x + (midX - v.x) * 0.55 + (Math.random() - 0.5) * 60;
      p.my = v.y + (midY - v.y) * 0.55 + (Math.random() - 0.5) * 40;
      p.mz = 900 + Math.random() * 1300;
      p.bx = s.x; p.by = s.y;
      p.nc = s.c;
      p.t0 = now + ((p.ax - box.left) / Math.max(1, box.width)) * 900 + Math.random() * 260;
      p.dur = 2500 + Math.random() * 600;
      last = Math.max(last, p.t0 + p.dur);
    });
    return last;
  };

  // ---- background: a deep, slow analytics scene -------------------------------
  // Two charts at different distances (far = smaller, fainter, slower), seen
  // through dark water: faint light rays from above, slow drifting specks and
  // a haze. It is drawn into a low-resolution buffer and scaled up, which
  // softens it like distance and water would, and costs less to draw.
  type Layer = {
    series: number[]; level: number; scroll: number; scaleMax: number;
    every: number; scale: number; alpha: number; lift: number; bars: number;
    sparks: { u: number; sp: number }[]; sparkClock: number;
    head: number; // values ever added; gives each bar a permanent number
    ref: number;  // what the labels count from; drifts smoothly, never jumps
  };
  const makeLayer = (every: number, scale: number, alpha: number, lift: number, bars: number): Layer => {
    const l: Layer = { series: [], level: 20, scroll: Math.random(), scaleMax: 1, every, scale, alpha, lift, bars, sparks: [], sparkClock: 0, head: 0, ref: 1 };
    for (let i = 0; i < 40; i++) { l.series.push(grow(l)); l.head++; }
    l.scaleMax = Math.max(...l.series.slice(-bars - 2));
    l.ref = l.series[l.series.length - bars - 2];
    return l;
  };
  // Steady climb with noise. Values are rebased now and then so they never grow
  // without limit; labels are relative to the left edge, so rebasing is invisible.
  function grow(l: Layer) { l.level = Math.max(1, l.level * (1 + 0.04 + (Math.random() - 0.45) * 0.09)); return l.level; }
  const layers = [
    makeLayer(11000, 0.62, 0.42, 0.16, small ? 12 : 30), // far
    makeLayer(8000, 0.9, 0.62, 0, small ? 10 : 22),     // nearer
  ];
  const snow = Array.from({ length: small ? 30 : 70 }, () => ({
    x: Math.random(), y: Math.random(), r: 0.5 + Math.random() * 1.4, sp: 0.000004 + Math.random() * 0.000008, ph: Math.random() * TAU, a: 0.12 + Math.random() * 0.3,
  }));
  const rays = Array.from({ length: 5 }, (_, i) => ({ x: 0.12 + i * 0.19 + (Math.random() - 0.5) * 0.06, wid: 0.06 + Math.random() * 0.06, ph: Math.random() * TAU }));
  const fmtNum = (n: number) => Math.round(n * 1000).toLocaleString("en-US");
  // Light from the surface far above: two large, dim pools that drift very slowly.
  const pools = [
    { x: 0.3, y: -0.05, r: 0.55, ph: Math.random() * TAU },
    { x: 0.72, y: -0.1, r: 0.5, ph: Math.random() * TAU },
  ];
  const bubbles = Array.from({ length: small ? 5 : 11 }, () => ({
    x: Math.random(), y: 1 + Math.random() * 0.8, r: 1.5 + Math.random() * 3, sp: 0.00002 + Math.random() * 0.00003, ph: Math.random() * TAU,
  }));
  const bg = document.createElement("canvas");
  const bgx = bg.getContext("2d")!;
  const BG_SCALE = 0.6;
  const bodyFont = getComputedStyle(document.body).fontFamily;

  const drawLayer = (l: Layer, ms: number, base: number, fullH: number, fade: (x: number) => number) => {
    l.scroll += ms / l.every;
    if (l.scroll >= 1) {
      l.scroll -= 1; l.series.push(grow(l)); l.head++; if (l.series.length > 80) l.series.shift();
      if (l.level > 1e6) { const k = 1e-3; l.series.forEach((_, i) => (l.series[i] *= k)); l.level *= k; l.scaleMax *= k; l.ref *= k; }
    }
    const view = l.series.slice(-(l.bars + 2));
    l.scaleMax += (Math.max(...view) * 1.1 - l.scaleMax) * 0.004;
    l.ref += (view[0] - l.ref) * Math.min(1, ms / 12000);
    const id = (i: number) => l.head - view.length + i; // permanent bar number

    const width = w * 0.9 * l.scale;
    const left = (w - width) / 2;
    const b = base - l.lift * fullH;
    const chartH = fullH * l.scale;
    const gap = width / (l.bars - 1);
    const xOf = (i: number) => left + (i - l.scroll) * gap;
    const yOf = (v: number) => b - (v / l.scaleMax) * chartH;
    const growIn = Math.min(1, l.scroll * 2.5);
    const A = l.alpha;
    // Bars fade in over the first gap at the left edge instead of popping.
    const edge = (x: number) => Math.max(0, Math.min(1, (x - left) / gap));

    // Gridlines, like an analytics panel.
    bgx.setLineDash([3, 6]);
    bgx.lineWidth = 1;
    for (let g = 1; g <= 4; g++) {
      const y = b - (chartH * g) / 4;
      bgx.strokeStyle = `rgba(148,163,184,${(0.07 * A).toFixed(3)})`;
      bgx.beginPath(); bgx.moveTo(left - gap, y); bgx.lineTo(left + width + gap, y); bgx.stroke();
    }
    bgx.setLineDash([]);
    bgx.fillStyle = `rgba(96,165,250,${(0.35 * A).toFixed(3)})`;
    bgx.fillRect(left - gap, b, width + gap * 2, 1);

    // Bars.
    const bw = Math.max(3, gap * 0.36);
    view.forEach((v, i) => {
      const x = xOf(i);
      if (x < left - gap || x > left + width + gap) return;
      const isNew = i === view.length - 1;
      const y = yOf(isNew ? v * growIn : v);
      const a = A * fade(x) * edge(x) * (isNew ? growIn : 1);
      const bwi = bw * (id(i) % 3 === 1 ? 0.62 : 1);
      const col = bgx.createLinearGradient(0, b - chartH * 1.1, 0, y);
      col.addColorStop(0, "rgba(56,189,248,0)"); col.addColorStop(1, `rgba(56,189,248,${(0.05 * a).toFixed(3)})`);
      bgx.fillStyle = col; bgx.fillRect(x - bwi * 0.8, b - chartH * 1.1, bwi * 1.6, y - (b - chartH * 1.1));
      const g = bgx.createLinearGradient(0, y, 0, b);
      g.addColorStop(0, `rgba(125,211,252,${(0.6 * a).toFixed(3)})`);
      g.addColorStop(0.3, `rgba(59,130,246,${(0.38 * a).toFixed(3)})`);
      g.addColorStop(1, `rgba(30,64,175,${(0.08 * a).toFixed(3)})`);
      bgx.fillStyle = g; bgx.fillRect(x - bwi / 2, y, bwi, b - y);
      bgx.fillStyle = `rgba(186,230,253,${(0.55 * a).toFixed(3)})`; bgx.fillRect(x - bwi / 2, y, bwi, 1.2);
      const rh = Math.min(30 * l.scale, (b - y) * 0.3);
      const rg = bgx.createLinearGradient(0, b, 0, b + rh);
      rg.addColorStop(0, `rgba(59,130,246,${(0.18 * a).toFixed(3)})`); rg.addColorStop(1, "rgba(59,130,246,0)");
      bgx.fillStyle = rg; bgx.fillRect(x - bwi / 2, b + 2, bwi, rh);
    });

    // Trend line with a soft area under it.
    const pts = view.map((v, i) => {
      const prev = view[Math.max(0, i - 1)];
      const val = i === view.length - 1 ? prev + (v - prev) * growIn : v;
      return { x: xOf(i), y: yOf(val) - 14 * l.scale, v: val };
    });
    bgx.save();
    bgx.beginPath(); bgx.rect(left, 0, width + gap * 2, h); bgx.clip();
    const area = bgx.createLinearGradient(0, b - chartH, 0, b);
    area.addColorStop(0, `rgba(56,189,248,${(0.10 * A).toFixed(3)})`); area.addColorStop(1, "rgba(56,189,248,0)");
    bgx.fillStyle = area;
    bgx.beginPath();
    pts.forEach((p, i) => (i ? bgx.lineTo(p.x, p.y) : bgx.moveTo(p.x, p.y)));
    bgx.lineTo(pts[pts.length - 1].x, b); bgx.lineTo(pts[0].x, b); bgx.closePath(); bgx.fill();
    const lg = bgx.createLinearGradient(left, 0, left + width, 0);
    lg.addColorStop(0, "rgba(147,197,253,0)");
    lg.addColorStop(Math.min(0.25, gap / width), `rgba(147,197,253,${(0.12 * A).toFixed(3)})`);
    lg.addColorStop(1, `rgba(224,242,254,${(0.75 * A).toFixed(3)})`);
    bgx.strokeStyle = lg; bgx.lineWidth = 1.6; bgx.lineJoin = "round";
    bgx.beginPath();
    pts.forEach((p, i) => (i ? bgx.lineTo(p.x, p.y) : bgx.moveTo(p.x, p.y)));
    bgx.stroke();
    bgx.restore();
    bgx.font = `500 ${Math.round((small ? 9 : 11) * Math.max(0.8, l.scale))}px ${bodyFont}`;
    bgx.textAlign = "center";
    pts.forEach((p, i) => {
      const a = A * fade(p.x) * edge(p.x);
      if (id(i) % 2 === 0) { bgx.fillStyle = `rgba(224,242,254,${(0.7 * a).toFixed(3)})`; bgx.beginPath(); bgx.arc(p.x, p.y, 2.2 * l.scale + 0.6, 0, TAU); bgx.fill(); }
      if (id(i) % 6 === 4) { bgx.fillStyle = `rgba(191,219,254,${(0.5 * a).toFixed(3)})`; bgx.fillText(fmtNum((p.v / l.ref) * 12.4), p.x, p.y - 11); }
    });
    // A quiet arrowhead on the newest point.
    const e = pts[pts.length - 1], d = pts[pts.length - 2];
    if (e && d) {
      const ang = Math.atan2(e.y - d.y, e.x - d.x), L = (small ? 10 : 15) * l.scale;
      bgx.fillStyle = `rgba(224,242,254,${(0.8 * A).toFixed(3)})`;
      bgx.beginPath();
      bgx.moveTo(e.x + Math.cos(ang) * L, e.y + Math.sin(ang) * L);
      bgx.lineTo(e.x + Math.cos(ang + 2.5) * L * 0.75, e.y + Math.sin(ang + 2.5) * L * 0.75);
      bgx.lineTo(e.x + Math.cos(ang - 2.5) * L * 0.75, e.y + Math.sin(ang - 2.5) * L * 0.75);
      bgx.closePath(); bgx.fill();
    }
    // Slow lights travelling along the line.
    l.sparkClock += ms;
    if (l.sparkClock > 2600 && l.sparks.length < 2) { l.sparkClock = 0; l.sparks.push({ u: 0, sp: 0.000035 + Math.random() * 0.00002 }); }
    for (let i = l.sparks.length - 1; i >= 0; i--) {
      const s = l.sparks[i];
      s.u += s.sp * ms;
      if (s.u >= 1) { l.sparks.splice(i, 1); continue; }
      const f = s.u * (pts.length - 1), k = Math.floor(f), t = f - k;
      const p0 = pts[k], p1 = pts[Math.min(pts.length - 1, k + 1)];
      const x = p0.x + (p1.x - p0.x) * t, y = p0.y + (p1.y - p0.y) * t;
      const g = bgx.createRadialGradient(x, y, 0, x, y, 9);
      g.addColorStop(0, `rgba(224,242,254,${(0.6 * A * fade(x) * edge(x)).toFixed(3)})`); g.addColorStop(1, "rgba(96,165,250,0)");
      bgx.fillStyle = g; bgx.fillRect(x - 9, y - 9, 18, 18);
    }
  };

  const drawWorld = (clock: number, ms: number) => {
    const bw = Math.max(1, Math.round(w * BG_SCALE)), bh = Math.max(1, Math.round(h * BG_SCALE));
    if (bg.width !== bw || bg.height !== bh) { bg.width = bw; bg.height = bh; }
    bgx.setTransform(BG_SCALE, 0, 0, BG_SCALE, 0, 0);
    bgx.clearRect(0, 0, w, h);

    const base = Math.min(h - 12, copy.offsetTop + copy.offsetHeight + 40);
    const fullH = Math.max(60, base - (box.top + box.height * 0.72));
    // Dimmer in the middle, behind the headline.
    const fade = (x: number) => { const d = Math.abs(x / w - 0.5) * 2; return 0.14 + 0.86 * Math.min(1, d * d * 1.8); };

    // Light from the surface: wide, faint beams that sway very slowly.
    for (const r of rays) {
      const sway = Math.sin(clock * 0.00006 + r.ph);
      const x = (r.x + sway * 0.03) * w, wid = r.wid * w;
      const a = 0.03 + 0.02 * Math.sin(clock * 0.00009 + r.ph * 2);
      const g = bgx.createLinearGradient(0, 0, 0, h * 0.9);
      g.addColorStop(0, `rgba(56,189,248,${a.toFixed(3)})`); g.addColorStop(1, "rgba(56,189,248,0)");
      bgx.fillStyle = g;
      bgx.beginPath();
      bgx.moveTo(x - wid * 0.3, 0); bgx.lineTo(x + wid * 0.3, 0);
      bgx.lineTo(x + wid + sway * 40, h * 0.9); bgx.lineTo(x - wid + sway * 40, h * 0.9);
      bgx.closePath(); bgx.fill();
    }

    // Surface glow: a soft band of light at the top and two slow-drifting pools.
    const top = bgx.createLinearGradient(0, 0, 0, h * 0.45);
    top.addColorStop(0, `rgba(56,189,248,${(0.07 + 0.015 * Math.sin(clock * 0.00015)).toFixed(3)})`);
    top.addColorStop(1, "rgba(56,189,248,0)");
    bgx.fillStyle = top; bgx.fillRect(0, 0, w, h * 0.45);
    for (const p of pools) {
      const px = (p.x + Math.sin(clock * 0.00004 + p.ph) * 0.06) * w;
      const py = (p.y + Math.cos(clock * 0.00003 + p.ph) * 0.03) * h;
      const pr = p.r * w;
      const g = bgx.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, "rgba(96,165,250,0.08)"); g.addColorStop(1, "rgba(96,165,250,0)");
      bgx.fillStyle = g; bgx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }

    for (const l of layers) drawLayer(l, ms, base, fullH, fade);

    // A few bubbles rising slowly and wobbling.
    for (const b of bubbles) {
      b.y -= b.sp * ms;
      if (b.y < -0.05) { b.y = 1.05 + Math.random() * 0.5; b.x = Math.random(); }
      if (b.y > 1.02) continue;
      const x = b.x * w + Math.sin(clock * 0.0011 + b.ph) * 6, y = b.y * h;
      const a = 0.22 * fade(x);
      bgx.strokeStyle = `rgba(186,230,253,${a.toFixed(3)})`;
      bgx.lineWidth = 1;
      bgx.beginPath(); bgx.arc(x, y, b.r, 0, TAU); bgx.stroke();
      bgx.fillStyle = `rgba(224,242,254,${(a * 1.4).toFixed(3)})`;
      bgx.beginPath(); bgx.arc(x - b.r * 0.35, y - b.r * 0.35, b.r * 0.25, 0, TAU); bgx.fill();
    }

    // Drifting specks, very slow, rising with a gentle sway.
    for (const s of snow) {
      s.y -= s.sp * ms;
      if (s.y < -0.03) { s.y = 1.03; s.x = Math.random(); }
      const x = s.x * w + Math.sin(clock * 0.00012 + s.ph) * 14;
      const tw = 0.7 + 0.3 * Math.sin(clock * 0.0005 + s.ph);
      bgx.fillStyle = `rgba(165,200,240,${(s.a * tw).toFixed(3)})`;
      bgx.beginPath(); bgx.arc(x, s.y * h, s.r, 0, TAU); bgx.fill();
    }

    // Deep-water haze: darker towards the bottom and the edges.
    const haze = bgx.createLinearGradient(0, 0, 0, h);
    haze.addColorStop(0, "rgba(5,13,28,0.15)"); haze.addColorStop(1, "rgba(5,13,28,0.45)");
    bgx.fillStyle = haze; bgx.fillRect(0, 0, w, h);

    ctx.drawImage(bg, 0, 0, w, h);
  };

  // ---- loop -------------------------------------------------------------------------
  const buckets: number[][] = [];
  let raf = 0;
  let last = performance.now();
  let clock = 0;
  let started = false;
  let landAt = Infinity;
  let nextAt = Infinity;
  let landed = false;
  let xs = new Float32Array(0);

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const ms = Math.min(now - last, 50);
    last = now;
    clock += ms;

    if (started) {
      if (!landed && clock >= landAt) {
        landed = true;
        nextAt = clock + (current === 0 ? HOLD_FIRST : HOLD);
      } else if (landed && clock >= nextAt && phrases.length > 1) {
        landed = false;
        const n = (current + 1) % phrases.length;
        landAt = morph(clock, n);
        current = n;
      }
    }

    ctx.clearRect(0, 0, w, h);
    drawWorld(clock, ms);
    if (!started) return;

    // Text particles, projected from depth.
    const v = vp();
    const f = h * 1.15;
    for (const b of buckets) b.length = 0;
    if (xs.length < parts.length * 3) xs = new Float32Array(parts.length * 3);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const raw = (clock - p.t0) / p.dur;
      const u = raw <= 0 ? 0 : raw >= 1 ? 1 : (p.az > 0 && p.mz < p.az ? easeOut(raw) : easeInOut(raw));
      const a = (1 - u) * (1 - u), b2 = 2 * (1 - u) * u, c2 = u * u;
      let x = a * p.ax + b2 * p.mx + c2 * p.bx;
      let y = a * p.ay + b2 * p.my + c2 * p.by;
      const z = a * p.az + b2 * p.mz;
      if (u >= 1) {
        p.c = p.nc;
        // A very gentle wave runs through the letters, as if seen through still water.
        y += Math.sin(p.bx * 0.012 + clock * 0.0011) * 1.6;
        x += Math.sin(p.by * 0.02 + clock * 0.0008) * 0.7;
      } else if (u > 0.5) p.c = p.nc;
      const k = f / (f + z);
      xs[i * 3] = v.x + (x - v.x) * k;
      xs[i * 3 + 1] = v.y + (y - v.y) * k;
      xs[i * 3 + 2] = k;
      (buckets[p.c] ??= []).push(i);
    }
    for (let c = 0; c < buckets.length; c++) {
      const list = buckets[c];
      if (!list?.length) continue;
      ctx.fillStyle = palette[c] ?? "#fff";
      // Far particles faint; settled ones bright with a soft glow.
      for (const pass of [0, 1]) {
        ctx.globalAlpha = pass ? 1 : 0.45;
        ctx.shadowColor = pass ? glowColour[c] ?? "transparent" : "transparent";
        ctx.shadowBlur = pass ? 7 : 0;
        ctx.beginPath();
        for (const i of list) {
          const k = xs[i * 3 + 2];
          if ((k > 0.6) !== (pass === 1)) continue;
          const r = Math.max(0.5, dot * k);
          const x = xs[i * 3], y = xs[i * 3 + 1];
          ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
        }
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };

  // ---- sizing and start ------------------------------------------------------------
  const resize = () => {
    const hr = hero.getBoundingClientRect();
    const stage = hero.querySelector<HTMLElement>(".hero-stage");
    w = Math.max(1, Math.round(hr.width));
    h = Math.max(1, Math.round((stage ? stage.offsetTop : hr.height) + 160));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
    const need = Math.max(...targets.map((t) => t.length));
    while (parts.length < need) parts.push({ ax: 0, ay: 0, az: 0, mx: 0, my: 0, mz: 0, bx: 0, by: 0, t0: 0, dur: 1, c: 0, nc: 0, ph: Math.random() * TAU });
    parts.length = need;
    if (started) {
      // Re-seat particles on the new layout without replaying the intro.
      const t = targets[current];
      parts.forEach((p, i) => {
        const s = t[Math.floor((i * t.length) / parts.length)];
        p.ax = p.mx = p.bx = s.x; p.ay = p.my = p.by = s.y; p.az = p.mz = 0; p.c = p.nc = s.c; p.t0 = 0; p.dur = 1;
      });
    }
  };

  const begin = () => {
    if (started) return;
    started = true;
    landAt = intro(clock + 100);
  };

  const run = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const halt = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  let visible = true;
  const sync = () => (visible && !document.hidden ? run() : halt());
  new IntersectionObserver((e) => { visible = e[0]?.isIntersecting ?? false; sync(); }).observe(hero);
  document.addEventListener("visibilitychange", sync);
  let rt: number | undefined;
  new ResizeObserver(() => { window.clearTimeout(rt); rt = window.setTimeout(resize, 150); }).observe(hero);

  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    resize();
    sync();
    // Start when the intro has finished (or straight away without it).
    const loader = document.querySelector("[data-intro]");
    if (!loader || document.documentElement.classList.contains("skip-intro")) begin();
    else {
      window.addEventListener("optifin:intro-done", begin, { once: true });
      window.setTimeout(begin, 5000); // safety net
    }
  });
  return true;
}
