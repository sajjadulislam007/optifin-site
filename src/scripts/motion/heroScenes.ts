// Background scenes for the banner (PageHero) particle headlines. Each scene
// is a small, slow, analytics-styled picture matched to the page's topic,
// drawn into the hero engine's low-resolution background buffer (so it looks
// soft and far away). Figures are abstract shapes or plain numbers, never
// currency or claims. The engine adds the shared underwater atmosphere
// (light rays, glow, specks, bubbles, haze) around whatever a scene draws.
//
// A scene draws inside env.region (the open side of the banner) and passes
// every alpha through env.fade(x), which is dim where the title sits.

export interface SceneEnv {
  g: CanvasRenderingContext2D;
  w: number; h: number;
  clock: number; ms: number;
  small: boolean;
  font: string;
  fade: (x: number) => number;
  region: { x0: number; x1: number; y0: number; y1: number };
}
export type Scene = (env: SceneEnv) => void;

const TAU = Math.PI * 2;
const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const TEAL = [45, 212, 191], SKY = [56, 189, 248], BLUE = [59, 130, 246], PALE = [186, 230, 253];
const GREEN = [61, 220, 151], CORAL = [248, 113, 113], AMBER = [251, 191, 36], SLATE = [148, 163, 184];
const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
  else g.rect(x, y, w, h);
}
// Frosted panel: the building block of most scenes.
function panel(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a: number) {
  rr(g, x, y, w, h, Math.min(14, h * 0.18));
  g.fillStyle = rgba([13, 31, 58], 0.62 * a); g.fill();
  g.strokeStyle = rgba(PALE, 0.16 * a); g.lineWidth = 1; g.stroke();
  // Soft highlight along the top edge.
  const hl = g.createLinearGradient(0, y, 0, y + h * 0.4);
  hl.addColorStop(0, rgba(PALE, 0.07 * a)); hl.addColorStop(1, rgba(PALE, 0));
  g.fillStyle = hl; rr(g, x, y, w, h * 0.4, Math.min(14, h * 0.18)); g.fill();
}
const bar = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: number[], a: number) => {
  rr(g, x, y, w, h, h / 2); g.fillStyle = rgba(c, a); g.fill();
};
function spark(g: CanvasRenderingContext2D, pts: number[], x: number, y: number, w: number, h: number, c: number[], a: number, area = true) {
  const n = pts.length, max = Math.max(...pts), min = Math.min(...pts), span = max - min || 1;
  const P = pts.map((v, i) => [x + (i / (n - 1)) * w, y + h - ((v - min) / span) * h]);
  if (area) {
    const gr = g.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, rgba(c, 0.22 * a)); gr.addColorStop(1, rgba(c, 0));
    g.beginPath(); P.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); g.fillStyle = gr; g.fill();
  }
  g.beginPath(); P.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
  g.strokeStyle = rgba(c, 0.85 * a); g.lineWidth = 1.5; g.lineJoin = "round"; g.stroke();
  return P;
}
const walk = (n: number, start = 50, drift = 0.6) => {
  const out = [start];
  for (let i = 1; i < n; i++) out.push(Math.max(5, out[i - 1] + rnd(-4, 4) + drift));
  return out;
};

// ---- Profit dashboard: floating KPI panels at different depths --------------
function dashboard(): Scene {
  type Card = { u: number; v: number; z: number; kind: number; data: number[]; ph: number; tick: number; val: number };
  const cards: Card[] = [];
  return (e) => {
    const { g, region: R, clock, ms, fade, small } = e;
    if (!cards.length) {
      const cols = small ? 2 : 3, rowsN = small ? 2 : 3;
      for (let r = 0; r < rowsN; r++) for (let c = 0; c < cols; c++) {
        if (!small && (r + c) % 4 === 3) continue; // leave a little air
        const u = (c + rnd(0.15, 0.85)) / cols, v = (r + rnd(0.15, 0.85)) / rowsN;
        cards.push({ u, v, z: rnd(0.55, 1), kind: (r * cols + c) % 3, data: walk(18, rnd(30, 60)), ph: rnd(0, TAU), tick: rnd(0, 1600), val: rnd(1, 9) });
      }
      cards.sort((a, b) => a.z - b.z);
    }
    for (const c of cards) {
      c.tick += ms;
      if (c.tick > 1700) { c.tick = 0; c.data.push(Math.max(5, c.data[c.data.length - 1] + rnd(-4, 5))); c.data.shift(); c.val *= 1 + rnd(-0.01, 0.025); }
      const cw = (c.kind === 1 ? 230 : 180) * c.z, ch = (c.kind === 1 ? 120 : 96) * c.z;
      const x = lerp(R.x0, R.x1 - cw, c.u) + Math.sin(clock * 0.00012 + c.ph) * 14 * c.z;
      const y = lerp(R.y0, R.y1 - ch, c.v) + Math.cos(clock * 0.0001 + c.ph) * 10 * c.z;
      const a = (0.25 + 0.75 * c.z) * fade(x + cw / 2) * 0.9;
      panel(g, x, y, cw, ch, a);
      const p = 12 * c.z;
      bar(g, x + p, y + p, cw * 0.35, 5 * c.z, SLATE, 0.45 * a);
      if (c.kind === 2) {
        // Donut gauge.
        const r = ch * 0.28, cx = x + cw * 0.3, cy = y + ch * 0.6, frac = 0.55 + 0.25 * Math.sin(clock * 0.00025 + c.ph);
        g.lineWidth = 6 * c.z; g.lineCap = "round";
        g.strokeStyle = rgba(SLATE, 0.18 * a); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
        g.strokeStyle = rgba(TEAL, 0.85 * a); g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + frac * TAU); g.stroke();
        g.lineCap = "butt";
        bar(g, x + cw * 0.58, y + ch * 0.45, cw * 0.3, 8 * c.z, PALE, 0.55 * a);
        bar(g, x + cw * 0.58, y + ch * 0.62, cw * 0.22, 5 * c.z, SLATE, 0.35 * a);
      } else {
        g.font = `600 ${Math.round(17 * c.z)}px ${e.font}`;
        g.fillStyle = rgba(PALE, 0.8 * a); g.textAlign = "left";
        g.fillText(c.kind === 1 ? `${(c.val * 4.2).toFixed(1)}%` : Math.round(c.val * 1840).toLocaleString("en-US"), x + p, y + p + 26 * c.z);
        bar(g, x + cw - p - 42 * c.z, y + p + 12 * c.z, 42 * c.z, 12 * c.z, GREEN, 0.22 * a);
        spark(g, c.data, x + p, y + ch * 0.55, cw - p * 2, ch * 0.32, c.kind === 1 ? SKY : TEAL, a);
      }
    }
  };
}

