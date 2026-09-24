// 06_timeline.js — chapter registry, the one transition device ("the pull": the next scene glides in like a soft-close drawer),
// and the frame compositor. A shot fn(t, lt, dur) paints the ENTIRE frame (background included) and must be a pure function of t.
// Shots must also render sensibly for lt slightly past dur (up to +0.6 s): the outgoing shot keeps running under a transition.
'use strict';
const CH = [];
function chapter(name, start, end, shots, o = {}) { CH.push({ name, start, end, shots, ...o }); CH.sort((a, b) => a.start - b.start); }

// Chapter boundaries that get the pull transition. dir: 1 = new scene enters from the right, -1 from the left, 2 = from the bottom.
const PULLS = [
  { t: 23.0, dur: .5, dir: 1 }, { t: 38.5, dur: .55, dir: -1 }, { t: 59.0, dur: .5, dir: 1 }, { t: 73.0, dur: .55, dir: -1 },
  { t: 95.4, dur: .6, dir: 2 }, { t: 109.4, dur: .5, dir: 1 }, { t: 123.5, dur: .5, dir: -1 }, { t: 135.9, dur: .6, dir: 2 },
];
const PULL_LEAD = .16;     // the pull starts this long before the boundary so the reveal lands on the downbeat

let DARK = false;          // a shot sets DARK = true when its frame is mostly night; the grain pass switches to light grain
function shotAt(t) {
  const ch = CH.find(c => t >= c.start && t < c.end); if (!ch) return null;
  let i = 0; while (i + 1 < ch.shots.length && t >= ch.shots[i + 1][0]) i++;
  const t0 = ch.shots[i][0], end = i + 1 < ch.shots.length ? ch.shots[i + 1][0] : ch.end;
  return { ch, fn: ch.shots[i][1], t0, dur: end - t0 };
}
function paintShot(s, t) {
  X.save(); DARK = false;
  if (!s) { paperBG(); text('— scene not painted yet —', CX, CY, { size: 48, font: F.mono, align: 'center', col: PAL.grey }); }
  else s.fn(t, t - s.t0, s.dur);
  X.restore();
  return DARK;
}
let BUF = null;
function drawWorld(t, main) {
  const P = PULLS.find(p => t >= p.t - PULL_LEAD && t < p.t - PULL_LEAD + p.dur);
  if (!P) { const d = paintShot(shotAt(t), t); return d; }
  // transition: outgoing = the shot live just before the boundary (keeps running), incoming = the shot at the boundary
  const out = shotAt(P.t - .001), inc = shotAt(P.t + .001), k = E.soft((t - (P.t - PULL_LEAD)) / P.dur);
  if (!BUF) { BUF = document.createElement('canvas'); BUF.width = W; BUF.height = H; }
  const g = BUF.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const prev = X; X = g; const dIn = paintShot(inc, t); X = prev;
  const dOut = paintShot(out, t);
  // slide geometry: the incoming frame travels in with the drawer curve; the outgoing frame is pushed a little (parallax)
  const hz = P.dir !== 2, sgn = P.dir === -1 ? -1 : 1, off = (1 - k) * (hz ? W : H);
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  // darken the outgoing frame slightly as it is covered
  rect(0, 0, W, H, PAL.ink, .18 * k);
  const ox = hz ? sgn * off : 0, oy = hz ? 0 : off;
  X.drawImage(BUF, ox, oy);
  // hard shadow + steel edge on the leading side of the incoming panel
  const ex = hz ? (sgn > 0 ? ox : ox + W) : 0, ey = hz ? 0 : oy;
  if (k < .995) {
    if (hz) { rect(ex - (sgn > 0 ? 34 : 0), 0, 34, H, PAL.ink, .22); rect(ex - 5, 0, 10, H, PAL.ink); rect(ex - 2, 0, 3, H, PAL.steel2); }
    else { rect(0, ey - 34, W, 34, PAL.ink, .22); rect(0, ey - 5, W, 10, PAL.ink); rect(0, ey - 2, W, 3, PAL.steel2); }
  }
  X.restore();
  return k > .5 ? dIn : dOut;
}
