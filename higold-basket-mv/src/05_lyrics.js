// 05_lyrics.js — lyrics of the supplied HIGOLD song (.cache/song.wav), proofread from ASR; see LYRICS.md.
// Each line: {a, b, text, tok: [sung tokens in order], t: [onset per token]}. Tokens are Han characters or Latin words;
// "|" marks a preferred row break. Onsets are snapped to 16ths of the measured beat map (tools/lyrics2_build.py).
'use strict';
const LY = [
  {"a": -0.021, "b": 2.35, "text": "Give me an H!", "tok": ["Give", "me", "an", "H"], "t": [-0.021, 0.919, 1.129, 1.552]},
  {"a": 2.4, "b": 4.19, "text": "Give me an I!", "tok": ["Give", "me", "an", "I"], "t": [2.4, 2.718, 3.039, 3.467]},
  {"a": 4.219, "b": 5.77, "text": "G-O-L-D!", "tok": ["G", "O", "L", "D"], "t": [4.219, 4.648, 5.076, 5.504]},
  {"a": 5.826, "b": 7.76, "text": "What's that spell?", "tok": ["What's", "that", "spell"], "t": [5.826, 6.253, 6.36]},
  {"a": 7.861, "b": 9.261, "text": "HIGOLD!", "tok": ["HIGOLD"], "t": [7.861]},
  {"a": 10.648, "b": 12.048, "text": "HIGOLD!", "tok": ["HIGOLD"], "t": [10.648]},
  {"a": 14.719, "b": 18.21, "text": "周一早上|闹钟响三遍", "tok": ["周", "一", "早", "上", "闹", "钟", "响", "三", "遍"], "t": [14.719, 15.468, 15.788, 16.217, 16.751, 17.287, 17.501, 17.608, 17.929]},
  {"a": 18.25, "b": 22.29, "text": "冲进厨房|找我的煎蛋锅", "tok": ["冲", "进", "厨", "房", "找", "我", "的", "煎", "蛋", "锅"], "t": [18.25, 18.464, 18.785, 19.213, 19.535, 19.963, 20.285, 20.713, 21.142, 21.357]},
  {"a": 22.321, "b": 25.07, "text": "柜子里面|像一场考试", "tok": ["柜", "子", "里", "面", "像", "一", "场", "考", "试"], "t": [22.321, 22.535, 22.641, 22.963, 23.284, 23.712, 24.141, 24.355, 24.784]},
  {"a": 25.105, "b": 28.47, "text": "所有答案|都压在柜底下", "tok": ["所", "有", "答", "案", "都", "压", "在", "柜", "底", "下"], "t": [25.105, 25.319, 25.533, 25.961, 26.283, 26.498, 26.926, 27.141, 27.462, 27.997]},
  {"a": 28.53, "b": 31.15, "text": "Ready? Ready!", "tok": ["Ready", "Ready"], "t": [28.53, 30.454]},
  {"a": 31.198, "b": 32.47, "text": "Set? Set!", "tok": ["Set", "Set"], "t": [31.198, 31.626]},
  {"a": 32.483, "b": 34.11, "text": "一 二 三 走！", "tok": ["一", "二", "三", "走"], "t": [32.483, 32.913, 33.234, 33.663]},
  {"a": 34.2, "b": 36.73, "text": "One Two|拉出来", "tok": ["One", "Two", "拉", "出", "来"], "t": [34.2, 34.631, 35.169, 35.384, 35.599]},
  {"a": 36.777, "b": 40.534, "text": "碗碟调料|排好展开", "tok": ["碗", "碟", "调", "料", "排", "好", "展", "开"], "t": [36.777, 37.206, 37.635, 38.063, 38.171, 38.492, 38.706, 39.134]},
  {"a": 41.166, "b": 43.954, "text": "Three Four|推回来", "tok": ["Three", "Four", "推", "回", "来"], "t": [41.166, 41.379, 41.807, 42.127, 42.554]},
  {"a": 44.053, "b": 46.95, "text": "咔嗒一声|安静下来", "tok": ["咔", "嗒", "一", "声", "安", "静", "下", "来"], "t": [44.053, 44.16, 44.481, 44.909, 45.23, 45.551, 45.659, 46.087]},
  {"a": 47.05, "b": 50.81, "text": "不换柜子|也能 Hey Hey!", "tok": ["不", "换", "柜", "子", "也", "能", "Hey", "Hey"], "t": [47.05, 47.479, 47.8, 48.336, 48.657, 49.085, 49.406, 49.941]},
  {"a": 50.904, "b": 54.229, "text": "旧厨房|换个 style", "tok": ["旧", "厨", "房", "换", "个", "style"], "t": [50.904, 51.225, 51.759, 52.08, 52.401, 52.829]},
  {"a": 54.757, "b": 56.93, "text": "One Two|拉出来", "tok": ["One", "Two", "拉", "出", "来"], "t": [54.757, 55.293, 55.827, 55.934, 56.147]},
  {"a": 57.001, "b": 58.83, "text": "悍高拉篮", "tok": ["悍", "高", "拉", "篮"], "t": [57.001, 57.535, 57.749, 58.177]},
  {"a": 58.926, "b": 60.86, "text": "拉出来", "tok": ["拉", "出", "来"], "t": [58.926, 59.246, 59.46]},
  {"a": 60.955, "b": 64.25, "text": "室友说|这房子老得像课本", "tok": ["室", "友", "说", "这", "房", "子", "老", "得", "像", "课", "本"], "t": [60.955, 61.169, 61.383, 61.703, 62.023, 62.237, 62.45, 62.876, 63.09, 63.518, 63.946]},
  {"a": 64.267, "b": 67.91, "text": "我说不用砸|也不用换", "tok": ["我", "说", "不", "用", "砸", "也", "不", "用", "换"], "t": [64.267, 64.588, 64.908, 65.336, 65.764, 66.191, 66.511, 66.939, 67.26]},
  {"a": 68.008, "b": 71.35, "text": "量好尺寸|拧紧螺丝", "tok": ["量", "好", "尺", "寸", "拧", "紧", "螺", "丝"], "t": [68.008, 68.328, 68.862, 69.29, 69.824, 70.359, 70.573, 71.106]},
  {"a": 71.426, "b": 75.15, "text": "周末下午|搞定这一关", "tok": ["周", "末", "下", "午", "搞", "定", "这", "一", "关"], "t": [71.426, 71.639, 71.853, 72.174, 72.495, 72.922, 73.35, 73.883, 74.308]},
  {"a": 75.158, "b": 77.29, "text": "Ready? Ready!", "tok": ["Ready", "Ready"], "t": [75.158, 76.646]},
  {"a": 77.388, "b": 78.63, "text": "Set? Set!", "tok": ["Set", "Set"], "t": [77.388, 77.707]},
  {"a": 78.67, "b": 80.17, "text": "一 二 三 走！", "tok": ["一", "二", "三", "走"], "t": [78.67, 79.098, 79.419, 79.847]},
  {"a": 80.168, "b": 82.79, "text": "One Two|拉出来", "tok": ["One", "Two", "拉", "出", "来"], "t": [80.168, 80.705, 81.348, 81.455, 81.669]},
  {"a": 82.844, "b": 86.699, "text": "碗碟调料|排好展开", "tok": ["碗", "碟", "调", "料", "排", "好", "展", "开"], "t": [82.844, 83.378, 83.806, 84.233, 84.34, 84.66, 84.873, 85.299]},
  {"a": 87.324, "b": 90.09, "text": "Three Four|推回来", "tok": ["Three", "Four", "推", "回", "来"], "t": [87.324, 87.75, 88.176, 88.389, 88.709]},
  {"a": 90.096, "b": 93.07, "text": "咔嗒一声|安静下来", "tok": ["咔", "嗒", "一", "声", "安", "静", "下", "来"], "t": [90.096, 90.31, 90.63, 91.163, 91.376, 91.696, 91.803, 92.23]},
  {"a": 93.083, "b": 96.91, "text": "不换柜子|也能 Hey Hey!", "tok": ["不", "换", "柜", "子", "也", "能", "Hey", "Hey"], "t": [93.083, 93.616, 93.935, 94.254, 94.787, 95.213, 95.532, 96.064]},
  {"a": 96.915, "b": 100.338, "text": "旧厨房|换个 style", "tok": ["旧", "厨", "房", "换", "个", "style"], "t": [96.915, 97.448, 97.874, 98.193, 98.512, 98.938]},
  {"a": 100.746, "b": 103.15, "text": "One Two|拉出来", "tok": ["One", "Two", "拉", "出", "来"], "t": [100.746, 101.171, 101.703, 101.916, 102.129]},
  {"a": 103.193, "b": 104.83, "text": "悍高拉篮", "tok": ["悍", "高", "拉", "篮"], "t": [103.193, 103.725, 103.832, 104.258]},
  {"a": 104.896, "b": 106.934, "text": "拉出来", "tok": ["拉", "出", "来"], "t": [104.896, 105.215, 105.534]},
  {"a": 107.132, "b": 109.23, "text": "左边一个|放调料", "tok": ["左", "边", "一", "个", "放", "调", "料"], "t": [107.132, 107.877, 108.09, 108.196, 108.409, 108.621, 108.938]},
  {"a": 109.257, "b": 111.13, "text": "右边一个|放碗碟", "tok": ["右", "边", "一", "个", "放", "碗", "碟"], "t": [109.257, 109.47, 109.788, 110.0, 110.212, 110.318, 110.637]},
  {"a": 111.167, "b": 112.65, "text": "上面一层|下面一层", "tok": ["上", "面", "一", "层", "下", "面", "一", "层"], "t": [111.167, 111.273, 111.379, 111.697, 111.803, 112.015, 112.227, 112.545]},
  {"a": 112.651, "b": 114.73, "text": "所有东西", "tok": ["所", "有", "东", "西"], "t": [112.651, 112.863, 113.074, 113.497]},
  {"a": 114.765, "b": 117.435, "text": "站到|我眼前", "tok": ["站", "到", "我", "眼", "前"], "t": [114.765, 115.083, 115.295, 115.612, 116.035]},
  {"a": 119.525, "b": 122.17, "text": "One Two|拉出来", "tok": ["One", "Two", "拉", "出", "来"], "t": [119.525, 119.947, 120.264, 120.581, 120.792]},
  {"a": 122.27, "b": 125.785, "text": "碗碟调料|排好展开", "tok": ["碗", "碟", "调", "料", "排", "好", "展", "开"], "t": [122.27, 122.482, 122.799, 123.328, 123.434, 123.751, 123.963, 124.385]},
  {"a": 126.184, "b": 128.77, "text": "Three Four|推回来", "tok": ["Three", "Four", "推", "回", "来"], "t": [126.184, 126.713, 127.029, 127.346, 127.768]},
  {"a": 128.826, "b": 131.89, "text": "咔嗒一声|安静下来", "tok": ["咔", "嗒", "一", "声", "安", "静", "下", "来"], "t": [128.826, 129.354, 129.671, 130.2, 130.412, 130.73, 130.836, 131.26]},
  {"a": 131.895, "b": 136.11, "text": "不换柜子|也能 Hey Hey!", "tok": ["不", "换", "柜", "子", "也", "能", "Hey", "Hey"], "t": [131.895, 132.636, 132.954, 133.482, 133.799, 134.115, 134.537, 135.064]},
  {"a": 136.12, "b": 139.208, "text": "旧厨房|换个 style", "tok": ["旧", "厨", "房", "换", "个", "style"], "t": [136.12, 136.437, 136.859, 137.175, 137.492, 137.808]},
  {"a": 139.706, "b": 142.01, "text": "One Two|拉出来", "tok": ["One", "Two", "拉", "出", "来"], "t": [139.706, 140.338, 140.864, 140.97, 141.285]},
  {"a": 142.022, "b": 144.685, "text": "悍高拉篮", "tok": ["悍", "高", "拉", "篮"], "t": [142.022, 142.548, 142.758, 143.285]},
  {"a": 145.493, "b": 147.735, "text": "拉出来", "tok": ["拉", "出", "来"], "t": [145.493, 145.914, 146.335]},
  {"a": 152.22, "b": 154.46, "text": "拉出来", "tok": ["拉", "出", "来"], "t": [152.22, 152.745, 153.06]}
];

// ---------- lyric state ----------
const LYRIC_DRAWN = new Set();              // presenters record which line they drew this frame (checked by tools)
const lyIndex = t => LY.findIndex(l => t >= l.a - .08 && t < l.b + .25);
const isHan = c => /[\u4e00-\u9fff]/.test(c);
// rows of {ch, ti} split on "|": a token is a Han character or a Latin word (its onset from LY[i].t); spaces/punctuation get ti null.
// Trailing "，" is dropped from hero rows (row breaks do the pausing) unless keepPunct.
const TOKRE = /[\u4e00-\u9fff]|[A-Za-z][A-Za-z']*|\s+|[^\sA-Za-z\u4e00-\u9fff]/g;
function lyRows(i, keepPunct = false) {
  const L = LY[i]; let k = 0;
  return L.text.split('|').map(r => {
    const row = (keepPunct ? r : r.replace(/[，。]$/, '')).match(TOKRE) || [];
    return row.map(ch => ({ ch, ti: (isHan(ch) || /^[A-Za-z]/.test(ch)) && k < L.t.length ? L.t[k++] : null }));
  });
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