// ---- Costs: a revenue-to-profit waterfall that keeps re-balancing ------------
function costs(): Scene {
  const labels = ["Revenue", "COGS", "Shipping", "Fees", "Ads", "Operating", "Profit"];
  let cur = [0.3, 0.1, 0.05, 0.08, 0.07], next = cur.slice(), t = 1, timer = 0, built = 0;
  return (e) => {
    const { g, region: R, ms, fade, small } = e;
    timer += ms; built = Math.min(1, built + ms / 4200);
    if (timer > 9000) { timer = 0; cur = cur.map((v, i) => lerp(v, next[i], ease(t))); next = [rnd(0.24, 0.34), rnd(0.06, 0.12), rnd(0.03, 0.07), rnd(0.05, 0.09), rnd(0.04, 0.1)]; t = 0; }
    t = Math.min(1, t + ms / 2600);
    const vals = cur.map((v, i) => lerp(v, next[i], ease(t)));
    const profit = 1 - vals.reduce((a, b) => a + b, 0);
    const layers = [1];
    for (const z of layers) {
      const W = (R.x1 - R.x0) * 0.96, H = (R.y1 - R.y0) * 0.86 * z;
      const x0 = R.x1 - W - (z === 1 ? 0 : W * 0.25), base = R.y1 - (z === 1 ? 0 : H * 0.55);
      const n = 7, gap = W / n, bw = gap * 0.56;
      const A = z === 1 ? 0.95 : 0.38;
      // Gridlines.
      g.setLineDash([3, 6]);
      for (let k = 1; k <= 3; k++) { const y = base - (H * k) / 3; g.strokeStyle = rgba(SLATE, 0.08 * A); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + W, y); g.stroke(); }
      g.setLineDash([]);
      let level = 1;
      for (let i = 0; i < n; i++) {
        const show = ease(Math.min(1, Math.max(0, built * n - i)));
        if (show <= 0) continue;
        const x = x0 + i * gap + (gap - bw) / 2;
        const a = A * fade(x) * show;
        let top: number, bot: number, col: number[];
        if (i === 0) { top = 1; bot = 0; col = BLUE; }
        else if (i === n - 1) { top = profit; bot = 0; col = GREEN; }
        else { top = level; bot = level - vals[i - 1]; level = bot; col = CORAL; }
        const yT = base - top * H, yB = base - bot * H;
        const gr = g.createLinearGradient(0, yT, 0, yB);
        gr.addColorStop(0, rgba(col, 0.75 * a)); gr.addColorStop(1, rgba(col, 0.25 * a));
        rr(g, x, yT, bw, Math.max(2, (yB - yT) * show), 3); g.fillStyle = gr; g.fill();
        g.fillStyle = rgba(PALE, 0.7 * a); g.fillRect(x, yT, bw, 1.2);
        // Connector to the next bar.
        if (i < n - 1) { g.strokeStyle = rgba(SLATE, 0.25 * a); g.setLineDash([2, 4]); g.beginPath(); g.moveTo(x + bw, i === 0 ? yT : yB); g.lineTo(x + gap, i === 0 ? yT : yB); g.stroke(); g.setLineDash([]); }
        if (z === 1 && !small) {
          g.font = `500 11px ${e.font}`; g.textAlign = "center"; g.fillStyle = rgba(SLATE, 0.7 * a);
          g.fillText(labels[i], x + bw / 2, base + 16);
        }
      }
      g.fillStyle = rgba(BLUE, 0.3 * A); g.fillRect(x0, base, W, 1);
    }
  };
}

