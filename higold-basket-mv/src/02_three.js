// 02_three.js — tiny 3D line renderer for the product: wire baskets, slides, cabinet, and lathe objects (plates, bowls, jars).
// World units ≈ millimetres, Y up. A basket's local frame: x ∈ [-w/2, w/2] (width), y ∈ [0, h] (up), z ∈ [0, d] (z = d is the front,
// the side that pulls out toward the viewer).
'use strict';

// ---------- vectors ----------
const v3 = (x = 0, y = 0, z = 0) => [x, y, z];
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vmul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vcross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vnorm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const vlerp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }

// ---------- camera ----------
// camera3({eye, at, fov (deg), cx, cy, roll, up}) → {project(p) → [sx, sy, depth, pxPerUnit], ...}
function camera3(o) {
  const eye = o.eye, at = o.at ?? [0, 0, 0], fov = (o.fov ?? 35) * Math.PI / 180, cx = o.cx ?? CX, cy = o.cy ?? CY;
  const fwd = vnorm(vsub(at, eye)); let right = vnorm(vcross(fwd, o.up ?? [0, 1, 0])); let up = vcross(right, fwd);
  if (o.roll) { const c = Math.cos(o.roll), s = Math.sin(o.roll); const r2 = vadd(vmul(right, c), vmul(up, s)), u2 = vadd(vmul(up, c), vmul(right, -s)); right = r2; up = u2; }
  const f = (H / 2) / Math.tan(fov / 2) * (o.zoom ?? 1);
  return {
    eye, at, f, cx, cy, fwd, right, up,
    project(p) { const d = vsub(p, eye), z = vdot(d, fwd); const zz = Math.max(z, 1); return [cx + f * vdot(d, right) / zz, cy - f * vdot(d, up) / zz, z, f / zz]; },
  };
}
// orbit camera around a target: yaw (rad, 0 = looking from +z toward -z), pitch (rad, + = from above), distance
function orbit(at, yaw, pitch, distance, o = {}) {
  const eye = [at[0] + Math.sin(yaw) * Math.cos(pitch) * distance, at[1] + Math.sin(pitch) * distance, at[2] + Math.cos(yaw) * Math.cos(pitch) * distance];
  return camera3({ ...o, eye, at });
}

// ---------- scene graph: a flat list of primitives with transforms baked ----------
// Primitive kinds:
//   {k:'wire', pts:[[x,y,z]…], r: wire radius (mm), tone: 0..1 (0 = steel, 1 = ink-only)}
//   {k:'face', pts:[[x,y,z]…], fill, ink, iw}                         — opaque polygon (panels, doors, shelves)
//   {k:'lathe', at:[x,y,z], prof:[[r,y]…], axis:'y'|'z', fill, ink, detail:[ring indices], open:true (top ring visible)}
//   {k:'label', at, text, …}                                          — 2D text pinned to a 3D point (drawn last)
// Each builder returns an array; use xf(prims, fn) to transform.
function xf(prims, fn) {
  return prims.map(p => {
    const q = { ...p };
    if (p.pts) q.pts = p.pts.map(fn);
    if (p.at) q.at = fn(p.at);
    if (p.k === 'lathe') { const ax = p.axisV ?? [0, 1, 0], o = fn([0, 0, 0]); q.axisV = vsub(fn(ax), o); }
    return q;
  });
}
const translate3 = (prims, d) => xf(prims, p => vadd(p, d));
const rotateY3 = (prims, a, c = [0, 0, 0]) => xf(prims, p => vadd(rotY(vsub(p, c), a), c));
const rotateX3 = (prims, a, c = [0, 0, 0]) => xf(prims, p => vadd(rotX(vsub(p, c), a), c));
const scale3 = (prims, k) => xf(prims, p => vmul(p, k)).map(p => p.k === 'lathe' ? { ...p, prof: p.prof.map(([r, y]) => [r * k, y * k]) } : p.k === 'wire' ? { ...p, r: p.r * k } : p);

