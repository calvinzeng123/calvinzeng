// c01_verse1.js — Verse 1 · "The black-hole cabinet" (0 – 23.0 s). Paper, a bent grid, then the first orange.
// Story: a closed base cabinet leaks darkness → the door flies open on a black hole that bends the paper grid and keeps a ring of
// kitchenware in orbit → pots spiral in and go 404 → LAN kneels head-first into the dark → the spice bottles domino and search
// finds no salt → the first pull: the grid snaps straight, the steel basket glides out → LAN's star eyes → the soft-close 嗒 →
// accelerating cuts into the chorus.
(() => {
'use strict';
const BT = beatT;

// =========================================================== helpers ===========================================================
// plain ink polyline with per-vertex boil (clean technical line for the cabinet + product world)
function pline(pts, w = 3, col = PAL.ink, close = false, a = 1, seed = 0, wob = .45) {
  if (pts.length < 2) return;
  X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineWidth = w; X.lineJoin = 'round'; X.lineCap = 'round'; X.beginPath();
  pts.forEach((p, i) => { const x = p[0] + jit(seed + i * 1.73, wob), y = p[1] + jit(seed + i * 2.31 + 50, wob); i ? X.lineTo(x, y) : X.moveTo(x, y); });
  if (close) X.closePath(); X.stroke(); X.restore();
}
const P2 = (C, p) => { const q = C.project(p); return [q[0], q[1]]; };
const ell = (cx, cy, rx, ry, rot, a0, a1, n = 40) => ellipsePts(cx, cy, rx, ry, n, rot, a0, a1);

// ---- the gravitational lens applied to the paper grid ----
// L = {x, y, e (radius px), sw (swirl rad), k (blend 0..1, may overshoot for a wobble), R (hide inside the disc), mode 'pinch'|'ring'}
// 'pinch' drags lines INTO the hole (r' = √(r² − e²)); 'ring' bows them around it (outer Einstein image).
function lensPt(px, py, L) {
  const dx = px - L.x, dy = py - L.y, r = Math.hypot(dx, dy) || 1e-3;
  let rr = L.mode === 'ring' ? (r + Math.sqrt(r * r + 4 * L.e * L.e)) / 2 : Math.sqrt(Math.max(0, r * r - L.e * L.e));
  rr = r + (rr - r) * L.k;
  const q = Math.min(1.6, L.e / Math.max(rr, 1));
  const a = Math.atan2(dy, dx) + (L.sw || 0) * L.k * Math.pow(q, L.swp ?? 2);
  return [L.x + Math.cos(a) * rr, L.y + Math.sin(a) * rr, rr];
}
function warpGrid(o = {}) {
  const g = o.gap ?? 60, L = o.L && o.L.e * Math.abs(o.L.k) > .5 ? o.L : null, step = o.step ?? 12, col = o.col ?? PAL.ink, a0 = o.a ?? .1, m = o.margin ?? 420;
  const ox = o.ox ?? 0, oy = o.oy ?? 0, hide = L ? (L.R ?? 0) : 0, NB = 4;
  const paths = Array.from({ length: NB * 2 }, () => new Path2D());
  const add = (x1, y1, x2, y2, maj) => {
    const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step); let prev = null, pb = -1;
    for (let i = 0; i <= n; i++) {
      const u = i / n, px = lerp(x1, x2, u), py = lerp(y1, y2, u), q = L ? lensPt(px, py, L) : [px, py, 1e9];
      if (prev && q[2] > hide && prev[2] > hide && Math.abs(q[0] - prev[0]) + Math.abs(q[1] - prev[1]) < step * 6) {
        const b = L ? Math.min(NB - 1, Math.floor(clamp(1.5 * Math.pow(L.e * Math.abs(L.k) / Math.max(1, (q[2] + prev[2]) / 2), 1.6)) * NB)) : 0;
        const P = paths[b + (maj ? NB : 0)]; if (b !== pb) P.moveTo(prev[0], prev[1]); P.lineTo(q[0], q[1]); pb = b;
      } else pb = -1;
      prev = q;
    }
  };
  const vx0 = ((ox % g) + g) % g, vy0 = ((oy % g) + g) % g;
  for (let x = vx0 - Math.ceil(m / g) * g; x <= W + m; x += g) add(x, -m, x, H + m, Math.round((x - ox) / g) % 4 === 0);
  for (let y = vy0 - Math.ceil(m / g) * g; y <= H + m; y += g) add(-m, y, W + m, y, Math.round((y - oy) / g) % 4 === 0);
  X.save(); X.strokeStyle = col; X.lineCap = 'round'; X.lineJoin = 'round';
  for (let b = 0; b < NB * 2; b++) {
    const bb = b % NB, maj = b >= NB;
    X.globalAlpha = clamp(a0 * (1 + bb * 1.1) * (maj ? 1.6 : 1)) * (o.fade ?? 1); X.lineWidth = (maj ? 1.5 : 1.1) + bb * .4; X.stroke(paths[b]);
  }
  X.restore();
}

// ---- tiny box renderer with back-face culling (faces wound CCW seen from outside) ----
const BOXF = [[0, 4, 6, 2], [1, 3, 7, 5], [0, 1, 5, 4], [2, 6, 7, 3], [0, 2, 3, 1], [4, 5, 7, 6]];   // -x +x -y +y -z +z
function boxC(x0, y0, z0, x1, y1, z1, fn) { const c = []; for (let i = 0; i < 8; i++) { const p = [i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0]; c.push(fn ? fn(p) : p); } return c; }
function drawBox(C, corners, o = {}) {
  const pr = corners.map(p => C.project(p)), vis = [];
  BOXF.forEach((f, fi) => {
    if (o.skip && o.skip.includes(fi)) return;
    const pts = f.map(i => [pr[i][0], pr[i][1]]); let s = 0;
    for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[(i + 1) % 4]; s += a[0] * b[1] - b[0] * a[1]; }
    if (s < 0) vis.push([fi, pts]);
  });
  for (const [fi, pts] of vis) { fillPoly(pts, o.fills?.[fi] ?? o.fill ?? PAL.paper); pline(pts, o.w ?? 2.6, PAL.ink, true, 1, (o.seed ?? 0) + fi * 9); }
  return Object.fromEntries(vis);
}

// ---- the base cabinet (mm; floor y = 0, carcass front plane z = 0) ----
// door: opening angle (rad), hinge: 1 = right edge, -1 = left edge. Returns screen polygons.
function cabGeom(C, o = {}) {
  const hg = o.hinge ?? 1, th = o.door ?? 0;
  const doorFn = p => { const hx = hg * 297, r = rotY([p[0] - hx, p[1], p[2]], th * hg); return [r[0] + hx, r[1], r[2]]; };
  return {
    open: [[-282, 108, 0], [282, 108, 0], [282, 782, 0], [-282, 782, 0]].map(p => P2(C, p)),
    outer: [[-300, 90, 0], [300, 90, 0], [300, 800, 0], [-300, 800, 0]].map(p => P2(C, p)),
    doorFn, door: boxC(-297, 94, 0, 297, 796, 20, doorFn),
    front: [[-297, 94, 20], [297, 94, 20], [297, 796, 20], [-297, 796, 20]].map(p => P2(C, doorFn(p))),
  };
}
function cabBody(C, G) {
  drawBox(C, boxC(-282, 0, -520, 282, 90, -50), { fill: PAL.paper2, seed: 3 });                               // recessed plinth
  drawBox(C, boxC(-300, 90, -560, 300, 800, 0), { skip: [5], fill: PAL.paper, fills: { 0: PAL.paper2, 1: PAL.paper2 }, seed: 5 });
  // front frame with the opening cut out
  X.save(); X.beginPath(); poly(G.outer); const o = G.open; X.moveTo(o[0][0], o[0][1]); for (let i = 3; i >= 0; i--) X.lineTo(o[i][0], o[i][1]); X.closePath();
  X.fillStyle = PAL.paper; X.fill('evenodd'); X.restore();
  pline(G.outer, 2.8, PAL.ink, true, 1, 7); pline(G.open, 2, PAL.ink, true, 1, 8);
  drawBox(C, boxC(-330, 800, -600, 330, 840, 30), { fill: PAL.paper, fills: { 3: PAL.paper2 }, w: 3, seed: 11 });   // counter slab
}
function cabDoor(C, G, o = {}) {
  const f = drawBox(C, G.door, { fill: PAL.paper, fills: { 4: PAL.paper2, 0: PAL.paper2, 1: PAL.paper2 }, w: 3, seed: 21 });
  if (f[5]) {   // front face visible: inset panel line + a slim bar handle near the free edge
    const hg = o.hinge ?? 1, q = (x, y) => P2(C, G.doorFn([x, y, 21]));
    pline([q(-250, 150), q(250, 150), q(250, 740), q(-250, 740)], 1.4, PAL.ink, true, .55, 23);
    const hx = -hg * 262, bar = [q(hx - 8, 540), q(hx + 8, 540), q(hx + 8, 740), q(hx - 8, 740)];
    fillPoly(bar, PAL.ink2); pline(bar, 2, PAL.ink, true, 1, 24);
  }
}
// interior perspective edges of the carcass, lensed around the hole, clipped to the opening
function cabInterior(C, G, L, a = 1) {
  const E3 = [[[-282, 108, 0], [-282, 108, -540]], [[282, 108, 0], [282, 108, -540]], [[-282, 782, 0], [-282, 782, -540]], [[282, 782, 0], [282, 782, -540]],
    [[-282, 108, -540], [282, 108, -540]], [[282, 108, -540], [282, 782, -540]], [[282, 782, -540], [-282, 782, -540]], [[-282, 782, -540], [-282, 108, -540]],
    [[-282, 440, 0], [-282, 440, -540]], [[282, 440, 0], [282, 440, -540]], [[-282, 440, -540], [282, 440, -540]], [[-282, 440, -20], [282, 440, -20]]];
  X.save(); poly(G.open); X.clip();
  for (const [p, q] of E3) {
    const pts = []; for (let i = 0; i <= 24; i++) { const s = P2(C, vlerp(p, q, i / 24)); const m = L ? lensPt(s[0], s[1], L) : [...s, 1e9]; if (!L || m[2] > (L.R ?? 0)) pts.push(m); }
    pline(pts, 1.8, PAL.ink, false, .55 * a, p[0] + q[2]);
  }
  X.restore();
}