// ---- Orders and products: a live order feed receding into depth ---------------
function orders(): Scene {
  type Row = { y: number; good: boolean; w1: number; w2: number; id: number };
  const rows: Row[] = [];
  let timer = 0, id = 1040;
  const cubes = Array.from({ length: 5 }, () => ({ u: rnd(0.1, 0.95), v: rnd(0, 0.35), s: rnd(10, 22), ph: rnd(0, TAU) }));
  return (e) => {
    const { g, region: R, ms, clock, fade, small } = e;
    timer += ms;
    if (!rows.length) for (let i = 0; i < 9; i++) rows.push({ y: i / 9, good: Math.random() > 0.22, w1: rnd(0.3, 0.6), w2: rnd(0.2, 0.5), id: id++ });
    const speed = ms / 26000;
    for (const r of rows) r.y -= speed;
    if (rows[0] && rows[0].y < -0.12) rows.shift();
    if (timer > 2800) { timer = 0; rows.push({ y: (rows[rows.length - 1]?.y ?? 0.9) + 1 / 9, good: Math.random() > 0.22, w1: rnd(0.3, 0.6), w2: rnd(0.2, 0.5), id: id++ }); }
    // Product cubes far away.
    for (const c of cubes) {
      const x = lerp(R.x0, R.x1, c.u), y = R.y0 + c.v * (R.y1 - R.y0) + Math.sin(clock * 0.0002 + c.ph) * 8;
      const a = 0.35 * fade(x), s = c.s;
      g.fillStyle = rgba(BLUE, 0.35 * a); g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y - s * 0.5); g.lineTo(x, y - s); g.lineTo(x - s, y - s * 0.5); g.closePath(); g.fill();
      g.fillStyle = rgba(SKY, 0.25 * a); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + s); g.lineTo(x - s, y + s * 0.5); g.lineTo(x - s, y - s * 0.5); g.closePath(); g.fill();
      g.fillStyle = rgba(TEAL, 0.2 * a); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + s); g.lineTo(x + s, y + s * 0.5); g.lineTo(x + s, y - s * 0.5); g.closePath(); g.fill();
    }
    // Feed: rows shrink and fade as they rise (further away).
    const W = (R.x1 - R.x0) * 0.92, cx = (R.x0 + R.x1) / 2 + W * 0.02;
    for (const r of rows) {
      if (r.y < -0.12 || r.y > 1.05) continue;
      const depth = 0.55 + 0.45 * Math.max(0, Math.min(1, r.y));
      const rw = W * depth, rh = (small ? 26 : 34) * depth;
      const x = cx - rw / 2, y = R.y0 + r.y * (R.y1 - R.y0);
      const inA = Math.min(1, (1.05 - r.y) * 5) * Math.min(1, (r.y + 0.12) * 6);
      const a = inA * depth * fade(cx) * 0.95;
      panel(g, x, y, rw, rh, a);
      const p = 10 * depth;
      g.font = `500 ${Math.round(11 * depth)}px ${e.font}`; g.textAlign = "left"; g.fillStyle = rgba(SLATE, 0.75 * a);
      g.fillText(`#${r.id}`, x + p, y + rh * 0.62);
      g.fillStyle = rgba(BLUE, 0.5 * a); g.fillRect(x + p + 46 * depth, y + rh * 0.28, rh * 0.44, rh * 0.44);
      bar(g, x + p + 46 * depth + rh * 0.6, y + rh * 0.42, rw * 0.28 * r.w1, 5 * depth, PALE, 0.4 * a);
      const col = r.good ? GREEN : CORAL;
      bar(g, x + rw - p - rw * 0.24 * r.w2 - 30 * depth, y + rh * 0.42, rw * 0.24 * r.w2, 5 * depth, col, 0.65 * a);
      g.fillStyle = rgba(col, 0.9 * a); g.beginPath(); g.arc(x + rw - p - 8 * depth, y + rh / 2, 3.2 * depth, 0, TAU); g.fill();
    }
  };
}

