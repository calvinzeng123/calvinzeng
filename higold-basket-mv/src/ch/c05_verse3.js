// c05_verse3.js — Verse 3 · "The product family / retirement party" (73.0 – 95.4) · museum white, editorial.
// 73–88 s plays at full volume: three white-cube exhibits, each with its own composition and one big camera move on its key
// beat (I corner unit: a SWING around the carousel; II tall pantry: lateral pull + CRANE to the floor; III lift-down: worm's-eye
// PUSH as the basket swings toward the lens), each with one bar-cut to a closer angle. The tiny crew (B-mode scale) rides the
// product. Then LAN meets the lift basket, and only at 88 s (where the music dips) the calm museum "retirement" of 蹲下翻找.
(() => {
'use strict';

// ======================================================================================================
// shared helpers
// ======================================================================================================
const cen3 = p => { if (p.at) return p.at; const n = p.pts.length; let x = 0, y = 0, z = 0; for (const q of p.pts) { x += q[0]; y += q[1]; z += q[2]; } return [x / n, y / n, z / n]; };
const P2 = (C, p) => { const q = C.project(p); return [q[0], q[1]]; };
const lsc = (prof, k) => prof.map(([r, y]) => [r * k, y * k]);
const wire = (pts, r = 6) => chop(pts).map(c => ({ k: 'wire', pts: c, r, tone: 0 }));

// faces carry an outward normal n so a stage can split them into "seen from inside" (drawn before the contents) and
// "facing the camera" (drawn after the contents, so walls occlude what is inside them). closed = the face of a closed box
// (never seen from inside, so it is dropped when it faces away).
function faceN(pts, n, o = {}) {
  return { k: 'face', pts, n, fill: o.fill === undefined ? PAL.paper : o.fill, inFill: o.inFill ?? PAL.paper2, ink: o.ink ?? PAL.ink, iw: o.iw ?? 2, closed: o.closed ?? true, bias: o.bias ?? 0, layer: 1 };
}
function boxN(x0, y0, z0, x1, y1, z1, sides = 'lrtbkf', o = {}) {
  const P = [], f = (pts, n) => P.push(faceN(pts, n, o));
  if (sides.includes('k')) f([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1]);
  if (sides.includes('f')) f([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1]);
  if (sides.includes('l')) f([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0]);
  if (sides.includes('r')) f([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0]);
  if (sides.includes('b')) f([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0]);
  if (sides.includes('t')) f([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0]);
  return P;
}
function panelZ(x0, y0, x1, y1, z, o = {}) { return faceN([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], [0, 0, 1], { bias: -4, iw: 1.6, ...o }); }
function panelX(z0, y0, z1, y1, x, o = {}) { return faceN([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], [1, 0, 0], { bias: -4, iw: 1.6, ...o }); }
const groove = { fill: PAL.ink2, iw: 1, bias: -6 };

// Render a cabinet scene in four passes: shell faces seen from inside → contents inside the shell → shell faces facing the
// camera → contents outside. isIn(p) says whether a content primitive's centre is inside the shell's volume.
function stage(C, shell, content, isIn, ro, hooks = {}) {
  const back = [], front = [], ins = [], outs = [];
  for (const f of shell) {
    const fr = !f.n || vdot(f.n, vsub(C.eye, cen3(f))) > 0;
    if (fr) front.push(f); else if (!f.closed) back.push(f.fill ? { ...f, fill: f.inFill } : f);
  }
  for (const p of content) (isIn(cen3(p)) ? ins : outs).push(p);
  render3(back, C, ro); if (hooks.back) hooks.back();
  render3(ins, C, ro); if (hooks.ins) hooks.ins();
  render3(front, C, ro); if (hooks.front) hooks.front();
  render3(outs, C, ro); if (hooks.out) hooks.out();
}
// world-space lines / polys projected to the screen
function wline(C, a, b, o = {}) {
  const p = P2(C, a), q = P2(C, b); X.save(); if (o.dash) X.setLineDash(o.dash);
  line(p[0], p[1], q[0], q[1], o.w ?? 1.5, o.col ?? PAL.ink, o.a ?? 1, o.cap ?? 'round'); X.restore();
}
function wpath(C, pts, o = {}) {
  if (pts.length < 2) return; const s = pts.map(p => P2(C, p));
  X.save(); X.globalAlpha *= o.a ?? 1; X.strokeStyle = o.col ?? PAL.ink; X.lineWidth = o.w ?? 2; X.lineCap = 'round'; X.lineJoin = 'round';
  if (o.dash) { X.setLineDash(o.dash); X.lineDashOffset = o.dashOff ?? 0; }
  X.beginPath(); s.forEach((q, i) => i ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1])); X.stroke(); X.restore();
  return s;
}
function wfill(C, pts, col, a) { if (a <= .003) return; fillPoly(pts.map(p => P2(C, p)), col, a); }
// small arrow head at the end of a screen polyline
function headAt(s, col, size = 16, w = 3) {
  const n = s.length; if (n < 2) return; const a = s[n - 1], b = s[Math.max(0, n - 4)], ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
  X.save(); X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath();
  X.moveTo(a[0] - Math.cos(ang - .5) * size, a[1] - Math.sin(ang - .5) * size); X.lineTo(a[0], a[1]); X.lineTo(a[0] - Math.cos(ang + .5) * size, a[1] - Math.sin(ang + .5) * size);
  X.stroke(); X.restore();
}
// ghost (dashed) outline of a box
function ghostBox(C, x0, y0, z0, x1, y1, z1, a, col = PAL.ink2) {
  if (a <= .01) return;
  const v = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
  const EG = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (const [i, j] of EG) wline(C, v[i], v[j], { w: 1.6, col, a, dash: [9, 7] });
}
// room hairlines live only on the object's side of the frame, never through the type column
function roomClip(x0, x1, fn) { X.save(); X.beginPath(); X.rect(x0, 0, x1 - x0, H); X.clip(); fn(); X.restore(); }
// camera punch: a short zoom kick that decays after a hit (multiplies the framing span)
const punch = (t, at, amt = .05) => t < at ? 1 : 1 - amt * Math.exp(-(t - at) * 7) * Math.min(1, (t - at) * 30);

// ---------- the tiny crew (B-mode scale): a cast figure standing at a 3D point, scaled from the camera ----------
function rider(C, p, who, P, o = {}) {
  const q = C.project(p); if (q[2] < 5) return null;
  const s = q[3] * (o.mm ?? 20), dark = o.dark ?? false;
  return figure(q[0], q[1], s, P, { who, face: o.face ?? (who === 'lan' ? 'happy' : 'dot'), blush: who === 'lan' ? 1 : 0, col: dark ? PAL.paper : PAL.ink,
    fill: dark ? PAL.ink : PAL.paper, dark, shadow: false, seed: o.seed ?? 5, w: o.w ?? .26, a: o.a });
}
const WHEE = pose({ ...KP.armsUp, dy: .25, hL: .3, kL: .6, hR: .3, kR: .6 });
const LOST = pose({ ...KP.shrug, head: .25 });

