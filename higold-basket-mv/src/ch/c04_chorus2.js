// c04_chorus2 — Chorus 2 · "Night stage" (59.0 – 73.0). The inverted night version of the chorus-1 stage:
// night ground, paper-coloured ink dancers, glow-line steel, orange stays orange. Lyrics LY[17]..LY[22].
//   S1 59.00  HOOK 一拉就到位 — V formation on a glossy night stage, outline hero type, orange 拉
//   S2 60.48  左边调料 | 右边锅 — split screen: paper/ink seasoning basket vs night/glow pot drawer, mirrored type
//   S3 62.89  轻轻一嗒 — extreme macro on the slide + damper; orange 嗒, one-beat freeze-frame
//   S4 64.42  阻尼稳稳 | 收回原位 — the drawer closes itself; the lyric rides the live soft-close curve
//   S5 65.95  满满一篮 | 也拉得动 — absurd tower of pots, tiny LAN pulls it out with one finger
//   S6 68.39  dance hit — 4-up grid, the crew all point at LAN
//   S7 69.87  关上柜门 | 一片清净 — every cabinet door swings shut; the night empties to calm paper
(() => {
  'use strict';
  const PA = PAL.paper, NI = PAL.night, OR = PAL.orange;

  // ---------- private helpers ----------
  const kick = (t, th, amt = .04, k = 9) => t >= th ? amt * Math.exp(-(t - th) * k) : 0;
  function zoomAt(px, py, z) { X.save(); X.translate(px, py); X.scale(z, z); X.translate(-px, -py); }
  // pose sequencer: keys [[time, pose], …]; snaps onto each pose with out5 (K-pop hit, then hold)
  function keyPose(t, keys, snap = .13) {
    let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
    if (i === 0) return keys[0][1];
    return lerpPose(keys[i - 1][1], keys[i][1], E.out5((t - keys[i][0]) / snap));
  }
  // night palette for 3D faces (the shared renderer only swaps PAL.paper in dark mode)
  const NMAP = { [PAL.paper]: PAL.night2, [PAL.paper2]: '#26262C', [PAL.ink2]: PAL.steel0, [PAL.steel1]: '#3B4046', '#DADDE0': '#4A5057', [PAL.shine]: '#5E656C' };
  const nightify = prims => prims.map(p => p.k === 'face' && NMAP[p.fill] ? { ...p, fill: NMAP[p.fill] } : p);
  // stage light beam (the "light glow" gradient)
  function beam(x0, y0, x1, y1, w0, w1, a) {
    if (a < .003) return;
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const g = X.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, rgba(PA, a)); g.addColorStop(.75, rgba(PA, a * .35)); g.addColorStop(1, rgba(PA, 0));
    X.save(); X.fillStyle = g; X.beginPath();
    X.moveTo(x0 + nx * w0, y0 + ny * w0); X.lineTo(x1 + nx * w1, y1 + ny * w1); X.lineTo(x1 - nx * w1, y1 - ny * w1); X.lineTo(x0 - nx * w0, y0 - ny * w0);
    X.fill(); X.restore();
  }
  function pool(x, y, rx, ry, a, col = PA) {
    if (a < .003) return;
    X.save(); X.translate(x, y); X.scale(1, ry / rx);
    const g = X.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0));
    X.fillStyle = g; X.beginPath(); X.arc(0, 0, rx, 0, TAU); X.fill(); X.restore();
  }
  // glow polyline: soft halo + bright core
  function glowPath(pts, w, col, a = 1) {
    X.save(); X.globalAlpha *= a; X.lineCap = 'round'; X.lineJoin = 'round';
    const path = () => { X.beginPath(); pts.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); };
    path(); X.strokeStyle = rgba(col, .18); X.lineWidth = w * 4; X.stroke();
    path(); X.strokeStyle = col; X.lineWidth = w; X.stroke();
    X.restore();
  }
  // viewfinder corner brackets
  function brackets(x, y, w, h, l, col, lw = 3, a = 1) {
    X.save(); X.globalAlpha *= a; X.strokeStyle = col; X.lineWidth = lw; X.beginPath();
    for (const [px, py, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x + w, y + h, -1, -1], [x, y + h, 1, -1]]) { X.moveTo(px + dx * l, py); X.lineTo(px, py); X.lineTo(px, py + dy * l); }
    X.stroke(); X.restore();
  }
  const mono = (s, x, y, o = {}) => text(s, x, y, { size: o.size ?? 20, font: F.mono, weight: o.weight ?? 600, col: o.col ?? PA, align: o.align, track: o.track ?? 1.5, a: o.a });

  // ======================================================================================================
  // S1 · HOOK 一拉就到位 — V formation, outline type, orange 拉
  // ======================================================================================================
  const V5 = [   // LAN at the apex (front), the crew fanning back and out
    { who: 'pony', x: -700, y: 822, s: 25.5, r: 2 },
    { who: 'buns', x: -365, y: 900, s: 31, r: 1 },
    { who: 'lan', x: 0, y: 995, s: 40, r: 0 },
    { who: 'long', x: 365, y: 900, s: 31, r: 1 },
    { who: 'kit', x: 700, y: 822, s: 25.5, r: 2 },
  ];
  const L17 = LY[17].t;   // 一 拉 就 到 位
  const HOOK_KEYS = [[-1e9, KP.ready], [L17[0], KP.reach], [L17[1], KP.yank], [L17[2], mirrorPose(KP.reach)],
    [L17[3], lerpPose(mirrorPose(KP.reach), pose({ ...mirrorPose(KP.reach), sL: 1.6, lean: .14 }), 1)], [L17[4], mirrorPose(KP.yank)]];

  // outline hero type with an orange solid on the hook char; per-char slam + expanding echo outline
  function heroOutline(i, t, o) {
    const env = lyEnv(i, t, .15, .2); if (env <= 0) return; LYRIC_DRAWN.add(i);
    const rows = lyRows(i), size = o.size, font = F.heavy, wt = 900, track = o.track ?? -size * .03;
    rows.forEach((row, r) => {
      const ws = row.map(c => measure(c.ch, size, font, wt) + track), tw = ws.reduce((a, b) => a + b, 0) - track;
      let x = o.x - tw / 2; const y = o.y + r * size * 1.1;
      row.forEach((c, j) => {
        const k = chK(c.ti, t, .16), hot = (o.hi || '').includes(c.ch), cx = x + (ws[j] - track) / 2, cy = y - size * .38;
        if (k <= 0) text(c.ch, x, y, { size, font, weight: wt, col: null, stroke: rgba(PA, .08 * env), sw: 3 });
        else {
          const s = lerp(1.45, 1, E.out5(k)), a = clamp(k * 4) * env, age = t - c.ti;
          if (age > 0 && age < .45) {       // echo outline flies outward
            const es = 1 + E.out(age / .45) * .2;
            X.save(); X.translate(cx, cy); X.scale(es, es); X.translate(-cx, -cy);
            text(c.ch, x, y, { size, font, weight: wt, col: null, stroke: hot ? OR : PA, sw: 4, a: (1 - age / .45) * .45 * env });
            X.restore();
          }
          X.save(); X.translate(cx, cy); X.scale(s, s); X.translate(-cx, -cy);
          // every char gets the offset (misregistered) outline; 拉 is solid orange, the rest slam in solid paper and relax to a
          // half-lit body inside a bright outline, so a lone 一 still reads as a glyph and the finished line lands firm
          text(c.ch, x + size * .045, y + size * .045, { size, font, weight: wt, col: null, stroke: hot ? PA : rgba(PA, .55), sw: 5, a });
          if (hot) text(c.ch, x, y, { size, font, weight: wt, col: OR, a });
          else { const body = lerp(1, .55, E.out(clamp((age - .08) / .4)));
            text(c.ch, x, y, { size, font, weight: wt, col: rgba(PA, body), stroke: PA, sw: o.sw ?? 7, a }); }
          X.restore();
        }
        x += ws[j];
      });
    });
  }

  function shotHook(t, lt, dur) {
    paperBG(NI); DARK = true;
    const on = E.out((t - L17[0] + .05) / .25);                                   // lights hit on 一
    const z = 1 + .035 * clamp((t - 58.84) / 1.7) + kick(t, L17[1], .04) + kick(t, L17[4], .03);
    const gy = 590;                                                                 // stage horizon
    zoomAt(CX, 700, z);
    // back wall: an LED dot-matrix panel that brightens with the lights, a scanline sweeping down it
    dotGrid(-100, 60, W + 200, gy - 80, 22, 2.2, PA, (.05 + .05 * on) * (1 + .6 * pulse(t, 5) * on));
    { const sy = 60 + frac((t - 58.8) / 1.36) * (gy - 80); rect(-100, sy, W + 200, 3, PA, .1 * on); }
    line(-200, 60, W + 200, 60, 1.5, PA, .12);
    // beams onto the V
    V5.forEach((m, i) => {
      const flare = m.who === 'lan' ? kick(t, L17[1], .1, 5) + kick(t, L17[4], .08, 5) : 0;
      const sw = Math.sin(t * 1.7 + i * 1.3) * 60 * (m.who === 'lan' ? .3 : 1);
      beam(CX + m.x * .45 + sw, -60, CX + m.x, m.y - 40, 16, m.who === 'lan' ? 190 : 130, (m.who === 'lan' ? .16 : .09) * on + flare);
    });
    // floor: glossy stage, perspective seams drifting toward camera
    rect(-200, gy, W + 400, H - gy + 300, '#141417');
    X.save(); X.strokeStyle = PA; X.lineWidth = 1.2; X.globalAlpha = .07; X.beginPath();
    for (let i = -12; i <= 12; i++) { X.moveTo(CX + i * 60, gy); X.lineTo(CX + i * 330, H + 200); }
    const sc = frac(t * .6);
    for (let j = 0; j < 9; j++) { const zz = 1 + j + (1 - sc); const y = gy + 540 / zz; if (y < H + 200) { X.moveTo(-200, y); X.lineTo(W + 200, y); } }
    X.stroke(); X.restore();
    line(-200, gy, W + 200, gy, 2, PA, .35);
    // hero type on the back wall
    heroOutline(17, t, { x: CX, y: 440, size: 272, hi: '拉' });
    // V spike line on the floor, drawn from the apex outward on 拉
    const vp = V5.map(m => [CX + m.x, m.y + 6]), apex = vp[2];
    X.save(); X.setLineDash([6, 16]); X.strokeStyle = rgba(PA, .25); X.lineWidth = 2; X.beginPath(); vp.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke(); X.restore();
    const vk = E.out((t - L17[1]) / .4);
    if (vk > 0) for (const side of [0, 4]) { const far = vp[side], mid = vp[side === 0 ? 1 : 3];
      const pts = [apex, [lerp(apex[0], mid[0], clamp(vk * 2)), lerp(apex[1], mid[1], clamp(vk * 2))]];
      if (vk > .5) pts.push([lerp(mid[0], far[0], (vk - .5) * 2), lerp(mid[1], far[1], (vk - .5) * 2)]);
      glowPath(pts, 3.5, OR, .9); }
    // floor pools
    V5.forEach(m => pool(CX + m.x, m.y + 4, m.s * 4.2, m.s * .9, (m.who === 'lan' ? .2 : .12) * on));
    // dancers + glossy reflections
    V5.forEach((m, i) => {
      const P = keyPose(t - .035 * m.r, HOOK_KEYS);          // the hit ripples out from the apex
      const bob = t < L17[0] ? { ...P, dy: -.18 * Math.abs(Math.sin(bp(t) * Math.PI)) } : P;
      const o = { who: m.who, col: PA, dark: true, seed: i * 3 + 1, face: m.who === 'lan' ? (t > L17[1] ? 'happy' : 'smile') : 'dot', blush: m.who === 'lan' ? 1 : 0 };
      X.save(); X.translate(0, 2 * m.y + 8); X.scale(1, -1); figure(CX + m.x, m.y, m.s, bob, { ...o, a: .1, shadow: false }); X.restore();
      const f = figure(CX + m.x, m.y, m.s, bob, o);
      // pull streaks: the yank arm drags light lines back toward the hip on 拉 and 位
      for (const [th, side] of [[L17[1], 1], [L17[4], -1]]) {
        const a = t - th - .035 * m.r; if (a < 0 || a > .24) continue;
        const hnd = side > 0 ? f.handR : f.handL, q = 1 - a / .24;
        for (let k = 0; k < 3; k++) line(hnd[0] + side * m.s * (.6 + k * .15), hnd[1] - m.s * .5 + k * m.s * .5, hnd[0] + side * m.s * (2.6 + 1.6 * q), hnd[1] - m.s * .5 + k * m.s * .5, 2.5, k === 1 && m.who === 'lan' ? OR : PA, .8 * q);
      }
    });
    camEnd();
    metaStrip(t, { col: PA, a: .55, tl: 'CHORUS 02  ·  NIGHT STAGE', br: 'FORMATION  V  ·  拉' });
  }

  // ======================================================================================================
  // S2 · 左边调料 | 右边锅 — the split: paper/ink vs night/glow, mirrored about the centre seam
  // ======================================================================================================
  const L18 = LY[18].t;
  function lySplit(i, t, o) {
    const env = lyEnv(i, t, .2); if (env <= 0) return; LYRIC_DRAWN.add(i);
    const rows = lyRows(i), size = o.size, font = F.heavy, wt = 900;
    rows.forEach((row, r) => {
      if (o.only != null && r !== o.only) return;
      const ws = row.map(c => measure(c.ch, size, font, wt)), tw = ws.reduce((a, b) => a + b, 0);
      const left = r === 0, col = left ? PAL.ink : PA;
      let x = left ? o.cx - o.gap - tw : o.cx + o.gap; const y = o.y;
      row.forEach((c, j) => {
        const k = chK(c.ti, t, .2);
        if (k > 0) {
          const dy = (1 - E.out5(k)) * size * .4;
          X.save(); X.beginPath(); X.rect(x - 6, y - size * 1.02, ws[j] + 12, size * 1.3); X.clip();
          text(c.ch, x, y + dy, { size, font, weight: wt, col, a: env });
          X.restore();
        }
        x += ws[j];
      });
    });
  }
  function potDrawer(ext, lid) {
    const w = 600, d = 460, h = 170, y0 = 50, P = [];
    P.push(...boxModel(-340, -20, -20, 340, 400, 470, { sides: 'lrbk', fill: PAL.paper }));
    P.push(...translate3(basketModel({ w, d, h, type: 'plain', gap: 30 }), [0, y0, ext]));
    P.push(...slideModel(-w / 2 - 14, y0 + h * .55, d, ext), ...slideModel(w / 2 + 14, y0 + h * .55, d, ext));
    P.push(lathe([-105, y0 + 4, 235 + ext], PROF.pot));
    P.push(lathe([-105, y0 + 128 + lid, 235 + ext], PROF.lid));
    P.push(lathe([170, y0 + 4, 130 + ext], PROF.pot.map(([r, y]) => [r * .6, y * .75]), { open: true }));
    P.push(lathe([170, y0 + 4, 340 + ext], PROF.bowl, { open: true }));
    P.push(...doorModel(-w / 2 - 36, y0 - 50, w / 2 + 36, y0 + h + 110, d + 20 + ext));
    return nightify(P);
  }
  function shotSplit(t, lt, dur) {
    paperBG(NI); DARK = true;
    const kp = E.soft((t - 60.36) / .45), edge = 960 * kp;
    // ---- right half: night, pot drawer (glow) ----
    const extR = 330 * E.soft((t - L18[4]) / .9), lk = clamp((t - L18[6] + .04) / .36), lid = 90 * Math.max(0, Math.sin(lk * Math.PI)) * (1 - lk * .3);
    const CR = frameCam([0, 150, 230 + extR * .5], -.72 - .06 * clamp(lt / 2.4), .5, 1450, 700, 760, 700, { fov: 28 });
    X.save(); X.beginPath(); X.rect(edge, 0, W - edge, H); X.clip();
    pool(1450, 800, 520, 170, .06);
    render3(potDrawer(extR, lid), CR, { style: 'glow', dark: true });
    // steam puffs out from under the lid knob on 锅 (the lid clacks up and drops back)
    const sa = t - L18[6] + .04;
    if (sa > 0 && sa < .7) { const [kx, ky] = pin(CR, [-105, 50 + 128 + lid + 44, 235 + extR]), q = sa / .7;
      for (let k = -1; k <= 1; k++) { const pts = []; for (let u = 0; u <= 6; u++) { const f = u / 6; pts.push([kx + k * 34 + Math.sin(f * 5 + k * 2 + sa * 9) * 9 * f + k * 16 * f, ky - 18 - f * (40 + 45 * E.out(q))]); }
        inkStroke(pts, { w: 5, col: PA, taper: [.3, .5], wob: .6, seed: 700 + k, a: .85 * (1 - q) }); } }
    mono('R', 1020, 150, { size: 22 }); mono('碗碟拉篮 · 锅', 1060, 150, { size: 22, a: .7 });
    X.restore();
    // ---- left half: paper panel pulled in from the left edge like a drawer front ----
    const extL = 360 * E.soft((t - L18[2]) / .9);
    X.save(); X.beginPath(); X.rect(0, 0, edge, H); X.clip(); X.translate(edge - 960, 0);
    rect(-10, 0, 980, H, PA);
    gridPaper({ gap: 48, a: .05 });
    const CL = frameCam([0, 300, 250 + extL * .5], .78 + .06 * clamp(lt / 2.4), .3, 500, 700, 900, 700, { fov: 28 });
    const LP = [...boxModel(-110, -20, -20, 110, 640, 470, { sides: 'lrbk', fill: PAL.paper, sideFill: PAL.paper2, backFill: PAL.paper2 }),
      ...spiceDrawer(extL).map(q => q.k === 'lathe' ? { ...q, band: false } : q)];
    render3(LP, CL, { style: 'ink', lw: 1.1 });
    mono('L', 918, 150, { size: 22, col: PAL.ink, align: 'right' }); mono('调味拉篮 ·', 880, 150, { size: 22, col: PAL.ink, align: 'right', a: .7 });
    X.restore();
    // mirrored lyric across the seam (drawn unclipped so the left row rides the panel)
    X.save(); X.beginPath(); X.rect(0, 0, edge, H); X.clip();
    X.translate(edge - 960, 0); lySplit(18, t, { cx: 960, gap: 56, y: 330, size: 150, only: 0 });
    X.restore();
    X.save(); X.beginPath(); X.rect(edge, 0, W - edge, H); X.clip(); lySplit(18, t, { cx: 960, gap: 56, y: 330, size: 150, only: 1 }); X.restore();
    // the steel seam
    if (kp > .002) { rect(edge - 5, 0, 10, H, PAL.ink); rect(edge - 1.5, 0, 3, H, PAL.steel2); }
    // orange registration dot on the seam, pulses on beats
    circle(edge, 330 - 52, 9 + 5 * pulse(t, 7), { fill: OR });
  }

  // ======================================================================================================
  // S3 · 轻轻一嗒 — extreme macro on the slide; the damper catches; 嗒; one-beat freeze-frame
  // ======================================================================================================
  const L19 = LY[19].t, TDA = L19[3];         // 嗒 at 63.77
  function steelGrad(y0, y1, cols) { const g = X.createLinearGradient(0, y0, 0, y1); cols.forEach((c, i) => g.addColorStop(i / (cols.length - 1), c)); return g; }
  function drawRail(xi, tt) {
    const cy = 640;
    // outer member (fixed): C-channel web + lips
    X.save();
    X.fillStyle = steelGrad(500, 780, ['#2A2D31', '#15161A', '#1E2024', '#33373C']); X.fillRect(-600, 500, 3400, 280);
    X.strokeStyle = PAL.steel1; X.lineWidth = 3; X.strokeRect(-600, 500, 3400, 280);
    line(-600, 512, 2800, 512, 4, PAL.steel2, .8); line(-600, 768, 2800, 768, 3, PAL.steel0, .9);
    // mounting slots on the outer web
    for (let x = -300; x < 2700; x += 330) { rrect(x, 520, 90, 18, 9, { fill: '#0A0A0C', stroke: PAL.steel0, w: 2 }); if (x + 180 < 440 || x + 120 > 1500) rrect(x + 120, 742, 60, 16, 8, { fill: '#0A0A0C', stroke: PAL.steel0, w: 2 }); }
    // ball cages (move at half the inner member speed)
    const cage = 330 + (xi - 470) * .5;
    for (const by of [556, 724]) {
      rrect(cage - 30, by - 20, 900, 40, 20, { fill: '#101114', stroke: PAL.steel0, w: 2 });
      for (let k = 0; k < 20; k++) { const bx = cage + k * 44; circle(bx, by, 14, { fill: '#8A9299' }); circle(bx, by, 14, { stroke: '#0A0A0C', w: 2 }); circle(bx - 4, by - 5, 4.5, { fill: PAL.shine, a: .9 }); }
    }
    // damper (fixed at the left end): cylinder + rod + catch
    const tip = Math.min(540, xi + 70), rodL = tip - 420;
    X.fillStyle = steelGrad(596, 684, ['#6C747B', '#C7CCD1', '#8A9299', '#3B4046']); X.beginPath(); X.roundRect(40, 596, 380, 88, 44); X.fill();
    X.strokeStyle = PAL.ink; X.lineWidth = 3; X.stroke();
    for (let k = 0; k < 6; k++) line(80 + k * 26, 604, 80 + k * 26, 676, 2, PAL.steel0, .6);
    X.fillStyle = steelGrad(628, 652, ['#FFFFFF', '#A8AFB5']); X.fillRect(420, 628, rodL, 24); X.strokeStyle = PAL.ink; X.lineWidth = 2; X.strokeRect(420, 628, rodL, 24);
    X.fillStyle = steelGrad(606, 674, ['#DADDE0', '#6C747B']); X.beginPath(); X.roundRect(tip - 14, 606, 34, 68, 8); X.fill(); X.stroke();
    // inner member (the moving part, brighter steel) with its catch notch
    X.fillStyle = steelGrad(580, 700, ['#E6E9EC', '#9AA2A9', '#C7CCD1', '#6C747B']);
    X.beginPath(); X.moveTo(xi + 90, 580); X.lineTo(xi + 3000, 580); X.lineTo(xi + 3000, 700); X.lineTo(xi + 90, 700); X.lineTo(xi + 90, 676); X.lineTo(xi, 676); X.lineTo(xi, 604); X.lineTo(xi + 90, 604); X.closePath(); X.fill();
    X.strokeStyle = PAL.ink; X.lineWidth = 3; X.stroke();
    line(xi + 90, 588, xi + 3000, 588, 3, PAL.shine, .85);
    for (let x = xi + 260; x < xi + 3000; x += 380) rrect(x, 622, 150, 36, 18, { fill: '#15161A', stroke: PAL.ink, w: 2 });
    // moving specular sweep across the inner member
    const sx = xi + 400 + tt * 900;
    const g = X.createLinearGradient(sx - 120, 0, sx + 120, 0); g.addColorStop(0, rgba(PAL.shine, 0)); g.addColorStop(.5, rgba(PAL.shine, .35)); g.addColorStop(1, rgba(PAL.shine, 0));
    X.fillStyle = g; X.fillRect(sx - 120, 580, 240, 120);
    // stamped legend on the outer web
    text('SOFT-CLOSE  ·  阻尼缓冲  ·  FULL EXTENSION  →', 460, 762, { size: 17, font: F.mono, weight: 600, col: PAL.steel1, a: .75, track: 3 });
    X.restore();
    return tip;
  }
  function shotMacro(t, lt, dur) {
    paperBG(NI); DARK = true;
    const tf = Math.min(t, TDA), k = clamp((tf - 62.86) / (TDA - 62.86));
    const pos = lerp(E.out(k), k, .22), xi = lerp(1650, 470, pos);
    const frz = t >= TDA, fk = frz ? E.out5((t - TDA) / .07) : 0;
    const camx = lerp(900, 640, E.io(k)), z = lerp(1.25, 1.42, E.io(k)) + .06 * fk;
    // macro camera: slight tilt, tracks the catch
    X.save(); X.translate(CX + 120, CY + 60); X.rotate(-.07); X.scale(z, z); X.translate(-camx, -640);
    const tip = drawRail(xi, tf - 62.86);
    X.restore();
    // out-of-focus glints behind the rail — drift with the move, then freeze
    for (let i = 0; i < 8; i++) { const bx = ((hash(i * 3.1) * W + (tf - 62.9) * -160 * (1 + hash(i))) % W + W) % W, by = hash(i * 7.7) * 330 + 30;
      pool(bx, by, 40 + hash(i * 1.9) * 70, 40 + hash(i * 1.9) * 70, .07); }
    // screen position of the contact point (damper tip) through the same camera
    const cxw = (tip - camx) * z, cyw = 0, ca = Math.cos(-.07), sa = Math.sin(-.07), hitX = CX + 120 + cxw * ca - cyw * sa, hitY = CY + 60 + cxw * sa + cyw * ca;
    // lyric: 轻 轻 一 small serif, then the giant orange 嗒
    const env = lyEnv(19, t, .25); if (env > 0) {
      LYRIC_DRAWN.add(19);
      const rows = lyRows(19)[0];
      rows.slice(0, 3).forEach((c, j) => { const kk = chK(c.ti, t, .2); if (kk <= 0) return;
        text(c.ch, 130 + j * 138, 250 + (1 - E.out5(kk)) * -40, { size: 128, font: F.serif, weight: 900, col: PA, a: clamp(kk * 3) * env }); });
      const kd = chK(rows[3].ti, t, .12);
      if (kd > 0) {
        const s = lerp(1.6, 1, E.out5(kd)), jx = frz ? jit(3, 2.2) : 0, jy = frz ? jit(4, 2.2) : 0;
        // impact marks radiating from the contact point
        const ck = E.out((t - TDA) / .12);
        for (let q = 0; q < 9; q++) { const a = -2.75 + q * .3, r0 = 70, r1 = 70 + (q % 2 ? 70 : 120) * ck;
          line(hitX + Math.cos(a) * r0, hitY + Math.sin(a) * r0, hitX + Math.cos(a) * r1, hitY + Math.sin(a) * r1, q % 2 ? 3 : 5, q % 2 ? PA : OR, .95 * ck); }
        X.save(); X.translate(hitX + 40 + jx, 300 + jy); X.scale(s, s); X.rotate(-.08);
        marker('嗒', 0, 0, { size: 460, col: OR, align: 'center' }); X.restore();
      }
    }
    // freeze-frame UI
    if (frz) {
      brackets(60, 60, W - 120, H - 120, 70, PA, 3, .9);
      rect(W - 190, 88, 14, 44, PA); rect(W - 166, 88, 14, 44, PA);
      mono('FREEZE', W - 206, 122, { size: 24, align: 'right' });
      mono('01:' + (TDA - 60).toFixed(2).padStart(5, '0') + '  ·  嗒', W - 90, H - 86, { size: 20, align: 'right', a: .75 });
      line(90, H - 94, 90 + (W - 180) * clamp((t - TDA) / (BEAT)), H - 94, 3, OR, .9);
    } else {
      mono('MACRO  ·  DAMPER', 90, H - 86, { size: 20, a: .6 });
      mono('● REC', W - 90, 110, { size: 22, align: 'right', a: .5 + .5 * (Math.floor(t * 4) % 2) });
    }
  }

  // ======================================================================================================
  // S4 · 阻尼稳稳 | 收回原位 — the drawer glides home; the lyric rides the live soft-close curve
  // ======================================================================================================
  const L20 = LY[20].t, G = { x0: 150, step: 116, top: 350, bot: 760 }, TK0 = L20[0], TKD = 8 * .1705;
  const curveY = u => lerp(G.top, G.bot, E.soft(u));
  function shotClose(t, lt, dur) {
    paperBG(NI); DARK = true;
    const k = clamp((t - TK0) / TKD), ext = 420 * (1 - E.soft(k));
    // right: the drawer (glow) closing on its own
    const C = frameCam([0, 150, 230 + 210], .66 - .1 * clamp(lt / 1.6), .46, 1500, 650, 760, 640, { fov: 28 });
    const prims = nightify([...boxModel(-330, -20, -20, 330, 400, 460, { sides: 'lrbk', fill: PAL.paper }), ...boxModel(-350, 400, -20, 350, 430, 490, { sides: 'lrtf', fill: PAL.paper }), ...dishDrawer(ext)]);
    pool(1480, 880, 560, 150, .05);
    render3(prims, C, { style: 'glow', dark: true });
    // graph frame
    const gx1 = G.x0 + 8 * G.step, ga = E.out((t - 64.40) / .3);
    X.save(); X.globalAlpha *= ga;
    line(G.x0 - 30, G.top - 70, G.x0 - 30, G.bot + 40, 2, PA, .5); line(G.x0 - 30, G.bot + 40, gx1 + 40, G.bot + 40, 2, PA, .5);
    X.save(); X.setLineDash([4, 10]); line(G.x0 - 30, G.top, gx1 + 20, G.top, 1.5, PA, .25); line(G.x0 - 30, G.bot, gx1 + 20, G.bot, 1.5, PA, .25); X.restore();
    mono('OPEN', G.x0 - 44, G.top + 7, { size: 18, align: 'right', a: .7 }); mono('HOME', G.x0 - 44, G.bot + 7, { size: 18, align: 'right', a: .7 });
    mono('SOFT-CLOSE  ·  阻尼缓冲  ·  静音', G.x0 - 30, G.top - 96, { size: 22 });
    mono('t →', gx1 + 40, G.bot + 78, { size: 18, align: 'right', a: .6 });
    for (let j = 0; j <= 8; j++) line(G.x0 + j * G.step, G.bot + 40, G.x0 + j * G.step, G.bot + 50, 2, PA, .5);
    X.restore();
    // ghost of the full curve + the live trace
    const n = 80, ghost = [], live = [];
    for (let q = 0; q <= n; q++) { const u = q / n, p = [G.x0 + u * 8 * G.step, curveY(u)]; ghost.push(p); if (u <= k) live.push(p); }
    X.save(); X.setLineDash([3, 9]); glowPath(ghost, 1.5, PA, .3 * ga); X.restore();
    if (live.length > 1) glowPath(live, 4, PA, .95);
    const dx = G.x0 + k * 8 * G.step, dy = curveY(k);
    line(dx, dy, dx, G.bot + 40, 1.5, OR, .5 * ga);
    circle(dx, dy, 11, { fill: OR, a: ga }); circle(dx, dy, 20 + 8 * pulse(t, 6), { stroke: OR, w: 2, a: .5 * ga });
    // lyric: each char drops onto the curve as the trace passes it
    const env = lyEnv(20, t, .2);
    if (env > 0) {
      LYRIC_DRAWN.add(20);
      const chars = lyRows(20).flat(), size = 104;
      chars.forEach((c, j) => {
        const kk = chK(c.ti, t, .18); if (kk <= 0) return;
        const u = (j + .5) / 8, x = G.x0 + j * G.step + (G.step - size) / 2, y = Math.min(curveY(u), curveY(Math.min(1, (j + 1) / 8))) - 18;
        text(c.ch, x, y - (1 - E.out5(kk)) * 50, { size, font: F.smiley, col: PA, a: clamp(kk * 3) * env });
      });
    }
    if (k >= 1) { const hk = E.back(clamp((t - TK0 - TKD) / .2)); sticker(gx1 - 40, G.bot + 118, '收好 ✓', { size: 26, k: hk, rot: -.04 }); }
    mono('21 / 阻尼', 90, 110, { size: 18, a: .5 });
  }

  // ======================================================================================================
  // S5 · 满满一篮 | 也拉得动 — the comic strength test (scale contrast, no numbers)
  // ======================================================================================================
  const L21 = LY[21].t, TPULL = L21[5];   // 拉
  const TOWER = (() => {
    // bottom → top: a precarious comedy stack (pot on a lid on a pot…). Drops cascade on 16ths through 满满一篮.
    const G = 1.4, spec = [[PROF.pot, 1.12], [PROF.lid, 1.0], [PROF.pot, .95, 1, 10, -6], [PROF.bowl, 1.35, .5], [PROF.bowl, 1.25, .5, -6], [PROF.bowl, 1.15, 1, 4],
      [PROF.plate, 1.0, 1, -8], [PROF.plate, .96, 1, 6], [PROF.plate, .92, 1, -4], [PROF.plate, .88, 1, 8], [PROF.pot, .72, 1, -12, 8], [PROF.lid, .72, 1, -12, 8],
      [PROF.bowl, .95, .5, 6], [PROF.jar, 1, 1, 2, -4], [PROF.cup, .9, 1, -6, 0, true], [PROF.bottle, .75, 1, 4, 2]];
    let y = 0; const T0 = spec.map(([prof, sc, nest = 1, dx = 0, dz = 0, open = false], i) => {
      const k = sc * G, it = { prof: prof.map(([r, yy]) => [r * k, yy * k]), y, dx: dx * G, dz: dz * G, open, drop: 65.97 + i * .077 };
      y += prof[prof.length - 1][1] * k * nest; return it;
    });
    T0.H = y; return T0;
  })();
  function shotLoad(t, lt, dur) {
    paperBG(NI); DARK = true;
    const pk = E.soft((t - TPULL) / 1.1), ext = 380 * pk;
    const bw = 620, bd = 460, y0 = 40, bz = 230;
    // sway: little springs after each landing, a bigger one from the pull (it wobbles, it never falls)
    let sway = 0;
    for (const it of TOWER) { const a = t - it.drop; if (a > 0) sway += .01 * Math.exp(-a * 4) * Math.sin(a * 15); }
    { const a = t - TPULL; if (a > 0) sway += -.06 * Math.exp(-a * 2.4) * Math.sin(a * 8.5); }
    const P = [];
    P.push(...boxModel(-350, -10, -20, 350, 330, 480, { sides: 'lrbk', fill: PAL.paper }));
    P.push(...translate3(basketModel({ w: bw, d: bd, h: 160, type: 'plain', gap: 30 }), [0, y0, ext]));
    P.push(...slideModel(-bw / 2 - 14, y0 + 80, bd, ext), ...slideModel(bw / 2 + 14, y0 + 80, bd, ext));
    P.push(...doorModel(-350, 0, 350, 250, bd + 20 + ext));
    // side fillers so the basket reads "full"
    P.push(lathe([210, y0 + 4, 110 + ext], PROF.jar), lathe([215, y0 + 4, 300 + ext], PROF.bottle.map(([r, y]) => [r * .9, y * .9])), lathe([-225, y0 + 4, 390 + ext], PROF.cup, { open: true }),
      lathe([-230, y0 + 4, 90 + ext], PROF.jar.map(([r, y]) => [r * .9, y * 1.1])), lathe([150, y0 + 4, 400 + ext], PROF.bowl, { open: true }));
    let tower = [];
    for (const it of TOWER) {
      const a = t - it.drop; if (a < -.2) continue;
      const fall = a < 0 ? 1100 * (a / -.2) ** 2 : 0;
      tower.push(lathe([it.dx, y0 + 6 + it.y + fall, bz + it.dz + ext], it.prof, { open: it.open }));
    }
    tower = rotateX3(tower, sway, [0, y0, bz + ext]);
    P.push(...tower);
    const C = frameCam([0, 720, 260], -.5, .1, 1170, 520 - 10 * clamp(lt / 2.4), 1880 - 70 * clamp(lt / 2.4), 1030, { fov: 30 });
    pool(1170, 935, 660, 120, .07);
    render3(nightify(P), C, { style: 'glow', dark: true });
    // LAN at the handle, one finger hooked
    const hx = 150, hz = bd + 20 + ext + 4;
    const hand = pin(C, [hx, 210, hz]), foot = pin(C, [hx + 120, 0, hz + 170]);
    const s = clamp((foot[1] - hand[1]) / 7.1, 8, 30);
    const moving = clamp((t - TPULL) / .2) * (1 - clamp((t - TPULL - .7) / .3));
    const reachL = mirrorPose(KP.reach), look = pose({ ...KP.hips, head: -.3, lean: .05 });
    let Pz = t < L21[4] ? look : t < TPULL ? lerpPose(look, pose({ ...reachL, head: .15 }), E.out5((t - L21[4]) / .15)) : lerpPose(pose({ ...reachL, head: .15 }), pose({ ...reachL, lean: .12, sL: 1.5, head: -.1 }), E.out5((t - TPULL) / .15));
    if (moving > 0) { const st = move('step', t * 2.2); Pz = { ...Pz, hL: lerp(Pz.hL, st.hL, moving), kL: lerp(Pz.kL, st.kL, moving), hR: lerp(Pz.hR, st.hR, moving), kR: lerp(Pz.kR, st.kR, moving) }; }
    const TUP = 68.03, up = E.out5((t - TUP) / .14);
    if (up > 0) Pz = lerpPose(Pz, pose({ ...KP.thumb, lean: -.04, head: .12 }), up);
    const lx = hand[0] + 3.25 * s, face = t < TPULL ? (t < L21[4] ? 'o' : 'dot') : 'happy';
    figure(lx, foot[1], s, Pz, { who: 'lan', col: PA, dark: true, face, blush: t > TPULL + .3 ? 1 : 0, seed: 7 });
    // the one finger: a small orange hook ring at the contact
    if (t > L21[4] && t < TUP) { const rk = E.back(clamp((t - L21[4]) / .2)); circle(hand[0], hand[1], 6 * rk, { stroke: OR, w: 3 }); circle(hand[0], hand[1], (14 + 34 * E.out(clamp((t - TPULL) / .5))) * rk, { stroke: OR, w: 2, a: .7 * (1 - clamp((t - TPULL) / .5)) }); }
    // glide streaks off the drawer front while it moves
    if (moving > .05) for (let q = 0; q < 3; q++) { const a = pin(C, [-340, 40 + q * 85, bd + 20 + ext]); line(a[0] - 16, a[1], a[0] - 16 - 150 * moving, a[1] - 40 * moving, 3, PA, .4 * moving); }
    // lyric: 满满一篮 stacks down a column (items dropping in); 也拉得动 pulls out along the floor like a drawer
    lyStackPull(21, t);
  }
  function lyStackPull(i, t) {
    const env = lyEnv(i, t, .25); if (env <= 0) return; LYRIC_DRAWN.add(i);
    const [col, row] = lyRows(i), size = 142, x0 = 120, y0 = 190;
    X.save(); X.globalAlpha *= env;
    col.forEach((c, j) => {
      const k = chK(c.ti, t, .22); if (k <= 0) return;
      const fall = (1 - E.out5(k)) * -260, land = t - c.ti, sq = land > 0 && land < .2 ? 1 + .08 * Math.sin(land / .2 * Math.PI) : 1;
      X.save(); X.translate(x0 + size / 2, y0 + (j + 1) * size * 1.02); X.scale(sq, 1 / sq);
      text(c.ch, 0, fall, { size, font: F.heavy, weight: 900, col: PA, align: 'center', a: clamp(k * 3) });
      X.restore();
    });
    const pk = E.soft((t - row[0].ti + .04) / .7), ry = y0 + 5 * size * 1.02 + 40;
    X.save(); X.beginPath(); X.rect(x0 - 10, ry - size, pk > 0 ? 20 + 4 * size * pk : 0, size * 1.3); X.clip();
    let x = x0;
    row.forEach((c, j) => {
      const k = chK(c.ti, t, .16), w = measure(c.ch, size, F.heavy, 900);
      if (k > 0) text(c.ch, x, ry, { size, font: F.heavy, weight: 900, col: c.ch === '拉' ? OR : PA, a: clamp(k * 3) });
      else text(c.ch, x, ry, { size, font: F.heavy, weight: 900, col: null, stroke: rgba(PA, .18), sw: 2 });
      x += w;
    });
    X.restore();
    if (pk > .01) line(x0, ry + 30, x0 + 4 * size * pk, ry + 30, 4, PA, .8);
    X.restore();
  }

  // ======================================================================================================
  // S6 · dance hit — 4-up grid, the crew all point at LAN in the centre medallion
  // ======================================================================================================
  const CELLS = [
    { who: 'pony', cx: 480, cy: 270, s: 36, gy: 505, dir: 1, down: true, tone: PAL.night },
    { who: 'buns', cx: 1440, cy: 270, s: 60, gy: 705, dir: -1, down: true, tone: PAL.night2 },
    { who: 'long', cx: 480, cy: 810, s: 60, gy: 1245, dir: 1, down: false, tone: PAL.night2 },
    { who: 'kit', cx: 1440, cy: 810, s: 36, gy: 1045, dir: -1, down: false, tone: PAL.night },
  ];
  function shotGrid(t, lt, dur) {
    paperBG(NI); DARK = true;
    const b0 = 68.39, b1 = beatT(101), b2 = beatT(102);
    const aim = [];
    CELLS.forEach((c, i) => {
      const x = c.cx - 480, y = c.cy - 270;
      X.save(); X.beginPath(); X.rect(x, y, 960, 540); X.clip();
      rect(x, y, 960, 540, c.tone);
      // giant outline name behind the member, sliding the opposite way to the push
      text(c.who.toUpperCase(), c.cx - c.dir * (40 + lt * 60), c.cy + 150, { size: 380, font: F.anton, col: null, stroke: rgba(PA, .13), sw: 2.5, align: 'center', track: 6 });
      const dz = 1.03 + .05 * clamp(lt / 1.6) * (i % 2 ? 1 : -1) + kick(t, b1, .03) + kick(t, b2, .03);
      zoomAt(c.cx, c.cy, dz);
      beam(c.cx + c.dir * 160, y - 40, c.cx, c.gy - 60, 12, 190, .085);
      if (c.gy < y + 540) { line(x, c.gy + 2, x + 960, c.gy + 2, 2, PA, .3); pool(c.cx, c.gy + 2, 150, 22, .15); }
      // choreography: point at LAN, arms up, point at LAN again
      const toLan = c.down ? KP.pointDown : KP.point, fx = c.dir < 0;
      const A = fx ? mirrorPose(toLan) : toLan, Bp = pose({ ...KP.armsUp, sL: 2.12, eL: -.05, sR: 2.12, eR: -.05, dy: .25 });
      const Bb = pose({ ...Bp, dy: -.12, kL: .35, kR: .35, hL: .2, hR: .2 });
      const keys = [[-1e9, KP.hips], [b0 + .02 * i, A], [b1, Bp], [b2, Bb]];
      const P = keyPose(t, keys, .12);
      const f = figure(c.cx, c.gy, c.s, P, { who: c.who, col: PA, dark: true, seed: 20 + i * 5, face: t >= b1 ? 'happy' : 'smile' });
      X.restore(); X.restore();
      const hnd = fx ? f.handL : f.handR;
      aim.push([c.cx + (hnd[0] - c.cx) * dz, c.cy + (hnd[1] - c.cy) * dz, t - b0 - .02 * i]);
      mono(String(i + 1).padStart(2, '0') + ' · ' + c.who.toUpperCase(), x + (c.dir > 0 ? 36 : 924), y + (c.down ? 52 : 510), { size: 20, align: c.dir > 0 ? 'left' : 'right', a: .75 });
    });
    // grid seams
    rect(957, 0, 6, H, PAL.ink); rect(0, 537, W, 6, PAL.ink); line(960, 0, 960, H, 1.5, PAL.steel0); line(0, 540, W, 540, 1.5, PAL.steel0);
    // centre medallion with LAN; pulses on every beat
    const mk = E.back(clamp((t - b0) / .18), 2.2), pr = 124 * mk * (1 + .05 * pulse(t, 5));
    // orange sight-lines from each pointing finger to LAN (only while they point at her)
    if (t < b1) aim.forEach(([hx, hy, age]) => {
      const k = E.out(age / .16); if (k <= 0) return;
      const dx = CX - hx, dy = CY - hy, L = Math.hypot(dx, dy), ex = hx + dx * (1 - (pr + 18) / L) * k, ey = hy + dy * (1 - (pr + 18) / L) * k;
      X.save(); X.setLineDash([10, 8]); line(hx + dx / L * 16, hy + dy / L * 16, ex, ey, 3, OR, .9); X.restore();
    });
    if (mk > .01) {
      circle(CX + 8, CY + 8, pr + 12, { fill: '#000' }); circle(CX, CY, pr + 12, { fill: PAL.ink }); circle(CX, CY, pr, { fill: PA }); circle(CX, CY, pr + 2, { stroke: OR, w: 9 });
      X.save(); X.beginPath(); X.arc(CX, CY, pr - 4, 0, TAU); X.clip();
      const fs = pr * .4;
      figure(CX, CY - .05 * pr + 9.25 * fs, fs, pose({ ...KP.frame, head: .12 * Math.sin(bp(t) * Math.PI) }), { who: 'lan', face: t >= b1 ? 'happy' : 'star', blush: 1, seed: 9, shadow: false });
      X.restore();
      sticker(CX, CY + pr + 44, 'LAN · 小篮', { size: 22, k: mk, font: F.sans, weight: 800, rot: -.03 });
    }
  }

  // ======================================================================================================
  // S7 · 关上柜门 | 一片清净 — a night kitchen wall; the doors swing shut in a ripple; the night empties to paper
  // ======================================================================================================
  const L22 = LY[22].t, NC = 6, CW = 640, BASE = [110, 830], UP = [1400, 2080];
  const ORDER = (() => { const o = []; for (let c = 0; c < NC; c++) { o.push([c, 1]); o.push([c, 0]); } return o; })();   // zig-zag, left → right
  const T7 = 69.87, shutT = idx => T7 + .02 + idx * .1705;      // each door starts to swing shut on a 16th
  function cabinet(c, row, ang, gl) {
    const x0 = -NC * CW / 2 + c * CW, x1 = x0 + CW, [y0, y1] = row ? UP : BASE, P = [];
    const inner = mixCol(PAL.night2, PAL.paper2, gl), back = mixCol('#101013', PAL.paper2, gl);
    P.push(...boxModel(x0 + 10, y0, -560, x1 - 10, y1, 0, { sides: 'lrtbk', fill: inner, backFill: back, ink: mixCol(PAL.steel0, PAL.ink, gl), iw: 1.4 }));
    const cx = (x0 + x1) / 2;
    if (!row) {   // base: pull-out basket with plates + bowls
      P.push(...translate3(basketModel({ w: 540, d: 440, h: 150, type: 'dish' }), [cx, y0 + 60, -500]));
      for (let i = 0; i < 5; i++) P.push(lathe([cx - 150, y0 + 196, -420 + i * 30], PROF.plate, { axis: 'z', fill: PAL.night2, ink: PAL.steel2 }));
      P.push(lathe([cx + 140, y0 + 66, -300], PROF.bowl, { fill: PAL.night2, ink: PAL.steel2 }));
      P.push(...translate3(basketModel({ w: 540, d: 440, h: 120, type: 'plain' }), [cx, y0 + 380, -500]));
      P.push(lathe([cx - 120, y0 + 386, -260], PROF.jar, { fill: PAL.night2, ink: PAL.steel2 }), lathe([cx + 20, y0 + 386, -300], PROF.bottle, { fill: PAL.night2, ink: PAL.steel2 }), lathe([cx + 160, y0 + 386, -240], PROF.jar, { fill: PAL.night2, ink: PAL.steel2 }));
    } else {      // upper: lift-down basket with bowls and cups
      P.push(...translate3(basketModel({ w: 540, d: 300, h: 200, type: 'plain' }), [cx, y0 + 70, -360]));
      for (let i = 0; i < 3; i++) P.push(lathe([cx - 150 + i * 150, y0 + 76, -210], i === 1 ? PROF.cup : PROF.bowl, { fill: PAL.night2, ink: PAL.steel2, open: true }));
      P.push(lathe([cx - 90, y0 + 380, -250], PROF.jar, { fill: PAL.night2, ink: PAL.steel2 }), lathe([cx + 110, y0 + 380, -250], PROF.tall.map(([r, y]) => [r * .8, y * .8]), { fill: PAL.night2, ink: PAL.steel2 }));
    }
    // the door: hinged on the outer side of each pair
    const hingeL = c % 2 === 0, hx = hingeL ? x0 + 3 : x1 - 3;
    let D = doorModel(x0 + 3, y0 + 3, x1 - 3, y1 - 3, 20, { handle: false, fill: PAL.paper, iw: 2 });
    D = rotateY3(D, hingeL ? -ang : ang, [hx, 0, 2]);
    // knob
    const kx = hingeL ? x1 - 60 : x0 + 60, ky = row ? y0 + 80 : y1 - 80;
    // (closed doors: the knob goes on its own top layer so it can never depth-sort behind its door slab)
    D.push(...rotateY3([{ k: 'face', layer: ang < .05 ? 3 : 2, bias: -90, pts: [[kx - 5, ky - 36, 22], [kx + 5, ky - 36, 22], [kx + 5, ky + 36, 22], [kx - 5, ky + 36, 22]], fill: PAL.ink2, ink: PAL.ink, iw: 1 }], hingeL ? -ang : ang, [hx, 0, 2]));
    P.push(...D);
    return P;
  }
  function shotShut(t, lt, dur) {
    const gl = E.io((t - (shutT(11) + .18)) / .5);         // the whole room turns to paper after the last door lands
    const fade = E.io((t - 72.3) / .5);                     // then the drawing itself recedes to a ghost
    const bg = mixCol(NI, PA, gl); paperBG(bg); DARK = gl < .5;
    const C = frameCam([0, 1110, 0], -.13 + .05 * clamp(lt / 3.5), .07, CX, CY + 10, 3900 - 120 * E.io(clamp(lt / 3.5)), 1990, { fov: 20 });
    const P = [];
    // counter slab + plinth + wall line
    P.push(...boxModel(-NC * CW / 2 - 40, BASE[1], -600, NC * CW / 2 + 40, BASE[1] + 40, 40, { sides: 'tf', fill: mixCol('#26262C', PAL.paper, gl), frontFill: mixCol(PAL.steel0, PAL.paper2, gl), ink: mixCol(PAL.steel1, PAL.ink, gl), iw: 1.5, layer: 2 }));
    for (let c = 0; c < NC; c++) for (const row of [0, 1]) {
      const idx = ORDER.findIndex(q => q[0] === c && q[1] === row), ts = shutT(idx), open = 1.72 + .22 * (hash(c * 7 + row) - .5);
      const ang = open * (1 - E.soft((t - ts) / .6));
      if (ang < .002) P.push(...cabinet(c, row, 0, gl).filter(q => q.layer >= 2)); else P.push(...cabinet(c, row, ang, gl));
    }
    render3(P, C, { style: 'glow', lw: 1 });
    if (fade > 0) rect(0, 0, W, H, PA, .86 * fade);      // the drawing recedes into the paper
    // a soft 嗒 tick where each door lands
    ORDER.forEach(([c, row], idx) => {
      const a = t - shutT(idx) - .22; if (a < 0 || a > .35) return;
      const x0 = -NC * CW / 2 + c * CW, hingeL = c % 2 === 0, [y0, y1] = row ? UP : BASE;
      const p = pin(C, [hingeL ? x0 + CW - 10 : x0 + 10, (y0 + y1) / 2, 24]);
      circle(p[0], p[1], 8 + 40 * E.out(a / .35), { stroke: OR, w: 3 * (1 - a / .35), a: 1 - a / .35 });
    });
    // the quiet subtitle, sitting on the backsplash band
    lySub(22, t, { y: pin(C, [0, 1130, 0])[1], size: 50, tape: gl < .98 });
  }

  chapter('chorus2', 59.0, 73.0, [
    [59.0, shotHook],
    [60.48, shotSplit],
    [62.89, shotMacro],
    [64.42, shotClose],
    [65.95, shotLoad],
    [68.39, shotGrid],
    [69.87, shotShut],
  ]);
})();