// ---- Customers: cohort retention heatmap with a slow light sweep + orbits ----
function customers(): Scene {
  const N = 9;
  const cells: number[][] = Array.from({ length: N }, (_, r) => Array.from({ length: N - r }, (_, c) => Math.max(0.08, (c === 0 ? 1 : 0.62 * Math.pow(0.86, c)) * rnd(0.85, 1.1))));
  const dots = Array.from({ length: 14 }, (_, i) => ({ ring: i % 3, t: rnd(0, TAU), sp: rnd(0.00004, 0.00009) }));
  return (e) => {
    const { g, region: R, clock, ms, fade, small } = e;
    // Orbits (segments) far behind.
    const ox = R.x1 - (R.x1 - R.x0) * 0.22, oy = R.y0 + (R.y1 - R.y0) * 0.3;
    for (let k = 0; k < 3; k++) {
      const rx = (60 + k * 46) * (small ? 0.7 : 1), ry = rx * 0.38;
      g.strokeStyle = rgba(SKY, 0.12 * fade(ox)); g.lineWidth = 1;
      g.beginPath(); g.ellipse(ox, oy, rx, ry, -0.25, 0, TAU); g.stroke();
    }
    for (const d of dots) {
      d.t += d.sp * ms;
      const rx = (60 + d.ring * 46) * (small ? 0.7 : 1), ry = rx * 0.38;
      const x = ox + Math.cos(d.t) * rx * Math.cos(-0.25) - Math.sin(d.t) * ry * Math.sin(-0.25);
      const y = oy + Math.cos(d.t) * rx * Math.sin(-0.25) + Math.sin(d.t) * ry * Math.cos(-0.25);
      const front = 0.5 + 0.5 * Math.sin(d.t);
      g.fillStyle = rgba([TEAL, SKY, PALE][d.ring], (0.35 + 0.5 * front) * fade(x));
      g.beginPath(); g.arc(x, y, 2 + front * 2, 0, TAU); g.fill();
    }
    // Heatmap.
    const size = Math.min((R.x1 - R.x0) * 0.5, (R.y1 - R.y0) * 0.85) / N;
    const x0 = R.x1 - size * N - (R.x1 - R.x0) * 0.04, y0 = R.y1 - size * N;
    const sweep = (clock * 0.00012) % 1.6;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < cells[r].length; c++) {
        const x = x0 + c * size, y = y0 + r * size;
        const d = (c + r) / (2 * N);
        const glow = Math.max(0, 1 - Math.abs(d - sweep + 0.3) * 6);
        const v = cells[r][c];
        const a = fade(x) * (0.1 + 0.42 * v + glow * 0.3);
        rr(g, x + 1.5, y + 1.5, size - 3, size - 3, 4);
        g.fillStyle = rgba(c === 0 ? TEAL : v > 0.4 ? SKY : BLUE, Math.min(0.85, a * 0.8)); g.fill();
      }
    }
    if (!small) {
      g.font = `500 11px ${e.font}`; g.fillStyle = rgba(SLATE, 0.6 * fade(x0)); g.textAlign = "left";
      g.fillText("Cohort retention", x0, y0 - 10);
    }
  };
}

// ---- Alerts: a monitoring line, a threshold, pings and notification cards ----
function alerts(): Scene {
  const pts: number[] = walk(60, 46, 0);
  let scroll = 0, last = pts[pts.length - 1];
  const pings: { x: number; y: number; t: number }[] = [];
  const cards: { t: number; good: boolean }[] = [];
  let cool = 0, seeded = false;
  return (e) => {
    const { g, region: R, ms, clock, fade, small } = e;
    if (!seeded) { seeded = true; cards.push({ t: clock - 300, good: true }); }
    scroll += ms / 1400;
    cool -= ms;
    while (scroll >= 1) {
      scroll -= 1;
      // Mean-reverting noise with occasional spikes.
      last = Math.max(8, Math.min(92, last + (50 - last) * 0.08 + rnd(-6, 6) + (Math.random() < 0.1 ? rnd(-30, 30) : 0)));
      pts.push(last); pts.shift();
    }
    const W = R.x1 - R.x0, H = (R.y1 - R.y0) * 0.72, base = R.y1;
    const n = pts.length, gap = W / (n - 2);
    const yOf = (v: number) => base - (v / 100) * H;
    const thHi = 74, thLo = 26;
    // Threshold band.
    g.fillStyle = rgba(AMBER, 0.05 * fade(R.x1));
    g.fillRect(R.x0, yOf(100), W, yOf(thHi) - yOf(100));
    g.setLineDash([4, 6]); g.strokeStyle = rgba(AMBER, 0.35 * fade(R.x1)); g.lineWidth = 1;
    for (const th of [thHi, thLo]) { g.beginPath(); g.moveTo(R.x0, yOf(th)); g.lineTo(R.x1, yOf(th)); g.stroke(); }
    g.setLineDash([]);
    const P = pts.map((v, i) => [R.x0 + (i - scroll) * gap, yOf(v)]);
    g.save(); g.beginPath(); g.rect(R.x0, 0, W, e.h); g.clip();
    const lg = g.createLinearGradient(R.x0, 0, R.x1, 0);
    lg.addColorStop(0, rgba(SKY, 0)); lg.addColorStop(0.2, rgba(SKY, 0.5)); lg.addColorStop(1, rgba(PALE, 0.9));
    g.strokeStyle = lg; g.lineWidth = 1.6; g.beginPath();
    P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.restore();
    // A crossing at the newest point raises a ping and a card.
    const [hx, hy] = P[P.length - 1];
    if ((last > thHi || last < thLo) && cool <= 0) {
      pings.push({ x: hx, y: hy, t: clock });
      cards.unshift({ t: clock, good: last < thLo ? false : true });
      if (cards.length > 3) cards.pop();
      cool = 3500;
    }
    for (let i = pings.length - 1; i >= 0; i--) {
      const age = (clock - pings[i].t) / 2200;
      if (age > 1) { pings.splice(i, 1); continue; }
      g.strokeStyle = rgba(AMBER, 0.6 * (1 - age) * fade(pings[i].x)); g.lineWidth = 1.4;
      g.beginPath(); g.arc(pings[i].x - scroll * 0, pings[i].y, 4 + age * 34, 0, TAU); g.stroke();
    }
    g.fillStyle = rgba(PALE, 0.95 * fade(hx)); g.beginPath(); g.arc(hx, hy, 3.5, 0, TAU); g.fill();
    // Notification cards stacked top-right.
    const cw = small ? 150 : 210, ch = small ? 40 : 50;
    cards.forEach((c, i) => {
      const age = clock - c.t;
      const life = 9000;
      if (age > life) return;
      const inT = ease(Math.min(1, age / 700)), outT = ease(Math.max(0, (age - life + 900) / 900));
      const x = R.x1 - cw + (1 - inT) * 40, y = R.y0 + i * (ch + 10);
      const a = inT * (1 - outT) * fade(x + cw / 2);
      panel(g, x, y, cw, ch, a);
      g.fillStyle = rgba(c.good ? AMBER : CORAL, 0.9 * a); g.beginPath(); g.arc(x + 18, y + ch / 2, 5, 0, TAU); g.fill();
      bar(g, x + 32, y + ch * 0.32, cw * 0.55, 6, PALE, 0.6 * a);
      bar(g, x + 32, y + ch * 0.58, cw * 0.38, 5, SLATE, 0.4 * a);
    });
  };
}

