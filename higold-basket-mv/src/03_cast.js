// 03_cast.js — the cast: single-line ink 小人 (stick figures) in the HIGOLD doodle style, with K-pop choreography.
// LAN (小篮) is the lead: bob cut + a signal-orange hair clip, always centre. The crew: PONY (high ponytail), BUNS (two buns),
// LONG (long straight hair), KIT (short crop + cap). All original characters.
//
// figure(x, y, s, pose, o): (x, y) = ground point between the feet; s = px per body unit (body is ~10 units tall, so s = 30 → 300 px).
// Pose angles are radians. Arms/legs are measured from straight down; positive swings OUTWARD (away from the body's midline),
// so sR = π/2 is the right arm straight out sideways, π is straight up. eL/eR bend the forearm further (same sign = further out/up).
// hL/hR: thigh angle (outward +). kL/kR: knee bend (the shin swings back toward the midline). dy: body lift in units (+ = up).
// lean: torso tilt (+ = toward screen right). head: head tilt. Screen-right is the figure's LEFT hand (they face us) — we keep
// names by screen side: "L" = screen-left limb, "R" = screen-right limb.
'use strict';

const POSE0 = { dy: 0, lean: 0, head: 0, sL: .18, eL: 0, sR: .18, eR: 0, hL: .1, kL: 0, hR: .1, kR: 0, squash: 0 };
const pose = (o = {}) => ({ ...POSE0, ...o });
function lerpPose(a, b, k) { const r = {}; for (const key in POSE0) r[key] = lerp(a[key] ?? POSE0[key], b[key] ?? POSE0[key], k); return r; }
function mirrorPose(p) { return { ...p, lean: -p.lean, head: -p.head, sL: p.sR, eL: p.eR, sR: p.sL, eR: p.eL, hL: p.hR, kL: p.kR, hR: p.hL, kR: p.kL }; }

// ---------- key poses (the choreography vocabulary) ----------
const KP = {
  stand: pose(),
  ready: pose({ sL: .35, eL: .9, sR: .35, eR: .9, hL: .16, hR: .16, kL: .1, kR: .1 }),
  hips: pose({ sL: .9, eL: -1.9, sR: .9, eR: -1.9, hL: .14, hR: .14 }),                         // hands on hips
  // the signature move 拉 (pull): reach out, grab, yank back to the hip
  reach: pose({ lean: .08, sR: 1.45, eR: .05, sL: .9, eL: -1.9, hL: .08, hR: .28, kR: .05, head: .06 }),
  yank: pose({ lean: -.16, dy: -.25, sR: .7, eR: -1.7, sL: .9, eL: -1.9, hL: .22, kL: .35, hR: .2, kR: .35, head: -.12, squash: .06 }),
  point: pose({ lean: -.05, sR: 2.5, eR: 0, sL: .3, eL: .4, hL: .1, hR: .22, head: .1 }),         // point up-right
  pointDown: pose({ lean: .1, sR: .85, eR: 0, sL: .4, eL: .5, hL: .25, kL: .3, hR: .1, head: .15 }),
  armsUp: pose({ dy: .2, sL: 2.45, eL: .12, sR: 2.45, eR: .12, hL: .1, hR: .1 }),   // wide V so the arms clear the head
  heart: pose({ sL: 2.2, eL: 1.0, sR: 2.2, eR: 1.0, hL: .12, hR: .12, head: .05 }),               // big arm-heart: arms round over the head, hands clear of it
  cross: pose({ sL: .35, eL: 2.35, sR: .35, eR: 2.35, hL: .08, hR: .08 }),                       // arms crossed "X"
  squat: pose({ dy: -.9, sL: .8, eL: .9, sR: .8, eR: .9, hL: .55, kL: 1.1, hR: .55, kR: 1.1, squash: .04 }),
  jump: pose({ dy: 1.6, sL: 2.4, eL: .2, sR: 2.4, eR: .2, hL: .4, kL: 1.3, hR: .4, kR: 1.3 }),
  wave1: pose({ sR: 2.3, eR: .6, sL: .25, eL: .3, hL: .12, hR: .12, head: .08 }),
  wave2: pose({ sR: 2.3, eR: -.5, sL: .25, eL: .3, hL: .12, hR: .12, head: -.04 }),
  tiptoe: pose({ dy: .35, sR: 2.85, eR: .1, sL: 2.2, eL: .3, hL: .02, hR: .02, head: -.15 }),
  shrug: pose({ sL: .6, eL: -1.3, sR: .6, eR: -1.3, head: .2, hL: .1, hR: .1 }),
  thumb: pose({ sR: 1.2, eR: 1.3, sL: .2, eL: .2, hL: .1, hR: .12, head: -.08 }),
  frame: pose({ sL: 1.75, eL: 1.4, sR: 1.75, eR: 1.4, hL: .14, hR: .14 }),                         // hands framing the face
};

