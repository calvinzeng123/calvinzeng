// c05_verse3.js — Verse 3 · "The product family / retirement party" (73.0 – 95.4) · museum white, editorial.
// Three white-cube exhibits drawn as 3D line animations (I corner unit, II tall pantry, III lift-down basket), LAN meeting
// the lift-down basket, then the museum "retirement party" for the habit 蹲下翻找. Lyrics are serif vertical columns (left),
// the object sits right. Orange is kept to motion-path diagrams, one rope and one rosette.
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
// a flat detail panel (door / drawer front / handle groove) on a box side: n picks the plane, rect in the other two axes
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
  const E2 = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  for (const [i, j] of E2) wline(C, v[i], v[j], { w: 1.6, col, a, dash: [9, 7] });
}

// ---------- editorial furniture ----------
function cropMarks(a = 1) {
  const m = 46, l = 30;
  X.save(); X.globalAlpha *= a; X.strokeStyle = PAL.ink; X.lineWidth = 1.5; X.beginPath();
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    X.moveTo(x - sx * 12, y); X.lineTo(x + sx * l, y); X.moveTo(x, y - sy * 12); X.lineTo(x, y + sy * l);
  }
  X.stroke(); X.restore();
}
// folio: tiny running head, top right (the chapter's editorial signature)
function folio(no, a = 1) {
  text('HIGOLD 悍高  ·  产品家族', W - 96, 92, { size: 18, font: F.sans, weight: 600, col: PAL.ink2, align: 'right', track: 3, a });
  text(no ? 'The Family — exhibit ' + no : 'The Family — a retirement', W - 96, 122, { size: 24, font: F.serifI, col: PAL.grey, align: 'right', a });
}
// exhibit caption plate, bottom left; slides out like a drawer (E.soft)
function plate(lt, no, zh, en, o = {}) {
  const at = o.at ?? .3, k = E.soft(seg(lt, at, at + 1.2)); if (k <= 0) return;
  const x = o.x ?? 112, y = o.y ?? 938;
  X.save(); X.beginPath(); X.rect(x - 20, y - 150, 980, 250); X.clip(); X.translate(-(1 - k) * 520, 0);
  line(x, y - 104, x + 380, y - 104, 2, PAL.ink);
  text('展品 ' + no, x, y - 74, { size: 19, font: F.mono, weight: 600, col: PAL.ink2, track: 3 });
  text(zh, x, y - 20, { size: 46, font: F.serif, weight: 900 });
  text(en, x, y + 24, { size: 30, font: F.serifI, col: PAL.ink2 });
  X.restore();
}
// vertical serif lyric columns + a hairline that slides down beside them
function vcol(i, t, x, y, size, o = {}) {
  const hold = o.hold ?? .2, env = lyEnv(i, t, hold); if (env <= 0) return;
  lyVertical(i, t, { x, y, size, gap: o.gap ?? 1.3, font: F.serif, weight: 900, hi: o.hi, hold });
  const k = E.soft(seg(t, LY[i].t[0] - .05, LY[i].t[0] + 1.1)), rx = x + size * .8;
  line(rx, y + 16, rx, y + 16 + (o.rule ?? 560) * k, 2, PAL.ink, env);
  circle(rx, y + 16, 4.5, { fill: PAL.ink, a: env });
}

