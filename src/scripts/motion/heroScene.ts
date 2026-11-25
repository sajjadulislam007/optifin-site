// Home hero scene: a live, glowing growth chart in the background and a
// headline built from particles that fly in from deep behind it.
//
// Background (one canvas, slow and continuous):
//  - glowing bars with light columns and floor reflections; the chart scrolls
//    slowly as new bars grow in from the right,
//  - a rising trend line through the bar tops, with glowing nodes, value
//    labels that count, an arrowhead and sparks travelling along it,
//  - soft bokeh lights drifting upward and a bright floor line.
//  It is dimmer in the middle, behind the headline, and brighter at the sides.
//  The figures are abstract (no currency, no axis), so they are not claims.
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

  // ---- background: the live growth chart --------------------------------------
  // A random walk with an upward drift; the chart shows a moving window of it.
  const series: number[] = [];
  let level = 20;
  // Steady climb with noise, like the growth chart it imitates. Values are
  // rebased now and then so they never grow without limit; labels are shown
  // relative to the left edge, so rebasing is invisible.
  const nextValue = () => { level = Math.max(1, level * (1 + 0.045 + (Math.random() - 0.45) * 0.11)); return level; };
  for (let i = 0; i < 40; i++) series.push(nextValue());
  const BAR_EVERY = 2600;   // ms between new bars
  let scroll = 0;           // 0..1 progress towards the next bar
  let scaleMax = Math.max(...series.slice(-30));
  const sparks: { u: number; sp: number }[] = [];
  let sparkClock = 0;
  const bokeh = Array.from({ length: small ? 26 : 60 }, () => ({
    x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 2.6, sp: 0.00002 + Math.random() * 0.00005, ph: Math.random() * TAU, a: 0.15 + Math.random() * 0.45,
  }));
  const fmtNum = (n: number) => Math.round(n * 1000).toLocaleString("en-US");

  const drawWorld = (clock: number, ms: number) => {
    const visibleBars = small ? 14 : 26;
    scroll += ms / BAR_EVERY;
    if (scroll >= 1) {
      scroll -= 1; series.push(nextValue()); if (series.length > 80) series.shift();
      if (level > 1e6) { const k = 1e-3; for (let i = 0; i < series.length; i++) series[i] *= k; level *= k; scaleMax *= k; }
    }
    const view = series.slice(-(visibleBars + 2));
    scaleMax += (Math.max(...view) * 1.08 - scaleMax) * 0.01; // the scale follows the data smoothly

    const base = Math.min(h - 12, copy.offsetTop + copy.offsetHeight + 46);
    const top = box.top + box.height * 0.72; // peaks stay below the headline
    const chartH = base - top;
    const left = w * 0.02, right = w * 0.88;
    const gap = (right - left) / (visibleBars - 1);
    const xOf = (i: number) => left + (i - scroll) * gap;      // i = index in view
    const growIn = Math.min(1, scroll * 3);                     // the newest bar grows up
    const yOf = (v: number) => base - (v / scaleMax) * chartH;
    // Dimmer in the middle, behind the headline.
    const fade = (x: number) => { const d = Math.abs(x / w - 0.5) * 2; return 0.16 + 0.84 * Math.min(1, d * d * 1.8); };

    // Floor line and glow.
    const fl = ctx.createLinearGradient(0, 0, w, 0);
    fl.addColorStop(0, "rgba(59,130,246,0)"); fl.addColorStop(0.5, "rgba(96,165,250,0.55)"); fl.addColorStop(1, "rgba(59,130,246,0)");
    ctx.fillStyle = fl; ctx.fillRect(0, base, w, 1.5);
    const fg = ctx.createLinearGradient(0, base - 30, 0, base + 40);
    fg.addColorStop(0, "rgba(37,99,235,0)"); fg.addColorStop(0.45, "rgba(37,99,235,0.16)"); fg.addColorStop(1, "rgba(37,99,235,0)");
    ctx.fillStyle = fg; ctx.fillRect(0, base - 30, w, 70);

    // Bars, light columns and reflections.
    const bw = Math.max(5, gap * 0.34);
    view.forEach((v, i) => {
      const x = xOf(i);
      if (x < -gap || x > w + gap) return;
      const isNew = i === view.length - 1;
      const val = isNew ? v * growIn : v;
      const y = yOf(val);
      const a = fade(x) * (isNew ? growIn : 1);
      const narrow = i % 3 === 1 ? 0.6 : 1;
      const bwi = bw * narrow;
      // Light column above the bar.
      const col = ctx.createLinearGradient(0, top - 40, 0, y);
      col.addColorStop(0, "rgba(56,189,248,0)"); col.addColorStop(1, `rgba(56,189,248,${(0.07 * a).toFixed(3)})`);
      ctx.fillStyle = col; ctx.fillRect(x - bwi * 0.8, top - 40, bwi * 1.6, y - top + 40);
      // The bar.
      const g = ctx.createLinearGradient(0, y, 0, base);
      g.addColorStop(0, `rgba(125,211,252,${(0.85 * a).toFixed(3)})`);
      g.addColorStop(0.25, `rgba(59,130,246,${(0.55 * a).toFixed(3)})`);
      g.addColorStop(1, `rgba(37,99,235,${(0.12 * a).toFixed(3)})`);
      ctx.fillStyle = g; ctx.fillRect(x - bwi / 2, y, bwi, base - y);
      ctx.fillStyle = `rgba(224,242,254,${(0.9 * a).toFixed(3)})`; ctx.fillRect(x - bwi / 2, y, bwi, 1.5);
      // Reflection on the floor.
      const rh = Math.min(46, (base - y) * 0.35);
      const rg = ctx.createLinearGradient(0, base, 0, base + rh);
      rg.addColorStop(0, `rgba(59,130,246,${(0.28 * a).toFixed(3)})`); rg.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = rg; ctx.fillRect(x - bwi / 2, base + 2, bwi, rh);
    });

    // Trend line through the bar tops (the newest point eases in).
    const pts: { x: number; y: number; v: number }[] = view.map((v, i) => {
      const isNew = i === view.length - 1;
      const prev = view[Math.max(0, i - 1)];
      const val = isNew ? prev + (v - prev) * growIn : v;
      return { x: xOf(i), y: yOf(val) - 18, v: val };
    });
    ctx.save();
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(96,165,250,0.9)";
    ctx.shadowBlur = 12;
    const lg = ctx.createLinearGradient(0, 0, w, 0);
    lg.addColorStop(0, "rgba(147,197,253,0.15)"); lg.addColorStop(0.45, "rgba(147,197,253,0.35)"); lg.addColorStop(1, "rgba(224,242,254,0.95)");
    ctx.strokeStyle = lg;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    // Nodes and labels.
    ctx.font = `600 ${small ? 10 : 12}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = "center";
    pts.forEach((p, i) => {
      if (p.x < 0 || p.x > w) return;
      const a = fade(p.x);
      if (i % 2 === 0 || i === pts.length - 1) {
        ctx.fillStyle = `rgba(224,242,254,${(0.9 * a).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, TAU); ctx.fill();
      }
      if (i % 5 === 3 || i === pts.length - 2) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(191,219,254,${(0.7 * a).toFixed(3)})`;
        ctx.fillText(fmtNum((p.v / view[0]) * 12.4), p.x, p.y - 14);
        ctx.shadowBlur = 12;
      }
    });
    // Arrowhead on the newest point.
    const e = pts[pts.length - 1], d = pts[pts.length - 2];
    if (e && d) {
      const ang = Math.atan2(e.y - d.y, e.x - d.x);
      const L = small ? 14 : 22;
      ctx.fillStyle = "rgba(240,249,255,0.95)";
      ctx.shadowColor = "rgba(147,197,253,1)";
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(ang) * L, e.y + Math.sin(ang) * L);
      ctx.lineTo(e.x + Math.cos(ang + 2.5) * L * 0.75, e.y + Math.sin(ang + 2.5) * L * 0.75);
      ctx.lineTo(e.x + Math.cos(ang - 2.5) * L * 0.75, e.y + Math.sin(ang - 2.5) * L * 0.75);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // Sparks travelling along the line towards the arrow.
    sparkClock += ms;
    if (sparkClock > 700 && sparks.length < 6) { sparkClock = 0; sparks.push({ u: 0, sp: 0.00012 + Math.random() * 0.00008 }); }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.u += s.sp * ms;
      if (s.u >= 1) { sparks.splice(i, 1); continue; }
      const f = s.u * (pts.length - 1);
      const k = Math.floor(f), t = f - k;
      const p0 = pts[k], p1 = pts[Math.min(pts.length - 1, k + 1)];
      const x = p0.x + (p1.x - p0.x) * t, y = p0.y + (p1.y - p0.y) * t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
      g.addColorStop(0, `rgba(240,249,255,${(0.9 * fade(x)).toFixed(3)})`); g.addColorStop(1, "rgba(96,165,250,0)");
      ctx.fillStyle = g; ctx.fillRect(x - 10, y - 10, 20, 20);
    }

    // Bokeh drifting upward.
    for (const b of bokeh) {
      b.y -= b.sp * ms;
      if (b.y < -0.05) { b.y = 1.05; b.x = Math.random(); }
      const x = b.x * w + Math.sin(clock * 0.0003 + b.ph) * 12;
      const y = b.y * h;
      const tw = 0.6 + 0.4 * Math.sin(clock * 0.0012 + b.ph);
      ctx.fillStyle = `rgba(147,197,253,${(b.a * tw * fade(x)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, b.r, 0, TAU); ctx.fill();
    }
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
        x += Math.sin(clock * 0.0014 + p.ph) * 0.3;
        y += Math.cos(clock * 0.0019 + p.ph) * 0.3;
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
