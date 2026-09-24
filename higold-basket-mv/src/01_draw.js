// 01_draw.js — palette, ink lines, paper, hatching, halftone, type. Draws into the global context X.
'use strict';
let X = null;                      // current 2D context (swapped by the timeline for transitions)

// ---------- palette: ONLY take colours from here ----------
const PAL = {
  paper: '#F4F2EC',  // clean matte white paper (not yellowed)
  paper2: '#E9E6DE', // paper shadow / panel tint
  ink: '#161513',    // ink black
  ink2: '#44423E',   // secondary ink / fine annotation
  grey: '#8E9297',   // pencil grey
  steel0: '#4E555C', // steel shadow
  steel1: '#8A9299', // steel mid
  steel2: '#C7CCD1', // steel light
  shine: '#FFFFFF',  // specular glint
  orange: '#FF4F1A', // the ONE accent: signal orange (hook words, LAN's hair clip, the "嗒")
  cobalt: '#2B46FF', // UI-layer only: selection boxes, cursor, links
  night: '#0F0F11',  // inverted chorus background
  night2: '#1C1C20', // night panel
};

// ---------- basic shapes ----------
function poly(pts, close = true) { X.beginPath(); X.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]); if (close) X.closePath(); }
function smoothPath(pts, close = false) {   // Catmull-Rom through points
  const n = pts.length; if (n < 3) return poly(pts, close);
  X.beginPath(); X.moveTo(pts[0][0], pts[0][1]);
  const P = i => close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  const m = close ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    X.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (close) X.closePath();
}
function fillPoly(pts, col, a = 1) { X.save(); X.globalAlpha *= a; X.fillStyle = col; poly(pts); X.fill(); X.restore(); }
function rect(x, y, w, h, col, a = 1) { X.save(); X.globalAlpha *= a; X.fillStyle = col; X.fillRect(x, y, w, h); X.restore(); }
function line(x1, y1, x2, y2, w = 2, col = PAL.ink, a = 1, cap = 'round') {
  X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineWidth = w; X.lineCap = cap; X.beginPath(); X.moveTo(x1, y1); X.lineTo(x2, y2); X.stroke(); X.restore();
}
function circle(x, y, r, o = {}) {
  X.save(); X.globalAlpha *= (o.a ?? 1); X.beginPath(); X.arc(x, y, Math.max(0, r), 0, TAU);
  if (o.fill) { X.fillStyle = o.fill; X.fill(); }
  if (o.stroke) { X.strokeStyle = o.stroke; X.lineWidth = o.w || 2; X.stroke(); }
  X.restore();
}
function rrect(x, y, w, h, r, o = {}) {
  X.save(); X.globalAlpha *= (o.a ?? 1); X.beginPath(); X.roundRect(x, y, w, h, r);
  if (o.fill) { X.fillStyle = o.fill; X.fill(); }
  if (o.stroke) { X.strokeStyle = o.stroke; X.lineWidth = o.w || 2; X.stroke(); }
  X.restore();
}
function ellipsePts(cx, cy, rx, ry, n = 48, rot = 0, a0 = 0, a1 = TAU) {
  const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n), [x, y] = rot2(Math.cos(a) * rx, Math.sin(a) * ry, rot); p.push([cx + x, cy + y]); } return p;
}