// ---------- editorial furniture ----------
function cropMarks(a = 1) {
  const m = 46, l = 30;
  X.save(); X.globalAlpha *= a; X.strokeStyle = PAL.ink; X.lineWidth = 1.5; X.beginPath();
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    X.moveTo(x - sx * 12, y); X.lineTo(x + sx * l, y); X.moveTo(x, y - sy * 12); X.lineTo(x, y + sy * l);
  }
  X.stroke(); X.restore();
}
// exhibit caption: slides in from the nearest frame edge like a drawer (E.soft); align 'left' | 'right'
function plate(lt, no, zh, en, o = {}) {
  const at = o.at ?? .2, k = E.soft(seg(lt, at, at + 1.1)); if (k <= 0) return;
  const right = o.align === 'right', x = right ? W - 104 : 104, y = o.y ?? 972, al = right ? 'right' : 'left';
  X.save(); X.translate((right ? 1 : -1) * (1 - k) * 1150, 0);
  line(right ? x - 440 : x, y - 64, right ? x : x + 440, y - 64, 2, PAL.ink);
  text('展品 ' + no + '  ·  ' + zh, x, y - 16, { size: 38, font: F.serif, weight: 900, align: al });
  text(en, x, y + 24, { size: 27, font: F.serifI, col: PAL.ink2, align: al });
  X.restore();
}
// big vertical serif lyric columns (150 px: reads at a 240 px thumbnail) + a hairline that slides down beside them.
// side: which side of the columns the rule sits on (the side facing the picture).
const LYS = 150, LGAP = 1.28;
function vcol(i, t, x, y, o = {}) {
  const size = o.size ?? LYS, hold = o.hold ?? .2, env = lyEnv(i, t, hold); if (env <= 0) return;
  lyVertical(i, t, { x, y, size, gap: LGAP, font: F.serif, weight: 900, hi: o.hi, hold });
  const rows = LY[i].text.split('|').length, k = E.soft(seg(t, LY[i].t[0] - .05, LY[i].t[0] + 1.1));
  const rx = o.side === 'left' ? x - (rows - 1) * size * LGAP - size * .78 : x + size * .78;
  line(rx, y + 16, rx, y + 16 + (o.rule ?? 800) * k, 2, PAL.ink, env);
  circle(rx, y + 16, 5, { fill: PAL.ink, a: env });
}
const LX = 470, RX = 1742, TY = 96;

// ======================================================================================================
// EXHIBIT I · the corner unit (73.0 – 77.235)
// I-a: an L of base cabinets, plan view tilting to 3/4; the corner countertop lifts off to reveal the blind corner as a black
// void with two trays (and four tiny crew) trapped in it. The door snaps open on 不; on 是 / 死 the trays swing out on their
// pivot post while the camera SWINGS around the corner with them. I-b (bar cut, 75.87): close and low on the carousel, the
// crew cheering; the 死角 label on the void is struck through in orange on 角 as the dark clears.
// ======================================================================================================
const KC = { d: 560, h: 780, o0: 560, o1: 1250, r2: 1250, r3: 1800 };
const trayTh = t => [-Math.PI * E.soft(seg(t, 74.46, 76.1)), -Math.PI * E.soft(seg(t, 75.14, 76.8))];
const trayC = (th, y) => { const off = rotY([-285, 0, -285], th); return [KC.o0 + off[0], y, KC.o0 + off[2]]; };
function cornerTray(y, th, kind) {
  let P = translate3(basketModel({ w: 420, d: 420, h: 62, rimR: 150, gap: 30, midRim: false, wire: 2.8, rim: 5 }), [0, 0, -210]);
  if (kind === 0) { P.push(lathe([-70, 3, -55], lsc(PROF.pot, .62), { fill: PAL.paper })); P.push(lathe([-70, 80, -55], lsc(PROF.lid, .6), { fill: PAL.paper2 })); }
  else [[-105, -70, PROF.jar, .85], [-30, -120, PROF.bottle, .7], [110, -60, PROF.jar, .85]].forEach(([x, z, pf, k], i) => P.push(lathe([x, 3, z], lsc(pf, k), { band: i % 2 === 0 })));
  const c = trayC(th, y);
  P = translate3(rotateY3(P, th), c);
  P.push(...wire([[KC.o0, y + 8, KC.o0], [c[0], y + 8, c[2]]], 7));
  return P;
}
// crew riding the trays: [tray, local x, local z, who, seed]
const CAROUSEL = [[0, 95, 80, 'pony', 1], [0, 70, -115, 'buns', 4], [1, 55, 80, 'lan', 11], [1, -110, 60, 'kit', 10]];
function carouselRiders(C, t, th, dark, pass) {
  for (const [ti, lx, lz, who, seed] of CAROUSEL) {
    const a = th[ti], c = trayC(a, ti ? 420 : 90), o = rotY([lx, 0, lz], a), p = [c[0] + o[0], c[1] + 4, c[2] + o[2]];
    const inside = p[2] < KC.d - 4 && p[0] < KC.o1; if (inside !== (pass === 'ins')) continue;
    const u = -a / Math.PI, inVoid = u < .22 && dark > .5 && p[0] < KC.o0 + 120;
    const P = inVoid ? LOST : u < .75 ? WHEE : move(seed % 2 ? 'wave' : 'bounce', t, seed);
    rider(C, p, who, P, { dark: inVoid, seed, face: inVoid ? 'o' : who === 'lan' ? 'star' : u < .75 ? 'wow' : 'happy' });
  }
}
function cornerScene(C, t, o = {}) {
  const lidK = E.soft(seg(t, 73.08, 74.1)), doorK = E.out5(seg(t, 73.79, 74.2));
  const th = trayTh(t), dark = 1 - E.io(seg(t, 75.95, 76.9));
  const ro = { style: 'steel', shine: lerp(-300, 1900, seg(t, 74.4, 77.3)) };
  roomClip(o.clipX ?? 640, W, () => {
    wline(C, [-300, 0, 0], [2600, 0, 0], { w: 1.5, col: PAL.ink2, a: .55 }); wline(C, [0, 0, -100], [0, 0, 2100], { w: 1.5, col: PAL.ink2, a: .55 });
    wline(C, [0, 0, 0], [0, 1600, 0], { w: 1.5, col: PAL.ink2, a: .4 });
  });
  wfill(C, [[0, 0, 0], [KC.r3 + 40, 0, 0], [KC.r3 + 40, 0, KC.d + 50], [KC.d + 50, 0, KC.d + 50], [KC.d + 50, 0, KC.r2 + 40], [0, 0, KC.r2 + 40]], PAL.ink, .06);
  const shell = [
    ...boxN(0, 0, 0, KC.o1, KC.h, KC.d, 'klrb', { closed: false }),
    faceN([[0, 0, KC.d], [KC.o0, 0, KC.d], [KC.o0, KC.h, KC.d], [0, KC.h, KC.d]], [0, 0, 1], { closed: false }),
    ...boxN(0, 0, KC.d, KC.d, KC.h, KC.r2, 'lrtbkf'), ...boxN(0, KC.h, KC.d + 20, KC.d + 20, KC.h + 40, KC.r2 + 20, 'lrtbkf'),
    panelX(KC.d + 14, 22, KC.d + 334, 758, KC.d + 2), panelX(KC.d + 342, 22, KC.r2 - 8, 758, KC.d + 2),
    panelX(KC.d + 300, 520, KC.d + 310, 720, KC.d + 3, groove), panelX(KC.d + 366, 520, KC.d + 376, 720, KC.d + 3, groove),
    ...boxN(KC.o1, 0, 0, KC.r3, KC.h, KC.d, 'lrtbkf'), ...boxN(KC.o1, KC.h, 0, KC.r3 + 20, KC.h + 40, KC.d + 20, 'lrtbkf'),
    ...[[22, 250], [262, 510], [522, 758]].flatMap(([a, b]) => [panelZ(KC.o1 + 8, a, KC.r3 - 8, b, KC.d + 2), panelZ(KC.o1 + 170, b - 44, KC.r3 - 170, b - 34, KC.d + 3, groove)]),
  ];
  const content = [...cornerTray(90, th[0], 0), ...cornerTray(420, th[1], 1), ...wire([[KC.o0, 20, KC.o0], [KC.o0, 760, KC.o0]], 11)];
  const isIn = p => p[2] < KC.d - 4 && p[0] < KC.o1;
  const door = rotateY3(doorModel(KC.o0 + 4, 24, KC.o1 - 4, 758, KC.d + 18, { th: 18 }), -1.32 * doorK, [KC.o0, 0, KC.d + 18]);
  const arc = a1 => { const a0 = -2.356, pts = []; for (let i = 0; i <= 40; i++) { const a = a0 - a1 * i / 40; pts.push([KC.o0 + Math.cos(a) * 402, 3, KC.o0 + Math.sin(a) * 402]); } return pts; };
  stage(C, shell, content, isIn, ro, {
    back: () => {
      // the dead corner: a black void inside the blind corner, clearing once the trays are out
      for (const q of [[[0, 0, 0], [KC.o0, 0, 0], [KC.o0, 0, KC.d], [0, 0, KC.d]], [[0, 0, 0], [KC.o0, 0, 0], [KC.o0, KC.h, 0], [0, KC.h, 0]], [[0, 0, 0], [0, 0, KC.d], [0, KC.h, KC.d], [0, KC.h, 0]]]) wfill(C, q, PAL.ink, .9 * dark);
      if (dark > .02) { X.save(); X.globalAlpha *= dark * .5; hatch([[KC.o0, 0, 0], [KC.o0 + 180, 0, 0], [KC.o0 + 180, KC.h, 0], [KC.o0, KC.h, 0]].map(p => P2(C, p)), { gap: 8, w: 1.2, angle: -.9, seed: 3 }); X.restore(); }
      // 死角, lettered on the void's back wall; struck through in orange on 角 (76.042)
      const lp = P2(C, [280, 640, 2]), ls = C.project([280, 640, 2])[3] * 190, lc = mixCol(PAL.ink, PAL.paper, dark);
      if (t > 73.25) text('死角', lp[0], lp[1] + ls * .36, { size: ls, font: F.serif, weight: 900, col: lc, align: 'center', a: seg(t, 73.3, 73.6) });
      const sk = E.out5(seg(t, 76.0, 76.22));
      if (sk > 0) inkStroke([[lp[0] - ls * 1.15, lp[1] + ls * .1], [lerp(lp[0] - ls * 1.15, lp[0] + ls * 1.15, sk), lp[1] - ls * .12 * sk]], { w: ls * .14, col: PAL.orange, taper: [.05, .2], seed: 44 });
      // swing path, like an architectural door-swing arc on the floor (orange = motion)
      if (th[0] < -.01) { const s = wpath(C, arc(th[0]), { col: PAL.orange, w: 4, dash: [14, 10] }); headAt(s, PAL.orange, 20, 4); const p = P2(C, [KC.o0, 3, KC.o0]); circle(p[0], p[1], 8, { fill: PAL.orange }); }
    },
    ins: () => carouselRiders(C, t, th, dark, 'ins'),
    front: () => { render3(door, C, ro); },
    out: () => {
      carouselRiders(C, t, th, dark, 'out');
      // the countertop over the corner: lifted off and turned into a dashed ghost (exploded axonometric)
      const ly = lidK * 170, solid = 1 - E.io(seg(lidK, .25, .6));
      if (solid > .01) render3(boxN(0, KC.h + ly, 0, KC.o1, KC.h + 40 + ly, KC.d + 20, 'lrtbkf'), C, { a: solid });
      ghostBox(C, 0, KC.h + ly, 0, KC.o1, KC.h + 40 + ly, KC.d + 20, (1 - solid) * .85);
      for (const [x, z] of [[0, 0], [KC.o1, 0], [KC.o1, KC.d + 20], [0, KC.d + 20]]) wline(C, [x, KC.h + 2, z], [x, KC.h + ly, z], { w: 1.2, col: PAL.grey, a: lidK * .8, dash: [4, 7] });
    },
  });
}
function shotCornerA(t, lt, dur) {
  paperBG();
  // plan view tilting to 3/4, then the SWING: the camera orbits the corner with the trays on 是 (74.508)
  const pitch = kf(t, [[73.1, 1.22], [74.4, .86], [75.9, .74]], E.io3);
  const yaw = kf(t, [[72.8, .78], [74.42, .72], [75.5, .12]], E.io3);
  const px = lerp(900, 1100, E.io(seg(t, 72.84, 74.8))) * (1 + .08 * E.io3(seg(t, 74.42, 75.5))) / punch(t, 73.826, .04);
  const C = frameCam([840, 330, 640], yaw, pitch, 1265, kf(t, [[72.84, 650], [74.6, 620]], E.io), 2250, px, { fov: 28 });
  cornerScene(C, t);
  vcol(23, t, LX, TY);
  plate(lt, 'I', '转角拉篮', 'Corner unit — swings out of the blind corner', { align: 'right' });
  cropMarks();
}
function shotCornerB(t, lt, dur) {
  paperBG();
  // bar cut: close and low on the carousel as it lands, the void clearing behind it
  const k = E.io(seg(lt, 0, dur + .4));
  const C = frameCam([880, 330, 720], lerp(.9, .82, k), lerp(.7, .64, k), 1270, 600, 1500, lerp(1060, 1130, k) / punch(t, 76.042, .05), { fov: 28 });
  cornerScene(C, t, { clipX: 700 });
  vcol(23, t, LX, TY);
  plate(lt + 3, 'I', '转角拉篮', 'Corner unit — swings out of the blind corner', { align: 'right' });
  cropMarks();
}

