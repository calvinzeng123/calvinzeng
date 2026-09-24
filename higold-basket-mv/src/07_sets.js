// 07_sets.js — shared sets and framing helpers used by several chapters (keeps the four choruses one consistent "stage").
'use strict';

// Auto-framed orbit camera: puts world point `at` at screen (sx, sy) and scales so a span of `span` mm covers `px` pixels.
function frameCam(at, yaw, pitch, sx, sy, span, px, o = {}) {
  const fov = o.fov ?? 30, f = (H / 2) / Math.tan(fov * Math.PI / 360), d = f * span / px;
  return orbit(at, yaw, pitch, d, { fov, cx: sx, cy: sy, roll: o.roll ?? 0 });
}
// A base cabinet with a dish basket pulled out `ext` mm, framed as a clean product shot. Returns the camera (for pinning labels).
// o: {sx, sy, px (screen width of the basket), yaw, pitch, style, shine, carcass (bool), dark, lw, items, frontFill}
function productShot(ext, o = {}) {
  const C = frameCam([0, 150, 230 + ext * .5], o.yaw ?? -.6, o.pitch ?? .62, o.sx ?? CX, o.sy ?? CY, 760, o.px ?? 900, { fov: o.fov ?? 28, roll: o.roll });
  const prims = [];
  if (o.carcass !== false) {
    prims.push(...boxModel(-330, -20, -20, 330, 400, 460, { sides: 'lrbk', fill: PAL.paper, sideFill: PAL.paper2, backFill: PAL.paper2 }));
    prims.push(...boxModel(-350, 400, -20, 350, 430, 490, { sides: 'lrtf', fill: PAL.paper, frontFill: PAL.paper2 }));   // counter slab
  }
  prims.push(...dishDrawer(ext, { items: o.items, frontFill: o.frontFill }));
  render3(prims, C, { style: o.style ?? 'steel', shine: o.shine, dark: o.dark, lw: o.lw, a: o.a });
  return C;
}
// pin a 2D callout to a 3D point: returns screen [x, y]
const pin = (C, p) => { const q = C.project(p); return [q[0], q[1]]; };

// ---------- the chorus stage (shared by c02 / c04 / c06 / c08 so the four choruses read as one escalating set) ----------
// floor line + soft contact shadow band
function stageFloor(y = 930, o = {}) {
  const dark = o.dark, col = dark ? PAL.steel2 : PAL.ink;
  handLine(-20, y, W + 20, y, { w: 3, col, seed: 401 });
  X.save(); X.globalAlpha *= .06; rect(0, y, W, H - y, dark ? PAL.shine : PAL.ink); X.restore();
}
// five-member formation. o: {move (string or per-member array), y (ground), s (scale), spread (px between members), dark,
// face, lanFace, delay (per-member stagger in seconds), skip (array of names to leave out), lanScale (LAN is a bit bigger)}
function formation(t, o = {}) {
  const y = o.y ?? 930, s = o.s ?? 22, sp = o.spread ?? 250, col = o.dark ? PAL.paper : PAL.ink, out = {};
  CREW.forEach((who, i) => {
    if (o.skip && o.skip.includes(who)) return;
    const k = i - 2, x = (o.x ?? CX) + k * sp, mv = Array.isArray(o.move) ? o.move[i] : (o.move ?? 'pull');
    const lead = who === 'lan', sc = s * (lead ? (o.lanScale ?? 1.12) : 1) * (1 - Math.abs(k) * (o.depth ?? 0));
    out[who] = dancer(x, y - Math.abs(k) * (o.stagger ?? 0), sc, mv, t, { who, col, dark: o.dark, delay: -(o.delay ?? .04) * Math.abs(k), seed: i * 3 + 1,
      face: lead ? (o.lanFace ?? o.face ?? 'smile') : (o.face ?? 'dot'), blush: lead ? 1 : 0 });
  });
  return out;
}
// huge faint rotating basket in the background (ink or glow line art), for depth behind dancers
function bigBasketBG(t, o = {}) {
  const C = frameCam([0, 80, 220], (o.yaw ?? 0) + t * (o.spin ?? .12), o.pitch ?? .35, o.sx ?? CX, o.sy ?? 470, 700, o.px ?? 1500, { fov: 26 });
  render3(basketModel({ w: 560, d: 440, h: 170, type: o.type ?? 'dish' }), C, { style: o.dark ? 'glow' : 'ink', a: o.a ?? .16, inkCol: o.col });
}