// ---- Reports: Profit and Loss sheets in depth, rows writing themselves -------
function reports(): Scene {
  const sheets = [
    { u: 0.08, v: 0.18, z: 0.62, rot: -0.06, ph: 1 },
    { u: 0.55, v: 0.02, z: 0.75, rot: 0.05, ph: 2 },
    { u: 0.28, v: 0.3, z: 1, rot: -0.02, ph: 3 },
  ];
  let t = 0;
  return (e) => {
    const { g, region: R, ms, clock, fade, small } = e;
    t += ms;
    const cycle = (t % 12000) / 12000;
    for (const s of sheets) {
      const sw = (small ? 170 : 270) * s.z, sh = sw * 1.25;
      const x = lerp(R.x0, R.x1 - sw, s.u) + Math.sin(clock * 0.0001 + s.ph) * 10;
      const y = lerp(R.y0, R.y1 - sh, s.v) + Math.cos(clock * 0.00009 + s.ph) * 8;
      const a = (0.3 + 0.7 * s.z) * fade(x + sw / 2);
      g.save(); g.translate(x + sw / 2, y + sh / 2); g.rotate(s.rot + Math.sin(clock * 0.00007 + s.ph) * 0.01); g.translate(-sw / 2, -sh / 2);
      panel(g, 0, 0, sw, sh, a);
      const p = 14 * s.z;
      bar(g, p, p, sw * 0.42, 7 * s.z, PALE, 0.7 * a);
      bar(g, p, p + 14 * s.z, sw * 0.26, 5 * s.z, SLATE, 0.4 * a);
      // Mini column chart on the front sheet.
      if (s.z === 1) {
        for (let i = 0; i < 6; i++) {
          const hgt = (0.35 + 0.5 * Math.abs(Math.sin(i * 1.7 + 0.5))) * sh * 0.18;
          rr(g, p + i * (sw - p * 2) / 6 + 2, p + 34 * s.z + sh * 0.2 - hgt, (sw - p * 2) / 6 - 6, hgt, 2);
          g.fillStyle = rgba(i === 5 ? TEAL : BLUE, 0.6 * a); g.fill();
        }
      }
      const rowsTop = p + (s.z === 1 ? sh * 0.32 : 36 * s.z), rowH = 16 * s.z, rowsN = 9;
      const shown = Math.floor(ease(Math.min(1, cycle * 1.6)) * rowsN);
      for (let i = 0; i < rowsN; i++) {
        const y2 = rowsTop + i * rowH;
        if (y2 > sh - p) break;
        const on = i < shown ? 1 : 0.15;
        const total = i === rowsN - 1;
        g.fillStyle = rgba(SLATE, 0.12 * a); g.fillRect(p, y2 + rowH - 1, sw - p * 2, 1);
        bar(g, p, y2 + rowH * 0.35, sw * (0.25 + ((i * 37) % 20) / 100), 4 * s.z, total ? PALE : SLATE, (total ? 0.7 : 0.4) * a * on);
        bar(g, sw - p - sw * 0.18, y2 + rowH * 0.35, sw * (0.08 + ((i * 53) % 10) / 100), 4 * s.z, total ? GREEN : i % 4 === 2 ? CORAL : PALE, 0.6 * a * on);
      }
      g.restore();
    }
  };
}

