// 05_lyrics.js — original Chinese lyrics about the HIGOLD pull-out basket (written for this video; only the song's phrase timing
// is reused). Each line: {a, b, text, t: [per-character onset times snapped to the song's 16th grid]}. "|" marks a preferred line break.
'use strict';
const LY = [
  {"a":1.5,"b":5.9,"text":"我家橱柜|深处有黑洞","t":[1.554,1.895,2.235,2.917,3.258,3.599,4.281,4.963,5.645]},
  {"a":6,"b":7.9,"text":"锅碗瓢盆全失踪","t":[5.985,6.326,6.667,7.008,7.349,7.52,7.69]},
  {"a":8,"b":8.95,"text":"跪着翻找","t":[8.031,8.201,8.372,8.542]},
  {"a":9,"b":12.4,"text":"调料瓶倒成一片|找不到盐","t":[9.054,9.224,9.395,9.735,9.906,10.417,10.588,11.099,11.27,11.44,11.781]},
  {"a":13,"b":16.5,"text":"直到那天|我拉开了你","t":[12.974,13.145,13.315,13.656,13.826,14.508,14.679,15.19,15.872]},
  {"a":17.9,"b":22.5,"text":"阻尼一收，|刚刚好","t":[17.917,18.258,18.599,18.77,19.281,19.963,20.645]},
  {"a":23,"b":24.4,"text":"一拉就到位","t":[23.031,23.372,23.542,24.054,24.224]},
  {"a":24.5,"b":26.4,"text":"锅碗瓢盆排队","t":[24.565,24.735,24.906,25.076,25.417,26.099]},
  {"a":26.5,"b":27.9,"text":"调料一眼看见","t":[26.44,26.781,26.951,27.122,27.292,27.463]},
  {"a":28,"b":29.4,"text":"不用再弯腰","t":[27.974,28.145,28.315,28.826,29.167]},
  {"a":29.5,"b":33.4,"text":"钢丝闪闪发亮","t":[29.508,30.19,30.872,31.554,32.235,32.917]},
  {"a":33.5,"b":35.5,"text":"每一次拉开|都心动","t":[33.429,33.599,33.77,33.94,34.281,34.622,34.963,35.133]},
  {"a":38.5,"b":41.4,"text":"一个抽屉|变成两个","t":[38.542,38.713,39.054,39.735,39.906,40.417,40.588,41.099]},
  {"a":41.5,"b":44.9,"text":"两个变成|整面墙的拉篮","t":[41.44,41.781,41.951,42.122,42.292,42.463,43.145,43.315,43.826,44.508]},
  {"a":45,"b":48.5,"text":"收纳效率|指数一样往上涨","t":[45.02,45.19,45.36,45.531,45.872,46.042,46.554,46.895,47.235,47.406,47.917]},
  {"a":49.4,"b":51.9,"text":"做一顿饭|像在速通","t":[49.281,49.451,49.963,50.645,50.815,50.985,51.326,51.497]},
  {"a":53.4,"b":58.4,"text":"厨房，|开始加速","t":[53.372,54.054,54.735,55.417,55.929,56.099]},
  {"a":59,"b":60.4,"text":"一拉就到位","t":[58.997,59.167,59.508,60.02,60.19]},
  {"a":60.5,"b":62.4,"text":"左边调料|右边锅","t":[60.531,60.872,61.042,61.213,61.383,61.554,62.235]},
  {"a":63,"b":64.4,"text":"轻轻一嗒","t":[62.917,63.258,63.599,63.77]},
  {"a":64.5,"b":65.9,"text":"阻尼稳稳|收回原位","t":[64.451,64.622,64.792,64.963,65.133,65.304,65.474,65.645]},
  {"a":66,"b":68.5,"text":"满满一篮|也拉得动","t":[65.985,66.326,66.497,67.008,67.179,67.349,67.69,67.86]},
  {"a":70,"b":72.9,"text":"关上柜门|一片清净","t":[69.906,70.076,70.417,70.588,71.099,71.27,71.781,72.463]},
  {"a":73,"b":77.4,"text":"转角|不再是死角","t":[73.145,73.315,73.826,73.997,74.508,75.19,76.042]},
  {"a":77.5,"b":81,"text":"高柜一拉|看到底","t":[77.406,77.917,78.599,78.77,79.281,79.963,80.645]},
  {"a":81.4,"b":84.9,"text":"吊柜|轻轻降下来","t":[81.326,82.008,82.69,82.86,83.372,84.054,84.735]},
  {"a":85,"b":88,"text":"不用踮脚|去够","t":[84.906,85.417,86.099,86.781,86.951,87.463]},
  {"a":89.4,"b":95,"text":"蹲下翻找，|退休了","t":[89.338,89.508,89.849,90.872,91.554,92.406,92.917]},
  {"a":95.4,"b":97.4,"text":"一拉就到位","t":[95.474,95.815,96.326,96.838,97.008]},
  {"a":97.5,"b":98.9,"text":"收纳焦虑|全下线","t":[97.52,97.69,97.86,98.031,98.372,98.542,98.713]},
  {"a":99,"b":100.4,"text":"强迫症狂喜","t":[98.883,99.395,99.735,99.906,100.076]},
  {"a":100.5,"b":102.4,"text":"每样东西|有位置","t":[100.588,100.758,100.929,101.099,101.781,101.951,102.122]},
  {"a":102.5,"b":104.4,"text":"一眼找到|不用翻","t":[102.463,102.804,103.145,103.315,103.656,103.826,104.167]},
  {"a":105.4,"b":109.4,"text":"这就是|厨房的新秩序","t":[105.36,105.872,106.042,106.554,107.235,107.406,107.917,108.429,108.599]},
  {"a":109.4,"b":113.4,"text":"一格一格|往外拉","t":[109.281,109.451,109.622,109.963,110.133,110.645,110.815]},
  {"a":113.5,"b":115.4,"text":"拉出|整个银河系","t":[113.542,113.713,114.054,114.224,114.395,114.735,114.906]},
  {"a":115.5,"b":116.9,"text":"篮子里面|还有篮","t":[115.417,115.588,115.758,115.929,116.099,116.27,116.44]},
  {"a":117,"b":118.9,"text":"所有东西|都回了家","t":[116.951,117.122,117.463,117.804,118.145,118.315,118.485,118.656]},
  {"a":119,"b":120.4,"text":"越拉越多","t":[118.997,119.508,119.679,120.19]},
  {"a":120.9,"b":123.4,"text":"越拉越稳","t":[120.872,121.554,122.406,122.917]},
  {"a":123.5,"b":125.9,"text":"一拉就到位","t":[123.599,123.77,124.281,124.963,125.645]},
  {"a":126,"b":127.9,"text":"整个厨房|都在线","t":[125.985,126.156,126.326,126.667,126.838,127.008,127.69]},
  {"a":128,"b":129.9,"text":"每个角落|闪亮","t":[128.031,128.372,128.542,128.713,129.054,129.735]},
  {"a":130,"b":131.9,"text":"悍高拉篮，|全拉满","t":[129.906,130.076,130.417,130.588,130.758,131.099,131.27]},
  {"a":132,"b":135.4,"text":"轻轻一嗒，|收好这一天","t":[131.951,132.122,132.463,132.804,133.145,133.315,133.826,134.508,135.19]},
  {"a":137.4,"b":140.5,"text":"一拉就到位","t":[137.406,137.917,138.258,139.11,139.963]}
];