// ======================================================================================================
// EXHIBIT I · the corner unit (73.0 – 77.235)
// An L-shaped run of base cabinets, the corner countertop lifted off (cut-away model). The blind corner is a black void
// with two trays trapped in it; the door snaps open and the trays swing out on their pivot post, one after the other.
// ======================================================================================================
const KC = { d: 560, h: 780, o0: 560, o1: 1160, r2: 1250, r3: 1720 };
function cornerTray(y, th, kind) {
  const pv = [KC.o0, 0, KC.o0], off = rotY([-285, 0, -285], th), c = [pv[0] + off[0], y, pv[2] + off[2]];
  let P = translate3(basketModel({ w: 420, d: 420, h: 62, rimR: 150, gap: 30, midRim: false, wire: 2.8, rim: 5 }), [0, 0, -210]);
  if (kind === 0) {
    P.push(lathe([-20, 3, 10], lsc(PROF.pot, .8), { fill: PAL.paper })); P.push(lathe([-20, 102, 10], lsc(PROF.lid, .78), { fill: PAL.paper2 }));
    P.push(lathe([120, 3, -110], lsc(PROF.cup, .9), { open: true }));
  } else {
    [[-95, -80, PROF.jar, .9], [75, -100, PROF.bottle, .72], [110, 60, PROF.jar, .9], [-60, 95, PROF.cup, 1], [10, -5, PROF.tall, .6]]
      .forEach(([x, z, pf, k], i) => P.push(lathe([x, 3, z], lsc(pf, k), { band: i % 2 === 0, open: pf === PROF.cup })));
  }
  P = translate3(rotateY3(P, th), c);
  P.push(...wire([[pv[0], y + 8, pv[2]], [c[0], y + 8, c[2]]], 7));
  return P;
}
function shotCorner(t, lt, dur) {
  paperBG();
  const lidK = E.soft(seg(t, 73.08, 74.1)), doorK = E.out5(seg(t, 73.79, 74.3));
  const th1 = -Math.PI * E.soft(seg(t, 74.46, 76.1)), th2 = -Math.PI * E.soft(seg(t, 75.14, 76.8));
  const dark = 1 - E.io(seg(t, 75.95, 76.9));
  const pitch = kf(t, [[73.1, 1.2], [74.7, .8], [77.9, .7]], E.io3), yaw = kf(t, [[72.8, .7], [77.9, .42]], E.io);
  const C = frameCam([820, 360, 640], yaw, pitch, 1255, 600, 2150, 1080 + lt * 14, { fov: 28 });
  const ro = { style: 'steel', shine: lerp(-300, 1900, seg(t, 74.4, 77.3)) };

  // room: wall/floor junctions of a white cube corner
  wline(C, [-300, 0, 0], [2400, 0, 0], { w: 1.5, col: PAL.ink2, a: .55 }); wline(C, [0, 0, -100], [0, 0, 2000], { w: 1.5, col: PAL.ink2, a: .55 });
  wline(C, [0, 0, 0], [0, 1600, 0], { w: 1.5, col: PAL.ink2, a: .4 });
  // contact shadow of the L footprint
  wfill(C, [[0, 0, 0], [KC.r3 + 40, 0, 0], [KC.r3 + 40, 0, KC.d + 50], [KC.d + 50, 0, KC.d + 50], [KC.d + 50, 0, KC.r2 + 40], [0, 0, KC.r2 + 40]], PAL.ink, .06);

  const shell = [
    ...boxN(0, 0, 0, KC.o1, KC.h, KC.d, 'klrb', { closed: false }),
    faceN([[0, 0, KC.d], [KC.o0, 0, KC.d], [KC.o0, KC.h, KC.d], [0, KC.h, KC.d]], [0, 0, 1], { closed: false }),
    // run along the left wall, with two doors facing +x
    ...boxN(0, 0, KC.d, KC.d, KC.h, KC.r2, 'lrtbkf'), ...boxN(0, KC.h, KC.d + 20, KC.d + 20, KC.h + 40, KC.r2 + 20, 'lrtbkf'),
    panelX(KC.d + 14, 22, KC.d + 334, 758, KC.d + 2), panelX(KC.d + 342, 22, KC.r2 - 8, 758, KC.d + 2),
    panelX(KC.d + 300, 520, KC.d + 310, 720, KC.d + 3, groove), panelX(KC.d + 366, 520, KC.d + 376, 720, KC.d + 3, groove),
    // run along the back wall, with three drawers
    ...boxN(KC.o1, 0, 0, KC.r3, KC.h, KC.d, 'lrtbkf'), ...boxN(KC.o1, KC.h, 0, KC.r3 + 20, KC.h + 40, KC.d + 20, 'lrtbkf'),
    ...[[22, 250], [262, 510], [522, 758]].flatMap(([a, b]) => [panelZ(KC.o1 + 8, a, KC.r3 - 8, b, KC.d + 2), panelZ(KC.o1 + 170, b - 44, KC.r3 - 170, b - 34, KC.d + 3, groove)]),
  ];
  const content = [...cornerTray(90, th1, 0), ...cornerTray(420, th2, 1), ...wire([[KC.o0, 20, KC.o0], [KC.o0, 760, KC.o0]], 11)];
  const isIn = p => p[2] < KC.d - 4 && p[0] < KC.o1;
  const door = rotateY3(doorModel(KC.o0 + 4, 24, KC.o1 - 4, 758, KC.d + 18, { th: 18 }), -1.32 * doorK, [KC.o0, 0, KC.d + 18]);
  const arc = th => { const a0 = -2.356, pts = []; for (let i = 0; i <= 40; i++) { const a = a0 - th * i / 40; pts.push([KC.o0 + Math.cos(a) * 402, 3, KC.o0 + Math.sin(a) * 402]); } return pts; };

  stage(C, shell, content, isIn, ro, {
    back: () => {
      // the dead corner: a black void inside the blind corner, clearing once the trays are out
      const d = dark;
      for (const q of [[[0, 0, 0], [KC.o0, 0, 0], [KC.o0, 0, KC.d], [0, 0, KC.d]], [[0, 0, 0], [KC.o0, 0, 0], [KC.o0, KC.h, 0], [0, KC.h, 0]], [[0, 0, 0], [0, 0, KC.d], [0, KC.h, KC.d], [0, KC.h, 0]]]) wfill(C, q, PAL.ink, .9 * d);
      if (d > .02) { X.save(); X.globalAlpha *= d * .5; hatch([[KC.o0, 0, 0], [KC.o0 + 180, 0, 0], [KC.o0 + 180, KC.h, 0], [KC.o0, KC.h, 0]].map(p => P2(C, p)), { gap: 8, w: 1.2, angle: -.9, seed: 3 }); X.restore(); }
      if (d > .02) { const p = P2(C, [260, 0, 270]); text('死角', p[0], p[1], { size: 30, font: F.serif, weight: 900, col: PAL.paper, align: 'center', a: d * (1 - seg(pitch, 1.05, .85)) }); }
      // swing paths drawn like architectural door-swing arcs on the floor (orange = motion)
      if (th1 < -.01) { const s = wpath(C, arc(th1), { col: PAL.orange, w: 3.5, dash: [14, 10] }); headAt(s, PAL.orange, 18, 3.5); }
      if (th1 < -.01) { const p = P2(C, [KC.o0, 3, KC.o0]); circle(p[0], p[1], 7, { fill: PAL.orange }); }
    },
    front: () => { render3(door, C, ro); },
    out: () => {
      // the countertop over the corner: lifted off and turned into a dashed ghost (exploded axonometric)
      const ly = lidK * 250, solid = 1 - E.io(seg(lidK, .25, .6));
      if (solid > .01) render3(boxN(0, KC.h + ly, 0, KC.o1, KC.h + 40 + ly, KC.d + 20, 'lrtbkf'), C, { a: solid });
      ghostBox(C, 0, KC.h + ly, 0, KC.o1, KC.h + 40 + ly, KC.d + 20, (1 - solid) * .85);
      for (const [x, z] of [[0, 0], [KC.o1, 0], [KC.o1, KC.d + 20], [0, KC.d + 20]]) wline(C, [x, KC.h + 2, z], [x, KC.h + ly, z], { w: 1.2, col: PAL.grey, a: lidK * .8, dash: [4, 7] });
    },
  });

  vcol(23, t, 410, 150, 116, { rule: 600 });
  plate(lt, 'I', '转角拉篮', 'Corner unit — swings out of the blind corner');
  folio('I'); cropMarks();
}