// ---- darkness leaking round a closed door: a printed halftone "dark glow" that breathes, plus the inked gap ----
// quad = [TL, TR, BR, BL] on screen. Side weights stretch the glow (the free edge leaks most).
function darkGlow(quad, t, k, o = {}) {
  if (k < .01) return;
  const xs = quad.map(p => p[0]), ys = quad.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const sp = (o.spread ?? 120) * k, wl = o.left ?? 1.3, wr = o.right ?? .55, wt = o.top ?? .8, wb = o.bot ?? .9;
  halftone(x0 - sp * wl - 24, y0 - sp * wt - 24, x1 - x0 + sp * (wl + wr) + 48, y1 - y0 + sp * (wt + wb) + 48, (x, y) => {
    const dx = x < x0 ? (x0 - x) / wl : x > x1 ? (x - x1) / wr : 0, dy = y < y0 ? (y0 - y) / wt : y > y1 ? (y - y1) / wb : 0;
    const d = Math.hypot(dx, dy); if (d === 0) return 0;
    const f = 1 - d / sp; if (f <= 0) return 0;
    return f * f * (1.05 + .45 * noise2(x / 64 + t * .9, y / 64 - t * .6));
  }, { gap: o.gap ?? 12, col: PAL.ink, angle: .26 });
}
function gapLine(quad, k) { pline([...quad, quad[0]], 3 + 4 * k, PAL.ink, false, 1, 91, .3); }

// ---- kitchenware icons (unit ≈ 1 = half-width), paper fill + ink line ----
function ware(kind, x, y, s, rot, o = {}) {
  if (s < 1) return;
  const sd = o.seed ?? 0;
  X.save(); X.globalAlpha *= o.a ?? 1; X.translate(x + jit(sd + 1, .5), y + jit(sd + 2, .5));
  if (o.stretch && o.stretch !== 1) { X.rotate(o.sdir); X.scale(o.stretch, 1 / o.stretch); X.rotate(-o.sdir); }
  X.rotate(rot); X.scale(s, s);
  const lw = (o.w ?? 3.2) / s, ink = o.col ?? PAL.ink;
  X.lineWidth = lw; X.lineJoin = 'round'; X.lineCap = 'round'; X.strokeStyle = ink; X.fillStyle = o.fill ?? PAL.paper;
  const B = () => X.beginPath(), FS = () => { X.fill(); X.stroke(); }, S = () => X.stroke();
  const bar = (x0, y0, len, w, a) => { X.save(); X.translate(x0, y0); X.rotate(a); B(); X.roundRect(0, -w / 2, len, w, w / 2); X.fillStyle = ink; X.fill(); X.restore(); };
  switch (kind) {
    case 'lid':
      B(); X.moveTo(-1, .12); X.bezierCurveTo(-.92, -.52, .92, -.52, 1, .12); X.closePath(); FS();
      B(); X.ellipse(0, .12, 1, .2, 0, 0, TAU); FS();
      B(); X.roundRect(-.18, -.56, .36, .2, .08); FS();
      break;
    case 'pot':   // 锅: wok with a long handle
      bar(.92, -.14, 1.05, .17, -.3);
      B(); X.moveTo(-1, -.14); X.bezierCurveTo(-.9, .66, .9, .66, 1, -.14); X.closePath(); FS();
      B(); X.ellipse(0, -.14, 1, .22, 0, 0, TAU); FS();
      break;
    case 'bowl':  // 碗
      B(); X.roundRect(-.3, .36, .6, .16, .05); FS();
      B(); X.moveTo(-.95, -.22); X.bezierCurveTo(-.85, .62, .85, .62, .95, -.22); X.closePath(); FS();
      B(); X.ellipse(0, -.22, .95, .19, 0, 0, TAU); FS();
      B(); X.moveTo(-.8, .08); X.quadraticCurveTo(0, .22, .8, .08); S();
      break;
    case 'ladle': // 瓢
      bar(.4, -.2, 1.5, .15, -.55);
      B(); X.ellipse(0, 0, .62, .5, 0, 0, TAU); FS();
      B(); X.ellipse(0, -.14, .48, .2, 0, 0, TAU); S();
      break;
    case 'basin': // 盆
      B(); X.moveTo(-1.15, -.3); X.lineTo(-.8, .42); X.quadraticCurveTo(0, .58, .8, .42); X.lineTo(1.15, -.3); X.closePath(); FS();
      B(); X.ellipse(0, -.3, 1.15, .24, 0, 0, TAU); FS();
      B(); X.ellipse(0, -.3, .96, .16, 0, 0, TAU); S();
      break;
    case 'spoon':
      bar(-.3, 0, 1.6, .13, .06);
      B(); X.ellipse(-.6, 0, .42, .27, 0, 0, TAU); FS();
      break;
    case 'plate':
      B(); X.ellipse(0, 0, 1.05, .34, 0, 0, TAU); FS();
      B(); X.ellipse(0, -.02, .62, .19, 0, 0, TAU); S();
      break;
    case 'cup':
      B(); X.ellipse(.52, .02, .26, .28, 0, 0, TAU); S();
      B(); X.moveTo(-.5, -.45); X.lineTo(-.42, .45); X.quadraticCurveTo(0, .56, .42, .45); X.lineTo(.5, -.45); X.closePath(); FS();
      B(); X.ellipse(0, -.45, .5, .13, 0, 0, TAU); FS();
      break;
    case 'chop':
      bar(-1.2, -.1, 2.4, .1, -.08); bar(-1.2, .14, 2.4, .1, -.04);
      break;
    case 'spat':  // 铲
      bar(-1.4, 0, 1.5, .14, 0);
      B(); X.moveTo(.08, -.36); X.lineTo(1.05, -.44); X.lineTo(1.1, .44); X.lineTo(.08, .36); X.closePath(); FS();
      B(); X.moveTo(.45, -.2); X.lineTo(.85, -.22); X.moveTo(.45, .2); X.lineTo(.85, .22); S();
      break;
  }
  X.restore();
}