// ======================================================================================================
// EXHIBIT II · the tall pantry (77.235 – 81.29) · mirrored layout: picture left, lyric columns right.
// II-a: a floor-to-ceiling column seen side-on, 通高 drawn up on 高柜; on 拉 the whole six-tier frame glides out sideways
// (lateral travel, crew riding each tier). II-b (bar cut on 看, 79.28): the CRANE — close on the tiers from the top tier to
// the floor, passing the crew; 底 lands on the downbeat with a punch and a jump from the bottom tier.
// ======================================================================================================
const PT = { w: 520, d: 600, h: 2200 };
const PANTRY_CREW = [[0, 'kit', 10], [1, 'long', 7], [2, 'lan', 11], [3, 'buns', 4], [4, 'pony', 1]];
const tierY = i => 80 + i * 345;
function pantryUnit(ext) {
  const P = [], z0 = 40 + ext;
  for (let i = 0; i < 6; i++) {
    const y = tierY(i), crew = i < 5;
    P.push(...translate3(basketModel({ w: 450, d: 510, h: 92, gap: 26, rimR: 16, midRim: false, wire: 2.6, rim: 4.2 }), [0, y, z0]));
    for (let j = 0; j < 6; j++) {
      if ((crew && (j === 3 || j === 4)) || hash(i * 3.3 + j * 11.1) < .12) continue;
      const col = j % 3, row = Math.floor(j / 3), pick = Math.floor(hash(i * 7.3 + j * 1.7) * 4);
      const x = -145 + col * 145 + (hash(i * 13 + j * 3.1) - .5) * 24, z = z0 + 125 + row * 250;
      const prof = [PROF.jar, PROF.bottle, PROF.cup, PROF.tall][pick], k = [1, .88, 1.05, .7][pick];
      P.push(lathe([x, y + 3, z], lsc(prof, k), { band: hash(i + j * 5) > .55, open: pick === 2 }));
    }
  }
  for (const x of [-228, 228]) for (const z of [8, 505]) P.push(...wire([[x, 40, z0 + z], [x, 2160, z0 + z]], 7));
  return P;
}
function pantryRiders(C, t, ext, pass) {
  for (const [i, who, seed] of PANTRY_CREW) {
    const p = [-80, tierY(i) + 4, 40 + ext + 385], inside = p[2] < PT.d - 4; if (inside !== (pass === 'ins')) continue;
    const out = seg(ext, 200, 420), land = t > 80.62 && i === 0;
    let P = out < 1 ? pose({ ...KP.stand, head: .1 * Math.sin(t * 3 + seed) }) : move(i % 2 ? 'wave' : 'bounce', t, seed);
    if (out > 0 && out < 1) P = lerpPose(P, WHEE, out);
    if (land) P = lerpPose(P, WHEE, E.out5(seg(t, 80.62, 80.75)));
    rider(C, p, who, P, { seed, mm: 21, face: who === 'lan' ? 'star' : out > .5 ? 'happy' : 'dot' });
  }
}
function pantryScene(C, t, ext, ro, o = {}) {
  roomClip(0, o.clipX ?? 1330, () => {
    wline(C, [0, 0, -1], [0, 0, 2100], { w: 1.5, col: PAL.ink2, a: .55 }); wline(C, [0, 2250, -1], [0, 2250, 2100], { w: 1.5, col: PAL.ink2, a: .55 });
    wline(C, [-PT.w / 2, 0, 0], [-PT.w / 2 - 900, 0, 0], { w: 1.5, col: PAL.ink2, a: .55 }); wline(C, [-PT.w / 2, 2250, 0], [-PT.w / 2 - 900, 2250, 0], { w: 1.5, col: PAL.ink2, a: .55 });
  });
  wfill(C, [[-PT.w / 2 - 30, 0, 0], [PT.w / 2, 0, 0], [PT.w / 2, 0, PT.d + 40 + ext], [-PT.w / 2 - 30, 0, PT.d + 60 + ext]], PAL.ink, .06);
  const shell = boxN(-PT.w / 2, 0, 0, PT.w / 2, PT.h, PT.d, 'klrtb', { closed: false }).map(f => f.n[0] === -1 ? { ...f, fill: PAL.paper2 } : f);
  const dz = PT.d + 20 + ext;
  const door = [...doorModel(-PT.w / 2 + 2, 16, PT.w / 2 - 2, PT.h - 16, dz, { th: 22, handle: false }),
    { k: 'face', layer: 2, bias: -30, pts: [[-PT.w / 2 + 1, 880, dz - 4], [-PT.w / 2 + 1, 880, dz - 16], [-PT.w / 2 + 1, 1380, dz - 16], [-PT.w / 2 + 1, 1380, dz - 4]], fill: PAL.ink2, ink: PAL.ink, iw: 1 }];
  stage(C, shell, pantryUnit(ext), p => p[2] < PT.d - 4 && Math.abs(p[0]) < PT.w / 2, ro, {
    ins: () => pantryRiders(C, t, ext, 'ins'),
    out: () => {
      render3(door, C, ro);
      pantryRiders(C, t, ext, 'out');
      // pull-out motion diagram at mid-height beside the column (on screen during the pull)
      if (ext > 4 && o.arrow !== false) {
        const s = wpath(C, [[-PT.w / 2 - 90, 1100, PT.d + 60], [-PT.w / 2 - 90, 1100, PT.d + 60 + ext * .96]], { col: PAL.orange, w: 5, dash: [16, 11] });
        headAt(s, PAL.orange, 22, 5); circle(s[0][0], s[0][1], 8, { fill: PAL.orange });
      }
    },
  });
}
function shotPantryA(t, lt, dur) {
  paperBG();
  const ext = 500 * E.soft(seg(t, 78.6, 80.2)), drift = seg(t, 77.1, 79.4);
  // side-on 3/4 from the first frame, so the glide on 拉 reads as lateral travel; slow push + a punch on 拉
  const pk = E.io3(seg(t, 78.6, 79.4));
  const C = frameCam([0, lerp(1130, 1330, pk), lerp(330, 620, E.soft(seg(t, 78.6, 79.6)))], -1.0 - drift * .08 - pk * .08, .15 + pk * .06, lerp(700, 760, pk), 548, lerp(2500 - drift * 200, 1700, pk) * punch(t, 78.77, .05), 1000, { fov: 30 });
  const ro = { style: 'steel', shine: lerp(-200, 1300, seg(t, 78.6, 79.5)) };
  pantryScene(C, t, ext, ro);
  // floor-to-ceiling dimension line (no numbers: 通高) in front of the closed column, drawn up on 高柜
  const dk = E.soft(seg(t, 77.38, 78.4)), da = 1 - seg(t, 78.55, 78.8);
  if (dk > 0 && da > 0) {
    const dx = -PT.w / 2, dz = PT.d + 190, top = lerp(0, 2250, dk);
    wline(C, [dx, 0, PT.d + 30], [dx, 0, dz + 50], { w: 1.2, col: PAL.ink2, a: da }); wline(C, [dx, 2250, PT.d + 30], [dx, 2250, dz + 50], { w: 1.2, col: PAL.ink2, a: da * dk });
    const s1 = wpath(C, [[dx, 0, dz], [dx, top, dz]], { w: 2.5, a: da });
    if (dk > .06) { X.save(); X.globalAlpha *= da * seg(dk, .06, .2); headAt(s1, PAL.ink, 16, 2.5); headAt([s1[1], s1[0]], PAL.ink, 16, 2.5); X.restore(); }
    const m = P2(C, [dx, 1125, dz]); text('通高', m[0] + 20, m[1] + 12, { size: 40, font: F.serif, weight: 900, a: da * seg(dk, .5, .9) });
    text('floor to ceiling', m[0] + 20, m[1] + 50, { size: 28, font: F.serifI, col: PAL.ink2, a: da * seg(dk, .5, .9) });
  }
  vcol(24, t, RX, TY, { side: 'left', rule: 700 });
  plate(lt, 'II', '高柜拉篮', 'Tall pantry unit — the whole column pulls out');
  cropMarks();
}
function shotPantryB(t, lt, dur) {
  paperBG();
  const ext = 500 * E.soft(seg(t, 78.6, 80.2));
  // the CRANE: top tier → floor, landing on 底 (80.645) with a punch, then a breath back
  const crane = E.io3(seg(t, 79.25, 80.62)), back = E.out(seg(t, 80.8, 81.9));
  const ay = lerp(1830, 330, crane) + back * 260;
  const C = frameCam([0, ay, 600], -1.2 + crane * .1, lerp(.26, .38, crane), 780, 540, (1150 + back * 380) * punch(t, 80.645, .06), 1000, { fov: 30 });
  const ro = { style: 'steel', shine: lerp(-400, 1200, seg(t, 79.3, 80.9)) };
  pantryScene(C, t, ext, ro, { clipX: 1360, arrow: false });
  // scroll ruler in the left margin: where the camera is, top → floor
  const rx = 118, r0 = 250, r1 = 850, rk = clamp(inv(1830, 330, ay - back * 260));
  line(rx, r0, rx, r1, 2, PAL.ink);
  for (let i = 0; i < 6; i++) { const yy = lerp(r1, r0, (tierY(i) + 46) / 2200); line(rx, yy, rx + 12, yy, 2, PAL.ink); }
  text('顶', rx - 16, r0 + 10, { size: 26, font: F.serif, weight: 900, col: PAL.ink2, align: 'right' });
  const hitB = E.out5(seg(t, 80.62, 80.8));
  text('底', rx - 16, r1 + 10, { size: 26, font: F.serif, weight: 900, col: hitB > .5 ? PAL.orange : PAL.ink2, align: 'right' });
  if (hitB > 0) circle(rx, r1, 12 + 30 * hitB, { stroke: PAL.orange, w: 3.5 * (1 - hitB) + .5, a: 1 - seg(t, 80.8, 81.4) });
  rect(rx - 7, lerp(r0, r1, rk) - 28, 14, 56, PAL.orange);
  vcol(24, t, RX, TY, { side: 'left', rule: 700 });
  plate(lt + 3, 'II', '高柜拉篮', 'Tall pantry unit — the whole column pulls out');
  cropMarks();
}