// ---- Action Center: a prioritised list where items get ticked off -----------
function actions(): Scene {
  type Task = { pr: number; w: number; done: number; out: number };
  const make = (): Task => ({ pr: Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2, w: rnd(0.35, 0.65), done: 0, out: 0 });
  const tasks: Task[] = Array.from({ length: 5 }, make);
  let timer = 0, shift = 0;
  return (e) => {
    const { g, region: R, ms, clock, fade, small } = e;
    timer += ms;
    const head = tasks[0];
    if (timer > 3400 && head.done === 0) head.done = 0.0001;
    if (head.done > 0 && head.done < 1) head.done = Math.min(1, head.done + ms / 900);
    if (head.done >= 1) head.out = Math.min(1, head.out + ms / 800);
    if (head.out >= 1) { tasks.shift(); tasks.push(make()); timer = 0; shift = 1; }
    shift = Math.max(0, shift - ms / 600);
    const W = Math.min((R.x1 - R.x0) * 0.85, 420), x0 = R.x1 - W - (R.x1 - R.x0) * 0.04;
    const rowH = small ? 40 : 54, y0 = R.y0 + (R.y1 - R.y0 - rowH * 5.6) / 2;
    const pa = fade(x0 + W / 2);
    panel(g, x0 - 16, y0 - 46, W + 32, rowH * 5 + 62, pa * 0.9);
    bar(g, x0, y0 - 28, W * 0.3, 7, PALE, 0.7 * pa);
    bar(g, x0 + W - 54, y0 - 30, 54, 12, CORAL, 0.25 * pa);
    tasks.forEach((tk, i) => {
      const y = y0 + (i + ease(shift)) * rowH;
      const a = pa * (1 - tk.out) * (i === 4 ? 1 - ease(shift) : 1);
      const x = x0 - tk.out * 60;
      rr(g, x, y + 4, W, rowH - 10, 10); g.fillStyle = rgba(PALE, 0.04 * a); g.fill();
      const col = [CORAL, AMBER, SKY][tk.pr];
      g.fillStyle = rgba(col, 0.9 * a); g.beginPath(); g.arc(x + 16, y + rowH / 2, 4.5, 0, TAU); g.fill();
      bar(g, x + 32, y + rowH * 0.36, W * tk.w, 6, PALE, 0.55 * a);
      bar(g, x + 32, y + rowH * 0.56, W * tk.w * 0.6, 4, SLATE, 0.35 * a);
      // Check circle.
      const cx = x + W - 22, cy = y + rowH / 2, r = 9;
      g.lineWidth = 1.5;
      g.strokeStyle = rgba(tk.done > 0 ? TEAL : SLATE, 0.7 * a); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
      if (tk.done > 0) {
        g.fillStyle = rgba(TEAL, 0.3 * ease(tk.done) * a); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
        const k = ease(tk.done);
        g.strokeStyle = rgba(PALE, a); g.lineWidth = 2; g.beginPath();
        g.moveTo(cx - 4, cy);
        if (k < 0.4) g.lineTo(cx - 4 + (k / 0.4) * 3, cy + (k / 0.4) * 3);
        else { g.lineTo(cx - 1, cy + 3); g.lineTo(cx - 1 + ((k - 0.4) / 0.6) * 6, cy + 3 - ((k - 0.4) / 0.6) * 7); }
        g.stroke();
      }
    });
    void clock;
  };
}

// ---- Simulator: scenario curves fanning out as sliders move ------------------
function simulator(): Scene {
  return (e) => {
    const { g, region: R, clock, fade, small } = e;
    const W = (R.x1 - R.x0) * 0.92, x0 = R.x1 - W, H = (R.y1 - R.y0) * 0.6, base = R.y0 + H + (R.y1 - R.y0) * 0.08;
    const s1 = 0.5 + 0.35 * Math.sin(clock * 0.00022), s2 = 0.5 + 0.35 * Math.sin(clock * 0.00017 + 1.3);
    const be = base - H * 0.42;
    // Break-even line.
    g.setLineDash([5, 6]); g.strokeStyle = rgba(AMBER, 0.4 * fade(R.x1)); g.lineWidth = 1;
    g.beginPath(); g.moveTo(x0, be); g.lineTo(R.x1, be); g.stroke(); g.setLineDash([]);
    if (!small) { g.font = `500 11px ${e.font}`; g.fillStyle = rgba(AMBER, 0.6 * fade(R.x1)); g.textAlign = "right"; g.fillText("Break-even", R.x1, be - 6); }
    const curves = [
      { k: 0.55 + s1 * 0.5 + s2 * 0.2, c: TEAL, name: "Best" },
      { k: 0.35 + s1 * 0.3, c: SKY, name: "Base" },
      { k: 0.12 + s2 * 0.18, c: CORAL, name: "Downside" },
    ];
    for (const cv of curves) {
      const P: number[][] = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const y = base - H * (0.08 + cv.k * Math.pow(t, 1.2) * 0.95 + 0.02 * Math.sin(t * 9 + clock * 0.0006));
        P.push([x0 + t * W, Math.max(R.y0, y)]);
      }
      const gr = g.createLinearGradient(x0, 0, R.x1, 0);
      gr.addColorStop(0, rgba(cv.c, 0.1)); gr.addColorStop(1, rgba(cv.c, 0.9 * fade(R.x1)));
      g.strokeStyle = gr; g.lineWidth = cv.name === "Base" ? 2.2 : 1.6;
      g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      // Where it crosses break-even.
      const hit = P.find(([, y], i) => i > 0 && y <= be);
      if (hit) {
        const glow = g.createRadialGradient(hit[0], be, 0, hit[0], be, 14);
        glow.addColorStop(0, rgba(cv.c, 0.8 * fade(hit[0]))); glow.addColorStop(1, rgba(cv.c, 0));
        g.fillStyle = glow; g.fillRect(hit[0] - 14, be - 14, 28, 28);
      }
      if (!small) { const [lx, ly] = P[P.length - 1]; g.font = `500 11px ${e.font}`; g.textAlign = "left"; g.fillStyle = rgba(cv.c, 0.75 * fade(lx)); g.fillText(cv.name, lx - 52, ly - 8); }
    }
    // Slider widgets that drive the curves.
    const sy = base + (R.y1 - base) * 0.45;
    [s1, s2].forEach((v, i) => {
      const sx = x0 + i * (W / 2) + W * 0.04, sw = W * 0.38;
      const a = fade(sx + sw / 2);
      bar(g, sx, sy, sw, 4, SLATE, 0.3 * a);
      bar(g, sx, sy, sw * v, 4, i ? SKY : TEAL, 0.8 * a);
      g.fillStyle = rgba(PALE, 0.95 * a); g.beginPath(); g.arc(sx + sw * v, sy + 2, 7, 0, TAU); g.fill();
    });
  };
}