// ---------- moves: beat-synced pose generators ----------
// move(name, t, seed) → pose. Hits snap (out5) onto the beat and hold, K-pop style.
function hitMix(a, b, ph) { return lerpPose(a, b, E.out5(ph / .45)); }
function move(name, t, seed = 0) {
  const b = bp(t), n = Math.floor(b), ph = b - n, alt = (Math.floor(n / 8) + seed) % 2 === 1;
  let P;
  switch (name) {
    case 'idle': P = pose({ dy: .06 * Math.sin(t * 2.2 + seed), sL: .2, sR: .2, head: .04 * Math.sin(t * 1.3 + seed) }); break;
    case 'bounce': { const k = Math.abs(Math.sin(b * Math.PI)); P = lerpPose(KP.ready, pose({ ...KP.ready, dy: -.35, kL: .45, kR: .45, hL: .22, hR: .22, sL: .5, sR: .5 }), 1 - k); break; }
    case 'pull': { // 2-beat cycle: beat 0 reach, beat 1 yank (hit), alternate side every 2 bars
      const c = n % 2; P = c === 0 ? hitMix(KP.yank, KP.reach, ph) : hitMix(KP.reach, KP.yank, ph);
      if (alt) P = mirrorPose(P); break;
    }
    case 'point': { const c = n % 4; const A = [KP.point, KP.hips, mirrorPose(KP.point), KP.hips][c], B = [KP.hips, KP.point, KP.hips, mirrorPose(KP.point)][c]; P = hitMix(B, A, ph); break; }
    case 'wave': P = lerpPose(KP.wave1, KP.wave2, .5 + .5 * Math.sin(b * Math.PI)); if (alt) P = mirrorPose(P); break;
    case 'heart': P = lerpPose(KP.heart, pose({ ...KP.heart, dy: -.2, kL: .3, kR: .3, head: -.08 }), Math.abs(Math.sin(b * Math.PI))); break;
    case 'jump': { const k = Math.sin(clamp(ph / .8) * Math.PI); P = lerpPose(KP.squat, KP.jump, n % 2 ? k : 0); break; }
    case 'cross': P = hitMix(n % 2 ? KP.cross : KP.armsUp, n % 2 ? KP.armsUp : KP.cross, ph); break;
    case 'sway': P = pose({ lean: .14 * Math.sin(b * Math.PI), head: -.1 * Math.sin(b * Math.PI), dy: -.12 * Math.abs(Math.cos(b * Math.PI)), sL: .5 + .3 * Math.sin(b * Math.PI), eL: .8, sR: .5 - .3 * Math.sin(b * Math.PI), eR: .8, hL: .14, hR: .14, kL: .15, kR: .15 }); break;
    case 'step': { const s = Math.sin(b * Math.PI); P = pose({ lean: .05 * s, hL: .12 + .22 * Math.max(0, s), kL: .5 * Math.max(0, s), hR: .12 + .22 * Math.max(0, -s), kR: .5 * Math.max(0, -s), sL: .3 - .4 * s, eL: .5, sR: .3 + .4 * s, eR: .5, dy: .08 * Math.abs(s) }); break; }
    case 'run': { const s = Math.sin(t * 14 + seed); P = pose({ lean: .12, hL: .3 + .5 * s, kL: .9 * Math.max(0, s) + .2, hR: .3 - .5 * s, kR: .9 * Math.max(0, -s) + .2, sL: .6 - .7 * s, eL: 1.2, sR: .6 + .7 * s, eR: 1.2, dy: .15 * Math.abs(Math.cos(t * 14 + seed)) }); break; }
    case 'shrug': P = lerpPose(KP.stand, KP.shrug, Math.abs(Math.sin(b * Math.PI / 2))); break;
    case 'pointDown': P = hitMix(KP.hips, n % 2 ? KP.pointDown : mirrorPose(KP.pointDown), ph); break;
    default: P = KP[name] ? { ...KP[name] } : pose();
  }
  return P;
}

