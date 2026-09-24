// c02_chorus1.js — Chorus 1 · "Comeback stage" (23.0 – 38.5 s). Paper + the first real orange. The viral hook.
// Shots cut on the beat grid (beatT(n) = 0.19 + n × 0.682). Every shot paints the whole frame and is a pure function of t.
// The signature 拉 move is staged as a real DRAWER PULL: every dancer grabs an orange handle on the reach and yanks a
// wire basket out of its slot on the hit — the dance-challenge moment.
(() => {
  'use strict';
  const bt = beatT;
  const T6 = LY[6].t, T7 = LY[7].t, T8 = LY[8].t, T9 = LY[9].t, T10 = LY[10].t, T11 = LY[11].t;

  // ---------- cut list (song seconds) ----------
  const C_HOOK = 23.0, C_MARCH = 24.54, C_SPICE = bt(38.4), C_BEND = bt(40.5), C_STEEL = bt(43), C_STEEL2 = bt(44.5),
    C_MACRO = bt(46), C_PULL = bt(48.5), C_HEART = bt(50.5), C_TAG = bt(52);

  // ---------- small private helpers ----------
  const snapK = (t, t0, d = .14) => E.out5((t - t0) / d);
  const dec = (t, t0, k = 8) => t < t0 ? 0 : Math.exp(-(t - t0) * k);
  const punch = (t, ts, amt, k = 9) => ts.reduce((s, ti) => s + amt * dec(t, ti, k), 0);
  // pose track: [[t, pose, dur?], …] — each key snaps (out5) from wherever the previous keys left the body
  function poseAt(t, keys, d = .13) {
    let P = keys[0][1];
    for (let i = 1; i < keys.length && t >= keys[i][0]; i++) P = lerpPose(P, keys[i][1], E.out5((t - keys[i][0]) / (keys[i][2] ?? d)));
    return P;
  }
  // where a figure's hands would be, without drawing it
  const handsOf = (x, y, s, P, o = {}) => { const r = figure(x, y, s, P, { ...o, a: 0, shadow: false }); return r; };
  // partial polyline (0..1 of its length) for stroke-on animation
  function partial(pts, k) {
    if (k >= 1) return pts; if (k <= 0) return [pts[0], pts[0]];
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + dist(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]));
    const s = L[L.length - 1] * k, out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (L[i] <= s) out.push(pts[i]);
      else { const f = (s - L[i - 1]) / (L[i] - L[i - 1] || 1); out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break; }
    }
    return out;
  }
  // 2D steel bar (the slide rail / a bar handle): ink outline, steel body, white core. vertical if o.vert
  function steelBar(x1, y, x2, h = 14, o = {}) {
    if (Math.abs(x2 - x1) < 1) return;
    if (x2 < x1) [x1, x2] = [x2, x1];
    X.save(); X.globalAlpha *= (o.a ?? 1);
    rrect(x1 - 2, y - h / 2 - 2, x2 - x1 + 4, h + 4, h / 2 + 2, { fill: PAL.ink });
    rrect(x1, y - h / 2, x2 - x1, h, h / 2, { fill: o.col ?? PAL.steel1 });
    rrect(x1 + h * .3, y - h * .3, Math.max(0, x2 - x1 - h * .6), h * .22, h * .11, { fill: PAL.shine, a: .85 });
    X.restore();
  }
  // steel wire along a 2D path (the 3D engine's 'steel' look, in 2D)
  function wire2(pts, w, o = {}) {
    const path = (dx = 0, dy = 0) => { X.beginPath(); pts.forEach((p, i) => i ? X.lineTo(p[0] + dx, p[1] + dy) : X.moveTo(p[0] + dx, p[1] + dy)); if (o.close) X.closePath(); };
    X.save(); X.globalAlpha *= (o.a ?? 1); X.lineCap = 'round'; X.lineJoin = 'round';
    path(); X.strokeStyle = PAL.ink; X.lineWidth = w + 3.2; X.stroke();
    path(); X.strokeStyle = PAL.steel1; X.lineWidth = w; X.stroke();
    path(-w * .16, -w * .2); X.strokeStyle = rgba(PAL.shine, o.hl ?? .8); X.lineWidth = Math.max(.8, w * .34); X.stroke();
    X.restore();
  }
  // manga impact ticks around a landing character
  function impact(cx, cy, r, age, seed, col = PAL.ink, n = 10) {
    if (age < 0 || age > .26) return; const k = age / .26, a = 1 - k;
    for (let q = 0; q < n; q++) {
      const ang = (q + hash(seed + q) * .6) / n * TAU, r0 = r * (1 + .3 * E.out(k)), r1 = r0 + r * (.16 + .12 * hash(seed * 3 + q)) * (1 - k * .6);
      inkStroke([[cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0], [cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1]], { w: 7 * a + 1, col, taper: [.1, .6], wob: .3, seed: seed + q, a });
    }
  }
  // a paper-white glint with a thin ink edge (reads as SHINE on steel, never as dirt)
  function glint(x, y, r, k, rot = 0) {
    if (k < .02) return;
    sparkle(x, y, r * 1.12, { k, col: PAL.ink, rot }); sparkle(x, y, r, { k, col: PAL.shine, rot });
  }
  // the allowed steel sheen: a soft white band swept across the product's screen box once per beat on the drawer curve
  function sheen(box, t, o = {}) {
    const [x0, y0, x1, y1] = box, k = E.soft(clamp(sinceBeat(t) / (o.dur ?? .6))), bw = o.w ?? 150;
    const bx = lerp(x0 - bw * 2, x1 + bw * 2, k);
    X.save(); X.beginPath(); X.rect(x0, y0, x1 - x0, y1 - y0); X.clip();
    X.translate(bx, (y0 + y1) / 2); X.rotate(o.rot ?? -.45);
    const g = X.createLinearGradient(-bw, 0, bw, 0);
    g.addColorStop(0, rgba(PAL.shine, 0)); g.addColorStop(.5, rgba(PAL.shine, o.a ?? .62)); g.addColorStop(1, rgba(PAL.shine, 0));
    X.fillStyle = g; X.fillRect(-bw, -2000, bw * 2, 4000);
    X.restore();
    return lerp(-1, 1, k);   // normalised sweep position for render3's shine
  }
  const screenBox = (C, pts) => { const P = pts.map(p => pin(C, p)); return [Math.min(...P.map(p => p[0])), Math.min(...P.map(p => p[1])), Math.max(...P.map(p => p[0])), Math.max(...P.map(p => p[1]))]; };
  const boxCorners = (x0, y0, z0, x1, y1, z1) => [[x0, y0, z0], [x1, y0, z0], [x0, y1, z0], [x1, y1, z0], [x0, y0, z1], [x1, y0, z1], [x0, y1, z1], [x1, y1, z1]];

  // ---------- private lyric presenter: per-character SLAM ----------
  // o: {x, y (baseline of first shown row), size, font, weight, align, rows, hi, pop, dur, ticks, tickR, col, track, lead, pullIn}
  function slam(i, t, o = {}) {
    const env = lyEnv(i, t, o.hold ?? .15, o.fade ?? .2); if (env <= 0) return null; LYRIC_DRAWN.add(i);
    const all = lyRows(i), rows = o.rows ? o.rows.map(r => all[r]) : all;
    const size = o.size ?? 300, font = o.font ?? F.heavy, wt = o.weight ?? 900, track = o.track ?? -size * .03, lead = size * (o.lead ?? 1.06);
    const boxes = [];
    X.save(); X.globalAlpha *= env;
    rows.forEach((row, r) => {
      const ws = row.map(c => measure(c.ch, size, font, wt) + track), tw = ws.reduce((s, w) => s + w, 0) - track;
      let x = (o.x ?? CX) - (o.align === 'left' ? 0 : o.align === 'right' ? tw : tw / 2);
      const y = (o.y ?? CY) + r * lead;
      row.forEach((c, j) => {
        const k = chK(c.ti, t, o.dur ?? .13), w = ws[j], hot = !!(o.hi && o.hi.includes(c.ch)), cx = x + (w - track) / 2, cy = y - size * .37;
        boxes.push({ ch: c.ch, x, y, w, cx, cy, k, hot, ti: c.ti });
        const pulled = o.pullIn && o.pullIn.includes(c.ch), col = hot ? PAL.orange : (o.col ?? PAL.ink);
        if (pulled && c.ti != null && t >= c.ti - .2) {
          // PULLED into its slot from the right on the drawer curve; seats exactly on its onset (the beat), streaks decay after
          const kp = E.soft((t - c.ti + .2) / .24), off = (1 - kp) * (o.pullDist ?? 1100), sk = 1 - clamp((t - c.ti) / .22);
          for (let q = 0; q < 7; q++) {
            const yy = y - size * (.1 + q * .12), len = off * (.35 + hash(q * 3.1) * .6) + 70 * sk, x0 = x + w - track + off - 6 + hash(q) * 30;
            if (len > 8) inkStroke([[x0, yy], [x0 + len, yy]], { w: 10 * Math.max(1 - kp, sk * .6) + 2, col, taper: [.05, .9], wob: .4, seed: 700 + q, a: .85 * Math.max(1 - kp * .8, sk * .7) });
          }
          const sq = 1 + .12 * (1 - kp);
          X.save(); X.translate(cx + off, cy); X.scale(sq, 1 / sq); X.translate(-cx, -cy);
          text(c.ch, x, y, { size, font, weight: wt, col });
          X.restore();
        } else if (k > 0 && !pulled) {
          const e = E.out5(k), s = lerp(o.pop ?? 1.55, 1, e), rot = (1 - e) * (hash(i * 10 + j + r * 5) - .5) * .35;
          X.save(); X.translate(cx, cy); X.rotate(rot); X.scale(s, s); X.translate(-cx, -cy);
          text(c.ch, x, y, { size, font, weight: wt, col, a: clamp(k * 4) });
          X.restore();
          if (o.ticks !== false && c.ti != null) impact(cx, cy, size * (o.tickR ?? .6), t - c.ti, i * 31 + j * 7 + r, hot ? PAL.orange : PAL.ink);
        }
        x += w;
      });
    });
    X.restore();
    return boxes;
  }

  // =====================================================================================================
  // THE DRAWER PULL (shared by the hook and the bend shot): reach down to an orange handle at waist height, then throw the
  // body back with knees bent — the hand stays on the handle, so the wire basket comes out of its slot with it.
  // Hand (in body units from the ground point): reach ≈ (+3.56, −5.07), yank ≈ (+1.05, −4.54) — both on the vertical handle.
  // =====================================================================================================
  const REACH_D = pose({ lean: .26, dy: -.3, head: .12, sR: .72, eR: .05, sL: 1.35, eL: .55, hL: .12, kL: .25, hR: .5, kR: .4 });
  const YANK_D = pose({ lean: -.38, dy: -.45, head: -.22, sR: .62, eR: 1.3, sL: 2.0, eL: .4, hL: .36, kL: .7, hR: .3, kR: .45, squash: .08 });
  const SLOT_U = 4.3, FRONT_U = .42;
  // side-elevation mini drawer attached to a dancer: slot (cabinet face) fixed, front slab + orange handle at hx
  function pullDrawer(gx, gy, s, side, hx, a, yankT, t) {
    if (a <= .01) return;
    const slot = gx + side * SLOT_U * s, top = gy - 6.0 * s, bot = gy - 3.75 * s, ft = FRONT_U * s;
    const f0 = hx + side * .1 * s, f1 = f0 + side * ft, xa = Math.min(f1, slot), xb = Math.max(f1, slot);
    X.save(); X.globalAlpha *= a;
    if (xb - xa > 2) {
      X.save(); X.beginPath(); X.rect(xa, top - 3 * s, xb - xa, 6 * s); X.clip();
      for (let k = 0; k < 3; k++) {   // plates standing in the rack, peeking over the rim
        const px = f1 + side * (.75 + k * .6) * s; X.save(); X.beginPath(); X.ellipse(px, top + .35 * s, .2 * s, .95 * s, side * .12, 0, TAU);
        X.fillStyle = PAL.paper; X.fill(); X.strokeStyle = PAL.ink; X.lineWidth = Math.max(1.5, .09 * s); X.stroke(); X.restore();
      }
      X.save(); X.strokeStyle = PAL.ink; X.lineWidth = Math.max(1.4, .07 * s); X.beginPath();
      for (let x = slot - side * .3 * s; (x - f1) * side > 0; x -= side * .42 * s) { X.moveTo(x, top + .3 * s); X.lineTo(x, bot); }
      X.stroke(); X.restore();
      wire2([[xa, top + .3 * s], [xb, top + .3 * s]], .2 * s); wire2([[xa, bot], [xb, bot]], .15 * s);
      X.restore();
    }
    inkStroke([[slot, top - .6 * s], [slot, bot + .5 * s]], { w: .22 * s, seed: 5 + side, taper: [.1, .1] });   // the cabinet face
    const fx = Math.min(f0, f1);
    rect(fx, top - .35 * s, ft, bot - top + .7 * s, PAL.paper);
    X.save(); X.strokeStyle = PAL.ink; X.lineWidth = Math.max(2, .1 * s); X.strokeRect(fx, top - .35 * s, ft, bot - top + .7 * s); X.restore();
    // the orange handle bar (vertical, so the hand can ride it from reach height down to yank height)
    rrect(hx - .15 * s, gy - 5.55 * s, .3 * s, 1.3 * s, .15 * s, { fill: PAL.orange, stroke: PAL.ink, w: Math.max(2, .09 * s) });
    // speed streaks on the yank
    if (yankT != null && t >= yankT && t < yankT + .3) {
      const k = (t - yankT) / .3;
      for (let q = 0; q < 3; q++) {
        const yy = lerp(top + .6 * s, bot - .2 * s, q / 2), x0 = f1 + side * (.4 + q * .3) * s, x1 = x0 + side * (2.4 - q * .5) * s * (1 - k);
        inkStroke([[x0, yy], [x1, yy]], { w: .16 * s * (1 - k) + 1, taper: [.05, .8], seed: 90 + q, a: 1 - k });
      }
    }
    X.restore();
  }

  // =====================================================================================================
  // SHOT 1 · HOOK — 一拉就到位. Giant per-character slam; five drawers yanked open in unison on the syllables.
  // =====================================================================================================
  const HOOK_KEYS = [
    [-9, KP.ready],
    [T6[0], REACH_D, .1],                                                   // 一  reach + grab
    [T6[1], YANK_D, .08],                                                   // 拉  YANK (beat 34)
    [T6[2], pose({ ...YANK_D, dy: -.62, kL: .85, kR: .6 }), .1],            // 就  sink
    [bt(34.5), pose({ ...YANK_D, dy: -.4 }), .2],                           //     groove back up
    [T6[3], mirrorPose(REACH_D), .1],                                       // 到  reach the other way (beat 35)
    [T6[4], mirrorPose(YANK_D), .08],                                       // 位  yank — in place
  ];
  function hookCrew(t) {
    const gy = 1046, sp = 322, P = poseAt(t, HOOK_KEYS);
    CREW.forEach((who, i) => {
      const k = i - 2, lead = who === 'lan', s = 34 * (lead ? 1.1 : 1), gx = CX + k * sp;
      const o = { who, seed: i * 3 + 1, face: lead ? (t > T6[1] ? 'happy' : 'smile') : 'dot', blush: lead ? 1 : 0 };
      const home = side => gx + side * (SLOT_U - .1 - FRONT_U - .02) * s;
      // right-hand drawer: grabbed on 一, yanked on 拉, released on 到 → soft-closes home and fades
      if (t >= T6[0] - .02) {
        let hx, a = clamp((t - T6[0] + .02) / .08);
        if (t < T6[1]) hx = home(1);
        else if (t < T6[3]) hx = Math.min(home(1), handsOf(gx, gy, s, P, o).handR[0]);
        else {
          const held = Math.min(home(1), handsOf(gx, gy, s, poseAt(T6[3] - .001, HOOK_KEYS), o).handR[0]);
          hx = lerp(held, home(1), E.soft((t - T6[3]) / .3)); a *= 1 - clamp((t - T6[3] - .18) / .1);
        }
        pullDrawer(gx, gy, s, 1, hx, a, T6[1], t);
      }
      // left-hand drawer: grabbed on 到, yanked on 位
      if (t >= T6[3] - .02) {
        const hx = t < T6[4] ? home(-1) : Math.max(home(-1), handsOf(gx, gy, s, P, o).handL[0]);
        pullDrawer(gx, gy, s, -1, hx, clamp((t - T6[3] + .02) / .08), T6[4], t);
      }
      figure(gx, gy, s, P, o);
    });
  }
  function sHook(t, lt) {
    paperBG();
    const hits = [T6[1], T6[3]], z = 1 + .03 * E.io(clamp((lt + .2) / 1.6)) + punch(t, hits, .03, 8) + punch(t, [T6[4]], .02, 8);
    const [shx, shy] = shake(t, 9 * dec(t, T6[1], 11) + 6 * dec(t, T6[4], 11), 7);
    cam(CX + shx, CY + shy, z);
    bigBasketBG(t, { a: .04, sy: 470, px: 1250, spin: .16, yaw: -.3 });
    stageFloor(1046);
    hookCrew(t);
    // the text row + the slide rail that "pulls out" under it, one character at a time; 拉 itself is PULLED in from the right
    const size = 322, base = 500;
    const boxes = slam(6, t, { size, y: base, hi: '拉', pop: 1.6, dur: .12, pullIn: '拉' });
    if (boxes) {
      const x0 = boxes[0].x + 8, ends = boxes.map(b => b.x + b.w - 24);
      let xr = x0;
      boxes.forEach((b, j) => { if (b.ti != null && t >= b.ti) xr = lerp(j ? ends[j - 1] : x0, ends[j], E.soft((t - b.ti) / .42)); });
      const ry = base + 58;
      steelBar(x0, ry, xr, 13);
      if (t >= T6[4]) {   // soft-close: the damper dot clicks home in orange, right on 位
        const k = snapK(t, T6[4], .14);
        circle(xr + 18, ry, 16 * E.back(k, 3), { fill: PAL.orange, stroke: PAL.ink, w: 3.5 });
      }
    }
    camEnd();
    metaStrip(t, { tl: 'CHORUS 01  ·  COMEBACK STAGE', a: .9 });
  }

  // =====================================================================================================
  // SHOT 2 · 锅碗瓢盆排队 — low front view: kitchenware queues up on the syllables, then hops into the basket in single
  // file on parallel arcs (a 32nd apart), the last one landing on 队 (beat 38).
  // =====================================================================================================
  const PROF_BASIN = [[0, 0], [62, 0], [70, 6], [100, 34], [118, 60], [121, 64]];
  const PROF_LADLE = [[0, 0], [22, 0], [36, 10], [44, 26], [45, 28]];
  function itemPrims(kind, at, tilt = 0) {
    const P = [];
    if (kind === 'pot') {
      P.push(lathe(at, PROF.pot, { open: true, fill: PAL.paper2 }));
      for (const s of [-1, 1]) P.push({ k: 'wire', pts: [[at[0] + s * 120, at[1] + 104, at[2]], [at[0] + s * 150, at[1] + 108, at[2]], [at[0] + s * 150, at[1] + 90, at[2]], [at[0] + s * 120, at[1] + 86, at[2]]], r: 5 });
    } else if (kind === 'bowl') P.push(lathe(at, PROF.bowl.map(([r, y]) => [r * 1.25, y * 1.25]), { open: true }));
    else if (kind === 'ladle') {
      P.push(lathe(at, PROF_LADLE.map(([r, y]) => [r * 1.3, y * 1.3]), { open: true, fill: PAL.paper2 }));
      P.push({ k: 'wire', pts: [[at[0] + 52, at[1] + 34, at[2]], [at[0] + 100, at[1] + 120, at[2]], [at[0] + 128, at[1] + 230, at[2]]], r: 7 });
    } else if (kind === 'basin') P.push(lathe(at, PROF_BASIN, { open: true }));
    if (!tilt) return P;
    return xf(P, p => { const q = rotZ(vsub(p, at), tilt); return vadd(q, at); });
  }
  const MARCH = ['pot', 'bowl', 'ladle', 'basin'];
  function sMarch(t, lt) {
    paperBG();
    dotGrid(24, 24, W, H, 48, 1.4, PAL.ink, .08);
    const land = bt(38), zp = 1 + punch(t, [land], .08, 6);
    const ext = 220 + 260 * E.soft((lt + .12) / .8);
    cam(CX, CY, zp);
    // tracking shot: framed on the queue while it forms, then the camera pans right with the leap and lands on the basket
    const ax = lerp(-800, -40, E.io((t - T7[4] + .08) / (land - T7[4] + .2)));
    const C = frameCam([ax, 110, 820], -.07 + lt * .015, .22, CX, 770, 1100, 1480, { fov: 30 });
    const prims = [];
    prims.push(...boxModel(-480, -20, -20, 480, 360, 460, { sides: 'lrbk', fill: PAL.paper, sideFill: PAL.paper2, backFill: PAL.paper2 }));
    prims.push(...boxModel(-500, 360, -20, 500, 392, 492, { sides: 'lrtf', fill: PAL.paper, frontFill: PAL.paper2 }));
    const bw = 900, bd = 400, by = 40;
    prims.push(...translate3(basketModel({ w: bw, d: bd, h: 150, type: 'plain', gap: 30 }), [0, by, ext]));
    prims.push(...slideModel(-bw / 2 - 14, by + 80, bd, ext), ...slideModel(bw / 2 + 14, by + 80, bd, ext));
    // queue: each item hops into its spot on its syllable (锅 碗 瓢 盆), bounces on the 8ths; the front of the line takes the far
    // slot so all four flights run parallel; take-offs a 32nd apart from 排, the last landing on 队
    const shadows = [], zq = 1000, qx = [-545, -735, -925, -1115], slotX = [315, 105, -105, -315];
    MARCH.forEach((kind, i) => {
      const t0 = T7[i] - .1; if (t < t0) return;
      let x, y, z = zq, tilt;
      const k = clamp((t - t0) / .1);
      x = lerp(-1900, qx[i], E.out(k)); y = -20 + 150 * Math.sin(k * Math.PI); tilt = -.35 * (1 - E.out(k));
      if (k >= 1) { const ph = frac(bp(t) * 2); y = -20 + 34 * Math.sin(ph * Math.PI); tilt = .1 * Math.sin(bp(t) * Math.PI); }
      const up = T7[4] + i * .085, dn = land - (3 - i) * .085;
      if (t >= up) {
        const kk = clamp((t - up) / (dn - up)), kx = E.io(kk), tz = ext + 200;
        x = lerp(qx[i], slotX[i], kx); z = lerp(zq, tz, kx); y = lerp(-20, by + 4, kx) + 330 * Math.sin(kk * Math.PI);
        tilt = Math.sin(kk * TAU) * .22;
        if (t >= dn) { x = slotX[i]; z = tz; y = by + 4 + 20 * Math.abs(Math.sin(bp(t) * Math.PI * 2)) * dec(t, land, 3); tilt = 0; }
      }
      const items = scale3(itemPrims(kind, [0, 0, 0], tilt), .86).map(p => ({ ...p, bias: -40 }));
      prims.push(...translate3(items, [x, y, z]));
      if (t < dn) shadows.push([x, z, y + 20, kind === 'ladle' ? 50 : 100]);
    });
    shadows.forEach(([x, z, hgt, r]) => {
      const c = pin(C, [x, -20, z]), rx = pin(C, [x + r, -20, z])[0] - c[0], k = clamp(1 - hgt / 400);
      X.save(); X.globalAlpha *= .13 * k; X.fillStyle = PAL.ink; X.beginPath(); X.ellipse(c[0], c[1], rx * (.7 + .3 * k), rx * .2 * (.7 + .3 * k), 0, 0, TAU); X.fill(); X.restore();
    });
    render3(prims, C, { style: 'steel', shine: lerp(-600, 600, frac(bp(t) / 2)) });
    // the payoff on beat 38: alignment guide + detection tag
    if (t >= land - .02) {
      const k = snapK(t, land, .22), gy = by + 150 + 40, tz = ext + 200;
      const p0 = pin(C, [slotX[3] - 160, gy, tz]), p1 = pin(C, [slotX[0] + 160, gy, tz]);
      X.save(); X.setLineDash([16, 12]); line(p0[0], p0[1], lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), 5, PAL.cobalt, .95); X.restore();
      slotX.forEach((sx, j) => { const q = pin(C, [sx, gy, tz]), kj = snapK(t, land + .03 + j * .04, .18); circle(q[0], q[1], 11 * kj, { fill: PAL.cobalt }); });
      const b = screenBox(C, boxCorners(-450, by, ext, 450, by + 150, ext + bd));
      bbox(b[0] - 14, b[1] - 50, b[2] - b[0] + 28, b[3] - b[1] + 64, '排队完成 ✓', { k: clamp((t - land - .04) / .2), lw: 4, size: 28 });
    }
    camEnd();
    lySide(7, t, { x: 120, y: 260, size: 120 });
  }

  // =====================================================================================================
  // SHOT 3 · 调料一眼看见 — straight down into the seasoning drawer; a cobalt reticle finds a jar on every syllable.
  // =====================================================================================================
  const SPICE = [['盐', 'jar'], ['糖', 'bottle'], ['醋', 'jar'], ['生抽', 'bottle'], ['花椒', 'jar'], ['八角', 'jar']];
  function sSpice(t, lt) {
    paperBG();
    dotGrid(24, 24, W, H, 48, 1.4, PAL.ink, .07);
    const bw = 600, bd = 430, zc = 470 + 205, ext = 300 + 150 * E.soft((lt + .1) / .7);
    const C = camera3({ eye: [-40 + lt * 30, 1380, zc + 60], at: [0, 0, zc], up: [0, 0, -1], fov: 30, cx: 1270, cy: 590 });
    const prims = [];
    prims.push(...translate3(basketModel({ w: bw, d: bd, h: 120, type: 'plain', gap: 30, midRim: false, rimR: 30 }), [0, 0, ext]));
    prims.push(...slideModel(-bw / 2 - 14, 60, bd, ext), ...slideModel(bw / 2 + 14, 60, bd, ext));
    prims.push(...doorModel(-bw / 2 - 26, -30, bw / 2 + 26, 150, bd + 20 + ext, { th: 18 }));
    const pos = [];
    SPICE.forEach(([, kind], i) => {
      const at = [[-190, 0, 190][i % 3], 4, [112, 318][Math.floor(i / 3)] + ext];
      const prof = kind === 'jar' ? PROF.jar.map(([r, y]) => [r * 1.6, y]) : PROF.bottle.map(([r, y]) => [r * 1.35, y * .75]);
      prims.push({ ...lathe(at, prof, { fill: i % 2 ? PAL.paper : PAL.paper2 }), bias: -30 });
      pos.push([at, prof, kind]);
    });
    render3(prims, C, { style: 'ink', lw: 1.15 });
    // clean tops: one solid lid disc per jar (the stacked rings of a lathe seen from straight above read as a double exposure)
    pos.forEach(([at, prof, kind], i) => {
      const top = prof[prof.length - 1][1], c = pin(C, [at[0], at[1] + top, at[2]]);
      const rBody = pin(C, [at[0] + Math.max(...prof.map(q => q[0])), at[1] + top * .7, at[2]])[0] - c[0];
      const rLid = kind === 'jar' ? rBody * .86 : rBody * .44;
      circle(c[0], c[1], rBody, { fill: i % 2 ? PAL.paper : PAL.paper2, stroke: PAL.ink, w: 3 });
      circle(c[0], c[1], rLid, { fill: PAL.paper, stroke: PAL.ink, w: 2.5 });
      circle(c[0], c[1], rLid * .72, { stroke: PAL.ink2, w: 1.4, a: .7 });
    });
    // the worktop: the basket slides out from under its front edge
    const ce = pin(C, [0, 330, 470]), cl = pin(C, [-bw / 2 - 150, 330, 470])[0];
    rect(cl, -10, W - cl + 20, ce[1] + 10, PAL.paper2);
    hatch([[cl, -10], [W + 10, -10], [W + 10, ce[1]], [cl, ce[1]]], { gap: 22, w: 1, a: .12, angle: -.7, seed: 3 });
    handLine(cl, ce[1], W + 20, ce[1], { w: 3.5, seed: 44 }); handLine(cl, -10, cl, ce[1], { w: 3, seed: 45 });
    // the "eye": a cobalt reticle hops jar to jar on the syllables, leaving a detection box on each
    const found = T8.filter(ti => t >= ti - .06).length;
    const ctr = j => { const [at, prof] = pos[j]; return pin(C, [at[0], at[1] + prof[prof.length - 1][1], at[2]]); };
    pos.forEach(([at, prof], i) => {
      const top = prof[prof.length - 1][1], rMax = Math.max(...prof.map(q => q[0]));
      const c = pin(C, [at[0], at[1] + top, at[2]]), rr = pin(C, [at[0] + rMax, at[1] + top, at[2]])[0] - c[0] + 14;
      const k = clamp((t - T8[i] + .04) / .22);
      if (k > 0) bbox(c[0] - rr, c[1] - rr, rr * 2, rr * 2, SPICE[i][0] + ' ✓', { k, lw: 3, size: 24 });
    });
    if (found > 0) {
      const i = found - 1, k = E.out5((t - (T8[i] - .06)) / .12), [px, py] = ctr(Math.max(0, i - 1)), [qx, qy] = ctr(i);
      const cx = i ? lerp(px, qx, k) : qx, cy = i ? lerp(py, qy, k) : qy, r = 30 + 26 * dec(t, T8[i], 9);
      X.save(); X.strokeStyle = PAL.cobalt; X.lineWidth = 3.5; X.beginPath(); X.arc(cx, cy, r, 0, TAU); X.stroke();
      X.beginPath(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { X.moveTo(cx + dx * r * .5, cy + dy * r * .5); X.lineTo(cx + dx * r * 1.5, cy + dy * r * 1.5); } X.stroke(); X.restore();
    }
    text(`SCAN ${String(found).padStart(2, '0')} / 06`, 110, 330, { size: 26, font: F.mono, weight: 700, col: PAL.cobalt, track: 3, a: clamp((lt + .1) / .2) });
    if (t >= T8[4]) toast(110, 760, 470, '调料已全部找到', '拉出来，一目了然', { k: clamp((t - T8[4]) / .16), icon: '✓' });
    lySide(8, t, { x: 110, y: 560, size: 104 });
  }

  // =====================================================================================================
  // SHOT 4 · 不用再弯腰 — side elevation: the bent-over habit is left behind as a crossed-out ghost; LAN grabs the handle and
  // yanks — her hand stays on it, so the drawer comes all the way out to her.
  // =====================================================================================================
  const BENT = pose({ lean: 1.0, head: .25, sL: .55, eL: .2, sR: -.45, eR: -.1, hL: .08, hR: .16, kL: .12, kR: .12, dy: -.1 });
  const TALL = pose({ ...KP.stand, sL: .9, eL: -1.9, sR: .3, eR: .2, hL: .12, hR: .12, head: -.05 });
  // side elevation of a base cabinet; the top drawer + its wire basket slide out to the left so the handle sits at hx
  function sideCabinet(x0, x1, top, floor, hx, hy) {
    const ft = 26, fx = hx + 14 + ft, ext = x0 - fx, dy0 = hy - 70, dy1 = hy + 110, bT = dy0 + 34, bB = dy1 - 16;
    if (ext > 2) {
      X.save(); X.beginPath(); X.rect(fx, 0, x0 - fx, H); X.clip();
      // plates standing in the rack: tilted discs rising well above the rim; a stack of bowls further back
      for (let k = 0; k < 6; k++) {
        const px = fx + 70 + k * 34; X.save(); X.beginPath(); X.ellipse(px, bT - 18, 13, 64, -.18, 0, TAU);
        X.fillStyle = k % 3 === 1 ? PAL.paper2 : PAL.paper; X.fill(); X.strokeStyle = PAL.ink; X.lineWidth = 2.6; X.stroke();
        X.beginPath(); X.ellipse(px, bT - 18, 6, 44, -.18, 0, TAU); X.lineWidth = 1.2; X.stroke(); X.restore();
      }
      for (let k = 0; k < 3; k++) { const bx = fx + 330, yy = bT + 6 - k * 18; X.save(); X.beginPath(); X.ellipse(bx, yy, 62, 40, 0, Math.PI, 0, true); X.closePath(); X.fillStyle = PAL.paper; X.fill(); X.strokeStyle = PAL.ink; X.lineWidth = 2.6; X.stroke(); X.restore(); }
      const wx0 = fx + 10, wx1 = x0 + 400;
      X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 2.2; X.beginPath();
      for (let x = wx0 + 12; x < wx1; x += 24) { X.moveTo(x, bT); X.lineTo(x, bB); } X.stroke(); X.restore();
      for (const yy of [bT, bB, (bT + bB) / 2]) wire2([[wx0, yy], [wx1, yy]], yy === bT ? 8 : 5.5);
      steelBar(fx + 20, dy0 + 96, x0 + 300, 12);
      X.restore();
    }
    rect(x0, top, x1 - x0, floor - top, PAL.paper);
    handRect(x0, top, x1 - x0 + 40, floor - top - 34, { w: 3.2, seed: 91, over: 3 });
    handLine(x0 + 34, floor - 34, x0 + 34, floor, { w: 2.6, seed: 92 });
    hatch([[x0, top], [x1, top], [x1, floor - 34], [x0, floor - 34]], { gap: 18, w: 1, a: .16, angle: -.9, seed: 7 });
    rect(x0 - 30, top - 34, x1 - x0 + 70, 34, PAL.paper2); handRect(x0 - 30, top - 34, x1 - x0 + 70, 34, { w: 3.2, seed: 95, over: 2 });
    rect(x0 - ft, dy1 + 10, ft, floor - 44 - dy1 - 10, PAL.paper2); handRect(x0 - ft, dy1 + 10, ft, floor - 44 - dy1 - 10, { w: 2.6, seed: 97, over: 2 });
    rect(fx - ft, dy0, ft, dy1 - dy0, PAL.paper); handRect(fx - ft, dy0, ft, dy1 - dy0, { w: 3.2, seed: 98, over: 2 });
    rrect(hx - 9, hy - 38, 18, 76, 8, { fill: PAL.orange, stroke: PAL.ink, w: 3 });     // the handle
  }
  function sBend(t, lt) {
    paperBG();
    const floor = 992, s = 60, x0 = 1400, x1 = 1960, top = 640;
    const upT = T9[0], reachT = T9[2], pullT = T9[3], xT = T9[1], thumbT = T9[4];
    const bentX = 1250, standX = 1060, backX = 950;
    const push = E.io((t - pullT) / .9);
    cam(CX - 10 + lt * 10 + push * 70, CY + push * 40, 1.02 - lt * .01 + push * .06);
    handLine(-40, floor, W + 40, floor, { w: 3, seed: 90 });
    // LAN: bent into the cabinet → pops upright + hops back on 不 → reaches on 再 → yanks on 弯 (beat 42), stepping back with
    // the handle in her fist → lets go for a thumbs-up on 腰 (the drawer finishes its glide on its own, soft-close style)
    const KEYS = [[-9, BENT], [upT, TALL, .15], [reachT, REACH_D, .12], [pullT, YANK_D, .1], [thumbT, pose({ ...KP.thumb }), .14]];
    const P = poseAt(t, KEYS);
    const lxAt = tt => tt < pullT ? lerp(bentX, standX, E.out5((tt - upT) / .2)) : lerp(standX, backX, E.out5((tt - pullT) / .3));
    const lx = lxAt(t), o = { who: 'lan', seed: 11 };
    const closedHx = x0 - 26 - 14, reachHand = handsOf(standX, floor, s, REACH_D, o).handR, hy = reachHand[1];
    let hx = closedHx;
    if (t >= reachT) hx = lerp(closedHx, reachHand[0], E.soft((t - reachT) / (pullT - reachT)));   // it glides into her open hand
    if (t >= pullT) hx = Math.min(hx, handsOf(lx, floor, s, P, o).handR[0]);                       // then rides her fist
    if (t >= thumbT) {
      const rel = Math.min(reachHand[0], handsOf(lxAt(thumbT - .001), floor, s, poseAt(thumbT - .001, KEYS), o).handR[0]);
      hx = rel - 40 * E.soft((t - thumbT) / .6);
    }
    sideCabinet(x0, x1, top, floor, hx, hy);
    if (t >= upT) {
      const ga = .62 * (1 - clamp((t - pullT + .04) / .12));
      if (ga > 0) {
        figure(bentX, floor, s, BENT, { who: 'lan', col: PAL.grey, face: 'o', a: ga, seed: 51, shadow: false });
        const k1 = clamp((t - xT) / .1), k2 = clamp((t - xT - .08) / .1), cx = bentX + 225, cy = floor - 430, r = 110;
        X.save(); X.globalAlpha *= clamp(ga / .62);
        if (k1 > 0) inkStroke(partial([[cx - r, cy - r], [cx + r, cy + r]], k1), { w: 28, col: PAL.orange, taper: [.05, .25], seed: 61 });
        if (k2 > 0) inkStroke(partial([[cx + r, cy - r * .9], [cx - r, cy + r * 1.05]], k2), { w: 28, col: PAL.orange, taper: [.05, .25], seed: 62 });
        X.restore();
      }
    }
    const dy = t >= upT ? -70 * Math.sin(clamp((t - upT) / .2) * Math.PI) : 0;
    const face = t < upT ? 'o' : t < thumbT ? 'smile' : 'star';
    figure(lx, floor + dy, s, P, { ...o, face, blush: 1 });
    if (t >= thumbT - .02) sticker(1590, 330, '腰 · 已解放', { k: clamp((t - thumbT + .02) / .3), rot: -.07, size: 48 });
    camEnd();
    lySide(9, t, { x: 110, y: 420, size: 128 });
  }

  // =====================================================================================================
  // SHOT 5 · 钢丝闪闪发亮 — three angles on the steel: low front (5a), overhead (5b), macro on the rim (5c).
  // The vertical column carries across the cuts; a white sheen sweeps the wire and one hero glint flares on every beat.
  // =====================================================================================================
  function beatGlints(t, pts, rHero = 110) {
    const n = beatN(t), ph = sinceBeat(t);
    pts.forEach((p, j) => {
      const hero = (n % pts.length) === j;
      glint(p[0], p[1], hero ? rHero : 26, hero ? Math.exp(-ph * 3.5) : .35 + .3 * Math.sin(t * 6 + j * 2), ph * .5 + j);
    });
  }
  function steelColumn(t) {
    line(318, 150, 318, 150 + 780 * E.soft((t - C_STEEL) / .7), 2, PAL.ink, .6);
    lyVertical(10, t, { x: 206, y: 118, size: 124, font: F.serif, weight: 900 });
  }
  const CARCASS = () => [...boxModel(-330, -20, -20, 330, 400, 460, { sides: 'lrbk', fill: PAL.paper, sideFill: PAL.paper, backFill: PAL.paper2 }),
    ...boxModel(-350, 400, -20, 350, 430, 490, { sides: 'lrtf', fill: PAL.paper, frontFill: PAL.paper2 })];
  // rails in their own passes (far one before the basket) so a rail face never slices through the wire wall
  function steelDrawer(C, ext, shineX, nearSide) {
    render3(slideModel(-nearSide * 294, 60 + 150 * .55, 440, ext), C, { style: 'steel' });
    render3(dishDrawer(ext, { front: false, slides: false }), C, { style: 'steel', shine: shineX });
    render3(slideModel(nearSide * 294, 60 + 150 * .55, 440, ext), C, { style: 'steel' });
  }
  function sSteel(t, lt) {        // 5a: low front, the wire wall face-on
    paperBG();
    const ext = 250 + 180 * E.soft((lt + .1) / .9);
    const C = frameCam([0, 150, ext + 240], -.2 + lt * .12, .1, 1200, 580, 640, 1300, { fov: 26 });
    render3(CARCASS(), C, { style: 'ink', lw: .7, a: .5 });
    const box = screenBox(C, boxCorners(-280, 60, ext, 280, 240, ext + 440));
    render3(dishDrawer(ext, { front: false, slides: false }), C, { style: 'steel' });
    sheen(box, t, { rot: -.4 });
    const pts = [[-280, 210, ext + 440], [280, 210, ext + 440], [0, 212, ext + 440], [-140, 60, ext + 440]].map(p => pin(C, p));
    beatGlints(t, pts, 110);
    steelColumn(t);
  }
  function sSteel2(t, lt) {       // 5b: overhead, the rack turning under us
    paperBG();
    const ext = 430;
    const C = frameCam([0, 90, ext + 220], .7 + lt * .35, 1.12, 1210, 540, 760, 1060, { fov: 26 });
    render3(CARCASS(), C, { style: 'ink', lw: .7, a: .4 });
    const box = screenBox(C, boxCorners(-280, 60, ext, 280, 210, ext + 440));
    steelDrawer(C, ext, null, -1);
    sheen(box, t, { rot: .5, w: 170 });
    const pts = [[-280, 210, ext + 440], [280, 210, ext], [280, 210, ext + 440], [-280, 210, ext]].map(p => pin(C, p));
    beatGlints(t, pts, 115);
    steelColumn(t);
  }
  function sMacro(t, lt) {        // 5c: macro on the rim corner
    paperBG();
    const ext = 430, at = [-150, 190, ext + 360];
    const C = frameCam(at, -.95 + lt * .12, .42, 1400, 560, 520, 1400, { fov: 26 });
    render3(dishDrawer(ext, { front: false, slides: false }), C, { style: 'steel', lw: 1 });
    sheen([420, 0, W, H], t, { rot: -.5, w: 190, a: .55 });
    const pts = [[-280, 210, ext + 440], [-120, 210, ext + 440], [-280, 210, ext + 200], [-40, 212, ext + 440]].map(p => pin(C, p));
    beatGlints(t, pts, 120);
    // the 亮 hit: one big white flare + a small orange one
    if (t >= T10[5] - .02) { const k = snapK(t, T10[5], .22), f = Math.exp(-(t - T10[5]) * 2.2); glint(1330, 380, 170 * f + 50, k, (t - T10[5]) * .5); sparkle(1530, 300, 60 * f + 16, { k, col: PAL.orange, rot: .4 }); }
    steelColumn(t);
  }

  // =====================================================================================================
  // SHOT 6a · 每一次拉开 — scale-contrast gag: a GIANT drawer, the line set on its front; tiny LAN hangs off its bar handle,
  // tugs on 每/一/次, cracks it on 拉 and throws her weight back on 开 (beat 50) — the drawer, type and all, glides at camera.
  // =====================================================================================================
  const HANG = pose({ sL: 2.75, eL: .1, sR: 2.75, eR: .1, hL: .1, kL: .45, hR: .14, kR: .55, head: .05 });
  const TUG = pose({ ...HANG, lean: -.12, hL: .3, kL: .2, hR: .45, kR: .15, head: -.1 });
  const SWING = pose({ ...HANG, lean: -.4, hL: .55, kL: .15, hR: .95, kR: .05, head: -.3, squash: .06 });
  function sPull(t, lt) {
    paperBG();
    // drawer travel: three little tugs, a crack on 拉, the big glide on 开
    let ext = 0;
    [T11[0], T11[1], T11[2]].forEach(ti => { ext += 22 * Math.sin(clamp((t - ti) / .2) * Math.PI); });
    ext += 70 * E.soft((t - T11[3]) / .3) + 250 * E.soft((t - T11[4]) / .75);
    const [shx, shy] = shake(t, 12 * dec(t, T11[4], 9) + 5 * dec(t, T11[3], 12), 4);
    const C = frameCam([0, 330, 470], -.03 + .02 * Math.sin(lt * 1.6), .34, CX + shx, 610 + shy, 1000, 1080, { fov: 30 });
    const sk = dec(t, T11[4], 4);
    if (sk > .02) speedLines(CX, 460, 520, 1500, 64, { a: .2 * sk, w: 12, seed: 7 });
    handLine(-40, pin(C, [0, 0, 480])[1], W + 40, pin(C, [0, 0, 480])[1], { w: 3, seed: 81 });
    // a tall base unit: the drawer sits high (front 300..640), a plain door below; the J-pull runs along the drawer's bottom edge
    const w = 720, d = 420, h = 170, y0 = 370, fz = d + 20 + ext, FY0 = 300, FY1 = 640;
    const prims = [...boxModel(-420, 0, 0, 420, 650, 460, { sides: 'lrbk', fill: PAL.paper, sideFill: PAL.paper2, backFill: PAL.paper2 }),
      ...boxModel(-440, 650, -20, 440, 682, 492, { sides: 'lrtf', fill: PAL.paper, frontFill: PAL.paper2 }),
      ...doorModel(-400, 14, 400, 290, 460 + 20, { handle: false, fill: PAL.paper2 }),
      ...dishDrawer(ext, { w, d, h, y0, front: false, plates: 9 }),
      ...doorModel(-400, FY0, 400, FY1, fz, { handle: false })];
    render3(prims, C, { style: 'steel' });
    // the drawer front as a local 2D plane (mm): u across 0..800, v down 0..340 — type, handle and LAN live on it
    const TL = pin(C, [-400, FY1, fz]), TR = pin(C, [400, FY1, fz]), BL = pin(C, [-400, FY0, fz]), FH = FY1 - FY0;
    X.save(); X.transform((TR[0] - TL[0]) / 800, (TR[1] - TL[1]) / 800, (BL[0] - TL[0]) / FH, (BL[1] - TL[1]) / FH, TL[0], TL[1]);
    slam(11, t, { rows: [0], size: 150, x: 400, y: 200, font: F.smiley, weight: 400, hi: '拉', pop: 1.5, tickR: .55, track: 6 });
    // J-pull bar along the bottom edge on two standoffs
    for (const u of [170, 630]) rect(u - 7, FH - 4, 14, 26, PAL.ink);
    steelBar(140, FH + 28, 660, 20);
    // LAN hangs off the bar: place her so both hands sit on it (feet just clear of the floor)
    const P = poseAt(t, [[-9, HANG], [T11[0], TUG, .08], [T11[0] + .12, HANG, .1], [T11[1], TUG, .08], [T11[1] + .12, HANG, .1], [T11[2], TUG, .08], [T11[2] + .12, HANG, .1],
      [T11[3], TUG, .08], [T11[4], SWING, .09], [T11[4] + .35, pose({ ...SWING, lean: -.25, hR: .7 }), .25]]);
    const s = 28, sway = 14 * Math.sin(t * 5.2) * (1 - sk), hd = handsOf(0, 0, s, P, { who: 'lan', seed: 11 });
    const hmx = (hd.handL[0] + hd.handR[0]) / 2, hmy = Math.min(hd.handL[1], hd.handR[1]);
    figure(400 - hmx + sway, FH + 26 - hmy, s, P, { who: 'lan', face: t >= T11[4] ? 'wow' : 'happy', blush: 1.2, seed: 11, shadow: false });
    X.restore();
  }

  // =====================================================================================================
  // SHOT 6b · 都心动 — LAN presents a heart bent from basket wire; the crew behind her all get one on 心.
  // =====================================================================================================
  function heartPath(cx, cy, r, n = 64) {
    const pts = []; for (let i = 0; i <= n; i++) { const a = i / n * TAU, x = 16 * Math.sin(a) ** 3, y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); pts.push([cx + x * r / 16, cy - y * r / 16 - r * .1]); } return pts;
  }
  // a heart bent from basket wire: outer + inner rim tied together by short uprights, like the basket's own frame
  function wireHeart(cx, cy, r, o = {}) {
    const k = o.k ?? 1, n = 72, out = heartPath(cx, cy, r, n), inn = heartPath(cx, cy + r * .02, r * .8, n), w = o.w ?? r * .05;
    if (k <= 0) return;
    X.save(); X.globalAlpha *= (o.a ?? 1);
    const m = Math.max(2, Math.round(n * k));
    for (let i = 2; i < m; i += 3) wire2([out[i], inn[i]], w * .55, { hl: .6 });
    wire2(out.slice(0, m + 1), w); wire2(inn.slice(0, m + 1), w * .7);
    X.restore();
  }
  const HOLD = pose({ sL: 2.15, eL: .3, sR: 2.15, eR: .3, hL: .14, hR: .14, head: -.06 });
  function sHeart(t, lt) {
    paperBG();
    const z = 1.03 - .03 * E.out(lt / 1.1);
    cam(CX, CY, z);
    stageFloor(1000);
    const lx = 1340, P = poseAt(t, [[-9, KP.ready], [C_HEART, HOLD, .14], [T11[6], pose({ ...HOLD, dy: -.12, kL: .3, kR: .3 }), .1], [T11[7], HOLD, .15]]);
    // the heart rests in her raised hands and beats on 心 (beat 51) and every beat after
    const hd = handsOf(lx, 1000, 42, P, { who: 'lan', seed: 11 });
    const hy = Math.min(hd.handL[1], hd.handR[1]), hw = Math.abs(hd.handR[0] - hd.handL[0]);
    const beat = .05 * pulse(t, 5) + .1 * dec(t, T11[6], 6), R = Math.max(190, hw * .62) * (1 + beat) * E.out5(lt / .22 + .05);
    wireHeart(lx, hy - R * .42, R, { k: E.out5(lt / .28), w: 13 });
    // 都 = all of them: the crew cheers behind her, each gets a small wire heart that pops on 心
    [['pony', 1085], ['buns', 1205], ['long', 1475], ['kit', 1595]].forEach(([who, x], j) => {
      const Pc = poseAt(t, [[-9, KP.ready], [C_HEART + .04 * j, HOLD, .14], [T11[6], pose({ ...HOLD, dy: -.1, kL: .25, kR: .25 }), .1], [T11[7], HOLD, .15]]);
      const hk = E.back(clamp((t - T11[6] - .03 * j) / .22), 2), f = figure(x, 944, 20, Pc, { who, face: 'happy', seed: 20 + j * 3, a: .9 });
      if (hk > 0) wire2(heartPath(f.head[0], f.head[1] - 108, 34 * hk * (1 + .08 * pulse(t, 6)), 40), 5.5);
    });
    figure(lx, 1000, 42, P, { who: 'lan', face: 'happy', blush: 1.4, seed: 11 });
    for (let j = 0; j < 4; j++) {
      const t0 = C_HEART + .1 + j * .24, age = t - t0; if (age < 0) continue;
      const x = lx + 330 + (j % 2) * 150 + hash(j * 7) * 40, y = 760 - age * (300 + hash(j) * 160), r = 26 + hash(j * 3) * 20;
      wire2(heartPath(x + Math.sin(age * 4 + j) * 18, y, r * E.back(clamp(age / .25)), 40), 5.5, { a: clamp(2.2 - age) });
    }
    camEnd();
    text('每一次拉开', 126, 380, { size: 42, font: F.sans, weight: 700, col: PAL.ink2, track: 8, a: .85 * (1 - clamp((t - T11[7] - .3) / .3)) });
    line(126, 410, 126 + 240 * E.soft(lt / .6), 410, 2.5, PAL.ink, .6);
    slam(11, t, { rows: [1], size: 290, x: 112, y: 700, align: 'left', hi: '心', pop: 1.7, tickR: .42 });
  }

  // =====================================================================================================
  // SHOT 7 · TAG — instrumental logo sting; LAN grabs the incoming panel's edge and pulls the next chapter in from the left.
  // =====================================================================================================
  function sTag(t, lt) {
    paperBG();
    const b52 = bt(52), b53 = bt(53), b54 = bt(54), b55 = bt(55), reachT = bt(54.5), yankT = bt(55.5);
    cam(CX, CY, 1 + lt * .01);
    for (const [x, y] of [[150, 190], [W - 150, 190], [W - 150, 820]]) { line(x - 18, y, x + 18, y, 2, PAL.ink, .5); line(x, y - 18, x, y + 18, 2, PAL.ink, .5); }
    // HIGOLD rises out of a slot (the drawer move), letter by letter on 16ths
    const word = 'HIGOLD', size = 330, tw = measure(word, size, F.anton, 400, 10), slotY = 610;
    let x = CX - tw / 2 - 110;
    X.save(); X.beginPath(); X.rect(0, 0, W, slotY); X.clip();
    [...word].forEach((ch, j) => {
      const k = E.soft((t - b52 - j * .045) / .6), cw = measure(ch, size, F.anton, 400) + 10;
      if (k > 0) text(ch, x, slotY + (1 - k) * size * 1.05, { size, font: F.anton, col: PAL.ink });
      x += cw;
    });
    X.restore();
    const rx0 = CX - tw / 2 - 150, rx1 = rx0 + (tw + 300) * E.soft((t - b52 + .1) / .5);
    steelBar(rx0, slotY + 16, rx1, 14);
    if (t > b52 + .4) {   // a glint runs along the rail on every beat
      const gk = clamp(sinceBeat(t) / .45);
      glint(lerp(rx0 + 20, rx1 - 20, E.io(gk)), slotY + 14, 30, Math.sin(gk * Math.PI), 0);
    }
    // 悍高 stamp (beat 53)
    const sk = clamp((t - b53) / .25);
    if (sk > 0) {
      const sx = CX + tw / 2 - 40, sy = 330, s = E.back(sk, 2.4) * (1 + .035 * pulse(t, 7) * clamp((t - b53 - .3) * 5));
      X.save(); X.translate(sx + 110, sy); X.rotate(.06); X.scale(s, s);
      rect(-110 + 8, -110 + 8, 220, 220, PAL.ink); rect(-110, -110, 220, 220, PAL.paper); X.strokeStyle = PAL.ink; X.lineWidth = 5; X.strokeRect(-110, -110, 220, 220);
      text('悍', 0, -8, { size: 100, font: F.heavy, weight: 900, align: 'center' }); text('高', 0, 92, { size: 100, font: F.heavy, weight: 900, align: 'center' });
      X.restore();
    }
    // the orange drawer: 一拉就到位 (beat 54)
    const dk = E.soft((t - b54) / .7);
    if (t >= b54 - .05) {
      const dw = 760, dh = 128, dx = CX - dw / 2, dyy = 700;
      X.save(); X.beginPath(); X.rect(dx - 40, dyy - 20, dw + 80, dh + 60); X.clip();
      const ox = (1 - dk) * -(dw + 60);
      rect(dx + ox + 9, dyy + 9, dw, dh, PAL.ink); rect(dx + ox, dyy, dw, dh, PAL.orange); X.strokeStyle = PAL.ink; X.lineWidth = 4; X.strokeRect(dx + ox, dyy, dw, dh);
      text('一拉就到位', dx + ox + dw / 2, dyy + dh / 2 + 32, { size: 88, font: F.heavy, weight: 900, col: PAL.paper, align: 'center', track: 10 });
      rrect(dx + ox + dw - 38, dyy + 30, 12, dh - 60, 6, { fill: PAL.ink });
      X.restore();
      text('厨房拉篮  ·  PULL-OUT BASKET', CX, 900, { size: 26, font: F.mono, weight: 600, align: 'center', track: 4, a: clamp((t - b54 - .2) / .3) });
    }
    camEnd();
    const tk = E.soft((t - b55) / .5);
    if (tk > 0) { X.save(); X.translate(0, (1 - tk) * 120); ticker(1020, '一拉就到位   HIGOLD 悍高   厨房拉篮', t, { h: 72, size: 36, speed: 260, dir: -1 }); X.restore(); }
    metaStrip(t, { tl: 'CHORUS 01  ·  TAG', a: .9 });
    // LAN: reaches for the frame's left edge (bt 54.5); the incoming panel's steel edge slides into her hand (bt 55); she yanks
    // (bt 55.5) and the edge rides her fist — the pull transition at 38.34 then takes over from where her hand left it
    const s = 36, gy = 986, groove = pose({ ...KP.hips, dy: -.18 * Math.abs(Math.sin(bp(t) * Math.PI)), kL: .25 * Math.abs(Math.sin(bp(t) * Math.PI)), kR: .25 * Math.abs(Math.sin(bp(t) * Math.PI)), head: .08 * Math.sin(bp(t) * Math.PI) });
    const KEYS = [[-9, groove], [reachT, mirrorPose(REACH_D), .12], [yankT, mirrorPose(YANK_D), .1]];
    const P = t < reachT ? groove : poseAt(t, KEYS);
    const lx = 205 + 45 * E.out5((t - yankT) / .25);
    const hand = handsOf(lx, gy, s, P, { who: 'lan', seed: 11 }).handL;
    const ek = E.soft((t - b55 + .1) / .3);
    if (ek > 0) {
      const reachHand = handsOf(205, gy, s, mirrorPose(REACH_D), { who: 'lan', seed: 11 }).handL[0];
      const ex = t < yankT ? lerp(-20, reachHand - 8, ek) : Math.max(reachHand - 8, hand[0] - 8);
      rect(0, 0, ex, H, PAL.paper2); hatch([[0, 0], [ex, 0], [ex, H], [0, H]], { gap: 20, w: 1, a: .14, angle: -.8, seed: 9 });
      rect(ex, 0, 26, H, PAL.ink, .12); rect(ex - 5, 0, 10, H, PAL.ink); rect(ex - 2, 0, 3, H, PAL.steel2);
      if (t >= yankT && t < yankT + .3) { const k = (t - yankT) / .3; for (let q = 0; q < 3; q++) inkStroke([[ex - 30 - q * 10, 420 + q * 120], [ex - 30 - q * 10 - 160 * (1 - k), 420 + q * 120]], { w: 6 * (1 - k) + 1, taper: [.05, .8], seed: 30 + q, a: 1 - k }); }
    }
    figure(lx, gy, s, P, { who: 'lan', face: t > yankT ? 'happy' : 'smile', blush: 1, seed: 11 });
  }

  chapter('chorus1', 23.0, 38.5, [
    [C_HOOK, sHook], [C_MARCH, sMarch], [C_SPICE, sSpice], [C_BEND, sBend],
    [C_STEEL, sSteel], [C_STEEL2, sSteel2], [C_MACRO, sMacro], [C_PULL, sPull], [C_HEART, sHeart], [C_TAG, sTag],
  ]);
})();