// ---- Integrations: a hub with platforms orbiting and data flowing in ---------
function integrations(): Scene {
  const nodes = Array.from({ length: 9 }, (_, i) => ({ a: (i / 9) * TAU, r: i % 2 ? 1 : 0.72, c: [TEAL, SKY, BLUE, PALE][i % 4] }));
  const packets: { n: number; t: number }[] = [];
  let timer = 0;
  return (e) => {
    const { g, region: R, ms, clock, fade, small } = e;
    const cx = (R.x0 + R.x1) / 2 + (R.x1 - R.x0) * 0.08, cy = (R.y0 + R.y1) / 2;
    const RX = (R.x1 - R.x0) * 0.42, RY = (R.y1 - R.y0) * 0.36;
    const rot = clock * 0.00004;
    timer += ms;
    if (timer > 700) { timer = 0; packets.push({ n: Math.floor(Math.random() * nodes.length), t: 0 }); }
    const pos = nodes.map((nd) => {
      const ang = nd.a + rot;
      const depth = 0.65 + 0.35 * Math.sin(ang);
      return { x: cx + Math.cos(ang) * RX * nd.r, y: cy + Math.sin(ang) * RY * nd.r * 0.8, d: depth, c: nd.c };
    });
    // Links.
    for (const p of pos) {
      const a = 0.18 * p.d * fade(p.x);
      g.strokeStyle = rgba(SKY, a); g.lineWidth = 1;
      g.beginPath(); g.moveTo(p.x, p.y); g.quadraticCurveTo((p.x + cx) / 2, (p.y + cy) / 2 - 30, cx, cy); g.stroke();
    }
    // Packets flowing to the hub.
    for (let i = packets.length - 1; i >= 0; i--) {
      const pk = packets[i];
      pk.t += ms / 2600;
      if (pk.t >= 1) { packets.splice(i, 1); continue; }
      const p = pos[pk.n], t = pk.t;
      const qx = (p.x + cx) / 2, qy = (p.y + cy) / 2 - 30;
      const x = (1 - t) * (1 - t) * p.x + 2 * (1 - t) * t * qx + t * t * cx;
      const y = (1 - t) * (1 - t) * p.y + 2 * (1 - t) * t * qy + t * t * cy;
      const gl = g.createRadialGradient(x, y, 0, x, y, 7);
      gl.addColorStop(0, rgba(PALE, 0.9 * fade(x))); gl.addColorStop(1, rgba(SKY, 0));
      g.fillStyle = gl; g.fillRect(x - 7, y - 7, 14, 14);
    }
    // Platform tiles, far ones first.
    [...pos].sort((a, b) => a.d - b.d).forEach((p) => {
      const s = (small ? 22 : 30) * p.d, a = (0.3 + 0.7 * p.d) * fade(p.x);
      panel(g, p.x - s, p.y - s, s * 2, s * 2, a);
      rr(g, p.x - s * 0.42, p.y - s * 0.42, s * 0.84, s * 0.84, 5); g.fillStyle = rgba(p.c, 0.5 * a); g.fill();
    });
    // Hub.
    const pulse = 0.5 + 0.5 * Math.sin(clock * 0.0012);
    const hub = g.createRadialGradient(cx, cy, 0, cx, cy, 70);
    hub.addColorStop(0, rgba(TEAL, (0.35 + 0.15 * pulse) * fade(cx))); hub.addColorStop(1, rgba(BLUE, 0));
    g.fillStyle = hub; g.fillRect(cx - 70, cy - 70, 140, 140);
    panel(g, cx - 32, cy - 32, 64, 64, fade(cx));
    g.strokeStyle = rgba(TEAL, 0.9 * fade(cx)); g.lineWidth = 4; g.lineCap = "round";
    g.beginPath(); g.arc(cx, cy, 16, -0.4, Math.PI * 1.6); g.stroke(); g.lineCap = "butt";
  };
}