// ---- the black hole: disc, lensed halo arcs, the accretion ring of kitchenware ----
const RING = [   // kind, orbit radius (× R), phase, size px
  ['lid', 2.05, .2, 42], ['bowl', 2.5, 1.35, 38], ['spoon', 1.9, 2.3, 30], ['plate', 2.85, 3.05, 44], ['pot', 2.3, 4.15, 44],
  ['cup', 2.0, 5.0, 28], ['ladle', 3.05, 5.75, 40], ['chop', 2.7, .75, 34], ['basin', 3.2, 2.55, 42], ['spat', 2.15, 3.7, 32],
];
function ringPos(cx, cy, R, rf, ph, o) { const [x, y] = rot2(Math.cos(ph) * rf * R, Math.sin(ph) * rf * R * (o.flat ?? .2), o.tilt ?? -.16); return [cx + x, cy + y]; }
// front = true draws the near half (in front of the disc), false the far half.
function ringLayer(t, cx, cy, R, o, front) {
  const sp = o.spin ?? 1, k = o.k ?? 1; if (k < .01) return;
  const om = rf => sp * 2.1 * Math.pow(rf, -1.5), isF = ph => Math.sin(ph) > 0, xf = o.xf ?? -1e9, fx = x => clamp((x - xf) / 60);
  X.save(); X.globalAlpha *= k; X.beginPath(); X.rect(xf - 30, -100, W + 200, H + 200); X.clip();
  // streak arcs (the disk's flow), tapered like comets
  [1.34, 1.58, 1.9, 2.25, 2.62, 3.05].forEach((rf, ri) => {
    for (let sgi = 0; sgi < 3; sgi++) {
      const len = .7 + hash(ri * 7 + sgi) * 1.4, p0 = hash(ri * 13 + sgi * 3) * TAU + om(rf) * t * 1.15 + sgi * TAU / 3;
      let run = [];
      const flush = () => { if (run.length > 2) inkStroke(run, { w: 3.4 - ri * .3, taper: [.85, .04], wob: .4, seed: ri * 5 + sgi, a: .85 }); run = []; };
      for (let i = 0; i <= 26; i++) { const ph = p0 + len * i / 26; if (isF(ph) === front) run.push(ringPos(cx, cy, R, rf, ph, o)); else flush(); }
      flush();
    }
  });
  // the accretion band: a paper ribbon with ink edges — reads bright where it crosses the black disc
  const r0 = o.band0 ?? 1.36, r1 = o.band1 ?? 1.78, a0 = front ? 0 : Math.PI, a1 = a0 + Math.PI, bo = [], bi = [];
  for (let i = 0; i <= 48; i++) { const ph = lerp(a0, a1, i / 48); bo.push(ringPos(cx, cy, R, r1, ph, o)); bi.push(ringPos(cx, cy, R, r0, ph, o)); }
  fillPoly([...bo, ...bi.slice().reverse()], PAL.paper);
  pline(bo, 2.6, PAL.ink, false, 1, 31); pline(bi, 2.2, PAL.ink, false, 1, 32);
  for (let j = 0; j < 2; j++) {   // flow dashes inside the band
    const rf = lerp(r0, r1, .33 + j * .34);
    for (let d = 0; d < 5; d++) { const p0 = d * TAU / 5 + om(rf) * t * 1.4 + j, run = []; for (let i = 0; i <= 10; i++) { const ph = p0 + .55 * i / 10; if (isF(ph) === front) run.push(ringPos(cx, cy, R, rf, ph, o)); } if (run.length > 2) inkStroke(run, { w: 2, taper: [.7, .1], wob: .2, seed: 33 + d + j * 7, a: .7 }); }
  }
  // faint orbit guides
  for (const rf of [1.46, 2.34, 3.1]) { const pts = []; for (let i = 0; i <= 60; i++) { const ph = front ? Math.PI * i / 60 : Math.PI + Math.PI * i / 60; pts.push(ringPos(cx, cy, R, rf, ph, o)); } pline(pts, 1.3, PAL.ink, false, .32, rf * 10); }
  // dust
  X.fillStyle = PAL.ink; X.beginPath();
  for (let i = 0; i < 70; i++) {
    const rf = 1.25 + hash(i * 3.1) * 2.1, ph = hash(i * 5.7) * TAU + om(rf) * t * 1.3; if (isF(ph) !== front) continue;
    const [x, y] = ringPos(cx, cy, R, rf, ph, o), r = (1.3 + hash(i * 9.1) * 2.4) * fx(x); if (r < .5) continue; X.moveTo(x + r, y); X.arc(x, y, r, 0, TAU);
  }
  X.fill();
  // kitchenware
  const items = RING.map(([kind, rf, ph0, sz], i) => { const ph = ph0 + om(rf) * t; return { kind, rf, ph, sz, i, d: Math.sin(ph) }; })
    .filter(it => isF(it.ph) === front).sort((a, b) => a.d - b.d);
  for (const it of items) {
    const [x, y] = ringPos(cx, cy, R, it.rf, it.ph, o), sc = (1 + .24 * it.d) * (R / 165) * 1.25;
    const trail = []; for (let j = 0; j <= 10; j++) trail.push(ringPos(cx, cy, R, it.rf, it.ph - (.05 + .42 * j / 10) / it.rf, o));
    const fa = fx(x); if (fa <= 0) continue;
    inkStroke(trail.reverse(), { w: 5 * sc, taper: [.95, .05], wob: .3, seed: it.i * 3, a: .5 * fa });
    ware(it.kind, x, y, it.sz * sc, t * (.5 + hash(it.i) * .9) * (it.i % 2 ? 1 : -1) + it.i, { seed: it.i * 11, w: 3, a: fa });
  }
  X.restore();
}
function blackDisc(cx, cy, R, o = {}) {
  circle(cx, cy, R, { fill: PAL.ink });
  handCircle(cx, cy, R + 2.5, { w: 3.5, seed: 77 });
  // lensed far side of the disk: a paper crescent hugging the top (Gargantua-style) and a thin one under
  const tilt = o.tilt ?? -.16, k = o.k ?? 1; if (k < .01) return;
  const cres = (ri, ro, a0, a1, sy, sd) => {
    const out = ell(cx, cy, R * ro, R * ro * sy, tilt, a0, a1, 50), inn = ell(cx, cy, R * ri, R * ri * sy, tilt, a0, a1, 50);
    X.save(); X.globalAlpha *= k; fillPoly([...out, ...inn.slice().reverse()], PAL.paper); X.restore();
    inkStroke(out, { w: 2.8 * k, taper: [.25, .25], wob: .3, seed: sd }); inkStroke(inn, { w: 1.6 * k, taper: [.3, .3], wob: .3, seed: sd + 1 });
  };
  cres(1.035, 1.2, Math.PI + .12, TAU - .12, .96, 60);
  cres(1.03, 1.1, .5, Math.PI - .5, .8, 70);
}

// ---- LAN kneeling in profile, facing screen-right, head-first into something; legs kick on 8ths ----
// (Kx, Ky) = knee on the floor; `into` = screen point the torso dives toward (hidden by the caller's clip).
function kneelLan(Kx, Ky, U, t, into) {
  const lw = .2 * U, st = (pts, sd, w = lw, tp = [.1, .15]) => inkStroke(pts, { w, taper: tp, wob: .5, seed: 300 + sd, press: .2 });
  const jig = Math.sin(t * 17), H = [Kx - .55 * U + jig * .12 * U, Ky - 2.3 * U - Math.abs(jig) * .1 * U];
  const N = into ?? [H[0] + 3.2 * U, H[1] + 1.1 * U];
  for (const sd of [1, 0]) {   // far leg first
    const k = Math.max(0, Math.sin((bp(t) * 2 + sd) * Math.PI)), a = Math.PI + .06 + k * 1.25, kx = Kx + sd * .42 * U;
    const Fx = kx + Math.cos(a) * 2.1 * U, Fy = Ky + Math.sin(a) * 2.1 * U;
    st([[H[0] + sd * .25 * U, H[1] + .15 * U], [kx, Ky]], 1 + sd, lw, [.02, .05]);
    const fa = a + Math.PI / 2 + .15;   // cast-style foot: a short stroke off the ankle
    st([[kx, Ky], [Fx, Fy], [Fx + Math.cos(fa) * .6 * U, Fy + Math.sin(fa) * .6 * U]], 3 + sd, lw, [.02, .3]);
    if (k > .9) for (let j = 0; j < 3; j++) { const aa = a - 1 + j * .5; line(Fx + Math.cos(aa) * .8 * U, Fy + Math.sin(aa) * .8 * U, Fx + Math.cos(aa) * 1.15 * U, Fy + Math.sin(aa) * 1.15 * U, 3.5, PAL.ink, .85); }
  }
  // torso slopes down from the raised hips into the dark
  const ang = Math.atan2(N[1] - H[1], N[0] - H[0]), W0 = [H[0] + Math.cos(ang) * .45 * U, H[1] + Math.sin(ang) * .45 * U];
  st([W0, [lerp(W0[0], N[0], .5), lerp(W0[1], N[1], .5) - .1 * U], N], 7, lw * 1.15, [.02, .02]);
  // shorts: a small solid shape with a paper waistband
  const R2 = (a, b) => { const [x, y] = rot2(a * U, b * U, ang * .6); return [H[0] + x, H[1] + y]; };
  const sh = [[.5, -.36], [-.2, -.5], [-.66, -.3], [-.7, .16], [-.36, .46], [.12, .44], [.5, .2]].map(([a, b]) => R2(a, b));
  X.save(); X.fillStyle = PAL.ink; smoothPath(sh, true); X.fill(); X.restore();
  inkStroke([R2(.32, -.42), R2(.46, .3)], { w: .09 * U, col: PAL.paper, taper: [.1, .1], wob: .3, seed: 318 });
  for (let j = 0; j < 2; j++) { const r = (1.05 + j * .32) * U, a0 = Math.PI * .95 + jig * .12; inkStroke(ell(H[0], H[1] - .1 * U, r, r * 1.1, 0, a0, a0 + .75, 10), { w: .07 * U, taper: [.3, .3], seed: 320 + j, a: .8 }); }
  return { H, N };
}
// LAN's arm reaching back out of the dark, flinging things over her shoulder on the 8ths
function flingArm(S, U, t) {
  const ph = bp(t) * 2, sw = Math.sin(ph * Math.PI), a1 = -2.25 + .55 * sw, a2 = a1 - .5 - .45 * sw;
  const E1 = [S[0] + Math.cos(a1) * 1.9 * U, S[1] + Math.sin(a1) * 1.9 * U], Hd = [E1[0] + Math.cos(a2) * 1.7 * U, E1[1] + Math.sin(a2) * 1.7 * U];
  inkStroke([S, E1, Hd], { w: .19 * U, taper: [.05, .2], wob: .5, seed: 340, press: .2 });
  return Hd;
}