// ======================================================================================================
// EXHIBIT II · the tall pantry (77.235 – 81.29)
// A floor-to-ceiling larder unit: the whole six-tier frame glides out on 拉, then the camera cranes from the top tier to
// the floor on 看到底, with a scroll-ruler in the margin tracking where we are.
// ======================================================================================================
const PT = { w: 520, d: 600, h: 2200 };
function pantryUnit(ext, t) {
  const P = [], z0 = 40 + ext;
  for (let i = 0; i < 6; i++) {
    const y = 80 + i * 345;
    P.push(...translate3(basketModel({ w: 450, d: 510, h: 92, gap: 26, rimR: 16, midRim: false, wire: 2.6, rim: 4.2 }), [0, y, z0]));
    for (let j = 0; j < 6; j++) {
      if (hash(i * 3.3 + j * 11.1) < .16) continue;
      const col = j % 3, row = Math.floor(j / 3), pick = Math.floor(hash(i * 7.3 + j * 1.7) * 4);
      const x = -145 + col * 145 + (hash(i * 13 + j * 3.1) - .5) * 24, z = z0 + 125 + row * 250;
      const prof = [PROF.jar, PROF.bottle, PROF.cup, PROF.tall][pick], k = [1, .88, 1.05, .7][pick];
      P.push(lathe([x, y + 3, z], lsc(prof, k), { band: hash(i + j * 5) > .55, open: pick === 2 }));
    }
  }
  for (const x of [-228, 228]) for (const z of [8, 505]) P.push(...wire([[x, 40, z0 + z], [x, 2160, z0 + z]], 7));
  return P;
}
function shotPantry(t, lt, dur) {
  paperBG();
  const ek = E.soft(seg(t, 78.62, 80.2)), ext = 500 * ek;
  const orb = E.io3(seg(t, 78.5, 79.45)), crane = E.io3(seg(t, 79.25, 80.66)), back = E.out(seg(t, 80.66, 81.95));
  const wide = 1 - orb, drift = seg(t, 77.2, 78.6);
  const ay = lerp(lerp(1720, 430, crane), 1120, wide) + back * 330, span = lerp(lerp(1450, 1520, crane), 2500 - drift * 180, wide) + back * 480;
  const yaw = lerp(-1.08, -.46 - drift * .06, wide) - seg(t, 79.6, 81.9) * .08, pitch = lerp(lerp(.3, .4, crane), .16, wide) - back * .1;
  const C = frameCam([0, ay, lerp(330, 560, orb)], yaw, pitch, 1190, 540, span, 1000, { fov: 30 });
  const ro = { style: 'steel', shine: lerp(-200, 1300, seg(t, 78.7, 80.9)) };

  // room: floor and ceiling lines (floor-to-ceiling), back wall edge
  wline(C, [0, 0, -1], [0, 0, 1900], { w: 1.5, col: PAL.ink2, a: .55 }); wline(C, [0, 2250, -1], [0, 2250, 1900], { w: 1.5, col: PAL.ink2, a: .55 });
  wline(C, [-PT.w / 2, 0, 0], [-PT.w / 2 - 900, 0, 0], { w: 1.5, col: PAL.ink2, a: .55 }); wline(C, [-PT.w / 2, 2250, 0], [-PT.w / 2 - 900, 2250, 0], { w: 1.5, col: PAL.ink2, a: .55 });
  wfill(C, [[-PT.w / 2 - 30, 0, 0], [PT.w / 2, 0, 0], [PT.w / 2, 0, PT.d + 40 + ext], [-PT.w / 2 - 30, 0, PT.d + 60 + ext]], PAL.ink, .06);

  const shell = boxN(-PT.w / 2, 0, 0, PT.w / 2, PT.h, PT.d, 'klrtb', { closed: false });
  const dz = PT.d + 20 + ext;
  const door = [...doorModel(-PT.w / 2 + 2, 16, PT.w / 2 - 2, PT.h - 16, dz, { th: 22, handle: false }),
    { k: 'face', layer: 2, bias: -30, pts: [[-PT.w / 2 + 1, 880, dz - 4], [-PT.w / 2 + 1, 880, dz - 16], [-PT.w / 2 + 1, 1380, dz - 16], [-PT.w / 2 + 1, 1380, dz - 4]], fill: PAL.ink2, ink: PAL.ink, iw: 1 }];
  const content = pantryUnit(ext, t);
  stage(C, shell, content, p => p[2] < PT.d - 4 && Math.abs(p[0]) < PT.w / 2, ro, {
    out: () => {
      render3(door, C, ro);
      // pull-out motion diagram: orange arrow along the floor runner, drawn as the unit travels
      if (ext > 4) {
        const s = wpath(C, [[-PT.w / 2 - 70, 2, PT.d + 40], [-PT.w / 2 - 70, 2, PT.d + 40 + ext * .98]], { col: PAL.orange, w: 3.5, dash: [14, 10] });
        headAt(s, PAL.orange, 18, 3.5); const q = s[0]; circle(q[0], q[1], 6, { fill: PAL.orange });
      }
    },
  });

  // floor-to-ceiling dimension line (no numbers: 通高), drawn up on 高柜 while the column is still closed
  const dk = E.soft(seg(t, 77.38, 78.4)), da = 1 - seg(t, 78.6, 78.9);
  if (dk > 0 && da > 0) {
    const dx = PT.w / 2 + 170, dz = PT.d + 20, top = lerp(0, 2250, dk);
    wline(C, [PT.w / 2 + 20, 0, dz], [dx + 40, 0, dz], { w: 1.2, col: PAL.ink2, a: da }); wline(C, [PT.w / 2 + 20, 2250, dz], [dx + 40, 2250, dz], { w: 1.2, col: PAL.ink2, a: da * dk });
    const s1 = wpath(C, [[dx, 0, dz], [dx, top, dz]], { w: 2.5, a: da }); X.save(); X.globalAlpha *= da; headAt(s1, PAL.ink, 16, 2.5); headAt([s1[1], s1[0]], PAL.ink, 16, 2.5); X.restore();
    const m = P2(C, [dx, 1125, dz]); text('通高', m[0] + 18, m[1] + 12, { size: 34, font: F.serif, weight: 900, a: da * seg(dk, .5, .9) });
    text('floor to ceiling', m[0] + 18, m[1] + 48, { size: 26, font: F.serifI, col: PAL.ink2, a: da * seg(dk, .5, .9) });
  }
  // scroll ruler in the right margin: where the camera is, top → floor
  const rx = W - 124, r0 = 250, r1 = 880, rk = orb < .5 ? 0 : clamp(inv(1720, 430, ay - back * 330));
  line(rx, r0, rx, r1, 2, PAL.ink);
  for (let i = 0; i < 6; i++) { const yy = lerp(r1, r0, (80 + i * 345 + 46) / 2200); line(rx - 12, yy, rx, yy, 2, PAL.ink); }
  text('顶', rx + 16, r0 + 10, { size: 26, font: F.serif, weight: 900, col: PAL.ink2 });
  const hitB = E.out5(seg(t, 80.62, 80.8));
  text('底', rx + 16, r1 + 10, { size: 26, font: F.serif, weight: 900, col: hitB > .5 ? PAL.orange : PAL.ink2 });
  if (hitB > 0) circle(rx, r1, 10 + 26 * hitB, { stroke: PAL.orange, w: 3 * (1 - hitB) + .5, a: 1 - seg(t, 80.8, 81.4) });
  rect(rx - 7, lerp(r0, r1, rk) - 28, 14, 56, PAL.orange);

  vcol(24, t, 410, 150, 116, { rule: 600 });
  plate(lt, 'II', '高柜拉篮', 'Tall pantry unit — the whole column pulls out');
  folio('II'); cropMarks();
}

