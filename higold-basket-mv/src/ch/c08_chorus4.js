// c08_chorus4 — Chorus 4 · "Everything at once" (123.5 – 135.9) · night + orange, maximal, then home.
// 123.50 ORANGE HIT      full-bleed orange drawer slides in; giant 一拉 slams (the one full-bleed orange hit of this chorus)
// 124.28 THE ARMY        night stage: formation + mini-crews to the horizon, the pull ripples back; echo bands; 位 = shockwave
// 125.96 DASHBOARD       every cabinet is an OS window; each comes 在线 on a 16th; the last lands on 线
// 128.00 SPARKLE SWEEP   the whole kitchen in steel line; a sweep of light; glints on every corner, on the beats
// 129.90 BRAND LINE      HIGOLD / 悍高拉篮 / 全拉满 + a progress bar that IS the drawer's full extension
// 131.90 HOME            drawers glide shut (E.soft) in a wave; the last closes on 嗒 (orange); paper irises back in from the 嗒
(() => {
  'use strict';

  // ---------- timing ----------
  const T_HOOK = 123.5, T_ARMY = beatT(182), T_DASH = 125.96, T_SPARK = 128.0, T_BRAND = 129.9, T_HOME = 131.9, T_END = 135.9;
  const ON = LY[40].t;                    // 一 拉 就 到 位
  const T_WEI = ON[4];                    // 位 — the bar downbeat that lands the hook
  const T_DA = LY[44].t[3];               // 嗒 — the last drawer seats
  const GREEN = '#3BD16F';                // status-dot green (same value the shared splits() panel uses)

  // ---------- small private helpers ----------
  const snapK = (t, at, d = .2) => E.out5((t - at) / d);
  // night versions of 3D sets: the engine only darkens PAL.paper fills, so map the paper2 panels too
  const nightify = P => P.map(p => p.fill === PAL.paper2 ? { ...p, fill: PAL.night2 } : p);
  // night "glass" sets: panels half-transparent so every basket inside reads through them (x-ray line art)
  const glassify = P => P.map(p => p.k === 'face' && !p.rail ? { ...p, fill: rgba(PAL.night2, .55) } : p);
  const mod = (a, n) => ((a % n) + n) % n;
  // zoom about a screen point (unlike cam(), which also re-centres that point)
  const zoomAt = (px, py, z) => { X.save(); X.translate(px, py); X.scale(z, z); X.translate(-px, -py); };
  // pose keyframes: snaps (out5) into each key pose at its time, holds until the next
  function keyPose(keys, tt, d = .18) {
    if (tt < keys[0][0]) return keys[0][1];
    let i = 0; while (i + 1 < keys.length && tt >= keys[i + 1][0]) i++;
    const prev = i > 0 ? keys[i - 1][1] : keys[0][1];
    return lerpPose(prev, keys[i][1], E.out5((tt - keys[i][0]) / d));
  }
  // the hook choreography: 一 reach, 拉 YANK, 就 reach (other side), 到 yank, 位 = V
  const HOOK_KEYS = [[122.9, KP.ready], [ON[0], KP.reach], [ON[1], KP.yank], [ON[2], mirrorPose(KP.reach)], [ON[3], mirrorPose(KP.yank)], [T_WEI, KP.armsUp]];
  function hookPose(tt) {
    const P = keyPose(HOOK_KEYS, tt);
    if (tt > T_WEI + .25) { P.dy += .08 * Math.sin((tt - T_WEI) * 9); }
    return P;
  }

  // Cheap stick figure for the far crowd: same joint geometry as figure(), one path, no brush ribbon.
  // Appends to the current path (caller strokes once per row); returns the head centre + radius.
  function stickPath(x, y, s, P) {
    const U = s, torso = 3.1 * U, neck = .35 * U, ua = 1.75 * U, fa = 1.6 * U, th = 2.25 * U, sh = 2.2 * U, headR = 1.2 * U;
    const legVec = (h, k, side) => { const a1 = h * side, a2 = (h - k) * side; const kx = Math.sin(a1) * th, ky = Math.cos(a1) * th; return [kx, ky, kx + Math.sin(a2) * sh, ky + Math.cos(a2) * sh]; };
    const Lg = legVec(P.hL, P.kL, -1), Rg = legVec(P.hR, P.kR, 1), hipH = Math.max(Lg[3], Rg[3]);
    const hx = x, hy = y - hipH - P.dy * U, sq = 1 - (P.squash ?? 0), lean = P.lean;
    const nx = hx + Math.sin(lean) * torso * sq, ny = hy - Math.cos(lean) * torso * sq;
    const headA = lean + P.head, hcx = nx + Math.sin(headA) * (neck + headR), hcy = ny - Math.cos(headA) * (neck + headR);
    X.moveTo(hx + Lg[2], hy + Lg[3]); X.lineTo(hx + Lg[0], hy + Lg[1]); X.lineTo(hx, hy); X.lineTo(hx + Rg[0], hy + Rg[1]); X.lineTo(hx + Rg[2], hy + Rg[3]);
    X.moveTo(hx, hy); X.lineTo(nx, ny);
    const shx = nx - Math.sin(lean) * .25 * U, shy = ny + Math.cos(lean) * .25 * U;
    for (const [sa, ea, side] of [[P.sL, P.eL, -1], [P.sR, P.eR, 1]]) {
      const a1 = lean + sa * side, a2 = lean + (sa + ea) * side, ex = shx + Math.sin(a1) * ua, ey = shy + Math.cos(a1) * ua;
      X.moveTo(shx, shy); X.lineTo(ex, ey); X.lineTo(ex + Math.sin(a2) * fa, ey + Math.cos(a2) * fa);
    }
    X.moveTo(hcx + headR, hcy); X.arc(hcx, hcy, headR, 0, TAU);
    return [hcx, hcy, headR];
  }

  // Hero slam presenter for the orange frame (ink type; the hook char in paper; unsung chars as ghost outlines).
  function hookSlam(i, t, o) {
    const env = lyEnv(i, t, o.hold ?? .4, .2); if (env > 0) LYRIC_DRAWN.add(i);
    const rows = lyRows(i), size = o.size, font = F.heavy, wt = 900, track = -size * .03;
    rows.forEach((row, r) => {
      const ws = row.map(c => measure(c.ch, size, font, wt) + track), tw = ws.reduce((a, b) => a + b, 0) - track;
      let x = o.x - tw / 2; const y = o.y + r * size * 1.05;
      row.forEach((c, j) => {
        const k = chK(c.ti, t, .16), col = (o.hi && o.hi.includes(c.ch)) ? o.hiCol : o.col;
        if (k < 1) text(c.ch, x, y, { size, font, weight: wt, col: null, stroke: rgba(o.col, .38 * (1 - k)), sw: 3 });
        if (k > 0) {
          const s = lerp(1.5, 1, E.out5(k)), cx = x + ws[j] / 2, cy = y - size * .38;
          X.save(); X.translate(cx, cy); X.scale(s, s); X.translate(-cx, -cy);
          text(c.ch, x, y, { size, font, weight: wt, col, a: clamp(k * 4) * env });
          X.restore();
        }
        x += ws[j];
      });
    });
  }

  // K-pop echo bands (private lyEcho): rows of the hook scrolling in alternate directions. Centre row: each char turns
  // solid orange (with a pop) on its sung onset across every repetition; outer rows are paper outlines.
  function echoBands(i, t, o) {
    const env = lyEnv(i, t, o.hold ?? .3, .15); if (env <= 0) return; LYRIC_DRAWN.add(i);
    const L = LY[i], chars = [...L.text.replace(/[|，]/g, '')], size = o.size, font = F.heavy, n = o.rows ?? 3, mid = Math.floor(n / 2);
    const ws = chars.map(c => measure(c, size, font, 900) - size * .02), gap = size * .7, unit = ws.reduce((a, b) => a + b, 0) + gap;
    X.save(); X.globalAlpha *= env;
    for (let r = 0; r < n; r++) {
      const y = o.y + (r - mid) * size * (o.lead ?? 1.02), dir = r % 2 ? 1 : -1, off = mod(t * (o.speed ?? 150) * dir + r * 311, unit) - unit;
      const solidRow = r === mid;
      for (let x0 = off - unit; x0 < W + unit; x0 += unit) {
        let x = x0;
        chars.forEach((c, j) => {
          const k = chK(L.t[j], t, .14);
          if (solidRow && k > 0) {
            const s = lerp(1.3, 1, E.out5(k)), cx = x + ws[j] / 2, cy = y - size * .38;
            X.save(); X.translate(cx, cy); X.scale(s, s); X.translate(-cx, -cy);
            text(c, x, y, { size, font, weight: 900, col: PAL.orange });
            X.restore();
          } else text(c, x, y, { size, font, weight: 900, col: null, stroke: rgba(PAL.paper, solidRow ? .55 : (o.outerA ?? .32)), sw: 2.5 });
          x += ws[j];
        });
        sparkle(x + gap / 2, y - size * .36, size * .11, { col: solidRow ? PAL.orange : PAL.paper, a: solidRow ? .9 : .4, rot: t * 1.5 });
      }
    }
    X.restore();
  }

  // ---------- SHOT 1 · ORANGE HIT (123.5 – 124.28) ----------
  function shotHook(t, lt) {
    paperBG(PAL.orange); DARK = false;
    const z = 1 + .035 * E.out(clamp((lt + .16) / 1)) + .025 * snapK(t, ON[1], .1) * (1 - clamp((t - ON[1]) / .4));
    // nested drawer openings gliding toward the camera (E.soft) — the pull, as a one-point tunnel
    X.save();
    for (let k = 0; k < 7; k++) {
      const ph = frac(k / 7 + E.soft(clamp((lt + .3) / 1.1)) * .55), s = .12 + ph * ph * 1.9, w = 1500 * s, h = 860 * s;
      X.globalAlpha = .22 * clamp(ph * 3) * clamp((1 - ph) * 4);
      X.strokeStyle = PAL.ink; X.lineWidth = 2 + ph * 5; X.beginPath(); X.roundRect(CX - w / 2, 560 - h / 2, w, h, 18 * s); X.stroke();
    }
    X.restore();
    zoomAt(CX, 560, z);
    hookSlam(40, t, { x: CX, y: 650, size: 340, col: PAL.ink, hi: '拉', hiCol: PAL.paper });
    X.restore();
    // formation in ink along the bottom, on the hook choreography
    CREW.forEach((who, i) => {
      const k = i - 2, lead = who === 'lan', dl = .03 * Math.abs(k);
      figure(CX + k * 175, 1040, (lead ? 20 : 18), hookPose(t - dl), { who, col: PAL.ink, fill: PAL.orange, face: lead ? 'smile' : 'dot', blush: 0, seed: i * 3 + 1 });
    });
    // teaser metadata in ink
    metaStrip(t, { col: PAL.ink, tl: 'FINAL CHORUS  ·  04 / 04', br: 'CH.08  ·  EVERYTHING AT ONCE' });
    text('一拉就到位', 64, H - 54, { size: 22, font: F.sans, weight: 700, col: PAL.ink, track: 4 });
    // a hard ink frame snaps in on 拉
    const fk = snapK(t, ON[1], .16);
    if (fk > 0) { X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 10; const m = lerp(0, 26, fk); X.strokeRect(m, m, W - m * 2, H - m * 2); X.restore(); }
    // the bar/beat punch: a few ink sparkles around the slam
    for (let j = 0; j < 4; j++) sparkle(lerp(380, 1540, hash(j + 3)), lerp(240, 330, hash(j + 9)), 30 + 20 * hash(j), { k: snapK(t, ON[1] + j * .04, .25) * (1 - clamp((t - ON[1] - .35) / .3)), col: PAL.ink, rot: .2 });
  }

  // ---------- SHOT 2 · THE ARMY TO THE HORIZON (124.28 – 125.96) ----------
  const HY = 560, FY = 1012, AK = 450, AS = 15;   // horizon, formation ground; army ground = HY + AK/d, scale AS/d
  function shotArmy(t, lt) {
    paperBG(PAL.night); DARK = true;
    const push = 1 + .07 * E.io(clamp(lt / 1.8)) + .014 * pulse(t, 7) + .03 * snapK(t, T_WEI, .12) * (1 - clamp((t - T_WEI) / .5));
    zoomAt(CX, 860, push);
    // the vanishing point glows warm: where the whole army is headed
    X.save(); const vg = X.createRadialGradient(CX, HY, 0, CX, HY, 420); vg.addColorStop(0, rgba(PAL.orange, .42)); vg.addColorStop(1, rgba(PAL.orange, 0));
    X.fillStyle = vg; X.fillRect(CX - 440, HY - 440, 880, 880); X.restore();
    // sky: echo bands of the hook
    echoBands(40, t, { y: 352, size: 204, rows: 3, speed: 170, lead: 1.0 });
    // floor: perspective rays + depth lines, horizon rule
    X.save(); X.strokeStyle = PAL.paper; X.lineWidth = 1.5; X.globalAlpha = .09; X.beginPath();
    for (let k = -18; k <= 18; k++) { X.moveTo(CX, HY); X.lineTo(CX + k * 240, H + 300); }
    X.stroke(); X.globalAlpha = .07; X.beginPath();
    for (let d = .9; d < 40; d *= 1.27) { const y = HY + AK / d; X.moveTo(-200, y); X.lineTo(W + 200, y); }
    X.stroke(); X.restore();
    rect(-200, HY - 1.5, W + 400, 3, PAL.paper, .5);
    sparkle(CX, HY, 26 + 10 * pulse(t, 5), { col: PAL.orange, rot: 0 });
    // the army: rows of five-member mini-crews; the pull ripples back toward the horizon; a central aisle to the vanishing point
    const G = 930, M = 108, AISLE = 300;
    for (let ri = 11; ri >= 0; ri--) {
      const d = 1.4 * Math.pow(1.27, ri) * (1 + .3 * (1 - E.soft(clamp((lt + .12 - ri * .025) / .9)))), s = AS / d, gy = HY + AK / d, dl = (d - 1) * .055;
      const P = hookPose(t - dl), a = clamp(.95 - ri * .075, .16, 1), stag = ri % 2 ? G / 2 : 0;
      const groups = [];
      for (const side of [-1, 1]) for (let g = 0; g < 60; g++) {
        const wx = side * (AISLE + 2 * M + g * G + stag), sx = CX + wx / d;
        if (Math.abs(sx - CX) > W * .62) break;
        groups.push(wx);
      }
      if (s >= 4.6) {
        for (const wx of groups) CREW.forEach((who, m) => {
          const x = CX + (wx + (m - 2) * M) / d;
          figure(x, gy, s * (who === 'lan' ? 1.1 : 1), P, { who, col: PAL.paper, dark: true, a, face: 'dot', seed: m * 3 + ri, shadow: false, w: .23 });
        });
      } else {
        X.save(); X.globalAlpha = a; X.strokeStyle = PAL.paper; X.lineWidth = Math.max(.9, s * .25); X.lineCap = 'round'; X.lineJoin = 'round';
        X.beginPath(); const clips = [];
        for (const wx of groups) CREW.forEach((who, m) => { const hd = stickPath(CX + (wx + (m - 2) * M) / d, gy, s, P); if (who === 'lan') clips.push(hd); });
        X.stroke();
        X.fillStyle = PAL.orange; X.beginPath();
        for (const [hx, hy, r] of clips) { const rr = Math.max(1.3, r * .42); X.moveTo(hx + r * .7 + rr, hy - r * .7); X.arc(hx + r * .7, hy - r * .7, rr, 0, TAU); }
        X.fill(); X.restore();
      }
    }
    // 位: an orange shockwave ring across the floor from LAN's feet
    const wk = clamp((t - T_WEI) / .7);
    if (wk > 0 && wk < 1) {
      X.save(); X.strokeStyle = PAL.orange; X.globalAlpha = 1 - wk; X.lineWidth = 8 * (1 - wk) + 1;
      const rx = 80 + 1500 * E.out(wk); X.beginPath(); X.ellipse(CX, FY, rx, rx * .12, 0, 0, TAU); X.stroke();
      const rx2 = 60 + 900 * E.out(clamp(wk * 1.3 - .15)); X.globalAlpha = (1 - wk) * .6; X.beginPath(); X.ellipse(CX, FY, rx2, rx2 * .12, 0, 0, TAU); X.stroke(); X.restore();
    }
    // front formation (LAN centre, a little bigger)
    CREW.forEach((who, i) => {
      const k = i - 2, lead = who === 'lan';
      figure(CX + k * 225, FY, lead ? 30 : 27, hookPose(t - .03 * Math.abs(k)), { who, col: PAL.paper, dark: true, face: lead ? (t > T_WEI ? 'happy' : 'smile') : 'dot', blush: lead ? 1 : 0, seed: i * 3 + 1 });
    });
    X.restore();
    vignette(.45);
    metaStrip(t, { col: PAL.paper, a: .75, tl: 'FINAL CHORUS  ·  04 / 04' });
  }

  // ---------- 3D units (glow thumbnails for the dashboard, and the kitchen) ----------
  function unitScene(kind, e, t) {
    // returns {prims, cam params} in a local frame; e = 0..1 how far the unit is "out"
    switch (kind) {
      case 'dish': return { prims: dishDrawer(e * 400, { plates: 6 }), at: [0, 170, 260 + e * 200], yaw: -.62, pitch: .5, span: 900 };
      case 'spice': return { prims: spiceDrawer(e * 380), at: [0, 330, 230 + e * 190], yaw: -.75, pitch: .32, span: 820 };
      case 'corner': {
        const P = [], sw = e * 1.25;
        for (const y of [0, 300]) {
          P.push(...translate3(basketModel({ w: 360, d: 300, h: 90, type: 'plain', rimR: 110, midRim: false }), [180, y, 0]));
          P.push(...rotateY3(translate3(basketModel({ w: 360, d: 300, h: 90, type: 'plain', rimR: 110, midRim: false }), [-200, y, 0]), -sw, [-10, 0, 300]));
        }
        P.push(...boxModel(-420, -30, -20, 420, 440, 330, { sides: 'bk', fill: PAL.paper, backFill: PAL.paper2 }));
        return { prims: P, at: [0, 200, 250], yaw: -.35, pitch: .7, span: 1100 };
      }
      case 'tall': {
        const P = [], z = e * 360;
        for (let k = 0; k < 4; k++) P.push(...translate3(basketModel({ w: 420, d: 400, h: 100, type: 'plain', midRim: false }), [0, 60 + k * 330, z]));
        for (const x of [-222, 222]) P.push({ k: 'wire', pts: [[x, 40, z + 20], [x, 1160, z + 20]], r: 5, tone: 0 }, { k: 'wire', pts: [[x, 40, z + 380], [x, 1160, z + 380]], r: 5, tone: 0 });
        P.push(...doorModel(-250, 0, 250, 1220, 430 + z, { handle: false }));
        return { prims: P, at: [0, 610, 250 + z * .5], yaw: -.8, pitch: .18, span: 1500 };
      }
      case 'lift': {
        const P = [], a = e * 1.25, piv = [0, 760, 60], anc0 = [0, 840, 210];
        const anc = vadd(rotX(vsub(anc0, piv), a), piv), off = vsub(anc, anc0);
        P.push(...boxModel(-340, 700, 0, 340, 1150, 340, { sides: 'tk', fill: PAL.paper, backFill: PAL.paper2 }));
        for (const x of [-340, 340]) P.push({ k: 'wire', pts: [[x, 700, 340], [x, 1150, 340], [x, 1150, 0]], r: 3, tone: 0 }, { k: 'wire', pts: [[x, 700, 0], [x, 700, 340]], r: 3, tone: 0 });
        P.push(...translate3(basketModel({ w: 560, d: 260, h: 150, type: 'plain' }), vadd([0, 750, 50], off)));
        for (const x of [-300, 300]) P.push({ k: 'wire', pts: [[x, piv[1], piv[2]], [x, anc[1], anc[2]]], r: 8, tone: 0 });
        return { prims: P, at: [0, 820, 250], yaw: -.55, pitch: .15, span: 1000 };
      }
    }
  }
  function drawUnit(kind, e, x, y, w, h, style, dark, t, yawOff = 0) {
    const U = unitScene(kind, e, t);
    const C = frameCam(U.at, U.yaw + yawOff, U.pitch, x + w / 2, y + h / 2, U.span, Math.min(w, h * 1.3) * .95, { fov: 28 });
    render3(dark ? nightify(U.prims) : U.prims, C, { style, dark, lw: 1.1 });
  }

  // ---------- SHOT 3 · DASHBOARD (125.96 – 128.0) ----------
  const DASH = [['碗碟拉篮', 'dish'], ['调味拉篮', 'spice'], ['转角拉篮', 'corner'], ['高柜拉篮', 'tall'], ['升降拉篮', 'lift'], ['LAN.cam', 'cam']];
  function shotDash(t, lt) {
    paperBG(PAL.night); DARK = true;
    gridPaper({ col: PAL.steel1, a: .05, gap: 40, ox: -lt * 30 });
    const gx = 850, gy = 205, ww = 318, wh = 372, gxs = 342, gys = 402;
    const onAt = j => LY[41].t[4] + j * BEAT / 4;       // 都 … 线, one window per 16th; the last lands on 线
    const nOn = DASH.reduce((s, _, j) => s + (t >= onAt(j) ? 1 : 0), 0);
    // header strip
    const hk = E.soft(clamp((t - T_DASH) / .6));
    X.save(); X.globalAlpha = hk;
    text('KITCHEN.OS', gx, gy - 58, { size: 26, font: F.mono, weight: 700, col: PAL.paper, track: 3 });
    text('设备状态面板', gx + 200, gy - 58, { size: 24, font: F.sans, weight: 500, col: PAL.steel2 });
    const cnt = `${nOn}/6`, ok = nOn === 6;
    circle(gx + 3 * gxs - 250, gy - 67, 9, { fill: ok ? GREEN : PAL.grey });
    text('在线', gx + 3 * gxs - 228, gy - 58, { size: 26, font: F.sans, weight: 700, col: PAL.paper });
    text(cnt, gx + 3 * gxs - 26, gy - 58, { size: 34, font: F.mono, weight: 800, col: ok ? GREEN : PAL.paper, align: 'right' });
    line(gx, gy - 38, gx + 3 * gxs - 26, gy - 38, 2, PAL.steel1, .6);
    X.restore();
    // windows glide in from the right, staggered on 32nds (E.soft), then each comes online on its 16th
    DASH.forEach(([title, kind], j) => {
      const c = j % 3, r = Math.floor(j / 3), sk = E.soft(clamp((t - (T_DASH - .12 + j * .07)) / .7));
      const x = gx + c * gxs + (1 - sk) * (1180 - c * 120), y = gy + r * gys;
      const on = t >= onAt(j), ok = snapK(t, onAt(j), .22), glide = E.soft(clamp((t - onAt(j)) / .9));
      win(x, y, ww, wh, '', { dark: true, body: (bx, by, bw, bh) => {
        rect(bx, by, bw, bh, PAL.night);
        dotGrid(bx + 12, by + 12, bw - 24, bh - 70, 24, 1.2, PAL.paper, .12);
        X.save(); X.globalAlpha *= on ? 1 : .35;
        if (kind === 'cam') {
          const fp = move('wave', t, 2);
          X.save(); X.beginPath(); X.rect(bx, by, bw, bh - 58); X.clip();
          figure(bx + bw / 2, by + 118 + 9.05 * 38, 38, { ...fp, dy: 0 }, { who: 'lan', col: PAL.paper, dark: true, face: on ? 'happy' : 'closed', blush: 1, seed: 7 });
          X.restore();
          if (on) { circle(bx + 22, by + 22, 7, { fill: PAL.orange, a: .5 + .5 * pulse(t, 3) }); text('LIVE', bx + 36, by + 29, { size: 18, font: F.mono, weight: 700, col: PAL.paper }); }
        } else drawUnit(kind, on ? glide : 0, bx + 6, by + 4, bw - 12, bh - 70, 'glow', true, t, Math.sin(t * .6 + j) * .08);
        X.restore();
        // status row
        line(bx + 14, by + bh - 56, bx + bw - 14, by + bh - 56, 1.5, PAL.steel1, .5);
        if (on) {
          circle(bx + 30, by + bh - 28, 10 * E.back(ok, 3), { fill: GREEN });
          circle(bx + 30, by + bh - 28, 10 + 18 * ok, { stroke: GREEN, w: 2, a: 1 - ok });
          text('在线', bx + 52, by + bh - 18, { size: 26, font: F.sans, weight: 800, col: PAL.paper, a: ok });
          text('ONLINE', bx + bw - 16, by + bh - 20, { size: 16, font: F.mono, weight: 600, col: GREEN, align: 'right', a: ok });
        } else {
          X.save(); X.strokeStyle = PAL.grey; X.lineWidth = 3; X.lineCap = 'round'; X.beginPath(); const a0 = t * 9; X.arc(bx + 30, by + bh - 28, 9, a0, a0 + 4.2); X.stroke(); X.restore();
          text('连接中…', bx + 52, by + bh - 18, { size: 22, font: F.sans, weight: 500, col: PAL.grey });
        }
      } });
      // title (Chinese titles in the sans face; the chrome's own mono title is left empty)
      if (sk > .02) text(title, x + 88, y + 28, { size: 20, font: F.sans, weight: 700, col: PAL.paper, track: 1 });
    });
    // all online on 线: a cobalt selection marquee snaps around the grid
    const mk = snapK(t, onAt(5), .25);
    if (mk > 0) {
      const m = lerp(40, 14, mk), x0 = gx - m, y0 = gy - m, x1 = gx + 2 * gxs + ww + 10 + m, y1 = gy + gys + wh + 10 + m;
      X.save(); X.strokeStyle = PAL.cobalt; X.lineWidth = 4; X.setLineDash([16, 10]); X.lineDashOffset = -t * 60; X.globalAlpha = mk; X.strokeRect(x0, y0, x1 - x0, y1 - y0); X.restore();
      for (const [px, py] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) rect(px - 8, py - 8, 16, 16, PAL.cobalt, mk);
      cursor(x1 - 6, y1 - 6, { s: 1.5, fill: PAL.cobalt, click: clamp((t - onAt(5)) / .4) });
    }
    // lyric, left
    lySide(41, t, { x: 110, y: 575, size: 160, font: F.heavy, weight: 900, col: PAL.paper, numCol: PAL.steel2, hi: '在线', lead: 1.2 });
    metaStrip(t, { col: PAL.paper, a: .7, tl: 'FINAL CHORUS  ·  04 / 04' });
  }

  // ---------- the kitchen (shared by SPARKLE and HOME) ----------
  // world mm; fronts at z = 460. ex = [pantry, spice, d1lo, d1hi, d2lo, d2hi] extension 0..1
  function kitchen(ex, o = {}) {
    const P = [];
    // tall pantry (left end)
    { const z = ex[0] * 380, xc = -1240;
      P.push(...boxModel(xc - 262, 0, 0, xc + 262, 2100, 460, { sides: 'k', fill: PAL.paper, backFill: PAL.paper2 }));
      for (let k = 0; k < 5; k++) P.push(...translate3(basketModel({ w: 420, d: 400, h: 110, type: 'plain', midRim: false }), [xc, 90 + k * 400, z + 20]));
      if (o.items !== false) for (let k = 0; k < 5; k++) for (let m = 0; m < 3; m++) P.push(lathe([xc - 120 + m * 120, 94 + k * 400, 160 + (m % 2) * 120 + z], [PROF.jar, PROF.bottle, PROF.jar][m].map(([r, y]) => [r * .8, y * (k === 4 ? .45 : .6)]), { band: m === 1 }));
      P.push(...doorModel(xc - 256, 10, xc + 256, 2090, 460 + z, { handle: false }));
      for (const x of [xc - 226, xc + 226]) P.push({ k: 'wire', pts: [[x, 60, z + 40], [x, 2020, z + 40]], r: 5, tone: 0 }); }
    // spice pull-out
    P.push(...translate3(spiceDrawer(ex[1] * 400, { h: 550 }), [-880, 0, 0]));
    // two drawer stacks
    for (const [xc, a, b] of [[-464, 2, 3], [172, 4, 5]]) {
      P.push(...translate3(dishDrawer(ex[a] * 400, { y0: 60, items: o.items, slides: true }), [xc, 0, 0]));
      P.push(...translate3(dishDrawer(ex[b] * 400, { y0: 400, items: o.items, plates: 5 }).filter(p => !(p.k === 'lathe' && p.prof === PROF.bowl)), [xc, 0, 0]));
      // when the stack is shut, a blind rail fills the reveal between its two fronts (so nothing inside peeks through)
      if (ex[a] < .02 && ex[b] < .02) P.push({ k: 'face', layer: 2, bias: -30, pts: [[xc - 316, 326, 452], [xc + 316, 326, 452], [xc + 316, 354, 452], [xc - 316, 354, 452]], fill: PAL.paper });
    }
    // counter slab + visible right end panel (drawn with the fronts so closed baskets never show through)
    P.push(...boxModel(-980, 680, 0, 510, 720, 490, { sides: 'tf', fill: PAL.paper, frontFill: PAL.paper2, layer: 2 }));
    P.push(...boxModel(-1502, 0, 0, -978, 2100, 460, { sides: 'rt', fill: PAL.paper2, topFill: PAL.paper, layer: 2 }));   // pantry side + top
    P.push(...boxModel(492, 0, 0, 510, 680, 460, { sides: 'r', fill: PAL.paper2, layer: 2 }));
    // wall cabinets: a fixed door + a flip-up door over the lift-down basket (ex[6]: 0 stowed .. 1 lowered)
    P.push(...boxModel(-980, 1350, 0, 500, 2090, 340, { sides: 'bk', fill: PAL.paper2, backFill: PAL.paper2 }));
    P.push(...boxModel(496, 1350, 0, 500, 2090, 340, { sides: 'r', fill: PAL.paper2, layer: 2 }));
    P.push(...doorModel(-976, 1350, -244, 2090, 350, { handle: false }));
    const e = ex[6] ?? 0, L = liftPos(e);
    P.push(...rotateX3(doorModel(-240, 1350, 496, 2090, 350, { handle: false }), -1.35 * E.io(clamp(e * 1.4)), [0, 2090, 350]));
    P.push(...translate3(basketModel({ w: 600, d: 270, h: 170, type: 'plain' }), [128, L[0], L[1]]));
    if (o.items !== false) for (let m = 0; m < 4; m++) P.push(lathe([128 - 210 + m * 140, L[0] + 4, L[1] + 120 + (m % 2) * 40], m % 2 ? PROF.cup : PROF.jar.map(([r, y]) => [r * .9, y * 1.1]), { band: m === 0, open: m % 2 === 1 }));
    for (const x of [-182, 438]) P.push({ k: 'wire', pts: [[x, 1760, 300], [x, L[0] + 160, L[1] + 150]], r: 7, tone: 0 });
    return P;
  }
  // lift-down basket position (y, z of its back-bottom): forward first, then down
  const liftPos = e => [lerp(1390, 1000, 1 - Math.cos(clamp(e) * Math.PI / 2)), lerp(40, 420, Math.sin(clamp(e) * Math.PI / 2))];
  // screen-space "corners" to sparkle: front corners of the fronts / counter / pantry
  const CORNERS = [[-1496, 2090, 460], [-984, 2090, 460], [-1496, 10, 460], [-975, 670, 460], [-785, 670, 460], [-780, 670, 460], [-148, 670, 460],
    [-144, 670, 460], [488, 670, 460], [-980, 720, 490], [510, 720, 490], [-976, 2090, 350], [496, 2090, 350], [-976, 1350, 350], [496, 1350, 350],
    [-244, 1350, 350], [-780, 10, 460], [488, 10, 460], [-144, 350, 460], [-148, 330, 460]];

  // ---------- SHOT 4 · SPARKLE SWEEP (128.0 – 129.9) ----------
  const SPARK_EX = [.85, .9, .75, .55, .95, .6, 1];
  function shotSparkle(t, lt) {
    paperBG(PAL.night); DARK = true;
    const k = E.io(clamp(lt / 2.4)), C = frameCam([-480, 1000, 560], .46 - .12 * k, .26 - .04 * k, 1250, 560, 2600, 1030 + 60 * k, { fov: 30 });
    const OPEN_AT = [0, .05, .1, .13, .17, .2, .12];
    const EXN = SPARK_EX.map((v, j) => v * (.3 + .7 * E.soft(clamp((lt + .05 - OPEN_AT[j]) / .8)))), kp = glassify(kitchen(EXN));
    // floor line
    const f0 = pin(C, [-1700, 0, 460]), f1 = pin(C, [900, 0, 460]), fy = x => f0[1] + (f1[1] - f0[1]) * (x - f0[0]) / (f1[0] - f0[0]);
    X.save(); const fg = X.createLinearGradient(640, 0, 900, 0); fg.addColorStop(0, rgba(PAL.steel1, 0)); fg.addColorStop(1, rgba(PAL.steel1, .5));
    X.strokeStyle = fg; X.lineWidth = 2; X.beginPath(); X.moveTo(640, fy(640)); X.lineTo(W, fy(W)); X.stroke(); X.restore();
    render3(kp, C, { style: 'glow', dark: true, lw: .85 });
    rect(0, 0, W, H, PAL.night, .3);
    // the sweep: a slanted band of light crosses the kitchen; inside it the same line art burns brighter
    const sx = lerp(560, 2000, E.io(clamp((lt - .02) / 1.75))), bw = 230, sl = .32;
    const band = [[sx - bw - H * sl, H], [sx + bw - H * sl, H], [sx + bw, 0], [sx - bw, 0]];
    X.save(); poly(band); X.clip();
    render3(kp, C, { style: 'glow', dark: true, lw: 1.45, a: 1 });
    const nl = Math.hypot(1, sl), nx = 1 / nl, ny = sl / nl, mx = sx - CY * sl;     // gradient across the slanted band
    const g = X.createLinearGradient(mx - nx * bw, CY - ny * bw, mx + nx * bw, CY + ny * bw); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,0.09)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    X.globalCompositeOperation = 'lighter'; X.fillStyle = g; X.setTransform(1, 0, 0, 1, 0, 0); X.fillRect(0, 0, W, H);
    X.restore();
    // glints: every corner lights as the sweep passes it; on each beat a chosen set flares big
    const L = liftPos(EXN[6]), corners = CORNERS.concat([[-172, L[0] + 170, L[1] + 270], [428, L[0] + 170, L[1] + 270], [428, L[0], L[1] + 270]]);
    // small twinkles on every basket's front rim corners, lit only by the passing sweep
    const rims = [];
    for (let k = 0; k < 5; k++) for (const sgn of [-1, 1]) rims.push([-1240 + sgn * 210, 200 + k * 400, EXN[0] * 380 + 420]);
    for (const [xc, i0, i1] of [[-464, 2, 3], [172, 4, 5]]) for (const [y0, i] of [[60, i0], [400, i1]]) for (const sgn of [-1, 1]) rims.push([xc + sgn * 280, y0 + 150, 440 + EXN[i] * 400]);
    for (const sgn of [-1, 1]) rims.push([-880 + sgn * 75, 610, 440 + EXN[1] * 400], [128 + sgn * 300, L[0] + 170, L[1] + 270]);
    rims.forEach((c, j) => { const q = pin(C, c), u = (q[0] - (sx - q[1] * sl)) / bw, kk = Math.exp(-u * u * 3) * (.7 + .3 * Math.sin(t * 25 + j)); if (kk > .05) sparkle(q[0], q[1], 17 * kk, { col: PAL.shine, rot: j }); });
    corners.forEach((c, j) => {
      const q = pin(C, c), u = (q[0] - (sx - q[1] * sl)) / bw;   // distance from the band centre at this height
      let kk = Math.exp(-u * u * 2.2);
      for (const [n, set] of [[188, [0, 5, 9, 14, 20, 22]], [189, [2, 7, 11, 16, 3, 21]], [190, [1, 4, 8, 12, 17, 10, 19]]]) if (set.includes(j)) { const a = t - beatT(n); if (a >= 0) kk = Math.max(kk, E.back(clamp(a / .16), 2) * (1 - clamp((a - .22) / .45)) * 1.6); }
      if (kk > .04) sparkle(q[0], q[1], 36 * kk, { col: PAL.shine, rot: .1 + j * .7 });
    });
    // lyric: vertical serif columns, left
    lyVertical(42, t, { x: 470, y: 150, size: 158, font: F.serif, weight: 900, col: PAL.paper, hi: '闪亮', gap: 1.3 });
    // orange + white glints burst around 闪亮 on 亮
    const lk = t - LY[42].t[5];
    if (lk > 0) for (let j = 0; j < 6; j++) { const a = j * 1.05 + .3; sparkle(265 + Math.cos(a) * 130, 390 + Math.sin(a) * 190, 18 + 16 * hash(j + 40), { col: j % 2 ? PAL.orange : PAL.shine, k: E.back(clamp(lk / .16 - j * .12), 2.5) }); }
    metaStrip(t, { col: PAL.paper, a: .7, tl: 'FINAL CHORUS  ·  04 / 04' });
  }

  // ---------- SHOT 5 · BRAND LINE (129.9 – 131.9) ----------
  function shotBrand(t, lt) {
    paperBG(PAL.night); DARK = true;
    const L = LY[43].t;                                     // 悍 高 拉 篮 全 拉 满
    // the drawer: a nudge on the first 拉, then the full pull on 全 that lands on 满
    const p = lerp(.22 * E.soft(clamp((t - L[2]) / .5)), 1, E.soft(clamp((t - L[4]) / .62)));
    const ext = p * 420, C = frameCam([0, 150, 230 + ext * .5], -.62 + .05 * E.io(clamp(lt / 2.2)), .5, 1420, 540, 760, 720, { fov: 28 });
    const prims = nightify([...boxModel(-330, -20, -20, 330, 400, 460, { sides: 'lrbk', fill: PAL.paper, sideFill: PAL.paper2, backFill: PAL.paper2 }),
      ...boxModel(-350, 400, -20, 350, 430, 490, { sides: 'lrtf', fill: PAL.paper, frontFill: PAL.paper2 }), ...dishDrawer(ext)]);
    render3(prims, C, { style: 'steel', dark: true, shine: lerp(-500, 500, frac(lt * .6)) });
    // product truth caption once fully out
    const fk = clamp((t - L[6]) / .5);
    if (fk > 0) text('全拉出  ·  FULL EXTENSION  ·  阻尼缓冲', 110, 985, { size: 22, font: F.mono, weight: 600, col: PAL.steel2, track: 2, a: E.out(fk) });
    // brand lockup, left
    const bk = E.soft(clamp((t - T_BRAND + .05) / .6));
    X.save(); X.beginPath(); X.rect(0, 0, 1060, H); X.clip();
    text('HIGOLD', 100 - (1 - bk) * 800, 380, { size: 300, font: F.anton, col: PAL.paper, track: 6 });
    X.restore();
    // lyric: row 1 悍高拉篮 (big), row 2 全拉满 (orange) — per-char slam
    const rows = lyRows(43), env = lyEnv(43, t, .25, .2);
    if (env > 0) {
      LYRIC_DRAWN.add(43);
      const sizes = [170, 170], ys = [600, 800];
      rows.forEach((row, r) => {
        let x = 110;
        row.forEach(c => {
          const k = chK(c.ti, t, .16), sz = sizes[r], w = measure(c.ch, sz, F.heavy, 900) - sz * .02;
          if (k > 0) {
            const s = lerp(1.4, 1, E.out5(k)), cx = x + w / 2, cy = ys[r] - sz * .38;
            X.save(); X.translate(cx, cy); X.scale(s, s); X.translate(-cx, -cy);
            text(c.ch, x, ys[r], { size: sz, font: F.heavy, weight: 900, col: r === 1 ? PAL.orange : PAL.paper, a: clamp(k * 4) * env });
            X.restore();
          }
          x += w;
        });
      });
    }
    // the progress bar: 拉满 — it IS the drawer's extension
    const bx = 110, by = 862, bw = 920, bh = 64, nb = 24, cell = (bw - 10) / nb, fill = Math.floor(p * nb + 1e-6);
    X.save(); X.globalAlpha *= clamp(lt * 4);
    rect(bx + 8, by + 8, bw, bh, '#000', .9); rect(bx, by, bw, bh, PAL.night2); X.strokeStyle = PAL.paper; X.lineWidth = 3; X.strokeRect(bx, by, bw, bh);
    for (let i = 0; i < fill; i++) rect(bx + 7 + i * cell, by + 8, cell - 5, bh - 16, i === nb - 1 ? PAL.shine : PAL.orange);
        text(String(Math.round(p * 100)).padStart(3, ' ') + '%', bx + bw, by - 16, { size: 26, font: F.mono, weight: 800, col: PAL.paper, align: 'right' });
    text('拉满进度  ·  PULL-OUT', bx, by - 16, { size: 20, font: F.mono, weight: 600, col: PAL.steel2, track: 2 });
    X.restore();
    // stamp on 满
    const sk = snapK(t, L[6] + .05, .25);
    if (sk > 0) sticker(800, 742, '拉满 ✓', { k: sk, size: 38, rot: -.08, fill: PAL.orange });
    text(`${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(2).padStart(5, '0')}`, W - 64, 70, { size: 22, font: F.mono, weight: 600, col: PAL.paper, a: .7, align: 'right' });
  }

  // ---------- SHOT 6 · HOME (131.9 – 135.9): the wave of closing drawers, 嗒, night → paper ----------
  // kitchen drawer k (0 pantry, 1 spice, 2 d1 low, 3 d1 high, 4 d2 low, 5 d2 high) starts closing at CL[k] (E.soft);
  // the wave runs left → right and the last one (d2 low) seats exactly on 嗒
  const CL = [131.99, 132.08, 132.26, 132.17, T_DA - .44, 132.35, 131.9], CLOSE_D = [.72, .72, .72, .72, .52, .72, .8];
  const EX0 = [.85, .9, .75, .55, .95, .6, 1];
  function homeCam(t) {
    const k = E.out(clamp((t - T_HOME) / 3.4));
    return frameCam([lerp(-250, -420, k), lerp(480, 1000, k), lerp(700, 460, k)], lerp(.42, .16, k), lerp(.42, .1, k), lerp(1330, 1235, k), lerp(560, 575, k), 2600, lerp(1650, 930, k), { fov: 30 });
  }
  function homeScene(t, mode) {
    const night = mode === 'night', ink = night ? PAL.paper : PAL.ink;
    paperBG(night ? PAL.night : PAL.paper);
    const C = homeCam(t);
    const ex = EX0.map((v, j) => v * (1 - E.soft(clamp((t - CL[j]) / CLOSE_D[j]))));
    const f0 = pin(C, [-1700, 0, 460]), f1 = pin(C, [900, 0, 460]);
    const fy = x => f0[1] + (f1[1] - f0[1]) * (x - f0[0]) / (f1[0] - f0[0]);
    handLine(-20, fy(-20), W + 20, fy(W + 20), { w: 2.5, col: ink, seed: 808, a: night ? .5 : .9 });
    render3((night ? glassify : P => P)(kitchen(ex, { items: true })), C, { style: night ? 'glow' : 'ink', dark: night, lw: .9 });
    // the crew, tiny, gather along the countertop (scale contrast), then wave goodnight
    CREW.forEach((who, i) => {
      const k = i - 2, lead = who === 'lan', arrive = E.soft(clamp((t - T_HOME - .15 - Math.abs(k) * .1) / 1.3));
      const wx = lerp([-930, -720, -330, 80, 440][i], -330 + k * 150, arrive), q = C.project([wx, 720, 400]), sc = q[3] * 29;
      const P = lead && t > 134.3 ? move('wave', t) : move('sway', t, i);
      figure(q[0], q[1], sc * (lead ? 1.12 : 1), P, { who, col: ink, dark: night, face: t > T_DA ? 'happy' : (lead ? 'smile' : 'dot'), blush: lead ? 1 : 0, seed: i * 3 + 1, w: .24 });
    });
    // 嗒: the orange mark at the last drawer's leading edge
    const dp = pin(C, [172 + 316, 60 + 150 + 120, 460 + ex[4] * 400]), dk = t - T_DA;
    if (dk > -0.02) {
      const k = E.back(clamp(dk / .22), 2.2), fade = 1 - clamp((dk - 2.2) / .6);
      X.save(); X.globalAlpha *= fade;
      for (let j = 0; j < 3; j++) { const a = -1.45 + j * .5, r0 = 18 + 26 * E.out(clamp(dk / .3)), r1 = r0 + 34 * k; line(dp[0] + Math.cos(a) * r0, dp[1] + Math.sin(a) * r0, dp[0] + Math.cos(a) * r1, dp[1] + Math.sin(a) * r1, 5, PAL.orange, clamp(1 - dk / .9)); }
      marker('嗒', dp[0] + 110, dp[1] - 120, { size: 150, sx: k, sy: k, col: PAL.orange, align: 'center', rot: -.1 });
      X.restore();
    }
    // lyric: quiet serif on the left
    lySide(44, t, { x: 120, y: 470, size: 118, font: F.serif, weight: 900, col: ink, numCol: night ? PAL.steel2 : PAL.ink2, hi: '嗒', lead: 1.3, hold: .3 });
    metaStrip(t, { col: ink, a: .6, tl: 'FINAL CHORUS  ·  04 / 04' });
    return dp;
  }
  function shotHome(t, lt) {
    // night → paper: a paper iris opens from the 嗒 point with the drawer curve
    const ik = E.soft(clamp((t - T_DA - .06) / 1.15)), R = ik * 2300;
    if (ik < .999) {
      const dp = homeScene(t, 'night');
      if (ik > 0) {
        X.save(); X.beginPath(); X.arc(dp[0] + 60, dp[1] - 60, R, 0, TAU); X.clip(); homeScene(t, 'paper'); X.restore();
        X.save(); X.strokeStyle = PAL.orange; X.lineWidth = 6 * (1 - ik); X.beginPath(); X.arc(dp[0] + 60, dp[1] - 60, R, 0, TAU); X.stroke(); X.restore();
      }
      DARK = ik < .45;
    } else { homeScene(t, 'paper'); DARK = false; }
  }

  chapter('chorus4', T_HOOK, T_END, [[T_HOOK, shotHook], [T_ARMY, shotArmy], [T_DASH, shotDash], [T_SPARK, shotSparkle], [T_BRAND, shotBrand], [T_HOME, shotHome]]);
})();
