// 04_ui.js — the web-brutalist layer: OS windows, detection boxes, cursors, toasts, progress bars, charts, stickers, tickers,
// spec callouts. Hard 2px ink borders, mono type, flat fills, zero gradients. Cobalt is reserved for "the computer's" marks.
'use strict';

// window chrome: win(x, y, w, h, title, {k: 0..1 open progress, dark, fill, body: fn(x, y, w, h) drawn clipped inside})
function win(x, y, w, h, title, o = {}) {
  const k = o.k ?? 1; if (k < .01) return;
  const hh = h * E.back(k, 1.2), bar = 40, dark = o.dark;
  X.save(); X.globalAlpha *= (o.a ?? 1);
  rect(x + 10, y + 10, w, hh, dark ? '#000' : PAL.ink, .9);                                   // hard offset shadow
  rect(x, y, w, hh, o.fill ?? (dark ? PAL.night2 : PAL.paper));
  rect(x, y, w, Math.min(bar, hh), dark ? PAL.steel0 : PAL.ink);
  X.strokeStyle = dark ? PAL.steel2 : PAL.ink; X.lineWidth = 3; X.strokeRect(x, y, w, hh);
  if (hh > 20) {
    for (let i = 0; i < 3; i++) rect(x + 14 + i * 22, y + 13, 14, 14, i === 0 ? (o.btn ?? PAL.orange) : PAL.paper);   // o.btn: close-button colour
    text(title, x + 88, y + 27, { size: 19, font: F.mono, weight: 600, col: PAL.paper, track: 1 });
  }
  if (o.body && hh > bar + 8) { X.save(); X.beginPath(); X.rect(x, y + bar, w, hh - bar); X.clip(); o.body(x, y + bar, w, hh - bar); X.restore(); }
  X.restore();
}
// computer-vision style detection box with label
function bbox(x, y, w, h, label, o = {}) {
  const k = o.k ?? 1; if (k < .01) return; const col = o.col ?? PAL.cobalt, c = Math.min(w, h) * .18;
  X.save(); X.globalAlpha *= (o.a ?? 1) * clamp(k * 3);
  const g = 1 + (1 - E.out(k)) * .25; X.translate(x + w / 2, y + h / 2); X.scale(g, g); X.translate(-w / 2, -h / 2);
  X.strokeStyle = col; X.lineWidth = o.lw ?? 3; X.setLineDash(o.dash ?? []); X.strokeRect(0, 0, w, h); X.setLineDash([]);
  X.lineWidth = (o.lw ?? 3) * 2; X.beginPath();
  for (const [px, py, dx, dy] of [[0, 0, 1, 1], [w, 0, -1, 1], [w, h, -1, -1], [0, h, 1, -1]]) { X.moveTo(px + dx * c, py); X.lineTo(px, py); X.lineTo(px, py + dy * c); }
  X.stroke();
  if (label) {
    X.font = `600 ${o.size ?? 20}px ${F.mono}`; const tw = X.measureText(label).width + 16;
    X.fillStyle = col; X.fillRect(-1.5, -(o.size ?? 20) - 14, tw, (o.size ?? 20) + 14); X.fillStyle = PAL.paper; X.textBaseline = 'middle'; X.fillText(label, 7, -((o.size ?? 20) + 14) / 2);
  }
  X.restore();
}
// arrow cursor (click: 0..1 press ring)
function cursor(x, y, o = {}) {
  const s = o.s ?? 1.4;
  X.save(); X.translate(x, y); X.scale(s, s);
  if (o.click) { circle(0, 0, 10 + 30 * E.out(o.click), { stroke: o.col ?? PAL.cobalt, w: 3 * (1 - o.click), a: 1 - o.click }); }
  X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 30); X.lineTo(8, 23); X.lineTo(14, 35); X.lineTo(19, 33); X.lineTo(13, 21); X.lineTo(23, 21); X.closePath();
  X.fillStyle = o.fill ?? PAL.ink; X.fill(); X.strokeStyle = PAL.paper; X.lineWidth = 2; X.stroke(); X.restore();
}
// notification toast: toast(x, y, w, title, body, {k, icon, dark})
function toast(x, y, w, title, body, o = {}) {
  const k = o.k ?? 1; if (k < .01) return; const h = o.h ?? 96, dx = (1 - E.back(k)) * (o.from ?? 60);
  X.save(); X.globalAlpha *= clamp(k * 2) * (o.a ?? 1); X.translate(dx, 0);
  rect(x + 8, y + 8, w, h, PAL.ink); rect(x, y, w, h, o.fill ?? PAL.paper); X.strokeStyle = PAL.ink; X.lineWidth = 3; X.strokeRect(x, y, w, h);
  rect(x + 16, y + 18, 60, 60, o.iconCol ?? PAL.orange); text(o.icon ?? '✓', x + 46, y + 60, { size: 36, font: F.heavy, weight: 900, col: PAL.paper, align: 'center' });
  text(title, x + 94, y + 40, { size: 26, font: F.sans, weight: 800, col: PAL.ink });
  text(body, x + 94, y + 74, { size: 21, font: F.sans, weight: 400, col: PAL.ink2 });
  X.restore();
}
// progress bar with blocky fill + % readout
function progress(x, y, w, p, label, o = {}) {
  const h = o.h ?? 44, blocks = o.blocks ?? 20, bw = (w - 8) / blocks;
  X.save(); X.globalAlpha *= (o.a ?? 1);
  rect(x, y, w, h, o.dark ? PAL.night2 : PAL.paper); X.strokeStyle = o.dark ? PAL.steel2 : PAL.ink; X.lineWidth = 3; X.strokeRect(x, y, w, h);
  const nb = Math.floor(clamp(p) * blocks + 1e-6);
  for (let i = 0; i < nb; i++) rect(x + 4 + i * bw + 2, y + 6, bw - 4, h - 12, o.col ?? PAL.ink);
  if (label) text(label, x, y - 14, { size: 22, font: F.mono, weight: 600, col: o.dark ? PAL.paper : PAL.ink });
  text(Math.round(clamp(p) * 100) + '%', x + w, y - 14, { size: 22, font: F.mono, weight: 700, col: o.dark ? PAL.paper : PAL.ink, align: 'right' });
  X.restore();
}
// sticker / pill label with hard shadow, slight rotation; returns width
function sticker(x, y, str, o = {}) {
  const k = o.k ?? 1; if (k < .01) return 0; const size = o.size ?? 34, font = o.font ?? F.heavy, wt = o.weight ?? 900;
  const tw = measure(str, size, font, wt), pw = tw + size * 1.1, ph = size * 1.6, s = E.back(k, 2.2);
  X.save(); X.translate(x, y); X.rotate(o.rot ?? -.05); X.scale(s, s); X.globalAlpha *= (o.a ?? 1);
  rrect(-pw / 2 + 6, -ph / 2 + 6, pw, ph, o.r ?? ph / 2, { fill: PAL.ink });
  rrect(-pw / 2, -ph / 2, pw, ph, o.r ?? ph / 2, { fill: o.fill ?? PAL.orange, stroke: PAL.ink, w: 3 });
  text(str, 0, size * .36, { size, font, weight: wt, col: o.col ?? PAL.paper, align: 'center' });
  X.restore(); return pw;
}
// marquee ticker band across the frame
function ticker(y, str, t, o = {}) {
  const h = o.h ?? 64, size = o.size ?? 34, sp = o.speed ?? 180, font = o.font ?? F.heavy;
  X.save(); X.translate(0, y); X.rotate(o.rot ?? 0);
  rect(-100, -h / 2, W + 200, h, o.bg ?? PAL.ink);
  const unit = str + '   ✦   ', uw = measure(unit, size, font, 900);
  let x0 = -((t * sp) % uw) - 100 * (o.dir === -1 ? 0 : 1); if (o.dir === -1) x0 = ((t * sp) % uw) - uw;
  for (let x = x0; x < W + 100; x += uw) text(unit, x, size * .36, { size, font, weight: 900, col: o.col ?? PAL.paper });
  X.restore();
}
// spec callout: dot on the object, elbow leader, mono label
function callout(x1, y1, x2, y2, label, o = {}) {
  const k = o.k ?? 1; if (k < .01) return; const col = o.col ?? PAL.ink;
  circle(x1, y1, 7 * E.back(clamp(k * 3)), { fill: o.dot ?? PAL.orange, stroke: col, w: 2.5 });
  const mx = x2, my = y2, p = clamp(k * 1.6 - .2);
  if (p > 0) { const [ex, ey] = [lerp(x1, mx, E.out(p)), lerp(y1, my, E.out(p))]; line(x1, y1, ex, ey, 2.5, col); }
  if (k > .5) {
    const q = E.out((k - .5) * 2), dir = o.dir ?? (x2 > x1 ? 1 : -1), lw = measure(label, o.size ?? 26, F.mono, 600) + 20;
    line(mx, my, mx + dir * lw * q, my, 2.5, col);
    X.save(); X.beginPath(); X.rect(dir > 0 ? mx : mx - lw, my - 40, lw, 40); X.clip();
    text(label, mx + dir * 10, my - 12, { size: o.size ?? 26, font: F.mono, weight: 600, col, align: dir > 0 ? 'left' : 'right', a: q });
    X.restore();
  }
}
// "scaling law" chart: axes, log-ish grid, a curve drawn to progress p, labelled points
function scalingChart(x, y, w, h, p, o = {}) {
  const col = o.col ?? PAL.ink, dark = o.dark;
  X.save(); X.globalAlpha *= (o.a ?? 1);
  if (!o.noFrame) { rect(x, y, w, h, dark ? PAL.night2 : PAL.paper); X.strokeStyle = col; X.lineWidth = 3; X.strokeRect(x, y, w, h); }
  const px = x + 90, py = y + h - 70, pw = w - 140, ph = h - 150;
  X.strokeStyle = rgba(col, .18); X.lineWidth = 1.5; X.beginPath();
  for (let i = 0; i <= 5; i++) { const yy = py - ph * i / 5; X.moveTo(px, yy); X.lineTo(px + pw, yy); }
  for (let i = 0; i <= 6; i++) { const xx = px + pw * i / 6; X.moveTo(xx, py); X.lineTo(xx, py - ph); } X.stroke();
  line(px, py, px + pw + 20, py, 3, col); line(px, py, px, py - ph - 20, 3, col);
  text(o.yl ?? '收纳效率', px - 18, py - ph - 34, { size: 22, font: F.mono, weight: 600, col });
  text(o.xl ?? '拉篮数量 →', px + pw, py + 44, { size: 22, font: F.mono, weight: 600, col, align: 'right' });
  if (o.title) text(o.title, x + 24, y + 48, { size: 30, font: F.grotesk, weight: 700, col });
  const f = u => Math.pow(u, 3.2) * .96 + u * .04, pts = [];
  for (let i = 0; i <= 80 * clamp(p); i++) { const u = i / 80; pts.push([px + u * pw, py - f(u) * ph]); }
  if (pts.length > 1) { X.strokeStyle = o.curve ?? PAL.orange; X.lineWidth = 6; X.lineCap = 'round'; X.beginPath(); pts.forEach((q, i) => i ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1])); X.stroke(); }
  (o.points ?? []).forEach(([u, lab], i) => { if (p < u) return; const qx = px + u * pw, qy = py - f(u) * ph, k = E.back(clamp((p - u) * 8));
    circle(qx, qy, 10 * k, { fill: PAL.paper, stroke: col, w: 3 }); text(lab, qx - 16, qy - 20, { size: 20, font: F.mono, weight: 600, col, align: 'right', a: k }); });
  X.restore();
}
// speedrun splits panel (LiveSplit-ish)
function splits(x, y, rows, t0, t, o = {}) {
  const w = o.w ?? 460, rh = 52;
  X.save(); X.globalAlpha *= (o.a ?? 1);
  rect(x, y, w, rh * (rows.length + 2), PAL.night); X.strokeStyle = PAL.steel1; X.lineWidth = 2; X.strokeRect(x, y, w, rh * (rows.length + 2));
  text(o.title ?? 'KITCHEN% any%', x + 18, y + 34, { size: 22, font: F.mono, weight: 700, col: PAL.steel2 });
  rows.forEach(([name, at], i) => {
    const yy = y + rh * (i + 1), done = t >= at;
    if (!done && (i === 0 || t >= rows[i - 1][1])) rect(x + 2, yy + 4, w - 4, rh - 8, PAL.night2);
    text(name, x + 18, yy + 34, { size: 24, font: F.sans, weight: 600, col: PAL.paper });
    if (done) text('−' + (1 + hash(i) * 3).toFixed(1), x + w - 150, yy + 34, { size: 22, font: F.mono, weight: 700, col: '#3BD16F', align: 'right' });
    if (done) text((at - t0).toFixed(2), x + w - 18, yy + 34, { size: 22, font: F.mono, weight: 700, col: PAL.paper, align: 'right' });
  });
  const el = Math.max(0, t - t0), yy = y + rh * (rows.length + 1);
  text(el.toFixed(2), x + w - 18, yy + 40, { size: 44, font: F.mono, weight: 800, col: '#3BD16F', align: 'right' });
  X.restore();
}
// search bar with typed query (chars revealed over [a, b]) and a blinking caret
function searchBar(x, y, w, query, a, b, t, o = {}) {
  const h = o.h ?? 84, n = Math.floor(clamp((t - a) / (b - a)) * [...query].length + 1e-6), q = [...query].slice(0, n).join('');
  X.save(); X.globalAlpha *= (o.a ?? 1);
  rect(x + 8, y + 8, w, h, PAL.ink); rect(x, y, w, h, PAL.paper); X.strokeStyle = PAL.ink; X.lineWidth = 3; X.strokeRect(x, y, w, h);
  handCircle(x + 46, y + h / 2 - 4, 17, { w: 4, seed: 71 }); line(x + 58, y + h / 2 + 8, x + 70, y + h / 2 + 20, 5);
  text(q, x + 96, y + h / 2 + 14, { size: o.size ?? 40, font: F.sans, weight: 500 });
  const cw = measure(q, o.size ?? 40, F.sans, 500); if (Math.floor(t * 2.5) % 2 === 0 || n < [...query].length) rect(x + 100 + cw, y + 18, 4, h - 36, PAL.cobalt);
  X.restore();
}
// barcode (decorative)
function barcode(x, y, w, h, seed = 1, col = PAL.ink) {
  X.save(); X.fillStyle = col; let xx = x; let i = 0;
  while (xx < x + w) { const bw = 1 + Math.floor(hash(seed + i) * 4) * 1.5; if (i % 2 === 0) X.fillRect(xx, y, bw, h); xx += bw + 1; i++; }
  X.restore();
}
// K-pop teaser metadata strip: small mono text blocks in the corners
function metaStrip(t, o = {}) {
  const col = o.col ?? PAL.ink, a = o.a ?? 1;
  text('HIGOLD 悍高', 64, 70, { size: 24, font: F.sans, weight: 700, col, a, track: 2 });
  text(o.tl ?? 'PULL-OUT BASKET  ·  M/V', 64, 102, { size: 18, font: F.mono, weight: 500, col, a, track: 1 });
  const tc = `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(2).padStart(5, '0')}`;
  text(tc, W - 64, 70, { size: 22, font: F.mono, weight: 600, col, a, align: 'right' });
  if (o.br) text(o.br, W - 64, H - 54, { size: 18, font: F.mono, weight: 500, col, a, align: 'right', track: 1 });
}