// ---------- lyric state ----------
const LYRIC_DRAWN = new Set();              // presenters record which line they drew this frame (checked by tools)
const lyIndex = t => LY.findIndex(l => t >= l.a - .08 && t < l.b + .25);
const isHan = c => /[一-鿿]/.test(c);
// rows of {ch, ti (onset or null)} split on "|"; trailing "，" removed from hero rows (line breaks do the pausing)
function lyRows(i, keepPunct = false) {
  const L = LY[i]; let k = 0;
  return L.text.split('|').map(r => [...(keepPunct ? r : r.replace(/[，。]$/, ''))].map(ch => ({ ch, ti: isHan(ch) ? L.t[k++] : null })));
}
// appear progress of a char (0 before its onset, 1 ~0.2 s after); punctuation follows the previous char
function chK(ti, t, dur = .2) { return ti == null ? 1 : clamp((t - ti + .03) / dur); }
// line envelope: in (0..1) as the first char lands, out (1..0) after the line ends (hold = extra seconds on screen)
function lyEnv(i, t, hold = .15, fade = .22) { const L = LY[i]; return clamp((t - L.t[0] + .06) / .12) * (1 - clamp((t - L.b - hold) / fade)); }
// sung progress 0..1 across the line (for karaoke fills)
function lySung(i, t) { const L = LY[i], n = L.t.length; let c = 0; for (let k = 0; k < n; k++) c += chK(L.t[k], t, .25); return c / n; }

