// Home hero scene: a deep, slow "living economy" and a headline built from
// particles that arrive from far behind it.
//
// Background (all drawn in perspective on one canvas, very slowly):
//  - a floor grid drifting towards the viewer, fading into the horizon,
//  - a distant skyline of chart bars whose heights breathe,
//  - pulses of light travelling across the floor like transactions,
//  - dust floating at different depths.
//  The cursor sways the camera a little, so the depth reads.
//
// Headline: particles fly in from deep behind the hero and settle into the
// words. Once they land, crisp real text fades in on top (so it is easy to
// read) and the particles shimmer underneath. Each change dissolves the text,
// sends the particles back into the depth in a left-to-right wave and brings
// them forward again as the next line.
//
// The real <h1> stays in the page (transparent while this runs) for search
// engines and screen readers; the canvas and the visible text copy are
// aria-hidden. Reduced motion: returns false and the plain <h1> shows.
// Slogans come from data-phrases on the <h1>: [{ "t": "plain", "a": "accent" }]
// and must be claims the released app supports.

interface Phrase { t: string; a: string }
interface Target { x: number; y: number; c: number }
interface Line { words: { text: string; accent: boolean }[]; y: number }
interface P {
  ax: number; ay: number; az: number; // path start
  mx: number; my: number; mz: number; // path control point (deep)
  bx: number; by: number;             // path end, on the text plane (z = 0)
  t0: number; dur: number;            // ms on the scene clock
  c: number; nc: number;              // colour index now / after the move
  ph: number;                         // shimmer phase
}