// ---- a gripping hand (arm enters along +x in local space), for the first pull ----
function hand(x, y, s, ang, o = {}) {
  X.save(); X.translate(x, y); X.rotate(ang); X.scale(s / 100, s / 100); X.globalAlpha *= o.a ?? 1;
  const w = 3.2 * 100 / s, ln = (pts, sd, c = false, ww = w) => pline(pts, ww, PAL.ink, c, 1, sd, .5), fl = pts => fillPoly(pts, PAL.paper);
  const sleeve = [[92, -58], [760, -76], [760, 76], [92, 60]]; fl(sleeve); ln(sleeve, 1, true);
  ln([[122, -58], [126, 60]], 2);
  const wrist = [[30, -40], [100, -44], [100, 46], [34, 44]]; fl(wrist); ln([[30, -40], [100, -44]], 3); ln([[34, 44], [100, 46]], 4);
  const g = o.grip ?? 1;
  // fist: knuckles over the top, fingers wrapping the bar in front (to the left)
  const fist = [[40, -40], [0, -52], [-40, -48], [-62, -26], [-66, 6 + 10 * (1 - g)], [-50, 36], [-8, 46], [40, 44]];
  X.save(); X.fillStyle = PAL.paper; smoothPath(fist, true); X.fill(); X.lineWidth = w; X.strokeStyle = PAL.ink; X.stroke(); X.restore();
  for (let i = 0; i < 3; i++) ln([[-64 + i * 2, -14 + i * 16], [-34 + i * 4, -12 + i * 16]], 5 + i, false, w * .75);
  ln([[18, 20], [-10, 30], [-36, 26]], 9, false, w * .85);   // thumb
  X.restore();
}

// ---- the first pull's damping curve (a live plot) ----
function dampPlot(x, y, w, h, t, t0, dur) {
  const span = dur + .5, u = tt => x + (tt - (t0 - .3)) / span * w, v = k => y + h - k * h * .82;
  line(x, y + h, x + w + 14, y + h, 2.5); line(x, y + h, x, y - 12, 2.5);
  X.save(); X.setLineDash([8, 8]); line(x, v(1), x + w, v(1), 1.6, PAL.ink, .5, 'butt'); X.restore();
  text('到位', x + w + 12, v(1) + 8, { size: 20, font: F.sans, weight: 700 });
  text('拉出 ↑', x + 12, y - 4, { size: 18, font: F.mono, weight: 600, col: PAL.ink2 });
  text('t →', x + w + 14, y + h + 30, { size: 18, font: F.mono, weight: 600, col: PAL.ink2, align: 'right' });
  text('SOFT-PULL · 阻尼曲线', x, y + h + 34, { size: 18, font: F.mono, weight: 600, col: PAL.ink, track: 1 });
  const pts = [], tEnd = Math.min(t, t0 + dur + .2);
  for (let tt = t0 - .3; tt <= tEnd; tt += .02) pts.push([u(tt), v(tt < t0 ? 0 : E.soft((tt - t0) / dur))]);
  if (pts.length > 1) inkStroke(pts, { w: 4.5, taper: [.02, .02], wob: .3, seed: 501 });
  const cur = pts[pts.length - 1]; if (cur) { circle(cur[0], cur[1], 10, { fill: PAL.orange, stroke: PAL.ink, w: 2.5 }); }
  if (t < t0) { if (Math.floor(t * 3) % 2 === 0) text('READY_', x + 26, v(0) - 18, { size: 18, font: F.mono, weight: 600, col: PAL.grey }); }
}
// orange 嗒 with impact ticks. k = 0..1 age progress
function daStamp(x, y, size, age, o = {}) {
  if (age < 0) return;
  const k = E.back(clamp(age / .22), 2.6), fade = 1 - clamp((age - (o.hold ?? 99)) / .25);
  if (fade <= 0) return;
  X.save(); X.globalAlpha *= fade; X.translate(x, y); X.scale(k, k);
  marker('嗒', 0, 0, { size, col: PAL.orange, rot: o.rot ?? -.1, align: 'center' });
  const r0 = size * .62, r1 = size * (.8 + .18 * E.out(clamp(age / .3)));
  for (let i = 0; i < 5; i++) { const a = -2.5 + i * .5 + (o.rot ?? 0); inkStroke([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], { w: size * .045, col: PAL.ink, taper: [.1, .5], seed: i + 7 }); }
  X.restore();
}

// ---- product shot with correct occlusion ----
// Same framing as the shared productShot(), but the near carcass side and the counter slab go in a layer between the basket (1)
// and the fronts (2): seen from outside, anything that falls behind them on screen is inside the carcass, so they always win.
// xray (0..1) turns the near side into a translucent cutaway so the slide + damper stay readable.
function prodShot(ext, o = {}) {
  const yaw = o.yaw ?? -.6, C = frameCam([0, 150, 230 + ext * .5], yaw, o.pitch ?? .62, o.sx ?? CX, o.sy ?? CY, 760, o.px ?? 900, { fov: o.fov ?? 28 });
  const near = yaw < 0 ? -1 : 1, xs = near * 330, P = [];
  P.push(...boxModel(-330, -20, -20, 330, 400, 460, { sides: near < 0 ? 'rbk' : 'lbk', fill: PAL.paper, sideFill: PAL.paper2, backFill: PAL.paper2 }));
  P.push(...boxModel(-350, 400, -20, 350, 430, 490, { sides: near < 0 ? 'r' : 'l', fill: PAL.paper }));
  const F = (pts, fill, iw = 2) => P.push({ k: 'face', layer: 1.5, pts, fill, ink: PAL.ink, iw });
  F([[xs, -20, -20], [xs, -20, 460], [xs, 400, 460], [xs, 400, -20]], o.xray ? rgba(PAL.paper2, 1 - o.xray) : PAL.paper2);
  const ex = near * 350;
  F([[ex, 400, -20], [ex, 400, 490], [ex, 430, 490], [ex, 430, -20]], PAL.paper);
  F([[-350, 400, 490], [350, 400, 490], [350, 430, 490], [-350, 430, 490]], PAL.paper2, 2.2);
  F([[-350, 430, -20], [350, 430, -20], [350, 430, 490], [-350, 430, 490]], PAL.paper, 2.2);
  P.push(...dishDrawer(ext, { items: o.items }));
  render3(P, C, { style: o.style ?? 'steel', shine: o.shine, lw: o.lw });
  return C;
}

// ============================================================ shots ============================================================
const T_OPEN = BT(2);            // 1.554 — the door flies open on 我

// ---- ink wisps: darkness curling out of a door gap (edge a→b, outward side away from `c`) ----
function wisps(a, b, c, t, k, n, seed) {
  if (k < .01) return;
  const ex = b[0] - a[0], ey = b[1] - a[1], el = Math.hypot(ex, ey) || 1; let nx = ey / el, ny = -ex / el;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; if ((mx - c[0]) * nx + (my - c[1]) * ny < 0) { nx = -nx; ny = -ny; }
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n + .08 * noise1(seed + i * 3.1 + t * .4), px = lerp(a[0], b[0], u), py = lerp(a[1], b[1], u);
    const L = k * (120 + 110 * (.5 + .5 * noise1(seed * 7 + i * 1.7 + t * 1.3))), dir = (i + seed) % 2 ? 1 : -1, pts = [];
    for (let j = 0; j <= 22; j++) {
      const s2 = j / 22, d = L * s2, wig = Math.sin(s2 * 5 + t * 4 + i * 2) * 16 * s2;
      let qx = px + nx * d - ny * wig * dir, qy = py + ny * d + nx * wig * dir;
      if (s2 > .55) { const cu = (s2 - .55) / .45, ang = cu * 4.2 * dir, rr = L * .26 * (1 - cu * .55); qx += (Math.cos(ang) - 1) * rr * -ny * dir + Math.sin(ang) * rr * nx; qy += (Math.cos(ang) - 1) * rr * nx * dir + Math.sin(ang) * rr * ny; }
      pts.push([qx, qy]);
    }
    inkStroke(pts, { w: 13 * Math.min(1, k), taper: [.02, .92], wob: .6, seed: seed * 13 + i, press: .3 });
  }
}
// the cold-open door: slightly ajar, banging open wider on the beats (a bounce), then flung on 我
function ajarAt(t) {
  const hb = t >= BT(0) ? (() => { const n = Math.min(beatN(t), 1), sb = t - BT(n); return (n === 0 ? .7 : 1) * Math.exp(-sb * 6) * Math.abs(Math.sin(sb * 24)); })() : 0;
  return .3 + .03 * Math.sin(t * 4.3) + .32 * hb;
}

