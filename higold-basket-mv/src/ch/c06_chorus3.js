// c06_chorus3 — Chorus 3 · "Breakdown" (95.4 – 109.4). The quiet chorus, drawn as one precise drawing set on white paper:
// 01 HOOK (a whispered hook, LAN's slow pull) · 02 PROCESS (收纳焦虑.exe goes offline) · 03 GRID (knolling snaps into order)
// 04 PLAN (top-down basket plan with keynotes) · 05 ELEVATION (a lens finds the salt at a glance) · 06 AXONOMETRIC (the whole
// kitchen, every drawer opening in a wave). Hairline ink, small exquisite type, one orange mark per sheet, cobalt = machine only.
(() => {
  'use strict';
  const BT = beatT;
  const T_HOOK = 95.4, T_WIN = BT(142.5), T_GRID = BT(145), T_PLAN = BT(147), T_ELEV = BT(150), T_AXO = BT(153), T_END = 109.4;

  // ---------- small private helpers ----------
  const ln = (x1, y1, x2, y2, w = 1.5, col = PAL.ink, a = 1) => line(x1, y1, x2, y2, w, col, a, 'butt');
  function dln(x1, y1, x2, y2, w = 1.2, col = PAL.ink, a = 1, pat = [9, 7]) { X.save(); X.setLineDash(pat); line(x1, y1, x2, y2, w, col, a, 'butt'); X.restore(); }
  function stroke(fn, w = 1.5, col = PAL.ink, a = 1, o = {}) {
    X.save(); X.globalAlpha *= a; X.beginPath(); fn();
    if (o.fill) { X.fillStyle = o.fill; X.fill(); }
    if (w > 0) { X.strokeStyle = col; X.lineWidth = w; X.lineJoin = 'round'; X.lineCap = o.cap ?? 'round'; if (o.dash) X.setLineDash(o.dash); X.stroke(); }
    X.restore();
  }
  const mono = (s, x, y, o = {}) => text(s, x, y, { size: 15, font: F.mono, weight: 600, col: PAL.ink2, track: 1.5, ...o });
  const ease = (t, a, d, f = E.soft) => f((t - a) / d);

  // ---------- sheet furniture: crop marks, title strip, sheet index, a 4-square metronome that ticks on every beat ----------
  const SHEETS = [['HOOK', '轻声'], ['PROCESS', '进程'], ['GRID', '归位'], ['PLAN', '平面'], ['ELEVATION', '立面'], ['AXONOMETRIC', '轴测']];
  function sheet(t, n, o = {}) {
    const m = 46, c = PAL.ink, a = o.a ?? 1;
    X.save(); X.globalAlpha *= a;
    for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
      ln(x - sx * 12, y, x + sx * 30, y, 1.4, c, .75); ln(x, y - sy * 12, x, y + sy * 30, 1.4, c, .75);
    }
    text('HIGOLD 悍高', 96, 76, { size: 19, font: F.sans, weight: 700, col: c, track: 2 });
    mono('厨房拉篮 · 新秩序', 96, 102, { size: 14 });
    // metronome: four beat squares, the current one filled (the downbeat square is a hair bigger)
    const bi = ((beatN(t) % 4) + 4) % 4, pk = pulse(t, 5);
    for (let i = 0; i < 4; i++) {
      const x = W - 96 - (3 - i) * 22 - 12, y = 62, s = 12;
      if (i === bi) rect(x - pk * 1.5, y - pk * 1.5, s + pk * 3, s + pk * 3, c);
      else { X.save(); X.strokeStyle = c; X.globalAlpha *= .55; X.lineWidth = 1.3; X.strokeRect(x + .5, y + .5, s - 1, s - 1); X.restore(); }
    }
    mono('♩ 88  ·  BAR ' + String(barN(t) + 1).padStart(2, '0'), W - 96, 102, { size: 14, align: 'right' });
    // sheet index (bottom-left) and sheet title (bottom-right)
    for (let i = 0; i < 6; i++) {
      const x = 96 + i * 18, y = H - 78;
      if (i === n) rect(x, y, 11, 11, c); else { X.save(); X.strokeStyle = c; X.globalAlpha *= .5; X.lineWidth = 1.2; X.strokeRect(x + .5, y + .5, 10, 10); X.restore(); }
    }
    mono(`SHEET ${String(n + 1).padStart(2, '0')} / 06`, 96 + 6 * 18 + 14, H - 67, { size: 14 });
    mono(`C06 — ${SHEETS[n][0]}  ${SHEETS[n][1]}`, W - 96, H - 67, { size: 14, align: 'right' });
    X.restore();
  }

  // ---------- private lyric presenter: quiet editorial type; each character rises out of a hairline slit with the drawer curve
  // o: {x, y (first baseline), size|sizes[], weight|weights[], font, col|cols[], align, track, lead|leads[], hi, dur, rise, slit, rows}
  function lyType(i, t, o = {}) {
    const env = lyEnv(i, t, o.hold ?? .2, o.fade ?? .25); if (env <= 0) return null; LYRIC_DRAWN.add(i);
    const rows = o.rows ?? lyRows(i), font = o.font ?? F.serif, out = [];
    X.save(); X.globalAlpha *= env;
    let y = o.y;
    rows.forEach((row, r) => {
      const size = o.sizes?.[r] ?? o.size ?? 120, wt = o.weights?.[r] ?? o.weight ?? 900, tr = o.tracks?.[r] ?? o.track ?? 0;
      const ws = row.map(c => measure(c.ch, size, font, wt)), tw = ws.reduce((s, w) => s + w, 0) + tr * (row.length - 1);
      if (r > 0) y += o.leads?.[r - 1] ?? o.lead ?? size * 1.2;
      let x = o.x - (o.align === 'center' ? tw / 2 : o.align === 'right' ? tw : 0);
      const x0 = x, rc = o.cols?.[r] ?? o.col ?? PAL.ink; let seen = 0;
      row.forEach((c, j) => {
        const k = chK(c.ti, t, o.dur ?? .45);
        if (k > 0) {
          seen = j + 1;
          const rise = (1 - E.soft(k)) * size * (o.rise ?? 1.15);
          X.save(); X.beginPath(); X.rect(x - size * .3, y - size * 1.3, ws[j] + size * .6, size * 1.3 + size * .19); X.clip();
          text(c.ch, x, y + rise, { size, font, weight: wt, col: o.hi && o.hi.includes(c.ch) ? PAL.orange : rc });
          X.restore();
        }
        x += ws[j] + tr;
      });
      if (o.slit) { const sl = o.slit === true ? 1.5 : o.slit, ex = size * .25; ln(x0 - ex, y + size * .19, x0 + tw + ex, y + size * .19, sl, PAL.ink, .85); }
      out.push({ x0, y, w: tw, size, seen, n: row.length, ws, tr });
    });
    X.restore();
    return out;
  }

  // =====================================================================================================================
  // 01 · HOOK (95.4 – 97.35) — the hook as a whisper: a light serif line rising out of one slit; LAN alone pulls a drawer slowly.
  // =====================================================================================================================
  const REACH = pose({ lean: .12, head: .16, sR: .82, eR: .08, sL: .22, eL: .3, hL: .08, hR: .22, kR: .06 });
  // the tug: elbow drawn back, forearm level, so the hand keeps the handle's height as it travels back to the hip
  const YANK = pose({ lean: -.18, head: -.1, dy: -.06, sR: .05, eR: 1.62, sL: .12, eL: .18, hL: .2, kL: .18, hR: .12, kR: .08 });
  const PINYIN = ['yī', 'lā', 'jiù', 'dào', 'wèi'];
  function lanPull(t) {
    const reachK = E.io((t - 95.46) / .84), walkK = E.io((t - 96.33) / .72), yankK = E.soft((t - 96.74) / .62);
    const st = Math.sin(walkK * Math.PI * 2), sp = Math.max(0, st), sn = Math.max(0, -st);
    let P = lerpPose(pose({ sL: .16, sR: .16 }), REACH, reachK);
    P = { ...P, lean: P.lean - .14 * walkK, hL: P.hL + .22 * sp, kL: P.kL + .45 * sp, hR: P.hR + .22 * sn, kR: P.kR + .45 * sn, dy: .05 * Math.abs(st) };
    P = lerpPose(P, YANK, yankK);
    return { P, dx: -66 * walkK, grip: reachK > .999 };
  }
  function hookVignette(t) {
    const gy = 905, s = 20, LX0 = CX - 60;
    const L = lanPull(t), LX = LX0 + L.dx;
    // probe the hand geometry (invisible) so the handle sits exactly in LAN's hand
    const hr0 = figure(LX0, gy, s, REACH, { who: 'lan', a: 0, shadow: false }).handR;
    const hr = figure(LX, gy, s, L.P, { who: 'lan', a: 0, shadow: false }).handR;
    const FX = hr0[0] + 7, hy = hr0[1], ext = L.grip ? Math.max(0, hr0[0] - hr[0]) : 0;
    const top = hy - 16, depth = 176, bot = gy - 16;
    // ground: one rule + a few architectural ground hatches
    ln(CX - 340, gy, CX + 340, gy, 2, PAL.ink, .9);
    for (let i = 0; i < 23; i++) { const x = CX - 326 + i * 30; ln(x, gy + 3, x - 10, gy + 13, 1, PAL.ink, .35); }
    // the basket drawer in side elevation (drawn first; the carcass side panel hides the part still inside)
    const fx = FX - ext;
    X.save(); X.strokeStyle = PAL.ink; X.lineCap = 'butt'; X.lineWidth = 1; X.globalAlpha *= .7; X.beginPath();
    for (let x = fx + 12; x < fx + depth - 12; x += 9) { X.moveTo(x, top + 18); X.lineTo(x, bot - 8); }
    X.stroke(); X.restore();
    ln(fx + 4, top + 18, fx + depth - 14, top + 18, 2.2); ln(fx + 4, bot - 8, fx + depth - 14, bot - 8, 2); ln(fx + depth - 14, top + 18, fx + depth - 14, bot - 8, 2);
    ln(fx + 4, (top + bot) / 2 + 6, fx + depth - 14, (top + bot) / 2 + 6, 1.2, PAL.ink, .8);
    // carcass (side panel, opaque), counter slab, toe-kick
    rect(FX, top - 2, depth + 8, gy - top + 2, PAL.paper);
    stroke(() => { X.rect(FX, top - 2, depth + 8, gy - top + 2); }, 2.2);
    rect(FX - 8, top - 12, depth + 20, 10, PAL.ink);
    rect(FX + 6, gy - 14, depth - 4, 14, PAL.paper); ln(FX + 6, gy - 14, FX + 6, gy, 1.6); ln(FX + 6, gy - 14, FX + depth + 8, gy - 14, 1.6);
    // rail (telescoping) visible between the front and the carcass
    ln(fx + 10, (top + bot) / 2 + 20, FX + 20, (top + bot) / 2 + 20, 1.5, PAL.steel0);
    // drawer front + bar handle
    rect(fx - 9, top + 2, 9, bot - top - 2, PAL.paper); stroke(() => X.rect(fx - 9, top + 2, 9, bot - top - 2), 2.2);
    stroke(() => { X.moveTo(fx - 9, hy - 7); X.lineTo(fx - 17, hy - 7); X.lineTo(fx - 17, hy + 7); X.lineTo(fx - 9, hy + 7); }, 2.4);
    // a quiet dimension under the floor once the drawer has travelled: 全拉出, no numbers
    if (ext > 30) {
      const a = clamp((ext - 30) / 50), yy = gy + 40;
      ln(fx - 9, yy, FX, yy, 1.3, PAL.ink, .7 * a); for (const x of [fx - 9, FX]) ln(x - 5, yy + 5, x + 5, yy - 5, 1.3, PAL.ink, .7 * a);
      mono('全拉出', (fx - 9 + FX) / 2, yy + 26, { size: 13, align: 'center', a });
    }
    // LAN
    figure(LX, gy, s, L.P, { who: 'lan', face: t > 97.02 ? 'happy' : 'closed', blush: .9, w: .22, seed: 31 });
  }
  function shotHook(t, lt) {
    paperBG();
    const z = 1 + .03 * E.io((t - 95.24) / 2.3);
    cam(CX, CY + 40, z);
    X.translate(0, 40);
    // the slit draws itself from the centre, then each character rises out of it
    const sk = E.soft((t - 95.3) / .9), sy = 470 + 236 * .19;
    ln(CX - 720 * sk, sy, CX + 720 * sk, sy, 1.5, PAL.ink, .85);
    const R = lyType(28, t, { x: CX, y: 470, size: 236, weight: 300, align: 'center', track: 46, hi: '拉', dur: .55 });
    // pinyin caption under each syllable (the same line, whispered)
    if (R) {
      const r = R[0]; let x = r.x0;
      lyRows(28)[0].forEach((c, j) => {
        const k = chK(c.ti, t, .4), cx = x + r.ws[j] / 2;
        if (k > 0) text(PINYIN[j], cx, sy + 62, { size: 38, font: F.serifI, col: PAL.ink2, align: 'center', a: E.out(k) });
        x += r.ws[j] + r.tr;
      });
      mono('CHORUS 03 — BREAKDOWN', CX, sy - 300, { align: 'center', size: 15, a: sk });
    }
    X.translate(0, -40);
    hookVignette(t);
    camEnd();
    sheet(t, 0);
  }

  // =====================================================================================================================
  // 02 · PROCESS (97.35 – 99.05) — one OS window, "收纳焦虑.exe". A cursor closes it on the downbeat; the anxiety trace flatlines.
  // =====================================================================================================================
  function shotWindow(t, lt) {
    paperBG();
    const click = BT(144), on = t >= click, open = clamp((t - T_WIN + .02) / .3), off = E.soft((t - click) / .7);
    const wx = 450, wy = 196, ww = 1020, wh = 640;
    cam(CX, CY, 1 + .018 * E.io(lt / 1.9));
    win(wx, wy, ww, wh, on ? '收纳焦虑.exe  —  已下线' : '收纳焦虑.exe', {
      k: open, body: (bx, by, bw, bh) => {
        const L0 = bx + 64, R0 = bx + bw - 64;
        mono('PROCESS  ·  收纳焦虑', L0, by + 48, { col: PAL.ink2 });
        // status: a spinner while running, a hollow ring when offline
        if (!on) {
          const cx = R0 - 150, cy = by + 42;
          for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.floor(t * 12) / 12 * TAU, al = ((i + Math.floor(t * 12)) % 8) / 8; ln(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, cx + Math.cos(a) * 10, cy + Math.sin(a) * 10, 2, PAL.ink, .2 + .8 * al); }
          mono('RUNNING', R0, by + 48, { align: 'right', col: PAL.ink });
        } else { circle(R0 - 150, by + 42, 8, { stroke: PAL.ink2, w: 2 }); mono('OFFLINE', R0, by + 48, { align: 'right' }); }
        ln(L0, by + 70, R0, by + 70, 1.2, PAL.ink, .3);
        // the lyric is the window's content: row 1 = the process, row 2 = its new status
        const rows = lyType(29, t, { x: L0, y: by + 236, size: 134, weight: 900, lead: 168, dur: .32, hold: .4, cols: [on ? mixCol(PAL.ink, PAL.paper, .55 * off) : PAL.ink, PAL.ink] });
        if (rows && on) { const r0 = rows[0], k = E.out(clamp((t - click) / .3)); ln(r0.x0 - 10, r0.y - r0.size * .36, r0.x0 - 10 + (r0.w + 20) * k, r0.y - r0.size * .36, 5, PAL.ink); }
        // anxiety trace: jagged, pulsing on the beat → flatline after the click
        const ty = by + 500, x0 = L0, x1 = R0, amp = 38 * (.55 + .45 * pulse(t, 4)) * (1 - off);
        mono('焦虑 / ANXIETY', x0, ty - 58, { size: 14 });
        mono(on ? '0%' : '99%', x1, ty - 58, { size: 14, align: 'right', col: on ? PAL.ink2 : PAL.ink });
        ln(x0, ty, x1, ty, 1, PAL.ink, .18);
        stroke(() => {
          for (let x = x0; x <= x1; x += 5) {
            const u = x - x0, v = noise1(u * .05 + t * 7) * .65 + noise1(u * .17 - t * 11) * .35, env = Math.sin(Math.PI * u / (x1 - x0));
            const y = ty + v * amp * (.35 + .65 * env);
            x === x0 ? X.moveTo(x, y) : X.lineTo(x, y);
          }
        }, 2.2, PAL.ink);
      }
    });
    if (on && open >= 1) rect(wx + 14, wy + 13, 14, 14, PAL.grey);      // the orange close button goes grey once pressed
    // cursor: glides in with the drawer curve, presses the close button on the downbeat
    if (t > 97.55) {
      const g = E.soft((t - 97.6) / .8), cx = lerp(1640, wx + 21, g), cy = lerp(980, wy + 20, g);
      const ck = on ? clamp((t - click) / .4) : 0, dr = on ? E.out((t - click - .15) / .6) : 0;
      cursor(cx + dr * 26, cy + dr * 30, { click: on && ck < 1 ? ck : 0, s: 1.3 });
    }
    camEnd();
    sheet(t, 1);
  }

  // =====================================================================================================================
  // 03 · GRID (99.05 – 100.42) — knolling: scattered kitchen things snap into a perfect 5×3 grid; the lyric is its middle row.
  // =====================================================================================================================
  const OB = {
    plate: () => { handCircle(0, 0, 74, { w: 3, seed: 201 }); handCircle(0, 0, 50, { w: 1.3, seed: 202 }); },
    bowl: () => { handCircle(0, 0, 64, { w: 3, seed: 203 }); handCircle(0, 0, 54, { w: 1.3, seed: 204 }); handCircle(0, 0, 24, { w: 1.3, seed: 205 }); },
    cup: () => { handCircle(-8, 0, 42, { w: 3, seed: 206 }); handCircle(-8, 0, 34, { w: 1.2, seed: 207 }); stroke(() => { X.moveTo(33, -12); X.lineTo(56, -12); X.arcTo(64, -12, 64, 0, 10); X.arcTo(64, 12, 56, 12, 10); X.lineTo(33, 12); }, 3); },
    lid: () => { handCircle(0, 0, 70, { w: 3, seed: 208 }); handCircle(0, 0, 60, { w: 1.2, seed: 209 }); circle(0, 0, 13, { fill: PAL.paper, stroke: PAL.ink, w: 3 }); },
    jar: () => {
      handCircle(0, 0, 46, { w: 3, seed: 210 }); handCircle(0, 0, 38, { w: 1.3, seed: 211 });
      X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 1.3; X.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; X.moveTo(Math.cos(a) * 38, Math.sin(a) * 38); X.lineTo(Math.cos(a) * 45, Math.sin(a) * 45); } X.stroke(); X.restore();
    },
    chop: () => { inkStroke([[-9, -76], [-7, 76]], { w: 5, taper: [0, .7], wob: .2, seed: 212 }); inkStroke([[9, -76], [7, 76]], { w: 5, taper: [0, .7], wob: .2, seed: 213 }); },
    spoon: () => { stroke(() => { X.ellipse(0, -30, 26, 40, 0, 0, TAU); }, 3, PAL.ink, 1, { fill: PAL.paper }); stroke(() => { X.ellipse(0, -30, 17, 29, 0, 0, TAU); }, 1.2); stroke(() => { X.moveTo(-6, 9); X.lineTo(-8, 70); X.arcTo(-8, 78, 0, 78, 8); X.arcTo(8, 78, 8, 70, 8); X.lineTo(6, 9); }, 3); },
    spatula: () => { stroke(() => X.roundRect(-30, -78, 60, 64, 8), 3, PAL.ink, 1, { fill: PAL.paper }); for (const dx of [-10, 10]) ln(dx, -68, dx, -26, 1.3); stroke(() => { X.moveTo(-5, -14); X.lineTo(-5, 78); X.lineTo(5, 78); X.lineTo(5, -14); }, 3); },
    ladle: () => { handCircle(0, -40, 36, { w: 3, seed: 214 }); handCircle(0, -40, 27, { w: 1.2, seed: 215 }); stroke(() => { X.moveTo(-5, -4); X.lineTo(-5, 78); X.lineTo(5, 78); X.lineTo(5, -4); }, 3); circle(0, 70, 3, { fill: PAL.ink }); },
    bottle: () => { handCircle(0, 0, 40, { w: 3, seed: 216 }); handCircle(0, 0, 20, { w: 2.2, seed: 217 }); handCircle(0, 0, 13, { w: 1.2, seed: 218 }); },
  };
  const GRID_ROWS = [['plate', 'bowl', 'cup', 'lid', 'jar'], null, ['chop', 'spoon', 'spatula', 'ladle', 'bottle']];
  function shotGrid(t, lt) {
    paperBG();
    const cs = 196, gx = CX - cs * 2.5, gy = 262, lock = BT(146);
    cam(CX, CY, 1 + .014 * E.io(lt / 1.6));
    // the grid (pencil hairlines) draws itself first
    const gk = E.soft((t - T_GRID + .06) / .55);
    X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 1; X.globalAlpha *= .28; X.setLineDash([6, 6]); X.beginPath();
    for (let i = 0; i <= 5; i++) { const x = gx + i * cs; X.moveTo(x, gy + cs * 1.5 - cs * 1.5 * gk); X.lineTo(x, gy + cs * 1.5 + cs * 1.5 * gk); }
    for (let j = 0; j <= 3; j++) { const y = gy + j * cs; X.moveTo(gx + cs * 2.5 - cs * 2.5 * gk, y); X.lineTo(gx + cs * 2.5 + cs * 2.5 * gk, y); }
    X.stroke(); X.restore();
    // cell-centre registration crosses
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const x = gx + (i + .5) * cs, y = gy + (j + .5) * cs; ln(x - 5, y, x + 5, y, 1, PAL.ink, .25 * gk); ln(x, y - 5, x, y + 5, 1, PAL.ink, .25 * gk); }
    // objects: scattered → snapped (each on its own 16th, a shuffled order so it feels found, not mechanical)
    let n = 0;
    [0, 2].forEach(r => GRID_ROWS[r].forEach((name, c) => {
      const id = r * 5 + c, ord = Math.floor(hash(id * 3.7 + 1) * 1000) % 10, j = n++;
      const ts = T_GRID + .1 + ((ord + j) % 10) * .062, k = E.out5((t - ts) / .17);
      const dx = (hash(id * 3.1) - .5) * 120 + Math.sin(t * 1.4 + id) * 3, dy = (hash(id * 7.7) - .5) * 96 + Math.cos(t * 1.1 + id) * 3, rot = (hash(id * 1.9) - .5) * 1.4;
      const x = gx + (c + .5) * cs + dx * (1 - k), y = gy + (r + .5) * cs + dy * (1 - k);
      X.save(); X.translate(x, y); X.rotate(rot * (1 - k)); X.globalAlpha *= .55 + .45 * k; OB[name](); X.restore();
    }));
    // the lyric: the grid's middle row, one character per cell, each snapping in on its onset
    const env = lyEnv(30, t, .3, .25);
    if (env > 0) {
      LYRIC_DRAWN.add(30);
      lyRows(30)[0].forEach((c, i) => {
        const k = E.out5(chK(c.ti, t, .2)), id = 40 + i, size = 150;
        const dx = (hash(id * 3.1) - .5) * 110, dy = (hash(id * 7.7) - .5) * 70, rot = (hash(id * 1.9) - .5) * 1.1;
        const x = gx + (i + .5) * cs + dx * (1 - k), y = gy + 1.5 * cs + dy * (1 - k);
        X.save(); X.globalAlpha *= env; X.translate(x, y); X.rotate(rot * (1 - k));
        if (k <= 0) text(c.ch, 0, size * .36, { size, font: F.serif, weight: 900, col: null, stroke: rgba(PAL.ink, .22), sw: 1.5, align: 'center' });
        else text(c.ch, 0, size * .36, { size, font: F.serif, weight: 900, col: PAL.ink, align: 'center', a: .35 + .65 * k });
        X.restore();
      });
    }
    // smart guides (the computer approves): cobalt alignment lines flash once everything is locked
    if (t > lock) {
      const a = 1 - clamp((t - lock) / .55), gl = E.out((t - lock) / .18);
      X.save(); X.strokeStyle = PAL.cobalt; X.lineWidth = 1.6; X.globalAlpha *= .9 * a; X.beginPath();
      for (let j = 0; j < 3; j++) { const y = gy + (j + .5) * cs; X.moveTo(CX - (cs * 2.5 + 70) * gl, y); X.lineTo(CX + (cs * 2.5 + 70) * gl, y); }
      for (let i = 0; i < 5; i++) { const x = gx + (i + .5) * cs; X.moveTo(x, gy + cs * 1.5 - (cs * 1.5 + 50) * gl); X.lineTo(x, gy + cs * 1.5 + (cs * 1.5 + 50) * gl); }
      X.stroke(); X.restore();
      for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const x = gx + (i + .5) * cs, y = gy + (j + .5) * cs; rect(x - 3.5, y - 3.5, 7, 7, PAL.cobalt, .9 * a); }
    }
    mono('ALIGN: CENTRE   ·   SPACING: EQUAL   ·   ROTATION: 0°', CX, gy + 3 * cs + 58, { align: 'center', size: 14, a: clamp((t - lock) / .3) });
    // one orange sticker on 喜
    const sk = clamp((t - LY[30].t[4]) / .25);
    if (sk > 0) sticker(gx + cs * 5 - 20, gy - 18, '已对齐 ✓', { k: sk, size: 26, rot: -.06 });
    camEnd();
    sheet(t, 2);
  }

  // =====================================================================================================================
  // 04 · PLAN (100.42 – 102.46) — a top-down architectural plan of the basket gliding out, every item keynoted.
  // =====================================================================================================================
  const PS = 1.1, PX = 1190, PY0 = 318;                       // plan scale px/mm, basket centre x, cabinet front line y
  const pz = z => PY0 + z * PS, pxm = x => PX + x * PS;        // plan mm → screen
  function planBasket(ext, t) {
    const zb = ext - 460, zf = ext - 20;                      // basket back / front rim (mm, cabinet front = 0)
    // slides along both sides
    for (const s of [-1, 1]) { ln(pxm(s * 300), pz(-470), pxm(s * 300), pz(zf), 1.2, PAL.ink, .7); ln(pxm(s * 292), pz(zb), pxm(s * 292), pz(zf), 1.2, PAL.ink, .7); }
    // floor slats + cross bars
    X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 1; X.globalAlpha *= .32; X.beginPath();
    for (let x = -254; x <= 254; x += 26) { X.moveTo(pxm(x), pz(zb + 8)); X.lineTo(pxm(x), pz(zf - 8)); }
    X.stroke(); X.restore();
    for (const f of [.3, .7]) ln(pxm(-272), pz(zb + 440 * f), pxm(272), pz(zb + 440 * f), 1.4, PAL.ink, .55);
    // rim: double line
    stroke(() => X.roundRect(pxm(-280), pz(zb), 560 * PS, 440 * PS, 28 * PS), 2.8);
    stroke(() => X.roundRect(pxm(-273), pz(zb + 7), 546 * PS, 426 * PS, 22 * PS), 1.1);
    // dish comb: two rows of hairpins
    X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 1.2; X.beginPath();
    for (const cx of [-222, -7]) for (let z = 52; z <= 396; z += 30) { X.moveTo(pxm(cx - 5), pz(zb + z)); X.lineTo(pxm(cx), pz(zb + z + 8)); X.lineTo(pxm(cx + 5), pz(zb + z)); }
    X.stroke(); X.restore();
    // plates standing in the comb (seen from above: thin rims)
    for (let i = 0; i < 7; i++) { const z = zb + 70 + i * 32; stroke(() => X.ellipse(pxm(-105), pz(z), 132 * PS, 7 * PS, 0, 0, TAU), 1.8, PAL.ink, 1, { fill: PAL.paper }); ln(pxm(-105 - 118), pz(z), pxm(-105 + 118), pz(z), .9, PAL.ink, .5); }
    // stacked bowls, cups, a chopstick caddy
    const bx = 150, bz = zb + 140;
    for (const [r, w] of [[76, 2.6], [62, 1.2], [48, 1.2], [26, 1.2]]) circle(pxm(bx), pz(bz), r * PS, { stroke: PAL.ink, w, fill: r === 76 ? PAL.paper : null });
    for (const [cx, cz] of [[150, 320], [62, 336]]) { circle(pxm(cx), pz(zb + cz), 41 * PS, { fill: PAL.paper, stroke: PAL.ink, w: 2.4 }); circle(pxm(cx), pz(zb + cz), 34 * PS, { stroke: PAL.ink, w: 1 }); stroke(() => X.roundRect(pxm(cx + 40), pz(zb + cz - 9), 20 * PS, 18 * PS, 6), 2.2); }
    stroke(() => X.roundRect(pxm(212), pz(zb + 262), 52 * PS, 150 * PS, 6), 2.2, PAL.ink, 1, { fill: PAL.paper });
    for (let i = 0; i < 6; i++) circle(pxm(226 + (i % 2) * 22), pz(zb + 290 + Math.floor(i / 2) * 42), 4, { fill: PAL.ink });
    // drawer front (in plan: a slab) + bar handle
    rect(pxm(-326), pz(ext), 652 * PS, 18 * PS, PAL.paper); stroke(() => X.rect(pxm(-326), pz(ext), 652 * PS, 18 * PS), 2.6);
    hatch([[pxm(-326), pz(ext)], [pxm(326), pz(ext)], [pxm(326), pz(ext + 18)], [pxm(-326), pz(ext + 18)]], { gap: 7, w: 1, a: .5, angle: -.8, seed: 3 });
    stroke(() => { X.moveTo(pxm(-150), pz(ext + 18)); X.lineTo(pxm(-150), pz(ext + 42)); X.lineTo(pxm(150), pz(ext + 42)); X.lineTo(pxm(150), pz(ext + 18)); }, 2.6);
    return { zb, zf };
  }
  const KEYS = [['A', '碟', 'PLATES', -175, 150], ['B', '碗', 'BOWLS', 150, 140], ['C', '杯', 'CUPS', 106, 330], ['D', '筷', 'CHOPSTICKS', 238, 250], ['E', '阻尼滑轨', 'SOFT-CLOSE RAIL', -300, 0]];
  function tag(x, y, s, k) { if (k <= 0) return; const r = 16 * E.back(k, 2); circle(x, y, r, { fill: PAL.paper, stroke: PAL.ink, w: 2 }); text(s, x, y + 6 * E.back(k, 2), { size: 17, font: F.mono, weight: 700, align: 'center', a: clamp(k * 2) }); }
  function shotPlan(t, lt) {
    paperBG();
    cam(CX, CY, 1 + .016 * E.io(lt / 2.1));
    const ext = lerp(170, 420, E.soft((t - T_PLAN + .05) / 1.15));
    // cabinet sides in section (poché), overhead counter (dashed), break line
    const top = 150;
    for (const s of [-1, 1]) {
      const xa = pxm(s * 318), xb = pxm(s * 336), pts = [[Math.min(xa, xb), top], [Math.max(xa, xb), top], [Math.max(xa, xb), PY0], [Math.min(xa, xb), PY0]];
      rect(pts[0][0], top, Math.abs(xb - xa), PY0 - top, PAL.paper); hatch(pts, { gap: 6, w: 1, a: .7, angle: .8, seed: 9 + s });
      stroke(() => X.rect(pts[0][0], top, Math.abs(xb - xa), PY0 - top), 2.2);
    }
    dln(pxm(-356), pz(34), pxm(356), pz(34), 1.2, PAL.ink, .5, [12, 8]);
    mono('COUNTER ABOVE', pxm(-372), pz(34) + 5, { size: 12, align: 'right', col: PAL.grey });
    stroke(() => { const y = top; X.moveTo(pxm(-380), y); X.lineTo(pxm(-40), y); X.lineTo(pxm(-24), y - 16); X.lineTo(pxm(-4), y + 16); X.lineTo(pxm(10), y); X.lineTo(pxm(380), y); }, 1.2, PAL.ink, .7);
    // basket (clipped below the break line)
    X.save(); X.beginPath(); X.rect(0, top, W, H); X.clip();
    planBasket(ext, t);
    X.restore();
    // "全拉出" — the one orange dimension: cabinet front → drawer front
    const dx = pxm(420), y1 = pz(0), y2 = pz(ext + 18), dk = E.out((t - T_PLAN - .5) / .5);
    if (dk > 0) {
      ln(pxm(340), y1, dx + 14, y1, 1, PAL.ink, .5 * dk); ln(pxm(340), y2, dx + 14, y2, 1, PAL.ink, .5 * dk);
      const ym = lerp(y1, y2, .5), yy2 = lerp(ym, y2, dk), yy1 = lerp(ym, y1, dk);
      ln(dx, yy1, dx, yy2, 2.4, PAL.orange);
      for (const y of [yy1, yy2]) ln(dx - 8, y + 8, dx + 8, y - 8, 2.4, PAL.orange);
      text('全拉出', dx + 26, ym + 12, { size: 30, font: F.serif, weight: 900, col: PAL.orange, a: dk });
      mono('FULL EXTENSION', dx + 26, ym + 40, { size: 12, col: PAL.orange, a: dk });
    }
    // keynote tags on the items (each pops on a 16th once the basket has landed); the legend sits under the title block
    const zb = ext - 460, lx = 124, ly0 = 790;
    KEYS.forEach(([L, cn, en, x, z], i) => {
      const k = clamp((t - (BT(147.5) + i * .17)) / .22);
      if (i === 4) { const rx = pxm(-300), ry = pz(zb + 330); if (k > 0) ln(rx, ry, rx - 44 * E.out(k), ry, 1.2, PAL.ink, .8); tag(rx - 60, ry, L, k); }
      else tag(pxm(x), pz(zb + z), L, k);
      const col = i < 3 ? 0 : 1, row = i < 3 ? i : i - 3, x0 = lx + col * 250, y0 = ly0 + row * 50;
      if (k > 0) { tag(x0 + 16, y0 - 8, L, k); text(cn, x0 + 44, y0, { size: 24, font: F.serif, weight: 700, a: clamp(k * 2) }); mono(en, x0 + 46, y0 + 22, { size: 11, a: clamp(k * 2), col: PAL.grey }); }
    });
    // lyric: the drawing title (left), with a thick–thin rule like a title block
    const R = lyType(31, t, { x: 124, y: 440, size: 118, weight: 900, lead: 148, dur: .4 });
    if (R) {
      const y = R[1].y + 54, k = E.soft((t - T_PLAN) / .8);
      ln(124, y, 124 + 470 * k, y, 4, PAL.ink); ln(124, y + 9, 124 + 470 * k, y + 9, 1.2, PAL.ink);
      mono('拉篮平面图  ·  碗碟拉篮  ·  NTS', 124, y + 40, { size: 14, a: k });
      mono('31 /', 124, R[0].y - 146, { size: 15, a: k });
    }
    camEnd();
    sheet(t, 3);
  }

  // =====================================================================================================================
  // 05 · ELEVATION (102.46 – 104.51) — a section through a seasoning pull-out; a cobalt lens flies from 眼 to the salt and locks.
  // =====================================================================================================================
  const EQ = .98, EX0 = 740, EFY = 905;                       // elevation scale, cabinet back x, floor y
  const ex = u => EX0 + u * EQ, ey = y => EFY - y * EQ;
  const BOTTLE_B = [[PROF.bottle, '酱', 1], [PROF.tall.map(([r, y]) => [r * .92, y * .82]), '油', 0], [PROF.bottle, '醋', 1], [PROF.jar.map(([r, y]) => [r * 1.1, y * 1.2]), '糖', 0]];
  const BOTTLE_T = [[PROF.jar, '椒', 0], [PROF.jar.map(([r, y]) => [r * .9, y * 1.25]), '粉', 1], [PROF.jar, '盐', 0], [PROF.jar.map(([r, y]) => [r * .85, y * .95]), '茴', 1]];
  function profile(u, y0, prof, label, lift = 0) {
    const L = prof.map(([r, y]) => [ex(u - r), ey(y0 + y) - lift]), R = prof.map(([r, y]) => [ex(u + r), ey(y0 + y) - lift]).reverse();
    const pts = L.concat(R);
    fillPoly(pts, PAL.paper); stroke(() => poly(pts), 2.2);
    // cap line + label band
    const hTop = prof[prof.length - 1][1], rMid = prof[Math.floor(prof.length / 2)][0];
    const by = y0 + Math.min(hTop * .42, 60), bh = 26;
    stroke(() => X.rect(ex(u - rMid * .82), ey(by + bh) - lift, rMid * 1.64 * EQ, bh * EQ), 1.2, PAL.ink, .8);
    text(label, ex(u), ey(by + bh / 2) + 7 - lift, { size: 20, font: F.serif, weight: 700, align: 'center' });
    return [ex(u), ey(y0 + hTop / 2) - lift, hTop * EQ];
  }
  function elevation(t, ext, lift) {
    const back = 0, front = 560, du = ext;
    // floor, toe-kick, carcass in section (hatched cut members)
    ln(EX0 - 60, EFY, ex(1100), EFY, 2.2);
    for (let i = 0; i < 40; i++) { const x = EX0 - 50 + i * 30; if (x > ex(1080)) break; ln(x, EFY + 3, x - 10, EFY + 13, 1, PAL.ink, .3); }
    const cut = (u0, y0, u1, y1) => { const pts = [[ex(u0), ey(y1)], [ex(u1), ey(y1)], [ex(u1), ey(y0)], [ex(u0), ey(y0)]]; fillPoly(pts, PAL.paper); hatch(pts, { gap: 6, w: 1, a: .7, angle: .8, seed: u0 + y0 }); stroke(() => poly(pts), 2); };
    fillPoly([[ex(back), ey(820)], [ex(front), ey(820)], [ex(front), ey(100)], [ex(back), ey(100)]], PAL.paper2, .32);   // far side panel
    cut(back, 100, back + 18, 820);                   // back panel
    cut(back, 100, front, 118);                        // bottom
    cut(back - 10, 820, front + 26, 858);              // counter slab
    stroke(() => { X.moveTo(ex(back), ey(0)); X.lineTo(ex(back), ey(100)); X.moveTo(ex(front - 60), ey(0)); X.lineTo(ex(front - 60), ey(100)); }, 1.6);
    // the seasoning pull-out: basket side (bottles first, then the side wires over them)
    const ub = 90 + du, uf = 530 + du;
    // bottom-mount slide: fixed member + moving member
    ln(ex(20), ey(140), ex(front), ey(140), 2, PAL.steel0); ln(ex(ub), ey(146), ex(uf + 20), ey(146), 1.6, PAL.ink);
    const tiers = [160, 470], pos = [60, 160, 262, 362];
    let salt = null;
    BOTTLE_B.forEach(([pf, lab], i) => profile(ub + pos[i], tiers[0] + 4, pf, lab));
    BOTTLE_T.forEach(([pf, lab], i) => { const r = profile(ub + pos[i], tiers[1] + 4, pf, lab, lab === '盐' ? lift : 0); if (lab === '盐') salt = r; });
    X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 1; X.globalAlpha *= .5; X.beginPath();
    for (let u = ub + 14; u < uf - 6; u += 22) for (const [y0, y1] of [[tiers[0], tiers[0] + 150], [tiers[1], tiers[1] + 120]]) { X.moveTo(ex(u), ey(y0)); X.lineTo(ex(u), ey(y1)); }
    X.stroke(); X.restore();
    for (const y of [tiers[0], tiers[0] + 150, tiers[1], tiers[1] + 120]) ln(ex(ub), ey(y), ex(uf), ey(y), y === tiers[0] || y === tiers[1] ? 2.6 : 1.8);
    ln(ex(ub), ey(tiers[0]), ex(ub), ey(tiers[1] + 120), 2.2); ln(ex(uf), ey(tiers[0]), ex(uf), ey(tiers[1] + 120), 2.2);
    // door (a tall slab) + handle groove
    const d0 = front + du + 2, d1 = d0 + 18;
    fillPoly([[ex(d0), ey(812)], [ex(d1), ey(812)], [ex(d1), ey(112)], [ex(d0), ey(112)]], PAL.paper);
    stroke(() => X.rect(ex(d0), ey(812), 18 * EQ, 700 * EQ), 2.4);
    ln(ex(d1), ey(760), ex(d1 + 14), ey(760), 2.4); ln(ex(d1 + 14), ey(760), ex(d1 + 14), ey(700), 2.4); ln(ex(d1 + 14), ey(700), ex(d1), ey(700), 2.4);
    return salt;
  }
  function shotElev(t, lt) {
    paperBG();
    cam(CX, CY, 1 + .014 * E.io(lt / 2.1));
    const ext = lerp(250, 420, E.soft((t - T_ELEV + .04) / .9)), found = BT(151), lift = 70 * E.soft((t - LY[32].t[4]) / .8);
    const salt = elevation(t, ext, lift);
    // lyric left
    const R = lyType(32, t, { x: 124, y: 470, size: 118, weight: 900, lead: 150, dur: .4 });
    if (R) mono('32 /', 124, R[0].y - 150, { size: 15, a: E.soft(lt / .6) });
    // lens: appears on 眼, glides to the salt with the drawer curve, locks on 找 (beat 151)
    const tE = LY[32].t[1];
    if (R && t > tE - .02 && salt) {
      const r0 = R[0], ox = r0.x0 + r0.ws[0] + r0.tr + r0.ws[1] / 2, oy = r0.y - r0.size * .36;
      const g = E.soft((t - tE - .04) / .5), lk = E.out5((t - found) / .25);
      const lx = lerp(ox, salt[0], g), ly = lerp(oy, salt[1], g), rr = lerp(96, 84, lk) * E.out5((t - tE) / .2);
      // magnified view inside the lens once locked
      if (lk > 0) {
        X.save(); X.beginPath(); X.arc(lx, ly, rr - 2, 0, TAU); X.clip(); X.globalAlpha *= lk;
        rect(lx - rr, ly - rr, rr * 2, rr * 2, PAL.paper);
        X.translate(lx, ly); X.scale(1.55, 1.55); X.translate(-lx, -ly); elevation(t, ext, lift);
        X.restore();
      }
      circle(lx, ly, rr, { stroke: PAL.cobalt, w: 3.2 });
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ln(lx + Math.cos(a) * (rr + 4), ly + Math.sin(a) * (rr + 4), lx + Math.cos(a) * (rr + 16), ly + Math.sin(a) * (rr + 16), 3, PAL.cobalt); }
      if (lk > 0) {
        const s = rr + 26 + 20 * (1 - lk);
        X.save(); X.globalAlpha *= lk; X.strokeStyle = PAL.cobalt; X.lineWidth = 4; X.beginPath();
        for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { X.moveTo(lx + sx * s, ly + sy * (s - 22)); X.lineTo(lx + sx * s, ly + sy * s); X.lineTo(lx + sx * (s - 22), ly + sy * s); }
        X.stroke(); X.restore();
        const tx = lx - s - 164, ty = ly - s;
        rect(tx, ty, 150, 36, PAL.cobalt, lk); text('盐  ✓ FOUND', tx + 12, ty + 25, { size: 19, font: F.mono, weight: 700, col: PAL.paper, a: lk });
      }
    }
    camEnd();
    sheet(t, 4);
  }

  // =====================================================================================================================
  // 06 · AXONOMETRIC (104.51 – 109.4) — pull back from the seasoning pull-out to the whole kitchen as a near-orthographic line
  // drawing; every drawer opens in a wave rippling out from it; a seal stamps 到位 on 序 (beat 159) — the hard beat into the bridge.
  // =====================================================================================================================
  const KD = 560, FR = KD + 18;                                  // base carcass depth, front plane
  const BASE = [                                                  // [x0, x1, drawers: [y0, y1, kind]]
    [0, 220, [[110, 812, 'spice']]],
    [220, 820, [[110, 460, 'pot'], [466, 812, 'dish']]],
    [820, 1620, [[110, 350, 'pot'], [356, 580, 'bowl'], [586, 812, 'cup']]],
    [1620, 2220, [[110, 460, 'pot'], [466, 812, 'plate']]],
    [2220, 2820, [[110, 350, 'bowl'], [356, 580, 'jar'], [586, 812, 'cup']]],
  ];
  const TALL = [2820, 3420];
  const WALL = [[820, 1420], [1420, 2120], [2120, 2820]];         // the middle one is the lift-down basket (open niche)
  const YAW = -.56, PITCH = .54, KC = [1700, 1100, 500];           // camera orientation + fixed pivot (kitchen centre)
  const KPTS = [[-20, 0, 0], [-20, 860, 0], [-20, 0, 1070], [-20, 860, 1070], [820, 2240, 0], [820, 1480, 378], [2820, 1480, 378], [3420, 2240, 0], [3420, 0, 0], [3420, 0, 1060], [3420, 2240, 1060], [2820, 0, 1070], [2820, 2240, 1060]];
  const SPTS = [[0, 110, 0], [0, 812, 0], [0, 110, 1030], [0, 812, 1030], [220, 110, 1030], [220, 812, 1030], [220, 860, 0]];
  const HIT = LY[33].t[8];                                        // 序 — beat 159, the hard hit
  let IW = 2;                                                     // face/lathe ink weight for the current frame (compensates lw)
  function fitBox(pts, tgt) {
    const C = frameCam(KC, YAW, PITCH, 0, 0, 1000, 1000, { fov: 2.4 });
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of pts) { const q = C.project(p); x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }
    return { sc: Math.min((tgt[2] - tgt[0]) / (x1 - x0), (tgt[3] - tgt[1]) / (y1 - y0)), c: [(x0 + x1) / 2, (y0 + y1) / 2], s: [(tgt[0] + tgt[2]) / 2, (tgt[1] + tgt[3]) / 2] };
  }
  let FIT0 = null, FIT1 = null;
  function axoCam(t) {
    if (!FIT0) { FIT0 = fitBox(SPTS, [1060, 140, 1760, 1000]); FIT1 = fitBox(KPTS, [600, 142, 1870, 994]); }
    const k = E.io3((t - T_AXO - .04) / 2.1), drift = 1 - .03 * E.io((t - 106.6) / 2.9);
    const sc = Math.exp(lerp(Math.log(FIT0.sc), Math.log(FIT1.sc), k)) * drift;
    const u = (1 / sc - 1 / FIT0.sc) / (1 / (FIT1.sc * drift) - 1 / FIT0.sc || 1);   // dolly-consistent pan
    const c = [lerp(FIT0.c[0], FIT1.c[0], u), lerp(FIT0.c[1], FIT1.c[1], u)], sp = [lerp(FIT0.s[0], FIT1.s[0], u), lerp(FIT0.s[1], FIT1.s[1], u)];
    return { C: frameCam(KC, YAW, PITCH, sp[0] - sc * c[0], sp[1] - sc * c[1], 1000, 1000 * sc, { fov: 2.4 }), sc };
  }
  // the wave: a travelling ripple out from the seasoning pull-out; each drawer glides open, then home; on 序 all open at once
  function waveK(t, x, y) {
    const d = Math.hypot((x - 110) / 1000, (y - 460) / 1500), t0 = 105.25 + d * .92;
    const open = E.soft((t - t0) / .55), close = E.soft((t - t0 - .8) / .75);
    return Math.max(open * (1 - close), E.out5((t - HIT + .03) / .2));
  }
  function drawerPrims(x0, x1, y0, y1, ext, kind) {
    const P = [], w = x1 - x0 - 90, d = 470, cx = (x0 + x1) / 2, o = { iw: IW };
    if (kind === 'spice') {
      P.push(...translate3(basketModel({ w: 130, d, h: 560, gap: 40, type: 'spice', midRim: false, rimR: 12 }), [cx, y0 + 50, 40 + ext]));
      [[PROF.bottle, 0], [PROF.jar, 0], [PROF.bottle, 0], [PROF.jar, 1], [PROF.jar, 1], [PROF.jar, 1]].forEach(([pf, tier], i) => P.push(lathe([cx, y0 + 54 + tier * 290, 110 + (i % 3) * 140 + ext], tier ? pf.map(([r, y]) => [r * .8, y * .8]) : pf, o)));
    } else {
      const h = Math.min(y1 - y0 - 90, kind === 'dish' ? 190 : 150);
      P.push(...translate3(basketModel({ w, d, h, gap: 44, type: kind === 'dish' ? 'dish' : 'plain', midRim: false }), [cx, y0 + 30, 40 + ext]));
      const by = y0 + 32, bz = 40 + ext;
      if (kind === 'dish') for (let i = 0; i < 5; i++) P.push(lathe([x0 + 45 + w * .26 + 45, by + 132, bz + 90 + i * 40], PROF.plate, { axis: 'z', ...o }));
      if (kind === 'pot') { P.push(lathe([cx - w * .22, by, bz + d * .5], PROF.pot, o)); P.push(lathe([cx + w * .24, by, bz + d * .5], PROF.pot.map(([r, y]) => [r * .85, y * .9]), o)); }
      if (kind === 'bowl') for (let i = 0; i < 3; i++) P.push(lathe([cx - w * .3 + i * w * .3, by, bz + d * .5], PROF.bowl, { open: true, ...o }));
      if (kind === 'cup' || kind === 'jar') for (let i = 0; i < 4; i++) P.push(lathe([cx - w * .36 + i * w * .24, by, bz + d * (i % 2 ? .35 : .65)], kind === 'cup' ? PROF.cup : PROF.jar, { open: kind === 'cup', ...o }));
      if (kind === 'plate') for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) P.push(lathe([cx + (i ? .22 : -.22) * w, by + j * 18, bz + d * .5], PROF.plate, o));
    }
    P.push(...doorModel(x0 + 4, y0, x1 - 4, y1, FR + ext, { th: 18, iw: IW }));
    return P;
  }
  function shotAxo(t, lt) {
    paperBG();
    const { C, sc } = axoCam(t), P2 = p => { const q = C.project(p); return [q[0], q[1]]; };
    const lw = clamp(1.05 / (2.6 * 2 * sc), .22, 1); IW = 2.1 / lw;
    const R3 = prims => render3(prims, C, { style: 'ink', lw });
    // floor grid + back-wall outline (hairline pencil)
    X.save(); X.strokeStyle = PAL.ink; X.lineWidth = 1; X.globalAlpha *= .14; X.beginPath();
    for (let x = -600; x <= 4200; x += 300) { const a = P2([x, 0, 0]), b = P2([x, 0, 1800]); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); }
    for (let z = 0; z <= 1800; z += 300) { const a = P2([-600, 0, z]), b = P2([4200, 0, z]); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); }
    X.stroke(); X.globalAlpha /= .14; X.globalAlpha *= .45; X.beginPath();
    for (const [a, b] of [[[-300, 0, 0], [-300, 2500, 0]], [[3800, 2500, 0], [3800, 0, 0]], [[-300, 0, 0], [3800, 0, 0]]]) { const qa = P2(a), qb = P2(b); X.moveTo(qa[0], qa[1]); X.lineTo(qb[0], qb[1]); }
    X.stroke(); X.restore();
    // 1 · tall pantry (far end): a tall frame of tiered baskets slides out as one
    {
      const [x0, x1] = TALL, ext = 460 * waveK(t, 3120, 1100), cx = (x0 + x1) / 2, P = [];
      P.push(...boxModel(x0, 0, 0, x1, 2240, KD, { sides: 'bkrt', iw: IW }));
      for (let i = 0; i < 5; i++) {
        const y = 150 + i * 400;
        P.push(...translate3(basketModel({ w: 470, d: 460, h: 130, gap: 46, midRim: false }), [cx, y, 50 + ext]));
        for (let j = 0; j < 3; j++) P.push(lathe([cx - 150 + j * 150, y + 4, 280 + ext], i % 2 ? PROF.jar : PROF.bottle.map(([r, yy]) => [r, yy * .95]), { iw: IW }));
      }
      P.push(...boxModel(x0, 0, 0, x0 + 1, 2240, KD, { sides: 'l', iw: IW, layer: 2 }));
      P.push(...doorModel(x0 + 4, 110, x1 - 4, 2230, FR + ext, { th: 18, iw: IW }));
      R3(P);
    }
    // 2 · base units + counter, far → near (right → left): carcass, drawers, end panel, counter
    for (let u = BASE.length - 1; u >= 0; u--) {
      const [x0, x1, drs] = BASE[u], P = [];
      P.push(...boxModel(x0, 0, 0, x1, 820, KD, { sides: 'bkr', iw: IW }));
      drs.forEach(([y0, y1, kind]) => { const e = kind === 'spice' ? 1 : waveK(t, (x0 + x1) / 2, (y0 + y1) / 2); P.push(...drawerPrims(x0, x1, y0, y1, (kind === 'spice' ? 460 : 480) * e, kind)); });
      if (u === 0) P.push(...boxModel(x0, 0, 0, x0 + 1, 820, KD, { sides: 'l', iw: IW, layer: 2 }));
      P.push(...boxModel(x0 - (u === 0 ? 20 : 0), 820, -10, x1, 860, KD + 40, { sides: 'lrtf', iw: IW, layer: 2 }));
      R3(P);
    }
    // 3 · wall run (higher = nearer the camera, so after the counter); the middle niche's basket lifts down on its arms
    {
      const P = [];
      for (let i = WALL.length - 1; i >= 0; i--) {
        const [x0, x1] = WALL[i];
        P.push(...boxModel(x0, 1480, 0, x1, 2240, 360, { sides: i === 1 ? 'lrtbk' : 'lrtbk', iw: IW }));
        if (i !== 1) P.push(...doorModel(x0 + 4, 1484, x1 - 4, 2236, 378, { th: 18, iw: IW, handle: false }));
      }
      R3(P);
      const [x0, x1] = WALL[1], k = waveK(t, 1770, 1500), cx = (x0 + x1) / 2;
      const Q = [], by = lerp(1560, 1060, k), bz = lerp(24, 330, k);
      for (const sx of [-1, 1]) Q.push({ k: 'wire', pts: [[cx + sx * 305, 1900, 330], [cx + sx * 305, by + 140, bz + 270]], r: 5, tone: 0 });
      Q.push(...translate3(basketModel({ w: 590, d: 300, h: 140, gap: 44, midRim: false }), [cx, by, bz]));
      for (let j = 0; j < 3; j++) Q.push(lathe([cx - 180 + j * 180, by + 4, bz + 150], PROF.bowl, { open: true, iw: IW }));
      R3(Q);
    }
    // lyric: large, top-left, in the empty triangle above the run (a paper knockout keeps it clean while the camera travels)
    const R = lyType(33, t, { x: 118, y: 250, sizes: [86, 134], weights: [500, 900], leads: [168], dur: .45, hold: 1 });
    if (R) mono('33 /', 120, 150, { size: 15, a: E.soft((t - 105.2) / .6) });
    // the seal: 到位, stamped in orange on 序 (beat 159)
    const sk = clamp((t - HIT) / .16);
    if (sk > 0) {
      const s = lerp(1.35, 1, E.out5(sk)), x = 1700, y = 872;
      X.save(); X.translate(x, y); X.rotate(-.04); X.scale(s, s); X.globalAlpha *= clamp(sk * 2);
      rrect(-58, -58, 116, 116, 8, { fill: PAL.orange });
      stroke(() => X.roundRect(-49, -49, 98, 98, 5), 2, PAL.paper);
      text('到', 0, -6, { size: 46, font: F.serif, weight: 900, col: PAL.paper, align: 'center' });
      text('位', 0, 40, { size: 46, font: F.serif, weight: 900, col: PAL.paper, align: 'center' });
      X.restore();
      mono('APPROVED · 新秩序', x, y + 86, { size: 13, align: 'center', a: clamp(sk * 2) });
    }
    sheet(t, 5);
  }

  chapter('chorus3', T_HOOK, T_END, [[T_HOOK, shotHook], [T_WIN, shotWindow], [T_GRID, shotGrid], [T_PLAN, shotPlan], [T_ELEV, shotElev], [T_AXO, shotAxo]]);
})();