const HOLD_FIRST = 9000; // ms the headline stays readable
const HOLD = 6500;       // ms each slogan stays readable
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
  // The readable copy of the current line, drawn by the browser.
  const textLayer = document.createElement("div");
  textLayer.className = "hs-text";
  textLayer.setAttribute("aria-hidden", "true");
  copy.before(textLayer);
  title.classList.add("pt-live");

  const accentEl = title.querySelector(".gradient-text");
  const accent = (accentEl?.textContent ?? "").trim();
  const plain = (title.textContent ?? "").replace(accent, "").trim();
  let extra: Phrase[] = [];
  try { extra = JSON.parse(title.dataset.phrases || "[]"); } catch { extra = []; }
  const phrases: Phrase[] = [{ t: plain, a: accent }, ...extra];

  const small = window.matchMedia("(max-width: 700px)").matches;
  const MAX = small ? 1500 : 3600;

  let w = 0, h = 0, dpr = 1;
  let box = { left: 0, top: 0, width: 0, height: 0 };
  let font = { px: 60, lh: 64, ls: 0, css: "" };
  let palette: string[] = [];
  let targets: Target[][] = [];
  let lines: Line[][] = [];
  let dot = 1.2;
  const parts: P[] = [];
  let current = 0;

  // ---- text layout ------------------------------------------------------------
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
  const wrap = (p: Phrase, measure: (s: string) => number, space: number) => {
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
    probe.textAlign = "left";
    const measure = (s: string) => probe.measureText(s).width;
    const space = measure(" ") + font.ls;
    // CSS centres the font's ascent+descent box inside the line height; do the same.
    const m = probe.measureText("Hg");
    const asc = m.fontBoundingBoxAscent ?? font.px * 0.8, desc = m.fontBoundingBoxDescent ?? font.px * 0.2;
    const baseline = (lh: number) => (lh - (asc + desc)) / 2 + asc;
    const grad = probe.createLinearGradient(box.left, 0, box.left + box.width, 0);
    ACCENT.forEach((c, i) => grad.addColorStop(i / (ACCENT.length - 1), c));
    const cx = box.left + box.width / 2;

    let step = Math.max(3, Math.round(font.px / 24));
    const colourIndex = new Map<string, number>();
    palette = [];
    const sample = (rows: Line[], s: number) => {
      probe.clearRect(0, 0, w, h);
      for (const row of rows) {
        const lineW = row.words.reduce((sum, wd, j) => sum + measure(wd.text) + (j ? space : 0), 0);
        let x = cx - lineW / 2;
        for (const wd of row.words) {
          probe.fillStyle = wd.accent ? grad : "#ffffff";
          probe.fillText(wd.text, x, row.y - font.lh / 2 + baseline(font.lh));
          x += measure(wd.text) + space;
        }
      }
      const data = probe.getImageData(0, 0, w, h).data;
      const out: Target[] = [];
      for (let y = 0; y < h; y += s) {
        for (let x = 0; x < w; x += s) {
          const i = (y * w + x) * 4;
          if (data[i + 3] < 150) continue;
          const r = data[i] & 0xf0, g = data[i + 1] & 0xf0, b = data[i + 2] & 0xf0;
          const key = `${r},${g},${b}`;
          let c = colourIndex.get(key);
          if (c === undefined) { c = palette.length; palette.push(`rgb(${r + 8},${g + 8},${b + 8})`); colourIndex.set(key, c); }
          out.push({ x: x + (Math.random() - 0.5) * s * 0.6, y: y + (Math.random() - 0.5) * s * 0.6, c });
        }
      }
      // Left-to-right order, so a particle moves to the same part of the next line.
      return out.sort((a, b) => a.x - b.x || a.y - b.y);
    };
    lines = phrases.map((p) => wrap(p, measure, space));
    for (;;) {
      targets = lines.map((rows) => sample(rows, step));
      if (Math.max(...targets.map((t) => t.length)) <= MAX || step > 9) break;
      step += 1;
    }
    dot = Math.max(0.9, step * 0.36);
  };

  // Visible copy of a line, centred exactly like the sampled text.
  const showText = (n: number) => {
    textLayer.innerHTML = "";
    textLayer.style.font = font.css;
    textLayer.style.letterSpacing = `${font.ls}px`;
    const cx = box.left + box.width / 2;
    for (const row of lines[n]) {
      const el = document.createElement("div");
      el.className = "hs-line";
      el.style.top = `${row.y - font.lh / 2}px`;
      el.style.height = el.style.lineHeight = `${font.lh}px`;
      el.style.left = `${cx}px`;
      row.words.forEach((wd, i) => {
        if (i) el.append(" ");
        const span = document.createElement("span");
        span.textContent = wd.text;
        if (wd.accent) span.className = "hs-accent";
        el.append(span);
      });
      textLayer.append(el);
    }
    // One gradient across the whole headline width, like the particles.
    requestAnimationFrame(() => {
      const lb = textLayer.getBoundingClientRect();
      textLayer.querySelectorAll<HTMLElement>(".hs-accent").forEach((s) => {
        const r = s.getBoundingClientRect();
        s.style.backgroundSize = `${box.width}px 100%`;
        s.style.backgroundPosition = `${-(r.left - lb.left - box.left)}px 0`;
      });
    });
  };

  // ---- particle paths ------------------------------------------------------------
  // Each particle follows a curve: start → control point → end. The control
  // point sits deep in the scene, so moves sweep back into the distance.
  const vp = () => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

  const intro = (now: number) => {
    const t = targets[current];
    const v = vp();
    let last = 0;
    parts.forEach((p, i) => {
      const s = t[Math.floor((i * t.length) / parts.length)];
      const z = 2400 + Math.random() * 2600;
      const sx = s.x + (Math.random() - 0.5) * w * 0.5;
      const sy = s.y + (Math.random() - 0.5) * h * 0.5;
      p.ax = sx; p.ay = sy; p.az = z;
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

  // ---- the living economy (background) -------------------------------------------
  const F = () => h * 1.15;
  const bars = Array.from({ length: 110 }, (_, i) => ({
    x: (i - 55) * 64 + (Math.random() - 0.5) * 20,
    base: 40 + Math.random() * 300 * (1 - Math.abs(i - 55) / 80),
    amp: 0.12 + Math.random() * 0.22,
    ph: Math.random() * TAU,
    sp: 0.00012 + Math.random() * 0.0002,
    c: Math.random() < 0.55 ? [45, 212, 191] : [59, 130, 246],
  }));
  const dust = Array.from({ length: small ? 70 : 150 }, () => ({
    x: (Math.random() - 0.5) * 3200, y: -700 + Math.random() * 1000, z: 150 + Math.random() * 4000, r: 0.6 + Math.random() * 1.2,
  }));
  const pulses: { lane: number; z: number; sp: number; c: string }[] = [];
  let pulseClock = 0;

  const camera = { x: 0, y: 0, tx: 0, ty: 0 };
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    camera.tx = ((e.clientX - r.left) / r.width - 0.5) * -60;
    camera.ty = ((e.clientY - r.top) / r.height - 0.5) * -24;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { camera.tx = 0; camera.ty = 0; });

  const drawWorld = (clock: number, dt: number) => {
    const f = F();
    const cx = w / 2 + camera.x;
    const copyBottom = copy.offsetTop + copy.offsetHeight;
    const horizon = Math.min(h - 40, copyBottom - 8) + camera.y;
    const camH = 150;

    // Skyline: distant chart bars that rise and fall slowly.
    const zFar = 4200;
    const s = f / zFar;
    for (const b of bars) {
      const hgt = b.base * (1 + Math.sin(clock * b.sp + b.ph) * b.amp) * s;
      const x = cx + b.x * s;
      const bw = 30 * s;
      if (x < -bw || x > w + bw) continue;
      const g = ctx.createLinearGradient(0, horizon - hgt, 0, horizon);
      g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.13)`);
      g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - bw / 2, horizon - hgt, bw, hgt);
      ctx.fillStyle = `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.32)`;
      ctx.fillRect(x - bw / 2, horizon - hgt, bw, Math.max(1, 1.2));
    }
    // Horizon glow.
    const hg = ctx.createLinearGradient(0, horizon - 40, 0, horizon + 40);
    hg.addColorStop(0, "rgba(45,212,191,0)");
    hg.addColorStop(0.5, "rgba(56,189,248,0.10)");
    hg.addColorStop(1, "rgba(45,212,191,0)");
    ctx.fillStyle = hg;
    ctx.fillRect(0, horizon - 40, w, 80);

    // Floor grid drifting towards the viewer.
    ctx.lineWidth = 1;
    const near = 60, far = 4200, gap = 260;
    const drift = (clock * 0.045) % gap;
    for (let z = far - ((far - near) % gap) - drift; z > near; z -= gap) {
      const y = horizon + (camH * f) / z;
      if (y > h) continue;
      const fade = Math.min(1, (y - horizon) / 90) * 0.13;
      ctx.strokeStyle = `rgba(94,234,212,${fade.toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let k = -16; k <= 16; k++) {
      const X = k * 220;
      const x1 = cx + (X * f) / far, y1 = horizon + (camH * f) / far;
      const x2 = cx + (X * f) / near, y2 = horizon + (camH * f) / near;
      const g = ctx.createLinearGradient(0, y1, 0, Math.min(h, y2));
      g.addColorStop(0, "rgba(59,130,246,0)");
      g.addColorStop(1, "rgba(59,130,246,0.14)");
      ctx.strokeStyle = g;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    // Transactions: pulses running along the floor towards the viewer.
    pulseClock += dt * 16.667;
    if (pulseClock > 900 && pulses.length < 12) {
      pulseClock = 0;
      pulses.push({ lane: (Math.floor(Math.random() * 25) - 12) * 220, z: far, sp: 3 + Math.random() * 3, c: Math.random() < 0.6 ? "94,234,212" : "96,165,250" });
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.z -= p.sp * dt;
      if (p.z < near + 20) { pulses.splice(i, 1); continue; }
      const zt = Math.min(far, p.z + 420);
      const xa = cx + (p.lane * f) / p.z, ya = horizon + (camH * f) / p.z;
      const xb = cx + (p.lane * f) / zt, yb = horizon + (camH * f) / zt;
      if (ya > h + 20) continue;
      const a = Math.min(1, (far - p.z) / 900) * 0.7;
      const g = ctx.createLinearGradient(xb, yb, xa, ya);
      g.addColorStop(0, `rgba(${p.c},0)`);
      g.addColorStop(1, `rgba(${p.c},${a.toFixed(3)})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = Math.max(1, (2.2 * f) / p.z * 6);
      ctx.beginPath(); ctx.moveTo(xb, yb); ctx.lineTo(xa, ya); ctx.stroke();
    }
    ctx.lineWidth = 1;

    // Dust at many depths, drifting slowly forward.
    for (const d of dust) {
      d.z -= 0.55 * dt;
      if (d.z < 120) { d.z = 4200; d.x = (Math.random() - 0.5) * 3200; }
      const k = f / d.z;
      const x = cx + d.x * k, y = horizon + d.y * k;
      if (x < 0 || x > w || y < 0 || y > h) continue;
      const a = Math.min(0.55, (1 - d.z / 4200) * 0.6);
      ctx.fillStyle = `rgba(148,197,253,${a.toFixed(3)})`;
      ctx.fillRect(x, y, d.r * k * 1.4 + 0.4, d.r * k * 1.4 + 0.4);
    }
  };

  // ---- loop -------------------------------------------------------------------------
  const buckets: number[][] = [];
  let raf = 0;
  let last = performance.now();
  let clock = 0;
  let started = false;
  let landAt = Infinity;   // when the current line has formed
  let nextAt = Infinity;   // when to start the next change
  let textOn = false;
  let glow = 1;            // particle brightness; dims while the crisp text shows

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const ms = Math.min(now - last, 50);
    const dt = ms / 16.667;
    last = now;
    clock += ms;
    camera.x += (camera.tx - camera.x) * 0.03;
    camera.y += (camera.ty - camera.y) * 0.03;

    if (started) {
      if (!textOn && clock >= landAt) {
        textOn = true;
        textLayer.classList.add("is-on");
        nextAt = clock + (current === 0 ? HOLD_FIRST : HOLD);
      } else if (textOn && clock >= nextAt && phrases.length > 1) {
        textOn = false;
        textLayer.classList.remove("is-on");
        const n = (current + 1) % phrases.length;
        const begin = clock + 420; // let the text fade before the particles move
        landAt = morph(begin, n);
        current = n;
        window.setTimeout(() => showText(n), 700);
      }
    }
    glow += ((textOn ? 0.16 : 1) - glow) * 0.04;

    ctx.clearRect(0, 0, w, h);
    drawWorld(clock, dt);
    if (!started) return;

    // Text particles, projected from depth.
    const v = vp();
    const f = F();
    for (const b of buckets) b.length = 0;
    const xs = new Float32Array(parts.length * 3);
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
        x += Math.sin(clock * 0.0016 + p.ph) * 0.5;
        y += Math.cos(clock * 0.0021 + p.ph) * 0.5;
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
      // Two passes: far particles faint, near ones bright (cheap depth fog).
      for (const pass of [0, 1]) {
        ctx.globalAlpha = (pass ? 1 : 0.45) * glow;
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
      showText(current);
    }
  };

  const begin = () => {
    if (started) return;
    started = true;
    showText(current);
    landAt = intro(clock + 100) + 150;
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
    // Start when the intro loader has finished (or straight away without it).
    const loader = document.querySelector("[data-intro]");
    if (!loader || document.documentElement.classList.contains("skip-intro")) begin();
    else {
      window.addEventListener("optifin:intro-done", begin, { once: true });
      window.setTimeout(begin, 5000); // safety net
    }
  });
  return true;
}