// ---- 0.0 – 5.96 · cold open → the black hole reveal (one take) ----
function sHole(t) {
  paperBG();
  const o = t - T_OPEN, opened = o > 0;
  let hitCO = 0, sb = 9;
  if (t >= BT(0) && t < T_OPEN + .3) { const n = Math.min(beatN(t), 1); sb = t - BT(n); hitCO = (n === 0 ? .7 : 1) * Math.exp(-sb * 4); }
  const glide = E.soft(o / 1.7), push = E.io(clamp(o / 4.6)), hit = t > 4.9 ? pulse(t, 5) : 0;
  const shk = shake(t, 6 * hitCO, 3);
  const sx = lerp(1190, 1370, glide) + shk[0], sy = lerp(545, 566, glide) + shk[1];
  const px = (lerp(700, 612, glide) + 40 * push) * (1 + .025 * hit);
  const C = frameCam([0, 420, 0], lerp(-.3, -.05, glide) + .012 * Math.sin(t * .7), .1 + .03 * push, sx, sy, 840, px, { fov: 30 });
  const a0 = ajarAt(T_OPEN), door = opened ? a0 + (1.6 - a0) * spring(o, 1.5, .45) : ajarAt(t);
  const G = cabGeom(C, { door, hinge: 1 });
  // the hole + where it leaks: the crack along the door's free edge
  const dc = P2(C, [0, 440, -260]), ow = dist(G.open[0][0], G.open[0][1], G.open[1][0], G.open[1][1]);
  const R = ow * .42 * (1 + .05 * hit);
  const reveal = opened ? E.out5(clamp((door - .3) / .5)) : 0, gone = 1 - clamp(o / .25);
  const ck = [lerp(G.open[0][0], G.front[0][0], .5), lerp(G.open[0][1], G.open[3][1], .55)];
  const L = { x: lerp(ck[0], dc[0], reveal), y: lerp(ck[1], dc[1], reveal), mode: 'pinch', R: R * .98 * reveal,
    e: lerp(235 + 60 * hitCO, R * 1.12, reveal), k: 1, sw: lerp(.7 + .4 * hitCO, .9 + .5 * hit + .25 * Math.sin(t * .9), reveal) };
  warpGrid({ gap: 60, L, a: .08 });
  const ring = { tilt: -.19, flat: .22, spin: 1 + .5 * hit + .3 * push, k: reveal, xf: 850 };
  cabBody(C, G);
  if (opened) cabInterior(C, G, L, reveal);
  // the void: solid black from the very first frame; the lensed interior + disc bloom out of it
  X.save(); X.globalAlpha *= 1 - reveal; fillPoly(G.open, PAL.ink); X.restore();
  if (opened) {
    ringLayer(t, dc[0], dc[1], R, ring, false);
    blackDisc(dc[0], dc[1], R * E.out5(clamp(o / .15)), { tilt: ring.tilt, k: reveal });
    pline(G.outer, 2.8, PAL.ink, true, 1, 7);
  }
  // a wok half-swallowed by the crack (body in the dark, handle sticking out), yanked further in on each beat
  const wk = 1 - clamp((o + .05) / .2);
  if (wk > 0) {
    const pullIn = 18 * t + 30 * (t >= BT(0) ? 1 - Math.exp(-(t - BT(0)) * 9) : 0) + 30 * (t >= BT(1) ? 1 - Math.exp(-(t - BT(1)) * 9) : 0);
    const ang = -2.62 + .07 * Math.sin(t * 6) + .12 * hitCO * Math.sin(sb * 30), dx = Math.cos(ang), dy = Math.sin(ang), sz = 64;
    const bcx = ck[0] + 6 - dx * pullIn, bcy = ck[1] - 30 - dy * pullIn;
    // handle points out along (dx, dy): the pot's local +x is its handle side
    ware('pot', bcx, bcy, sz, ang, { seed: 5, w: 4.2, a: wk });
    const tipx = bcx + dx * 2.05 * sz, tipy = bcy + dy * 2.05 * sz, bl = Math.min(tipx, bcx - sz * .9) - 16, bt = Math.min(tipy, bcy - sz * .75) - 16;
    const br = ck[0] + 10, bb = bcy + sz * .75 + 14;
    bbox(bl, bt, br - bl, bb - bt, '锅  404', { k: 1, a: wk, size: 28, lw: 3.5, dash: t > 1.25 ? [12, 9] : [] });
  }
  // the door: rattles in screen space on the beats (a jolt about its hinge)
  const hs = P2(C, G.doorFn([297, 796, 20])), jr = .02 * hitCO * Math.sin(sb * 38), jx = -7 * hitCO * Math.sin(sb * 31);
  X.save(); X.translate(hs[0] + jx, hs[1]); X.rotate(jr); X.translate(-hs[0], -hs[1]);
  cabDoor(C, G);
  if (gone > 0) {
    gapLine(G.front, gone * (.6 + .5 * hitCO));
    const cen = [(G.front[0][0] + G.front[2][0]) / 2, (G.front[0][1] + G.front[2][1]) / 2];
    wisps(G.front[3], G.front[0], cen, t, gone * (.85 + .55 * hitCO), 4, 1);
  }
  X.restore();
  if (opened) {
    if (o < .5) for (const y of [120, 460, 770]) {   // whoosh of the free edge
      const pts = []; for (let j = 0; j <= 12; j++) { const oo = Math.max(0, o - j * .018), th = a0 + (1.6 - a0) * spring(oo, 1.5, .45); pts.push(P2(C, cabGeom(C, { door: th, hinge: 1 }).doorFn([-297, y, 20]))); }
      inkStroke(pts.reverse(), { w: 5, taper: [.9, .05], wob: .3, seed: 90 + y, a: .7 * (1 - o / .5) });
    }
    ringLayer(t, dc[0], dc[1], R, ring, true);
  }
  const fl = P2(C, [0, 0, 0]); inkStroke([[fl[0] - 640, fl[1]], [fl[0] + 640, fl[1]]], { w: 3, taper: [.3, .3], seed: 5 });
  // title (readable on a phone from frame 0), lifts away just before 我 lands
  const tOut = E.in(clamp((t - 1.3) / .24));
  if (tOut < 1) {
    const bump = t >= BT(0) ? .05 * Math.exp(-(t - BT(beatN(t))) * 8) : 0;
    X.save(); X.globalAlpha *= 1 - tOut; X.translate(118 + shk[0] * .3, 500 - 60 * tOut); X.scale(1 + bump, 1 + bump);
    text('一拉就到位', 0, 0, { size: 104, font: F.serif, weight: 900, track: 4 });
    line(4, 40, 520, 40, 4, PAL.ink);
    text('HIGOLD 悍高 · 厨房拉篮 M/V', 4, 92, { size: 30, font: F.sans, weight: 700, track: 3 });
    text('第一章 · 黑洞橱柜', 4, 138, { size: 26, font: F.sans, weight: 500, col: PAL.ink2, track: 5 });
    X.restore();
  }
  if (t >= BT(1) && gone > 0) {
    const a = t - BT(1), k = E.back(clamp(a / .2), 2.4), ax = G.outer[2][0] + 150, ay = G.outer[2][1] + 70;
    X.save(); X.globalAlpha *= gone; X.translate(ax, ay); X.scale(k, k);
    marker('咚', 0, 0, { size: 170, rot: .12, align: 'center' });
    for (let i = 0; i < 3; i++) { const aa = Math.PI + .4 - i * .4, r0 = 110, r1 = 110 + 46 * E.out(clamp(a / .25)); inkStroke([[Math.cos(aa) * r0 - 10, Math.sin(aa) * r0], [Math.cos(aa) * r1 - 10, Math.sin(aa) * r1]], { w: 7, taper: [.1, .6], seed: 40 + i }); }
    X.restore();
  }
  // lyric 0: 我家橱柜 / 深处有黑洞 — 黑洞 in orange
  lyHero(0, t, { x: 118, y: 470, size: 128, align: 'left', hi: '黑洞', lead: 1.16, exit: 'fade', hold: .1 });
  metaStrip(t, { br: 'CH.01  ·  THE BLACK-HOLE CABINET' });
}