// ---------- ink: variable-width, tapered, boiling line ----------
// inkStroke(pts, {w, col, taper: [start, end] 0..1 fraction of length, wob: jitter px, seed, a, press: pressure noise 0..1, closed})
// Builds a ribbon polygon along the path's normals and fills it — gives real brush-pen weight variation.
function inkStroke(pts, o = {}) {
  const n = pts.length; if (n < 2) return;
  const w = o.w ?? 3, col = o.col ?? PAL.ink, wob = o.wob ?? .8, seed = o.seed ?? 1, press = o.press ?? .25;
  const ta = o.taper?.[0] ?? .12, tb = o.taper?.[1] ?? .18;
  // resample by length for even width modulation
  const L = [0]; for (let i = 1; i < n; i++) L.push(L[i - 1] + dist(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]));
  const tot = L[n - 1] || 1, step = Math.max(2, Math.min(10, tot / 60)), m = Math.max(2, Math.ceil(tot / step));
  const P = []; let j = 0;
  for (let k = 0; k <= m; k++) {
    const s = tot * k / m; while (j < n - 2 && L[j + 1] < s) j++;
    const f = (s - L[j]) / ((L[j + 1] - L[j]) || 1);
    P.push([lerp(pts[j][0], pts[j + 1][0], f) + jit(seed + k * .7, wob), lerp(pts[j][1], pts[j + 1][1], f) + jit(seed + k * .7 + 99, wob), s / tot]);
  }
  const left = [], right = [];
  for (let k = 0; k <= m; k++) {
    const a = P[Math.max(0, k - 1)], b = P[Math.min(m, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const u = P[k][2];
    let ww = w * (1 + press * noise1(seed * 3.1 + u * 4 + BOIL * .37));
    if (ta > 0 && u < ta) ww *= Math.sin(u / ta * Math.PI / 2) * .85 + .15;
    if (tb > 0 && u > 1 - tb) ww *= Math.sin((1 - u) / tb * Math.PI / 2) * .85 + .15;
    const nx = -dy / d * ww / 2, ny = dx / d * ww / 2;
    left.push([P[k][0] + nx, P[k][1] + ny]); right.push([P[k][0] - nx, P[k][1] - ny]);
  }
  X.save(); X.globalAlpha *= (o.a ?? 1); X.fillStyle = col;
  X.beginPath(); X.moveTo(left[0][0], left[0][1]); for (const p of left) X.lineTo(p[0], p[1]);
  for (let k = right.length - 1; k >= 0; k--) X.lineTo(right[k][0], right[k][1]); X.closePath(); X.fill();
  X.restore();
}
// A hand-drawn straight-ish line (slight bow), for boxes and rules.
function handLine(x1, y1, x2, y2, o = {}) {
  const d = dist(x1, y1, x2, y2), n = Math.max(3, Math.ceil(d / 40)), bow = (o.bow ?? .006) * d * (hash((o.seed ?? 3) + BOIL * .1) - .5) * 2;
  const nx = -(y2 - y1) / (d || 1), ny = (x2 - x1) / (d || 1), pts = [];
  for (let i = 0; i <= n; i++) { const k = i / n, b = Math.sin(k * Math.PI) * bow; pts.push([lerp(x1, x2, k) + nx * b, lerp(y1, y2, k) + ny * b]); }
  inkStroke(pts, { w: o.w ?? 2.5, col: o.col, taper: o.taper ?? [.04, .06], wob: o.wob ?? .5, seed: o.seed ?? (x1 + y2), a: o.a, press: o.press ?? .15 });
}
function handRect(x, y, w, h, o = {}) {
  const s = o.seed ?? 1, e = o.over ?? 6;     // lines overshoot the corners a little, like a quick sketch
  handLine(x - e, y, x + w + e * .4, y, { ...o, seed: s }); handLine(x + w, y - e * .5, x + w, y + h + e, { ...o, seed: s + 1 });
  handLine(x + w + e * .6, y + h, x - e * .3, y + h, { ...o, seed: s + 2 }); handLine(x, y + h + e * .5, x, y - e * .6, { ...o, seed: s + 3 });
}
function handCircle(cx, cy, r, o = {}) {
  const n = Math.max(24, Math.ceil(r / 3)), s = o.seed ?? 5, start = hash(s) * TAU, over = o.over ?? .08, pts = [];
  for (let i = 0; i <= n; i++) { const a = start + TAU * (1 + over) * i / n, rr = r * (1 + .015 * noise1(s + i * .3 + BOIL * .2)); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * (o.sy ?? 1)]); }
  inkStroke(pts, { w: o.w ?? 2.5, col: o.col, taper: [.05, .12], wob: .4, seed: s, a: o.a });
}