// ======================================================================================================
// EXHIBIT III · the lift-down wall basket (81.29 – 84.87) · worm's-eye.
// A two-tier basket in a wall cabinet hangs from parallelogram arms, four tiny crew standing on its top tier. The handle
// glints on 柜; on 轻轻 it swings out toward the lens (half way down) while the camera PUSHES in. The full drop to eye level is
// saved for LAN (next shot), which starts exactly where this one ends.
// ======================================================================================================
const LD = { x: 360, y0: 1400, y1: 2100, d: 340, R: 312.5, TH: 1.855, HALF: .5 };
const liftO = th => [1440 + LD.R * (Math.cos(th) - 1), 30 + LD.R * Math.sin(th)];
function liftFrame(th, o = {}) {
  const [oy, oz] = liftO(th), P = [];
  P.push(...translate3(basketModel({ w: 620, d: 270, h: 104, gap: 26, rimR: 14, midRim: false, wire: 2.6, rim: 4.2 }), [0, oy, oz]));
  P.push(...translate3(basketModel({ w: 620, d: 270, h: 104, gap: 26, rimR: 14, midRim: false, wire: 2.6, rim: 4.2 }), [0, oy + 250, oz]));
  for (const x of [-318, 318]) for (const z of [18, 252]) P.push(...wire([[x, oy, oz + z], [x, oy + 420, oz + z]], 6));
  P.push(...wire([[-318, oy + 420, oz + 272], [318, oy + 420, oz + 272]], 8));          // pull-down handle bar
  for (const x of [-338, 338]) for (const az of [60, 220]) P.push(...wire([[x, 1440 + 420 - LD.R, 30 + az], [x, oy + 420, oz + az]], 8));
  // contents: jars on the lower tier, two spice jars at the ends of the upper tier (the crew stands in the middle)
  [[-215, PROF.bottle, .9], [-75, PROF.jar, 1.05], [70, PROF.tall, .62], [205, PROF.jar, 1.05]].forEach(([x, pf, k], i) => { if (!(o.take && i === 3)) P.push(lathe([x, oy + 3, oz + 135], lsc(pf, k), { band: i % 2 === 1 })); });
  for (const x of [-250, 250]) P.push(lathe([x, oy + 253, oz + 135], lsc(PROF.jar, .72), { band: true }));
  return { P, oy, oz };
}
const LIFT_CREW = [[-150, 'pony', 1], [-50, 'buns', 4], [50, 'long', 7], [150, 'kit', 10]];
function liftRiders(C, t, F0, pass, o = {}) {
  for (const [x, who, seed] of LIFT_CREW) {
    const p = [x, F0.oy + 254, F0.oz + 150], inside = p[2] < LD.d - 4 && p[1] > LD.y0; if (inside !== (pass === 'ins')) continue;
    rider(C, p, who, o.pose(who, seed), { seed, mm: o.mm ?? 21, face: o.face ?? 'happy' });
  }
}
function liftSet(C, th, ro, o = {}) {
  const F0 = liftFrame(th, o);
  // the cabinet hangs on a bare gallery wall (white-cube exhibit): a wall-mount rail behind it, no wider than the cabinet
  wline(C, [-LD.x, LD.y1 + 40, 0], [LD.x, LD.y1 + 40, 0], { w: 2, col: PAL.ink2, a: .6 });
  const shell = boxN(-LD.x, LD.y0, 0, LD.x, LD.y1, LD.d, 'klrtb', { closed: false });
  const isIn = p => p[2] < LD.d - 4 && p[1] > LD.y0 && Math.abs(p[0]) < LD.x;
  stage(C, shell, F0.P, isIn, ro, {
    back: o.back,
    ins: () => { if (o.riders) liftRiders(C, o.t, F0, 'ins', o.riders); },
    out: () => { if (o.riders) liftRiders(C, o.t, F0, 'out', o.riders); if (o.out) o.out(F0); },
  });
  return F0;
}
const liftArc = (th1, x) => { const pts = []; for (let i = 0; i <= 40; i++) { const a = th1 * i / 40; pts.push([x, 1860 - LD.R + LD.R * Math.cos(a), 300 + LD.R * Math.sin(a)]); } return pts; };
function shotLift(t, lt, dur) {
  paperBG();
  const th = LD.TH * LD.HALF * E.soft(seg(t, 82.62, 84.2));
  // worm's-eye, then the PUSH on 轻 (82.69): the basket swings toward the lens as the camera closes in; punch on 降 (83.372)
  const push = E.io3(seg(t, 82.6, 83.5));
  const C = frameCam([0, 1690, lerp(300, 380, push)], lerp(.58, .36, push) - lt * .012, lerp(-.24, -.1, push), 1200, lerp(470, 480, push), lerp(1320 - lt * 40, 1100, push) * punch(t, 83.372, .04), 1000, { fov: 32 });
  const ro = { style: 'steel', shine: lerp(-600, 700, seg(t, 82.5, 84.4)) };
  const riders = { pose: (who, seed) => t < 81.98 ? move('idle', t, seed) : t < 82.62 ? move('pointDown', t, seed) : t < 83.6 ? WHEE : move('wave', t, seed), face: t > 82.6 && t < 83.6 ? 'wow' : 'happy' };
  const F0 = liftSet(C, th, ro, { t, riders, out: () => {
    if (th > .02) { const s = wpath(C, liftArc(th, LD.x + 50), { col: PAL.orange, w: 5, dash: [16, 11] }); headAt(s, PAL.orange, 22, 5); }
  } });
  // the handle bar glints on 柜
  const hp = P2(C, [0, F0.oy + 420, F0.oz + 272]); sparkle(hp[0] + 70, hp[1] - 8, 40, { k: E.out(seg(t, 81.98, 82.1)) * (1 - seg(t, 82.3, 82.7)) });
  vcol(25, t, LX, TY);
  plate(lt, 'III', '升降拉篮', 'Lift-down basket — comes down to you', { align: 'right' });
  cropMarks();
}