// ---- 5.96 – 8.0 · kitchenware spirals in, detection boxes flip to 404 ----
const SW = [   // kind, label, tagged (sung), vanishes, final angle, size
  ['pot', '锅', 5.985, 6.667, -.7, 88], ['bowl', '碗', 6.326, 7.008, 1.5, 76],
  ['ladle', '瓢', 6.667, 7.349, 3.7, 80], ['basin', '盆', 7.008, 7.69, 5.2, 84],
];
const SW2 = [['spoon', 7.5, 2.6, 48], ['lid', 8.3, 4.5, 58], ['chop', 8.0, .9, 52], ['cup', 8.9, 5.8, 44], ['plate', 9.4, 3.2, 62], ['spat', 9.8, .1, 50]];
function swPos(tv, phv, t, cx, cy, R) {
  const u = tv - t, r = R * (1.02 + 2.1 * u), ph = phv - 1.55 * Math.log(1 + 2.1 * u);
  return [cx + Math.cos(ph) * r, cy + Math.sin(ph) * r * .86, r, ph];
}
function sSwallow(t, lt) {
  paperBG();
  const cx = 1390, cy = 548, R = lerp(190, 214, E.io(clamp(lt / 2))) * (1 + .04 * pulse(t, 6)), sw = 2.3 + lt * .4;
  warpGrid({ gap: 60, L: { x: cx, y: cy, e: R * 1.08, R: R * .99, k: 1, sw, swp: 3, mode: 'pinch' }, a: .075 });
  // spiral flow lines
  for (let j = 0; j < 9; j++) {
    const p0 = j * TAU / 9 + t * 1.25, pts = [];
    for (let i = 0; i <= 36; i++) { const r = R * Math.exp(i / 36 * 1.3), ph = p0 - 1.55 * Math.log(r / R); pts.push([cx + Math.cos(ph) * r, cy + Math.sin(ph) * r * .86]); }
    inkStroke(pts, { w: 3.6, taper: [.05, .95], wob: .4, seed: 200 + j, a: .6 });
  }
  circle(cx, cy, R, { fill: PAL.ink }); handCircle(cx, cy, R + 3, { w: 4, seed: 203 });
  for (let i = 0; i < 2; i++) { const a0 = t * (2.4 - i) + i * 2; inkStroke(ell(cx, cy, R * (1.1 + i * .08), R * (1.1 + i * .08) * .86, 0, a0, a0 + 3.6, 40), { w: 3 - i, taper: [.6, .1], wob: .3, seed: 210 + i }); }
  // minor debris (never tagged)
  SW2.forEach(([kind, tv, phv, sz], i) => {
    const [x, y, r, ph] = swPos(tv, phv, t, cx, cy, R); if (r > 1300) return;
    const st = 1 + .9 * Math.pow(clamp((2.2 * R - r) / (1.2 * R)), 1.4);
    ware(kind, x, y, sz * (.55 + .45 * clamp(r / (2.5 * R))), t * (.5 + hash(i) * .6) + i, { seed: 90 + i, stretch: st, sdir: ph, w: 3.4 });
  });
  // the four sung items: detection box → 404
  SW.forEach(([kind, lab, tt, tv, phv, sz], i) => {
    const alive = t < tv, [x, y, r, ph] = swPos(tv, phv, alive ? t : tv, cx, cy, R);
    if (alive && r < 1300) {
      const st = 1 + 1.1 * Math.pow(clamp((2.3 * R - r) / (1.25 * R)), 1.4), sc = sz * (.6 + .4 * clamp(r / (2.4 * R)));
      const fade = clamp((tv - t) / .07);
      const trail = []; for (let j = 0; j <= 12; j++) { const q = swPos(tv, phv, t - j * .03, cx, cy, R); trail.push([q[0], q[1]]); }
      inkStroke(trail.reverse(), { w: 9, taper: [.95, .05], seed: 220 + i, a: .4 * fade });
      ware(kind, x, y, sc, (t - tt) * (.5 + i * .12) * (i % 2 ? -1 : 1) - .25 + i * .15, { seed: 230 + i, stretch: st, sdir: ph, a: fade, w: 4 });
    }
    if (t >= tt) {
      const bs = alive ? sz * (.6 + .4 * clamp(r / (2.4 * R))) : sz * .6, bw = bs * 2.7, bh = bs * 2.1;
      const gone = t - tv, kk = alive ? clamp((t - tt) / .25) : clamp(gone / .25), a = alive ? 1 : 1 - clamp((gone - .6) / .3);
      if (a > 0) bbox(x - bw / 2, y - bh / 2, bw, bh, alive ? `${lab}  0.9${7 - i}` : `${lab}  404`, { k: kk, a, dash: alive ? [] : [12, 9], size: 26, lw: 3.5 });
    }
  });
  lySide(1, t, { x: 116, y: 600, size: 112 });
  if (t > 7.69) { const k = E.out5(clamp((t - 7.69) / .2)); text('ERR 404 · NOT FOUND', 118, 800, { size: 24, font: F.mono, weight: 700, col: PAL.cobalt, a: k, track: 2 }); }
}

// ---- 8.0 – 9.0 · 跪着翻找: LAN head-first in the cabinet, legs kicking ----
function sKneel(t, lt) {
  paperBG();
  const z = lt * .05;
  const C = frameCam([0, 330, 200], 1.0, .12, 1230, 500, 840, 820 * (1 + z), { fov: 30 });
  const hc = P2(C, [0, 440, -200]);
  warpGrid({ gap: 60, L: { x: hc[0], y: hc[1], e: 140, R: 0, k: 1, sw: .6, mode: 'pinch' }, a: .06 });
  const G = cabGeom(C, { door: 0, hinge: -1 });
  const wall = P2(C, [0, 0, -560]);
  inkStroke([[-40, wall[1]], [W + 40, wall[1]]], { w: 3, taper: [0, 0], seed: 3 });
  cabBody(C, G);
  fillPoly(G.open, PAL.ink);
  // LAN: knees on the floor in front of the opening; everything that enters the opening is swallowed
  const K = P2(C, [0, 0, 440]), U = 98;
  X.save(); X.globalAlpha = .1; X.fillStyle = PAL.ink; X.beginPath(); X.ellipse(K[0] - 130, K[1] + 6, 230, 17, 0, 0, TAU); X.fill(); X.restore();
  const ob = G.open[0], ot = G.open[3], into = [ob[0] + 70, lerp(ob[1], ot[1], .06)];
  X.save(); X.beginPath(); X.rect(0, 0, W, H); X.moveTo(G.open[0][0], G.open[0][1]); for (const q of G.open) X.lineTo(q[0], q[1]); X.closePath(); X.clip('evenodd');
  kneelLan(K[0], K[1], U, t, into);
  X.restore();
  // inside the dark: rummaging marks in paper colour
  X.save(); poly(G.open); X.clip();
  const oc = [(G.open[0][0] + G.open[2][0]) / 2, (G.open[0][1] + G.open[2][1]) / 2];
  for (let i = 0; i < 3; i++) { const a = t * 9 + i * 2.1, r = 40 + i * 16; inkStroke(ell(oc[0] + 10, oc[1] + 90, r, r * .6, 0, a, a + 1.4, 14), { w: 3.5, col: PAL.paper, taper: [.2, .6], seed: 330 + i, a: .8 }); }
  text('?', oc[0] + 44 + Math.sin(t * 8) * 6, oc[1] - 20, { size: 72, font: F.heavy, weight: 900, col: PAL.paper, align: 'center', rot: .15 });
  text('?', oc[0] - 20, oc[1] - 70 + Math.cos(t * 7) * 5, { size: 48, font: F.heavy, weight: 900, col: PAL.paper, align: 'center', rot: -.2, a: .8 });
  X.restore();
  // stuff flung out of the cabinet over her back, on the 8ths
  const tossK = ['lid', 'spoon', 'bowl', 'cup', 'chop', 'plate', 'spat'];
  for (let i = 0; i < 7; i++) {
    const t0 = BT(11.25) + i * BEAT / 2, a = t - t0; if (a < 0 || a > 1.5) continue;
    const vx = -(560 + hash(i) * 360), vy = -(820 + hash(i + 4) * 260), x = ot[0] + 30 + vx * a, y = lerp(ob[1], ot[1], .45) + vy * a + 1500 * a * a;
    ware(tossK[i], x, y, 40 + hash(i + 9) * 14, a * (7 + i) * (i % 2 ? 1 : -1), { seed: 350 + i, w: 3.4 });
  }
  lyMarker(2, t, { x: 118, y: 250, size: 150, align: 'left', rot: -.05 });
}

