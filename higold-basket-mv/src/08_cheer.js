// 08_cheer.js — v2 "HIGOLD cheer squad" vocabulary, shared by every chapter so the whole film reads as one team:
// pom-poms, the cheerleader wrapper, varsity lettering, megaphone, pennant, scoreboard, count numerals, coach's play marks,
// bleachers, confetti, stadium light cones. Team colours = the brand palette: paper, ink, signal orange.
'use strict';

// ---------- pom-pom: a burst of tapered strands that shimmies on the 8ths ----------
// pompom(x, y, r, t, {col, col2, seed, shake 0..1, a})
function pompom(x, y, r, t, o = {}) {
  const n = o.n ?? 30, seed = o.seed ?? 1, sh = (o.shake ?? 1) * (.5 + .5 * pulse8(t, 5)), col = o.col ?? PAL.orange, col2 = o.col2 ?? PAL.ink;
  X.save(); X.globalAlpha *= (o.a ?? 1); X.translate(x, y); X.rotate(Math.sin(bp(t) * Math.PI) * .25 * sh);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(seed * 7 + i) * .35, len = r * (.72 + .38 * hash(seed + i * 3.3)) * (1 + .12 * sh * Math.sin(i * 2.1 + bp(t) * 4)),
      w = r * .11 * (.7 + .5 * hash(i * 9.1 + seed)), c = Math.cos(a), s = Math.sin(a);
    X.fillStyle = i % 5 === 0 ? col2 : col;
    X.beginPath(); X.moveTo(-s * w, c * w); X.quadraticCurveTo(c * len * .55 - s * w * 1.4, s * len * .55 + c * w * 1.4, c * len, s * len);
    X.quadraticCurveTo(c * len * .55 + s * w * 1.4, s * len * .55 - c * w * 1.4, s * w, -c * w); X.fill();
  }
  circle(0, 0, r * .16, { fill: col2 });
  X.restore();
}
// cheerleader = dancer + pom-poms at both hands (+ optional jersey number on the chest). Returns the figure's anchor points.
// cheerleader(x, y, s, move, t, {who, pom: true|false|'L'|'R', pomCol, num, ...dancer opts})
function cheerleader(x, y, s, mv, t, o = {}) {
  const f = dancer(x, y, s, mv, t, o);
  if (o.num != null) {
    const [nx, ny] = f.neck, [hx, hy] = f.hip, cx = lerp(nx, hx, .42), cy = lerp(ny, hy, .42);
    text(String(o.num), cx + s * .55, cy + s * .35, { size: s * 1.05, font: F.anton, col: o.dark ? PAL.paper : PAL.ink, align: 'left', a: .9 });
  }
  if (o.pom !== false) {
    const r = s * (o.pomR ?? 1.05), pc = o.pomCol ?? PAL.orange, c2 = o.dark ? PAL.paper : PAL.ink;
    if (o.pom !== 'R') pompom(f.handL[0], f.handL[1], r, t, { col: pc, col2: c2, seed: (o.seed ?? 3) * 2 + 1 });
    if (o.pom !== 'L') pompom(f.handR[0], f.handR[1], r, t, { col: pc, col2: c2, seed: (o.seed ?? 3) * 2 + 2 });
  }
  return f;
}
// the five-member squad in a line / V; like formation() but with pom-poms and jersey numbers (LAN = 1)
const SQUAD_NUM = { lan: 1, pony: 2, buns: 3, long: 4, kit: 5 };
function squad(t, o = {}) {
  const y = o.y ?? 930, s = o.s ?? 24, sp = o.spread ?? 260, out = {};
  CREW.forEach((who, i) => {
    if (o.skip && o.skip.includes(who)) return;
    const k = i - 2, x = (o.x ?? CX) + k * sp, mv = Array.isArray(o.move) ? o.move[i] : (o.move ?? 'cheer'), lead = who === 'lan';
    const vy = (o.v ?? 0) * Math.abs(k);           // V formation: outer members further up-stage
    out[who] = cheerleader(x, y - vy, s * (lead ? 1.12 : 1) * (1 - Math.abs(k) * (o.depth ?? 0)), mv, t,
      { who, dark: o.dark, col: o.dark ? PAL.paper : PAL.ink, delay: -(o.delay ?? .03) * Math.abs(k), seed: i * 3 + 1,
        face: lead ? (o.lanFace ?? 'smile') : (o.face ?? 'happy'), blush: lead ? 1 : 0, num: o.nums === false ? null : SQUAD_NUM[who], pom: o.pom });
  });
  return out;
}