// ======================================================================================================
// LAN meets the lift-down basket (84.87 – 88.145): the basket is still half way up (where III left it); LAN on tiptoe can't
// reach; on 踮 it comes the rest of the way down to eye level; on 脚 she lands flat (dust, punch); on 够 she lifts a jar and
// the crew on the basket cheers.
// ======================================================================================================
const TIP = pose({ dy: .45, sL: 2.3, eL: .3, sR: .55, eR: .45, hL: .02, hR: .04, head: .5, lean: -.16 });
const REACH = pose({ sL: 1.9, eL: .1, sR: .3, eR: .35, hL: .1, hR: .1, head: -.05, lean: -.05 });
const PROUD = pose({ sL: 2.5, eL: .35, sR: .9, eR: -1.9, hL: .12, hR: .12, head: .08 });
function shotTiptoe(t, lt, dur) {
  paperBG();
  const th = LD.TH * lerp(LD.HALF, 1, E.soft(seg(t, 86.02, 87.35))), push = seg(t, 84.8, 88.8);
  const pk = punch(t, 86.781, .035) * punch(t, 87.463, .04);
  const C = frameCam([220, 1080, 420], .1 - push * .04, .03, 1190, 548, (2480 - push * 160) * pk, 1000, { fov: 30 });
  const ro = { style: 'steel', shine: lerp(-600, 800, seg(t, 86, 87.6)) };
  roomClip(620, W, () => {
    wline(C, [-1500, 0, 0], [2400, 0, 0], { w: 1.5, col: PAL.ink2, a: .55 });
    wline(C, [-1500, 1100, 0], [2400, 1100, 0], { w: 2, col: PAL.ink2, a: .5, dash: [16, 12] });
  });
  const take = t > 87.42, cheer = t > 87.42;
  const riders = { mm: 20, pose: (who, seed) => cheer ? move('jump', t, seed) : t > 86.02 && t < 87.2 ? WHEE : move('wave', t, seed), face: cheer ? 'star' : 'happy' };
  liftSet(C, th, ro, { take, t, riders });
  // eye-level line label: at the far left end of the line, clear of the basket's path
  const el = P2(C, [-1500, 1100, 0]); text('视平线  ·  eye level', Math.max(640, el[0]) + 8, el[1] - 16, { size: 28, font: F.serifI, col: PAL.ink2 });

  // LAN stands beside the basket; scale from the camera so she matches the set (≈118 mm per body unit)
  const g = C.project([540, 0, 560]), s = g[3] * 118, lw = .16;
  const land = E.out5(seg(t, 86.7, 86.9)), lift = E.out5(seg(t, 87.42, 87.62));
  let P = lerpPose(TIP, REACH, land); if (lift > 0) P = lerpPose(P, PROUD, lift);
  if (land < 1) { const w = Math.sin(t * 8.5) * (1 - land); P = { ...P, lean: P.lean + w * .05, dy: P.dy + Math.abs(Math.sin(t * 17)) * .05 * (1 - land) }; }
  // the tiptoe pose leaves a brief pencil afterimage as she drops (gone before the jar lift)
  const ga = .3 * land * (1 - seg(t, 86.9, 87.25));
  if (ga > .01) figure(g[0], g[1], s, TIP, { who: 'lan', col: PAL.grey, a: ga, face: 'o', seed: 31, shadow: false, fill: PAL.paper, w: lw });
  const face = lift > .3 ? 'star' : land > .5 ? 'happy' : 'o';
  const fig = figure(g[0], g[1], s, P, { who: 'lan', face, blush: land, seed: 11, w: lw });
  if (land < .6) {   // tiptoe: little wobble arcs under the lifted heels
    const a = 1 - land / .6;
    for (const sd of [-1, 1]) { const fx = g[0] + sd * s * .9, fy = g[1] - s * .12; inkStroke([[fx - s * .35, fy + s * .05], [fx, fy - s * .08], [fx + s * .35, fy + s * .05]], { w: 2.5, a, seed: 40 + sd }); }
  }
  const dust = seg(t, 86.78, 87.2);   // landing puffs on 脚
  if (dust > 0 && dust < 1) for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) circle(g[0] + sd * s * (1.2 + dust * 1.6 + j * .5), g[1] - s * (.15 + j * .12) * (1 - dust * .5), s * (.18 - j * .04) * (1 - dust), { stroke: PAL.ink, w: 2.5, a: 1 - dust });
  if (land < .5) {   // strain marks while on tiptoe
    const [hx, hy, hr] = fig.head, bk = pulse(t, 5);
    inkStroke([[hx + hr * 1.45, hy - hr * .35], [hx + hr * 1.95, hy - hr * .55]], { w: 3.5, seed: 3 });
    inkStroke([[hx + hr * 1.5, hy + hr * .1], [hx + hr * 2.0, hy + hr * .15]], { w: 3.5, seed: 4 });
    X.save(); X.translate(hx + hr * 1.25, hy - hr * 1.05 + bk * 5); X.beginPath(); X.moveTo(0, -hr * .32); X.quadraticCurveTo(hr * .2, 0, 0, hr * .12); X.quadraticCurveTo(-hr * .2, 0, 0, -hr * .32);
    X.fillStyle = PAL.paper; X.fill(); X.strokeStyle = PAL.ink; X.lineWidth = 3; X.stroke(); X.restore();
  }
  if (take) {   // the jar she took
    const [hx, hy] = fig.handL, js = s * .55;
    X.save(); X.translate(hx, hy - js * .35); X.rotate(-.12);
    rrect(-js * .55, -js * .6, js * 1.1, js * 1.3, js * .18, { fill: PAL.paper, stroke: PAL.ink, w: 3 });
    rrect(-js * .6, -js * .9, js * 1.2, js * .32, 3, { fill: PAL.orange, stroke: PAL.ink, w: 3 });
    X.restore();
    sparkle(hx - s * 1.1, hy - s * 1.2, s * .6, { k: E.out(seg(t, 87.45, 87.6)) * (1 - seg(t, 87.9, 88.2)) });
  }
  vcol(26, t, LX, TY);
  cropMarks();
}