// ---- 9.0 – 12.47 · spice bottles domino on the syllables; search finds no salt ----
const SB = 1.22;   // bottle scale
const BOT = [   // half-width profile [r, y] from the base, and the paper label (no salt anywhere — that's the joke)
  [[[0, 0], [32, 0], [34, 6], [34, 160], [27, 182], [13, 206], [13, 238], [16, 241], [16, 262], [0, 262]], '酱'],
  [[[0, 0], [48, 0], [50, 6], [50, 118], [42, 126], [42, 134], [46, 136], [46, 158], [0, 158]], '糖'],
  [[[0, 0], [27, 0], [29, 10], [23, 62], [29, 112], [27, 176], [18, 194], [0, 200]], '椒'],
  [[[0, 0], [36, 0], [38, 6], [38, 204], [29, 234], [14, 258], [14, 294], [17, 297], [17, 316], [0, 316]], '油'],
  [[[0, 0], [31, 0], [33, 5], [33, 128], [23, 144], [23, 168], [26, 170], [26, 188], [0, 188]], '醋'],
  [[[0, 0], [30, 0], [32, 6], [32, 178], [25, 196], [12, 214], [12, 248], [15, 251], [15, 268], [0, 268]], '酒'],
  [[[0, 0], [40, 0], [42, 6], [42, 104], [35, 112], [35, 122], [39, 124], [39, 140], [0, 140]], '蚝'],
].map(([pf, lab]) => [pf.map(([r, y]) => [r * SB, y * SB]), lab]);
const BOT_T = LY[3].t.slice(0, 7);   // each bottle starts to fall on a syllable of 调料瓶倒成一片
const FLOOR_S = 890;
const botLayout = (() => {
  const L = []; let x = 428;
  BOT.forEach(([pf]) => { const r = Math.max(...pf.map(p => p[0])), h = pf[pf.length - 1][1]; L.push({ x: x + r, r, h, rb: pf[1][0] }); x += 2 * r + h * .38; });
  return L;
})();
function botAngle(i, t) {
  const L = botLayout[i], s = BOT_T[i], last = i === BOT.length - 1;
  if (t < s) return 0;
  const nx = last ? 1e9 : botLayout[i + 1].x - botLayout[i + 1].r, d = nx - (L.x + L.rb), thc = last ? Math.PI / 2 - .02 : Math.asin(clamp(d / L.h, 0, .97));
  const tc = last ? s + .36 : BOT_T[i + 1];
  if (t < tc) { const k = (t - s) / (tc - s); return thc * k * k; }
  if (last) return thc - .06 * Math.exp(-(t - tc) * 7) * Math.abs(Math.sin((t - tc) * 22));
  const nxt = botAngle(i + 1, t);
  return Math.min(thc + nxt * .55, 1.3);
}
function drawBottle(i, th) {
  const [pf, lab] = BOT[i], L = botLayout[i];
  const pts = [...pf.map(([r, y]) => [r, -y]), ...pf.slice().reverse().map(([r, y]) => [-r, -y])];
  X.save(); X.translate(L.x + L.rb, FLOOR_S); X.rotate(th); X.translate(-L.rb, 0);
  fillPoly(pts, PAL.paper); pline(pts, 3.4, PAL.ink, true, 1, 400 + i * 7);
  const ly0 = -L.h * .28, ly1 = -L.h * .56, lw = L.r * .82;
  fillPoly([[-lw, ly0], [lw, ly0], [lw, ly1], [-lw, ly1]], PAL.paper2); pline([[-lw, ly0], [lw, ly0], [lw, ly1], [-lw, ly1]], 2, PAL.ink, true, 1, 410 + i);
  text(lab, 0, (ly0 + ly1) / 2 + 15, { size: 42, font: F.serif, weight: 900, align: 'center' });
  X.restore();
}
function sSpice(t, lt) {
  paperBG();
  warpGrid({ gap: 60, L: { x: 1750, y: 1400, e: 200, R: 0, k: 1, sw: .25, mode: 'pinch' }, a: .065 });
  inkStroke([[430, FLOOR_S], [1910, FLOOR_S]], { w: 3, taper: [.08, 0], seed: 9 });
  hatch([[430, FLOOR_S + 4], [1920, FLOOR_S + 4], [1920, FLOOR_S + 26], [430, FLOOR_S + 26]], { gap: 11, w: 1.2, a: .35, angle: -.9 });
  for (let i = BOT.length - 1; i >= 0; i--) drawBottle(i, botAngle(i, t));
  // impact ticks on each hit
  for (let i = 1; i < BOT.length; i++) {
    const a = t - BOT_T[i]; if (a < 0 || a > .3) continue;
    const L = botLayout[i], k = E.out(a / .3), cxh = L.x - L.r - 6, cyh = FLOOR_S - Math.min(L.h, botLayout[i - 1].h) * .8;
    for (let j = 0; j < 3; j++) { const aa = -Math.PI / 2 - .9 + j * .5; inkStroke([[cxh + Math.cos(aa) * 22, cyh + Math.sin(aa) * 22], [cxh + Math.cos(aa) * (22 + 44 * k), cyh + Math.sin(aa) * (22 + 44 * k)]], { w: 5, taper: [.1, .6], seed: 440 + i * 3 + j, a: 1 - k }); }
  }
  // the search bar slides in with the drawer curve on beat 15
  const sIn = E.soft((t - BT(15)) / .9);
  if (sIn > 0) {
    const bx = lerp(W + 40, 1000, sIn), by = 170, bw = 800;
    const typed = t >= 11.08;
    searchBar(bx, by, bw, typed ? '盐' : '', 11.08, 11.2, t, { h: 90, size: 46 });
    if (!typed) text('搜索调料…', bx + 96, by + 60, { size: 40, font: F.sans, weight: 400, col: PAL.grey });
    const r = t - BT(17);
    if (r > 0) {
      const hk = E.out5(clamp(r / .3)), ph = 262 * hk, ry = by + 90 + 16;
      rect(bx + 8, ry + 8, bw, ph, PAL.ink); rect(bx, ry, bw, ph, PAL.paper); X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 3; X.strokeRect(bx, ry, bw, ph); X.restore();
      X.save(); X.beginPath(); X.rect(bx, ry, bw, ph); X.clip();
      text('「盐」 0 个结果', bx + 26, ry + 72, { size: 46, font: F.sans, weight: 900 });
      text('调料区 · 深处', bx + bw - 30, ry + 66, { size: 19, font: F.mono, weight: 600, col: PAL.grey, align: 'right' });
      line(bx + 30, ry + 110, bx + bw - 30, ry + 110, 1.5, PAL.ink, .3);
      text('你是不是要找：', bx + 30, ry + 170, { size: 32, font: F.sans, weight: 500, col: PAL.ink2 });
      const lx = bx + 30 + measure('你是不是要找：', 32, F.sans, 500), lw2 = measure('拉篮', 32, F.sans, 800);
      text('拉篮', lx, ry + 170, { size: 32, font: F.sans, weight: 800, col: PAL.cobalt });
      line(lx, ry + 181, lx + lw2, ry + 181, 3, PAL.cobalt);
      text('？', lx + lw2 + 4, ry + 170, { size: 32, font: F.sans, weight: 500, col: PAL.ink2 });
      text('↳ 全拉出 · 一眼看见', bx + 30, ry + 226, { size: 21, font: F.mono, weight: 600, col: PAL.grey });
      X.restore();
      // the cursor drifts to 拉篮 and clicks
      const cT = 12.12, mk = E.io(clamp((t - 11.95) / .3)), tx = lx + 36, ty = ry + 166;
      if (t > 11.95) cursor(lerp(tx + 260, tx, mk), lerp(ty + 160, ty, mk), { click: t > cT ? clamp((t - cT) / .3) : 0, s: 1.5 });
    }
  }
  lyVertical(3, t, { x: 318, y: 150, size: 92, gap: 1.34, font: F.serif, weight: 900 });
}