// rounded-rectangle loop in the XZ plane at height y
function rrLoop(x0, z0, x1, z1, y, r, n = 5) {
  const pts = [], cs = [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, Math.PI / 2], [x0 + r, z0 + r, Math.PI], [x1 - r, z0 + r, Math.PI * 1.5]];
  for (const [cx, cz, a0] of cs) for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; pts.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
  pts.push(pts[0]); return pts;
}
// split long polylines so painter's sort works per piece
function chop(pts, maxLen = 70) {
  const out = []; let cur = [pts[0]], acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(1, Math.ceil(l / maxLen));
    for (let k = 1; k <= n; k++) { const p = vlerp(a, b, k / n); cur.push(p); acc += l / n; if (acc >= maxLen) { out.push(cur); cur = [p]; acc = 0; } }
  }
  if (cur.length > 1) out.push(cur); return out;
}

// ---------- the wire basket ----------
// basketModel({w, d, h, gap, type: 'dish'|'plain'|'spice'|'pantryTier', rimR, fold}) → prims (local frame, origin back-bottom-centre)
function basketModel(o = {}) {
  const w = o.w ?? 560, d = o.d ?? 440, h = o.h ?? 150, gap = o.gap ?? 26, rr = o.rimR ?? 28, R = o.wire ?? 2.6, RR = o.rim ?? 4.2;
  const P = [], x0 = -w / 2, x1 = w / 2;
  const wire = (pts, r = R, tone = 0) => chop(pts).forEach(c => P.push({ k: 'wire', pts: c, r, tone }));
  // rims
  wire(rrLoop(x0, 0, x1, d, h, rr), RR); wire(rrLoop(x0, 0, x1, d, 0, rr), RR * .9);
  if (o.midRim !== false) wire(rrLoop(x0, 0, x1, d, h * .5, rr), R * .9);
  // uprights around the perimeter (follow the rounded loop at both heights)
  const top = rrLoop(x0, 0, x1, d, h, rr, 8), per = [0];
  for (let i = 1; i < top.length; i++) per.push(per[i - 1] + Math.hypot(top[i][0] - top[i - 1][0], top[i][2] - top[i - 1][2]));
  const L = per[per.length - 1], n = Math.round(L / gap);
  for (let k = 0; k < n; k++) {
    const s = k / n * L; let j = 0; while (j < per.length - 2 && per[j + 1] < s) j++;
    const f = (s - per[j]) / (per[j + 1] - per[j] || 1), px = lerp(top[j][0], top[j + 1][0], f), pz = lerp(top[j][2], top[j + 1][2], f);
    if (o.lowFront && pz > d - 2 && Math.abs(px) < w / 2 - rr) continue;
    wire([[px, 0, pz], [px, h, pz]], R * .8);
  }
  // floor: slats along z plus two cross bars
  for (let x = x0 + gap; x < x1 - gap * .5; x += gap) wire([[x, 2, 6], [x, 2, d - 6]], R * .8);
  for (const z of [d * .3, d * .7]) wire([[x0 + 8, 1, z], [x1 - 8, 1, z]], R);
  // dish rack: comb hairpins on the left 55% so plates stand facing the front
  if (o.type === 'dish') {
    const px0 = x0 + 40, px1 = x0 + w * .52, zc0 = d * .12, zc1 = d * .9, step = o.slot ?? 30;
    for (const xx of [px0 + 18, px1 - 18]) {
      const comb = []; for (let z = zc0; z <= zc1; z += step) { comb.push([xx, 4, z], [xx, 70, z + step * .25], [xx, 4, z + step * .5]); }
      wire(comb, R * .8);
    }
    // bowl rail on the right
    wire([[x0 + w * .58, h * .75, 20], [x0 + w * .58, h * .75, d - 20]], R * .8);
  }
  if (o.type === 'spice') {       // narrow two-tier seasoning basket: inner shelf
    wire(rrLoop(x0, 0, x1, d, h * .52, rr * .6), R * .9);
    for (let x = x0 + gap; x < x1; x += gap) wire([[x, h * .5, 6], [x, h * .5, d - 6]], R * .7);
  }
  return P;
}
// telescoping full-extension slide on one side. ext = pulled length (mm). y = mount height, x = side offset.
function slideModel(x, y, d, ext) {
  const P = [], s = Math.sign(x) || 1;
  P.push({ k: 'face', pts: [[x, y - 14, 0], [x, y + 14, 0], [x, y + 14, d], [x, y - 14, d]], fill: PAL.steel1, ink: PAL.ink, iw: 1.2, rail: true });
  const mid = Math.min(ext, d * .55), inner = ext;
  P.push({ k: 'face', pts: [[x - s * 6, y - 10, mid], [x - s * 6, y + 10, mid], [x - s * 6, y + 10, d + mid], [x - s * 6, y - 10, d + mid]], fill: '#DADDE0', ink: PAL.ink, iw: 1.1, rail: true });
  P.push({ k: 'face', pts: [[x - s * 11, y - 7, inner], [x - s * 11, y + 7, inner], [x - s * 11, y + 7, d + inner], [x - s * 11, y - 7, d + inner]], fill: PAL.shine, ink: PAL.ink, iw: 1, rail: true });
  return P;
}
// a lacquered drawer front / door panel in the XY plane at z, with a slim recessed handle groove
function doorModel(x0, y0, x1, y1, z, o = {}) {
  const th = o.th ?? 18, L = o.layer ?? 2, fill = o.fill ?? PAL.paper;
  const P = [
    { k: 'face', layer: L, pts: [[x0, y1, z - th], [x1, y1, z - th], [x1, y1, z], [x0, y1, z]], fill: PAL.paper2, ink: PAL.ink, iw: (o.iw ?? 2.2) * .8 },   // top edge
    { k: 'face', layer: L, pts: [[x1, y0, z - th], [x1, y1, z - th], [x1, y1, z], [x1, y0, z]], fill: PAL.paper2, ink: PAL.ink, iw: (o.iw ?? 2.2) * .8 },   // right edge
    { k: 'face', layer: L, pts: [[x0, y0, z - th], [x0, y1, z - th], [x0, y1, z], [x0, y0, z]], fill: PAL.paper2, ink: PAL.ink, iw: (o.iw ?? 2.2) * .8 },   // left edge
    { k: 'face', layer: L, bias: -th, pts: [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], fill, ink: PAL.ink, iw: o.iw ?? 2.2 },
  ];
  if (o.handle !== false) {   // slim recessed pull groove near the top edge
    const hy = y1 - 40, hx0 = lerp(x0, x1, .28), hx1 = lerp(x0, x1, .72);
    P.push({ k: 'face', layer: L, bias: -th - 2, pts: [[hx0, hy - 6, z + 1], [hx1, hy - 6, z + 1], [hx1, hy + 6, z + 1], [hx0, hy + 6, z + 1]], fill: PAL.ink2, ink: PAL.ink, iw: 1.2 });
  }
  return P;
}
// a simple box of faces (for cabinet carcasses, counter slabs). faces: which sides to include.
function boxModel(x0, y0, z0, x1, y1, z1, o = {}) {
  const f = o.fill ?? PAL.paper, ink = o.ink ?? PAL.ink, iw = o.iw ?? 2, sides = o.sides ?? 'lrtbfk', P = [];
  const add = (pts, fill = f) => P.push({ k: 'face', layer: o.layer ?? 0, pts, fill, ink, iw, dark: o.dark });
  if (sides.includes('k')) add([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], o.backFill ?? f);
  if (sides.includes('l')) add([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], o.sideFill ?? f);
  if (sides.includes('r')) add([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], o.sideFill ?? f);
  if (sides.includes('b')) add([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], o.botFill ?? f);
  if (sides.includes('t')) add([[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], o.topFill ?? f);
  if (sides.includes('f')) add([[x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [x1, y0, z1]], o.frontFill ?? f);
  return P;
}
// ---------- kitchenware (lathe profiles: [radius, height] from bottom) ----------
const PROF = {
  plate: [[0, 0], [70, 0], [100, 6], [128, 16], [132, 18]],
  bowl: [[0, 0], [38, 0], [42, 4], [62, 30], [74, 56], [76, 60]],
  cup: [[0, 0], [34, 0], [36, 4], [40, 90], [41, 94]],
  jar: [[0, 0], [30, 0], [32, 4], [32, 88], [26, 96], [26, 104], [28, 106], [28, 124], [0, 124]],
  bottle: [[0, 0], [30, 0], [32, 6], [32, 130], [24, 150], [12, 168], [12, 190], [14, 192], [14, 204], [0, 204]],
  tall: [[0, 0], [36, 0], [38, 6], [38, 200], [30, 226], [15, 246], [15, 280], [17, 282], [17, 296], [0, 296]],
  pot: [[0, 0], [110, 0], [118, 8], [120, 120], [122, 124]],
  lid: [[0, 0], [124, 0], [100, 14], [40, 28], [14, 30], [14, 44], [0, 44]],
};
// lathe object helper: axis 'y' (upright) or 'z' (a plate standing up, facing +z)
function lathe(at, prof, o = {}) { return { k: 'lathe', at, prof, axisV: o.axis === 'z' ? [0, 0, 1] : o.axis === 'x' ? [1, 0, 0] : [0, 1, 0], fill: o.fill ?? PAL.paper, ink: o.ink ?? PAL.ink, open: o.open ?? false, band: o.band, iw: o.iw }; }

// ---------- rendering ----------
// render3(prims, cam, {style: 'steel'|'ink'|'glow', lw: global line weight, wlw: extra weight for wires only, shine: world x of a moving highlight, a, dark})
function render3(prims, C, o = {}) {
  const style = o.style ?? 'steel', lwk = o.lw ?? 1, items = [];
  for (const p of prims) {
    if (p.k === 'wire') {
      const pr = p.pts.map(q => C.project(q)); if (pr.some(q => q[2] < 5)) continue;
      items.push({ p, pr, z: pr.reduce((s, q) => s + q[2], 0) / pr.length });
    } else if (p.k === 'face') {
      const pr = p.pts.map(q => C.project(q)); if (pr.some(q => q[2] < 5)) continue;
      items.push({ p, pr, z: pr.reduce((s, q) => s + q[2], 0) / pr.length + (p.bias ?? 0) });
    } else if (p.k === 'lathe') {
      const c = C.project(p.at); if (c[2] < 5) continue; items.push({ p, z: c[2] + (p.bias ?? 0) });
    } else if (p.k === 'label') items.push({ p, z: -1e9 });
  }
  items.sort((a, b) => (a.p.layer ?? 1) - (b.p.layer ?? 1) || b.z - a.z);
  X.save(); X.globalAlpha *= (o.a ?? 1); X.lineCap = 'round'; X.lineJoin = 'round';
  const labels = [];
  for (const it of items) {
    const p = it.p;
    if (p.k === 'label') { labels.push(p); continue; }
    if (p.k === 'face') drawFace(it.pr, p, o);
    else if (p.k === 'wire') drawWire(it.pr, p, style, lwk, o);
    else if (p.k === 'lathe') drawLathe(p, C, o);
  }
  X.restore();
  return labels;
}
// night-mode fill remap: light paper/steel fills become dark panels so night shots never get light slabs
function darkFill(f) { return f === PAL.paper ? PAL.night2 : f === PAL.paper2 ? '#26262B' : f === PAL.steel2 || f === PAL.steel1 || f === '#DADDE0' ? '#3A3D42' : f === PAL.shine ? '#55595F' : f; }
function drawFace(pr, p, o) {
  // back-face culling is not applied: faces are drawn painter-style, and their fill occludes what's behind
  X.beginPath(); X.moveTo(pr[0][0], pr[0][1]); for (let i = 1; i < pr.length; i++) X.lineTo(pr[i][0], pr[i][1]); X.closePath();
  if (p.fill) { X.fillStyle = o.dark ? darkFill(p.fill) : p.fill; X.fill(); }
  if (p.hatch) { X.save(); X.clip(); hatch(pr.map(q => [q[0], q[1]]), { gap: p.hatch, w: 1.1, a: .5, col: o.dark ? PAL.steel1 : PAL.ink }); X.restore();
    X.beginPath(); X.moveTo(pr[0][0], pr[0][1]); for (let i = 1; i < pr.length; i++) X.lineTo(pr[i][0], pr[i][1]); X.closePath(); }
  if (p.ink) { X.strokeStyle = o.dark ? PAL.steel2 : p.ink; X.lineWidth = (p.iw ?? 2) * (o.lw ?? 1); X.stroke(); }
}
function drawWire(pr, p, style, lwk, o) {
  const s = pr.reduce((a, q) => a + q[3], 0) / pr.length, w = Math.max(.7, p.r * 2 * s * lwk * (o.wlw ?? 1));   // o.wlw: wire-only weight
  const path = () => { X.beginPath(); X.moveTo(pr[0][0] + jit(pr[0][0] * .01, .25), pr[0][1] + jit(pr[0][1] * .01, .25)); for (let i = 1; i < pr.length; i++) X.lineTo(pr[i][0], pr[i][1]); };
  if (style === 'ink') { path(); X.strokeStyle = o.inkCol ?? PAL.ink; X.lineWidth = Math.max(.9, w * .75); X.stroke(); return; }
  if (style === 'glow') { path(); X.strokeStyle = rgba(PAL.steel2, .35); X.lineWidth = w * 3.2; X.stroke(); path(); X.strokeStyle = PAL.shine; X.lineWidth = Math.max(.8, w * .6); X.stroke(); return; }
  // steel: ink outline → mid steel body → bright core; a sweeping highlight brightens wires near o.shine (world x)
  path(); X.strokeStyle = PAL.ink; X.lineWidth = w + 1.6; X.stroke();
  path(); X.strokeStyle = PAL.steel1; X.lineWidth = w; X.stroke();
  let hl = .55;
  if (o.shine != null) { const mx = p.pts.reduce((a, q) => a + q[0], 0) / p.pts.length; hl += .45 * Math.exp(-(((mx - o.shine) / 60) ** 2)); }
  X.save(); X.translate(-w * .18, -w * .22); path(); X.strokeStyle = rgba(PAL.shine, hl); X.lineWidth = Math.max(.6, w * .38); X.stroke(); X.restore();
}
function drawLathe(p, C, o) {
  const ax = vnorm(p.axisV ?? [0, 1, 0]), ref = Math.abs(ax[1]) > .9 ? [1, 0, 0] : [0, 1, 0], u = vnorm(vcross(ax, ref)), v = vcross(ax, u), N = 40;
  const rings = p.prof.map(([r, y]) => { const pts = []; for (let i = 0; i < N; i++) { const a = i / N * TAU; pts.push(C.project(vadd(p.at, vadd(vmul(ax, y), vadd(vmul(u, Math.cos(a) * r), vmul(v, Math.sin(a) * r)))))); } return pts; });
  const all = rings.flat().filter(q => q[2] > 5); if (all.length < 3) return;
  const hull = convexHull(all.map(q => [q[0], q[1]]));
  X.beginPath(); X.moveTo(hull[0][0], hull[0][1]); for (const q of hull) X.lineTo(q[0], q[1]); X.closePath();
  X.fillStyle = o.dark ? darkFill(p.fill) : p.fill; X.fill();
  if (p.band) { X.save(); X.clip(); hatch(hull, { gap: 7, w: 1, a: .35, col: o.dark ? PAL.steel2 : PAL.ink, angle: -1.1 }); X.restore();
    X.beginPath(); X.moveTo(hull[0][0], hull[0][1]); for (const q of hull) X.lineTo(q[0], q[1]); X.closePath(); }
  const inkc = o.dark ? PAL.steel2 : p.ink, iw = (p.iw ?? 2.2) * (o.lw ?? 1);
  X.strokeStyle = inkc; X.lineWidth = iw; X.stroke();
  // visible rim: the top ring (last) fully if open (we look into it), else its near half; plus fine detail rings (near halves)
  const cz = C.project(p.at)[2];
  const ringLine = (rg, near, lw) => {
    X.beginPath(); let pen = false;
    for (let i = 0; i <= N; i++) { const q = rg[i % N]; const vis = !near || q[2] <= cz + 2; if (vis) { pen ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1]); pen = true; } else pen = false; }
    X.lineWidth = lw; X.stroke();
  };
  const top = rings[rings.length - 1]; if (p.prof[p.prof.length - 1][0] > 0) ringLine(top, !p.open, iw * .9);
  for (let i = 1; i < rings.length - 1; i++) if (p.prof[i][0] > 8 && (p.detail ?? true)) ringLine(rings[i], true, iw * .45);
}
function convexHull(P) {
  P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (P.length < 3) return P;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  up.pop(); lo.pop(); return lo.concat(up);
}

