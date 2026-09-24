// c09_outro.js — c09 · Outro · "Dance break + end card" (135.9 – 156.6)
// 1. The last hook, written by hand into a calligraphy practice row (米字格): every character lands in its box, and on the drop
//    every dancer lands on her tape mark under "her" character. 一拉就到位, literally.
// 2. The dance break (the loudest section): hard cuts on the beat — wide / product orbit / 3-up / close-up / 9-grid / overhead
//    (the crew dancing inside a giant basket) / echelon / jump.
// 3. A clean paper end card: HIGOLD 悍高 + 厨房拉篮 · 一拉就到位, the basket glides shut on the last note, then stillness.
(() => {
'use strict';
const LI = 45;                               // 一拉就到位 (137.4 – 140.5)
const b = n => beatT(n);
const Q = BEAT / 4;                          // one 16th
const DROP = b(205);                         // 139.963 — 位 is sung on the drop
const LAST = b(226);                         // 154.281 — the last note
const ramp = (t, a, d) => clamp((t - a) / d);
const lanO = (o = {}) => ({ who: 'lan', face: 'smile', blush: 1, seed: 7, ...o });

// ---------- helpers ----------
// pose timeline: keys [[t, pose | fn(t)], …]; snaps onto each key with E.out5 over `hit` s (K-pop hit), then holds / runs the fn
function poseTrack(t, keys, hit = .2) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const ev = tt => typeof keys[i][1] === 'function' ? keys[i][1](tt) : keys[i][1];
  if (i === 0 || t - keys[i][0] >= hit) return ev(t);
  const from = poseTrack(keys[i][0] - 1e-4, keys.slice(0, i), hit);
  return lerpPose(from, ev(t), E.out5((t - keys[i][0]) / hit));
}
// stage tape mark (a flattened ×)
function tapeMark(x, y, s, col, seed, a = 1) {
  const o = { w: s * .3, col, taper: [.1, .1], wob: .3, seed, a, press: .1 };
  inkStroke([[x - s, y - s * .2], [x + s, y + s * .2]], o);
  inkStroke([[x - s, y + s * .2], [x + s, y - s * .2]], { ...o, seed: seed + 7 });
}
const tc = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(2).padStart(5, '0')}`;
function mono(str, x, y, o = {}) { text(str, x, y, { size: o.size ?? 18, font: o.font ?? F.mono, weight: o.weight ?? 600, col: o.col ?? PAL.ink, track: o.track ?? 2, align: o.align, a: o.a }); }
// K-pop metadata corners
function corners(t, o = {}) {
  const col = o.col ?? PAL.ink, a = o.a ?? .85;
  if (o.tl !== false) { text('HIGOLD 悍高', 64, 70, { size: 22, font: F.sans, weight: 700, col, a, track: 2 }); mono(o.tl ?? 'PULL-OUT BASKET  ·  M/V', 64, 100, { col, a, weight: 500 }); }
  mono(tc(t), W - 64, 70, { col, a, align: 'right', size: 20, track: 0 });
  if (o.bl) mono(o.bl, 64, H - 52, { col, a });
  if (o.br) mono(o.br, W - 64, H - 52, { col, a, align: 'right' });
}
// small impact ticks at a dancer's feet on the beat
function stomp(x, y, s, k, col = PAL.ink, seed = 1) {
  if (k < .05) return;
  for (const sg of [-1, 1]) inkStroke([[x + sg * s * 1.6, y - s * .15], [x + sg * s * (2.2 + .6 * (1 - k)), y - s * (.5 + .3 * (1 - k))]], { w: s * .16, col, a: k, seed: seed + sg, taper: [.2, .4] });
}
// horizontal motion streaks behind a moving body
function streaks(x, y, s, dir, k, col = PAL.ink, seed = 1) {
  if (k < .03) return;
  [[2.2, 1], [4.6, 1.5], [7.2, .8]].forEach(([hy, l], i) => inkStroke([[x - dir * s * 1.4, y - hy * s], [x - dir * s * (1.4 + l * 3.2), y - hy * s]], { w: s * .14, col, a: k, seed: seed + i, taper: [.05, .6] }));
}
// figure with a paper knock-out halo so it reads over busy backgrounds
function haloFig(x, y, s, P, o = {}) {
  figure(x, y, s, P, { ...o, col: o.halo ?? PAL.paper, w: (o.w ?? .2) * 2.3, shadow: false, blush: 0, seed: (o.seed ?? 11) });
  return figure(x, y, s, P, o);
}
// diagonal hatch pattern (cached), for filling glyphs with a line tint instead of a solid colour
const _pat = {};
function hatchPat(col, gap = 16, w = 4) {
  const key = col + gap + w; if (_pat[key]) return _pat[key];
  const c = document.createElement('canvas'); c.width = c.height = gap; const g = c.getContext('2d');
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'square'; g.beginPath();
  for (const o of [-gap, 0, gap]) { g.moveTo(o, gap); g.lineTo(o + gap, 0); } g.stroke();
  return (_pat[key] = g.createPattern(c, 'repeat'));
}
// a 3D kitchen base cabinet (carcass + counter slab) with the dish basket pulled out by ext
function cabinetPrims(ext, o = {}) {
  const P = [];
  P.push(...boxModel(-330, -20, -20, 330, 400, 460, { sides: 'rbk', fill: PAL.paper, sideFill: PAL.paper2, backFill: PAL.paper2 }));
  // the near (left) side panel sorts with the fronts so it hides the basket once the drawer is shut (camera always sits front-left)
  P.push(...boxModel(-330, -20, -20, 330, 400, 460, { sides: 'l', fill: PAL.paper, sideFill: PAL.paper2, layer: 2 }));
  P.push(...boxModel(-350, 400, -20, 350, 430, 490, { sides: 'lrtf', fill: PAL.paper, frontFill: PAL.paper2, layer: 2 }));
  P.push(...dishDrawer(ext, { frontFill: o.frontFill, items: o.items }));
  if (o.upper !== false) P.push(...doorModel(-316, 334, 316, 398, 460, { th: 18, handle: false, fill: PAL.paper }));   // slim fixed top drawer face, flush
  return P;
}
// "drawer of type": text slides out of a slot at its left edge with the soft-close curve
function typeDrawer(str, x, y, t0, t, o) {
  const k = E.soft((t - t0) / (o.dur ?? 1)); if (k <= 0) return 0;
  const w = measure(str, o.size, o.font, o.weight ?? 400, o.track ?? 0);
  X.save(); X.beginPath(); X.rect(x - 6, y - o.size * 1.15, w + 60, o.size * 1.5); X.clip();
  text(str, x - (1 - k) * (w + 60), y, { ...o, a: (o.a ?? 1) * clamp(k * 4) });
  X.restore(); return w;
}

// ---------- top-down dancer (for the overhead shot) ----------
// Seen from a wide lens straight above: (x, y) = the feet on the floor, (bx, by) = screen offset from the feet to the shoulders
// (the perspective "lean" away from the lens axis, so feet, torso, shoulders and head separate), s = px per unit, face = facing
// angle (screen radians), A = {l: [a1, a2, k1, k2], r: […]}: a1 = upper-arm angle from "straight out sideways" toward the front
// (+) or back (−), a2 = elbow bend (+ forward), k1/k2 = foreshortening (1 = level, small = raised toward the lens).
function topFig(x, y, bx, by, s, face, A, who, o = {}) {
  const col = o.col ?? PAL.ink, bg = o.bg ?? PAL.paper, lw = .3 * s, sd = o.seed ?? 3, step = o.step ?? 0, sw = o.swing ?? 0;
  const Fv = [Math.cos(face), Math.sin(face)], Lv = [-Math.sin(face), Math.cos(face)];
  const at = (ox, oy, l, f) => [ox + (Lv[0] * l + Fv[0] * f) * s, oy + (Lv[1] * l + Fv[1] * f) * s];
  const st = (pts, k, w = lw, tp = [.08, .2]) => inkStroke(pts, { w, col, taper: tp, wob: .35, seed: sd + k, press: .12 });
  const sx = x + bx, sy = y + by, hx0 = x + bx * .42, hy0 = y + by * .42, hx = sx + bx * .3, hy = sy + by * .3, R = .88 * s;
  // feet + legs
  for (const sg of [-1, 1]) {
    const f = at(x, y, sg * .55, sg * step * .45), hp = at(hx0, hy0, sg * .4, 0);
    st([hp, f], 6 + sg, lw * .9, [.05, .05]);
    X.save(); X.translate(f[0], f[1]); X.rotate(face); X.fillStyle = col; X.beginPath(); X.ellipse(.3 * s, 0, .5 * s, .24 * s, 0, 0, TAU); X.fill(); X.restore();
  }
  // torso + shoulders
  st([[hx0, hy0], [sx, sy]], 2, lw * 1.15, [.05, .05]);
  st([at(sx, sy, -1.35, -.05), at(sx, sy, 0, .12), at(sx, sy, 1.35, -.05)], 1, lw * 1.15, [.12, .12]);
  // hair that trails behind the head
  if (who === 'long') { X.save(); X.fillStyle = col; smoothPath([at(hx, hy, -.85, .1), at(hx, hy, -1.0, -1.0), at(hx, hy, sw * .3, -2.0), at(hx, hy, 1.0, -1.0), at(hx, hy, .85, .1)], true); X.fill(); X.restore(); }
  if (who === 'pony') st([at(hx, hy, 0, -.6), at(hx, hy, sw * .5, -1.6), at(hx, hy, sw * 1.1, -2.5)], 9, lw * 1.9, [.1, .7]);
  // arms
  for (const sg of [-1, 1]) {
    const [a1, a2, k1, k2] = sg < 0 ? A.l : A.r;
    const dir = a => [Lv[0] * sg * Math.cos(a) + Fv[0] * Math.sin(a), Lv[1] * sg * Math.cos(a) + Fv[1] * Math.sin(a)];
    const S = at(sx, sy, sg * 1.35, 0), d1 = dir(a1), d2 = dir(a1 + a2);
    const El = [S[0] + d1[0] * 1.75 * k1 * s, S[1] + d1[1] * 1.75 * k1 * s], Hd = [El[0] + d2[0] * 1.6 * k2 * s, El[1] + d2[1] * 1.6 * k2 * s];
    st([S, El, Hd], 4 + sg, lw * .95, [.05, .25]);
    circle(Hd[0], Hd[1], lw * .7, { fill: col });
  }
  // head from above (= hair), with each member's tell
  if (who === 'buns') for (const sg of [-1, 1]) { const [bx2, by2] = at(hx, hy, sg * .8, -.15); circle(bx2, by2, .4 * s, { fill: col }); }
  circle(hx, hy, R, { fill: col });
  if (who === 'lan') {
    line(hx, hy, at(hx, hy, 0, -.85)[0], at(hx, hy, 0, -.85)[1], s * .09, bg, .8);
    const [cx, cy] = at(hx, hy, .5, -.3); X.save(); X.translate(cx, cy); X.rotate(face + .5); X.fillStyle = PAL.orange; X.beginPath(); X.roundRect(-.3 * s, -.1 * s, .6 * s, .2 * s, .1 * s); X.fill(); X.restore();
  }
  if (who === 'kit') { const [bx2, by2] = at(hx, hy, 0, .6); X.save(); X.translate(bx2, by2); X.rotate(face); X.beginPath(); X.ellipse(0, 0, .55 * s, .78 * s, 0, -Math.PI / 2, Math.PI / 2); X.closePath(); X.fillStyle = col; X.fill(); X.restore(); line(...at(hx, hy, -.75, .45), ...at(hx, hy, .75, .45), s * .07, bg, .9); }
  if (who === 'pony' || who === 'long') line(...at(hx, hy, 0, .75), ...at(hx, hy, 0, -.5), s * .07, bg, .7);
}

// =====================================================================================================================
// SHOT 1 · 135.9 – 140.645 · The final hook in a practice row. Calm; LAN centred; the crew snaps onto their marks on the drop.
// =====================================================================================================================
const GS = 246, GG = 24, GY = 262;          // practice box size, gap, centre y
const gx = j => CX + (j - 2) * (GS + GG);
function practiceBox(cx, cy, S, col, a, seed) {
  const j = (k) => jit(seed + k, .6);
  X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineCap = 'round';
  X.lineWidth = 3; X.beginPath(); X.rect(cx - S / 2 + j(1), cy - S / 2 + j(2), S, S); X.stroke();
  X.setLineDash([8, 10]); X.lineWidth = 1.6; X.globalAlpha *= .7; X.beginPath();
  X.moveTo(cx - S / 2, cy); X.lineTo(cx + S / 2, cy); X.moveTo(cx, cy - S / 2); X.lineTo(cx, cy + S / 2);
  X.moveTo(cx - S / 2, cy - S / 2); X.lineTo(cx + S / 2, cy + S / 2); X.moveTo(cx + S / 2, cy - S / 2); X.lineTo(cx - S / 2, cy + S / 2);
  X.stroke(); X.restore();
}
// private presenter: each character is brushed into its own box on its onset (left→right brush wipe + a small settle)
function hookRow(t) {
  const L = LY[LI]; if (t < L.t[0] - .08) return; LYRIC_DRAWN.add(LI);
  const row = lyRows(LI)[0];
  row.forEach((c, j) => {
    const k = chK(c.ti, t, .2); if (k <= 0) return;
    const cx = gx(j), cy = GY, s = lerp(1.12, 1, E.out5(k));
    X.save(); X.beginPath(); X.rect(cx - GS * .62, cy - GS * .62, GS * 1.24 * E.out(k * 1.15), GS * 1.24); X.clip();
    X.translate(cx, cy); X.scale(s, s); X.translate(-cx, -cy);
    marker(c.ch, cx - 4, cy + 4, { size: 212, align: 'center', col: c.ch === '拉' ? PAL.orange : PAL.ink, variant: j, rot: (hash(j + 3) - .5) * .06 });
    X.restore();
  });
}
const idleSway = seed => tt => { const P = move('sway', tt, seed); return { ...P, lean: P.lean * .5, head: P.head * .6, sL: P.sL * .7, sR: P.sR * .7 }; };
const T45 = LY[LI].t;
const LAN_HOOK = [
  [0, idleSway(2)],
  [T45[0] - .03, KP.reach],                                          // 一  reach
  [T45[1] - .03, KP.yank],                                           // 拉  the pull (hit)
  [T45[2] - .03, pose({ ...KP.hips, head: .14, dy: -.06 })],         // 就  hands on hips, nod
  [T45[3] - .03, KP.point],                                          // 到  point up
  [DROP - .02, pose({ ...KP.armsUp, sL: 2.3, eL: .2, sR: 2.3, eR: .2, dy: .35, head: -.1 })],         // 位  arms up on the drop — the crew lands around her
  [DROP + .42, tt => pose({ ...KP.armsUp, sL: 2.3, eL: .2, sR: 2.3, eR: .2, dy: .06 + .06 * Math.sin((tt - DROP) * 9.2), head: -.06 })],
];
// crew: slide in on the reach, land on the mark pointing up and out (a V around LAN)
const crewDrop = j => { const pt = j < 2 ? mirrorPose(KP.point) : KP.point, rc = j < 2 ? KP.reach : mirrorPose(KP.reach);
  return [[0, rc], [DROP + .1, pt], [DROP + .42, tt => ({ ...pt, dy: .05 * Math.sin((tt - DROP) * 9.2 + j), head: pt.head + .04 * Math.sin((tt - DROP) * 4.6 + j) })]]; };
const HOOK_X = [gx(0), gx(1), gx(2), gx(3), gx(4)];   // dancers stand under "their" character
const FLOOR = 962;
function shotHook(t, lt) {
  paperBG();
  const dk = ramp(t, DROP, .32);
  const z = lerp(1, 1.045, E.io(ramp(t, 135.9, 2.7))) + (1 - 1.045) * E.out5(dk) + .012 * Math.exp(-(t - DROP) * 6) * (t > DROP ? 1 : 0);
  const [sx, sy] = t > DROP ? shake(t, 7 * Math.exp(-(t - DROP) * 5)) : [0, 0];
  cam(CX + sx, CY + 20 + sy, z);
  // copybook row
  for (let j = 0; j < 5; j++) practiceBox(gx(j), GY, GS, PAL.orange, .75, 30 + j * 5);
  hookRow(t);
  // the underline "handle": pulled out on 拉 with the soft-close curve
  const uk = E.soft((t - T45[1] + .02) / 1.25);
  if (uk > 0) {
    const x0 = gx(0) - GS / 2, x1 = lerp(x0 + 20, gx(4) + GS / 2, uk), y = GY + GS / 2 + 40;
    inkStroke([[x0, y], [lerp(x0, x1, .5), y + 3], [x1, y - 2]], { w: 13, col: PAL.orange, taper: [.02, .3], wob: .6, seed: 81, press: .3 });
  }
  // stage
  handLine(-40, FLOOR, W + 40, FLOOR, { w: 3, seed: 401 });
  X.save(); X.globalAlpha *= .05; rect(-100, FLOOR, W + 200, H, PAL.ink); X.restore();
  HOOK_X.forEach((x, j) => tapeMark(x, FLOOR + 24, 21, j === 2 ? PAL.orange : PAL.ink, 50 + j * 3, j === 2 ? 1 : .55));
  // LAN
  const P = poseTrack(t, LAN_HOOK, .2);
  figure(CX, FLOOR, 44, P, lanO({ face: t > DROP ? 'happy' : 'smile' }));
  // the crew whips in onto their marks on the drop
  if (t > DROP - .01) {
    [0, 1, 3, 4].forEach(j => {
      const who = CREW[j], dir = j < 2 ? 1 : -1, k = E.out5((t - DROP + .01) / .3);
      const x = lerp(HOOK_X[j] - dir * 1300, HOOK_X[j], k);
      streaks(x, FLOOR, 38, dir, 1 - ramp(t, DROP + .12, .25), PAL.ink, j * 9);
      figure(x, FLOOR, 38, poseTrack(t, crewDrop(j), .2), { who, seed: j * 3 + 1, face: 'dot' });
    });
    HOOK_X.forEach((x, j) => stomp(x, FLOOR, 38, Math.exp(-(t - DROP - .2) * 5) * (t > DROP + .2 ? 1 : 0), PAL.ink, 70 + j));
    // 位 gets emphasis ticks
    const ek = ramp(t, DROP, .25);
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .42, r0 = GS * .66, r1 = r0 + 34 * E.out5(ek); if (ek > 0) inkStroke([[gx(4) + Math.cos(a) * r0, GY + Math.sin(a) * r0], [gx(4) + Math.cos(a) * r1, GY + Math.sin(a) * r1]], { w: 5, seed: 90 + i, a: 1 - ramp(t, DROP + .4, .3) }); }
  }
  camEnd();
  corners(t, { br: '46 / 46  ·  FINAL HOOK' });
}

// =====================================================================================================================
// DANCE BREAK
// =====================================================================================================================
// D1 · 140.645 – 142.690 · WIDE: the formation on the stage, a giant ink basket gliding out behind them
function shotWide(t, lt, dur) {
  paperBG();
  const z = .96 + .09 * E.io(lt / (dur + .4)) + .014 * pulse(t, 7);
  cam(CX, CY + 40, z);
  // a giant 拉 glides in behind them like a drawer (soft-close curve), then gets its orange hatch on the bar
  const gk = E.soft((t - b(206) + .3) / 1.4), gx0 = CX + 60 + (1 - gk) * 1500;   // already gliding in on the cut
  text('拉', gx0, 812, { size: 880, font: F.heavy, weight: 900, col: PAL.paper2, align: 'center' });
  const hk = ramp(t, b(208) - .02, .1);
  if (hk > 0) {    // wipe the orange hatch in from the left on the bar
    X.save(); X.beginPath(); X.rect(gx0 - 520, 0, 1040 * E.out5(hk), H); X.clip();
    X.fillStyle = hatchPat(PAL.orange, 18, 3.5); X.font = `900 880px ${F.heavy}`; X.textAlign = 'center'; X.fillText('拉', gx0, 812); X.restore();
  }
  const fl = 930;
  handLine(-60, fl, W + 60, fl, { w: 3, seed: 402 });
  X.save(); X.globalAlpha *= .05; rect(-100, fl, W + 200, H, PAL.ink); X.restore();
  for (let j = 0; j < 5; j++) tapeMark(CX + (j - 2) * 320, fl + 22, 19, j === 2 ? PAL.orange : PAL.ink, 60 + j, j === 2 ? 1 : .5);
  CREW.forEach((who, i) => { const k = i - 2, lead = who === 'lan';
    haloFig(CX + k * 320, fl, lead ? 39 : 35, move('pull', t - .035 * Math.abs(k), i * 3 + 1), { who, seed: i * 3 + 1, face: lead ? 'smile' : 'dot', blush: lead ? 1 : 0 }); });
  const pk = pulse(t, 9);
  for (let j = 0; j < 5; j++) stomp(CX + (j - 2) * 320, fl, 35, pk * .9, PAL.ink, 80 + j);
  camEnd();
  corners(t, { tl: 'DANCE BREAK  ·  拉', br: '▶ 01' });
}


// a framed kitchen cabinet (fixed camera target, so the drawer visibly travels) → returns the camera for pinning
function cabinetShot(ext, o) {
  const C = frameCam(o.at ?? [0, 230, 460], o.yaw, o.pitch ?? .42, o.sx ?? CX, o.sy ?? CY, o.span ?? 900, o.px ?? 900, { fov: 28 });
  if (o.shadow) {     // soft contact shadow under the carcass footprint
    const q = [[-300, -20, 0], [300, -20, 0], [300, -20, 470], [-300, -20, 470]].map(p => pin(C, p));
    X.save(); X.globalAlpha *= .045; X.fillStyle = PAL.ink; smoothPath(q, true); X.fill(); X.restore();
  }
  render3(cabinetPrims(ext, o), C, { style: 'steel', shine: o.shine });
  return C;
}
// the tiny crew standing along the front edge of the counter top (scale contrast)
function counterCrew(C, t, poseOf, o = {}) {
  CREW.map((who, i) => ({ who, i, p: C.project([-236 + i * 118, 430, o.z ?? 430]) })).sort((a, c) => c.p[2] - a.p[2])
    .forEach(({ who, i, p }) => figure(p[0], p[1], p[3] * (o.mm ?? 17), poseOf(i, who), { who, seed: i * 3 + 1, face: who === 'lan' ? 'smile' : 'dot', blush: who === 'lan' ? 1 : 0, w: .22 }));
}

// D2 · 142.690 – 144.054 · PRODUCT ORBIT: the basket pulls out on the beat; the tiny crew does the pull on the counter top
function shotOrbit(t, lt, dur) {
  paperBG();
  dotGrid(24, 24, W, H, 48, 1.5, PAL.ink, .1);
  const ext = 430 * E.soft((t - b(209) + .02) / 1.3);
  const yaw = lerp(-.88, -.5, E.io(lt / (dur + .5)));
  const C = cabinetShot(ext, { yaw, pitch: .4, at: [0, 230, 540], sx: 1080, sy: 600, span: 1000, px: 1180, shine: lerp(-520, 520, ramp(t, b(209) + .1, 1.1)) });
  counterCrew(C, t, (i) => move('pull', t - .03 * Math.abs(i - 2), i * 3 + 1));
  const [ax, ay] = pin(C, [-296, 142, 330 + ext]);
  callout(ax, ay, 560, 900, '全拉出 · FULL EXTENSION', { k: ramp(t, b(209) + .3, .6), size: 24, dir: -1 });
  const g = pulse(t, 5);
  [[-280, 210, 440], [280, 210, 440], [-280, 210, 0]].forEach(([x, y, zz], i) => { const [px, py] = pin(C, [x, y + 60, zz + ext]); sparkle(px, py, 34, { k: g * (i ? .7 : 1), col: i ? PAL.ink : PAL.orange, rot: .2 }); });
  corners(t, { tl: 'DANCE BREAK  ·  拉', br: '▶ 02' });
}

// D3 · 144.054 – 145.417 · 3-UP: three member panels drop into place on the cut; on the next beat the side panels pull out
// like drawers to reveal the other two members (LAN holds the centre)
const MEMBER = { pony: ['PONY', '01'], buns: ['BUNS', '02'], lan: ['LAN 小篮', '03'], long: ['LONG', '04'], kit: ['KIT', '05'] };
function panelDancer(who, x, t, side, dark) {
  const col = dark ? PAL.paper : PAL.ink;
  const P = who === 'lan' ? move('pull', t, 7) : move('point', t + (side > 0 ? BEAT * 2 : 0), 1);
  figure(x, 1110, 78, side > 0 ? mirrorPose(P) : P, { who, col, dark, seed: 11 + who.length, face: who === 'lan' ? 'smile' : 'dot', blush: who === 'lan' ? 1 : 0 });
}
function shotSplit(t, lt) {
  paperBG(PAL.ink);
  const g = 14, pw = (W - 2 * g) / 3, t0 = b(211), t1 = b(212);
  for (let i = 0; i < 3; i++) {
    const x0 = i * (pw + g), dark = false, bg = i === 1 ? PAL.paper : PAL.paper2;
    const first = ['pony', 'lan', 'kit'][i], second = ['buns', 'lan', 'long'][i];
    X.save(); X.beginPath(); X.rect(x0, 0, pw, H); X.clip();
    const layer = (who, off) => {
      X.save(); X.translate(0, off);
      rect(x0, 0, pw, H, bg);
      if (who !== 'lan') dotGrid(x0 + 20, 20, pw, H, 44, 1.4, PAL.ink, .1);
      else { const hx = x0 + pw / 2, hy = 330; halftone(hx - 330, hy - 330, 660, 660, (x, y) => { const d = dist(x, y, hx, hy) / 330; return d > 1 ? 0 : (1 - d) * 1.1; }, { col: PAL.orange, gap: 18, a: .85 }); }
      panelDancer(who, x0 + pw / 2, t, i === 0 ? -1 : i === 2 ? 1 : 0, dark);
      const [nm, no] = MEMBER[who], col = dark ? PAL.paper : PAL.ink;
      rect(x0, H - 118, pw, 118, bg, .9);
      text(nm, x0 + 34, H - 62, { size: 40, font: who === 'lan' ? F.sans : F.grotesk, weight: 700, col, track: 2 });
      mono(no + ' / 05', x0 + 36, H - 30, { col, a: .8, size: 17 });
      if (who === 'lan') circle(x0 + pw - 44, H - 76, 9, { fill: PAL.orange });
      X.restore();
      if (who === 'lan') { X.save(); X.strokeStyle = PAL.orange; X.lineWidth = 8; X.strokeRect(x0 + 4, 4, pw - 8, H - 8); X.restore(); }
    };
    // on the cut: drop in the last few percent (alternating up/down) so the frame is full on frame one
    const k0 = E.out5((t - t0 + .06) / .34), dir = i % 2 ? 1 : -1;
    const k1 = i === 1 ? 0 : E.soft((t - t1 + .03 - (i ? Q * .5 : 0)) / .5);
    layer(first, (1 - k0) * 160 * dir - k1 * H * dir);
    if (k1 > 0) { layer(second, (1 - k1) * H * dir); rect(x0, (1 - k1) * H * dir + (dir > 0 ? -12 : H), pw, 12, PAL.ink); }
    X.restore();
  }
}

// D4 · 145.417 – 146.781 · CLOSE-UP: LAN, centre cam. Reach → yank (the pull) → point with star eyes.
function shotClose(t, lt, dur) {
  paperBG();
  const z = 1 + .05 * E.io(lt / dur) + .02 * pulse(t, 8);
  cam(CX, CY, z);
  const hx = CX - 20, hy = 360;
  halftone(hx - 470, hy - 470, 940, 940, (x, y) => { const d = dist(x, y, hx, hy) / 470; return d > 1 ? 0 : (1 - d) * 1.15; }, { col: PAL.orange, gap: 20, a: .85 });
  speedLines(hx, hy + 60, 560, 1500, 38, { col: PAL.ink, a: .2, w: 8, seed: Math.floor(bp(t) * 2) * 7 });
  const P = poseTrack(t, [[0, KP.reach], [b(213) + BEAT * .5 - .03, pose({ lean: -.12, dy: -.1, sR: 1.2, eR: 1.95, sL: .9, eL: -1.9, hL: .2, kL: .3, hR: .14, kR: .15, head: -.16, squash: .05 })], [b(214) - .03, KP.point], [b(214) + .4, tt => ({ ...KP.point, head: .1 + .05 * Math.sin(tt * 8) })]], .15);
  const star = t > b(214) - .03;
  const f = figure(CX, 1245, 92, P, lanO({ face: star ? 'star' : 'smile' }));
  if (t > b(213) + BEAT * .5 - .03 && t < b(214)) { const k = 1 - ramp(t, b(213) + BEAT * .5, .35);
    [-26, 0, 26].forEach((dy, i) => inkStroke([[f.handR[0] + 50, f.handR[1] + dy], [f.handR[0] + 50 + (180 - i * 40) * (.4 + .6 * k), f.handR[1] + dy]], { w: 10, a: k * .8, seed: 44 + i, taper: [.05, .7] })); }
  if (star) { const k = ramp(t, b(214), .3); sparkle(f.handR[0] + 40, f.handR[1] - 40, 70, { k: E.back(k), col: PAL.ink }); sparkle(f.handR[0] - 50, f.handR[1] + 30, 34, { k: E.back(ramp(t, b(214) + .08, .3)), col: PAL.orange }); }
  camEnd();
  // centre-cam tag slides out like a drawer
  const k = E.soft((t - b(213)) / .8);
  X.save(); X.beginPath(); X.rect(64, H - 120, 460, 80); X.clip(); X.translate(-(1 - k) * 470, 0);
  rect(64, H - 112, 420, 64, PAL.ink); circle(98, H - 80, 11, { fill: PAL.orange, a: Math.floor(t * 3) % 2 ? .35 : 1 });
  text('LAN 小篮 · CENTER CAM', 124, H - 70, { size: 26, font: F.sans, weight: 700, col: PAL.paper, track: 1 });
  X.restore();
  mono(tc(t), W - 64, 70, { align: 'right', size: 20, track: 0 });
}

// D5 · 146.781 – 148.145 · 9-GRID MOSAIC: dancers on the diagonals, product on the cross; pops from the centre out on 16ths;
// on the next beat every product cell pulls its basket out (soft-close curve)
function cellDancer(t, who, mv, o = {}) {
  const dark = !!o.dark, col = dark ? PAL.paper : PAL.ink, P = move(mv, t + (o.off ?? 0), 3 + who.length);
  paperBG(dark ? PAL.night : PAL.paper);
  handLine(60, 990, W - 60, 990, { w: 8, col, seed: 17 + who.length });
  figure(CX, 990, 80, o.flip ? mirrorPose(P) : P, { who, col, dark, w: .24, face: who === 'lan' ? 'smile' : 'dot', blush: who === 'lan' ? 1 : 0, seed: 21 + who.length });
}
function cellProduct(t, kind) {
  paperBG(PAL.paper2);
  const ek = E.soft((t - b(216) + .02) / 1.1), ext = 60 + 320 * ek;
  if (kind === 'dish') {
    const C = frameCam([0, 110, 300 + ext * .5], -.75 + (t - b(215)) * .22, .5, CX, 560, 820, 1500, { fov: 28 });
    render3(dishDrawer(ext, { front: false }), C, { style: 'steel', lw: 2, shine: lerp(-500, 500, ek) });
  } else if (kind === 'pantry') {    // tall pantry unit: stacked tiers, each one sliding out in turn
    const C = frameCam([0, 420, 260], .75 - (t - b(215)) * .2, .28, CX, 560, 1000, 1200, { fov: 28 });
    const P = [];
    for (let i = 0; i < 4; i++) {
      const e = 260 * E.soft((t - b(216) + .02 - i * Q * .5) / 1);
      P.push(...translate3(basketModel({ w: 420, d: 380, h: 120, type: 'plain', gap: 28, midRim: false, rimR: 18 }), [0, i * 250, e]));
      P.push(lathe([-110, i * 250 + 4, 120 + e], PROF.jar), lathe([0, i * 250 + 4, 250 + e], PROF.jar), lathe([110, i * 250 + 4, 150 + e], i % 2 ? PROF.cup : PROF.jar));
    }
    render3(P, C, { style: 'steel', lw: 1.8 });
  } else if (kind === 'top') {
    const r = (t - b(215)) * .25 + .3;
    const C = camera3({ eye: [0, 1500, 220], at: [0, 60, 220], up: [Math.sin(r), 0, -Math.cos(r)], fov: 34 });
    render3(dishDrawer(0, { front: false, slides: false }), C, { style: 'ink', lw: 2.2 });
  } else {        // a stack of bowls + cups: what the dish basket holds
    const C = frameCam([0, 80, 0], .3 + (t - b(215)) * .3, .45, CX, 600, 420, 1300, { fov: 28 });
    const P = [];
    for (let i = 0; i < 4; i++) P.push(lathe([-90, i * 22, 0], PROF.bowl, { open: i === 3, fill: i % 2 ? PAL.paper2 : PAL.paper }));
    P.push(lathe([120, 0, -40], PROF.cup, { open: true })); P.push(lathe([110, 0, 90], PROF.cup, { open: true }));
    render3(P, C, { lw: 2.2 });
    const g = pulse(t, 5); sparkle(CX - 260, 300, 80, { k: g, col: PAL.ink });
  }
}
const GRID9 = [
  t => cellDancer(t, 'pony', 'point'),
  t => cellProduct(t, 'dish'),
  t => cellDancer(t, 'buns', 'cross', { off: BEAT }),
  t => cellProduct(t, 'top'),
  t => cellDancer(t, 'lan', 'pull', { dark: true }),
  t => cellProduct(t, 'pantry'),
  t => cellDancer(t, 'long', 'cross'),
  t => cellProduct(t, 'bowls'),
  t => cellDancer(t, 'kit', 'point', { flip: true, off: BEAT }),
];
const RING9 = [2, 1, 2, 1, 0, 1, 2, 1, 2];     // pop order: centre, cross, corners
function shotGrid(t, lt) {
  paperBG(PAL.paper2);
  const g = 10, cw = (W - 2 * g) / 3, ch = (H - 2 * g) / 3;
  for (let i = 0; i < 9; i++) {
    const c = i % 3, r = Math.floor(i / 3), x0 = c * (cw + g), y0 = r * (ch + g);
    const k = E.out5((t - b(215) - RING9[i] * Q * .35 + .12) / .2); if (k <= 0) continue;   // centre + cross already in on the beat
    const s = lerp(.6, 1, k);
    X.save(); X.beginPath(); X.rect(x0 + cw / 2 - cw / 2 * s, y0 + ch / 2 - ch / 2 * s, cw * s, ch * s); X.clip();
    X.translate(x0, y0); X.scale(cw / W, ch / H);
    GRID9[i](t);
    X.restore();
  }
  // gutters + the orange centre frame
  rect(cw, 0, g, H, PAL.ink); rect(2 * cw + g, 0, g, H, PAL.ink); rect(0, ch, W, g, PAL.ink); rect(0, 2 * ch + g, W, g, PAL.ink);
  X.save(); X.strokeStyle = PAL.orange; X.lineWidth = 8; X.strokeRect(cw + g + 4, ch + g + 4, cw - 8, ch - 8); X.restore();
  for (let i = 0; i < 9; i++) { const c = i % 3, r = Math.floor(i / 3); mono('CAM ' + (i + 1), c * (cw + g) + 22, r * (ch + g) + 36, { size: 15, col: i === 4 ? PAL.paper : PAL.ink, a: .6 }); }
}

// D6 · 148.145 – 150.872 · OVERHEAD (a full bar): the crew dances a kaleidoscope standing inside a giant wire basket, straight
// down; the ring turns an eighth on every beat; on beat 219 the camera pulls out (soft-close curve) to show the whole basket
const TOP_ARMS = [
  { l: [0, 0, 1, 1], r: [0, 0, 1, 1] },                        // T
  { l: [1.15, .25, 1, 1], r: [1.15, .25, 1, 1] },              // both reach forward
  { l: [.2, .1, .35, .4], r: [.2, .1, .35, .4] },              // arms up (foreshortened)
  { l: [-.6, -1.7, .75, .75], r: [1.3, 0, 1, 1] },             // the pull: one reaches, one yanked back to the hip
];
function armsAt(t, seed = 0) {
  const n = beatN(t), ph = sinceBeat(t) / BEAT, a = TOP_ARMS[(n + 3 + seed) % 4], p = TOP_ARMS[(n + 2 + seed) % 4], k = E.out5(ph / .4);
  const L = (x, y) => x.map((v, i) => lerp(v, y[i], k));
  return { l: L(p.l, a.l), r: L(p.r, a.r) };
}
function shotOverhead(t, lt, dur) {
  paperBG(PAL.night); DARK = true;
  const zoom = lerp(1.12, .94, E.soft((t - b(219) + .02) / 1.4)) + .012 * pulse(t, 8);
  X.save(); X.translate(CX, CY); X.rotate(lt * .06 - .08); X.scale(zoom, zoom); X.translate(-CX, -CY);
  const gr = X.createRadialGradient(CX, CY, 60, CX, CY, 760); gr.addColorStop(0, rgba(PAL.paper, .1)); gr.addColorStop(1, rgba(PAL.paper, 0));
  X.fillStyle = gr; X.fillRect(-600, -600, W + 1200, H + 1200);
  // the giant basket floor, seen straight down: thin steel line art
  const C = camera3({ eye: [0, 1300, 220], at: [0, 60, 220], up: [0, 0, -1], fov: 32 });
  render3(basketModel({ w: 560, d: 440, h: 150, type: 'plain', gap: 32 }), C, { style: 'ink', inkCol: PAL.steel1, lw: .55, a: .6 });
  const n = beatN(t), spin = (n - 218) * Math.PI / 4 + E.out5(sinceBeat(t) / BEAT / .4) * Math.PI / 4;
  const pk = pulse(t, 5); handCircle(CX, CY, 150 + 60 * (1 - pk), { w: 5, col: PAL.orange, seed: 9, a: pk });
  const R = 250;
  ['pony', 'buns', 'long', 'kit'].forEach((who, i) => {
    const a = spin + i * Math.PI / 2 + Math.PI / 4, c = Math.cos(a), sn = Math.sin(a), x = CX + c * R, y = CY + sn * R;
    topFig(x, y, c * 64, sn * 64, 33, a, armsAt(t, i % 2), who, { col: PAL.paper, bg: PAL.night, seed: 30 + i * 7, step: Math.sin(bp(t) * Math.PI) * (i % 2 ? 1 : -1), swing: Math.sin(t * 5 + i) });
  });
  const lf = -spin * .5 + Math.PI / 2;
  topFig(CX, CY, Math.cos(lf) * 14, Math.sin(lf) * 14, 38, lf, armsAt(t, 2), 'lan', { col: PAL.paper, bg: PAL.night, seed: 7, step: Math.sin(bp(t) * Math.PI) });
  X.restore();
  corners(t, { col: PAL.paper, tl: 'DANCE BREAK  ·  TOP CAM', br: '▶ 06' });
}

// D7 · 150.872 – 151.554 · ECHELON (1 beat): the crew glides into a diagonal and points down the line, one after another
function shotEchelon(t, lt) {
  paperBG();
  const vp = [1760, 330];
  X.save(); X.globalAlpha *= .5;
  for (let i = -6; i <= 10; i++) handLine(vp[0], vp[1], vp[0] + (i * 240 - 1600), H + 40, { w: 1.6, seed: 300 + i, col: PAL.ink2 });
  X.restore();
  const k = E.soft((t - b(221) + .04) / .8);
  const spots = [[560, 1130, 60], [930, 890, 40], [1190, 740, 28], [1385, 630, 20.5], [1530, 555, 15.5]];
  const order = ['lan', 'pony', 'buns', 'long', 'kit'];
  for (let i = 4; i >= 0; i--) {
    const [x, y, s] = spots[i], u = (1 - k) * .35;
    const px = lerp(x, vp[0], u), py = lerp(y, vp[1], u), ss = s * (1 - u * .9);
    const P = poseTrack(t, [[0, KP.hips], [b(221) + i * .045, KP.point]], .16);
    figure(px, py, ss, P, { who: order[i], seed: i * 3 + 1, face: i === 0 ? 'star' : 'dot', blush: i === 0 ? 1 : 0, w: .2 });
  }
  const g = ramp(t, b(221) + .05, .3);
  sparkle(vp[0] - 40, vp[1] - 70, 70, { k: E.back(g), col: PAL.orange });
  corners(t, { tl: 'DANCE BREAK  ·  拉', br: '▶ 07' });
}

// D8 · 151.554 – 152.235 · JUMP (1 beat): star jumps under stage beams, hang time, night
const STAR = pose({ dy: 0, sL: 2.35, eL: .1, sR: 2.35, eR: .1, hL: .42, kL: 0, hR: .42, kR: 0, head: -.08 });
function shotJump(t, lt) {
  paperBG(PAL.night); DARK = true;
  const t0 = b(222), u = t - t0;
  const lift = u < .08 ? 0 : Math.sin(clamp((u - .08) / .8) * Math.PI) ** .55;
  const fl = 930;
  // stage beams
  for (let i = 0; i < 5; i++) {
    const x = CX + (i - 2) * 320, a = .05 + .04 * (i === 2 ? 1 : 0);
    X.save(); const gr = X.createLinearGradient(0, 0, 0, fl); gr.addColorStop(0, rgba(PAL.paper, a * 2)); gr.addColorStop(1, rgba(PAL.paper, 0));
    X.fillStyle = gr; X.beginPath(); X.moveTo(x - 30, -10); X.lineTo(x + 30, -10); X.lineTo(x + 150, fl); X.lineTo(x - 150, fl); X.closePath(); X.fill(); X.restore();
  }
  handLine(-40, fl, W + 40, fl, { w: 3, col: PAL.steel2, seed: 406 });
  CREW.forEach((who, i) => {
    const x = CX + (i - 2) * 320, s = who === 'lan' ? 34 : 30;
    const P = poseTrack(t, [[0, KP.squat], [t0 + .08, STAR]], .16);
    const y = fl - lift * (190 + (i === 2 ? 30 : 0));
    X.save(); X.globalAlpha *= .3; X.fillStyle = PAL.paper; X.beginPath(); X.ellipse(x, fl + 6, 2.3 * s * (1 - lift * .55), .28 * s, 0, 0, TAU); X.fill(); X.restore();
    figure(x, y, s, P, { who, col: PAL.paper, dark: true, seed: i * 3 + 1, face: who === 'lan' ? 'happy' : 'closed', blush: who === 'lan' ? 1 : 0, shadow: false });
  });
  const sk = ramp(t, t0 + .2, .25);
  [[CX - 180, 330, 40], [CX + 190, 300, 30], [CX + 520, 360, 22], [CX - 560, 380, 26]].forEach(([x, y, r], i) => sparkle(x, y, r, { k: E.back(clamp(sk * 1.3 - i * .1)), col: i === 0 ? PAL.orange : PAL.paper }));
  corners(t, { col: PAL.paper, tl: 'DANCE BREAK  ·  拉', br: '▶ 08' });
}

// =====================================================================================================================
// END CARD · 152.235 – 156.6 · paper. HIGOLD 悍高 + 厨房拉篮 · 一拉就到位. The basket glides shut on the last note.
// =====================================================================================================================
function shotEnd(t, lt) {
  paperBG();
  const t0 = b(223), close = E.soft((t - LAST) / 1.4), ext = 400 * (1 - close);
  const settle = ramp(t, LAST + 1, 1);
  const yaw = lerp(-.82, -.66, E.io(ramp(t, t0, 3.4))) + .005 * Math.sin(t * .9) * settle;
  const C = cabinetShot(ext, { yaw, pitch: .4, at: [0, 210, 380], sx: 1330, sy: 610, span: 760, px: 740, shadow: true, shine: lerp(-600, 600, ramp(t, t0 + .1, 1.6)) });
  counterCrew(C, t, (i) => poseTrack(t, [[0, tt => move('wave', tt, i)], [LAST + .1 + Math.abs(i - 2) * .07, tt => move('idle', tt, i)]], .35), { mm: 15, z: 400 });
  // the 嗒 as it settles home
  const dk = ramp(t, LAST + .5, .35);
  if (dk > 0) { const [dx, dy] = pin(C, [-316, 300, 470]); marker('嗒', dx - 58, dy - 16, { size: 96, col: PAL.orange, align: 'center', rot: -.12, sx: E.back(dk), sy: E.back(dk), a: clamp(dk * 2) }); }
  // lockup
  const x0 = 150;
  typeDrawer('HIGOLD', x0, 430, t0, t, { size: 200, font: F.anton, weight: 400, col: PAL.ink, track: 6, dur: 1.1 });
  typeDrawer('悍高', x0, 622, t0 + BEAT * .5, t, { size: 158, font: F.heavy, weight: 900, col: PAL.ink, track: 8, dur: 1.1 });
  const rk = E.soft((t - b(224)) / 1.1);
  if (rk > 0) { line(x0, 684, x0 + 600 * rk, 684, 3, PAL.ink); rect(x0, 678, 120 * rk, 12, PAL.orange); }
  typeDrawer('厨房拉篮 · 一拉就到位', x0, 782, b(224) + BEAT * .5, t, { size: 64, font: F.smiley, weight: 400, col: PAL.ink, track: 2, dur: 1.1 });
  const ck = ramp(t, LAST + .2, .6);
  if (ck > 0) {
    const cr = 'animated in code, frame by frame';
    mono(cr, x0, H - 96, { size: 19, a: ck * .85, weight: 500, track: 1 });
    if (Math.floor(t * 1.6) % 2 === 0 && t > LAST + .8) rect(x0 + measure(cr, 19, F.mono, 500, 1) + 8, H - 113, 11, 22, PAL.ink, .75);
  }
  mono(tc(t), W - 64, 70, { align: 'right', size: 20, track: 0, a: .7 });
  mono('一拉就到位  ·  M/V', 64, 70, { size: 18, a: .7, font: F.sans, weight: 600 });
}

chapter('outro', 135.9, 156.6, [
  [135.9, shotHook],
  [b(206), shotWide],
  [b(209), shotOrbit],
  [b(211), shotSplit],
  [b(213), shotClose],
  [b(215), shotGrid],
  [b(217), shotOverhead],
  [b(221), shotEchelon],
  [b(222), shotJump],
  [b(223), shotEnd],
]);
})();