// ---- 12.47 – 16.56 · the first pull: space snaps straight, the steel basket glides out ----
const T_PULL = LY[4].t[5] - .004;   // 拉
function sPull(t, lt) {
  paperBG();
  const pk = E.soft((t - T_PULL) / 1.4), ext = 420 * pk, orb = E.io(clamp(lt / 4.4));
  const opt = { sx: 1280, sy: 610, px: 800, yaw: lerp(-.24, -.74, orb), pitch: lerp(.28, .58, orb) };
  // residual warp that snaps straight on the pull, with a spring wobble
  const Cg = frameCam([0, 150, 230 + ext * .5], opt.yaw, opt.pitch, opt.sx, opt.sy, 760, opt.px, { fov: 28 });
  const fc = P2(Cg, [0, 170, 460 + ext]);
  const kWarp = t < T_PULL ? .85 + .1 * Math.sin(t * 3) : .95 * (1 - spring(t - T_PULL, 2.2, .3));
  warpGrid({ gap: 60, L: { x: fc[0], y: fc[1], e: 190, R: 0, k: kWarp, sw: .5, mode: 'pinch' }, a: .075 });
  const shine = t > T_PULL + .5 ? lerp(-460, 460, E.io(clamp((t - T_PULL - .5) / 1.3))) : null;
  const C = prodShot(ext, { ...opt, style: 'steel', shine });
  // darkness still leaking round the closed front — gone once it's pulled
  const fq = [[-316, 330, 461 + ext], [316, 330, 461 + ext], [316, 10, 461 + ext], [-316, 10, 461 + ext]].map(p => P2(C, p));
  if (pk < .3) {   // the old darkness still leaks round the closed front — until it's pulled
    const gk = (1 - pk / .3) * (.5 + .25 * pulse(t, 4));
    X.save(); X.beginPath(); X.rect(0, 0, W, H); X.moveTo(fq[0][0], fq[0][1]); for (const q of fq) X.lineTo(q[0], q[1]); X.closePath(); X.clip('evenodd');
    darkGlow(fq, t, gk, { spread: 80, left: 1, right: 1, top: .6, bot: .8, gap: 11 });
    X.restore(); gapLine(fq, gk);
  }
  // the hand: reaches, grips on 我, yanks on 拉, lets go
  const hp = P2(C, [0, 292, 462 + ext]), tIn = 13.3, tGrip = 14.25;
  if (t > tIn && t < T_PULL + 1.3) {
    const ap = E.io(clamp((t - tIn) / (tGrip - tIn))), out = E.in(clamp((t - T_PULL - .8) / .45));
    const x = lerp(hp[0] + 620, hp[0], ap) + out * 520, y = lerp(hp[1] + 460, hp[1], ap) + out * 520;
    hand(x, y, 132, .62, { grip: clamp((t - tGrip + .15) / .15) });
  }
  if (t > T_PULL && t < T_PULL + .5) { const a = (t - T_PULL) / .5; for (let i = 0; i < 4; i++) { const yy = hp[1] + 60 + i * 38; inkStroke([[hp[0] + 180 + i * 30, yy], [hp[0] + 420 + i * 30, yy + 60]], { w: 5, taper: [.8, .1], seed: 520 + i, a: (1 - a) * .7 }); } }
  // glints on the beats once it's out
  for (const n of [22, 23]) { const a = t - BT(n); if (a > 0 && a < .45) { const g = pin(C, n === 22 ? [-280, 210, 440 + ext] : [270, 210, 20 + ext]); sparkle(g[0], g[1], 46, { k: Math.sin(a / .45 * Math.PI), rot: a * 2 }); } }
  lySide(4, t, { x: 116, y: 380, size: 122, hi: '拉' });
  dampPlot(128, 700, 470, 160, t, T_PULL, 1.4);
}

// ---- 16.56 – 17.9 · LAN close-up: star eyes, blush, the machine detects a crush ----
function sFace(t, lt) {
  paperBG();
  const cx = 1170, cy = 470, z = 1 + .09 * E.io(clamp(lt / 1.5)), p = pulse(t, 5);
  halftone(0, 0, W, H, (x, y) => clamp((Math.hypot(x - cx, (y - cy) * 1.2) - 480) / 800) * .95, { gap: 22, a: .32 });
  speedLines(cx, cy, 500, 1500, 64, { a: .2, w: 8, seed: 9, rot: lt * .08 });
  // zoom about the face (not the screen centre)
  X.save(); X.translate(cx, cy); X.scale(z, z); X.translate(-cx, -cy);
  const U = 128, bob = Math.sin(bp(t) * Math.PI);
  const f = figure(cx, cy + 9.15 * U + 22 * (1 - Math.abs(bob)), U, { ...KP.frame, head: .1 * bob, lean: .02 * bob }, { who: 'lan', face: 'star', blush: 1.2 + .6 * p, seed: 610, w: .14, shadow: false });
  X.restore();
  // the machine notices
  const hx = (f.head[0] - cx) * z + cx, hy = (f.head[1] - cy) * z + cy, hr = f.head[2] * z * 1.45;
  const bk = clamp((t - BT(25)) / .3);
  bbox(hx - hr, hy - hr * 1.05, hr * 2, hr * 2.1, '心动  1.00', { k: bk, size: 28, lw: 3.5 });
  for (let i = 0; i < 5; i++) {
    const a = t - BT(24) - i * .136, k = a > 0 ? Math.sin(clamp(a / .5) * Math.PI) : 0;
    const ang = -2.75 + i * .62, r = 380 + (i % 2) * 70; sparkle(cx + Math.cos(ang) * r * 1.2, cy + Math.sin(ang) * r, 30 + (i % 3) * 12, { k, rot: a });
  }
  text('LAN  小篮', 96, H - 104, { size: 36, font: F.smiley, col: PAL.ink });
  text('FIRST PULL · 心动 DETECTED', 96, H - 64, { size: 19, font: F.mono, weight: 600, col: PAL.ink2, track: 3 });
}

// ---- 17.9 – 20.65 · slow-mo soft close, the first 嗒 ----
const T_DA = BT(28);   // 19.286 刚
function closeExt(t) {
  if (t < 17.92) return 420;
  if (t < 18.6) return lerp(420, 110, E.io((t - 17.92) / .68) * .96 + (t - 17.92) / .68 * .04);
  return 110 * (1 - E.soft((t - 18.6) / (T_DA - 18.6 + .02)));
}
function sClose(t, lt) {
  paperBG();
  gridScroll(t);
  const ext = closeExt(t);
  const C = prodShot(ext, { xray: .62, sx: 1320, sy: 590, px: 880, yaw: lerp(-.98, -.9, E.io(clamp(lt / 2.7))), pitch: .26, style: 'steel', shine: lerp(300, -300, clamp(lt / 2.5)) });
  const rail = pin(C, [-294, 142, 360]);
  const ck = clamp((t - 18.45) / .7);
  callout(rail[0], rail[1], rail[0] - 90, 996, 'SOFT-CLOSE · 阻尼缓冲', { k: ck, dir: 1, size: 28 });
  // the 嗒 lands on the drawer front itself — the sound of it closing
  const fc = pin(C, [0, 190, 461 + ext]);
  daStamp(fc[0] + 10, fc[1] + 10, 230, t - T_DA, {});
  text('SLOW-MO', W - 72, 96, { size: 20, font: F.mono, weight: 600, align: 'right', col: PAL.ink2, track: 3, a: .8 });
  lyHero(5, t, { x: 116, y: 450, size: 144, align: 'left', lead: 1.18, exit: 'fade', hold: .25 });
}
// the grid scrolls left, accelerating into the chorus
function gridScroll(t) {
  const a = Math.max(0, t - 17.9), b = Math.max(0, t - 20.6);
  const pos = 26 * a + 140 * Math.pow(b, 2.3);
  warpGrid({ gap: 60, ox: -pos, a: .075 + .03 * clamp(b / 2.4) });
  return pos;
}
// ---- 20.65 – 23.0 · accelerating cuts: out, in 嗒, out, in 嗒 (2 beats → 1 → ½ → ½) ----
function buildShot(v) {
  return (t, lt) => {
    paperBG();
    const pos = gridScroll(t);
    const dir = v.dir, k = dir > 0 ? E.soft(lt / (v.d ?? .55)) : 1 - E.out5(lt / (v.d ?? .24));
    const ext = 420 * k;
    const C = prodShot(ext, { xray: v.xray, sx: v.sx ?? 1320, sy: v.sy ?? 590, px: v.px, yaw: v.yaw + lt * (v.drift ?? .05), pitch: v.pitch, style: 'steel', shine: lerp(-400, 400, clamp(lt / .6)) });
    if (dir < 0) { const fc = pin(C, [0, 190, 461 + ext]); daStamp(fc[0], fc[1], v.ds ?? 180, lt - (v.d ?? .24) + .03, { rot: v.rot ?? -.1 }); }
    // speed streaks grow as the build accelerates (they travel left with the grid)
    const sp = clamp((t - 21.2) / 1.7);
    if (sp > 0) for (let i = 0; i < 14; i++) {
      const y = 140 + hash(i * 3.3) * 820, l = (220 + hash(i) * 420) * sp, span = W + 900;
      const x = W + 300 - ((pos * (1.6 + hash(i + 2) * 1.2) + hash(i + 7) * span) % span);
      inkStroke([[x, y], [x + l, y]], { w: 2.5 + hash(i + 5) * 3.5, taper: [.04, .95], wob: .2, seed: 800 + i, a: .55 * sp });
    }
    lyHero(5, t, { x: 116, y: 450, size: 150, align: 'left', lead: 1.18, exit: 'fade', hold: .25 });
    metaStrip(t, { br: 'NEXT ▸ 一拉就到位', a: .9 });
  };
}

chapter('verse1', 0, 23.0, [
  [0, sHole],
  [5.96, sSwallow],
  [8.0, sKneel],
  [9.0, sSpice],
  [BT(18), sPull],
  [BT(24), sFace],
  [17.9, sClose],
  [BT(30), buildShot({ dir: 1, d: .6, px: 820, yaw: -.5, pitch: .44 })],
  [BT(32), buildShot({ dir: -1, d: .2, px: 900, yaw: -1.0, pitch: .2, sx: 1330, ds: 200, xray: .6 })],
  [BT(32.5), buildShot({ dir: 1, d: .28, px: 700, yaw: -.25, pitch: .95, sx: 1340, sy: 610 })],
  [BT(33), buildShot({ dir: -1, d: .12, px: 1000, yaw: -.3, pitch: .3, sx: 1360, sy: 620, ds: 240, rot: .08 })],
]);
})();
