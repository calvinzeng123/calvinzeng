// c02_chorus1.js — Chorus 1 · "Comeback stage" (23.0 – 38.5 s). Paper + the first real orange. The viral hook.
// Shots cut on the beat grid (beatT(n) = 0.19 + n × 0.682). Every shot paints the whole frame and is a pure function of t.
(() => {
  'use strict';
  const bt = beatT;
  const T6 = LY[6].t, T7 = LY[7].t, T8 = LY[8].t, T9 = LY[9].t, T10 = LY[10].t, T11 = LY[11].t;

  // ---------- cut list (song seconds) ----------
  const C_HOOK = 23.0, C_MARCH = bt(35.5), C_SPICE = bt(38.25), C_BEND = bt(40.5), C_STEEL = bt(43), C_MACRO = bt(46),
    C_PULL = bt(48.5), C_HEART = bt(50.5), C_TAG = bt(52);

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
  // 2D steel bar (the slide rail): ink outline, steel body, white core
  function steelBar(x1, y, x2, h = 14, o = {}) {
    if (x2 - x1 < 1) return;
    X.save(); X.globalAlpha *= (o.a ?? 1);
    rrect(x1 - 2, y - h / 2 - 2, x2 - x1 + 4, h + 4, h / 2 + 2, { fill: PAL.ink });
    rrect(x1, y - h / 2, x2 - x1, h, h / 2, { fill: PAL.steel1 });
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
  // clean outline type: dilate the glyph with offset fills, then knock out the middle (variable CJK fonts show their
  // overlapping contours with strokeText, so we never stroke them)
  function outlineText(str, x, y, o) {
    const r = o.sw ?? 6, n = 16;
    for (let q = 0; q < n; q++) text(str, x + Math.cos(q / n * TAU) * r, y + Math.sin(q / n * TAU) * r, { ...o, col: o.stroke ?? PAL.ink, stroke: null });
    text(str, x, y, { ...o, col: o.fill ?? PAL.paper, stroke: null });
  }
  // manga impact ticks around a landing character
  function impact(cx, cy, r, age, seed, col = PAL.ink, n = 10) {
    if (age < 0 || age > .26) return; const k = age / .26, a = 1 - k;
    for (let q = 0; q < n; q++) {
      const ang = (q + hash(seed + q) * .6) / n * TAU, r0 = r * (1 + .3 * E.out(k)), r1 = r0 + r * (.16 + .12 * hash(seed * 3 + q)) * (1 - k * .6);
      inkStroke([[cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0], [cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1]], { w: 7 * a + 1, col, taper: [.1, .6], wob: .3, seed: seed + q, a });
    }
  }

  // ---------- private lyric presenter: per-character SLAM (used for the hook and the heart line) ----------
  // o: {x, y (baseline of first shown row), size, align, rows (indices to show), hi, stroke, sw, pop, dur, ticks, col, track, lead}
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
        const pulled = o.pullIn && o.pullIn.includes(c.ch);
        if (pulled && c.ti != null && t >= c.ti - .06) {
          // this character is PULLED into its slot from the right on the drawer curve, trailing speed streaks
          const kp = E.soft((t - c.ti + .06) / .26), off = (1 - kp) * (o.pullDist ?? 1100);
          const col = hot ? PAL.orange : (o.col ?? PAL.ink), sq = 1 + .12 * (1 - kp);
          for (let q = 0; q < 7; q++) {
            const yy = y - size * (.1 + q * .12), len = off * (.35 + hash(q * 3.1) * .6) + 40 * (1 - kp), x0 = x + w * .6 + off + (hash(q) - .5) * 60;
            if (len > 8) inkStroke([[x0, yy], [x0 + len, yy]], { w: 10 * (1 - kp) + 2, col, taper: [.05, .9], wob: .4, seed: 700 + q, a: .85 * (1 - kp * .8) });
          }
          X.save(); X.translate(cx + off, cy); X.scale(sq, 1 / sq); X.translate(-cx, -cy);
          text(c.ch, x, y, { size, font, weight: wt, col });
          X.restore();
          boxes[boxes.length - 1].off = off;
        } else if (k > 0 && !pulled) {
          const e = E.out5(k), s = lerp(o.pop ?? 1.55, 1, e), rot = (1 - e) * (hash(i * 10 + j + r * 5) - .5) * .35;
          X.save(); X.translate(cx, cy); X.rotate(rot); X.scale(s, s); X.translate(-cx, -cy);
          const col = hot ? PAL.orange : (o.col ?? PAL.ink), a = o.stroke ? 1 : clamp(k * 4);
          if (o.stroke && !hot) outlineText(c.ch, x, y, { size, font, weight: wt, stroke: o.stroke, sw: o.sw ?? 6, a });
          else text(c.ch, x, y, { size, font, weight: wt, col, a });
          X.restore();
          if (o.ticks !== false && c.ti != null) impact(cx, cy, size * .6, t - c.ti, i * 31 + j * 7 + r, hot ? PAL.orange : PAL.ink);
        } else if (o.ghost) text(c.ch, x, y, { size, font, weight: wt, col: null, stroke: rgba(PAL.ink, o.ghost), sw: 2 });
        x += w;
      });
    });
    X.restore();
    return boxes;
  }

  // ---------- the crew, driven by a pose track (unison K-pop line) ----------
  function crewLine(t, P, o = {}) {
    const y = o.y ?? 1000, s = o.s ?? 20, sp = o.spread ?? 320, col = o.col ?? PAL.ink, out = {};
    CREW.forEach((who, i) => {
      if (o.skip && o.skip.includes(who)) return;
      const k = i - 2, lead = who === 'lan', mir = o.mirror && k < 0;
      const pp = typeof P === 'function' ? P(who, k) : P;
      const sc = s * (lead ? 1.12 : 1) * (1 - Math.abs(k) * (o.depth ?? 0));
      out[who] = figure((o.x ?? CX) + k * sp, y - Math.abs(k) * (o.stagger ?? 0), sc, mir ? mirrorPose(pp) : pp,
        { who, col, seed: i * 3 + 1, face: lead ? (o.lanFace ?? 'smile') : (o.face ?? 'dot'), blush: lead ? 1 : 0, a: o.a });
    });
    return out;
  }

  // =====================================================================================================
  // SHOT 1 · HOOK — 一拉就到位. Giant per-character slam; the five-member line pulls on the syllables.
  // =====================================================================================================
  // bigger, whole-body versions of the signature pull (reach lunges right, yank sits back left) so it reads at thumbnail size
  const REACH = pose({ lean: .14, head: .1, sR: 1.55, eR: .02, sL: .9, eL: -1.9, hL: .1, kL: .05, hR: .46, kR: .28, dy: -.12 });
  const YANK = pose({ lean: -.24, head: -.14, sR: .62, eR: -2.2, sL: .95, eL: -1.95, hL: .42, kL: .55, hR: .28, kR: .02, dy: -.3, squash: .06 });
  const HOOK_KEYS = [
    [-9, KP.ready],
    [T6[0], REACH, .1],                                            // 一  reach
    [T6[1], YANK, .09],                                            // 拉  YANK (beat 34)
    [T6[2], pose({ ...YANK, dy: -.42, kL: .7, kR: .2 }), .1],      // 就  sink
    [bt(34.5), pose({ ...YANK, dy: -.22 }), .2],                   //     groove back up
    [T6[3], mirrorPose(REACH), .1],                                // 到  reach the other way (beat 35)
    [T6[4], mirrorPose(YANK), .09],                                // 位  yank — in place
  ];
  function sHook(t, lt) {
    paperBG();
    const hits = [T6[1], T6[3]], z = 1 + .03 * E.io(clamp((lt + .2) / 1.6)) + punch(t, hits, .03, 8) + punch(t, [T6[4]], .018, 8);
    const [shx, shy] = shake(t, 9 * dec(t, T6[1], 11) + 6 * dec(t, T6[3], 11), 7);
    cam(CX + shx, CY + shy, z);
    bigBasketBG(t, { a: .04, sy: 500, px: 1250, spin: .16, yaw: -.3 });
    stageFloor(1026);
    crewLine(t, poseAt(t, HOOK_KEYS), { y: 1026, s: 28, spread: 322, lanFace: t > T6[1] ? 'happy' : 'smile' });
    // the text row + the slide rail that "pulls out" under it, one character at a time; 拉 itself is PULLED in from the right
    const size = 322, base = 540;
    const boxes = slam(6, t, { size, y: base, hi: '拉', pop: 1.6, dur: .12, pullIn: '拉' });
    if (boxes) {
      const x0 = boxes[0].x + 8, ends = boxes.map(b => b.x + b.w - 24);
      let xr = x0;
      boxes.forEach((b, j) => { if (b.ti != null && t >= b.ti) xr = lerp(j ? ends[j - 1] : x0, ends[j], E.soft((t - b.ti) / .42)); });
      const ry = base + 58;
      steelBar(x0, ry, xr, 13);
      if (t >= T6[4]) {   // soft-close: the damper dot clicks home in orange
        const k = snapK(t, T6[4] + .08, .18);
        circle(xr + 14, ry, 11 * E.back(k, 3), { fill: PAL.orange, stroke: PAL.ink, w: 3 });
      }
    }
    camEnd();
    metaStrip(t, { tl: 'CHORUS 01  ·  COMEBACK STAGE', a: .9 });
  }

  // =====================================================================================================
  // SHOT 2 · 锅碗瓢盆排队 — kitchenware conga-line into the basket, landing in a row on 队.
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
    const ext = 60 + 380 * E.soft(lt / .8);
    const land0 = bt(38), zp = 1 + punch(t, [land0], .035, 7);
    cam(CX, CY, zp);
    const C = frameCam([-400, 60, 620], -.12 + lt * .02, .72, CX - 90, 790, 1500, 1540, { fov: 30 });
    const prims = [];
    prims.push(...boxModel(-480, -20, -20, 480, 360, 460, { sides: 'lrbk', fill: PAL.paper, sideFill: PAL.paper2, backFill: PAL.paper2 }));
    prims.push(...boxModel(-500, 360, -20, 500, 392, 492, { sides: 'lrtf', fill: PAL.paper, frontFill: PAL.paper2 }));
    const bw = 900, bd = 400, by = 40;
    prims.push(...translate3(basketModel({ w: bw, d: bd, h: 150, type: 'plain', gap: 30 }), [0, by, ext]));
    prims.push(...slideModel(-bw / 2 - 14, by + 80, bd, ext), ...slideModel(bw / 2 + 14, by + 80, bd, ext));
    prims.push(...doorModel(-bw / 2 - 20, -10, bw / 2 + 20, 150, bd + 20 + ext, { th: 18 }));
    // the line: each item hops into its queue spot on its syllable (锅 碗 瓢 盆), they bounce on the 8ths,
    // leap together on 排 and land in a perfect row on 队 (beat 38)
    const shadows = [], zq = 640, qx = [-600, -775, -950, -1115], slotX = [-315, -105, 105, 315], leap0 = T7[4], land = bt(38);
    MARCH.forEach((kind, i) => {
      const t0 = T7[i] - .16; if (t < t0) return;
      let x, y, z = zq, tilt;
      const k = clamp((t - t0) / .16);          // each item lands in its spot exactly on its syllable
      x = lerp(-1700, qx[i], E.out(k)); y = -20 + 160 * Math.sin(k * Math.PI); tilt = -.35 * (1 - E.out(k));
      if (k >= 1) { const ph = frac(bp(t) * 2); y = -20 + 34 * Math.sin(ph * Math.PI); tilt = .1 * Math.sin(bp(t) * Math.PI); }
      if (t >= leap0) {
        const kk = clamp((t - leap0) / (land - leap0)), kx = E.io(kk), tx = slotX[i], ty = by + 4, tz = ext + 200;
        x = lerp(qx[i], tx, kx); z = lerp(zq, tz, kx); y = lerp(-20, ty, kx) + (300 + i * 40) * Math.sin(kk * Math.PI);
        tilt = Math.sin(kk * TAU) * .22 * (i % 2 ? 1 : -1);
        if (t >= land) { x = tx; z = tz; y = ty + 22 * Math.abs(Math.sin(bp(t) * Math.PI * 2)) * dec(t, land, 3); tilt = 0; }
      }
      const items = scale3(itemPrims(kind, [0, 0, 0], tilt), .86).map(p => ({ ...p, bias: -40 }));
      prims.push(...translate3(items, [x, y, z]));
      if (t < leap0 + .12) shadows.push([x, z, y + 20, kind === 'ladle' ? 50 : 100]);
    });
    shadows.forEach(([x, z, hgt, r]) => {
      const c = pin(C, [x, -20, z]), rx = pin(C, [x + r, -20, z])[0] - c[0], k = clamp(1 - hgt / 400);
      X.save(); X.globalAlpha *= .13 * k; X.fillStyle = PAL.ink; X.beginPath(); X.ellipse(c[0], c[1], rx * (.7 + .3 * k), rx * .32 * (.7 + .3 * k), 0, 0, TAU); X.fill(); X.restore();
    });
    render3(prims, C, { style: 'steel', shine: lerp(-600, 600, frac(bp(t) / 2)) });
    // alignment guide the moment they land in a row
    if (t >= land - .02) {
      const k = snapK(t, land, .25), gy = by + 150 + 30, p0 = pin(C, [slotX[0] - 170, gy, ext + 200]), p1 = pin(C, [slotX[3] + 170, gy, ext + 200]);
      X.save(); X.setLineDash([12, 10]); line(p0[0], p0[1], lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), 3, PAL.cobalt, .9); X.restore();
      slotX.forEach((sx, j) => { const q = pin(C, [sx, gy, ext + 200]), kj = snapK(t, land + .04 + j * .05, .2); circle(q[0], q[1], 8 * kj, { fill: PAL.cobalt }); });
    }
    camEnd();
    lySide(7, t, { x: 120, y: 330, size: 120 });
  }

  // =====================================================================================================
  // SHOT 3 · 调料一眼看见 — steep look down into the seasoning basket; every jar gets found, one per syllable.
  // =====================================================================================================
  const SPICE = [['盐', 'jar'], ['糖', 'bottle'], ['醋', 'jar'], ['生抽', 'bottle'], ['花椒', 'jar'], ['八角', 'jar']];
  function sSpice(t, lt) {
    paperBG();
    dotGrid(24, 24, W, H, 48, 1.4, PAL.ink, .07);
    const bw = 600, bd = 430, zc = 470 + 205, ext = 150 + 300 * E.soft(lt / .8);
    // straight down into the drawer (the whole point of a full pull-out: you see everything from above)
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
      pos.push([at, prof]);
    });
    render3(prims, C, { style: 'ink', lw: 1.15 });
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
    text(`SCAN ${String(found).padStart(2, '0')} / 06`, 110, 330, { size: 26, font: F.mono, weight: 700, col: PAL.cobalt, track: 3, a: clamp(lt / .2) });
    if (t >= T8[5]) toast(110, 760, 470, '调料已全部找到', '拉出来，一目了然', { k: clamp((t - T8[5]) / .16), icon: '✓' });
    lySide(8, t, { x: 110, y: 560, size: 104 });
  }

  // =====================================================================================================
  // SHOT 4 · 不用再弯腰 — side elevation: the bent-over ghost gets crossed out; LAN stands tall and pulls.
  // =====================================================================================================
  const BENT = pose({ lean: 1.0, head: .25, sL: .55, eL: .2, sR: -.45, eR: -.1, hL: .08, hR: .16, kL: .12, kR: .12, dy: -.1 });
  const TALL = pose({ ...KP.stand, sL: .9, eL: -1.9, sR: .3, eR: .2, hL: .12, hR: .12, head: -.05 });
  // side elevation of a base cabinet; the top drawer + its wire basket slide out to the left by ext px
  function sideCabinet(x0, x1, top, floor, ext) {
    const dy0 = top + 34, dy1 = top + 200, bT = dy0 + 26, bB = dy1 - 16, fx = x0 - ext, ft = 26;
    if (ext > 2) {
      X.save(); X.beginPath(); X.rect(fx, 0, x0 - fx, H); X.clip();
      // plates standing in the rack + a stack of bowls, peeking over the rim
      for (let k = 0; k < 7; k++) { const px = fx + 70 + k * 30; rrect(px - 6, bT - 44, 12, bB - bT + 40, 6, { fill: k % 3 === 1 ? PAL.paper2 : PAL.paper, stroke: PAL.ink, w: 2.4 }); }
      for (let k = 0; k < 2; k++) { const bx = fx + 330, yy = bT + 4 - k * 20; X.save(); X.beginPath(); X.ellipse(bx, yy, 62, 44, 0, Math.PI, 0, true); X.closePath(); X.fillStyle = PAL.paper; X.fill(); X.strokeStyle = PAL.ink; X.lineWidth = 2.6; X.stroke(); X.restore(); }
      const wx0 = fx + 10, wx1 = x0 + 400;
      X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 2.2; X.beginPath();
      for (let x = wx0 + 12; x < wx1; x += 24) { X.moveTo(x, bT); X.lineTo(x, bB); } X.stroke(); X.restore();
      for (const yy of [bT, bB, (bT + bB) / 2]) wire2([[wx0, yy], [wx1, yy]], yy === bT ? 8 : 5.5);
      steelBar(fx + 20, dy0 + 84, x0 + 300, 12);
      X.restore();
    }
    rect(x0, top, x1 - x0, floor - top, PAL.paper);
    handRect(x0, top, x1 - x0 + 40, floor - top - 34, { w: 3.2, seed: 91, over: 3 });
    handLine(x0 + 34, floor - 34, x0 + 34, floor, { w: 2.6, seed: 92 });
    hatch([[x0, top], [x1, top], [x1, floor - 34], [x0, floor - 34]], { gap: 18, w: 1, a: .16, angle: -.9, seed: 7 });
    rect(x0 - 30, top - 34, x1 - x0 + 70, 34, PAL.paper2); handRect(x0 - 30, top - 34, x1 - x0 + 70, 34, { w: 3.2, seed: 95, over: 2 });
    rect(x0 - ft, dy1 + 10, ft, floor - 44 - dy1 - 10, PAL.paper2); handRect(x0 - ft, dy1 + 10, ft, floor - 44 - dy1 - 10, { w: 2.6, seed: 97, over: 2 });
    rect(fx - ft, dy0, ft, dy1 - dy0, PAL.paper); handRect(fx - ft, dy0, ft, dy1 - dy0, { w: 3.2, seed: 98, over: 2 });
    rrect(fx - ft - 14, dy0 + 24, 16, 50, 6, { fill: PAL.ink2 });
    return { hx: fx - ft - 8, hy: dy0 + 50 };
  }
  function sBend(t, lt) {
    paperBG();
    const floor = 992, s = 60, x0 = 1400, x1 = 1960, top = 662;
    const upT = T9[0], pullT = T9[3], xT = T9[1];
    const ext = 340 * E.soft((t - pullT) / .75);
    const push = E.io((t - pullT) / .9);
    cam(CX - 10 + lt * 10 + push * 70, CY + push * 40, 1.02 - lt * .01 + push * .06);
    handLine(-40, floor, W + 40, floor, { w: 3, seed: 90 });
    sideCabinet(x0, x1, top, floor, ext);
    // LAN is bent into the closed cabinet; on 不 she pops upright and hops back, leaving the old habit behind as a grey
    // ghost (crossed out on 用); she reaches on 再, yanks on 弯 (beat 42) and the drawer glides out to her; thumbs-up on 腰
    const bentX = 1180, standX = 955;
    const P = poseAt(t, [[-9, BENT], [upT, TALL, .15], [T9[2], KP.reach, .12], [pullT, KP.yank, .1], [T9[4], pose({ ...KP.thumb }), .14]]);
    const hop = E.out5((t - upT) / .2), lx = lerp(bentX, standX, hop);
    if (t >= upT) {
      const ga = .62 * (1 - clamp((t - pullT + .04) / .12));
      if (ga > 0) {
        figure(bentX, floor, s, BENT, { who: 'lan', col: PAL.grey, face: 'o', a: ga, seed: 51, shadow: false });
        const k1 = clamp((t - xT) / .1), k2 = clamp((t - xT - .08) / .1), cx = bentX + 110, cy = floor - 300, r = 150;
        X.save(); X.globalAlpha *= clamp(ga / .62);
        if (k1 > 0) inkStroke(partial([[cx - r, cy - r], [cx + r, cy + r]], k1), { w: 28, col: PAL.orange, taper: [.05, .25], seed: 61 });
        if (k2 > 0) inkStroke(partial([[cx + r, cy - r * .9], [cx - r, cy + r * 1.05]], k2), { w: 28, col: PAL.orange, taper: [.05, .25], seed: 62 });
        X.restore();
      }
    }
    // a little hop arc on 不
    const dy = t >= upT ? -70 * Math.sin(clamp((t - upT) / .2) * Math.PI) : 0;
    const face = t < upT ? 'o' : t < T9[4] ? 'smile' : 'star';
    figure(lx, floor + dy, s, P, { who: 'lan', face, blush: 1, seed: 11 });
    if (t >= T9[4] - .02) sticker(1590, 330, '腰 · 已解放', { k: clamp((t - T9[4] + .02) / .3), rot: -.07, size: 48 });
    camEnd();
    lySide(9, t, { x: 110, y: 450, size: 128 });
  }

  // =====================================================================================================
  // SHOT 5 · 钢丝闪闪发亮 — hero steel orbit (5a) and a macro on the rim (5b); the vertical column carries across the cut.
  // =====================================================================================================
  function glints(t, pts, o = {}) {
    // one glint per beat, cycling through the given screen points; each flares with the beat pulse
    const n = beatN(t), ph = sinceBeat(t);
    pts.forEach((p, j) => {
      const on = (n + j) % pts.length === 0 ? 1 : 0, k = on * Math.exp(-ph * 4) + .15 * (1 - on) * (.5 + .5 * Math.sin(t * 5 + j));
      sparkle(p[0], p[1], (o.r ?? 46) * (1 + (hash(j) - .5) * .4), { k: clamp(k), col: o.col ?? PAL.ink, rot: ph * .6 + j });
    });
  }
  function steelColumn(t) {
    line(318, 150, 318, 150 + 780 * E.soft((t - C_STEEL) / .7), 2, PAL.ink, .6);
    lyVertical(10, t, { x: 206, y: 118, size: 124, font: F.serif, weight: 900 });
  }
  function sSteel(t, lt) {
    paperBG();
    const ext = 170 + 260 * E.soft(lt / .9), shine = lerp(-520, 520, frac(bp(t) / 2));
    const C = frameCam([0, 130, 230 + ext * .5], -.72 + lt * .15, .52, 1230, 545, 760, 990, { fov: 26 });
    // the cabinet stays a quiet pencil drawing; the steel basket is the only solid thing in frame
    const carc = [...boxModel(-330, -20, -20, 330, 400, 460, { sides: 'lrbk', fill: PAL.paper, sideFill: PAL.paper, backFill: PAL.paper2 }),
      ...boxModel(-350, 400, -20, 350, 430, 490, { sides: 'lrtf', fill: PAL.paper, frontFill: PAL.paper2 })];
    render3(carc, C, { style: 'ink', lw: .7, a: .55 });
    render3(dishDrawer(ext, { front: false }), C, { style: 'steel', shine });
    const y0 = 60, h = 150, w = 560, d = 440;
    const pts = [[-w / 2, y0 + h, ext + d], [w / 2, y0 + h, ext + d], [w / 2, y0 + h, ext], [-w / 2 + 140, y0 + h, ext + d]].map(p => pin(C, p));
    glints(t, pts, { r: 78 });
    pts.forEach((p, j) => sparkle(p[0], p[1], 22, { k: clamp(pulse(t, 5) * (j % 2 ? 1 : .6)), col: PAL.shine, rot: .78 }));
    steelColumn(t);
  }
  function sMacro(t, lt) {
    paperBG();
    const ext = 430, shine = lerp(-400, 400, frac(bp(t) / 2));
    const at = [-150, 190, ext + 360];
    const C = frameCam(at, -.95 + lt * .12, .42, 1400, 560, 520, 1400, { fov: 26 });
    render3(dishDrawer(ext, { front: false, slides: false }), C, { style: 'steel', shine, lw: 1 });
    const pts = [[-280, 210, ext + 440], [-120, 210, ext + 440], [-280, 210, ext + 200], [-40, 212, ext + 440]].map(p => pin(C, p));
    glints(t, pts, { r: 110 });
    // the 亮 hit: a big ink star + a small orange one
    if (t >= T10[5] - .02) { const k = snapK(t, T10[5], .22), f = Math.exp(-(t - T10[5]) * 2.2); sparkle(1330, 380, 170 * f + 40, { k, rot: (t - T10[5]) * .5 }); sparkle(1530, 300, 60 * f + 16, { k, col: PAL.orange, rot: .4 }); }
    steelColumn(t);
  }

  // =====================================================================================================
  // SHOT 6a · 每一次拉开 — outline type, the line pulls on 拉/开.   SHOT 6b · 都心动 — LAN's heart + wire hearts.
  // =====================================================================================================
  const DIP = pose({ ...KP.ready, dy: -.3, kL: .5, kR: .5, hL: .24, hR: .24 });
  const PULL_KEYS = [[-9, KP.ready], [T11[0], DIP, .1], [T11[1], KP.ready, .1], [T11[2], DIP, .1], [T11[3], REACH, .1], [T11[4], YANK, .09], [bt(50.5), pose({ ...YANK, dy: -.15 }), .2]];
  function sPull(t, lt) {
    paperBG();
    const z = 1.04 - .04 * E.out(lt / 1.2) + punch(t, [T11[4]], .03, 8);
    const [shx, shy] = shake(t, 8 * dec(t, T11[4], 11), 3);
    cam(CX + shx, CY + shy, z);
    dotGrid(24, 24, W, H, 48, 1.4, PAL.ink, .07);
    // 开 = open: a giant faint basket behind the line glides out toward camera on the drawer curve
    const ok = E.soft((t - T11[4] + .04) / .8);
    const BC = frameCam([0, 90, 220 + 300 * ok], .55 + lt * .12, .38, CX, 600 - 40 * ok, 700, lerp(620, 1700, ok), { fov: 26 });
    render3(basketModel({ w: 560, d: 440, h: 170, type: 'dish' }), BC, { style: 'ink', a: lerp(.05, .085, ok) });
    const sk = dec(t, T11[4], 5);
    if (sk > .02) speedLines(CX, 560, 420, 1400, 70, { a: .22 * sk, w: 10, seed: 5 });
    stageFloor(1030);
    crewLine(t, poseAt(t, PULL_KEYS), { y: 1030, s: 31, spread: 310, stagger: 44, depth: .08, mirror: true });
    slam(11, t, { rows: [0], size: 250, y: 440, hi: '拉', stroke: PAL.ink, sw: 7, pop: 1.5, ticks: true });
    camEnd();
  }
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
    // LAN presents a heart bent from basket wire; it beats on 心 (beat 51) and on every beat after
    const lx = 1340, P = poseAt(t, [[-9, KP.ready], [C_HEART, HOLD, .14], [T11[6], pose({ ...HOLD, dy: -.12, kL: .3, kR: .3 }), .1], [T11[7], HOLD, .15]]);
    const beat = .05 * pulse(t, 5) + .1 * dec(t, T11[6], 6), R = 235 * (1 + beat) * E.out5(lt / .22 + .05);
    wireHeart(lx, 300, R, { k: E.out5(lt / .28), w: 13 });
    // 都 = all of them: the crew cheers behind her, each gets a small wire heart that pops on 心
    [['pony', 1085], ['buns', 1205], ['long', 1475], ['kit', 1595]].forEach(([who, x], j) => {
      const Pc = poseAt(t, [[-9, KP.ready], [C_HEART + .04 * j, HOLD, .14], [T11[6], pose({ ...HOLD, dy: -.1, kL: .25, kR: .25 }), .1], [T11[7], HOLD, .15]]);
      const hk = E.back(clamp((t - T11[6] - .03 * j) / .22), 2), f = figure(x, 944, 20, Pc, { who, face: 'happy', seed: 20 + j * 3, a: .9 });
      if (hk > 0) wire2(heartPath(f.head[0], f.head[1] - 108, 34 * hk * (1 + .08 * pulse(t, 6)), 40), 5.5);
    });
    figure(lx, 1000, 42, P, { who: 'lan', face: 'happy', blush: 1.4, seed: 11 });
    // small wire hearts float up, one per 8th
    for (let j = 0; j < 4; j++) {
      const t0 = C_HEART + .1 + j * .24, age = t - t0; if (age < 0) continue;
      const x = lx + 330 + (j % 2) * 150 + hash(j * 7) * 40, y = 760 - age * (300 + hash(j) * 160), r = 26 + hash(j * 3) * 20;
      wire2(heartPath(x + Math.sin(age * 4 + j) * 18, y, r * E.back(clamp(age / .25)), 40), 5.5, { a: clamp(2.2 - age) });
    }
    camEnd();
    text('每一次拉开', 126, 380, { size: 42, font: F.sans, weight: 700, col: PAL.ink2, track: 8, a: .85 * (1 - clamp((t - T11[7] - .3) / .3)) });
    line(126, 410, 126 + 240 * E.soft(lt / .6), 410, 2.5, PAL.ink, .6);
    slam(11, t, { rows: [1], size: 290, x: 112, y: 700, align: 'left', hi: '心', pop: 1.7 });
  }

  // =====================================================================================================
  // SHOT 7 · TAG — instrumental logo sting; LAN pulls the next chapter in from the left edge.
  // =====================================================================================================
  function sTag(t, lt) {
    paperBG();
    const b52 = bt(52), b53 = bt(53), b54 = bt(54), b55 = bt(55), b56 = bt(56);
    cam(CX, CY, 1 + lt * .01);
    // registration marks
    for (const [x, y] of [[150, 190], [W - 150, 190], [150, 820], [W - 150, 820]]) { line(x - 18, y, x + 18, y, 2, PAL.ink, .5); line(x, y - 18, x, y + 18, 2, PAL.ink, .5); }
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
      const gx = lerp(rx0 + 20, rx1 - 20, E.io(clamp(sinceBeat(t) / .45)));
      sparkle(gx, slotY + 12, 30, { k: Math.sin(clamp(sinceBeat(t) / .45) * Math.PI), col: PAL.ink, rot: 0 });
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
    // ticker band (beat 55) moving right, priming the incoming panel
    const tk = E.soft((t - b55) / .5);
    if (tk > 0) { X.save(); X.translate(0, (1 - tk) * 120); ticker(1020, '一拉就到位   HIGOLD 悍高   厨房拉篮', t, { h: 72, size: 36, speed: 260, dir: -1 }); X.restore(); }
    metaStrip(t, { tl: 'CHORUS 01  ·  TAG', a: .9 });
    // LAN at the left edge: grabs the edge on beat 55, yanks on beat 56
    const ek = E.out5((t - b55 + .12) / .22);
    if (ek > 0) { rect(0, 0, 12 * ek, H, PAL.ink); rect(4 * ek, 0, 3 * ek, H, PAL.steel2); rect(12 * ek, 0, 26, H, PAL.ink, .12 * ek); }
    const groove = pose({ ...KP.hips, dy: -.18 * Math.abs(Math.sin(bp(t) * Math.PI)), kL: .25 * Math.abs(Math.sin(bp(t) * Math.PI)), kR: .25 * Math.abs(Math.sin(bp(t) * Math.PI)), head: .08 * Math.sin(bp(t) * Math.PI) });
    const P = t < b55 ? groove : poseAt(t, [[-9, groove], [b55, mirrorPose(REACH), .12], [b56, mirrorPose(YANK), .1]]);
    const lx = 140 + 40 * E.out5((t - b56) / .2);
    figure(lx, 978, 25, P, { who: 'lan', face: t > b56 ? 'happy' : 'smile', blush: 1, seed: 11 });
  }

  chapter('chorus1', 23.0, 38.5, [
    [C_HOOK, sHook], [C_MARCH, sMarch], [C_SPICE, sSpice], [C_BEND, sBend],
    [C_STEEL, sSteel], [C_MACRO, sMacro], [C_PULL, sPull], [C_HEART, sHeart], [C_TAG, sTag],
  ]);
})();