// ---------- varsity lettering: collegiate block type (paper fill, ink outline, orange outer outline, hard offset shadow) ----------
// varsity(str, x, y, size, {align, k (0..1 slam-in), rot, fill, line, outer, shadow, font, track, a})
function varsity(str, x, y, size, o = {}) {
  const k = o.k ?? 1; if (k <= 0.001) return;
  const s = lerp(1.6, 1, E.out5(k)), font = o.font ?? F.anton, al = o.align ?? 'center', tr = o.track ?? size * .02;
  X.save(); X.globalAlpha *= (o.a ?? 1) * clamp(k * 3); X.translate(x, y); X.rotate(o.rot ?? 0); X.scale(s, s);
  const base = { size, font, align: al, track: tr, weight: 400 };
  const sh = size * .07;
  if (o.shadow !== false) text(str, sh, sh, { ...base, col: o.shadowCol ?? PAL.ink, stroke: o.shadowCol ?? PAL.ink, sw: size * .16 });
  text(str, 0, 0, { ...base, col: null, stroke: o.outer ?? PAL.orange, sw: size * .16 });
  text(str, 0, 0, { ...base, col: o.fill ?? PAL.paper, stroke: o.line ?? PAL.ink, sw: size * .07 });
  X.restore();
}
// giant count numeral / call word that slams on its onset and recoils (for One / Two / Three / Four / 走 / Hey)
function countSlam(str, x, y, size, t, t0, o = {}) {
  const lt = t - t0; if (lt < -.02) return;
  const k = clamp((lt + .02) / .12), rec = 1 + .08 * Math.exp(-lt * 9) * Math.sin(lt * 40);
  X.save(); X.translate(x, y); X.scale(rec, rec); X.translate(-x, -y);
  varsity(str, x, y, size, { k, rot: o.rot ?? -.04, ...o });
  X.restore();
}