// ---------- hatching / halftone / dots ----------
// hatch inside the current clip or a polygon: many lines, one stroke() call.
function hatch(pts, o = {}) {
  const ang = o.angle ?? -.8, gap = o.gap ?? 9, w = o.w ?? 1.2, col = o.col ?? PAL.ink;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4, c = Math.cos(ang), s = Math.sin(ang);
  X.save(); poly(pts); X.clip(); X.globalAlpha *= (o.a ?? 1); X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round'; X.beginPath();
  let i = 0;
  for (let d = -R; d <= R; d += gap, i++) {
    const j1 = jit(i * 3.3 + (o.seed ?? 0), gap * .15), j2 = jit(i * 5.1 + (o.seed ?? 0), gap * .15);
    const ox = cx - s * d, oy = cy + c * d; X.moveTo(ox - c * R + j1, oy - s * R); X.lineTo(ox + c * R + j2, oy + s * R);
  }
  X.stroke(); X.restore();
}
// halftone dot field in a rect; dens(x, y) → 0..1 dot radius factor
function halftone(x, y, w, h, dens, o = {}) {
  const g = o.gap ?? 14, col = o.col ?? PAL.ink, ang = o.angle ?? .26, c = Math.cos(ang), s = Math.sin(ang);
  X.save(); X.beginPath(); X.rect(x, y, w, h); X.clip(); X.globalAlpha *= (o.a ?? 1); X.fillStyle = col; X.beginPath();
  const R = Math.hypot(w, h) / 2 + g, cx = x + w / 2, cy = y + h / 2;
  for (let u = -R; u < R; u += g) for (let v = -R; v < R; v += g) {
    const px = cx + u * c - v * s, py = cy + u * s + v * c; if (px < x - g || px > x + w + g || py < y - g || py > y + h + g) continue;
    const r = clamp(dens(px, py)) * g * .5; if (r < .35) continue;
    X.moveTo(px + r, py); X.arc(px, py, r, 0, TAU);
  }
  X.fill(); X.restore();
}
function dotGrid(x, y, w, h, gap = 36, r = 1.6, col = PAL.ink, a = .18) {
  X.save(); X.globalAlpha *= a; X.fillStyle = col; X.beginPath();
  for (let u = x; u <= x + w; u += gap) for (let v = y; v <= y + h; v += gap) { X.moveTo(u + r, v); X.arc(u, v, r, 0, TAU); }
  X.fill(); X.restore();
}
// technical-drawing paper grid (fine + major lines)
function gridPaper(o = {}) {
  const g = o.gap ?? 48, col = o.col ?? PAL.cobalt, a = o.a ?? .07, ox = o.ox ?? 0, oy = o.oy ?? 0;
  X.save(); X.strokeStyle = col; X.lineWidth = 1; X.globalAlpha *= a; X.beginPath();
  for (let x = ((ox % g) + g) % g; x < W; x += g) { X.moveTo(x, 0); X.lineTo(x, H); }
  for (let y = ((oy % g) + g) % g; y < H; y += g) { X.moveTo(0, y); X.lineTo(W, y); }
  X.stroke(); X.globalAlpha *= 1.8; X.beginPath();
  for (let x = ((ox % (g * 4)) + g * 4) % (g * 4); x < W; x += g * 4) { X.moveTo(x, 0); X.lineTo(x, H); }
  for (let y = ((oy % (g * 4)) + g * 4) % (g * 4); y < H; y += g * 4) { X.moveTo(0, y); X.lineTo(W, y); }
  X.stroke(); X.restore();
}

