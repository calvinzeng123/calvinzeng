// c07_bridge.js — Bridge · "The kitchen singularity" (109.4 – 123.5) · night + cosmos
// The acceleration concept reaches its singularity, drawn as glowing line art on night paper:
//   A  109.4   a two-armed golden spiral of drawers pulls open one per sung character (each pull reveals the next, bigger one)
//   B  112.008 raking orbit: the cascade goes to 16ths, the spin accelerates and the spiral turns edge-on into a column
//   C  113.372 LAN yanks one drawer and a barred-spiral galaxy unfurls out of it (the bar IS a basket, plates are planets)
//   D  115.417 Droste: a basket inside a basket inside a basket (exact self-similar exponential zoom, seamless)
//   E  116.781 reverse explosion: everything flies home into its exact slot and locks in on the 16ths
//   F  118.826 a stack of drawers runs to the horizon, pulling out in an exponential wave
//   G  120.872 everything settles; the camera stops dead on the downbeat (122.917); big steady type
(() => {
'use strict';

// ---------- timing (beats line up exactly with the lyric onsets) ----------
const T_B = beatT(164), T_GAL = beatT(166), T_DRO = beatT(169), T_HOME = beatT(171), T_HOR = beatT(174), T_STEADY = beatT(177), T_STOP = beatT(180);

// ---------- shared: the night sky ----------
// Paper-coloured star dots in three parallax layers; dx/dy drift, zoom/rot about (cx, cy). Twinkle is continuous in t.
function cosmos(t, o = {}) {
  DARK = true; paperBG(PAL.night);
  const n = o.n ?? 240, a = o.a ?? 1, dx = o.dx ?? 0, dy = o.dy ?? 0, z = o.zoom ?? 1, rot = o.rot ?? 0, cx = o.cx ?? CX, cy = o.cy ?? CY;
  const PW = W + 240, PH = H + 240;
  X.save(); X.fillStyle = PAL.paper;
  for (let i = 0; i < n; i++) {
    const L = i % 3, par = [.35, .65, 1][L];
    let x = ((hash(i * 1.7 + 3.1) * PW + dx * par) % PW + PW) % PW - 120, y = ((hash(i * 2.3 + 9.7) * PH + dy * par) % PH + PH) % PH - 120;
    if (z !== 1 || rot) { const zz = Math.pow(z, par), q = rot2((x - cx) * zz, (y - cy) * zz, rot * par); x = q[0] + cx; y = q[1] + cy; }
    if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
    if (o.clipY != null && y > o.clipY) continue;
    X.globalAlpha = a * (.14 + .5 * hash(i * 5.3 + 1)) * (.6 + .4 * noise1(i * .71 + t * (.8 + L * .6)));
    X.beginPath(); X.arc(x, y, [.9, 1.3, 1.9][L], 0, TAU); X.fill();
  }
  X.restore();
  for (let i = 0; i < (o.glints ?? 5); i++) {
    const x = hash(i * 9.1 + 40) * W, y = hash(i * 4.7 + 41) * H * (o.clipY != null ? o.clipY / H : 1);
    const k = .45 + .55 * Math.sin(t * (1.1 + hash(i) * .8) + i * 2.1);
    if (k > .05) sparkle(x, y, 6 + hash(i * 3) * 6, { col: PAL.paper, k, a: .75 * a });
  }
}
// stroke the current path twice: a faint wide halo + a bright core ("glow" line art, not glossy)
function glowStroke(w, a = 1, core = PAL.shine, hk = 3.2, ha = .2) {
  X.save(); X.globalAlpha *= a; X.lineCap = 'round'; X.lineJoin = 'round';
  X.strokeStyle = rgba(PAL.steel2, ha); X.lineWidth = w * hk; X.stroke();
  X.strokeStyle = core; X.lineWidth = w; X.stroke(); X.restore();
}
// uniform-scale rigid placement of 3D prims: world = o + s * (x ex + y ey + z ez); also scales wire radii and lathe profiles
function place(prims, o, ex, ey, ez, s) {
  const f = p => [o[0] + s * (p[0] * ex[0] + p[1] * ey[0] + p[2] * ez[0]), o[1] + s * (p[0] * ex[1] + p[1] * ey[1] + p[2] * ez[1]), o[2] + s * (p[0] * ex[2] + p[1] * ey[2] + p[2] * ez[2])];
  const R = a => [a[0] * ex[0] + a[1] * ey[0] + a[2] * ez[0], a[0] * ex[1] + a[1] * ey[1] + a[2] * ez[1], a[0] * ex[2] + a[1] * ey[2] + a[2] * ez[2]];
  return prims.map(p => {
    const q = { ...p };
    if (p.pts) q.pts = p.pts.map(f);
    if (p.at) q.at = f(p.at);
    if (p.k === 'wire') q.r = p.r * s;
    if (p.k === 'lathe') { q.axisV = R(p.axisV ?? [0, 1, 0]); q.prof = p.prof.map(([r, y]) => [r * s, y * s]); }
    return q;
  });
}
const shiftZ = (prims, dz) => dz ? prims.map(p => ({ ...p, pts: p.pts.map(q => [q[0], q[1], q[2] + dz]) })) : prims;

// the wall/floor junction behind a cabinet, extended along x: a 3D-consistent ground line
function groundLine(C, o = {}) {
  const a = pin(C, [o.x0 ?? -(o.len ?? 2600), -20, -20]), b = pin(C, [o.x1 ?? (o.len ?? 2600), -20, -20]);
  handLine(a[0], a[1], b[0], b[1], { w: o.w ?? 2.2, col: o.col ?? PAL.steel1, seed: o.seed ?? 707 });
}

// ---------- shared: one drawer cell (dish basket + front), local mm, front plane at z = UD ----------
const UW = 620, UH = 330, UD = 460;
const PLATE_S = PROF.plate.map(([r, y]) => [r * .78, y * .78]);
let _ubk = null;
const unitBasket = () => _ubk ??= translate3(basketModel({ w: 540, d: 420, h: 150, type: 'dish', gap: 32 }), [0, 70, 20]);
function frontFaces(x0, y0, x1, y1, z, o = {}) {
  const hw = o.hw ?? 110;
  return [
    { k: 'face', layer: 2, pts: [[x0, y1, z - 18], [x1, y1, z - 18], [x1, y1, z], [x0, y1, z]], fill: PAL.steel0, iw: 1 },
    { k: 'face', layer: 2, bias: -18, pts: [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], fill: o.fill ?? PAL.night2, iw: o.iw ?? 2 },
    { k: 'face', layer: 2, bias: -40, pts: [[-hw, y1 - 50, z + 1], [hw, y1 - 50, z + 1], [hw, y1 - 38, z + 1], [-hw, y1 - 38, z + 1]], fill: o.handle ?? PAL.steel2, iw: .6 },
  ];
}

// ---------- private presenters ----------
// A: type drawers — every character is a drawer in a grid of empty cells and slides out on its onset (一格一格往外拉)
function lyDrawers(i, t, o = {}) {
  const env = lyEnv(i, t, o.hold ?? .35, .2); if (env <= 0) return; LYRIC_DRAWN.add(i);
  const rows = lyRows(i), cs = o.cell ?? 150, g = o.gap ?? 16, size = cs * .74, x0 = o.x ?? 110, y0 = o.y ?? 300;
  X.save(); X.globalAlpha *= env;
  text(String(i + 1).padStart(2, '0') + ' /  一格一格', x0, y0 - 34, { size: 22, font: F.mono, weight: 600, col: PAL.steel1, track: 2 });
  rows.forEach((row, r) => row.forEach((c, j) => {
    const x = x0 + j * (cs + g), y = y0 + r * (cs + g), k = c.ti == null ? 1 : clamp((t - c.ti + .03) / .55), e = E.soft(k);
    X.strokeStyle = rgba(PAL.steel2, .3); X.lineWidth = 2; X.setLineDash([6, 8]); X.strokeRect(x, y, cs, cs); X.setLineDash([]);
    if (k <= 0) return;
    const hot = (o.hi ?? '').includes(c.ch), lx = x - 9 * e, ly = y - 9 * e;
    rect(x + 9 * e, y + 9 * e, cs, cs, '#000', .95);                      // hard offset shadow: the drawer comes toward us
    rect(lx, ly, cs, cs, PAL.night2);
    X.save(); X.beginPath(); X.rect(lx, ly, cs, cs); X.clip();
    text(c.ch, lx + cs / 2 - (1 - e) * cs * 1.05, ly + cs * .47 + size * .37, { size, font: F.heavy, weight: 900, col: hot ? PAL.orange : PAL.paper, align: 'center' });
    X.restore();
    X.strokeStyle = hot ? PAL.orange : PAL.steel2; X.lineWidth = 3; X.strokeRect(lx, ly, cs, cs);
    rect(lx + cs * .34, ly + cs - 15, cs * .32, 5, hot ? PAL.orange : PAL.steel1);   // handle groove
  }));
  X.restore();
}
// big type with a night "moat" (thick night stroke under the fill) so it reads over line work. Rows can scale.
function lySlam(i, t, o = {}) {
  const env = lyEnv(i, t, o.hold ?? .3, .2); if (env <= 0) return; LYRIC_DRAWN.add(i);
  const rows = lyRows(i), font = o.font ?? F.heavy, wt = o.weight ?? 900;
  X.save(); X.globalAlpha *= env;
  let y = o.y ?? 400;
  rows.forEach((row, r) => {
    const sz = (o.size ?? 150) * (o.rowScale?.[r] ?? 1), tr = o.track ?? -sz * .02;
    const ws = row.map(c => measure(c.ch, sz, font, wt) + tr), tw = ws.reduce((s, w) => s + w, 0) - tr;
    const x0 = (o.x ?? 110) - (o.align === 'center' ? tw / 2 : o.align === 'right' ? tw : 0) + (o.indent?.[r] ?? 0);
    for (const pass of [0, 1]) {
      let x = x0;
      row.forEach((c, j) => {
        const k = chK(c.ti, t, .2);
        if (k > 0) {
          const s = lerp(1.3, 1, E.out5(k)), dy = (1 - E.out5(k)) * -sz * .15, hot = (o.hi ?? '').includes(c.ch), cx = x + ws[j] / 2, cy = y - sz * .38;
          X.save(); X.translate(cx, cy + dy); X.scale(s, s); X.translate(-cx, -cy);
          if (pass === 0) text(c.ch, x, y, { size: sz, font, weight: wt, col: null, stroke: PAL.night, sw: sz * (o.moat ?? .16), a: clamp(k * 3) });
          else text(c.ch, x, y, { size: sz, font, weight: wt, col: hot ? PAL.orange : (o.col ?? PAL.paper), a: clamp(k * 3) });
          X.restore();
        }
        x += ws[j];
      });
    }
    y += sz * (o.lead ?? 1.1);
  });
  X.restore();
}
// E: reverse-explosion type — each character flies in from a scattered spot and locks into its slot exactly on its onset
function lyHome(i, t, o = {}) {
  const env = lyEnv(i, t, o.hold ?? .3, .2); if (env <= 0 && t > LY[i].b) return;
  const L = LY[i]; if (t < L.t[0] - .45) return; LYRIC_DRAWN.add(i);
  const rows = lyRows(i), sz = o.size ?? 140, font = F.heavy, wt = 900, fly = .3;
  X.save(); X.globalAlpha *= t > L.b ? env : 1;
  let y = o.y ?? 400, n = 0;
  rows.forEach((row, r) => {
    let x = o.x ?? 110;
    row.forEach(c => {
      const w = measure(c.ch, sz, font, wt) - sz * .02, ti = c.ti ?? L.t[0], k = clamp((t - (ti - fly)) / fly), hot = (o.hi ?? '').includes(c.ch);
      const sd = 700 + n * 13.7;
      if (k > 0) {
        const e = k * k, ox = (hash(sd) - .5) * 900 * (1 - e) + 260 * (1 - e), oy = (hash(sd + 1) - .5) * 700 * (1 - e), rot = (hash(sd + 2) - .5) * 2.4 * (1 - e), sc = lerp(.35, 1, e);
        const cx = x + w / 2, cy = y - sz * .38;
        X.save(); X.translate(cx + ox, cy + oy); X.rotate(rot); X.scale(sc, sc); X.translate(-cx, -cy);
        text(c.ch, x, y, { size: sz, font, weight: wt, col: null, stroke: PAL.night, sw: sz * .14, a: clamp(k * 2.5) });
        text(c.ch, x, y, { size: sz, font, weight: wt, col: hot ? PAL.orange : PAL.paper, a: clamp(k * 2.5) });
        X.restore();
        if (k < 1) { const px = cx + ox * 1.25, py = cy + oy * 1.25; X.beginPath(); X.moveTo(px, py); X.lineTo(cx + ox, cy + oy); glowStroke(2, .5 * clamp(k * 3)); }
        const lk = t - ti;                                                        // lock-in tick under the slot
        if (lk >= 0 && lk < .35) { const q = E.out(lk / .35); line(x + w * .1, y + sz * .16, x + w * .1 + w * .8 * q, y + sz * .16, 4, hot ? PAL.orange : PAL.paper, 1 - q * .7); }
        else if (lk >= .35) line(x + w * .1, y + sz * .16, x + w * .9, y + sz * .16, 3, PAL.steel0, .9);
      }
      x += w; n++;
    });
    y += sz * 1.12;
  });
  X.restore();
}

// =====================================================================================================================
// A/B · a golden spiral of drawers (一格一格 / 往外拉): each pull reveals the next, bigger drawer; the camera zooms out
// exponentially so the newest drawer keeps its size while the older ones shrink into the spiral's glowing eye.
// =====================================================================================================================
const SPN = 16, SPR0 = 250, SPB = .3, SPD = .62, SPTH0 = -1.15;
const PT = (() => {   // pull times: one per sung character, then an accelerating cascade (8ths → 16ths)
  const a = [...LY[34].t], add = (b0, step, n) => { for (let k = 0; k < n; k++) a.push(beatT(b0) + k * step); };
  add(162.5, BEAT / 2, 4); add(164.25, BEAT / 4, 5);
  return a;
})();
const spR = i => SPR0 * Math.exp(SPB * i * SPD);
function frontier(t) { let f = 0; for (let i = 0; i < SPN; i++) f += E.io(clamp((t - PT[i] + .05) / .45)); return f; }
function slotPrims(ext, o = {}) {   // a drawer in an invisible wall: the opening, the part of the basket that is out, the front
  const P = [{ k: 'face', layer: 0, pts: [[-UW / 2, 0, UD], [UW / 2, 0, UD], [UW / 2, UH, UD], [-UW / 2, UH, UD]], fill: PAL.night, ink: PAL.steel0, iw: 2 }];
  for (const p of unitBasket()) { if (p.pts.every(q => q[2] + ext < UD - 2)) continue; P.push(shiftZ([p], ext)[0]); }
  for (let k = 0; k < 3; k++) { const z = 110 + k * 60 + ext; if (z > UD - 10) P.push(lathe([-110, 180, z], PLATE_S, { axis: 'z', fill: PAL.night2, ink: PAL.paper, iw: 1.6 })); }
  if (150 + ext > UD - 30) P.push(lathe([150, 74, 150 + ext], PROF.bowl, { open: true, fill: PAL.night2, ink: PAL.paper, iw: 1.6 }));
  return P.concat(frontFaces(-UW / 2 + 5, 6, UW / 2 - 5, UH - 6, UD + ext, o).map(p => ({ ...p, ink: p.fill === PAL.steel0 ? PAL.steel1 : PAL.steel2 })));
}
function spiralDrawers(t, C, spin) {   // two arms (like the galaxy to come); arm 2 ratchets a 32nd behind arm 1
  const units = [];
  for (let arm = 0; arm < 2; arm++) for (let i = 0; i < SPN; i++) {
    const lag = arm * BEAT / 8, rev = i === 0 ? clamp((t - PT[0] + .25 - lag) / .2) : E.out(clamp((t - PT[i - 1] - lag + .12) / .3)); if (rev <= 0) continue;
    const th = SPTH0 + i * SPD + arm * Math.PI + spin, r = spR(i), s = r * SPD * Math.hypot(1, SPB) * .9 / UW;
    const er = [Math.cos(th), Math.sin(th), 0], ex = [Math.sin(th), -Math.cos(th), 0], ez = [0, 0, 1];
    const org = [r * er[0] - s * UH / 2 * er[0], r * er[1] - s * UH / 2 * er[1], -s * UD];
    units.push({ i, lag, org, er, ex, ez, s, rev, d: C.project([r * er[0], r * er[1], 0])[2] });
  }
  units.sort((a, b) => b.d - a.d);
  for (const u of units) {
    const pk = (t - PT[u.i] - u.lag) / .6, ext = 400 * E.soft(pk), hit = pk > 0 ? Math.exp(-pk * 4) : 0;
    const prims = place(slotPrims(ext, { handle: hit > .25 ? PAL.orange : PAL.steel2 }), u.org, u.ex, u.er, u.ez, u.s);
    render3(prims, C, { style: 'glow', lw: 1.1 + hit * .9, a: u.rev });
  }
}
function spiralCam(t, alt) {
  const f = frontier(t);
  if (!alt) return frameCam([0, 0, 0], .5 + (t - 109.4) * .03, .28, 1250, 545, 2.3 * spR(Math.min(SPN, f + .7)) + 150, 1000, { fov: 34 });
  // B: raking orbit that accelerates, then a push into the spiral's eye just before the galaxy
  const u = clamp((t - T_B) / (T_GAL - T_B)), dive = Math.pow(.55, E.in(clamp((t - T_GAL + .25) / .25)));
  return frameCam([0, 0, 0], .74 + .16 * E.in(u), .44, 1250, 550, (2.55 * spR(Math.min(SPN, f + .7)) + 170) * dive, 1000, { fov: 34, roll: -.08 * E.in(u) });
}
// the spiral turns, and in B the spin accelerates into the cut (the whirl before the galaxy)
const spiralSpin = t => -(t - 109.4) * .2 - 3.2 * E.in(clamp((t - T_B) / (T_GAL - T_B)));
function shotSpiral(alt) {
  return (t, lt) => {
    const f = frontier(t), C = spiralCam(t, alt);
    cosmos(t, { dx: -t * 14, dy: t * 5, zoom: Math.pow(.86, f * .5), cx: 1250, cy: 545, rot: -(t - 109.4) * .05 });
    // the spiral's eye: the kitchen singularity (a small light, the one allowed glow)
    const e = C.project([0, 0, 0]), er = 70 + 30 * pulse(t, 4);
    const g = X.createRadialGradient(e[0], e[1], 0, e[0], e[1], er);
    g.addColorStop(0, rgba(PAL.shine, .85)); g.addColorStop(.18, rgba(PAL.steel2, .3)); g.addColorStop(1, rgba(PAL.steel2, 0));
    X.fillStyle = g; X.fillRect(e[0] - er, e[1] - er, er * 2, er * 2);
    spiralDrawers(t, C, spiralSpin(t));
    sparkle(e[0], e[1], 18 + 8 * pulse(t, 5), { col: PAL.shine });
    lyDrawers(34, t, { x: 104, y: 330, cell: 146, hi: '拉' });
    // HUD: open-drawer counter (a joke readout, not a product claim)
    metaStrip(t, { col: PAL.paper, a: .55, tl: 'BRIDGE  ·  THE KITCHEN SINGULARITY' });
    text('DRAWERS OPEN', W - 64, H - 104, { size: 18, font: F.mono, weight: 600, col: PAL.steel1, align: 'right', track: 2 });
    text(String(Math.round(f)).padStart(2, '0') + ' / ∞', W - 64, H - 62, { size: 32, font: F.mono, weight: 700, col: PAL.paper, align: 'right' });
  };
}

// =====================================================================================================================
// C · a drawer pulls out the galaxy (拉出 / 整个银河系). Side-elevation camera (not the usual 3/4): LAN drags the drawer
// open, a white core ignites INSIDE the basket and basket-wire spiral arms unfurl out of the drawer mouth, wrapping round
// the cabinet (far half behind it, near half in front) while the camera pulls back to show the scale.
// =====================================================================================================================
const GB = .44, GR0 = .17, GTH = 4.05;     // log-spiral arms r = GR0·e^(GB·θ), θ ∈ [0, GTH] → out to r ≈ 1
const PLANETS = [[.3, .6, 16], [.42, 2.4, 13], [.56, 4.0, 26, 1], [.66, 5.3, 18], [.79, 1.5, 32], [.9, 3.2, 22], [1.0, 4.8, 16], [.5, 6.0, 11], [.84, .2, 13], [.72, 2.9, 10]];
const armR = (th, k = 1) => GR0 * Math.exp(GB * th) * k;
const armW = th => .05 + .05 * th / GTH;
// g: {x, y, R, spin, ci, pa, grow, a, half: 'far' | 'near' | undefined}. 'near' = the disc half in front (screen-lower side).
function galaxy(g, t) {
  const { x, y, R, spin, ci, pa } = g, grow = g.grow ?? 1, a = g.a ?? 1, cp = Math.cos(pa), sp = Math.sin(pa);
  if (R < 2 || a <= 0) return;
  const P = (u, v, sn = spin) => { const c = Math.cos(sn), s = Math.sin(sn), uu = u * c - v * s, vv = (u * s + v * c) * ci; return [x + (uu * cp - vv * sp) * R, y + (uu * sp + vv * cp) * R]; };
  const Pp = (r, ph) => P(r * Math.cos(ph), r * Math.sin(ph));
  const side = q => -(q[0] - x) * sp + (q[1] - y) * cp;            // > 0 on the near (lower) half
  X.save();
  if (g.half) {   // clip to one half of the disc (split along its major axis)
    const L = 5000, n = g.half === 'near' ? 1 : -1;
    X.beginPath(); X.moveTo(x - cp * L, y - sp * L); X.lineTo(x + cp * L, y + sp * L); X.lineTo(x + cp * L - sp * L * n, y + sp * L + cp * L * n); X.lineTo(x - cp * L - sp * L * n, y - sp * L + cp * L * n); X.closePath(); X.clip();
  }
  const keep = q => !g.half || (side(q) > 0) === (g.half === 'near');
  // the disc's soft light (the allowed glow gradient); the white-hot core itself is painted by the shot, inside the basket
  X.save(); X.translate(x, y); X.rotate(pa); X.scale(1, ci);
  const gr = X.createRadialGradient(0, 0, 0, 0, 0, R * .75);
  gr.addColorStop(0, rgba(PAL.shine, .34 * a * grow)); gr.addColorStop(.25, rgba(PAL.steel2, .14 * a * grow)); gr.addColorStop(1, rgba(PAL.steel2, 0));
  X.fillStyle = gr; X.beginPath(); X.arc(0, 0, R * .75, 0, TAU); X.fill(); X.restore();
  const th1 = GTH * E.out(grow), wS = clamp(R / 800, .3, 1.5);
  // faint dotted orbit rings (star-chart ink)
  X.save(); X.setLineDash([2, 12]);
  for (const r of [.62]) { X.beginPath(); X.ellipse(x, y, r * R, r * R * ci, pa, 0, TAU); X.strokeStyle = rgba(PAL.steel1, .2 * a * grow); X.lineWidth = 1.1; X.stroke(); }
  X.restore();
  // star dust packed along the arms (denser and brighter toward the core)
  X.fillStyle = PAL.paper;
  for (let p = 0; p < 1300; p++) {
    const k = p % 2, th = Math.pow(hash(p * 3.1), .9) * th1, sprd = .12 + .25 * hash(p * 8.3) ** 2, r = armR(th) * (1 + (hash(p * 7.7) - .5) * sprd * 2), ph = th + k * Math.PI + (hash(p * 1.9) - .5) * sprd;
    const q = Pp(r, ph); if (!keep(q)) continue;
    X.globalAlpha = a * (.25 + .6 * hash(p * 2.2)) * (1 - .55 * th / GTH);
    X.beginPath(); X.arc(q[0], q[1], (.6 + hash(p * 5.5) ** 3 * 2.2) * wS, 0, TAU); X.fill();
  }
  X.globalAlpha = 1;
  // luminous arm bodies: smooth filled ribbons (three nested widths) so the spiral has mass even at thumbnail size
  for (let k = 0; k < 2; k++) {
    const n = Math.max(3, Math.ceil(th1 / .05)), mid = [];
    for (let m = 0; m <= n; m++) { const th = m / n * th1; mid.push([Pp(armR(th), th + k * Math.PI), th]); }
    for (const [wf, al] of [[.16, .07], [.085, .09], [.035, .12]]) {
      const L = [], Rt = [];
      for (let m = 0; m <= n; m++) {
        const A = mid[Math.max(0, m - 1)][0], B = mid[Math.min(n, m + 1)][0], dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 1;
        const [q, th] = mid[m], u = th / GTH, hw = R * wf * armR(th) * (1 + .5 * u) * Math.sin(Math.min(1, m / 4, (n - m) / 3 + .15) * Math.PI / 2);
        L.push([q[0] - dy / d * hw, q[1] + dx / d * hw]); Rt.push([q[0] + dy / d * hw, q[1] - dx / d * hw]);
      }
      X.beginPath(); L.forEach((q, m) => m ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1])); for (let m = n; m >= 0; m--) X.lineTo(Rt[m][0], Rt[m][1]); X.closePath();
      X.fillStyle = rgba(PAL.steel2, al * a * grow); X.fill();
    }
  }
  // the arms are basket wire: top rim + bottom rim tied by uprights, white-hot near the core, thinning outward
  const seg = .5;
  for (let k = 0; k < 2; k++) {
    for (let s0 = 0; s0 < th1 - 1e-3; s0 += seg) {
      const s1 = Math.min(th1, s0 + seg), u = s0 / GTH, fade = a * (1 - .7 * u), wk = wS * (1 - .45 * u), n = Math.max(2, Math.ceil((s1 - s0) / .04));
      for (const off of [-1, 0, 1]) {
        X.beginPath();
        for (let m = 0; m <= n; m++) { const th = lerp(s0, s1, m / n), q = Pp(armR(th, 1 + off * armW(th)), th + k * Math.PI); m ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1]); }
        glowStroke((off ? 3 : 1.4) * wk, fade * (off ? 1 : .55), PAL.shine, 3.4, .3);
      }
      X.beginPath();
      for (let th = Math.ceil(s0 / .1) * .1; th < s1; th += .1) {
        const dw = armW(th), q0 = Pp(armR(th, 1 - dw), th + k * Math.PI), q1 = Pp(armR(th, 1 + dw), th + k * Math.PI);
        X.moveTo(q0[0], q0[1]); X.lineTo(q1[0], q1[1]);
      }
      glowStroke(1.4 * wk, fade * .85, PAL.shine, 3.4, .3);
    }
    // minor arm: a single faint rail between the major ones
    X.beginPath();
    const n2 = Math.ceil(th1 * .85 / .05);
    for (let m = 0; m <= n2; m++) { const th = m / n2 * th1 * .85, q = Pp(armR(th, 1.35), th + k * Math.PI + Math.PI * .55); m ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1]); }
    glowStroke(1.2 * wS, a * .38);
  }
  // star clusters twinkling along the arms
  for (let m = 0; m < 8; m++) {
    const th = (.15 + .1 * m) * th1, q = Pp(armR(th, 1 + (hash(m * 4.4) - .5) * .1), th + (m % 2) * Math.PI); if (!keep(q)) continue;
    sparkle(q[0], q[1], (10 + 10 * hash(m * 2.7)) * wS, { col: PAL.shine, k: .5 + .5 * Math.sin(t * 5 + m * 1.7), a: a * grow });
  }
  // planets: plates lying in the galactic plane, flung out of the core onto their orbits; one signal-orange
  PLANETS.forEach(([r0, ph0, sz, hot]) => {
    const out = E.out5(clamp(grow * 1.7 - r0 * .7)); if (out <= 0) return;
    const r = r0 * out, ph = ph0 + spin * (1.3 - .5 * r0), q = P(r * Math.cos(ph), r * Math.sin(ph), 0), rr = sz * wS * lerp(.3, 1, out), ry = rr * Math.min(1, ci * 1.3);
    if (!keep(q)) return;
    X.save(); X.globalAlpha *= a;
    X.beginPath(); X.ellipse(q[0], q[1], rr, ry, pa, 0, TAU); X.fillStyle = hot ? PAL.orange : PAL.night2; X.fill();
    X.strokeStyle = hot ? PAL.orange : PAL.paper; X.lineWidth = 2.2; X.stroke();
    X.beginPath(); X.ellipse(q[0], q[1], rr * .6, ry * .6, pa, 0, TAU); X.strokeStyle = hot ? PAL.night : rgba(PAL.paper, .5); X.lineWidth = 1.5; X.stroke();
    if (!hot) { X.beginPath(); X.ellipse(q[0], q[1], rr * .9, ry * .9, pa, Math.PI * 1.1, Math.PI * 1.55); X.strokeStyle = PAL.shine; X.lineWidth = 2.4; X.stroke(); }
    X.restore();
  });
  X.restore();
}
// white-hot light welling up out of the open basket (additive, so the wires inside burn white)
function coreLight(x, y, r, k, sq = .72) {
  if (k <= 0 || r < 1) return;
  X.save(); X.globalCompositeOperation = 'lighter'; X.translate(x, y); X.scale(1, sq);
  const g = X.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, rgba(PAL.shine, .95 * k)); g.addColorStop(.1, rgba(PAL.shine, .7 * k)); g.addColorStop(.32, rgba(PAL.steel2, .22 * k)); g.addColorStop(1, rgba(PAL.steel2, 0));
  X.fillStyle = g; X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fill(); X.restore();
}
// a single cabinet (carcass + counter + dish basket + front), night fills; basket, items and rails hidden while inside
function cabinetPrims(ext, o = {}) {
  const P = [...boxModel(-330, -20, -20, 330, 400, 460, { sides: 'lrbk', fill: PAL.night, iw: 1.4 }),
    ...boxModel(-350, 400, -20, 350, 430, 490, { sides: 'lrtf', fill: PAL.night2, iw: 1.6 })];
  for (const p of dishDrawer(ext, { front: false, slides: o.slides })) {
    if (p.k === 'wire' && p.pts.every(q => q[2] < 452)) continue;
    if (p.k === 'lathe' && p.at[2] < 440) continue;
    if (p.rail) { if (p.pts.every(q => q[2] <= 461)) continue; P.push({ ...p, layer: 1, pts: p.pts.map(q => [q[0], q[1], Math.max(q[2], 461)]) }); continue; }
    P.push(p);
  }
  P.push(...frontFaces(-316, 10, 316, 330, 460 + ext, { handle: o.handle, hw: 120 }));
  return P;
}
const PULL_POSE = pose({ ...KP.reach, lean: -.3, sR: 1.55, eR: 0, sL: .95, eL: .7, hL: .34, kL: .45, hR: .2, kR: .18, head: -.1 });   // leaning back, dragging
function shotGalaxy(t, lt) {
  const tp = beatT(166.25), kp = (t - tp) / .6, ext = 400 * E.soft(kp), bk = t - tp;
  cosmos(t, { dx: -t * 10, dy: t * 4 });
  // camera: opens on the glowing drawer gap (matching shot B's eye at 1250,545), then pulls far back (scale reveal).
  // Side elevation from the cabinet's left: the drawer slides out to screen-right, LAN drags it from the right.
  const pb = E.io(clamp((t - T_GAL - .12) / 1.3)), px = 1000 * Math.pow(330 / 1000, pb);
  const C = frameCam([0, lerp(210, 170, pb), lerp(462, 300 + ext * .5, pb)], -1.2, lerp(.24, .3, pb), lerp(1250, 1120, pb), lerp(545, 650, pb), 760, px, { fov: 28 });
  const core = pin(C, [0, 150, 230 + ext]), gk = clamp((bk - .02) / 1.05), ge = E.soft(gk);
  const G = { x: core[0], y: core[1], R: lerp(70, 1000, ge), spin: -(t - T_GAL) * .32 - 1.4 * (1 - ge), ci: .6, pa: .06, grow: gk, a: 1 };
  galaxy({ ...G, half: 'far' }, t);
  // floor under the drawer and LAN (along the pull direction)
  const f0 = pin(C, [-110, -20, -200]), f1 = pin(C, [-110, -20, 2600]);
  handLine(f0[0], f0[1], f1[0], f1[1], { w: 2.2, col: PAL.steel1, seed: 707 });
  render3(cabinetPrims(ext, { handle: kp > 0 && kp < 1.6 ? PAL.orange : PAL.steel2 }), C, { style: 'glow', dark: true });
  // light leaking round the closed drawer's gap (the black-hole cabinet of verse 1, reversed)
  if (kp < .45) {
    const cn = [[-316, 10], [316, 10], [316, 330], [-316, 330]].map(([x, y]) => pin(C, [x, y, 462 + ext]));
    X.beginPath(); cn.forEach((q, m) => m ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1])); X.closePath();
    glowStroke(4, (.6 + .4 * pulse(t, 5)) * (1 - clamp(kp / .45)), PAL.shine, 5, .35);
  }
  galaxy({ ...G, half: 'near' }, t);
  // the white-hot core wells up out of the basket
  const ck = E.out(clamp(bk / .18));
  coreLight(core[0], core[1], lerp(140, 400, ge) * (1 + .06 * pulse(t, 4)), ck);
  if (bk > 0 && bk < .5) speedLines(core[0], core[1], 60, 700, 26, { col: PAL.paper, a: .5 * (1 - bk / .5), w: 3, seed: 17 });
  // LAN: hand on the handle end; reach → lean back and drag, held while the drawer glides (tiny figure, huge galaxy)
  const hd = pin(C, [-125, 286, 470 + ext]), Pz = mirrorPose(lerpPose(KP.reach, PULL_POSE, E.out5(clamp(kp / .25))));
  X.save(); X.globalAlpha = 0; const dry = figure(0, 0, 1, Pz, { who: 'lan', shadow: false }); X.restore();
  let fy = pin(C, [-110, -20, 900 + ext])[1];
  for (let it = 0; it < 3; it++) {   // put her feet on the floor line under where she stands
    const sc0 = (fy - hd[1]) / -dry.handL[1], fx = hd[0] - dry.handL[0] * sc0, u = (fx - f0[0]) / ((f1[0] - f0[0]) || 1); fy = lerp(f0[1], f1[1], u);
  }
  const sc = clamp((fy - hd[1]) / -dry.handL[1], 5, 160), lx = hd[0] - dry.handL[0] * sc;
  figure(lx, fy, sc, Pz, { who: 'lan', col: PAL.paper, dark: true, face: kp > .1 ? 'wow' : 'smile', blush: 1, shadow: false });
  for (const b of [167, 168]) { const s2 = t - beatT(b); if (s2 > 0 && s2 < .4) sparkle(G.x + (b === 167 ? 520 : -470), G.y + (b === 167 ? -230 : 170), 34, { col: PAL.shine, k: Math.sin(s2 / .4 * Math.PI) }); }
  lySlam(35, t, { x: 100, y: 220, size: 150, rowScale: [.8, 1], hi: '拉', lead: 1.14, moat: .26 });
}