// ======================================================================================================
// EXHIBIT III · the lift-down wall basket (81.29 – 84.87)
// A two-tier basket inside a wall cabinet hangs from parallelogram arms; on 轻轻 it swings forward and down to eye level.
// ======================================================================================================
const LD = { x: 360, y0: 1400, y1: 2100, d: 340, R: 312.5, TH: 1.855 };
function liftFrame(th, o = {}) {
  const oy = 1440 + LD.R * (Math.cos(th) - 1), oz = 30 + LD.R * Math.sin(th), P = [];
  P.push(...translate3(basketModel({ w: 620, d: 270, h: 104, gap: 26, rimR: 14, midRim: false, wire: 2.6, rim: 4.2 }), [0, oy, oz]));
  P.push(...translate3(basketModel({ w: 620, d: 270, h: 104, gap: 26, rimR: 14, midRim: false, wire: 2.6, rim: 4.2 }), [0, oy + 250, oz]));
  for (const x of [-318, 318]) for (const z of [18, 252]) P.push(...wire([[x, oy, oz + z], [x, oy + 420, oz + z]], 6));
  P.push(...wire([[-318, oy + 420, oz + 272], [318, oy + 420, oz + 272]], 8));          // pull-down handle bar
  for (const x of [-338, 338]) for (const az of [60, 220]) P.push(...wire([[x, 1440 + 420 - LD.R, 30 + az], [x, oy + 420, oz + az]], 8));
  // contents: jars below, a row of small spice jars on the upper tier
  [[-215, PROF.bottle, .9], [-75, PROF.jar, 1.05], [70, PROF.tall, .62], [205, PROF.jar, 1.05]].forEach(([x, pf, k], i) => P.push(lathe([x, oy + 3, oz + 135], lsc(pf, k), { band: i % 2 === 1 })));
  for (let i = 0; i < 5; i++) if (!(o.take && i === 3)) P.push(lathe([-230 + i * 115, oy + 253, oz + 135], lsc(PROF.jar, .72), { band: i % 2 === 0 }));
  return { P, oy, oz };
}
function liftSet(C, th, ro, o = {}) {
  const F0 = liftFrame(th, o);
  // the cabinet hangs on a bare gallery wall (white-cube exhibit): a hairline wall-mount rail behind it
  wline(C, [-LD.x - 60, LD.y1 + 40, 0], [LD.x + 60, LD.y1 + 40, 0], { w: 2, col: PAL.ink2, a: .6 });
  const shell = boxN(-LD.x, LD.y0, 0, LD.x, LD.y1, LD.d, 'klrtb', { closed: false });
  stage(C, shell, F0.P, p => p[2] < LD.d - 4 && p[1] > LD.y0 && Math.abs(p[0]) < LD.x, ro, { back: o.back, out: o.out });
  return F0;
}
function shotLift(t, lt, dur) {
  paperBG();
  const th = LD.TH * E.soft(seg(t, 82.6, 84.9));
  const C = frameCam([0, 1560, 360], lerp(.76, .6, seg(t, 81.2, 85.4)), lerp(.08, .02, seg(t, 81.2, 85.4)), 1200, 540, 1420, 1000 + lt * 12, { fov: 30 });
  const ro = { style: 'steel', shine: lerp(-600, 700, seg(t, 82.5, 84.9)) };
  // wall: floor line + eye-level line
  wline(C, [-1500, 0, 0], [1600, 0, 0], { w: 1.5, col: PAL.ink2, a: .55 });
  wline(C, [-1500, 1100, 0], [1600, 1100, 0], { w: 2, col: PAL.ink2, a: .7, dash: [16, 12] });
  const el = P2(C, [-1150, 1100, 0]); text('视平线  ·  eye level', el[0] + 10, el[1] - 16, { size: 28, font: F.serifI, col: PAL.ink2 });
  const arc = (th1, x) => { const pts = []; for (let i = 0; i <= 40; i++) { const a = th1 * i / 40; pts.push([x, 1860 - LD.R + LD.R * Math.cos(a), 300 + LD.R * Math.sin(a)]); } return pts; };
  const F0 = liftSet(C, th, ro, {
    out: () => {
      if (th > .02) { const s = wpath(C, arc(th, LD.x + 40), { col: PAL.orange, w: 3.5, dash: [14, 10] }); headAt(s, PAL.orange, 18, 3.5); }
    },
  });
  // the handle bar glints on 柜
  const hp = P2(C, [0, F0.oy + 420, F0.oz + 272]); sparkle(hp[0] + 60, hp[1] - 6, 30, { k: E.out(seg(t, 81.98, 82.1)) * (1 - seg(t, 82.3, 82.7)) });
  vcol(25, t, 410, 150, 116, { rule: 600 });
  plate(lt, 'III', '升降拉篮', 'Lift-down basket — comes down to you');
  folio('III'); cropMarks();
}