// ======================================================================================================
// THE RETIREMENT (88.145 – 95.4). The music dips: calm, dignified, funny.
// A museum vitrine holds the habit 蹲下翻找 as a plaster cast of c01's kneeling LAN (frozen mid-kick, head in a cabinet).
// E1: the gallery, slow push-in, the wall label (no spoiler). E2 (cut on 退, wider and lower): 已退休 stamped on the label in
// orange, the crew claps overhead on every beat, a 荣休 rosette, a party hat, a system toast.
// ======================================================================================================
const MU = { fy: 872, px0: 1040, px1: 1460, py: 604, gx0: 1054, gx1: 1446, gy: 226, dx: 36, dy: -26, cx: 1250, sx: 1000 };
function museumWall(t, o = {}) {
  // floor line + skirting (optionally broken where the crew stands), a ceiling track with one spotlight
  X.save(); if (o.gap) { const x0 = o.from ?? -50; X.beginPath(); X.rect(x0, -200, o.gap[0] - x0, H + 400); X.rect(o.gap[1], -200, W, H + 400); X.clip(); }
  handLine(-20, MU.fy, W + 20, MU.fy, { w: 2.5, seed: 501 }); line(0, MU.fy - 12, W, MU.fy - 12, 1, PAL.ink2, .35); X.restore();
  line(760, 56, 1190, 56, 3, PAL.ink); line(760, 64, 1190, 64, 1, PAL.ink2, .5);
}
function spotlight(t, a = 1) {
  const sx = MU.sx, sy = 64;
  X.save(); X.globalAlpha *= a;
  fillPoly([[sx + 4, sy + 40], [sx + 24, sy + 34], [MU.gx1 + 40, MU.py], [MU.gx0 - 10, MU.py]], PAL.shine, .6);
  line(sx + 4, sy + 42, MU.gx0 - 10, MU.py - 4, 1.2, PAL.ink2, .3); line(sx + 26, sy + 36, MU.gx1 + 40, MU.py - 4, 1.2, PAL.ink2, .3);
  for (let i = 0; i < 16; i++) {   // dust motes drifting in the beam
    const u = frac(hash(i * 3.7) + t * (.02 + hash(i) * .03)), v = hash(i * 9.1);
    const y = lerp(sy + 70, MU.py - 20, u), x0 = lerp(sx + 6, MU.gx0 - 10, u), x1 = lerp(sx + 24, MU.gx1 + 40, u);
    circle(lerp(x0, x1, .1 + v * .8) + Math.sin(t * .7 + i) * 6, y, 1.6 + hash(i * 5) * 1.4, { fill: PAL.ink2, a: .35 });
  }
  X.restore();
  X.save(); X.translate(sx, sy); X.rotate(-.55);
  rrect(-16, 0, 32, 50, 5, { fill: PAL.ink }); rect(-20, 44, 40, 8, PAL.ink); X.restore();
  line(sx - 6, 56, sx, 64, 3, PAL.ink);
}
// c01's kneeling LAN (head-first into the dark), cast in plaster and frozen mid-kick. (Kx, Ky) = knee, U = unit, N = dive point.
function kneelCast(Kx, Ky, U, N) {
  const lw = .21 * U, st = (pts, sd, w = lw, tp = [.1, .15]) => inkStroke(pts, { w, taper: tp, wob: .35, seed: 300 + sd, press: .15 });
  const Hp = [Kx - .55 * U, Ky - 2.3 * U];
  for (const [sd, k] of [[1, .95], [0, .12]]) {   // far leg kicked up (frozen), near leg down
    const a = Math.PI + .06 + k * 1.25, kx = Kx + sd * .42 * U, Fx = kx + Math.cos(a) * 2.1 * U, Fy = Ky + Math.sin(a) * 2.1 * U, fa = a + Math.PI / 2 + .15;
    st([[Hp[0] + sd * .25 * U, Hp[1] + .15 * U], [kx, Ky]], 1 + sd, lw, [.02, .05]);
    st([[kx, Ky], [Fx, Fy], [Fx + Math.cos(fa) * .6 * U, Fy + Math.sin(fa) * .6 * U]], 3 + sd, lw, [.02, .3]);
  }
  const ang = Math.atan2(N[1] - Hp[1], N[0] - Hp[0]), W0 = [Hp[0] + Math.cos(ang) * .45 * U, Hp[1] + Math.sin(ang) * .45 * U];
  st([W0, [lerp(W0[0], N[0], .5), lerp(W0[1], N[1], .5) - .1 * U], N], 7, lw * 1.15, [.02, .02]);
  const R2 = (a, b) => { const [x, y] = rot2(a * U, b * U, ang * .6); return [Hp[0] + x, Hp[1] + y]; };
  const sh = [[.5, -.36], [-.2, -.5], [-.66, -.3], [-.7, .16], [-.36, .46], [.12, .44], [.5, .2]].map(([a, b]) => R2(a, b));
  X.save(); X.fillStyle = PAL.ink2; smoothPath(sh, true); X.fill(); X.clip(); hatch(sh, { gap: 6, w: 1.2, col: PAL.ink, a: .6, angle: -.8, seed: 12 }); X.restore();
  X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 2.5; smoothPath(sh, true); X.stroke(); X.restore();
  inkStroke([R2(.32, -.42), R2(.46, .3)], { w: .09 * U, col: PAL.paper, taper: [.1, .1], wob: .3, seed: 318 });
  for (let j = 0; j < 2; j++) { const r = (1.05 + j * .32) * U, a0 = Math.PI * .95; inkStroke(ellipsePts(Hp[0], Hp[1] - .1 * U, r, r * 1.1, 10, 0, a0, a0 + .75), { w: .08 * U, taper: [.3, .3], seed: 320 + j, a: .8 }); }
}
function statue(t, o = {}) {
  const gy = MU.py - 8, cw = 118, ch = 128, bx = 1300, bt = gy - ch;
  fillPoly([[1070, gy + 4], [1420, gy + 4], [1430, gy - 4], [1080, gy - 4]], PAL.paper2);
  inkStroke([[1070, gy + 4], [1420, gy + 4], [1430, gy - 4]], { w: 1.8, col: PAL.ink2, seed: 88, taper: [.01, .01] });
  kneelCast(bx - 106, gy - 2, 52, [bx + 40, gy - 60]);
  // the small cabinet: a paper frame around a black mouth that swallows head and arms, door swung open
  X.save(); X.beginPath(); X.rect(bx, bt, cw, ch); X.rect(bx + 12, bt + 12, cw - 24, ch - 24); X.fillStyle = PAL.paper; X.fill('evenodd'); X.restore();
  rect(bx + 12, bt + 12, cw - 24, ch - 24, PAL.ink);
  handRect(bx, bt, cw, ch, { w: 3, seed: 91, over: 3 });
  fillPoly([[bx + cw, bt], [bx + cw + 30, bt - 16], [bx + cw + 30, gy + 2], [bx + cw, gy]], PAL.paper);
  inkStroke([[bx + cw, bt], [bx + cw + 30, bt - 16], [bx + cw + 30, gy + 2], [bx + cw, gy]], { w: 2.6, seed: 92, taper: [.02, .02] });
  if (o.hat > 0) {   // a tiny party hat on the retiree's cabinet
    const k = E.back(o.hat, 2.4), hx = bx + cw * .5, hy = bt - 2;
    X.save(); X.translate(hx, hy); X.scale(k, k); X.rotate(.12);
    fillPoly([[-22, 0], [22, 0], [0, -62]], PAL.orange); inkStroke([[-22, 0], [0, -62], [22, 0]], { w: 2.4, seed: 97, taper: [.02, .02] });
    for (const u of [.35, .7]) line(lerp(-22, 0, u), lerp(0, -62, u), lerp(22, 0, u), lerp(0, -62, u), 2, PAL.paper, .9);
    circle(0, -64, 7, { fill: PAL.paper, stroke: PAL.ink, w: 2 }); X.restore();
  }
}
function vitrine(t, o = {}) {
  const { px0, px1, py, gx0, gx1, gy, dx, dy, fy } = MU;
  fillPoly([[px1, py], [px1 + dx, py + dy], [px1 + dx, fy + dy + 8], [px1, fy]], PAL.paper2);
  rect(px0, py, px1 - px0, fy - py, PAL.paper);
  fillPoly([[px0, py], [px1, py], [px1 + dx, py + dy], [px0 + dx, py + dy]], PAL.paper);
  inkStroke([[px0, fy], [px0, py], [px1, py], [px1, fy]], { w: 2.8, seed: 511, taper: [.01, .01] });
  inkStroke([[px0, py], [px0 + dx, py + dy], [px1 + dx, py + dy], [px1 + dx, fy + dy + 8], [px1, fy]], { w: 2.2, seed: 512, taper: [.01, .01] });
  line(px1, py, px1 + dx, py + dy, 2.2, PAL.ink);
  statue(t, o);
  X.save(); X.globalAlpha *= .5; X.strokeStyle = PAL.steel1; X.lineWidth = 1.5; X.beginPath();
  X.moveTo(gx0 + dx, py + dy); X.lineTo(gx0 + dx, gy + dy); X.lineTo(gx1 + dx, gy + dy); X.stroke(); X.restore();
  fillPoly([[gx0, gy], [gx1, gy], [gx1 + dx, gy + dy], [gx0 + dx, gy + dy]], PAL.steel2, .35);
  X.save(); X.strokeStyle = PAL.steel0; X.lineWidth = 2.2; X.beginPath();
  X.moveTo(gx0, py); X.lineTo(gx0, gy); X.lineTo(gx1, gy); X.lineTo(gx1, py);
  X.moveTo(gx0, gy); X.lineTo(gx0 + dx, gy + dy); X.lineTo(gx1 + dx, gy + dy); X.lineTo(gx1, gy);
  X.moveTo(gx1 + dx, gy + dy); X.lineTo(gx1 + dx, py + dy); X.stroke(); X.restore();
  const u0 = o.shine ?? 0;
  X.save(); X.beginPath(); X.rect(gx0, gy, gx1 - gx0, py - gy); X.clip(); X.globalAlpha *= .5; X.fillStyle = PAL.shine;
  for (const [off, w] of [[0, 30], [44, 10]]) { const x0 = lerp(gx0 - 60, gx1 + 240, u0) + off; X.beginPath(); X.moveTo(x0, gy); X.lineTo(x0 + w, gy); X.lineTo(x0 + w - 200, py); X.lineTo(x0 - 200, py); X.fill(); }
  X.restore();
}
function stanchions(t) {
  const y0 = 988, h = 150;
  for (const x of [960, 1560]) {
    fillPoly([[x - 24, y0], [x + 24, y0], [x + 14, y0 - 10], [x - 14, y0 - 10]], PAL.ink);
    line(x, y0 - 10, x, y0 - h, 7, PAL.ink); circle(x, y0 - h - 6, 10, { fill: PAL.ink });
  }
  const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([lerp(972, 1548, u), y0 - h + 10 + Math.sin(u * Math.PI) * (58 + Math.sin(t * 1.3) * 3)]); }
  inkStroke(pts, { w: 9, col: PAL.orange, taper: [.02, .02], wob: .3, seed: 530, press: .05 });
}
// wall label: English title (the Chinese is the sung lyric, not printed twice); retire (0..1) stamps 已退休 like a rubber seal
function museumLabel(x, y, a = 1, retire = 0) {
  if (a <= .01) return;
  X.save(); X.globalAlpha *= a;
  rect(x + 6, y + 6, 300, 196, PAL.ink, .08); rect(x, y, 300, 196, PAL.shine); X.strokeStyle = PAL.ink2; X.lineWidth = 1.2; X.strokeRect(x, y, 300, 196);
  text('Squat & Rummage', x + 22, y + 52, { size: 34, font: F.serifI });
  line(x + 22, y + 72, x + 110, y + 72, 1.2, PAL.ink2);
  text('厨房旧习惯', x + 22, y + 104, { size: 21, font: F.serif, weight: 700, col: PAL.ink });
  text('材质：腰、膝盖、耐心', x + 22, y + 134, { size: 18, font: F.serif, weight: 400, col: PAL.ink2 });
  text('捐赠：你的膝盖', x + 22, y + 162, { size: 18, font: F.serif, weight: 400, col: PAL.ink2 });
  if (retire > 0) {
    const s = lerp(1.7, 1, E.out5(retire));
    X.save(); X.translate(x + 214, y + 150); X.rotate(-.16); X.scale(s, s); X.globalAlpha *= clamp(retire * 3);
    X.strokeStyle = PAL.orange; X.lineWidth = 4; X.strokeRect(-74, -30, 148, 60); X.lineWidth = 1.5; X.strokeRect(-67, -23, 134, 46);
    text('已退休', 0, 13, { size: 34, font: F.serif, weight: 900, col: PAL.orange, align: 'center', track: 4 });
    X.restore();
  }
  X.restore();
}
function exhibitHead(a = 1) {
  text('特展', 112, 982, { size: 22, font: F.serif, weight: 900, col: PAL.ink2, track: 6, a });
  text('Retired Habits — a small exhibition', 112, 1014, { size: 24, font: F.serifI, col: PAL.grey, a });
}
function shotMuseum(t, lt, dur) {
  paperBG();
  const k = E.io(seg(lt, 0, dur + .3)), z = lerp(1, 1.06, k);
  cam(lerp(960, 1010, k), lerp(540, 520, k), z);
  museumWall(t); spotlight(t); vitrine(t, { shine: seg(lt, .2, dur + .6) * .7 });
  stanchions(t);
  museumLabel(690, 560, E.soft(seg(lt, .6, 1.7)));
  camEnd();
  exhibitHead();
  vcol(27, t, LX, TY, { hold: .6 });
  cropMarks();
}
// overhead clap: arms open wide (V) → hands meet above the head on every beat (E.out5), with impact ticks
const CLAP_OPEN = pose({ ...KP.armsUp, sL: 2.35, eL: .1, sR: 2.35, eR: .1 });
const CLAP_SHUT = pose({ sL: 2.1, eL: 1.3, sR: 2.1, eR: 1.3, hL: .1, hR: .1, dy: .06 });
function clapper(x, y, s, who, t, seed, o = {}) {
  const ph = sinceBeat(t + (o.delay ?? 0)) / BEAT, k = ph < .16 ? E.out5(ph / .16) : 1 - E.io((ph - .16) / .84);
  const P = lerpPose(CLAP_OPEN, CLAP_SHUT, k); P.head = .06 * Math.sin(t * 2 + seed); P.lean = .03 * Math.sin(t * 1.7 + seed);
  const f = figure(x, y, s, P, { who, seed, face: o.face ?? 'happy', w: .16, blush: who === 'lan' ? 1 : 0 });
  if (ph < .4) {
    const cx = (f.handL[0] + f.handR[0]) / 2, cy = (f.handL[1] + f.handR[1]) / 2, a = 1 - ph / .4, r0 = s * .75, r1 = s * (1.3 + ph * 1.8);
    for (const ang of [-2.5, -1.57, -.64]) line(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0, cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1, 4, PAL.ink, a);
  }
  return f;
}
function bouquet(x, y, s) {
  for (const [dx, dy, r] of [[-.35, -.75, .32], [.1, -.95, .36], [.45, -.62, .3]]) { circle(x + dx * s, y + dy * s, r * s, { fill: PAL.orange }); handCircle(x + dx * s, y + dy * s, r * s, { w: 2.2, seed: 602 + dx * 10 }); }
  fillPoly([[x - s * .55, y - s * .45], [x + s * .55, y - s * .45], [x, y + s * .95]], PAL.paper);
  inkStroke([[x - s * .55, y - s * .45], [x, y + s * .95], [x + s * .55, y - s * .45]], { w: 3, seed: 601 });
}
function confetti(t, t0) {
  const el = t - t0; if (el <= 0) return;
  for (let i = 0; i < 34; i++) {
    const sp = 70 + hash(i * 5.7) * 60, x = hash(i * 3.1) * (W - 700) + 640 + Math.sin(el * 1.4 + i) * 22, y = -30 - hash(i * 7.7) * 260 + el * sp;
    if (y > H + 20) continue;
    const c = hash(i * 2.3), col = c < .16 ? PAL.orange : c < .6 ? PAL.ink : PAL.paper;
    X.save(); X.translate(x, y); X.rotate(el * (2 + hash(i) * 3) + i); X.scale(1, Math.cos(el * 5 + i));
    rect(-9, -4, 18, 8, col); if (col === PAL.paper) { X.strokeStyle = PAL.ink; X.lineWidth = 1.5; X.strokeRect(-9, -4, 18, 8); }
    X.restore();
  }
}
function shotParty(t, lt, dur) {
  paperBG();
  // a clearly different framing: wider and lower, the crew posing in front of the plinth like a retirement photo
  const k = E.io(seg(lt, 0, dur + .6));
  cam(lerp(1050, 1040, k), lerp(565, 575, k), lerp(.8, .83, k));
  museumWall(t, { gap: [880, 1640], from: 640 }); spotlight(t);
  vitrine(t, { shine: .75 + seg(lt, 0, dur) * .3, hat: seg(t, 92.3, 92.62) });
  // 荣休 rosette pinned to the glass on 休
  const rk = E.back(seg(t, 92.32, 92.64), 2);
  if (rk > 0) {
    const rx = MU.gx0 + 64, ry = MU.gy + 72;
    X.save(); X.translate(rx, ry); X.scale(rk, rk); X.rotate(-.08);
    for (const sd of [-1, 1]) fillPoly([[sd * 8, 10], [sd * 30, 84], [sd * 18, 76], [sd * 8, 90], [sd * -4, 14]], PAL.orange);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; circle(Math.cos(a) * 38, Math.sin(a) * 38, 12, { fill: PAL.orange }); }
    circle(0, 0, 40, { fill: PAL.orange }); handCircle(0, 0, 30, { w: 2, col: PAL.paper, seed: 610 });
    text('荣休', 0, 9, { size: 25, font: F.serif, weight: 900, col: PAL.paper, align: 'center' });
    X.restore();
  }
  museumLabel(690, 560, 1, seg(t, 91.52, 91.72));
  // the crew claps overhead on every beat; LAN (centre) raises the flowers
  const gy = 1070;
  clapper(930, gy, 32, 'pony', t, 1, { delay: -.02 }); clapper(1090, gy, 32, 'buns', t, 4, { delay: .01 });
  clapper(1410, gy, 32, 'long', t, 7, { delay: -.01 }); clapper(1570, gy, 32, 'kit', t, 10, { delay: .02 });
  const lb = pulse(t, 5);
  const lf = figure(1250, gy, 35, pose({ sL: 2.45 + .06 * lb, eL: .3, sR: .5, eR: .5, hL: .1, hR: .12, head: -.06, dy: .08 * lb }), { who: 'lan', face: 'happy', blush: 1, seed: 11, w: .16 });
  bouquet(lf.handL[0] - 4, lf.handL[1] - 12, 38);
  camEnd();
  confetti(t, 92.88);
  toast(1300, 68, 556, '习惯「蹲下翻找」已下线', '感谢一直以来的付出', { k: seg(t, 92.88, 93.4), from: 80 });
  vcol(27, t, LX, TY, { hold: .6 });
  cropMarks();
}

chapter('verse3', 73.0, 95.4, [
  [73.0, shotCornerA],
  [beatT(111), shotCornerB],          // bar cut 75.872: close on the carousel
  [beatT(113), shotPantryA],
  [beatT(116), shotPantryB],          // cut on 看 (79.281): the crane
  [beatT(119) - .04, shotLift],
  [84.87, shotTiptoe],
  [beatT(129), shotMuseum],
  [beatT(134) - .03, shotParty],
]);
})();
