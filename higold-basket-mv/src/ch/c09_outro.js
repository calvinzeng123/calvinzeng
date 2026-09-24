// c09_outro.js — c09 · Outro · "Dance break + end card" (135.9 – 156.6)
// 1. The last hook, brushed into a calligraphy practice row (米字格): every character lands in its box, and on the drop (位, a
//    full-bleed orange hit) every dancer lands on her tape mark under "her" character. 一拉就到位, literally.
// 2. The dance break — the loudest 12 s of the song and the film's visual peak: 2-beat cuts, a camera punch on every beat, big
//    snapped hits. Paper half: low-hero wide / exploded product view / 3-up member cams / close-up / 9-grid pose wave. Night half:
//    overhead kaleidoscope / the army V / face line-up / star jump. The paper end card is the single release.
// 3. End card: HIGOLD 悍高 + 厨房拉篮 · 一拉就到位, the basket glides shut on the last note, 嗒, then stillness.
(() => {
'use strict';
const LI = 45;                               // 一拉就到位 (137.4 – 140.5)
const b = n => beatT(n);
const Q = BEAT / 4, E8 = BEAT / 2;           // a 16th, an 8th
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
// a pose sequence on a fixed grid (e.g. one pose per 8th from t0)
const seqKeys = (t0, step, poses, lead = .02) => poses.map((P, i) => [t0 + i * step - lead, P]);
// camera punch on every beat: a zoom kick + a decaying shake
function punchCam(t, k = 1, cx = CX, cy = CY, z0 = 1) {
  const [sx, sy] = shake(t, 10 * k * pulse(t, 5) ** 2, 3);
  cam(cx + sx, cy + sy, z0 + .045 * k * pulse(t, 8));
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
// small impact ticks at a dancer's feet
function stomp(x, y, s, k, col = PAL.ink, seed = 1) {
  if (k < .05) return;
  for (const sg of [-1, 1]) inkStroke([[x + sg * s * 1.6, y - s * .15], [x + sg * s * (2.2 + .6 * (1 - k)), y - s * (.5 + .3 * (1 - k))]], { w: s * .16, col, a: k, seed: seed + sg, taper: [.2, .4] });
}
const stompAt = (t, t0) => t > t0 ? Math.exp(-(t - t0) * 6) : 0;
// horizontal motion streaks behind a moving body
function streaks(x, y, s, dir, k, col = PAL.ink, seed = 1) {
  if (k < .03) return;
  [[2.2, 1], [4.6, 1.5], [7.2, .8]].forEach(([hy, l], i) => inkStroke([[x - dir * s * 1.4, y - hy * s], [x - dir * s * (1.4 + l * 3.2), y - hy * s]], { w: s * .14, col, a: k, seed: seed + i, taper: [.05, .6] }));
}
// three speed streaks trailing a hand (dir = +1: the hand came from the right)
function handStreaks(hx, hy, len, dir, k, col = PAL.ink, w = 9, seed = 44) {
  if (k < .03) return;
  [-1, 0, 1].forEach((d, i) => inkStroke([[hx + dir * 40, hy + d * w * 2.6], [hx + dir * (40 + len * (1 - Math.abs(d) * .3)), hy + d * w * 2.6]], { w, col, a: k * .85, seed: seed + i, taper: [.05, .7] }));
}
// figure with a knock-out halo (paper on paper shots; a paper "sticker" edge on night shots)
function haloFig(x, y, s, P, o = {}) {
  figure(x, y, s, P, { ...o, col: o.halo ?? PAL.paper, w: (o.w ?? .2) * 2.3, shadow: false, blush: 0, fill: o.halo ?? PAL.paper });
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
  // the near (left) side panel and the counter sort with the fronts, so they hide the basket once the drawer is shut
  // (render3 paints layer by layer; the camera always sits front-left)
  P.push(...boxModel(-330, -20, -20, 330, 400, 460, { sides: 'l', fill: PAL.paper, sideFill: PAL.paper2, layer: 2 }));
  P.push(...boxModel(-350, 400, -20, 350, 430, 490, { sides: 'lrtf', fill: PAL.paper, frontFill: PAL.paper2, layer: 2 }));
  P.push(...dishDrawer(ext, { frontFill: o.frontFill, items: o.items }));
  P.push(...doorModel(-316, 334, 316, 398, 460, { th: 18, handle: false, fill: PAL.paper }));   // slim fixed top drawer face, flush
  return P;
}
function cabinetShot(ext, o) {
  const C = frameCam(o.at ?? [0, 230, 460], o.yaw, o.pitch ?? .42, o.sx ?? CX, o.sy ?? CY, o.span ?? 900, o.px ?? 900, { fov: 28 });
  if (o.shadow) {     // soft contact shadow under the carcass footprint
    const q = [[-300, -20, 0], [300, -20, 0], [300, -20, 470], [-300, -20, 470]].map(p => pin(C, p));
    X.save(); X.globalAlpha *= .045; X.fillStyle = PAL.ink; smoothPath(q, true); X.fill(); X.restore();
  }
  render3(cabinetPrims(ext, o), C, { style: 'steel', shine: o.shine });
  return C;
}
// the tiny crew standing along the front edge of the counter top (scale contrast); outer members mirror so arms point outward
function counterCrew(C, t, poseOf, o = {}) {
  CREW.map((who, i) => ({ who, i, p: C.project([-280 + i * 140, 430, o.z ?? 430]) })).sort((a, c) => c.p[2] - a.p[2])
    .forEach(({ who, i, p }) => { const P = poseOf(i, who); figure(p[0], p[1], p[3] * (o.mm ?? 17), i < 2 ? mirrorPose(P) : P, { who, seed: i * 3 + 1, face: who === 'lan' ? 'smile' : 'dot', blush: who === 'lan' ? 1 : 0, w: .22 }); });
}
// "drawer of type": text slides out of a slot at its left edge with the soft-close curve
function typeDrawer(str, x, y, t0, t, o) {
  const k = E.soft((t - t0) / (o.dur ?? 1)); if (k <= 0) return 0;
  const w = measure(str, o.size, o.font, o.weight ?? 400, o.track ?? 0);
  X.save(); X.beginPath(); X.rect(x - 6, y - o.size * 1.15, w + 60, o.size * 1.5); X.clip();
  text(str, x - (1 - k) * (w + 60), y, { ...o, a: (o.a ?? 1) * clamp(k * 4) });
  X.restore(); return w;
}
// dance vocabulary for the break (the new, bigger pull + big hits)
const DP = {
  yank: KP.yank, reach: KP.reach, cross: KP.cross, up: KP.armsUp, point: KP.point, heart: KP.heart, frame: KP.frame,
  jump: pose({ dy: 1.5, sL: 2.35, eL: .15, sR: 2.35, eR: .15, hL: .35, kL: 1.25, hR: .35, kR: 1.25, head: -.1 }),
  star: pose({ dy: 0, sL: 2.35, eL: .1, sR: 2.35, eR: .1, hL: .42, kL: 0, hR: .42, kR: 0, head: -.08 }),
  land: pose({ dy: -.55, sL: 1.2, eL: .3, sR: 1.2, eR: .3, hL: .45, kL: .9, hR: .45, kR: .9, squash: .06, head: .1 }),
  step: pose({ lean: .16, sL: .3, eL: 1.6, sR: 1.5, eR: .1, hL: .5, kL: .2, hR: .08, head: .12 }),
  flex: pose({ lean: -.12, dy: -.1, sR: 1.2, eR: 1.95, sL: .9, eL: -1.9, hL: .2, kL: .3, hR: .14, kR: .15, head: -.16, squash: .05 }),
};

// ---------- overhead dancer: seen from straight above, looking UP into the lens ----------
// (x, y) = feet on the floor; (bx, by) = screen offset feet → shoulders (the wide-lens lean away from the lens axis), so feet, hips,
// shoulders and the upturned face separate along one radial line. A = {l: [a1, a2, k1, k2], r: […]}: a1 = upper-arm angle from
// "straight out sideways" toward the lens (+, reads as outward past the head) or the floor/centre (−); a2 = elbow bend;
// k1/k2 = foreshortening.
function topFig(x, y, bx, by, s, A, who, o = {}) {
  const col = o.col ?? PAL.paper, bg = o.bg ?? PAL.night, lw = .28 * s, sd = o.seed ?? 3;
  const L = Math.hypot(bx, by) || 1, u = [bx / L, by / L], v = [-u[1], u[0]];
  const at = (ox, oy, l, f) => [ox + (v[0] * l + u[0] * f) * s, oy + (v[1] * l + u[1] * f) * s];
  const st = (pts, k, w = lw, tp = [.06, .2]) => inkStroke(pts, { w, col, taper: tp, wob: .35, seed: sd + k, press: .12 });
  const sx = x + bx, sy = y + by, hpx = x + bx * .42, hpy = y + by * .42;
  const R = .8 * s, hx = sx + u[0] * (.3 * s + R), hy = sy + u[1] * (.3 * s + R), ang = Math.atan2(u[1], u[0]) + Math.PI / 2;
  // feet (toes point in toward the centre) joined to the hips by the legs
  for (const sg of [-1, 1]) {
    const f = at(x, y, sg * .55 + (o.step ?? 0) * sg * .25, 0), hp = at(hpx, hpy, sg * .38, 0);
    X.save(); X.translate(f[0], f[1]); X.rotate(Math.atan2(-u[1], -u[0])); X.fillStyle = col; X.beginPath(); X.ellipse(.22 * s, 0, .48 * s, .24 * s, 0, 0, TAU); X.fill(); X.restore();
    st([hp, [lerp(hp[0], f[0], .5), lerp(hp[1], f[1], .5)], f], 6 + sg, lw * 1.2, [.04, .02]);
  }
  st([[hpx, hpy], [sx, sy]], 2, lw * 1.2, [.04, .04]);
  // shoulders (a solid chest seen from above)
  X.save(); X.translate(sx, sy); X.rotate(Math.atan2(v[1], v[0])); X.fillStyle = col; X.beginPath(); X.ellipse(0, 0, 1.5 * s, .55 * s, 0, 0, TAU); X.fill(); X.restore();
  // arms
  for (const sg of [-1, 1]) {
    const [a1, a2, k1, k2] = sg < 0 ? A.l : A.r;
    const dir = a => [v[0] * sg * Math.cos(a) + u[0] * Math.sin(a), v[1] * sg * Math.cos(a) + u[1] * Math.sin(a)];
    const S = at(sx, sy, sg * 1.3, 0), d1 = dir(a1), d2 = dir(a1 + a2);
    const El = [S[0] + d1[0] * 1.75 * k1 * s, S[1] + d1[1] * 1.75 * k1 * s], Hd = [El[0] + d2[0] * 1.6 * k2 * s, El[1] + d2[1] * 1.6 * k2 * s];
    st([S, El, Hd], 4 + sg, lw, [.05, .25]);
    circle(Hd[0], Hd[1], lw * .75, { fill: col });
  }
  // the upturned face: crown points outward along the lean
  X.save(); X.translate(hx, hy); X.rotate(ang);
  const hs = (pts, k, ww = 1.5, tp = [.1, .3]) => inkStroke(pts.map(([a, c]) => [a * R, c * R]), { w: lw * ww * .8, col, taper: tp, wob: .3, seed: sd + k });
  if (who === 'pony') hs([[0, -1.05], [(o.swing ?? 0) * .6, -1.9], [(o.swing ?? 0) * 1.2, -2.6]], 30, 2.2, [.1, .7]);
  if (who === 'long') for (const sg of [-1, 1]) hs([[sg * .95, -.3], [sg * 1.15, .6], [sg * 1.1, 1.5]], 31 + sg, 1.6, [.05, .5]);
  if (who === 'buns') for (const sg of [-1, 1]) circle(sg * .78 * R, -.95 * R, .4 * R, { fill: col });
  circle(0, 0, R, { fill: bg });
  handCircle(0, 0, R, { w: lw * .8, col, seed: sd + 9 });
  if (who === 'lan') { hs([[-1.1, .5], [-1.15, -.2], [-.85, -.85], [0, -1.12], [.85, -.85], [1.15, -.2], [1.1, .5]], 20, 2.4, [.02, .02]); hs([[-.9, -.5], [0, -.45], [.9, -.5]], 21, 1.6, [.05, .05]); }
  else if (who === 'kit') { hs([[-1.02, -.35], [-.78, -.92], [0, -1.12], [.78, -.92], [1.02, -.35]], 22, 2.2, [.02, .02]); hs([[-1.02, -.38], [1.7, -.42]], 23, 1.6, [.02, .3]); }
  else hs([[-1.02, .1], [-.78, -.8], [0, -1.1], [.78, -.8], [1.02, .1]], 24, 1.9, [.05, .2]);
  X.fillStyle = col; for (const ex of [-.36, .36]) { X.beginPath(); X.arc(ex * R, .02 * R, .11 * R, 0, TAU); X.fill(); }
  X.strokeStyle = col; X.lineWidth = lw * .55; X.lineCap = 'round'; X.beginPath(); X.arc(0, .3 * R, .2 * R, .25, Math.PI - .25); X.stroke();
  if (who === 'lan') {
    X.save(); X.globalAlpha *= .6; X.fillStyle = PAL.orange; for (const ex of [-.6, .6]) { X.beginPath(); X.ellipse(ex * R, .3 * R, .16 * R, .08 * R, 0, 0, TAU); X.fill(); } X.restore();
    X.save(); X.translate(.6 * R, -.66 * R); X.rotate(-.6); X.fillStyle = PAL.orange; X.beginPath(); X.roundRect(-.38 * R, -.12 * R, .76 * R, .24 * R, .12 * R); X.fill(); X.restore();
  }
  X.restore();
}

// =====================================================================================================================
// SHOT 1 · 135.9 – 140.645 · The final hook in a practice row. Calm; LAN centred; on the drop the frame turns orange and the
// crew snaps onto their marks.
// =====================================================================================================================
const GS = 246, GG = 24, GY = 262;          // practice box size, gap, centre y
const gx = j => CX + (j - 2) * (GS + GG);
// a 米字格 box whose border strokes on clockwise to progress p, then its dashed guides fade in
function practiceBox(cx, cy, S, col, a, seed, p = 1) {
  if (p <= 0) return;
  const x0 = cx - S / 2 + jit(seed, .6), y0 = cy - S / 2 + jit(seed + 1, .6);
  const pts = [[x0, y0], [x0 + S, y0], [x0 + S, y0 + S], [x0, y0 + S], [x0, y0]];
  X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineCap = 'round'; X.lineWidth = 3; X.beginPath(); X.moveTo(x0, y0);
  let rem = clamp(p) * 4 * S;
  for (let i = 1; i < 5 && rem > 0; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], l = Math.min(rem, S); X.lineTo(ax + (bx - ax) * l / S, ay + (by - ay) * l / S); rem -= l; }
  X.stroke();
  const g = clamp((p - .55) / .45);
  if (g > 0) {
    X.setLineDash([8, 10]); X.lineWidth = 1.6; X.globalAlpha *= .7 * g; X.beginPath();
    X.moveTo(x0, cy); X.lineTo(x0 + S, cy); X.moveTo(cx, y0); X.lineTo(cx, y0 + S);
    X.moveTo(x0, y0); X.lineTo(x0 + S, y0 + S); X.moveTo(x0 + S, y0); X.lineTo(x0, y0 + S); X.stroke();
  }
  X.restore();
}
// private presenter: each character is brushed into its own box on its onset (left→right brush wipe + a small settle)
function hookRow(t, onOrange) {
  const L = LY[LI]; if (t < L.t[0] - .08) return; LYRIC_DRAWN.add(LI);
  const row = lyRows(LI)[0];
  row.forEach((c, j) => {
    const k = chK(c.ti, t, .2); if (k <= 0) return;
    const cx = gx(j), cy = GY, s = lerp(1.12, 1, E.out5(k));
    X.save(); X.beginPath(); X.rect(cx - GS * .62, cy - GS * .62, GS * 1.24 * E.out(k * 1.15), GS * 1.24); X.clip();
    X.translate(cx, cy); X.scale(s, s); X.translate(-cx, -cy);
    const col = c.ch === '拉' ? (onOrange ? PAL.paper : PAL.orange) : PAL.ink;
    marker(c.ch, cx, cy + 6, { size: 200, align: 'center', col, variant: j, rot: (hash(j + 3) - .5) * .05 });
    X.restore();
  });
}
const T45 = LY[LI].t;
const idleBounce = tt => { const A = move('sway', tt, 2), B = move('bounce', tt, 2); const P = lerpPose(A, B, .35); return { ...P, lean: P.lean * .5 }; };
const NOD = pose({ lean: .2, head: .28, dy: -.2, sL: .6, eL: 1.3, sR: .95, eR: -1.9, hL: .22, kL: .35, hR: .12, kR: .1, squash: .04 });
const LAN_HOOK = [
  [0, idleBounce],
  [T45[0] - .03, KP.reach],                                          // 一  reach
  [T45[1] - .03, KP.yank],                                           // 拉  the pull: fist yanked to the hip, body thrown back
  [T45[2] - .03, NOD],                                               // 就  lean-in nod
  [T45[3] - .03, KP.point],                                          // 到  point up
  [DROP - .02, pose({ ...KP.armsUp, dy: .35, head: -.1 })],         // 位  arms up on the drop — the crew lands around her
  [DROP + .42, tt => pose({ ...KP.armsUp, dy: .06 + .06 * Math.sin((tt - DROP) * 9.2), head: -.06 })],
];
// crew: slide in on the reach, land on the mark pointing up and out (a V around LAN)
const crewDrop = j => { const pt = j < 2 ? mirrorPose(KP.point) : KP.point, rc = j < 2 ? KP.reach : mirrorPose(KP.reach);
  return [[0, rc], [DROP + .1, pt], [DROP + .42, tt => ({ ...pt, dy: .05 * Math.sin((tt - DROP) * 9.2 + j), head: pt.head + .04 * Math.sin((tt - DROP) * 4.6 + j) })]]; };
const HOOK_X = [gx(0), gx(1), gx(2), gx(3), gx(4)];   // dancers stand under "their" character
const FLOOR = 962;
function shotHook(t, lt) {
  paperBG();
  // the drop: the frame is slammed orange from the floor up (full-bleed hit), for exactly one beat
  const ok = t >= DROP - .01 ? clamp((t - DROP + .01) / .07) : 0, onO = ok > .5;
  if (ok > 0) rect(0, H * (1 - E.out5(ok)), W, H, PAL.orange);
  const dk = ramp(t, DROP, .32);
  const z = lerp(1, 1.035, E.io(ramp(t, 136.2, 2.4))) + (1 - 1.035) * E.out5(dk) + .014 * Math.exp(-(t - DROP) * 6) * (t > DROP ? 1 : 0);
  const [sx, sy] = t > DROP ? shake(t, 8 * Math.exp(-(t - DROP) * 5)) : [0, 0];
  cam(CX + sx, CY + 20 + sy, z);
  const ink = PAL.ink, gridCol = onO ? PAL.paper : PAL.orange;
  // copybook row: each box strokes on through the bar before the hook
  for (let j = 0; j < 5; j++) practiceBox(gx(j), GY, GS, gridCol, onO ? .95 : .75, 30 + j * 5, E.out(ramp(t, b(200) - .02 + j * BEAT / 5, .26)));
  hookRow(t, onO);
  // the underline "handle": pulled open from the centre on 拉 with the soft-close curve
  const uk = E.soft((t - T45[1] + .02) / 1.1);
  if (uk > 0) {
    const half = (gx(4) - gx(0) + GS) / 2 * uk, y = GY + GS / 2 + 40;
    inkStroke([[CX - half, y + 2], [CX, y + 4], [CX + half, y - 2]], { w: 13, col: onO ? PAL.paper : PAL.orange, taper: [.08, .08], wob: .6, seed: 81, press: .3 });
  }
  // stage
  handLine(-40, FLOOR, W + 40, FLOOR, { w: 3, seed: 401, col: ink });
  X.save(); X.globalAlpha *= .05; rect(-100, FLOOR, W + 200, H, ink); X.restore();
  const tp = t < T45[0] ? 1 + .35 * pulse(t, 6) : 1;
  HOOK_X.forEach((x, j) => tapeMark(x, FLOOR + 24, 21 * (j === 2 ? tp : 1), j === 2 ? (onO ? PAL.paper : PAL.orange) : ink, 50 + j * 3, j === 2 ? 1 : .55));
  // LAN
  const P = poseTrack(t, LAN_HOOK, .2);
  const f = figure(CX, FLOOR, 44, P, lanO({ face: t > DROP ? 'happy' : 'smile' }));
  // the pull on 拉 reads: streaks trail the yanked fist, the feet stomp
  const yk = 1 - ramp(t, T45[1] + .05, .35);
  if (t > T45[1] - .03 && t < T45[2]) { handStreaks(f.handR[0], f.handR[1], 150, 1, yk, ink, 6, 44); stomp(CX, FLOOR, 44, stompAt(t, T45[1]), ink, 61); }
  // the crew whips in onto their marks on the drop
  if (t > DROP - .01) {
    [0, 1, 3, 4].forEach(j => {
      const who = CREW[j], dir = j < 2 ? 1 : -1, k = E.out5((t - DROP + .01) / .3);
      const x = lerp(HOOK_X[j] - dir * 1300, HOOK_X[j], k);
      streaks(x, FLOOR, 38, dir, 1 - ramp(t, DROP + .12, .25), ink, j * 9);
      figure(x, FLOOR, 38, poseTrack(t, crewDrop(j), .2), { who, seed: j * 3 + 1, face: 'dot' });
    });
    HOOK_X.forEach((x, j) => stomp(x, FLOOR, 38, Math.exp(-(t - DROP - .2) * 5) * (t > DROP + .2 ? 1 : 0), ink, 70 + j));
    const ek = ramp(t, DROP, .25);      // 位 gets emphasis ticks
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .42, r0 = GS * .66, r1 = r0 + 34 * E.out5(ek); if (ek > 0) inkStroke([[gx(4) + Math.cos(a) * r0, GY + Math.sin(a) * r0], [gx(4) + Math.cos(a) * r1, GY + Math.sin(a) * r1]], { w: 5, seed: 90 + i, col: ink, a: 1 - ramp(t, DROP + .4, .3) }); }
  }
  camEnd();
  corners(t, { tl: false, br: '46 / 46  ·  FINAL HOOK' });
}

// =====================================================================================================================
// DANCE BREAK · 140.645 – 152.235 · 2-beat cuts, a camera punch on every beat
// =====================================================================================================================
// D1 · 140.645 – 142.008 · LOW-HERO WIDE: big formation, a hit on every 8th (yank / cross / jump / land), line → V on the
// second beat; a giant 拉 glides in behind and gets its orange hatch on the jump
function shotWide(t, lt, dur) {
  paperBG();
  punchCam(t, 1, CX, CY + 20, 1);
  const gk = E.soft((t - b(206) + .3) / 1.4), gx0 = CX + 40 + (1 - gk) * 1500;      // already gliding in on the cut
  text('拉', gx0, 830, { size: 900, font: F.heavy, weight: 900, col: PAL.paper2, align: 'center' });
  const hk = ramp(t, b(207) - .02, .1);
  if (hk > 0) {
    X.save(); X.beginPath(); X.rect(gx0 - 540, -100, 1080 * E.out5(hk), H + 200); X.clip();
    X.fillStyle = hatchPat(PAL.orange, 18, 3.5); X.font = `900 900px ${F.heavy}`; X.textAlign = 'center'; X.fillText('拉', gx0, 830); X.restore();
  }
  const fl = 1010, t0 = b(206), vk = E.soft((t - b(207) + .02) / .7);
  handLine(-60, fl, W + 60, fl, { w: 4, seed: 402 });
  X.save(); X.globalAlpha *= .05; rect(-100, fl, W + 200, H, PAL.ink); X.restore();
  // yank on the cut, cross on the 8th, jump on the beat, land (+.3 s) and reach again
  const keys = [[0, DP.reach], ...seqKeys(t0, E8, [DP.yank, DP.cross, DP.jump]), [t0 + 2 * E8 + .3, DP.land], [t0 + 2 * E8 + .44, DP.reach]];
  const order = [0, 4, 1, 3, 2];      // outer first (drawn behind), LAN last
  for (const i of order) {
    const who = CREW[i], k = i - 2, lead = who === 'lan', d = .03 * Math.abs(k);
    let P = poseTrack(t - d, keys, .14); if (k < 0) P = mirrorPose(P);
    const x = CX + k * (340 - 50 * vk), y = fl - Math.abs(k) * 70 * vk, s = (lead ? 58 : 50) * (1 - .1 * Math.abs(k) * vk);
    tapeMark(x, y + 26, 20, lead ? PAL.orange : PAL.ink, 60 + i, lead ? 1 : .5);
    haloFig(x, y, s, P, { who, seed: i * 3 + 1, face: lead ? 'smile' : 'dot', blush: lead ? 1 : 0 });
    stomp(x, y, s, Math.max(stompAt(t - d, t0), stompAt(t - d, t0 + 2 * E8 + .3)), PAL.ink, 80 + i);
    const jl = ramp(t - d, t0 + 2 * E8, .1) * (1 - ramp(t - d, t0 + 2 * E8 + .22, .08));
    for (let m = 0; m < 3; m++) line(x - 26 + m * 26, y - 40, x - 26 + m * 26, y + 60, 3, PAL.ink, .45 * jl);
  }
  camEnd();
  corners(t, { tl: 'DANCE BREAK  ·  拉', br: '▶ 01' });
}

// D2 · 142.008 – 143.372 · EXPLODED VIEW (a new angle: from the right, no carcass): on the beat the dish basket bursts into its
// parts along dashed exploded-drawing guides, labelled; on the next beat it pulls back together (soft-close curve) — 到位
function explodedPrims(e) {
  const w = 560, d = 440, h = 150, y0 = 60, x0 = -w / 2, P = [];
  P.push(...translate3(basketModel({ w, d, h, type: 'dish' }), [0, y0, 0]));
  P.push(...slideModel(-w / 2 - 14 - 230 * e, y0 + h * .55, d, 0), ...slideModel(w / 2 + 14 + 230 * e, y0 + h * .55, d, 0));
  for (let i = 0; i < 7; i++) P.push(lathe([x0 + 40 + w * .24, y0 + 136 + 330 * e, 70 + i * 30 * (1 + 1.3 * e) + 40 * e], PROF.plate, { axis: 'z', fill: i % 3 === 1 ? PAL.paper2 : PAL.paper }));
  for (let i = 0; i < 3; i++) P.push(lathe([x0 + w * .78, y0 + 6 + i * 20 + (220 + i * 70) * e, d * .3], PROF.bowl, { open: i === 2 }));
  P.push(lathe([x0 + w * .78, y0 + 6 + 160 * e, d * .72 + 40 * e], PROF.cup, { open: true }), lathe([x0 + w * .64, y0 + 6 + 120 * e, d * .74 + 40 * e], PROF.cup, { open: true }));
  P.push(...doorModel(-w / 2 - 36, y0 - 50, w / 2 + 36, y0 + h + 120, d + 20 + 420 * e));
  return P;
}
function shotExploded(t, lt, dur) {
  paperBG();
  dotGrid(24, 24, W, H, 48, 1.5, PAL.ink, .1);
  const e = E.out5((t - b(208) + .02) / .32) * (1 - E.soft((t - b(209) + .02) / .75));
  punchCam(t, .8, CX, CY, 1);
  const C = frameCam([0, 250, 380], lerp(.95, .7, E.io(lt / (dur + .3))), .36, CX + 40, 600, 1250, 1180, { fov: 28 });
  // exploded-drawing guides
  const g = (a, c) => { const p = pin(C, a), q = pin(C, c); X.save(); X.setLineDash([7, 9]); X.strokeStyle = PAL.ink2; X.globalAlpha *= .55 * clamp(e * 3); X.lineWidth = 2; X.beginPath(); X.moveTo(p[0], p[1]); X.lineTo(q[0], q[1]); X.stroke(); X.restore(); };
  if (e > .02) { g([0, 190, 460], [0, 190, 460 + 420 * e]); g([-294, 142, 220], [-294 - 230 * e, 142, 220]); g([294, 142, 220], [294 + 230 * e, 142, 220]); g([-146, 196, 160], [-146, 196 + 330 * e, 160]); g([158, 60, 130], [158, 60 + 290 * e, 130]); }
  render3(explodedPrims(e), C, { style: 'steel', shine: lerp(-500, 500, ramp(t, b(208), .9)) });
  const lk = ramp(t, b(208) + .18, .3) * (1 - ramp(t, b(209) - .05, .15));
  if (lk > 0) {
    const [a1, a2] = pin(C, [-280, 210, 20]); callout(a1, a2, 330, 330, '碗碟拉篮', { k: lk, size: 26, dir: -1 });
    const [b1, b2] = pin(C, [294 + 230 * e, 142, 380]); callout(b1, b2, 1640, 880, '阻尼缓冲 · 滑轨', { k: lk, size: 26 });
    const [c1, c2] = pin(C, [316, 330, 460 + 420 * e]); callout(c1, c2, 1600, 230, '全拉出', { k: lk, size: 26 });
  }
  mono('EXPLODED VIEW  ·  碗碟拉篮', 64, 100, { weight: 500 });
  text('HIGOLD 悍高', 64, 70, { size: 22, font: F.sans, weight: 700, track: 2, a: .85 });
  mono(tc(t), W - 64, 70, { align: 'right', size: 20, track: 0 });
}

// D3 · 143.372 – 144.735 · 3-UP member cams: panels drop in on the cut, hits on every 8th; on the next beat the side panels
// pull out like drawers to the other two members (LAN holds the centre)
const MEMBER = { pony: ['PONY', '01'], buns: ['BUNS', '02'], lan: ['LAN 小篮', '03'], long: ['LONG', '04'], kit: ['KIT', '05'] };
function panelDancer(who, x, t, side) {
  const t0 = b(210), lead = who === 'lan';
  const seq = lead ? [DP.yank, DP.reach, DP.flex, DP.up] : [DP.cross, DP.up, DP.jump, DP.point];
  let P = poseTrack(t, [[0, lead ? DP.reach : DP.step], ...seqKeys(t0, E8, seq), ...(lead ? [] : [[t0 + 2 * E8 + .28, DP.land], [t0 + 2 * E8 + .4, DP.point]])], .14);
  if (side > 0) P = mirrorPose(P);
  figure(x, 1110, 78, P, { who, seed: 11 + who.length, face: lead ? 'smile' : 'dot', blush: lead ? 1 : 0 });
}
function shotSplit(t, lt) {
  paperBG(PAL.ink);
  punchCam(t, .6, CX, CY, 1.02);
  const g = 14, pw = (W - 2 * g) / 3, t0 = b(210), t1 = b(211);
  for (let i = 0; i < 3; i++) {
    const x0 = i * (pw + g), bg = i === 1 ? PAL.paper : PAL.paper2;
    const first = ['pony', 'lan', 'kit'][i], second = ['buns', 'lan', 'long'][i];
    X.save(); X.beginPath(); X.rect(x0, -40, pw, H + 80); X.clip();
    const layer = (who, off) => {
      X.save(); X.translate(0, off);
      rect(x0, -40, pw, H + 80, bg);
      if (who !== 'lan') dotGrid(x0 + 20, 20, pw, H, 44, 1.4, PAL.ink, .1);
      else { const hx = x0 + pw / 2, hy = 330, r = 330 * (1 + .08 * pulse(t, 6)); halftone(hx - r, hy - r, 2 * r, 2 * r, (x, y) => { const d = dist(x, y, hx, hy) / r; return d > 1 ? 0 : (1 - d) * 1.1; }, { col: PAL.orange, gap: 18, a: .85 }); }
      panelDancer(who, x0 + pw / 2, t, i === 0 ? -1 : i === 2 ? 1 : 0);
      // opaque lower-third with an ink rule
      const [nm, no] = MEMBER[who];
      rect(x0, H - 118, pw, 160, bg); rect(x0, H - 121, pw, 3, PAL.ink);
      text(nm, x0 + 34, H - 62, { size: 40, font: who === 'lan' ? F.sans : F.grotesk, weight: 700, track: 2 });
      mono(no + ' / 05', x0 + 36, H - 30, { a: .8, size: 17 });
      if (who === 'lan') circle(x0 + pw - 44, H - 76, 9, { fill: PAL.orange });
      X.restore();
      if (who === 'lan') { X.save(); X.strokeStyle = PAL.orange; X.lineWidth = 8; X.strokeRect(x0 + 4, 4, pw - 8, H - 8); X.restore(); }
    };
    const k0 = E.out5((t - t0 + .06) / .34), dir = i % 2 ? 1 : -1;
    const k1 = i === 1 ? 0 : E.soft((t - t1 + .03 - (i ? Q * .5 : 0)) / .45);
    layer(first, (1 - k0) * 160 * dir - k1 * H * dir);
    if (k1 > 0) { layer(second, (1 - k1) * H * dir); rect(x0, (1 - k1) * H * dir + (dir > 0 ? -12 : H), pw, 12, PAL.ink); }
    X.restore();
  }
  camEnd();
}

// D4 · 144.735 – 146.099 · CLOSE-UP, centre cam: reach → yank (the pull) → a clean point with star eyes, arm clear of the head
function shotClose(t, lt, dur) {
  paperBG();
  punchCam(t, 1, CX, CY, 1 + .04 * E.io(lt / dur));
  const hx = CX - 20, hy = 360, r = 470 * (1 + .06 * pulse(t, 6));
  halftone(hx - r, hy - r, 2 * r, 2 * r, (x, y) => { const d = dist(x, y, hx, hy) / r; return d > 1 ? 0 : (1 - d) * 1.15; }, { col: PAL.orange, gap: 20, a: .85 });
  speedLines(hx, hy + 60, 560, 1500, 38, { col: PAL.ink, a: .2, w: 8, seed: Math.floor(bp(t) * 2) * 7 });
  const t0 = b(212), POINT = pose({ ...KP.point, sR: 2.72, eR: .05, lean: -.08, head: .12 });
  const P = poseTrack(t, [[0, KP.reach], [t0 + E8 - .03, DP.flex], [t0 + BEAT - .03, POINT], [t0 + BEAT + .4, tt => ({ ...POINT, head: .12 + .05 * Math.sin(tt * 8) })]], .14);
  const star = t > t0 + BEAT - .03;
  const f = figure(CX, 1245, 92, P, lanO({ face: star ? 'star' : 'smile' }));
  if (t > t0 + E8 - .03 && !star) handStreaks(f.handR[0], f.handR[1], 190, 1, 1 - ramp(t, t0 + E8, .3), PAL.ink, 10, 44);
  if (star) {
    const k = ramp(t, t0 + BEAT, .3);
    sparkle(f.handR[0] + 60, f.handR[1] - 60, 70, { k: E.back(k), col: PAL.ink });
    sparkle(f.head[0] - f.head[2] * 1.6, f.head[1] - f.head[2] * .4, 38, { k: E.back(ramp(t, t0 + BEAT + .08, .3)), col: PAL.orange });
  }
  camEnd();
  const k = E.soft((t - t0) / .8);      // centre-cam tag slides out like a drawer
  X.save(); X.beginPath(); X.rect(64, H - 120, 460, 80); X.clip(); X.translate(-(1 - k) * 470, 0);
  rect(64, H - 112, 420, 64, PAL.ink); circle(98, H - 80, 11, { fill: PAL.orange, a: Math.floor(t * 3) % 2 ? .35 : 1 });
  text('LAN 小篮 · CENTER CAM', 124, H - 70, { size: 26, font: F.sans, weight: 700, col: PAL.paper, track: 1 });
  X.restore();
  mono(tc(t), W - 64, 70, { align: 'right', size: 20, track: 0 });
}

// D5 · 146.099 – 147.463 · 9-GRID MOSAIC: dancers on the diagonals, product on the cross. Every 8th each dancer cell hits a new
// pose, staggered outward from the centre like a wave; the centre cell flips to orange on the second beat
const RING9 = [2, 1, 2, 1, 0, 1, 2, 1, 2];     // centre, cross, corners
const CELL_SEQ = [[DP.yank, DP.cross, DP.up, DP.reach, DP.point], [DP.cross, DP.up, DP.jump, DP.point, DP.yank], [DP.up, DP.reach, DP.yank, DP.cross, DP.star]];
function cellDancer(t, i, who, o = {}) {
  const t0 = b(214), wave = RING9[i] * Q * .5, seq = CELL_SEQ[i % 3];
  let P = poseTrack(t - wave, [[0, DP.step], ...seqKeys(t0, E8, seq)], .13);
  if (o.flip) P = mirrorPose(P);
  const bgc = o.bg ?? PAL.paper, dark = bgc === PAL.night, col = dark ? PAL.paper : PAL.ink;
  paperBG(bgc);
  handLine(60, 990, W - 60, 990, { w: 8, col, seed: 17 + who.length });
  figure(CX, 990, 84, P, { who, col, dark, w: .24, face: who === 'lan' ? (t > b(215) ? 'star' : 'smile') : 'dot', blush: who === 'lan' ? 1 : 0, seed: 21 + who.length });
}
function cellProduct(t, kind) {
  paperBG(PAL.paper2);
  const t0 = b(214), ek = E.soft((t - b(215) + .02) / 1.1), ext = 60 + 320 * ek;
  if (kind === 'dish') {
    const C = frameCam([0, 110, 300 + ext * .5], -.75 + (t - t0) * .22, .5, CX, 560, 820, 1500, { fov: 28 });
    render3(dishDrawer(ext, { front: false }), C, { style: 'steel', lw: 2, shine: lerp(-500, 500, ek) });
  } else if (kind === 'pantry') {    // tall pantry unit: stacked tiers, each one sliding out in turn
    const C = frameCam([0, 420, 260], .75 - (t - t0) * .2, .28, CX, 580, 1300, 1150, { fov: 28 });
    const P = [];
    for (let i = 0; i < 4; i++) {
      const e = 260 * E.soft((t - b(215) + .02 - i * Q * .5) / 1);
      P.push(...translate3(basketModel({ w: 420, d: 380, h: 120, type: 'plain', gap: 28, midRim: false, rimR: 18 }), [0, i * 250, e]));
      P.push(lathe([-110, i * 250 + 4, 120 + e], PROF.jar), lathe([0, i * 250 + 4, 250 + e], PROF.jar), lathe([110, i * 250 + 4, 150 + e], i % 2 ? PROF.cup : PROF.jar));
    }
    render3(P, C, { style: 'steel', lw: 1.8 });
  } else if (kind === 'top') {
    const r = (t - t0) * .25 + .3;
    const C = camera3({ eye: [0, 1500, 220], at: [0, 60, 220], up: [Math.sin(r), 0, -Math.cos(r)], fov: 34 });
    render3(dishDrawer(0, { front: false, slides: false }), C, { style: 'ink', lw: 2.2 });
  } else {        // a stack of bowls + cups: what the dish basket holds
    const C = frameCam([0, 80, 0], .3 + (t - t0) * .3, .45, CX, 540, 420, 1050, { fov: 28 });
    const P = [];
    for (let i = 0; i < 4; i++) P.push(lathe([-90, i * 22 + 40 * pulse(t, 7) * i, 0], PROF.bowl, { open: i === 3, fill: i % 2 ? PAL.paper2 : PAL.paper }));
    P.push(lathe([120, 0, -40], PROF.cup, { open: true })); P.push(lathe([110, 0, 90], PROF.cup, { open: true }));
    render3(P, C, { lw: 2.2 });
    sparkle(CX - 260, 300, 80, { k: pulse(t, 5), col: PAL.ink });
  }
}
const GRID9 = [
  t => cellDancer(t, 0, 'pony'),
  t => cellProduct(t, 'dish'),
  t => cellDancer(t, 2, 'buns', { flip: true }),
  t => cellProduct(t, 'top'),
  t => cellDancer(t, 4, 'lan', { bg: t > b(215) - .02 ? PAL.orange : PAL.night }),
  t => cellProduct(t, 'pantry'),
  t => cellDancer(t, 6, 'long'),
  t => cellProduct(t, 'bowls'),
  t => cellDancer(t, 8, 'kit', { flip: true }),
];
function shotGrid(t, lt) {
  paperBG(PAL.paper2);
  punchCam(t, .7, CX, CY, 1.02);
  const g = 10, cw = (W - 2 * g) / 3, ch = (H - 2 * g) / 3;
  for (let i = 0; i < 9; i++) {
    const c = i % 3, r = Math.floor(i / 3), x0 = c * (cw + g), y0 = r * (ch + g);
    const k = E.out5((t - b(214) - RING9[i] * Q * .35 + .12) / .2); if (k <= 0) continue;   // centre + cross already in on the beat
    const s = lerp(.6, 1, k);
    X.save(); X.beginPath(); X.rect(x0 + cw / 2 - cw / 2 * s, y0 + ch / 2 - ch / 2 * s, cw * s, ch * s); X.clip();
    X.translate(x0, y0); X.scale(cw / W, ch / H);
    GRID9[i](t);
    X.restore();
  }
  rect(cw, -40, g, H + 80, PAL.ink); rect(2 * cw + g, -40, g, H + 80, PAL.ink); rect(-40, ch, W + 80, g, PAL.ink); rect(-40, 2 * ch + g, W + 80, g, PAL.ink);
  X.save(); X.strokeStyle = t > b(215) - .02 ? PAL.ink : PAL.orange; X.lineWidth = 8; X.strokeRect(cw + g + 4, ch + g + 4, cw - 8, ch - 8); X.restore();
  for (let i = 0; i < 9; i++) { const c = i % 3, r = Math.floor(i / 3); mono('CAM ' + (i + 1), c * (cw + g) + 22, r * (ch + g) + 36, { size: 15, col: i === 4 && t < b(215) - .02 ? PAL.paper : PAL.ink, a: .6 }); }
  camEnd();
}

// ---------- the night block (147.463 – 152.235): one continuous dark stretch, released by the paper end card ----------
// D6 · 147.463 – 148.826 · OVERHEAD KALEIDOSCOPE: the crew stands inside a giant wire basket, looking up into the lens; the ring
// turns an eighth of a circle on every beat and all arms open / close in unison on the 8ths
const KALEIDO = [
  { l: [0, 0, 1, 1], r: [0, 0, 1, 1] },                      // open: arms out sideways, hands meet the neighbours'
  { l: [1.05, .15, .85, .85], r: [1.05, .15, .85, .85] },    // up: raised toward the lens → petals past the head
  { l: [-1.15, -.1, 1, 1], r: [-1.15, -.1, 1, 1] },          // in: reach to the centre
  { l: [.35, 1.7, .9, .8], r: [.35, 1.7, .9, .8] },          // closed: hands to the head (the bud)
];
function kaleidoArms(t) {
  const n = Math.floor(bp(t) * 2), k = E.out5(frac(bp(t) * 2) / .4), A = KALEIDO[(n + 4) % 4], B = KALEIDO[(n + 3) % 4];
  const L = (p, q) => p.map((v, i) => lerp(v, q[i], k));
  return { l: L(B.l, A.l), r: L(B.r, A.r) };
}
function shotOverhead(t, lt, dur) {
  paperBG(PAL.night); DARK = true;
  const z = lerp(1.08, .98, E.soft(lt / (dur + .2))) + .04 * pulse(t, 8);
  X.save(); X.translate(CX, CY); X.rotate(lt * .08 - .06); X.scale(z, z); X.translate(-CX, -CY);
  const gr = X.createRadialGradient(CX, CY, 60, CX, CY, 760); gr.addColorStop(0, rgba(PAL.paper, .1)); gr.addColorStop(1, rgba(PAL.paper, 0));
  X.fillStyle = gr; X.fillRect(-600, -600, W + 1200, H + 1200);
  const C = camera3({ eye: [0, 1300, 220], at: [0, 60, 220], up: [0, 0, -1], fov: 32 });
  render3(basketModel({ w: 560, d: 440, h: 150, type: 'plain', gap: 32 }), C, { style: 'ink', inkCol: PAL.steel1, lw: .55, a: .5 });
  const n = beatN(t), spin = (n - 216) * Math.PI / 4 + E.out5(sinceBeat(t) / BEAT / .35) * Math.PI / 4;
  const pk = pulse(t, 5); handCircle(CX, CY, 130 + 70 * (1 - pk), { w: 6, col: PAL.orange, seed: 9, a: pk });
  const A = kaleidoArms(t), Rf = 245, lean = 96;
  ['pony', 'buns', 'long', 'kit'].forEach((who, i) => {
    const a = spin + i * Math.PI / 2 + Math.PI / 4, c = Math.cos(a), sn = Math.sin(a);
    topFig(CX + c * Rf, CY + sn * Rf, c * lean, sn * lean, 44, A, who, { seed: 30 + i * 7, step: Math.sin(bp(t) * Math.PI) * .6, swing: Math.sin(t * 5 + i) });
  });
  const la = -spin * .5 - Math.PI / 2;
  topFig(CX, CY + 30, Math.cos(la) * 20, Math.sin(la) * 20, 50, A, 'lan', { seed: 7, step: Math.sin(bp(t) * Math.PI) * .6 });
  X.restore();
  corners(t, { col: PAL.paper, tl: 'DANCE BREAK  ·  TOP CAM', br: '▶ 06' });
}

// D7 · 148.826 – 150.190 · THE ARMY: LAN and the crew in a flying V on the night stage, rows of mini-crews to the horizon; the
// rows rise out of the floor on 16ths, then every point-hit ripples back from the front row on the beat
function shotArmy(t, lt, dur) {
  paperBG(PAL.night); DARK = true;
  punchCam(t, 1, CX, CY, 1 + .05 * E.io(lt / (dur + .3)));
  const vp = [CX, 330], fy = 1060, t0 = b(218);
  X.save(); X.globalAlpha *= .45;
  for (let i = -12; i <= 12; i++) handLine(vp[0] + i * 12, vp[1], vp[0] + i * 260, H + 60, { w: 1.4, seed: 300 + i, col: PAL.steel1 });
  for (let d = 1.3; d < 12; d *= 1.35) { const y = vp[1] + (fy - vp[1]) / d; line(-40, y, W + 40, y, 1.2, PAL.steel1, .6); }
  X.restore();
  const sp = X.createRadialGradient(CX, 820, 40, CX, 820, 700); sp.addColorStop(0, rgba(PAL.paper, .1)); sp.addColorStop(1, rgba(PAL.paper, 0)); X.fillStyle = sp; X.fillRect(0, 0, W, H);
  const hitKeys = d => [[0, DP.step], ...seqKeys(t0 + d, E8, [DP.point, DP.yank, DP.up, DP.cross])];
  // the army, back rows first
  const rows = [[8.5, 21], [6.2, 17], [4.6, 15], [3.4, 13], [2.5, 11], [1.85, 9]];
  rows.forEach(([d, n], ri) => {
    const rise = E.out5((t - t0 + .1 - (rows.length - 1 - ri) * Q * .35) / .25); if (rise <= 0) return;
    const y = vp[1] + (fy - vp[1]) / d + (1 - rise) * 60 / d, s = 50 / d * .9, spc = 300 / d;
    for (let j = 0; j < n; j++) {
      const k = j - (n - 1) / 2, x = vp[0] + k * spc; if (Math.abs(k) < 1.2 && d < 3) continue;   // keep a lane behind LAN
      let P = poseTrack(t - d * .03, hitKeys(0), .14); if (k < 0) P = mirrorPose(P);
      figure(x, y, s, P, { who: CREW[(j + ri) % 5], col: PAL.paper, dark: true, seed: j * 7 + ri, face: 'dot', shadow: false, w: .24, a: .45 + .55 / Math.sqrt(d) });
    }
  });
  // the crew in a flying V, LAN at the point
  const V = [[-2, 690, 44], [2, 690, 44], [-1, 820, 50], [1, 820, 50], [0, 980, 58]], who = ['pony', 'kit', 'buns', 'long', 'lan'];
  V.forEach(([k, y, s], i) => {
    const gk = E.soft((t - t0 + .06 - Math.abs(k) * .05) / .7), x = CX + k * 330 * lerp(.7, 1, gk);
    let P = poseTrack(t - Math.abs(k) * .03, hitKeys(0), .14); if (k < 0) P = mirrorPose(P);
    haloFig(x, y, s, P, { who: who[i], col: PAL.paper, dark: true, halo: PAL.night, seed: i * 3 + 1, face: who[i] === 'lan' ? 'happy' : 'dot', blush: who[i] === 'lan' ? 1 : 0 });
  });
  sparkle(vp[0], vp[1] - 40, 60, { k: E.back(ramp(t, t0 + .05, .3)) * (.6 + .4 * pulse(t, 4)), col: PAL.orange });
  camEnd();
  corners(t, { col: PAL.paper, tl: 'DANCE BREAK  ·  拉', br: '▶ 07' });
}

// D8 · 150.190 – 151.554 · FACE LINE-UP: five faces rise into frame on 16ths (paper "sticker" figures on night), frame their
// faces, then a big arm-heart with star eyes on the next beat
function shotFaces(t, lt, dur) {
  paperBG(PAL.night); DARK = true;
  punchCam(t, 1, CX, CY, 1);
  const t0 = b(220), who = ['pony', 'buns', 'lan', 'long', 'kit'];
  const sp = X.createRadialGradient(CX, 520, 60, CX, 520, 900); sp.addColorStop(0, rgba(PAL.paper, .08)); sp.addColorStop(1, rgba(PAL.paper, 0)); X.fillStyle = sp; X.fillRect(0, 0, W, H);
  who.forEach((w, i) => {
    const k = i - 2, rise = E.out5((t - t0 + .12 - Math.abs(k) * Q * .5) / .28), lead = w === 'lan';
    const x = CX + k * 355, y = 1480 + (1 - rise) * 420 - (lead ? 30 : 0);
    const P = poseTrack(t - Math.abs(k) * .03, [[0, DP.frame], [t0 + E8 - .02, pose({ ...DP.frame, head: .25, lean: .06 })], [t0 + BEAT - .02, DP.heart], [t0 + BEAT + E8 - .02, pose({ ...DP.heart, head: -.2, dy: .15 })]], .14);
    haloFig(x, y, lead ? 98 : 88, k < 0 ? mirrorPose(P) : P, { who: w, col: PAL.ink, halo: PAL.paper, fill: PAL.paper, seed: i * 3 + 1, face: t > t0 + BEAT - .02 ? 'star' : (lead ? 'smile' : 'dot'), blush: 1, shadow: false, w: .2 });
  });
  const sk = ramp(t, t0 + BEAT, .3);
  [[CX - 180, 170, 46], [CX + 540, 210, 34], [CX - 620, 250, 30], [CX + 200, 120, 26]].forEach(([x, y, r], i) => sparkle(x, y, r, { k: E.back(clamp(sk * 1.3 - i * .1)), col: i === 0 ? PAL.orange : PAL.paper }));
  camEnd();
  corners(t, { col: PAL.paper, tl: 'DANCE BREAK  ·  拉', br: '▶ 08' });
}

// D9 · 151.554 – 152.235 · JUMP (1 beat): star jumps under stage beams, hang time, the last loud hit
function shotJump(t, lt) {
  paperBG(PAL.night); DARK = true;
  punchCam(t, .8, CX, CY, 1);
  const t0 = b(222), u = t - t0;
  const lift = u < .08 ? 0 : Math.sin(clamp((u - .08) / .8) * Math.PI) ** .55;
  const fl = 940;
  for (let i = 0; i < 5; i++) {
    const x = CX + (i - 2) * 360, a = .05 + .04 * (i === 2 ? 1 : 0);
    X.save(); const gr = X.createLinearGradient(0, 0, 0, fl); gr.addColorStop(0, rgba(PAL.paper, a * 2)); gr.addColorStop(1, rgba(PAL.paper, 0));
    X.fillStyle = gr; X.beginPath(); X.moveTo(x - 30, -40); X.lineTo(x + 30, -40); X.lineTo(x + 160, fl); X.lineTo(x - 160, fl); X.closePath(); X.fill(); X.restore();
  }
  handLine(-40, fl, W + 40, fl, { w: 3, col: PAL.steel2, seed: 406 });
  CREW.forEach((who, i) => {
    const x = CX + (i - 2) * 360, s = who === 'lan' ? 40 : 35;
    const P = poseTrack(t, [[0, DP.land], [t0 + .08, DP.star]], .16);
    const y = fl - lift * (200 + (i === 2 ? 40 : 0));
    X.save(); X.globalAlpha *= .3; X.fillStyle = PAL.paper; X.beginPath(); X.ellipse(x, fl + 6, 2.3 * s * (1 - lift * .55), .28 * s, 0, 0, TAU); X.fill(); X.restore();
    figure(x, y, s, P, { who, col: PAL.paper, dark: true, seed: i * 3 + 1, face: who === 'lan' ? 'happy' : 'closed', blush: who === 'lan' ? 1 : 0, shadow: false });
  });
  const sk = ramp(t, t0 + .2, .25);
  [[CX - 180, 300, 44], [CX + 190, 270, 32], [CX + 560, 330, 24], [CX - 590, 350, 28]].forEach(([x, y, r], i) => sparkle(x, y, r, { k: E.back(clamp(sk * 1.3 - i * .1)), col: i === 0 ? PAL.orange : PAL.paper }));
  camEnd();
  corners(t, { col: PAL.paper, tl: 'DANCE BREAK  ·  拉', br: '▶ 09' });
}

// =====================================================================================================================
// END CARD · 152.235 – 156.6 · paper. HIGOLD 悍高 + 厨房拉篮 · 一拉就到位. The basket glides shut on the last note, 嗒.
// =====================================================================================================================
function shotEnd(t, lt) {
  paperBG();
  const t0 = b(223), close = E.soft((t - LAST) / 1.2), ext = 400 * (1 - close);
  const settle = ramp(t, LAST + 1, 1);
  const yaw = lerp(-.82, -.66, E.io(ramp(t, t0, 3.4))) + .005 * Math.sin(t * .9) * settle;
  const C = cabinetShot(ext, { yaw, pitch: .4, at: [0, 210, 380], sx: 1250, sy: 590, span: 760, px: 650, shadow: true, shine: lerp(-600, 600, ramp(t, t0 + .1, 1.6)) });
  counterCrew(C, t, (i) => poseTrack(t, [[0, tt => move('wave', tt, i)], [LAST + .1 + Math.abs(i - 2) * .07, tt => move('idle', tt, i)]], .35), { mm: 15, z: 400 });
  // 嗒: the damper seats the front — in clear paper right of the drawer, with burst ticks
  const DA = LAST + .52, dk = ramp(t, DA, .3);
  if (dk > 0) {
    const [dx, dy] = pin(C, [316, 190, 470]), x = dx + 170, y = dy - 10, sc = E.back(dk);
    marker('嗒', x, y, { size: 160, col: PAL.orange, align: 'center', rot: -.1, sx: sc, sy: sc, a: clamp(dk * 2) });
    const tk = E.out5(ramp(t, DA, .25)), ta = 1 - ramp(t, DA + .9, .6);
    if (ta > 0) for (let i = 0; i < 7; i++) { const a = -Math.PI * .95 + i * .36, r0 = 105, r1 = r0 + 38 * tk; inkStroke([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: 5, seed: 120 + i, a: ta * tk }); }
  }
  // lockup
  const x0 = 150;
  typeDrawer('HIGOLD', x0, 430, t0, t, { size: 200, font: F.anton, weight: 400, col: PAL.ink, track: 6, dur: 1.1 });
  typeDrawer('悍高', x0, 622, t0 + E8, t, { size: 158, font: F.heavy, weight: 900, col: PAL.ink, track: 8, dur: 1.1 });
  const rk = E.soft((t - b(224)) / 1.1);
  if (rk > 0) { line(x0, 684, x0 + 600 * rk, 684, 3, PAL.ink); rect(x0, 678, 120 * rk, 12, PAL.orange); }
  typeDrawer('厨房拉篮 · 一拉就到位', x0, 782, b(224) + E8, t, { size: 64, font: F.smiley, weight: 400, col: PAL.ink, track: 2, dur: 1.1 });
  const ck = ramp(t, LAST + .2, .6);
  if (ck > 0) {
    const cr = 'animated in code, frame by frame';
    mono(cr, x0, H - 92, { size: 30, a: ck * .9, weight: 500, track: 1 });
    if (Math.floor(t * 1.6) % 2 === 0 && t > LAST + .8) rect(x0 + measure(cr, 30, F.mono, 500, 1) + 10, H - 118, 16, 34, PAL.ink, .75);
  }
  mono(tc(t), W - 64, 70, { align: 'right', size: 20, track: 0, a: .7 });
  mono('一拉就到位  ·  M/V', 64, 70, { size: 18, a: .7, font: F.sans, weight: 600 });
}

chapter('outro', 135.9, 156.6, [
  [135.9, shotHook],
  [b(206), shotWide],
  [b(208), shotExploded],
  [b(210), shotSplit],
  [b(212), shotClose],
  [b(214), shotGrid],
  [b(216), shotOverhead],
  [b(218), shotArmy],
  [b(220), shotFaces],
  [b(222), shotJump],
  [b(223), shotEnd],
]);
})();