// ---------- drawing ----------
const HAIR = { lan: 'bob', pony: 'pony', buns: 'buns', long: 'long', kit: 'cap' };
// figure(x, y, s, pose, {who, col, w (line weight in units), face: 'dot'|'smile'|'o'|'happy'|'wow'|'closed'|'star', blush, flip, a, t, shadow})
function figure(x, y, s, P, o = {}) {
  const col = o.col ?? PAL.ink, lw = (o.w ?? .2) * s, who = o.who ?? 'lan', seed = o.seed ?? 11;
  P = { ...POSE0, ...P }; if (o.flip) P = mirrorPose(P);
  const U = s, torso = 3.1 * U, neck = .35 * U, ua = 1.75 * U, fa = 1.6 * U, th = 2.25 * U, sh = 2.2 * U, headR = 1.2 * U;
  // legs first to find the hip height from the ground (auto-grounding: the lower foot touches y unless dy lifts)
  const legVec = (h, k, side) => { const a1 = h * side, a2 = (h - k) * side; const kx = Math.sin(a1) * th, ky = Math.cos(a1) * th; return [kx, ky, kx + Math.sin(a2) * sh, ky + Math.cos(a2) * sh]; };
  const Lg = legVec(P.hL, P.kL, -1), Rg = legVec(P.hR, P.kR, 1);
  const hipH = Math.max(Lg[3], Rg[3]);
  const hx = x, hy = y - hipH - P.dy * U;
  const sq = 1 - (P.squash ?? 0);
  // spine
  const lean = P.lean, nx = hx + Math.sin(lean) * torso * sq, ny = hy - Math.cos(lean) * torso * sq;
  const headA = lean + P.head, hcx = nx + Math.sin(headA) * (neck + headR), hcy = ny - Math.cos(headA) * (neck + headR);
  X.save(); X.globalAlpha *= (o.a ?? 1);
  if (o.shadow !== false) { X.save(); X.globalAlpha *= .12 * clamp(1 - P.dy * .3, .3, 1); X.fillStyle = col; X.beginPath(); X.ellipse(x, y + lw * .4, 2.2 * U * clamp(1 - P.dy * .15, .5, 1), .28 * U, 0, 0, TAU); X.fill(); X.restore(); }
  const st = (pts, sd, w = lw, taper = [.15, .2]) => inkStroke(pts, { w, col, taper, wob: .5, seed: seed + sd, press: .2 });
  // legs + little feet
  const leg = (g, side, sd) => { const kx = hx + side * 0 + g[0], ky = hy + g[1], fx = hx + g[2], fy = hy + g[3]; st([[hx + side * .25 * U, hy], [kx, ky], [fx, fy], [fx + side * .55 * U, fy + .02 * U]], sd, lw, [.02, .12]); };
  leg(Lg, -1, 1); leg(Rg, 1, 2);
  // torso (slight curve)
  const mx = (hx + nx) / 2 - Math.cos(lean) * .15 * U, my = (hy + ny) / 2;
  st([[hx, hy], [mx, my], [nx, ny], [nx + Math.sin(lean) * neck, ny - Math.cos(lean) * neck]], 3, lw * 1.05, [.05, .05]);
  // arms from the shoulder point (just below the neck)
  const shx = nx - Math.sin(lean) * .25 * U, shy = ny + Math.cos(lean) * .25 * U;
  const arm = (sa, ea, side, sd) => {
    const a1 = lean + sa * side, a2 = lean + (sa + ea) * side;
    const ex = shx + Math.sin(a1) * ua, ey = shy + Math.cos(a1) * ua, hx2 = ex + Math.sin(a2) * fa, hy2 = ey + Math.cos(a2) * fa;
    return { pts: [[shx, shy], [ex, ey], [hx2, hy2]], sd, up: hy2 < shy - .6 * U || ey < shy - .9 * U };
  };
  // raised arms are drawn AFTER the head so the head's paper fill never swallows them
  const AL = arm(P.sL, P.eL, -1, 4), AR = arm(P.sR, P.eR, 1, 5), handL = AL.pts[2], handR = AR.pts[2];
  for (const A of [AL, AR]) if (!A.up) st(A.pts, A.sd, lw * .95, [.05, .25]);
  // hair behind the head (ponytail / long hair) — swings with lean + beat
  const swing = Math.sin(T * 5 + seed) * .12 + lean * 1.4 - (o.vx ?? 0) * .02;
  if (HAIR[who] === 'pony') { const bx = hcx + Math.sin(headA) * headR * .9, by = hcy - headR * .95; st([[bx, by], [bx + (1.1 + swing) * U * .9, by + .6 * U], [bx + (1.5 + swing * 2) * U * .8, by + 1.8 * U]], 9, lw * 1.6, [.1, .6]); }
  if (HAIR[who] === 'long') { for (const sd of [-1, 1]) st([[hcx + sd * headR * .9, hcy - headR * .2], [hcx + sd * headR * 1.1 + swing * U * .3, hcy + headR * 1.2], [hcx + sd * headR * 1.05 + swing * U * .6, hcy + headR * 2.3]], 12 + sd, lw * 1.3, [.05, .5]); }
  // head: paper fill so it occludes, then the ring
  X.save(); X.fillStyle = o.fill ?? (o.dark ? PAL.night : PAL.paper); X.beginPath(); X.arc(hcx, hcy, headR, 0, TAU); X.fill(); X.restore();
  handCircle(hcx, hcy, headR, { w: lw * .95, col, seed: seed + 6 });
  // hair on top
  X.save(); X.translate(hcx, hcy); X.rotate(headA);
  const hs = (pts, sd, ww = 1.5, tp = [.1, .3]) => inkStroke(pts.map(([a, b]) => [a * headR, b * headR]), { w: lw * ww, col, taper: tp, wob: .4, seed: seed + sd });
  switch (HAIR[who]) {
    case 'bob': // blunt bob with bangs: a heavy cap stroke + two jaw-length sides
      hs([[-1.12, .55], [-1.18, -.2], [-.9, -.88], [0, -1.16], [.9, -.88], [1.18, -.2], [1.12, .55]], 20, 2.6, [.02, .02]);
      hs([[-.95, -.55], [-.3, -.45], [.35, -.5], [.95, -.55]], 21, 1.7, [.05, .05]);
      hs([[-1.18, .5], [-.92, .62]], 22, 2.2, [0, .3]); hs([[1.18, .5], [.92, .62]], 23, 2.2, [0, .3]);
      break;
    case 'pony': hs([[-1.05, .1], [-.8, -.8], [0, -1.12], [.8, -.8], [1.05, .1]], 24, 2, [.05, .2]); hs([[-.6, -.9], [0, -.55], [.4, -.95]], 25, 1.2); break;
    case 'buns': hs([[-1.05, .15], [-.75, -.85], [0, -1.12], [.75, -.85], [1.05, .15]], 26, 1.8, [.05, .2]);
      X.restore(); for (const sd of [-1, 1]) { const [bx, by] = [hcx + Math.sin(headA + sd * .8) * headR * 1.25, hcy - Math.cos(headA + sd * .8) * headR * 1.25]; X.save(); X.fillStyle = col; X.beginPath(); X.arc(bx, by, headR * .36, 0, TAU); X.fill(); X.restore(); }
      X.save(); X.translate(hcx, hcy); X.rotate(headA); break;
    case 'long': hs([[-1.1, .4], [-1, -.6], [-.3, -1.1], [.5, -1.05], [1.05, -.5], [1.12, .4]], 27, 2.1, [.05, .05]); hs([[-.2, -1.1], [-.55, -.35]], 28, 1.2); break;
    case 'cap': hs([[-1.05, -.35], [-.8, -.95], [0, -1.18], [.8, -.95], [1.05, -.35]], 29, 2.4, [.02, .02]); hs([[-1.05, -.38], [1.85, -.42]], 30, 1.6, [.02, .3]); break;
  }
  // face
  const face = o.face ?? 'dot', ey = -.02, ex = .38;
  X.fillStyle = col; X.strokeStyle = col; X.lineCap = 'round';
  const dot = (x0, r = .11) => { X.beginPath(); X.arc(x0 * headR, ey * headR, r * headR, 0, TAU); X.fill(); };
  if (face === 'dot' || face === 'smile' || face === 'o' || face === 'wow') { dot(-ex); dot(ex); }
  if (face === 'happy' || face === 'closed') for (const sx of [-ex, ex]) { X.lineWidth = lw * .7; X.beginPath(); X.arc(sx * headR, (ey + (face === 'happy' ? .08 : -.05)) * headR, .14 * headR, face === 'happy' ? Math.PI * 1.1 : .1, face === 'happy' ? Math.PI * 1.9 : Math.PI - .1); X.stroke(); }
  if (face === 'star') for (const sx of [-ex, ex]) sparkle(sx * headR, ey * headR, .22 * headR, { col });
  X.lineWidth = lw * .7;
  if (face === 'smile' || face === 'happy' || face === 'star') { X.beginPath(); X.arc(0, .32 * headR, .2 * headR, .25, Math.PI - .25); X.stroke(); }
  if (face === 'o' || face === 'wow') { X.beginPath(); X.ellipse(0, .42 * headR, .1 * headR, (face === 'wow' ? .17 : .1) * headR, 0, 0, TAU); X.stroke(); }
  if (face === 'dot') { X.beginPath(); X.moveTo(-.1 * headR, .4 * headR); X.lineTo(.1 * headR, .4 * headR); X.stroke(); }
  if (o.blush) { X.save(); X.globalAlpha *= .5 * o.blush; X.fillStyle = PAL.orange; for (const sx of [-.62, .62]) { X.beginPath(); X.ellipse(sx * headR, .28 * headR, .16 * headR, .08 * headR, 0, 0, TAU); X.fill(); } X.restore(); }
  // LAN's signal-orange hair clip
  if (who === 'lan') { X.save(); X.translate(.62 * headR, -.62 * headR); X.rotate(-.6); X.fillStyle = PAL.orange; X.beginPath(); X.roundRect(-.28 * headR, -.08 * headR, .56 * headR, .16 * headR, .08 * headR); X.fill(); X.restore(); }
  X.restore();
  for (const A of [AL, AR]) if (A.up) st(A.pts, A.sd, lw * .95, [.05, .25]);
  X.restore();
  return { head: [hcx, hcy, headR], handL, handR, hip: [hx, hy], neck: [nx, ny] };
}
// dancer = figure + move
function dancer(x, y, s, mv, t, o = {}) { const P = typeof mv === 'string' ? move(mv, t + (o.delay ?? 0), o.seed ?? 0) : mv; return figure(x, y, s, { ...P, ...(o.pose ?? {}) }, o); }
const CREW = ['pony', 'buns', 'lan', 'long', 'kit'];   // formation order, LAN centre