// =====================================================================================================================
// D · Droste (篮子里面 / 还有篮): exact self-similar zoom. Level k is the plan drawing mapped by F^k, F(p) = p* + sR(p − p*).
// The view at zoom u is F^−u, so u and u + 1 are pixel-identical: the loop is seamless by construction.
// =====================================================================================================================
const DS = .38, DTH = Math.PI / 2, DC = [.235, .0];   // child scale, rotation, centre (in parent plan units; basket 1 × .786)
const DFIX = (() => { // fixed point of F: p* = (I − sR)^−1 c
  const a = DS * Math.cos(DTH), b = DS * Math.sin(DTH), m00 = 1 - a, m01 = b, m10 = -b, m11 = 1 - a, det = m00 * m11 - m01 * m10;
  return [(m11 * DC[0] - m01 * DC[1]) / det, (-m10 * DC[0] + m00 * DC[1]) / det];
})();
let _dp = null;
function drostePaths() {
  if (_dp) return _dp;
  const hw = .5, hd = .393, fi = .84, rim = new Path2D(), rim2 = new Path2D(), fl = new Path2D(), ups = new Path2D(), slats = new Path2D(), comb = new Path2D(), plates = new Path2D(), cups = new Path2D();
  rim.roundRect(-hw, -hd, 2 * hw, 2 * hd, .045); rim2.roundRect(-hw * .975, -hd * .968, 2 * hw * .975, 2 * hd * .968, .04);
  fl.roundRect(-hw * fi, -hd * fi, 2 * hw * fi, 2 * hd * fi, .035);
  const per = (f) => { const L = 4 * hw + 4 * hd; let s = f * L; if (s < 2 * hw) return [-hw + s, -hd]; s -= 2 * hw; if (s < 2 * hd) return [hw, -hd + s]; s -= 2 * hd; if (s < 2 * hw) return [hw - s, hd]; s -= 2 * hw; return [-hw, hd - s]; };
  for (let k = 0; k < 72; k++) { const [x, y] = per((k + .5) / 72); ups.moveTo(x * .985, y * .985); ups.lineTo(x * fi, y * fi); }
  for (let x = -hw * fi + .042; x < hw * fi - .02; x += .042) { slats.moveTo(x, -hd * fi); slats.lineTo(x, hd * fi); }
  for (const y of [-.14, .14]) { slats.moveTo(-hw * fi, y); slats.lineTo(hw * fi, y); }
  // plate rack on the left: two comb wires and eight plates standing on edge (seen from above: long thin ellipses)
  for (const x of [-.36]) { comb.moveTo(x, -.3); for (let k = 0; k < 16; k++) comb.lineTo(x + (k % 2 ? .012 : -.012), -.3 + k * .04); }
  for (let k = 0; k < 8; k++) { const y = -.27 + k * .077; plates.moveTo(-.2 + .15, y); plates.ellipse(-.2, y, .15, .026, 0, 0, TAU); }
  for (const [x, y, r] of [[.43, -.3, .035], [.43, .3, .032]]) { cups.moveTo(x + r, y); cups.arc(x, y, r, 0, TAU); cups.moveTo(x + r * .72, y); cups.arc(x, y, r * .72, 0, TAU); }
  return _dp = { rim, rim2, fl, ups, slats, comb, plates, cups };
}
function drosteLevel(e, Z0, fx, fy, a) {
  const sc = Z0 * Math.pow(DS, e), ang = DTH * e, c = Math.cos(ang) * sc, s = Math.sin(ang) * sc;
  const tx = fx - (c * DFIX[0] - s * DFIX[1]), ty = fy - (s * DFIX[0] + c * DFIX[1]);
  const vis = clamp((sc - 30) / 110) * (1 - clamp((sc - 6000) / 3000)) * a; if (vis <= 0) return;   // tiny and huge levels fade (both depend on scale only: still seamless)
  const D = drostePaths(), px = 1 / sc;   // one screen pixel in plan units
  X.save(); X.setTransform(c, s, -s, c, tx + jit(3, .6), ty + jit(4, .6)); X.globalAlpha = 1; X.lineCap = 'round'; X.lineJoin = 'round';
  X.fillStyle = PAL.night; X.fill(D.rim);                 // the child sits on its parent's floor: hide what is under it
  const st = (p, w, al, core = PAL.shine) => { X.globalAlpha = vis * al * .16; X.strokeStyle = PAL.steel2; X.lineWidth = w * 3.2 * px; X.stroke(p); X.globalAlpha = vis * al; X.strokeStyle = core; X.lineWidth = w * px; X.stroke(p); };
  const zw = Math.min(1.7, sc / 750);      // line weight grows with the level's size (self-similar up to a cap)
  st(D.slats, 1 * zw, .38); st(D.ups, 1.1 * zw, .55); st(D.fl, 1.4 * zw, .7); st(D.comb, 1.2 * zw, .6);
  X.globalAlpha = vis; X.fillStyle = PAL.night2; X.fill(D.plates); st(D.plates, 1.3 * zw, .95); st(D.cups, 1.2 * zw, .8);
  st(D.rim2, 1.4 * zw, .8); st(D.rim, 2.4 * zw, 1);
  X.restore();
}
function shotDroste(t, lt) {
  cosmos(t, { n: 120, a: .6 });
  // zoom progress in levels: a steady dive plus a push on every beat (E.out5 steps)
  const bpos = (t - T_DRO) / BEAT, u = .62 * bpos + .55 * (Math.floor(Math.max(0, bpos)) + E.out5(frac(Math.max(0, bpos)) / .55)) - .15;
  const Z0 = 1500, fx = 1230, fy = 560, k0 = Math.floor(u);
  for (let k = k0 - 1; k <= k0 + 6; k++) drosteLevel(k - u, Z0, fx, fy, 1);
  lySlam(36, t, { x: 100, y: 430, size: 150, rowScale: [1, 1.1], hi: '篮', lead: 1.2, moat: .2 });
  text('篮 ⊂ 篮 ⊂ 篮 ⊂ …', 104, 820, { size: 26, font: F.mono, weight: 600, col: PAL.steel1, track: 2 });
}