// ---------- presenters ----------
// All take (i, t, o). Coordinates are canvas px. Each marks LYRIC_DRAWN.

// HERO: huge per-character slam type. o: {x, y (baseline of first row), size, lead (row gap factor), font, weight, col, hi (string of
// chars to paint orange), align ('left'|'center'|'right'), stroke (outline colour → outline type), sw, skew, hold, exit ('up'|'fade'|'cut'),
// ghost (0..1 faint preview of unsung chars), drop (px the char falls in from), track, hiFill (with stroke: hi chars solid orange)}
function lyHero(i, t, o = {}) {
  if (i < 0) return; const env = lyEnv(i, t, o.hold ?? .15, o.fade ?? .2); if (env <= 0) return; LYRIC_DRAWN.add(i);
  const rows = lyRows(i), size = o.size ?? 200, font = o.font ?? F.heavy, wt = o.weight ?? 900, lead = (o.lead ?? 1.08) * size, track = o.track ?? -size * .02;
  const ex = o.exit ?? 'up', exK = 1 - env;
  X.save(); X.globalAlpha *= ex === 'fade' ? env : 1;
  if (ex === 'up') X.translate(0, -E.in(exK) * size * .6);
  rows.forEach((row, r) => {
    const widths = row.map(c => measure(c.ch, size, font, wt) + track), tw = widths.reduce((s, w) => s + w, 0) - track;
    let x = (o.x ?? CX) - (o.align === 'center' ? tw / 2 : o.align === 'right' ? tw : 0);
    const y = (o.y ?? CY) + r * lead;
    row.forEach((c, j) => {
      const k = chK(c.ti, t, o.dur ?? .2), wch = widths[j];
      const hot = o.hi && o.hi.includes(c.ch), col = hot ? PAL.orange : (o.col ?? PAL.ink);
      if (o.ghost && k < 1) text(c.ch, x, y, { size, font, weight: wt, col: null, stroke: rgba(o.col ?? PAL.ink, o.ghost), sw: 2 });
      if (k > 0) {
        const s = lerp(o.pop ?? 1.35, 1, E.out5(k)), dy = (1 - E.out5(k)) * -(o.drop ?? size * .18), a = ex === 'up' ? clamp(k * 3) * clamp(env * 3) : clamp(k * 3);
        X.save(); X.translate(x + wch / 2, y - size * .38 + dy); X.scale(s, s); X.translate(-(x + wch / 2), -(y - size * .38));
        if (o.stroke && hot && o.hiFill) text(c.ch, x, y, { size, font, weight: wt, col: PAL.orange, a, skew: o.skew });   // outline type, solid orange hook chars
        else if (o.stroke) text(c.ch, x, y, { size, font, weight: wt, col: null, stroke: hot ? PAL.orange : o.stroke, sw: o.sw ?? 5, a, skew: o.skew });
        else text(c.ch, x, y, { size, font, weight: wt, col, a, skew: o.skew });
        X.restore();
      }
      x += wch;
    });
  });
  X.restore();
}
// fit a hero line into a box: returns a size so the longest row fits width w
function lyFit(i, w, font = F.heavy, wt = 900, max = 260) {
  const rows = lyRows(i); let m = 0; for (const r of rows) m = Math.max(m, measure(r.map(c => c.ch).join(''), 100, font, wt));
  return Math.min(max, 100 * w / (m || 1));
}
// SIDE: a left-column stack with a line number and a thin rule; chars rise in. o: {x, y, size, font, weight, col, num, hand (use marker font)}
function lySide(i, t, o = {}) {
  if (i < 0) return; const env = lyEnv(i, t, o.hold ?? .2); if (env <= 0) return; LYRIC_DRAWN.add(i);
  const rows = lyRows(i), size = o.size ?? 110, x0 = o.x ?? 120, y0 = o.y ?? 420, lead = size * (o.lead ?? 1.18), font = o.font ?? F.smiley, wt = o.weight ?? 400, col = o.col ?? PAL.ink;
  X.save(); X.globalAlpha *= env;
  if (o.num !== false) {
    text(String(i + 1).padStart(2, '0') + ' /', x0, y0 - size * 1.05, { size: 26, font: F.mono, weight: 600, col: o.numCol ?? col, track: 2 });
    line(x0 + 80, y0 - size * 1.05 - 9, x0 + 80 + 220 * E.out(clamp((t - LY[i].a) / .5)), y0 - size * 1.05 - 9, 2.5, o.numCol ?? col);
  }
  rows.forEach((row, r) => {
    let x = x0; const y = y0 + r * lead;
    row.forEach(c => {
      const k = chK(c.ti, t, .22), cw = o.hand ? markerWidth(c.ch, size, F.hand) : measure(c.ch, size, font, wt);
      const hot = o.hi && o.hi.includes(c.ch), cc = hot ? PAL.orange : col;
      if (k > 0) {
        const dy = (1 - E.out5(k)) * size * .35;
        X.save(); X.beginPath(); X.rect(x - 10, y - size * 1.1, cw + 20, size * 1.45); X.clip();
        if (o.hand) marker(c.ch, x, y - size * .36 + dy, { size, col: cc });
        else text(c.ch, x, y + dy, { size, font, weight: wt, col: cc });
        X.restore();
      }
      x += cw + (o.track ?? 0);
    });
  });
  X.restore();
}
// SUB: understated subtitle on a paper tape with a karaoke underline. o: {x, y (centre), align, size, dark, tape (bool)}
function lySub(i, t, o = {}) {
  if (i < 0) return; const env = lyEnv(i, t, .1, .15); if (env <= 0) return; LYRIC_DRAWN.add(i);
  const str = LY[i].text.replace(/\|/g, ' '), size = o.size ?? 46, font = o.font ?? F.sans, wt = o.weight ?? 500;
  const tw = measure(str, size, font, wt, 2), x = o.x ?? CX, y = o.y ?? H - 120, x0 = o.align === 'left' ? x : x - tw / 2;
  X.save(); X.globalAlpha *= env;
  if (o.tape !== false) { X.save(); X.translate(x0 + tw / 2, y); X.rotate(o.rot ?? -.008); rect(-tw / 2 - 30, -size * .9, tw + 60, size * 1.6, o.dark ? PAL.ink : PAL.paper, .92); X.restore(); }
  text(str, x0, y + size * .35, { size, font, weight: wt, col: o.dark ? PAL.paper : PAL.ink, track: 2 });
  const p = lySung(i, t); line(x0, y + size * .62, x0 + tw * p, y + size * .62, 4, PAL.orange);
  X.restore();
}
// MARKER: handwritten brush lettering revealed stroke-by-stroke (left→right wipe per char). o: {x, y, size, col, rot, align}
function lyMarker(i, t, o = {}) {
  if (i < 0) return; const env = lyEnv(i, t, o.hold ?? .2); if (env <= 0) return; LYRIC_DRAWN.add(i);
  const rows = lyRows(i), size = o.size ?? 150, lead = size * (o.lead ?? 1.15), col = o.col ?? PAL.ink;
  X.save(); X.globalAlpha *= env; X.translate(o.x ?? CX, o.y ?? CY); X.rotate(o.rot ?? -.04);
  rows.forEach((row, r) => {
    const ws = row.map(c => markerWidth(c.ch, size) * .92), tw = ws.reduce((s, w) => s + w, 0);
    let x = o.align === 'left' ? 0 : o.align === 'right' ? -tw : -tw / 2; const y = r * lead;
    row.forEach((c, j) => {
      const k = chK(c.ti, t, .16);
      if (k > 0) { X.save(); X.beginPath(); X.rect(x - size * .3, y - size, (ws[j] + size * .6) * E.out(k), size * 2); X.clip();
        marker(c.ch, x, y, { size, col: o.hi && o.hi.includes(c.ch) ? PAL.orange : col, variant: j }); X.restore(); }
      x += ws[j];
    });
  });
  X.restore();
}
// VERTICAL: CJK column(s), top→bottom, columns right→left. o: {x (right column x), y (top), size, font, col, gap}
function lyVertical(i, t, o = {}) {
  if (i < 0) return; const env = lyEnv(i, t, o.hold ?? .2); if (env <= 0) return; LYRIC_DRAWN.add(i);
  const rows = lyRows(i), size = o.size ?? 120, font = o.font ?? F.serif, wt = o.weight ?? 900, gap = size * (o.gap ?? 1.25);
  X.save(); X.globalAlpha *= env;
  rows.forEach((row, r) => row.forEach((c, j) => {
    const k = chK(c.ti, t, .22); if (k <= 0) return;
    const x = (o.x ?? W - 200) - r * gap, y = (o.y ?? 160) + j * size * 1.02 + size;
    text(c.ch, x, y + (1 - E.out5(k)) * -size * .3, { size, font, weight: wt, col: o.hi && o.hi.includes(c.ch) ? PAL.orange : (o.col ?? PAL.ink), align: 'center', a: clamp(k * 3) });
  }));
  X.restore();
}
// ECHO: K-pop repetition — the line stacked in several rows alternating fill / outline, scrolling. o: {y, size, rows, speed, col, dark}
function lyEcho(i, t, o = {}) {
  if (i < 0) return; const env = lyEnv(i, t, o.hold ?? .1); if (env <= 0) return; LYRIC_DRAWN.add(i);
  const str = LY[i].text.replace(/[|，]/g, ''), size = o.size ?? 170, n = o.rows ?? 5, font = o.font ?? F.heavy, wt = 900, sung = lySung(i, t);
  const tw = measure(str + '　', size, font, wt), y0 = (o.y ?? CY) - (n - 1) * size * .5;
  X.save(); X.globalAlpha *= env;
  for (let r = 0; r < n; r++) {
    const dir = r % 2 ? 1 : -1, off = ((t * (o.speed ?? 160) * dir) % tw + tw) % tw - tw;
    const solid = r === Math.floor(n / 2), col = o.col ?? PAL.ink, vis = clamp(sung * n * 1.4 - Math.abs(r - Math.floor(n / 2)));
    if (vis <= 0) continue;
    for (let x = off - tw; x < W + tw; x += tw)
      text(str, x, y0 + r * size * .98 + size * .36, { size, font, weight: wt, col: solid ? (o.solidCol ?? PAL.orange) : null, stroke: solid ? null : col, sw: 3, a: vis });
  }
  X.restore();
}
