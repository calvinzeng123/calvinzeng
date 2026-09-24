// c03_verse2.js — Verse 2 · "Acceleration" (38.5 – 59.0) · paper → night.
// A research paper that loses control: FIG.1 drawer mitosis → FIG.2 the exponential wall → FIG.3 KITCHEN SCALING LAW →
// the curve overflows its own chart → a kitchen speedrun → the timer blurs → push into a basket → the night acceleration
// tunnel, which ends in a bright slot for the pull transition. Cuts and camera speed ramp up all the way through.
'use strict';
(() => {
  const B = beatT;                                   // B(56) = 38.372 is the bar-14 downbeat
  const LX = 118, GREEN = '#3BD16F';
  const MONO = '"Mono", "NotoSans", monospace';      // mono Latin with Noto for any CJK glyphs

  // ---------------------------------------------------------------- small shared helpers
  // figure tag: "FIG. 1 ——— title" (mono, research-paper metadata)
  function figTag(x, y, tag, title, k = 1, o = {}) {
    const col = o.col ?? PAL.ink, len = o.len ?? 90, tw = measure(tag, 22, MONO, 700, 2);
    const hl = o.halo ?? 0;
    htext(tag, x, y, { size: 22, font: MONO, weight: 700, col, track: 2, a: clamp(k * 3) }, hl);
    if (hl) line(x + tw + 14, y - 8, x + tw + 14 + len * E.out(k), y - 8, 10, PAL.paper, hl);
    line(x + tw + 14, y - 8, x + tw + 14 + len * E.out(k), y - 8, 2, col);
    if (title) htext(title, x + tw + 30 + len, y, { size: 22, font: MONO, weight: 500, col, a: clamp(k * 2 - .6) }, hl);
  }
  // text with an optional paper halo (for type sitting on a busy picture)
  function htext(str, x, y, o, halo = 0) {
    if (halo > 0) text(str, x, y, { ...o, col: null, stroke: PAL.paper, sw: 14, a: (o.a ?? 1) * halo });
    text(str, x, y, o);
  }
  // closed ink path (hand-drawn outline) + optional fill
  function inkPoly(pts, o = {}) {
    if (o.fill) fillPoly(pts, o.fill, o.fa ?? 1);
    inkStroke([...pts, pts[0], pts[1]], { w: o.w ?? 2.5, col: o.col ?? PAL.ink, taper: [0, 0], wob: o.wob ?? .5, seed: o.seed ?? 1, press: .12, a: o.a });
  }
  // superscript number: base + exponent
  function sup(base, ex, x, y, o = {}) {
    const s = o.size ?? 30, col = o.col ?? PAL.ink, al = o.align ?? 'right', f = o.font ?? MONO;
    const wb = measure(base, s, f, 600), we = measure(ex, s * .62, f, 600), tw = wb + we + 2, x0 = al === 'right' ? x - tw : al === 'center' ? x - tw / 2 : x;
    text(base, x0, y, { size: s, font: f, weight: 600, col, a: o.a });
    text(ex, x0 + wb + 2, y - s * .42, { size: s * .62, font: f, weight: 600, col, a: o.a });
  }

  // ---------------------------------------------------------------- the drawer, in oblique elevation
  // Opening top-left (x, y), size (w, h), pull e (0..1). dir +1: the front comes toward the viewer down-right (we see the
  // basket's top + left side); dir -1: down-left (top + right side). Draw order for grids (dir +1): bottom rows first, right→left.
  function drawer(x, y, w, h, e, o = {}) {
    const ink = o.ink ?? PAL.ink, pap = o.paper ?? PAL.paper, lw = o.lw ?? clamp(w / 120, 1.2, 4), dir = o.dir ?? 1;
    const Dp = h * 1.2 * Math.max(0, e), ox = dir * .42 * Dp, oy = .30 * Dp, fx = x + ox, fy = y + oy, hand = o.hand ?? w > 170;
    if (Dp > .8) {
      rect(x, y, w, h, o.cav ?? PAL.ink);                                           // the dark cabinet cavity
      const rim = h * .16;
      // basket interior seen through the open top: floor tint + slats running in depth
      fillPoly([[fx, fy + rim], [x, y + rim], [x + w, y + rim], [fx + w, fy + rim]], PAL.paper2);
      const sx0 = dir > 0 ? x : x + w, sx1 = dir > 0 ? fx : fx + w;               // visible side edge (cavity, front)
      fillPoly([[sx1, fy + rim], [sx0, y + rim], [sx0, y + h], [sx1, fy + h]], pap);
      X.save(); X.strokeStyle = ink; X.lineCap = 'round'; X.lineWidth = Math.max(1, lw * .55); X.beginPath();
      const ns = Math.max(3, Math.round(w / 34));
      for (let k = 1; k < ns; k++) { const q = k / ns; X.moveTo(lerp(fx, fx + w, q), fy + rim); X.lineTo(lerp(x, x + w, q), y + rim); }
      const nu = Math.max(2, Math.round(Dp / Math.max(9, h * .14)));
      for (let k = 1; k < nu; k++) { const q = k / nu, px = lerp(sx1, sx0, q), py = lerp(fy, y, q); X.moveTo(px, py + rim); X.lineTo(px, py + h); }
      for (const f of [.55]) { X.moveTo(sx1, fy + h * f); X.lineTo(sx0, y + h * f); }
      X.moveTo(lerp(fx, x, .5), lerp(fy, y, .5) + rim); X.lineTo(lerp(fx + w, x + w, .5), lerp(fy, y, .5) + rim);
      X.stroke(); X.lineWidth = Math.max(1.2, lw * .9); X.beginPath();
      X.moveTo(sx1, fy + rim); X.lineTo(sx0, y + rim); X.lineTo(dir > 0 ? x + w : x, y + rim); X.stroke();   // top rim
      X.restore();
      if (o.items) o.items(fx, fy + rim, x, y + rim, w, h);
    }
    // the front panel
    const F4 = [[fx, fy], [fx + w, fy], [fx + w, fy + h], [fx, fy + h]];
    if (hand) inkPoly(F4, { fill: o.front ?? pap, w: lw, col: ink, seed: o.seed ?? 3 });
    else { rect(fx, fy, w, h, o.front ?? pap); X.save(); X.strokeStyle = ink; X.lineWidth = lw; X.strokeRect(fx, fy, w, h); X.restore(); }
    const hy = fy + h * .14, hw = w * .36, ht = Math.max(2.5, h * .045);
    rrect(fx + w / 2 - hw / 2, hy - ht / 2, hw, ht, ht / 2, { fill: o.handle ?? PAL.ink2 });
    return [fx, fy];
  }
  // a dividing drawer front: elongated along `ax` ('c' horizontal / 'r' vertical) with a waist at its centre
  function dividing(x, y, w, h, s, ax, o = {}) {
    const L = ax === 'c' ? w : h, S = ax === 'c' ? h : w, n = 44, pinch = E.in(clamp((s - .35) / .65)), pts = [];
    const map = (a, b) => ax === 'c' ? [x + a, y + b] : [x + b, y + a];
    const g = u => pinch * S * .5 * Math.exp(-(((u - .5) / .085) ** 2));
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push(map(u * L, g(u))); }
    for (let i = n; i >= 0; i--) { const u = i / n; pts.push(map(u * L, S - g(u))); }
    const lw = o.lw ?? clamp(Math.min(w, h * 1.7) / 120, 1.2, 4);
    if (o.hand ?? Math.min(w, h * 1.7) > 170) inkPoly(pts, { fill: PAL.paper, w: lw, seed: o.seed ?? 5 });
    else { fillPoly(pts, PAL.paper); X.save(); X.strokeStyle = PAL.ink; X.lineWidth = lw; poly(pts); X.stroke(); X.restore(); }
    // two daughter handles separating from one
    const d0w = o.w0 ?? (ax === 'c' ? w / (1 + E.io(s)) : w), d0h = o.h0 ?? (ax === 'r' ? h / (1 + E.io(s)) : h);
    const hw = d0w * .36, ht = Math.max(2.5, d0h * .045), sp = E.io(s);
    const hs = ax === 'c' ? [[x + w / 2 - w / 4 * sp, y + d0h * .14], [x + w / 2 + w / 4 * sp, y + d0h * .14]]
                          : [[x + w / 2, y + d0h * .14], [x + w / 2, y + d0h * .14 + (h / 2) * sp]];
    hs.forEach(([hx, hy], i) => rrect(hx - hw / 2, hy - ht / 2, hw, ht, ht / 2, { fill: i === 0 && o.hot ? PAL.orange : PAL.ink2 }));
  }

  // ================================================================ SHOT 1 · FIG.1 drawer mitosis (38.5 – 41.44)
  // 一个抽屉 / 变成两个. Under a microscope's field of view: the drawer flicks open on 抽, soft-closes on 屉, elongates on 变,
  // pinches, and snaps into two on 两; on the bar downbeat (个) both daughters pull out together.
  const S1 = { cx: 1395, cy: 540, w: 400, h: 236, gap: 30, R: 470 };
  function scope(t, lt, o = {}) {
    const { cx, cy, R } = S1;
    X.save(); X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.clip();
    dotGrid(cx - R, cy - R + 8, R * 2, R * 2, 34, 1.5, PAL.ink, .13);
    line(cx - R, cy, cx + R, cy, 1.2, PAL.ink, .16); line(cx, cy - R, cx, cy + R, 1.2, PAL.ink, .16);
    X.restore();
    inkStroke(ellipsePts(cx, cy, R, R, 140), { w: 5.5, taper: [0, 0], wob: .7, seed: 900, press: .12 });
    circle(cx, cy, R + 18, { stroke: PAL.ink, w: 1.6, a: .55 });
    X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 2; X.beginPath();
    const rot = lt * .05;
    for (let i = 0; i < 90; i++) { const a = i / 90 * TAU + rot, l = i % 5 ? 7 : 16; X.moveTo(cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 18)); X.lineTo(cx + Math.cos(a) * (R + 18 + l), cy + Math.sin(a) * (R + 18 + l)); }
    X.stroke(); X.restore();
    // scale bar + magnification (playful microscope metadata)
    const sy = cy + R - 64;
    text(o.stage ?? '', cx, sy, { size: 22, font: MONO, weight: 700, col: PAL.ink, align: 'center', track: 1 });
    text('×400', cx + R * .72 + 40, cy - R * .72 - 14, { size: 24, font: MONO, weight: 800, col: PAL.ink });
  }
  function counter(N, age, y = 900, hl = 0) {
    const nk = E.out5(clamp(age / .18)), s = lerp(1.3, 1, nk);
    htext('N =', LX, y, { size: 30, font: MONO, weight: 700, col: PAL.ink }, hl);
    X.save(); X.translate(LX + 76, y); X.scale(s, s);
    htext(String(N), 0, 0, { size: 118, font: F.anton, col: N >= 64 ? PAL.orange : PAL.ink }, hl);
    X.restore();
    const nw = measure(String(N), 118, F.anton, 400), ex = Math.round(Math.log2(N));
    htext('=', LX + 100 + nw, y, { size: 30, font: MONO, weight: 600, col: PAL.ink2 }, hl);
    if (hl) rect(LX + 124 + nw, y - 40, 44, 52, PAL.paper, hl);
    sup('2', String(ex), LX + 132 + nw, y, { size: 30, col: PAL.ink2, align: 'left' });
    if (hl) rect(LX - 6, y + 34, 188, 22, PAL.paper, hl);
    for (let i = 0; i < 6; i++) rect(LX + i * 30, y + 40, 22, 10, i < ex ? PAL.ink : PAL.paper2);
  }
  function sMitosis(t, lt) {
    paperBG();
    const { cx, cy, w, h, gap } = S1;
    const tOpen = B(57), tShut = B(58), tEl = 39.906, tSnap = 40.588, tPair = B(60);
    const [shx, shy] = t > tSnap && t < tSnap + .25 ? shake(t, 6 * (1 - (t - tSnap) / .25), 3) : [0, 0];
    const st = t < tOpen ? '① 静止期 · CLOSED' : t < tShut ? '② 拉开 · PULL' : t < tEl ? '③ 阻尼回位 · SOFT-CLOSE' : t < tSnap - .16 ? '④ 伸长 · ELONGATION' : t < tSnap ? '⑤ 缢缩 · CLEAVAGE' : '⑥ 分裂完成 · ×2';
    cam(CX - shx, CY - shy, 1 + .025 * E.io(lt / 3));
    scope(t, lt, { stage: st });
    const drift = Math.sin(t * 1.3) * 5, hot = PAL.orange;
    if (t < tEl) {
      const eo = .62 * E.soft((t - tOpen) / .34) * (1 - E.soft((t - (tShut - .3)) / .3));
      drawer(cx - w / 2, cy - h / 2 + drift, w, h, eo, { handle: hot, seed: 11, items: basketItems, lw: 4 });
      if (t > tShut - .02 && t < tShut + .5) marker('嗒', cx + w / 2 + 20, cy - h / 2 - 40 + drift, { size: 72, col: PAL.orange, a: 1 - clamp((t - tShut - .25) / .25), rot: -.1 });
    } else if (t < tSnap) {
      const s = clamp((t - tEl) / (tSnap - tEl)), W2 = w * (1 + E.io(s)), wob = Math.sin((t - tEl) * 40) * 3 * s;
      dividing(cx - W2 / 2, cy - h / 2 + drift + wob, W2, h, s, 'c', { w0: w, hot: true, seed: 12, lw: 4 });
      if (s > .55) { const k = (s - .55) / .45; for (const sy of [-1, 1]) arrow(cx, cy + sy * (h / 2 + 96), cx, cy + sy * (h / 2 + 96 - 48 * k), { w: 3, head: 14, seed: 40 + sy }); }
    } else {
      const age = t - tSnap, g = gap * spring(age, 3.2, .32), pull = .38 * E.soft((t - tPair) / .5);
      const xL = cx - w - g / 2, xR = cx + g / 2;                            // daughters pull apart, mirror-symmetric
      drawer(xR, cy - h / 2 + drift, w, h, pull, { seed: 14, items: basketItems, lw: 4 });
      drawer(xL, cy - h / 2 + drift, w, h, pull, { handle: hot, seed: 13, items: basketItems, lw: 4, dir: -1 });
      if (age < .35) {
        const k = E.out5(age / .35);
        for (let i = 0; i < 10; i++) {
          const a = i / 10 * TAU + .3, r0 = 30 + 150 * k, r1 = r0 + 50 * (1 - k);
          line(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .8, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * .8, 5 * (1 - k) + 1, PAL.ink, 1 - k);
        }
      }
      sticker(cx + w - 10, cy - h / 2 - 70, '×2', { k: clamp(age / .28), size: 44, rot: .06, font: F.anton, weight: 400 });
    }
    camEnd();
    // header + lyric (text left) + the exponential counter that FIG.2 continues
    figTag(LX, 128, 'FIG. 1', '抽屉的有丝分裂 · DRAWER MITOSIS', clamp((lt + .3) / .5));
    lyHero(12, t, { x: LX, y: 500, size: 128, lead: 1.24, align: 'left', hi: '两', exit: 'fade', hold: .5, fade: .12 });
    counter(t < tSnap ? 1 : 2, t - tSnap);
  }
  // plates standing in the comb + a bowl, seen over the rim (clipped to the basket interior)
  function basketItems(fx, fy, x, y, w, h) {
    X.save(); poly([[fx, fy], [x, y], [x + w, y], [fx + w, fy]]); X.clip();
    X.strokeStyle = PAL.ink; X.lineWidth = Math.max(1.2, w / 170); X.fillStyle = PAL.paper;
    for (let i = 4; i >= 0; i--) {
      const q = .12 + i * .17, px = lerp(fx, x, q) + w * .3, py = lerp(fy, y, q) + h * .2, r = w * .15;
      X.beginPath(); X.arc(px, py, r, Math.PI, TAU); X.closePath(); X.fill(); X.stroke();
    }
    const bx = lerp(fx, x, .45) + w * .74, by = lerp(fy, y, .45) + h * .06;
    X.beginPath(); X.ellipse(bx, by, w * .12, h * .1, 0, Math.PI, TAU); X.closePath(); X.fill(); X.stroke();
    X.restore();
  }

  // ================================================================ SHOT 2 · FIG.2 the exponential wall (41.44 – 44.849)
  // 两个变成 / 整面墙的拉篮. Every drawer divides at once, faster each time (2→4→8→16→32→64); then on 拉 the whole wall
  // pulls out in a soft-close wave that spreads from the original (orange-handled) drawer.
  const GEN = [[B(61), 'r'], [B(61.75), 'c'], [B(62.25), 'r'], [B(62.75), 'c'], [B(63), 'r']];
  function tileState(t) {
    let cols = 2, rows = 1, div = null, last = null;
    for (let i = 0; i < GEN.length; i++) {
      const [tg, ax] = GEN[i], dEl = i ? Math.min(.24, (tg - GEN[i - 1][0]) * .7) : .3;
      if (t >= tg) { if (ax === 'c') cols *= 2; else rows *= 2; last = { tg, ax }; }
      else { if (t > tg - dEl) div = { ax, s: (t - (tg - dEl)) / dEl }; break; }
    }
    return { cols, rows, div, last };
  }
  function sTiling(t, lt) {
    paperBG();
    gridPaper({ gap: 48, a: .05 });
    const { w, h, gap } = S1, st = tileState(t), tWall = B(63), tWave = B(64);
    // camera: the wall grows beside the text; on 墙 it slides under the text and fills the whole frame
    const take = E.soft((t - tWall - .04) / .55);
    const Zg = Math.exp(lerp(0, Math.log(.53), E.io(seg(t, 41.5, 43.1)))), Zf = W / (8 * w + 7 * gap) * (1 + .025 * clamp(t - 43.6));
    const Z = lerp(Zg, Zf, take);
    const ax0 = lerp(S1.cx - w - gap / 2, -4, take), ay0 = lerp(lerp(S1.cy - h / 2, 70, E.io(seg(t, 41.6, 43.1))), (H - (8 * h + 7 * gap) * Zf) / 2, take);
    const age = st.last ? t - st.last.tg : 9, sp = age < 1 ? spring(age, 4.2, .34) : 1;
    const gx = st.last && st.last.ax === 'c' ? gap * sp : gap, gy = st.last && st.last.ax === 'r' ? gap * sp : gap;
    let cw = w, ch = h;
    if (st.div) { if (st.div.ax === 'c') cw = w * (1 + E.io(st.div.s)); else ch = h * (1 + E.io(st.div.s)); }
    const px = (cw + gx) * Z, py = (ch + gy) * Z, sw = cw * Z, sh = ch * Z, drift = Math.sin(t * 1.1) * 3;
    const c1 = Math.min(st.cols - 1, Math.floor((W + 40 - ax0) / px)), r1 = Math.min(st.rows - 1, Math.floor((H + 40 - ay0) / py));
    for (let r = r1; r >= 0; r--) for (let c = c1; c >= 0; c--) {
      const x = ax0 + c * px, y = ay0 + r * py + drift, hot = c === 0 && r === 0, sd = 20 + r * 16 + c;
      if (st.div) { dividing(x, y, sw, sh, st.div.s, st.div.ax, { w0: w * Z, h0: h * Z, hot, seed: sd }); continue; }
      // the wave: out on 拉 (spreading from the original drawer), about half soft-close again on 篮
      const d = c + r, tp = tWave + d * .04;
      let e = .7 * E.soft((t - tp) / .5);
      if ((c + r) % 2) e *= 1 - E.soft((t - (B(65) + d * .025)) / .42);      // checkerboard soft-closes on 篮
      drawer(x, y, sw, sh, e, { handle: hot ? PAL.orange : PAL.ink2, seed: sd, hand: sw > 150 });
    }
    // left panel: calm paper beside the growing wall; it pulls away to the left on 墙
    const pr = 900 * (1 - take);
    if (pr > 1) { rect(0, 0, pr, H, PAL.paper); line(pr, 0, pr, H, 2, PAL.ink, .9); }
    // once the wall is behind the text, every text element gets a paper halo
    const halo = take > .02, hl = clamp(take * 3);
    figTag(LX, 128, 'FIG. 2', '指数级铺满 · EXPONENTIAL TILING', clamp((lt + .1) / .4), { halo: hl });
    const lo = { x: LX, y: 500, size: 124, lead: 1.24, align: 'left', hi: '拉篮', exit: 'fade', hold: .2, fade: .15 };
    if (halo) { X.save(); X.globalAlpha *= clamp(take * 3); lyHero(13, t, { ...lo, stroke: PAL.paper, sw: 26, hi: '' }); X.restore(); }
    lyHero(13, t, lo);
    counter(st.cols * st.rows, age, 900, hl);
  }

  // ================================================================ SHOT 3 · FIG.3 KITCHEN SCALING LAW (44.849 – 48.599)
  // 收纳效率 / 指数一样往上涨. A deadpan benchmark figure: the y-axis title is the first half of the lyric; the second half rides
  // the curve itself, each character appearing as the orange frontier reaches it. Product types are the data points.
  const PL = { x0: 840, x1: 1780, yB: 905, yT: 205 }, CA = 4.2;
  const cvX = u => PL.x0 + 20 + u * (PL.x1 - PL.x0 - 40);
  const cvY = u => PL.yB - 78 - (Math.exp(CA * u) - 1) / (Math.exp(CA) - 1) * (PL.yB - 78 - PL.yT - 36);
  const ARC = (() => {            // arc-length table of the curve, u ∈ [0, 1.14]
    const a = [{ u: 0, s: 0, x: cvX(0), y: cvY(0) }];
    for (let i = 1; i <= 460; i++) { const u = i / 400, x = cvX(u), y = cvY(u), p = a[i - 1]; a.push({ u, x, y, s: p.s + Math.hypot(x - p.x, y - p.y) }); }
    return a;
  })();
  const arcU = u => ARC[clamp(Math.round(u * 400), 0, ARC.length - 1)].s;
  function arcAt(s) {             // point + unit normal (pointing to the inside of the bend: up-left) at arc length s
    let i = 1; while (i < ARC.length - 1 && ARC[i].s < s) i++;
    const a = ARC[i - 1], b = ARC[i], k = clamp((s - a.s) / ((b.s - a.s) || 1)), dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), nx: dy / d, ny: -dx / d, u: lerp(a.u, b.u, k) };
  }
  // characters of row 2, placed along the inside of the curve, spaced evenly in screen space (walk back from near u = .97)
  const CSZ = 82, CSP = CSZ * 1.14, COFF = CSZ * .98;
  const CPOS = (() => {
    const out = []; let s = arcU(.975);
    const off = s => { const p = arcAt(s); return [p.x + p.nx * COFF, p.y + p.ny * COFF, s]; };
    out.unshift(off(s));
    while (out.length < 7) { let s2 = s; const [px, py] = out[0]; while (s2 > 0) { s2 -= 2; const q = off(s2); if (Math.hypot(q[0] - px, q[1] - py) >= CSP) break; } s = s2; out.unshift(off(s)); }
    return out;
  })();
  const PTS = [[.24, '碗碟拉篮'], [.5, '调味拉篮'], [.7, '转角拉篮'], [.84, '高柜拉篮'], [.96, '升降拉篮']];
  function curveS(t) {            // drawn arc length over time, locked to the lyric onsets of row 2
    const L = LY[14], on = L.t.slice(4), keys = [[45.0, 0], [on[0] - .02, CPOS[0][2] - 10]];
    on.forEach((ti, j) => keys.push([ti + .06, CPOS[j][2] + 6]));
    keys.push([48.3, arcU(1)], [48.62, arcU(1.14)]);
    for (let i = 0; i < keys.length - 1; i++) { const [a, va] = keys[i], [b, vb] = keys[i + 1]; if (t < b) return t < a ? va : lerp(va, vb, (i === keys.length - 2 ? E.in : E.out)((t - a) / (b - a))); }
    return keys[keys.length - 1][1];
  }
  function sScaling(t, lt) {
    paperBG();
    const z = 1 + .035 * E.io(lt / 3.8);
    cam(CX + 40 * E.io(lt / 3.8), CY - 10 * E.io(lt / 3.8), z);
    // --- left column: title block
    const tk = i => E.out5(clamp((lt - i * .07) / .22));
    figTag(LX, 128, 'FIG. 3', '预印本 · PREPRINT', clamp((lt + .1) / .4), { len: 60 });
    ['KITCHEN', 'SCALING', 'LAW'].forEach((wd, i) => {
      const k = tk(i); if (k <= 0) return;
      X.save(); X.beginPath(); X.rect(LX - 10, 196 + i * 150, 700, 152); X.clip();
      text(wd, LX, 336 + i * 150 + (1 - k) * 150, { size: 168, font: F.anton, col: i === 2 ? PAL.orange : PAL.ink, track: 1 });
      X.restore();
    });
    const ck = clamp((lt - .35) / .3);
    line(LX, 690, LX + 560 * E.out(ck), 690, 3, PAL.ink);
    text('Storage efficiency scales exponentially', LX, 740, { size: 32, font: F.serifI, col: PAL.ink, a: ck });
    text('with the number of baskets pulled.', LX, 778, { size: 32, font: F.serifI, col: PAL.ink, a: ck });
    text('LAN · PONY · BUNS · LONG · KIT', LX, 840, { size: 19, font: MONO, weight: 600, col: PAL.ink2, track: 1, a: ck });
    text('悍高厨房研究所  ·  HIGOLD KITCHEN LAB', LX, 870, { size: 19, font: MONO, weight: 500, col: PAL.grey, a: ck });
    // --- the plot
    const { x0, x1, yB, yT } = PL, ak = E.out(clamp(lt / .35));
    X.save(); X.strokeStyle = rgba(PAL.ink, .09); X.lineWidth = 1.4; X.beginPath();
    for (let i = 1; i <= 7; i++) { const yy = yB - (yB - yT) * i / 7; X.moveTo(x0, yy); X.lineTo(lerp(x0, x1, ak), yy); }
    for (let i = 1; i <= 6; i++) { const xx = x0 + (x1 - x0) * i / 6; X.moveTo(xx, yB); X.lineTo(xx, lerp(yB, yT, ak)); }
    X.stroke(); X.restore();
    handLine(x0, yB, lerp(x0, x1 + 24, ak), yB, { w: 3.2, seed: 301 });
    handLine(x0, yB, x0, lerp(yB, yT - 30, ak), { w: 3.2, seed: 302 });
    inkStroke([[x0 - 10, yT - 12], [x0, yT - 32], [x0 + 10, yT - 12]], { w: 3, taper: [.1, .1], seed: 303, a: ak });
    inkStroke([[x1 + 12, yB - 10], [x1 + 32, yB], [x1 + 12, yB + 10]], { w: 3, taper: [.1, .1], seed: 304, a: ak });
    // ticks: x doubles (1 … 64 baskets, echoing FIG.2), y in silly powers of ten
    for (let i = 0; i <= 6; i++) { const xx = x0 + (x1 - x0) * i / 6; line(xx, yB, xx, yB + 10, 2, PAL.ink, ak); text(String(2 ** i), xx, yB + 40, { size: 20, font: MONO, weight: 600, col: PAL.ink2, align: 'center', a: ak }); }
    for (let i = 0; i <= 7; i++) { const yy = yB - (yB - yT) * i / 7; line(x0 - 10, yy, x0, yy, 2, PAL.ink, ak); sup('10', String(i * 3), x0 - 16, yy + 8, { size: 20, col: PAL.ink2, a: ak }); }
    text('拉篮数量  (log₂) →', x1 + 30, yB + 78, { size: 20, font: MONO, weight: 600, col: PAL.ink, align: 'right', a: ak });
    // baseline: flat, grey, dashed, forever
    X.save(); X.setLineDash([12, 10]); X.lineDashOffset = -lt * 30; X.strokeStyle = PAL.grey; X.lineWidth = 3; X.globalAlpha *= ak;
    X.beginPath(); X.moveTo(x0 + 8, yB - 34); X.lineTo(lerp(x0, x1, ak), yB - 36); X.stroke(); X.restore();
    text('蹲下翻找 (baseline)', x1 - 4, yB - 50, { size: 20, font: MONO, weight: 600, col: PAL.grey, align: 'right', a: ak });
    // legend (top-left inside the plot, under the y-title)
    const lk = clamp((lt - .5) / .3);
    line(x0 + 34, 352, x0 + 84, 352, 6, PAL.orange, lk); text('悍高拉篮 (ours)', x0 + 98, 360, { size: 22, font: MONO, weight: 800, col: PAL.ink, a: lk });
    X.save(); X.setLineDash([8, 6]); line(x0 + 34, 390, x0 + 84, 390, 3, PAL.grey, lk); X.restore();
    text('蹲下翻找 (baseline)', x0 + 98, 398, { size: 22, font: MONO, weight: 500, col: PAL.grey, a: lk });
    // the frontier: confidence band + curve up to s
    const s = curveS(t), tip = arcAt(s);
    const pts = []; for (const a of ARC) { if (a.s > s) break; pts.push([a.x, a.y]); } pts.push([tip.x, tip.y]);
    if (pts.length > 2) {
      const band = [], wv = u => 6 + 26 * u * u;
      for (const [xx, yy] of pts) { const u = (xx - PL.x0 - 20) / (PL.x1 - PL.x0 - 40); band.push([xx - wv(u) * .4, yy - wv(u)]); }
      for (let i = pts.length - 1; i >= 0; i--) { const [xx, yy] = pts[i], u = (xx - PL.x0 - 20) / (PL.x1 - PL.x0 - 40); band.push([xx + wv(u) * .4, yy + wv(u)]); }
      fillPoly(band, PAL.orange, .13);
      X.save(); X.strokeStyle = PAL.orange; X.lineWidth = 7; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath();
      pts.forEach((q, i) => i ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1])); X.stroke(); X.restore();
      circle(tip.x, tip.y, 9 + 4 * pulse(t, 5), { fill: PAL.orange });
    }
    // data points with error bars, labelled outside the bend
    PTS.forEach(([u, lab], i) => {
      if (s < arcU(u)) return; const k = E.back(clamp((s - arcU(u)) / 60)), qx = cvX(u), qy = cvY(u), eb = (10 + 34 * u) * k;
      line(qx, qy - eb, qx, qy + eb, 2.2, PAL.ink); line(qx - 8, qy - eb, qx + 8, qy - eb, 2.2, PAL.ink); line(qx - 8, qy + eb, qx + 8, qy + eb, 2.2, PAL.ink);
      circle(qx, qy, 11 * k, { fill: PAL.paper, stroke: PAL.ink, w: 3.2 });
      const lx = qx + 26, ly = u < .6 ? qy + 44 : qy + 10;
      text(lab, lx, ly, { size: 24, font: F.sans, weight: 700, col: PAL.ink, a: clamp(k) });
    });
    // lyric row 1 = the y-axis title
    const L = LY[14], env = lyEnv(14, t, .2, .2);
    if (env > 0) {
      LYRIC_DRAWN.add(14);
      const r1 = lyRows(14)[0]; let xx = x0 + 34;
      X.save(); X.globalAlpha *= env;
      r1.forEach(c => { const k = chK(c.ti, t, .18), cw = measure(c.ch, 84, F.heavy, 900) - 2;
        if (k > 0) text(c.ch, xx, yT + 88 - (1 - E.out5(k)) * 26, { size: 84, font: F.heavy, weight: 900, col: PAL.ink, a: clamp(k * 3) });
        xx += cw; });
      if (chK(r1[0].ti, t) > 0) inkStroke([[xx + 22, yT + 80], [xx + 22, yT + 10]], { w: 4, taper: [.05, .05], seed: 310 }), inkStroke([[xx + 10, yT + 24], [xx + 22, yT + 6], [xx + 34, yT + 24]], { w: 4, taper: [.1, .1], seed: 311 });
      // row 2 rides the curve
      lyRows(14)[1].forEach((c, j) => {
        const k = chK(c.ti, t, .2); if (k <= 0) return; const [cx2, cy2] = CPOS[j];
        const sc = lerp(1.5, 1, E.out5(k));
        X.save(); X.translate(cx2, cy2); X.scale(sc, sc);
        text(c.ch, 0, CSZ * .36, { size: CSZ, font: F.heavy, weight: 900, col: c.ch === '涨' ? PAL.orange : PAL.ink, align: 'center', a: clamp(k * 3) });
        X.restore();
      });
      X.restore();
    }
    // SOTA sticker on the last point
    const sk = clamp((t - LY[14].t[10] - .05) / .3);
    if (sk > 0) sticker(cvX(.96) + 88, cvY(.96) + 84, 'SOTA', { k: sk, size: 34, font: F.anton, weight: 400, rot: -.08 });
    camEnd();
  }

  // ================================================================ SHOT 4 · axis overflow (48.599 – 49.281, one beat)
  // The curve leaves the chart: the camera races up beside it, the y-axis labels blur past, LAN hangs on to the tip.
  function sOverflow(t, lt) {
    paperBG();
    const k = clamp(lt / .68), vy = 2600 * E.in(k) + lt * 1900;             // camera climb (px)
    const gp = 170;
    X.save(); X.strokeStyle = rgba(PAL.ink, .10); X.lineWidth = 1.5; X.beginPath();
    for (let y = (vy % gp) - gp; y < H + gp; y += gp) { X.moveTo(250, y); X.lineTo(W, y); } X.stroke(); X.restore();
    handLine(236, -20, 236, H + 20, { w: 3.5, seed: 320 });
    const i0 = Math.floor(vy / gp);
    for (let i = i0 - 1; i < i0 + 9; i++) {
      const y = (vy % gp) + (i0 - i) * gp + H * .62; if (y < -60 || y > H + 60) continue;
      const ex = 24 * 2 ** clamp(i, 0, 14);
      line(222, y, 236, y, 2.5, PAL.ink);
      sup('10', ex > 1e5 ? '∞' : String(Math.round(ex)), 206, y + 14, { size: 38, col: PAL.ink2 });
    }
    // vertical speed streaks
    for (let i = 0; i < 30; i++) {
      const x = 280 + hash(i * 3.1) * 1600, l = 90 + hash(i * 7.7) * 260 * (1 + k * 2), y = ((hash(i * 1.9) * H + vy * (1.2 + hash(i) * .8)) % (H + l)) - l;
      line(x, y, x, y + l, 1.5 + hash(i * 5) * 2.5, PAL.ink, .10 + .14 * k);
    }
    // the orange frontier, nearly vertical; the camera keeps up for half a beat, then the line outruns it
    const tipY = lerp(430, -420, E.in(clamp((lt - .12) / .5))), tipX = 1250;
    const pts = []; for (let i = 0; i <= 24; i++) { const q = i / 24, y = lerp(H + 60, tipY, q); pts.push([tipX - 260 * (1 - q) ** 3, y]); }
    X.save(); X.strokeStyle = PAL.orange; X.lineWidth = 20; X.lineCap = 'round'; X.beginPath(); pts.forEach((q, i) => i ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1])); X.stroke(); X.restore();
    // LAN hangs on to the tip, legs flying
    const sw = Math.sin(t * 14) * .25;
    const P = pose({ sL: 2.95, eL: .05, sR: 2.95, eR: .05, hL: .35 + sw, kL: .6, hR: .15 - sw, kR: 1.0, head: .12, lean: .06 });
    figure(tipX - 4, tipY + 360, 34, P, { who: 'lan', face: 'wow', blush: 1, shadow: false, seed: 77 });
    // the dialog
    const dk = clamp((lt - .05) / .2);
    win(420, 150, 640, 270, 'chart.exe', { k: dk, body: (x, y, ww, hh) => {
      rect(x + 34, y + 34, 64, 64, PAL.orange); text('!', x + 66, y + 88, { size: 56, font: F.heavy, weight: 900, col: PAL.paper, align: 'center' });
      text('Y 轴溢出', x + 124, y + 80, { size: 50, font: F.heavy, weight: 900, col: PAL.ink });
      text('收纳效率已超出图表上限', x + 126, y + 124, { size: 24, font: F.sans, weight: 500, col: PAL.ink2 });
      rect(x + ww - 330, y + hh - 70, 140, 48, PAL.paper2); X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 2.5; X.strokeRect(x + ww - 330, y + hh - 70, 140, 48); X.restore();
      text('忽略', x + ww - 260, y + hh - 37, { size: 22, font: F.sans, weight: 700, col: PAL.ink, align: 'center' });
      rect(x + ww - 176, y + hh - 70, 146, 48, PAL.ink);
      text('继续拉 →', x + ww - 103, y + hh - 37, { size: 22, font: F.sans, weight: 800, col: PAL.paper, align: 'center' });
    } });
    cursor(420 + 640 - 52 + 40 * (1 - E.out(clamp(lt / .4))), 150 + 270 - 50 + 50 * (1 - E.out(clamp(lt / .4))), { click: clamp((lt - .45) / .2) });
    text('FIG. 3 (cont.)', 280, H - 60, { size: 20, font: MONO, weight: 600, col: PAL.grey, track: 2 });
  }

  // ================================================================ SHOT 5 · speedrun (49.281 – 52.008)
  // 做一顿饭 / 像在速通. Stream layout: the kitchen "game view" on paper, a dark splits column on the right. The camera
  // punches in on 饭 (a hard cut on the beat) while the lyric stays put.
  const RUN0 = B(72), FF = 7.5;                                // run start + fast-forward factor for the timer
  const runClock = t => (t - RUN0) * FF + Math.max(0, t - 51.6) ** 2 * 30;
  const SPL = [['找锅', B(72.5)], ['找碗', B(73)], ['找盐', B(73.5)], ['开火', B(74)], ['出锅', B(75)]];
  const fmt = s => { s = Math.max(0, s); const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(2); };
  function splitsPanel(t, x, y, w, hgt) {
    rect(x, y, w, hgt, PAL.night);
    text('KITCHEN%  ·  ANY%', x + 44, y + 92, { size: 26, font: MONO, weight: 800, col: PAL.paper, track: 2 });
    text('厨房速通 · 禁止翻找', x + 44, y + 130, { size: 22, font: MONO, weight: 500, col: PAL.steel1 });
    text('#0064', x + w - 44, y + 92, { size: 22, font: MONO, weight: 600, col: PAL.steel1, align: 'right' });
    const rh = 78, r0 = y + 180;
    line(x + 44, r0 - 10, x + w - 44, r0 - 10, 1.5, PAL.steel0);
    SPL.forEach(([name, at], i) => {
      const yy = r0 + i * rh, done = t >= at, cur = !done && (i === 0 || t >= SPL[i - 1][1]);
      if (cur) rect(x + 24, yy, w - 48, rh - 8, PAL.night2);
      const fk = done ? Math.exp(-(t - at) * 8) : 0;
      if (fk > .02) rect(x + 24, yy, w - 48, rh - 8, GREEN, .35 * fk);
      text(name, x + 44, yy + 50, { size: 32, font: F.sans, weight: 700, col: done || cur ? PAL.paper : PAL.steel1 });
      if (done) {
        text('−' + (1.2 + hash(i * 3 + 1) * 3).toFixed(1), x + w - 190, yy + 50, { size: 26, font: MONO, weight: 700, col: GREEN, align: 'right' });
        text(fmt(runClock(at)), x + w - 44, yy + 50, { size: 26, font: MONO, weight: 700, col: PAL.paper, align: 'right' });
      } else text('—', x + w - 44, yy + 50, { size: 26, font: MONO, weight: 600, col: PAL.steel0, align: 'right' });
    });
    const ty = r0 + SPL.length * rh + 150;
    line(x + 44, ty - 118, x + w - 44, ty - 118, 1.5, PAL.steel0);
    text(fmt(runClock(t)), x + w - 44, ty, { size: 104, font: MONO, weight: 800, col: GREEN, align: 'right' });
    text('▶▶ ×' + (t < B(74) ? '8' : '16'), x + 44, ty + 70, { size: 26, font: MONO, weight: 700, col: PAL.paper });
    if (t >= SPL[4][1]) sticker(x + w - 120, ty + 64, 'PB!', { k: clamp((t - SPL[4][1]) / .25), size: 30, font: F.anton, weight: 400, rot: -.06 });
  }
  // flying kitchenware icons
  function icon(kind, x, y, s, rot) {
    X.save(); X.translate(x, y); X.rotate(rot); X.strokeStyle = PAL.ink; X.fillStyle = PAL.paper; X.lineWidth = 3.2; X.lineJoin = 'round';
    X.beginPath();
    if (kind === 0) { X.ellipse(0, 0, s, s * .32, 0, 0, TAU); X.fill(); X.stroke(); X.beginPath(); X.ellipse(0, 0, s * .6, s * .18, 0, 0, TAU); X.stroke(); }
    else if (kind === 1) { X.moveTo(-s, -s * .2); X.quadraticCurveTo(-s * .9, s * .8, 0, s * .8); X.quadraticCurveTo(s * .9, s * .8, s, -s * .2); X.closePath(); X.fill(); X.stroke(); }
    else { X.roundRect(-s * .45, -s * .7, s * .9, s * 1.4, s * .15); X.fill(); X.stroke(); X.beginPath(); X.rect(-s * .5, -s * .95, s, s * .28); X.fillStyle = PAL.ink; X.fill(); }
    X.restore();
  }
  function sSpeedrun(t, lt) {
    paperBG();
    const PX = 1296;
    // --- game view (clipped), with a punch-in on 饭
    X.save(); X.beginPath(); X.rect(0, 0, PX, H); X.clip();
    const punch = t >= B(74), z = punch ? 1.24 + .05 * (t - B(74)) : 1 + .025 * lt;
    X.translate(PX / 2 - CX, 0);
    cam(punch ? 572 : 648, punch ? 640 : 560, z, punch ? -.055 : 0);
    for (let i = 0; i < 18; i++) {                        // horizontal speed streaks
      const y = 140 + hash(i * 2.3) * 860, l = 120 + hash(i * 5.1) * 360, x = PX + 400 - ((t * (1800 + hash(i) * 1400) + hash(i * 9) * 3000) % (PX + 900));
      line(x, y, x + l, y, 2 + hash(i * 4) * 2, PAL.ink, .12);
    }
    const fy = 960;
    handLine(-300, fy, PX + 300, fy, { w: 3, seed: 330 });
    // base cabinet with a pulled basket (left) — it re-pulls on every beat
    handRect(130, 770, 350, 190, { w: 3, seed: 331, over: 3 }); rect(116, 752, 378, 18, PAL.ink);
    const pe = .5 + .3 * E.soft(sinceBeat(t) / .3) * (1 - E.io(clamp((sinceBeat(t) - .36) / .3)));
    drawer(154, 800, 302, 132, pe, { dir: -1, seed: 332, hand: true, lw: 2.8, items: basketItems });
    // stove counter + pot (middle)
    handRect(560, 800, 340, 160, { w: 3, seed: 333, over: 3 }); rect(546, 782, 368, 18, PAL.ink);
    const px0 = 730, py0 = 782, lid = Math.abs(Math.sin(t * 22)) * 26;
    for (let i = 0; i < 3; i++) { const fx = px0 - 44 + i * 44, fh = 16 + 8 * Math.sin(t * 30 + i * 2); fillPoly([[fx - 11, py0], [fx, py0 - fh], [fx + 11, py0]], PAL.orange); }
    inkPoly([[px0 - 100, py0 - 128], [px0 + 100, py0 - 128], [px0 + 94, py0 - 22], [px0 + 70, py0 - 4], [px0 - 70, py0 - 4], [px0 - 94, py0 - 22]], { fill: PAL.paper, w: 3.5, seed: 334 });
    line(px0 - 130, py0 - 104, px0 - 100, py0 - 104, 6); line(px0 + 100, py0 - 104, px0 + 130, py0 - 104, 6);
    X.save(); X.translate(px0, py0 - 132 - lid); X.rotate(Math.sin(t * 17) * .12);
    inkPoly([[-108, 0], [108, 0], [80, -26], [-80, -26]], { fill: PAL.paper, w: 3.2, seed: 336 }); rect(-14, -40, 28, 14, PAL.ink); X.restore();
    for (let i = 0; i < 3; i++) { const sx = px0 - 50 + i * 50, ph = t * 9 + i; inkStroke([[sx, py0 - 170 - lid], [sx + 10 * Math.sin(ph), py0 - 205], [sx - 10 * Math.sin(ph + 1), py0 - 240], [sx + 6 * Math.sin(ph + 2), py0 - 272]], { w: 3, seed: 335 + i, taper: [.2, .6], a: .6 }); }
    // LAN at the stove in fast-forward: rapid reach/yank toward the pot, with two ghost exposures
    const lp = tt => { const q = .5 + .5 * Math.sin(tt * 26); return lerpPose(mirrorPose(KP.reach), KP.yank, q); };
    const lx = 990;
    for (const [dt, a] of [[.05, .15], [.025, .3]]) figure(lx, fy, 38, lp(t - dt), { who: 'lan', a, shadow: false, seed: 50 });
    figure(lx, fy, 38, lp(t), { who: 'lan', face: 'wow', blush: 1, seed: 50 });
    // kitchenware flying basket → pot on an 8th-note conveyor
    for (let j = 0; j < 6; j++) {
      const per = BEAT / 2, ph = (t - RUN0) / per - j / 3; if (ph < 0) continue;
      const q = frac(ph), id = Math.floor(ph);
      const x = lerp(300, px0, q), y = lerp(770, py0 - 150, q) - Math.sin(q * Math.PI) * 120;
      icon((id + j) % 3, x, y, 32, q * 7 + j);
      line(x - 70, y + 20 * Math.cos(q * Math.PI), x - 28, y + 6 * Math.cos(q * Math.PI), 3, PAL.ink, .3);
    }
    camEnd();
    // HUD corner in the game view
    X.restore();
    rect(PX - 250, 70, 200, 52, PAL.ink); text('▶▶ FAST-FWD', PX - 150, 105, { size: 22, font: MONO, weight: 800, col: PAL.paper, align: 'center' });
    // --- splits column
    splitsPanel(t, PX, 0, W - PX, H);
    // --- lyric (screen-fixed across the punch-in)
    lyHero(15, t, { x: LX, y: 270, size: 140, lead: 1.1, align: 'left', font: F.smiley, weight: 400, hi: '速通', exit: 'fade', hold: .15, fade: .12, pop: 1.5 });
  }

  // ================================================================ SHOT 6a · WR pace, the timer blurs (52.008 – 52.690)
  function sTimer(t, lt) {
    DARK = true; paperBG(PAL.night);
    const z = 1 + .5 * E.in(clamp(lt / .75));
    cam(CX, CY, z);
    const v = runClock(t), str = fmt(v), sz = 280;
    const tw = measure(str, sz, F.mono, 800), x0 = CX - tw / 2, cwid = tw / str.length;
    [...str].forEach((ch, i) => {
      const x = x0 + i * cwid, n = str.length, fast = i >= n - 2 ? 1 : i === n - 4 ? clamp((lt - .15) / .4) : i === n - 5 ? clamp((lt - .45) / .3) : 0;
      const col = i < 2 ? PAL.paper : GREEN;
      if (fast > .01) {                      // vertical motion blur: stacked exposures of the rolling digit
        for (let k = 0; k < 9; k++) { const dy = (k / 8 - .5) * sz * .34 * fast; text(ch, x, CY + sz * .36 + dy, { size: sz, font: F.mono, weight: 800, col, a: .12 * fast }); }
        text(ch, x, CY + sz * .36, { size: sz, font: F.mono, weight: 800, col, a: 1 - .8 * fast });
      } else text(ch, x, CY + sz * .36, { size: sz, font: F.mono, weight: 800, col });
    });
    text('WR PACE  ▲', CX - tw / 2, CY - sz * .75, { size: 34, font: MONO, weight: 800, col: GREEN, track: 3 });
    text('−' + (3.2 + lt * 9).toFixed(2) + ' vs PB', CX + tw / 2, CY - sz * .75, { size: 34, font: MONO, weight: 700, col: PAL.paper, align: 'right' });
    rect(CX - tw / 2, CY + sz * .6, tw * clamp(lt / .6), 10, PAL.orange);
    text('厨房速通 · 世界纪录节奏', CX - tw / 2, CY + sz * .6 + 60, { size: 30, font: MONO, weight: 600, col: PAL.steel2 });
    camEnd();
    speedLines(CX, CY, 520, 1300, 40, { col: PAL.paper, a: .10 + .2 * clamp(lt / .6), w: 5, seed: Math.floor(t * 24) });
  }

  // ================================================================ SHOT 6b · push into the basket (52.690 – 53.372)
  const PUSH_B = basketModel({ w: 560, d: 440, h: 170, type: 'dish' });
  const PUSH_ITEMS = [...Array(6)].map((_, i) => lathe([-280 + 40 + 560 * .24, 136, 70 + i * 34], PROF.plate, { axis: 'z' }))
    .concat([lathe([-280 + 560 * .78, 6, 130], PROF.bowl, { open: true }), lathe([-280 + 560 * .78, 26, 130], PROF.bowl, { open: true })]);
  function sPush(t, lt) {
    DARK = true; paperBG(PAL.night);
    const k = clamp(lt / .7), d = 1750 * Math.exp(-.55 * E.io(k) - .5 * E.in(k));
    const C = orbit([0, 30, 220], -.6 * (1 - E.io(k)), lerp(.7, 1.5, E.io(k)), d, { fov: 34, roll: .3 * E.in(k) });
    render3([...PUSH_B, ...PUSH_ITEMS], C, { style: 'glow', dark: true });
    speedLines(CX, CY, 380 - 200 * k, 1400, 60, { col: PAL.paper, a: .08 + .25 * k, w: 4, seed: Math.floor(t * 24) });
    vignette(.55 + .35 * k);
    text('KITCHEN% — ENTERING ×64', 64, H - 64, { size: 20, font: MONO, weight: 700, col: PAL.steel2, track: 2 });
  }

  // ================================================================ SHOT 7 · the acceleration tunnel (53.372 – 59.0)
  // 厨房， / 开始加速. An endless corridor walled with drawers; each one soft-closes... outward, as the camera passes. The
  // camera's speed grows exponentially with a lurch on every sung character, roll whips harder each beat, and the corridor
  // ends in a bright slot that swallows the frame just as the next chapter pulls in.
  const T0 = B(78), RX = 1.78, RY = 1, FOC = 820, KICKS = [...LY[16].t, B(83), B(84), B(85)];
  const zBase = tt => { const a = Math.max(0, tt - T0); return 2.1 / .6 * (Math.exp(.6 * a) - 1); };
  function zCam(tt) { let z = zBase(tt); KICKS.forEach((tk, i) => { z += (.9 + i * .35) * E.out5(clamp((tt - tk) / .4)); }); return z; }
  const Z_END = zCam(58.83) + 1.45;
  const ROLLS = [[B(82), .22], [B(83), -.34], [B(84), .46], [B(85), -.3], [B(85.5), .5]];
  function sTunnel(t, lt) {
    const zc = zCam(t), v = (zCam(t + .02) - zc) / .02, dEnd = Z_END - zc;
    let roll = .03 * Math.sin(lt * .8) + .012 * lt * lt; ROLLS.forEach(([tr, a]) => { if (t >= tr) roll += a; });
    const cr = Math.cos(roll), sr = Math.sin(roll);
    const P = (x, y, z) => { const d = Math.max(.05, z - zc), sx = FOC * x / d, sy = FOC * y / d; return [CX + sx * cr - sy * sr, CY + sx * sr + sy * cr, d]; };
    // coverage of the bright end slot (fraction of frame height)
    const slotH = dEnd > .05 ? FOC * RY / dEnd / (H / 2) : 99;
    DARK = slotH < 1.05;
    paperBG(PAL.night);
    // --- the bright slot at the end of the corridor
    const slotA = dEnd < 60 ? clamp((60 - dEnd) / 20) : 0;
    if (slotA > 0) {
      const a = slotA, q = [P(-RX, -RY, Z_END), P(RX, -RY, Z_END), P(RX, RY, Z_END), P(-RX, RY, Z_END)];
      X.save(); X.globalAlpha = a; X.shadowColor = rgba(PAL.paper, .9); X.shadowBlur = 40; poly(q); X.fillStyle = PAL.paper; X.fill(); X.restore();
      const hy = P(0, -RY * .7, Z_END), hx0 = P(-RX * .3, -RY * .7, Z_END), hx1 = P(RX * .3, -RY * .7, Z_END);
      line(hx0[0], hx0[1], hx1[0], hx1[1], Math.max(1.5, 18 / Math.max(1, dEnd)), PAL.orange, a);
    }
    // --- drawer walls: slices far → near
    const D = 1, gz = .06, fog = 13, near = .35;
    const iMin = Math.floor(zc + near), iMax = Math.min(Math.floor(zc + 34), Math.floor(Z_END - .01));
    const blur = clamp((v - 8) / 40);                                     // cross-lines fade at high speed (motion blur)
    X.save(); X.lineJoin = 'round';
    for (let i = iMax; i >= iMin; i--) {
      const z0 = Math.max(i * D + gz, zc + near), z1 = (i + 1) * D - gz; if (z1 <= z0) continue;
      const dm = (z0 + z1) / 2 - zc, al = Math.exp(-dm / fog) * clamp((dm - .1) / .5);
      if (al < .02) continue;
      // pull-out: drawers slide inward as the camera arrives (E.soft in the camera's own time)
      const e = .32 * E.soft(clamp((7 - dm) / 5.5));
      const ringHot = KICKS.some(tk => Math.abs(i - Math.floor(zCam(tk) + 9)) < .5 && t > tk - .1);
      // walls: [axis, fixed coordinate sign, cells across]
      for (const [ax, sg, n] of [['x', -1, 3], ['x', 1, 3], ['y', -1, 5], ['y', 1, 5]]) {
        for (let c = 0; c < n; c++) {
          const u0 = -1 + 2 * c / n + .03, u1 = -1 + 2 * (c + 1) / n - .03;
          const q = (uu, zz, inset) => ax === 'x' ? P(sg * (RX - inset), uu * RY, zz) : P(uu * RX, sg * (RY - inset), zz);
          const ins = e * (ax === 'x' ? RX : RY) * .55 * (.6 + .4 * hash(i * 7 + c * 3 + (ax === 'x' ? 0 : 50) + sg));
          const back = [q(u0, z0, 0), q(u1, z0, 0), q(u1, z1, 0), q(u0, z1, 0)];
          const front = [q(u0, z0, ins), q(u1, z0, ins), q(u1, z1, ins), q(u0, z1, ins)];
          X.globalAlpha = Math.max(al, slotA);
          if (ins > .01) {
            // near face of the pulled box (faces the camera), then the front panel
            poly([back[0], back[1], front[1], front[0]]); X.fillStyle = PAL.night2; X.fill();
            X.strokeStyle = PAL.steel2; X.lineWidth = 1.2; X.stroke();
            // wire uprights on the near face
            X.beginPath(); for (let k = 1; k < 4; k++) { const a = lerpP(back[0], back[1], k / 4), b = lerpP(front[0], front[1], k / 4); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); }
            X.lineWidth = .9; X.stroke();
          }
          X.globalAlpha = Math.max(al, slotA); poly(front); X.fillStyle = PAL.night; X.fill();
          X.strokeStyle = PAL.paper; X.lineWidth = Math.max(.8, 2.4 / Math.max(.6, dm) * 1.4);
          X.globalAlpha = al * (1 - blur * .6); X.stroke();
          // handle slit
          const hA = ax === 'x' ? q(lerp(u0, u1, .5), lerp(z0, z1, .25), ins) : q(lerp(u0, u1, .3), lerp(z0, z1, .5), ins);
          const hB = ax === 'x' ? q(lerp(u0, u1, .5), lerp(z0, z1, .75), ins) : q(lerp(u0, u1, .7), lerp(z0, z1, .5), ins);
          X.globalAlpha = al; X.strokeStyle = ringHot ? PAL.orange : PAL.steel2; X.lineWidth = Math.max(1, 5 / Math.max(.6, dm)); X.beginPath(); X.moveTo(hA[0], hA[1]); X.lineTo(hB[0], hB[1]); X.stroke();
        }
      }
    }
    X.restore();
    // rails: the four corner edges of the corridor, continuous (these carry the speed)
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const a = P(sx * RX, sy * RY, zc + near), b = P(sx * RX, sy * RY, Math.min(Z_END, zc + 30));
      line(a[0], a[1], b[0], b[1], 3, PAL.paper, .5);
    }
    // radial speed lines grow with velocity
    speedLines(CX, CY, 300 + 200 * (1 - blur), 1500, Math.round(24 + 60 * blur), { col: PAL.paper, a: .05 + .22 * blur, w: 3 + 5 * blur, seed: Math.floor(t * 24), rot: roll });
    // --- lyric, huge and cool; 加速 flips orange on the bar-21 downbeat; everything flies past the lens at the end
    const ex = E.in(clamp((t - B(85)) / .42)), sc = 1 + ex * 3.2;
    X.save(); X.translate(CX, CY); X.scale(sc, sc); X.translate(-CX, -CY); X.globalAlpha *= 1 - ex;
    const hi = t >= B(84) ? '加速' : '';
    // zoom-trail echo behind the solid type
    for (const [k2, a2] of [[1.08, .14], [1.17, .07]]) {
      X.save(); X.translate(CX, CY - 20); X.scale(k2 + .03 * pulse(t, 5), k2 + .03 * pulse(t, 5)); X.translate(-CX, -CY + 20); X.globalAlpha *= a2 * 4 * clamp(v / 10);
      lyHero(16, t, { x: CX, y: 470, size: 230, lead: 1.14, align: 'center', col: null, stroke: PAL.paper, sw: 2, hold: 1.2, exit: 'fade', dur: .16 });
      X.restore();
    }
    lyHero(16, t, { x: CX, y: 470, size: 230, lead: 1.14, align: 'center', col: PAL.paper, hi, hold: 1.2, exit: 'fade', dur: .16, pop: 1.6 });
    X.restore();
    // HUD: velocity doubles every beat
    const nB = Math.max(0, Math.floor(bp(t) - 78)), vel = 2 ** Math.min(nB + 1, 40);
    const hud = clamp((dEnd - 3) / 4);
    text('VELOCITY', 64, 84, { size: 20, font: MONO, weight: 700, col: PAL.steel2, track: 3, a: hud });
    text('×' + (vel >= 1e6 ? vel.toExponential(1).replace('e+', 'e') : vel), 64, 136, { size: 46, font: MONO, weight: 800, col: PAL.orange, a: hud });
    text('厨房 · 加速中', W - 64, 84, { size: 22, font: MONO, weight: 700, col: PAL.steel2, align: 'right', a: hud });
    // end: the slot's light takes over the frame
    if (slotH > .9) flash(clamp((slotH - .9) / .6), PAL.paper);
  }
  const lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

  chapter('verse2', 38.5, 59.0, [
    [38.5, sMitosis],
    [B(60.5), sTiling],        // 41.440  两
    [B(65.5), sScaling],       // 44.849
    [B(71), sOverflow],        // 48.599
    [B(72), sSpeedrun],        // 49.281
    [B(76), sTimer],           // 52.008
    [B(77), sPush],            // 52.690
    [B(78), sTunnel],          // 53.372
  ]);
})();