// ======================================================================================================
// LAN meets the lift-down basket (84.87 – 88.145): tiptoe → the basket comes down → flat feet, jar in hand.
// ======================================================================================================
const TIP = pose({ dy: .45, sL: 2.3, eL: .3, sR: .55, eR: .45, hL: .02, hR: .04, head: .5, lean: -.16 });
const REACH = pose({ sL: 1.9, eL: .1, sR: .3, eR: .35, hL: .1, hR: .1, head: -.05, lean: -.05 });
const PROUD = pose({ sL: 2.5, eL: .35, sR: .9, eR: -1.9, hL: .12, hR: .12, head: .08 });
function shotTiptoe(t, lt, dur) {
  paperBG();
  const th = LD.TH * E.soft(seg(t, 86.02, 87.35)), push = seg(t, 84.8, 88.8);
  const C = frameCam([220, 1080, 420], .1 - push * .04, .03, 1190, 548, 2480 - push * 120, 1000, { fov: 30 });
  const ro = { style: 'steel', shine: lerp(-600, 800, seg(t, 86, 87.6)) };
  wline(C, [-1500, 0, 0], [2400, 0, 0], { w: 1.5, col: PAL.ink2, a: .55 });
  wline(C, [-1500, 1100, 0], [2400, 1100, 0], { w: 2, col: PAL.ink2, a: .4, dash: [16, 12] });
  const take = t > 87.42;
  liftSet(C, th, ro, { take });

  // LAN stands beside the counter; scale from the camera so she matches the set (≈160 mm per body unit)
  const g = C.project([540, 0, 560]), s = g[3] * 118, lw = .16;
  const land = E.out5(seg(t, 86.7, 86.9)), lift = E.out5(seg(t, 87.42, 87.62));
  let P = lerpPose(TIP, REACH, land); if (lift > 0) P = lerpPose(P, PROUD, lift);
  if (land < 1) { const w = Math.sin(t * 8.5) * (1 - land); P = { ...P, lean: P.lean + w * .05, dy: P.dy + Math.abs(Math.sin(t * 17)) * .05 * (1 - land) }; }
  if (land > 0) {   // the old habit stays behind as a pencil ghost, then fades
    const ga = .38 * land * (1 - seg(t, 87.6, 88.6) * .5);
    figure(g[0], g[1], s, TIP, { who: 'lan', col: PAL.grey, a: ga, face: 'o', seed: 31, shadow: false, fill: PAL.paper, w: lw });
  }
  const face = lift > .3 ? 'star' : land > .5 ? 'happy' : 'o';
  const fig = figure(g[0], g[1], s, P, { who: 'lan', face, blush: land, seed: 11, w: lw });
  if (land < .6) {   // tiptoe: little wobble arcs under the lifted heels
    const a = 1 - land / .6;
    for (const sd of [-1, 1]) { const fx = g[0] + sd * s * .9, fy = g[1] - s * .12; inkStroke([[fx - s * .35, fy + s * .05], [fx, fy - s * .08], [fx + s * .35, fy + s * .05]], { w: 2.5, a, seed: 40 + sd }); }
  }
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
    sparkle(hx - s * 1.1, hy - s * 1.2, s * .55, { k: E.out(seg(t, 87.45, 87.6)) * (1 - seg(t, 87.9, 88.2)) });
  }
  vcol(26, t, 410, 150, 116, { rule: 600 });
  folio('III'); cropMarks();
}