// ---- Pricing: three tiers with usage meters stopping at their caps -----------
// The pricing title is centred, so the pillars stand at the sides of the banner.
function pricing(): Scene {
  return (e) => {
    const { g, w, h, clock, fade, small } = e;
    const names = ["Starter", "Growth", "Scale"];
    const spots = small ? [0.1, 0.5, 0.9] : [0.1, 0.82, 0.92];
    const heights = [0.34, 0.5, 0.66];
    const cw = Math.max(26, w * (small ? 0.12 : 0.05));
    const base = h * 0.92;
    spots.forEach((sx, i) => {
      const x = w * sx - cw / 2, H = h * heights[i], top = base - H;
      const a = Math.max(0.35, fade(x + cw / 2));
      const gr = g.createLinearGradient(0, top, 0, base);
      gr.addColorStop(0, rgba(i === 1 ? TEAL : BLUE, 0.4 * a)); gr.addColorStop(1, rgba(BLUE, 0.03 * a));
      rr(g, x, top, cw, H, 10); g.fillStyle = gr; g.fill();
      g.strokeStyle = rgba(PALE, 0.2 * a); g.lineWidth = 1; g.stroke();
      // Usage fills towards the cap and holds there.
      const fill = Math.min(0.86, 0.5 + 0.45 * (0.5 + 0.5 * Math.sin(clock * 0.0002 + i * 1.7)));
      rr(g, x + cw * 0.28, base - H * fill, cw * 0.44, H * fill - 6, 6); g.fillStyle = rgba(i === 1 ? TEAL : SKY, 0.6 * a); g.fill();
      g.setLineDash([3, 4]); g.strokeStyle = rgba(AMBER, 0.6 * a);
      g.beginPath(); g.moveTo(x + 3, base - H * 0.86); g.lineTo(x + cw - 3, base - H * 0.86); g.stroke(); g.setLineDash([]);
      if (!small) { g.font = `600 12px ${e.font}`; g.textAlign = "center"; g.fillStyle = rgba(PALE, 0.7 * a); g.fillText(names[i], x + cw / 2, top - 10); }
    });
  };
}

// ---- Ambient: a calm perspective grid for everything else -------------------
function ambient(): Scene {
  return (e) => {
    const { g, w, h, clock, fade } = e;
    const horizon = h * 0.62, f = h * 1.1, camH = 120, near = 60, far = 3600, gap = 240;
    const drift = (clock * 0.02) % gap;
    g.lineWidth = 1;
    for (let z = far - ((far - near) % gap) - drift; z > near; z -= gap) {
      const y = horizon + (camH * f) / z;
      if (y > h) continue;
      g.strokeStyle = rgba(SKY, Math.min(1, (y - horizon) / 120) * 0.1);
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    }
    for (let k = -14; k <= 14; k++) {
      const X = k * 200;
      const x1 = w / 2 + (X * f) / far, y1 = horizon + (camH * f) / far, x2 = w / 2 + (X * f) / near, y2 = horizon + (camH * f) / near;
      const gr = g.createLinearGradient(0, y1, 0, Math.min(h, y2));
      gr.addColorStop(0, rgba(BLUE, 0)); gr.addColorStop(1, rgba(BLUE, 0.12 * fade(x2)));
      g.strokeStyle = gr; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    }
  };
}

const FACTORIES: Record<string, () => Scene> = {
  dashboard, costs, orders, customers, alerts, reports, actions, simulator, integrations, pricing, ambient,
};

/** A scene by name, or null for the engine's own growth chart. */
export function createScene(name: string): Scene | null {
  const f = FACTORIES[name];
  return f ? f() : null;
}

/** Which scene a banner page gets, by its URL. */
export function sceneForPath(path: string): string {
  const table: [RegExp, string][] = [
    [/^\/features\/profit-dashboard\//, "dashboard"],
    [/^\/features\/costs\//, "costs"],
    [/^\/features\/orders-and-products\//, "orders"],
    [/^\/features\/customers\//, "customers"],
    [/^\/features\/marketing\//, "growth"],
    [/^\/features\/alerts-and-delivery\//, "alerts"],
    [/^\/features\/reports\//, "reports"],
    [/^\/features\/action-center\//, "actions"],
    [/^\/features\/simulator\//, "simulator"],
    [/^\/features\/$/, "dashboard"],
    [/^\/pricing\//, "pricing"],
    [/^\/integrations\//, "integrations"],
    [/^\/tools\/(profit-margin|contribution-margin|shopify-fees)/, "costs"],
    [/^\/tools\/(break-even-roas|poas-mer)/, "growth"],
    [/^\/tools\/ltv-cac/, "customers"],
    [/^\/tools\/(discount-break-even|pricing-markup)/, "simulator"],
    [/^\/tools\//, "dashboard"],
    [/^\/guides\//, "reports"],
    [/^\/coming-soon\//, "growth"],
  ];
  for (const [re, name] of table) if (re.test(path)) return name;
  return "ambient";
}