// ---------- ready-made assemblies ----------
// A standard base-cabinet dish basket with contents, pulled out by `ext` mm (0 = closed). Returns prims in cabinet frame:
// cabinet opening spans x ∈ [-w/2-40, w/2+40], y ∈ [0, H], z ∈ [0, d+20] (front plane at z = d + 20).
function dishDrawer(ext, o = {}) {
  const w = o.w ?? 560, d = o.d ?? 440, h = o.h ?? 150, y0 = o.y0 ?? 60, P = [];
  const b = translate3(basketModel({ w, d, h, type: 'dish' }), [0, y0, ext]);
  P.push(...b);
  if (o.slides !== false) { P.push(...slideModel(-w / 2 - 14, y0 + h * .55, d, ext)); P.push(...slideModel(w / 2 + 14, y0 + h * .55, d, ext)); }
  if (o.items !== false) {
    const x0 = -w / 2;
    // plates standing in the comb, facing the front
    for (let i = 0; i < (o.plates ?? 7); i++) P.push(lathe([x0 + 40 + w * .24, y0 + 136, 70 + i * 30 + ext], PROF.plate, { axis: 'z', fill: i % 3 === 1 ? PAL.paper2 : PAL.paper }));
    // stacked bowls on the right
    for (let i = 0; i < 3; i++) P.push(lathe([x0 + w * .78, y0 + 6 + i * 20, d * .3 + ext], PROF.bowl, { open: i === 2 }));
    P.push(lathe([x0 + w * .78, y0 + 6, d * .72 + ext], PROF.cup, { open: true })); P.push(lathe([x0 + w * .64, y0 + 6, d * .74 + ext], PROF.cup, { open: true }));
  }
  if (o.front !== false) P.push(...doorModel(-w / 2 - 36, y0 - 50, w / 2 + 36, y0 + h + 120, d + 20 + ext, { fill: o.frontFill }));
  return P;
}
// narrow seasoning pull-out: tall two-tier basket with bottles
function spiceDrawer(ext, o = {}) {
  const w = o.w ?? 150, d = o.d ?? 440, h = o.h ?? 480, y0 = o.y0 ?? 60, P = [];
  P.push(...translate3(basketModel({ w, d, h, gap: 24, type: 'spice', midRim: false, rimR: 14 }), [0, y0, ext]));
  const bots = [[PROF.bottle, 0], [PROF.jar, 0], [PROF.tall, 0], [PROF.jar, 1], [PROF.bottle, 1], [PROF.jar, 1]];
  bots.forEach(([pf, tier], i) => P.push(lathe([0, y0 + 4 + tier * h * .5, 70 + (i % 3) * 130 + ext], tier ? pf.map(([r, y]) => [r * .8, y * .8]) : pf, { band: i % 2 === 0 })));
  if (o.front !== false) P.push(...doorModel(-w / 2 - 20, y0 - 50, w / 2 + 20, y0 + h + 60, d + 20 + ext, { handle: true }));
  return P;
}