// ---------- paper ----------
// Pre-generated once: fine grain + sparse fibres + gentle mottling. Applied over every frame (multiply), offset by BOIL so it lives.
let PAPER = null, PAPER_DARK = null;
function makePaper() {
  const c = document.createElement('canvas'); c.width = W + 64; c.height = H + 64; const g = c.getContext('2d');
  const img = g.createImageData(c.width, c.height), d = img.data, rnd = mulberry32(1234);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const m = fbm(x / 420, y / 420, 3) * 5, n = (rnd() - .5) * 16 + m;
    const i = (y * c.width + x) * 4; const v = 255 - Math.max(0, -n) - Math.max(0, n) * .35; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  g.globalAlpha = .05; g.strokeStyle = '#6c665c'; g.lineWidth = .8;
  for (let k = 0; k < 900; k++) { const x = rnd() * c.width, y = rnd() * c.height, a = rnd() * TAU, l = 6 + rnd() * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + (rnd() - .5) * 6, y + Math.sin(a) * l * .5 + (rnd() - .5) * 6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  PAPER = c;
  // a light-grain version for dark scenes (screen blend)
  const c2 = document.createElement('canvas'); c2.width = c.width; c2.height = c.height; const g2 = c2.getContext('2d');
  const im2 = g2.createImageData(c2.width, c2.height), d2 = im2.data, r2 = mulberry32(99);
  for (let i = 0; i < d2.length; i += 4) { const v = Math.max(0, (r2() - .5) * 26 + fbm((i / 4 % c2.width) / 300, Math.floor(i / 4 / c2.width) / 300, 2) * 6); d2[i] = d2[i + 1] = d2[i + 2] = v; d2[i + 3] = 255; }
  g2.putImageData(im2, 0, 0); PAPER_DARK = c2;
}
function paperBG(col = PAL.paper) { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore(); }
// grain over the finished frame. amt ~ .5–1.
function paperGrain(amt = 1, dark = false) {
  const ox = (BOIL * 17) % 64, oy = (BOIL * 29) % 64;
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  if (!dark) { X.globalCompositeOperation = 'multiply'; X.globalAlpha = .55 * amt; X.drawImage(PAPER, -ox, -oy); }
  else { X.globalCompositeOperation = 'screen'; X.globalAlpha = .5 * amt; X.drawImage(PAPER_DARK, -ox, -oy); }
  X.restore();
}

// ---------- type ----------
// Font stacks (all OFL, loaded in studio.html)
const F = {
  heavy: '"NotoSans", sans-serif',        // weight 900 blocks — brutal hero type
  sans: '"NotoSans", sans-serif',         // 300–500 clean subtitle
  serif: '"NotoSerif", serif',            // editorial CN serif
  smiley: '"Smiley", "NotoSans", sans-serif',  // 得意黑: sleek oblique display, very now
  hand: '"MaShan", "NotoSans", sans-serif', // brush-marker handwriting (Ma Shan Zheng: legible brush kaishu)
  handWild: '"Mang", "NotoSans", sans-serif', // expressive cursive (Zhi Mang Xing) — decoration only, never for lyrics
  pen: '"LongCang", "NotoSans", sans-serif',   // thin pen handwriting
  qing: '"Qingke", "NotoSans", sans-serif',    // chunky rounded display
  anton: '"Anton", "NotoSans", sans-serif',    // condensed Latin title-card
  serifI: '"InstrumentI", serif', serifR: '"Instrument", serif',
  mono: '"Mono", "NotoSans", monospace', grotesk: '"Grotesk", sans-serif', archivo: '"Archivo", sans-serif',
};
// text(str, x, y, {size, font, weight, col, align, base, track (letter-spacing px), rot, a, stroke, sw, skew, sx, sy})
function text(str, x, y, o = {}) {
  const size = o.size ?? 48;
  X.save(); X.globalAlpha *= (o.a ?? 1); X.translate(x, y); if (o.rot) X.rotate(o.rot);
  if (o.skew) X.transform(1, 0, o.skew, 1, 0, 0);
  if (o.sx || o.sy) X.scale(o.sx ?? 1, o.sy ?? 1);
  X.font = `${o.italic ? 'italic ' : ''}${o.weight ?? 400} ${size}px ${o.font ?? F.sans}`;
  X.textAlign = o.align ?? 'left'; X.textBaseline = o.base ?? 'alphabetic';
  if (o.track) X.letterSpacing = o.track + 'px';
  if (o.stroke) outlineText(str, o.stroke, (o.sw ?? 4) * .7);   // outer outline only (no internal contour overlaps)
  if (o.col !== null) { X.fillStyle = o.col ?? PAL.ink; X.fillText(str, 0, 0); }
  X.restore();
}
// Outline-only type without the variable font's internal overlapping contours: stroke at 2× width into a buffer, then punch out
// the glyph fill, leaving only the outer half of the stroke. Cached per (string, font, alignment, colour, width).
const _ol = new Map();
function outlineText(str, col, sw) {
  const key = [str, X.font, X.textAlign, X.textBaseline, X.letterSpacing, col, sw].join('|');
  let b = _ol.get(key);
  if (!b) {
    const m = X.measureText(str), pad = sw * 2 + 4, L = Math.ceil(m.actualBoundingBoxLeft + pad), R = Math.ceil(m.actualBoundingBoxRight + pad);
    const A = Math.ceil(m.actualBoundingBoxAscent + pad), D = Math.ceil(m.actualBoundingBoxDescent + pad);
    const c = document.createElement('canvas'); c.width = Math.max(1, L + R); c.height = Math.max(1, A + D); const g = c.getContext('2d');
    g.font = X.font; g.textAlign = X.textAlign; g.textBaseline = X.textBaseline; g.letterSpacing = X.letterSpacing;
    g.strokeStyle = col; g.lineWidth = sw * 2; g.lineJoin = 'round'; g.strokeText(str, L, A);
    g.globalCompositeOperation = 'destination-out'; g.fillText(str, L, A);
    b = { c, L, A }; if (_ol.size > 800) _ol.clear(); _ol.set(key, b);
  }
  X.drawImage(b.c, -b.L, -b.A);
}
function measure(str, size, font = F.sans, weight = 400, track = 0) {
  X.save(); X.font = `${weight} ${size}px ${font}`; if (track) X.letterSpacing = track + 'px'; const w = X.measureText(str).width; X.restore(); return w;
}

// Marker/dry-brush lettering: text rendered into an offscreen buffer, then "飞白" streaks are erased with noise so strokes
// show dry-brush gaps. Cached per (string, size, font, variant); variant cycles with BOIL/2 so it shimmers subtly.
const _mk = new Map();
function markerBuf(str, size, font, col, variant) {
  const key = str + '|' + size + '|' + font + '|' + col + '|' + variant;
  if (_mk.has(key)) return _mk.get(key);
  const pad = size * .4, c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = `400 ${size}px ${font}`; const w = Math.ceil(g.measureText(str).width + pad * 2), h = Math.ceil(size * 1.5 + pad);
  c.width = w; c.height = h; g.font = `400 ${size}px ${font}`; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(str, pad, h / 2);
  // dry-brush: erase thin horizontal-ish streaks where noise is high
  g.globalCompositeOperation = 'destination-out'; const rnd = mulberry32(variant * 7919 + str.length * 31 + size);
  const n = Math.round(w * h / (size * 14));
  for (let k = 0; k < n; k++) {
    const x = rnd() * w, y = rnd() * h, l = size * (.15 + rnd() * .5), th = .6 + rnd() * size * .025, a = -.25 + rnd() * .15;
    g.globalAlpha = .35 + rnd() * .55; g.lineWidth = th; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  const r = { c, pad, w, h }; if (_mk.size > 600) _mk.clear(); _mk.set(key, r); return r;
}
// marker(str, x, y, {size, font, col, align: left|center|right, rot, a, sx, sy})  — y is the vertical centre
function marker(str, x, y, o = {}) {
  if ((o.size ?? 80) < 2) return 0;
  const size = Math.round(o.size ?? 80), font = o.font ?? F.hand, col = o.col ?? PAL.ink, b = markerBuf(str, size, font, col, (o.variant ?? 0) + (Math.floor(BOIL / 2) % 3));
  const inner = b.w - b.pad * 2, ax = o.align === 'center' ? inner / 2 : o.align === 'right' ? inner : 0;
  X.save(); X.globalAlpha *= (o.a ?? 1); X.translate(x, y); if (o.rot) X.rotate(o.rot); X.scale(o.sx ?? 1, o.sy ?? 1);
  X.drawImage(b.c, -b.pad - ax, -b.h / 2); X.restore();
  return inner;
}
function markerWidth(str, size, font = F.hand) { return markerBuf(str, size, font, PAL.ink, 0).w - markerBuf(str, size, font, PAL.ink, 0).pad * 2; }

// ---------- small graphic vocabulary ----------
function sparkle(x, y, r, o = {}) {           // 4-point glint
  const k = o.k ?? 1; if (k < .01) return; const rr = r * k, t = rr * .16;
  X.save(); X.globalAlpha *= (o.a ?? 1); X.fillStyle = o.col ?? PAL.ink; X.translate(x, y); X.rotate(o.rot ?? 0); X.beginPath();
  X.moveTo(0, -rr); X.quadraticCurveTo(t, -t, rr, 0); X.quadraticCurveTo(t, t, 0, rr); X.quadraticCurveTo(-t, t, -rr, 0); X.quadraticCurveTo(-t, -t, 0, -rr); X.fill(); X.restore();
}
function arrow(x1, y1, x2, y2, o = {}) {
  const w = o.w ?? 2.5, col = o.col ?? PAL.ink, hs = o.head ?? 16, a = Math.atan2(y2 - y1, x2 - x1);
  handLine(x1, y1, x2, y2, { w, col, seed: o.seed });
  inkStroke([[x2 - Math.cos(a - .45) * hs, y2 - Math.sin(a - .45) * hs], [x2, y2], [x2 - Math.cos(a + .45) * hs, y2 - Math.sin(a + .45) * hs]], { w, col, taper: [.1, .1], seed: (o.seed ?? 0) + 5 });
}
function speedLines(cx, cy, r0, r1, n, o = {}) {   // radial manga speed lines
  X.save(); X.globalAlpha *= (o.a ?? 1); X.fillStyle = o.col ?? PAL.ink;
  for (let i = 0; i < n; i++) {
    const a = hash(i + (o.seed ?? 0)) * TAU + (o.rot ?? 0), w = (o.w ?? 6) * (.3 + hash(i * 3.7) * .7), rs = r0 * (1 + hash(i * 1.3 + BOIL) * .4);
    const c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
    X.beginPath(); X.moveTo(cx + c * rs, cy + s * rs); X.lineTo(cx + c * r1 + px * w, cy + s * r1 + py * w); X.lineTo(cx + c * r1 - px * w, cy + s * r1 - py * w); X.fill();
  }
  X.restore();
}
function flash(k, col = PAL.shine) { if (k < .003) return; X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = clamp(k); X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore(); }
function vignette(k = .25, col = '#000') {
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); const g = X.createRadialGradient(CX, CY, H * .35, CX, CY, H * .95);
  g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, k)); X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
}
// camera: world point (cx, cy) at screen centre, zoom, rotation. cam() pushes; camEnd() pops.
function cam(cx = CX, cy = CY, z = 1, r = 0) { X.save(); X.translate(CX, CY); X.rotate(r); X.scale(z, z); X.translate(-cx, -cy); }
function camEnd() { X.restore(); }
function shake(t, amt, seed = 0) { return [noise1(t * 23 + seed) * amt, noise1(t * 19 + 50 + seed) * amt]; }