// =====================================================================================================================
// E · reverse explosion (所有东西 / 都回了家): every item flies back into its exact slot and locks in on the 16ths
// =====================================================================================================================
const HOME_SLOTS = (() => {
  const w = 560, d = 440, y0 = 60, x0 = -w / 2, S = [];
  for (let i = 0; i < 7; i++) S.push({ at: [x0 + 40 + w * .24, y0 + 136, 70 + i * 30], prof: PROF.plate, ax: [0, 0, 1], fill: i % 3 === 1 ? PAL.paper2 : PAL.paper });
  for (let i = 0; i < 3; i++) S.push({ at: [x0 + w * .78, y0 + 6 + i * 20, d * .3], prof: PROF.bowl, ax: [0, 1, 0], open: i === 2 });
  S.push({ at: [x0 + w * .78, y0 + 6, d * .72], prof: PROF.cup, ax: [0, 1, 0], open: true }, { at: [x0 + w * .64, y0 + 6, d * .74], prof: PROF.cup, ax: [0, 1, 0], open: true });
  const L = [0, 1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 8].map(k => LY[37].t[0] + k * BEAT / 4);   // last lock on 回 (118.315): the ✓ label gets time to read
  const C0 = frameCam([0, 150, 220], -.58, .5, 1230, 610, 760, 800, { fov: 28 });
  S.forEach((s, j) => {
    const a = j * 2.39996 + .5, rad = 430 + hash(j * 9.2) * 330, dx = Math.cos(a) * rad * (Math.cos(a) < 0 ? .75 : 1.25), dy = Math.sin(a) * rad * .72, dz = (hash(j * 5.7) - .5) * 500;
    s.from = vadd(s.at, vadd(vmul(C0.right, dx), vadd(vmul(C0.up, dy), vmul(C0.fwd, dz))));
    s.ax0 = vnorm([hash(j * 1.1) - .5, hash(j * 2.2) - .5, hash(j * 3.3) - .5]);
    s.land = L[j]; s.fly = .5 + hash(j * 4.4) * .12;
  });
  return S;
})();
let _hb = null;
const homeBasket = () => _hb ??= translate3(basketModel({ w: 560, d: 440, h: 150, type: 'dish' }), [0, 60, 0]);
function shotHome(t, lt) {
  cosmos(t, { dx: -t * 8, dy: t * 3 });
  let punch = 0; for (const s of HOME_SLOTS) { const d = t - s.land; if (d > 0 && d < .25) punch = Math.max(punch, 1 - d / .25); }
  const C = frameCam([0, 150, 220], -.58 + lt * .07, .5, 1230, 610, 760, 800 + lt * 30 + punch * 8, { fov: 28 });
  const prims = [...homeBasket()], trails = [], rings = [];
  HOME_SLOTS.forEach((s, j) => {
    const k = clamp((t - (s.land - s.fly)) / s.fly), e = Math.pow(k, 2.3);
    const drift = k > 0 ? 0 : (s.land - s.fly - t);
    const from = vadd(s.from, [Math.sin(j + t * .7) * 30 * drift, Math.cos(j * 2 + t * .6) * 30 * drift, 0]);
    const arc = Math.sin(k * Math.PI) * 140 * (1 - k * .5);
    const at = vadd(vlerp(from, s.at, e), [0, arc, 0]), ax = vnorm(vlerp(s.ax0, s.ax, E.io(k * 1.1)));
    prims.push({ ...lathe(at, s.prof, { fill: s.fill, open: s.open }), axisV: ax });
    if (k > 0 && k < 1) { const e0 = Math.pow(clamp(k - .14), 2.3); trails.push([C.project(vadd(vlerp(from, s.at, e0), [0, Math.sin(clamp(k - .14) * Math.PI) * 140, 0])), C.project(at)]); }
    const d = t - s.land; if (d >= 0 && d < .4) rings.push([C.project(s.at), d, j === HOME_SLOTS.length - 1]);
  });
  for (const [a, b] of trails) { X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); glowStroke(3, .55); }
  render3(prims, C, { style: 'glow', dark: true, lw: .62 + punch * .2 });
  for (const [q, d, last] of rings) {
    const e = E.out(d / .4);
    circle(q[0], q[1], 10 + 70 * e, { stroke: last ? PAL.orange : PAL.paper, w: 3 * (1 - e) + .5, a: 1 - e });
    sparkle(q[0], q[1], 26, { col: last ? PAL.orange : PAL.shine, k: 1 - e });
  }
  const dn = t - HOME_SLOTS[HOME_SLOTS.length - 1].land;
  if (dn > 0) { const q = E.out5(clamp(dn / .3)); text('ALL ITEMS HOME ✓', 1230, 1000, { size: 24, font: F.mono, weight: 700, col: PAL.paper, align: 'center', track: 3, a: q }); }
  lyHome(37, t, { x: 100, y: 390, size: 140, hi: '家' });
}