// ======================================================================================================
// THE RETIREMENT PARTY (88.145 – 95.4). The music dips: calm, dignified, funny.
// A museum vitrine on a plinth holds the habit 蹲下翻找 as a plaster statue (a figure squatting with its head in a cabinet).
// E1: the gallery, slow push-in, the wall label. E2 (cut on 退): the crew claps, a 荣休 rosette, a system toast.
// ======================================================================================================
const MU = { fy: 872, px0: 1040, px1: 1460, py: 604, gx0: 1054, gx1: 1446, gy: 226, dx: 36, dy: -26, cx: 1250, sx: 1000 };
const STATUE = pose({ lean: 1.12, head: .22, sL: -.12, eL: .12, sR: .28, eR: .15, hL: .55, kL: 1.1, hR: .55, kR: 1.1 });
function museumWall(t) {
  // floor line + skirting, a ceiling track with one spotlight
  handLine(-20, MU.fy, W + 20, MU.fy, { w: 2.5, seed: 501 }); line(0, MU.fy - 12, W, MU.fy - 12, 1, PAL.ink2, .35);
  line(760, 56, 1190, 56, 3, PAL.ink); line(760, 64, 1190, 64, 1, PAL.ink2, .5);
}
function spotlight(t, a = 1) {
  const sx = MU.sx, sy = 64;
  X.save(); X.globalAlpha *= a;
  // light cone: two hairlines and a faint wash
  fillPoly([[sx + 4, sy + 40], [sx + 24, sy + 34], [MU.gx1 + 40, MU.py], [MU.gx0 - 10, MU.py]], PAL.shine, .6);
  line(sx + 4, sy + 42, MU.gx0 - 10, MU.py - 4, 1.2, PAL.ink2, .3); line(sx + 26, sy + 36, MU.gx1 + 40, MU.py - 4, 1.2, PAL.ink2, .3);
  // dust motes drifting in the beam
  for (let i = 0; i < 16; i++) {
    const u = frac(hash(i * 3.7) + t * (.02 + hash(i) * .03)), v = hash(i * 9.1);
    const y = lerp(sy + 70, MU.py - 20, u), x0 = lerp(sx + 6, MU.gx0 - 10, u), x1 = lerp(sx + 24, MU.gx1 + 40, u);
    circle(lerp(x0, x1, .1 + v * .8) + Math.sin(t * .7 + i) * 6, y, 1.6 + hash(i * 5) * 1.4, { fill: PAL.ink2, a: .35 });
  }
  X.restore();
  X.save(); X.translate(sx, sy); X.rotate(-.55);
  rrect(-16, 0, 32, 50, 5, { fill: PAL.ink }); rect(-20, 44, 40, 8, PAL.ink); X.restore();
  line(sx - 6, 56, sx, 64, 3, PAL.ink);
}
function statue(t, o = {}) {
  // plaster figure on its knees, bottom up, head and arms swallowed by a small cabinet (the old habit, frozen)
  const gy = MU.py - 8, cw = 156, ch = 168, bx = 1250, bt = gy - ch;
  fillPoly([[1070, gy + 4], [1420, gy + 4], [1430, gy - 4], [1080, gy - 4]], PAL.paper2);
  inkStroke([[1070, gy + 4], [1420, gy + 4], [1430, gy - 4]], { w: 1.8, col: PAL.ink2, seed: 88, taper: [.01, .01] });
  const st = (pts, sd, w = 6.5) => inkStroke(pts, { w, seed: 700 + sd, taper: [.08, .12], wob: .4, press: .15 });
  // far leg, near leg: shins flat on the plinth with curled toes, thighs up to a round, proud bottom (the highest point);
  // the back slopes down into the cabinet
  st([[bx - 152, gy - 15], [bx - 146, gy - 4], [bx - 84, gy - 4], [bx - 80, gy - 70]], 1, 6);
  st([[bx - 170, gy - 17], [bx - 163, gy - 5], [bx - 100, gy - 5], [bx - 96, gy - 72]], 2, 7);
  st([[bx - 96, gy - 72], [bx - 120, gy - 94], [bx - 114, gy - 128], [bx - 84, gy - 138], [bx - 52, gy - 120], [bx - 16, gy - 86], [bx + 24, gy - 64]], 3, 8);
  // the cabinet: dark interior swallowing head and arms, carcass edges, the door swung open
  X.save(); X.beginPath(); X.rect(bx, bt, cw, ch); X.rect(bx + 14, bt + 14, cw - 28, ch - 28); X.fillStyle = PAL.paper; X.fill('evenodd'); X.restore();
  rect(bx + 14, bt + 14, cw - 28, ch - 28, PAL.ink);
  handRect(bx, bt, cw, ch, { w: 3, seed: 91, over: 3 });
  X.save(); X.globalAlpha *= .5; hatch([[bx, bt], [bx + cw, bt], [bx + cw, bt + 14], [bx, bt + 14]], { gap: 6, w: 1, angle: -.8, seed: 5 }); X.restore();
  fillPoly([[bx + cw, bt], [bx + cw + 36, bt - 18], [bx + cw + 36, gy + 2], [bx + cw, gy]], PAL.paper);
  inkStroke([[bx + cw, bt], [bx + cw + 36, bt - 18], [bx + cw + 36, gy + 2], [bx + cw, gy]], { w: 2.6, seed: 92, taper: [.02, .02] });
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
  // plinth: front, side, top
  fillPoly([[px1, py], [px1 + dx, py + dy], [px1 + dx, fy + dy + 8], [px1, fy]], PAL.paper2);
  rect(px0, py, px1 - px0, fy - py, PAL.paper);
  fillPoly([[px0, py], [px1, py], [px1 + dx, py + dy], [px0 + dx, py + dy]], PAL.paper);
  inkStroke([[px0, fy], [px0, py], [px1, py], [px1, fy]], { w: 2.8, seed: 511, taper: [.01, .01] });
  inkStroke([[px0, py], [px0 + dx, py + dy], [px1 + dx, py + dy], [px1 + dx, fy + dy + 8], [px1, fy]], { w: 2.2, seed: 512, taper: [.01, .01] });
  line(px1, py, px1 + dx, py + dy, 2.2, PAL.ink);
  statue(t, o);
  // glass case: back edges faint, front edges crisp, a sweeping reflection
  X.save(); X.globalAlpha *= .5; X.strokeStyle = PAL.steel1; X.lineWidth = 1.5; X.beginPath();
  X.moveTo(gx0 + dx, py + dy); X.lineTo(gx0 + dx, gy + dy); X.lineTo(gx1 + dx, gy + dy); X.stroke(); X.restore();
  fillPoly([[gx0, gy], [gx1, gy], [gx1 + dx, gy + dy], [gx0 + dx, gy + dy]], PAL.steel2, .35);
  X.save(); X.strokeStyle = PAL.steel0; X.lineWidth = 2.2; X.beginPath();
  X.moveTo(gx0, py); X.lineTo(gx0, gy); X.lineTo(gx1, gy); X.lineTo(gx1, py);
  X.moveTo(gx0, gy); X.lineTo(gx0 + dx, gy + dy); X.lineTo(gx1 + dx, gy + dy); X.lineTo(gx1, gy);
  X.moveTo(gx1 + dx, gy + dy); X.lineTo(gx1 + dx, py + dy); X.stroke(); X.restore();
  const u0 = o.shine ?? 0;
  X.save(); X.beginPath(); X.rect(gx0, gy, gx1 - gx0, py - gy); X.clip(); X.globalAlpha *= .6; X.fillStyle = PAL.shine;
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
function museumLabel(x, y, a = 1) {
  if (a <= .01) return;
  X.save(); X.globalAlpha *= a;
  rect(x + 6, y + 6, 300, 196, PAL.ink, .08); rect(x, y, 300, 196, PAL.shine); X.strokeStyle = PAL.ink2; X.lineWidth = 1.2; X.strokeRect(x, y, 300, 196);
  text('蹲下翻找', x + 22, y + 50, { size: 34, font: F.serif, weight: 900 });
  text('Squat & Rummage', x + 22, y + 82, { size: 25, font: F.serifI, col: PAL.ink2 });
  line(x + 22, y + 100, x + 110, y + 100, 1.2, PAL.ink2);
  text('厨房旧习惯', x + 22, y + 128, { size: 19, font: F.serif, weight: 600, col: PAL.ink2 });
  text('材质：腰、膝盖、耐心', x + 22, y + 154, { size: 18, font: F.serif, weight: 400, col: PAL.ink2 });
  text('已退休 · 由拉篮接替', x + 22, y + 180, { size: 18, font: F.serif, weight: 700, col: PAL.ink });
  X.restore();
}
function exhibitHead(a = 1) {
  text('特展', 112, 92, { size: 22, font: F.serif, weight: 900, col: PAL.ink2, track: 6, a });
  text('Retired Habits — a small exhibition', 112, 124, { size: 24, font: F.serifI, col: PAL.grey, a });
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
  vcol(27, t, 410, 150, 116, { rule: 600, hold: .6 });
  cropMarks();
}
const CLAP_A = pose({ sL: 1.25, eL: -3.35, sR: 1.25, eR: -3.35, hL: .12, hR: .12 });
const CLAP_B = pose({ sL: 1.18, eL: -2.95, sR: 1.18, eR: -2.95, hL: .12, hR: .12, dy: -.05 });
function clapper(x, y, s, who, t, seed, o = {}) {
  const ph = sinceBeat(t + (o.delay ?? 0)) / BEAT, k = ph < .18 ? E.out5(ph / .18) : 1 - E.io((ph - .18) / .82);
  const P = lerpPose(CLAP_A, CLAP_B, k); P.head = .06 * Math.sin(t * 2 + seed); P.lean = .03 * Math.sin(t * 1.7 + seed);
  const f = figure(x, y, s, P, { who, seed, face: o.face ?? 'happy', w: .16 });
  if (ph < .35) {   // clap ticks
    const cx = (f.handL[0] + f.handR[0]) / 2, cy = (f.handL[1] + f.handR[1]) / 2, a = 1 - ph / .35, r0 = s * .7, r1 = s * (1.1 + ph * 1.5);
    for (const ang of [-2.2, -1.57, -.94]) line(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0, cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1, 3, PAL.ink, a);
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
  const k = E.io(seg(lt, 0, dur + .6));
  cam(lerp(1000, 990, k), lerp(520, 530, k), lerp(1.02, 1.0, k));
  museumWall(t); spotlight(t);
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
  museumLabel(690, 560, 1);
  // the crew, posing for the retirement photo in front of the plinth; LAN centre with flowers
  const gy = 1046;
  clapper(830, gy, 27, 'pony', t, 1, { delay: -.02 }); clapper(1010, gy, 27, 'buns', t, 4, { delay: .01 });
  clapper(1490, gy, 27, 'long', t, 7, { delay: -.01 }); clapper(1670, gy, 27, 'kit', t, 10, { delay: .02 });
  const lf = figure(1250, gy, 30, pose({ sL: 2.25 + .04 * Math.sin(t * 2), eL: .5, sR: .35, eR: .4, hL: .1, hR: .12, head: -.06 }), { who: 'lan', face: 'happy', blush: 1, seed: 11, w: .16 });
  bouquet(lf.handL[0] - 4, lf.handL[1] - 12, 34);
  camEnd();
  confetti(t, 92.88);
  toast(1240, 104, 600, '习惯「蹲下翻找」已下线', '感谢一直以来的付出', { k: seg(t, 92.88, 93.4), from: 80 });
  exhibitHead(1 - seg(lt, 0, .4));
  vcol(27, t, 410, 150, 116, { rule: 600, hold: .6 });
  cropMarks();
}

chapter('verse3', 73.0, 95.4, [
  [73.0, shotCorner],
  [beatT(113), shotPantry],
  [beatT(119) - .04, shotLift],
  [84.87, shotTiptoe],
  [beatT(129), shotMuseum],
  [beatT(134) - .03, shotParty],
]);
})();