// ---------- props ----------
function megaphone(x, y, s, rot = -.3, o = {}) {            // s = length in px
  X.save(); X.translate(x, y); X.rotate(rot);
  const L = s, r0 = s * .09, r1 = s * .3;
  fillPoly([[0, -r0], [L, -r1], [L, r1], [0, r0]], o.fill ?? PAL.orange);
  X.lineWidth = Math.max(2, s * .025); X.strokeStyle = PAL.ink; X.lineJoin = 'round'; poly([[0, -r0], [L, -r1], [L, r1], [0, r0]]); X.stroke();
  X.beginPath(); X.ellipse(L, 0, s * .06, r1, 0, 0, TAU); X.fillStyle = PAL.paper; X.fill(); X.stroke();
  rect(-s * .12, -r0 * .7, s * .12, r0 * 1.4, PAL.ink); rect(-s * .02, r0 * .3, s * .05, s * .16, PAL.ink);
  if (o.blast) for (let i = 0; i < 3; i++) { const rr = L + s * (.2 + i * .16) + o.blast * s * .2; X.beginPath(); X.arc(L - s * .1, 0, rr - L + s * .1, -.5, .5); X.lineWidth = s * .03; X.stroke(); }
  X.restore();
}
function pennant(x, y, w, h, str, o = {}) {                // triangular pennant on a stick, waving
  const t = o.t ?? T, wv = Math.sin(t * 5 + (o.seed ?? 0)) * h * .08;
  X.save(); X.translate(x, y); X.rotate(o.rot ?? 0);
  line(0, -h * .2, 0, h * 1.4, Math.max(3, h * .06), PAL.ink);
  fillPoly([[0, 0], [w, h / 2 + wv], [0, h]], o.fill ?? PAL.orange); X.strokeStyle = PAL.ink; X.lineWidth = 3; poly([[0, 0], [w, h / 2 + wv], [0, h]]); X.stroke();
  X.save(); X.beginPath(); X.moveTo(0, 0); X.lineTo(w, h / 2 + wv); X.lineTo(0, h); X.clip();
  text(str, w * .1, h / 2 + h * .14, { size: h * .36, font: F.anton, col: o.col ?? PAL.paper, rot: Math.atan2(wv, w) * .5 }); X.restore();
  X.restore();
}
// scoreboard(x, y, w, h, [[label, value], [label, value]], {clock, dark})
function scoreboard(x, y, w, h, rows, o = {}) {
  X.save(); X.globalAlpha *= (o.a ?? 1);
  rect(x + 10, y + 10, w, h, PAL.ink); rect(x, y, w, h, PAL.night); X.strokeStyle = PAL.ink; X.lineWidth = 4; X.strokeRect(x, y, w, h);
  const rh = h / (rows.length + (o.clock ? 1 : 0));
  rows.forEach(([lab, val], i) => {
    const yy = y + rh * (i + .5);
    text(lab, x + 28, yy + rh * .16, { size: rh * .42, font: F.anton, col: PAL.paper, track: 2 });
    text(String(val), x + w - 28, yy + rh * .22, { size: rh * .66, font: F.mono, weight: 800, col: i === 0 ? PAL.orange : PAL.paper, align: 'right' });
  });
  if (o.clock) text(o.clock, x + w / 2, y + h - rh * .3, { size: rh * .5, font: F.mono, weight: 800, col: PAL.orange, align: 'center' });
  X.restore();
}
// coach's play marks: X, O and a curved arrow (chalk-on-paper tactics)
function playX(x, y, r, o = {}) { handLine(x - r, y - r, x + r, y + r, { w: o.w ?? 5, col: o.col, seed: x }); handLine(x + r, y - r, x - r, y + r, { w: o.w ?? 5, col: o.col, seed: y }); }
function playO(x, y, r, o = {}) { handCircle(x, y, r, { w: o.w ?? 5, col: o.col, seed: x + y }); }
function playArrow(pts, k = 1, o = {}) {                  // pts: control points of a path; k: draw-on progress
  const n = 40, P = []; for (let i = 0; i <= n * clamp(k); i++) { const u = i / n; P.push(catmull(pts, u)); }
  if (P.length < 2) return; inkStroke(P, { w: o.w ?? 5, col: o.col, taper: [.02, .02], seed: o.seed ?? 3 });
  if (k >= .98) { const a = P[P.length - 1], b = P[P.length - 3]; const ang = Math.atan2(a[1] - b[1], a[0] - b[0]), hs = (o.w ?? 5) * 4;
    inkStroke([[a[0] - Math.cos(ang - .5) * hs, a[1] - Math.sin(ang - .5) * hs], a, [a[0] - Math.cos(ang + .5) * hs, a[1] - Math.sin(ang + .5) * hs]], { w: o.w ?? 5, col: o.col, taper: [.1, .1], seed: 9 }); }
}
function catmull(pts, u) {
  const n = pts.length - 1, f = u * n, i = Math.min(n - 1, Math.floor(f)), k = f - i, P = j => pts[clamp(j, 0, n)];
  const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), k2 = k * k, k3 = k2 * k;
  return [0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * k + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * k2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * k3));
}
// bleachers: rows of tiny fans (heads + raised arms on the beat), with an optional sea of pennants
function bleachers(y0, rows, t, o = {}) {
  const col = o.dark ? PAL.paper : PAL.ink, gap = o.gap ?? 34;
  X.save(); X.globalAlpha *= (o.a ?? 1);
  for (let r = 0; r < rows; r++) {
    const yy = y0 + r * gap * 1.05, sc = 1 - r * .06, n = Math.ceil(W / (gap * sc)) + 2;
    X.strokeStyle = col; X.lineWidth = 1.6; X.beginPath(); X.moveTo(0, yy + gap * .55); X.lineTo(W, yy + gap * .55); X.stroke();
    for (let i = 0; i < n; i++) {
      const x = (i + (r % 2) * .5) * gap * sc - gap, hh = hash(i * 13 + r * 71), jump = pulse(t + hh * .1, 7) * gap * .18 * (o.hype ?? 1);
      const hy = yy - jump;
      circle(x, hy, gap * .17 * sc, { stroke: col, w: 1.6, fill: o.dark ? PAL.night : PAL.paper });
      if (hh > .45) { const up = pulse(t + hh * .1, 5) > .4; line(x, hy + gap * .2, x - gap * .22, hy + (up ? -gap * .35 : gap * .05), 1.6, col); line(x, hy + gap * .2, x + gap * .22, hy + (up ? -gap * .35 : gap * .05), 1.6, col); }
      if (hh > .93) circle(x, hy - gap * .5, gap * .08, { fill: PAL.orange });
    }
  }
  X.restore();
}
// paper confetti (deterministic): strips and squares in ink / orange / paper-with-outline, tumbling down from t0
function confetti(t, t0, o = {}) {
  const n = o.n ?? 140, age = t - t0; if (age < 0) return;
  X.save(); X.globalAlpha *= (o.a ?? 1) * clamp(1 - (age - (o.life ?? 6)) / 1);
  for (let i = 0; i < n; i++) {
    const h1 = hash(i * 3.1 + (o.seed ?? 0)), h2 = hash(i * 7.7 + 1), h3 = hash(i * 1.9 + 5);
    const x = h1 * (W + 200) - 100 + Math.sin(age * (1 + h2 * 2) + i) * 40, y = -80 + (age * (160 + h2 * 260)) - h3 * 900;
    if (y < -60 || y > H + 60) continue;
    const rot = age * (2 + h3 * 6) + i, c = i % 3 === 0 ? PAL.orange : i % 3 === 1 ? PAL.ink : PAL.paper, w = 10 + h2 * 14, hh = 5 + h3 * 8 * Math.abs(Math.cos(rot));
    X.save(); X.translate(x, y); X.rotate(rot); rect(-w / 2, -hh / 2, w, hh, c); if (c === PAL.paper) { X.strokeStyle = PAL.ink; X.lineWidth = 1.2; X.strokeRect(-w / 2, -hh / 2, w, hh); } X.restore();
  }
  X.restore();
}
// stadium light cones from the top edge (night scenes)
function stadiumLights(t, o = {}) {
  X.save(); X.globalCompositeOperation = 'screen';
  for (let i = 0; i < (o.n ?? 4); i++) {
    const x = W * (i + .5) / (o.n ?? 4), sw = Math.sin(t * .8 + i * 1.7) * 120;
    const g = X.createLinearGradient(x, 0, x + sw, H); g.addColorStop(0, rgba(PAL.shine, .22 * (o.k ?? 1))); g.addColorStop(1, rgba(PAL.shine, 0));
    X.fillStyle = g; X.beginPath(); X.moveTo(x - 30, -10); X.lineTo(x + 30, -10); X.lineTo(x + sw + 260, H + 10); X.lineTo(x + sw - 260, H + 10); X.closePath(); X.fill();
  }
  X.restore();
}