// =====================================================================================================================
// F · drawers to the horizon (越拉越多): a stack runs off to the vanishing point and pulls out in an exponential wave
// =====================================================================================================================
const HC = 600, HR = 4, HRH = 320, HDEP = 560, HEXT = 540;
// the drawer stack: columns j (z from −j·HC), HR rows; extOf(j, r) = how far each drawer is out; js = painter order (far first)
function drawStack(C, eye, js, extOf, o = {}) {
  const P3 = (x, y, z) => C.project([x, y, z]), poly4 = q => { X.beginPath(); q.forEach((p, m) => m ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); };
  const rows = [...Array(HR).keys()].sort((a, b) => Math.abs(b * HRH + HRH / 2 - eye[1]) - Math.abs(a * HRH + HRH / 2 - eye[1]));
  for (const j of js) {
    const z1 = -j * HC, z0 = z1 - HC, near = P3(0, 600, z1); if (near[2] < 60) continue;
    const ppu = near[3], small = ppu * HC < 8;
    if (small) {   // far columns: just the cell edges
      X.beginPath(); for (let r = 0; r <= HR; r++) { const a = P3(0, r * HRH, z0), b = P3(0, r * HRH, z1); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); }
      const a = P3(0, 0, z1), b = P3(0, HR * HRH, z1); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]);
      X.strokeStyle = rgba(PAL.steel2, .5); X.lineWidth = .8; X.stroke();
      const e1 = extOf(j, 1); if (e1 > 2) { X.beginPath(); const c = P3(-e1, HR * HRH * .5, (z0 + z1) / 2); X.arc(c[0], c[1], 1.4, 0, TAU); X.fillStyle = PAL.shine; X.fill(); }
      continue;
    }
    // carcass top (the counter edge) for this column
    poly4([P3(0, HR * HRH, z0), P3(HDEP, HR * HRH, z0), P3(HDEP, HR * HRH, z1), P3(0, HR * HRH, z1)]); X.fillStyle = PAL.night2; X.fill(); X.strokeStyle = rgba(PAL.steel2, .5); X.lineWidth = 1; X.stroke();
    for (const r of rows) {
      const y0 = r * HRH, y1 = y0 + HRH, ext = extOf(j, r);
      poly4([P3(0, y0, z0), P3(0, y1, z0), P3(0, y1, z1), P3(0, y0, z1)]);
      X.fillStyle = PAL.night; X.fill(); X.strokeStyle = rgba(PAL.steel2, .5); X.lineWidth = 1.2; X.stroke();
      if (ext < 2) {   // closed: the front sits flush
        poly4([P3(-2, y0 + 8, z0 + 8), P3(-2, y1 - 8, z0 + 8), P3(-2, y1 - 8, z1 - 8), P3(-2, y0 + 8, z1 - 8)]); X.fillStyle = PAL.night2; X.fill(); X.strokeStyle = rgba(PAL.steel2, .8); X.lineWidth = 1.3; X.stroke();
        if (o.flushHandle) { const h0 = P3(-3, y1 - 48, lerp(z0, z1, .3)), h1 = P3(-3, y1 - 48, lerp(z0, z1, .7)); line(h0[0], h0[1], h1[0], h1[1], clamp(ppu * 8, 1, 4), o.flushHandle(j, r)); }
        continue;
      }
      // pulled: the basket is a lit wire cage (see-through front), so the wave reads against the dark closed cells
      const zi0 = z0 + 34, zi1 = z1 - 34, yb = y0 + 30, yt = y1 - 64, big = ppu * HC > 45;
      X.beginPath();
      const seg = (a, b) => { const p = P3(...a), q = P3(...b); X.moveTo(p[0], p[1]); X.lineTo(q[0], q[1]); };
      for (const z of [zi0, zi1]) for (const y of [yb, yt, (yb + yt) / 2]) seg([0, y, z], [-ext, y, z]);
      for (const y of [yb, yt]) seg([-ext, y, zi0], [-ext, y, zi1]);
      if (big) { const nu = Math.max(3, Math.min(16, Math.floor(ext / 34))); for (let m = 1; m <= nu; m++) { const x = -ext * m / nu; seg([x, yt, zi1], [x, yb, zi1]); seg([x, yt, zi0], [x, yb, zi0]); seg([x, yb, zi0], [x, yb, zi1]); } }
      glowStroke(clamp(ppu * 3.2, .7, 2), .9);
      if (big) for (let m = 0; m < 4; m++) {   // plates standing in the rack: true projected circles
        const xc = -ext * (.2 + m * .19), yc = yb + 118, zc = lerp(zi0, zi1, .36), rr = 112;
        X.beginPath(); for (let q = 0; q <= 24; q++) { const a = q / 24 * TAU, pp = P3(xc, yc + Math.cos(a) * rr, zc + Math.sin(a) * rr); q ? X.lineTo(pp[0], pp[1]) : X.moveTo(pp[0], pp[1]); }
        X.fillStyle = PAL.night2; X.fill(); X.strokeStyle = PAL.paper; X.lineWidth = clamp(ppu * 3.5, .8, 2); X.stroke();
      }
      poly4([P3(-ext, y0 + 8, z0 + 8), P3(-ext, y1 - 8, z0 + 8), P3(-ext, y1 - 8, z1 - 8), P3(-ext, y0 + 8, z1 - 8)]);
      X.fillStyle = rgba(PAL.night2, .35); X.fill(); X.strokeStyle = PAL.steel2; X.lineWidth = clamp(ppu * 5, 1, 2.6); X.stroke();
      const h0 = P3(-ext - 2, y1 - 48, lerp(z0, z1, .3)), h1 = P3(-ext - 2, y1 - 48, lerp(z0, z1, .7));
      line(h0[0], h0[1], h1[0], h1[1], clamp(ppu * 10, 1, 5), o.hot && o.hot(j, r) ? PAL.orange : PAL.steel2);
    }
  }
}
function shotHorizon(t, lt) {
  const mv = clamp((t - T_HOR) / 2.1), ya = .5 - mv * .03, tl = -.02;     // a steady forward track along the stack
  const eye = [-2350, 1200 + mv * 100, 2500 - mv * 2200];
  const C = camera3({ eye, at: vadd(eye, [Math.sin(ya) * 1e4, Math.tan(tl) * 1e4, -Math.cos(ya) * 1e4]), fov: 42, cx: 1330, cy: 520 });
  const vp = C.project(vadd(eye, [0, 0, -1e9])), hy = vp[1];
  cosmos(t, { dx: -t * 20, clipY: hy - 4 });
  // floor grid below the horizon
  X.save(); X.beginPath(); X.rect(0, hy, W, H - hy); X.clip();
  X.beginPath();
  for (let m = -14; m <= 2; m++) { const a = C.project([m * 600, 0, 4000]), b = C.project([m * 600, 0, -6e5]); if (a[2] > 5) { X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); } }
  glowStroke(1, .2);
  X.beginPath();
  for (let j = -6; j < 70; j++) { const z = -j * j * 60 - j * 600; const a = C.project([-12000, 0, z]), b = C.project([HDEP, 0, z]); if (a[2] > 5 && b[2] > 5) { X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); } }
  glowStroke(1, .14);
  X.restore();
  X.beginPath(); X.moveTo(0, hy); X.lineTo(W, hy); glowStroke(1.6 + pulse(t, 5) * 1.4, .7 + .3 * pulse(t, 5));   // the horizon ticks on the beat
  // the stack: HR drawers high, running to the vanishing point. Wave front grows exponentially in time (越拉越多).
  const t0 = LY[38].t[0], al = 2.35, J = t < t0 ? -1 : 4 * (Math.exp(al * (t - t0)) - 1), NC = 280;
  const js = []; for (let j = NC - 1; j >= 0; j--) js.push(j);
  drawStack(C, eye, js, (j, r) => { const tp = t0 + Math.log(1 + j / 4) / al + r * .035; return t < tp ? 0 : HEXT * E.soft((t - tp) / .5); }, { hot: (j, r) => j === 0 && r === 1 });
  // counter (a joke readout, not a product claim)
  const cnt = J < 0 ? 0 : Math.floor((J + 1) * HR);
  text('拉篮 ×', 104, 990, { size: 30, font: F.sans, weight: 700, col: PAL.steel1 });
  text(J > 1000 ? '∞' : String(cnt), 214, 992, { size: 42, font: F.mono, weight: 800, col: PAL.paper });
  // lyric: one big line in the clear sky above the vanishing point
  const L = LY[38], env = lyEnv(38, t, .5, .2);
  if (env > 0) { LYRIC_DRAWN.add(38); X.save(); X.globalAlpha *= env; lySlamRow(L, t, 100, 300, 190, '拉'); X.restore(); }
}
function lySlamRow(L, t, x0, y, sz, hi) {
  let x = x0; const chars = [...L.text];
  for (const pass of [0, 1]) {
    x = x0;
    chars.forEach((ch, j) => {
      const k = chK(L.t[j], t, .2), w = measure(ch, sz, F.heavy, 900) - sz * .02;
      if (k > 0) {
        const s = lerp(1.35, 1, E.out5(k)), cx = x + w / 2, cy = y - sz * .38;
        X.save(); X.translate(cx, cy - (1 - E.out5(k)) * sz * .15); X.scale(s, s); X.translate(-cx, -cy);
        if (!pass) text(ch, x, y, { size: sz, font: F.heavy, weight: 900, col: null, stroke: PAL.night, sw: sz * .16, a: clamp(k * 3) });
        else text(ch, x, y, { size: sz, font: F.heavy, weight: 900, col: hi.includes(ch) ? PAL.orange : PAL.paper, a: clamp(k * 3) });
        X.restore();
      }
      x += w;
    });
  }
}

// =====================================================================================================================
// G · 越拉越稳: the bridge resolves on its own world. The drawer wall from F, seen head-on: every drawer glides home on the
// soft-close curve in a wave that closes in on the centre, the wall goes flush, and camera + stars stop dead on 122.917.
// =====================================================================================================================
const closeT = (j, r) => T_STEADY + .08 + 1.1 * (1 - Math.min(1, Math.abs(j - 1) / 10)) + r * .05 + hash(j * 7.1 + r) * .08;
const steadyExt = (t, j, r) => HEXT * (1 - E.soft((t - closeT(j, r)) / .8));
function shotSteady(t, lt) {
  const tt = Math.min(t, T_STOP), m = clamp((tt - T_STEADY) / (T_STOP - T_STEADY));   // linear clock that stops dead
  const eye = [-3150 + m * 380, 1000, 0], a = .2, tl = .052;
  const C = camera3({ eye, at: vadd(eye, [Math.cos(a) * 1e4, Math.tan(tl) * 1e4, -Math.sin(a) * 1e4]), fov: 40, cx: CX, cy: 540 });
  const top = C.project([0, HR * HRH, -600])[1];
  cosmos(t, { dx: -tt * 16, dy: tt * 3, glints: 4, clipY: top + 40 });
  // columns sorted far → near
  const js = []; for (let j = -16; j <= 60; j++) js.push(j);
  js.sort((p, q) => C.project([0, 600, -(q + .5) * HC])[2] - C.project([0, 600, -(p + .5) * HC])[2]);
  drawStack(C, eye, js, (j, r) => steadyExt(t, j, r), { flushHandle: (j, r) => (t >= T_STOP && j === 1 && r === 2) ? PAL.orange : PAL.steel1 });
  // a tick of light on each drawer as it lands home
  for (const j of js) for (let r = 0; r < HR; r++) {
    const d = t - (closeT(j, r) + .42); if (d < 0 || d > .3) continue;
    const q = C.project([-4, r * HRH + HRH - 48, -(j + .5) * HC]); if (q[2] < 60) continue;
    sparkle(q[0], q[1], 16 * q[3] * 40, { col: PAL.shine, k: 1 - d / .3 });
  }
  // the wall's top edge becomes a level line: steel while settling, signal orange on the dead stop
  const e0 = C.project([-2, HR * HRH, 10 * HC]), e1 = C.project([-2, HR * HRH, -40 * HC]);
  line(e0[0], e0[1], e1[0], e1[1], t >= T_STOP ? 4 : 2, t >= T_STOP ? PAL.orange : PAL.steel2, t >= T_STOP ? 1 : .6);
  // LAN, a figurine on top of the wall, hands on hips; she settles with everything else
  const lf = C.project([-160, HR * HRH, 3 * HC]), lp = lerpPose(move('idle', tt, 3), KP.hips, .85);
  figure(lf[0], lf[1], lf[3] * 44, lp, { who: 'lan', col: PAL.paper, dark: true, face: t >= T_STOP ? 'happy' : 'smile', blush: 1, shadow: false });
  metaStrip(t, { col: PAL.paper, a: .5, tl: 'BRIDGE  ·  SETTLE', br: 'CH.07  ·  THE KITCHEN SINGULARITY' });
  // big steady type in the sky: each character slides out of its slot like a drawer and settles (no bounce);
  // 稳 arrives at speed and stops dead on the downbeat
  const L = LY[39], env = lyEnv(39, t, .5, .2);
  if (env > 0) {
    LYRIC_DRAWN.add(39);
    const sz = 200, cs = 214, x0 = CX - cs * 2, y0 = top - cs - 40;
    X.save(); X.globalAlpha *= env;
    [...L.text].forEach((ch, j) => {
      const last = j === 3, k = last ? clamp((t - T_STOP + .2) / .2) : clamp((t - L.t[j] + .03) / .5), e = last ? Math.pow(k, 1.6) : E.soft(k); if (k <= 0) return;
      const x = x0 + j * cs;
      X.save(); X.beginPath(); X.rect(x - 4, y0 - 10, cs + 4, cs + 20); X.clip();
      text(ch, x + cs / 2 - (1 - e) * cs, y0 + cs * .5 + sz * .37, { size: sz, font: F.heavy, weight: 900, col: ch === '拉' ? PAL.orange : PAL.paper, align: 'center' });
      X.restore();
    });
    X.restore();
  }
}

chapter('bridge', 109.4, 123.5, [
  [109.4, shotSpiral(false)],
  [T_B, shotSpiral(true)],
  [T_GAL, shotGalaxy],
  [T_DRO, shotDroste],
  [T_HOME, shotHome],
  [T_HOR, shotHorizon],
  [T_STEADY, shotSteady],
]);
})();
