// 90_frame.js — frame entry points for the renderer (renderAt / renderSheet / SPECIMEN) and the interactive studio player.
'use strict';
const OUT = document.getElementById('out'), OCTX = OUT.getContext('2d');
X = OCTX;

function renderFrame(t) {
  t = clamp(t, 0, DUR - 1 / FPS);
  T = t; BOIL = Math.floor(t * 12); LYRIC_DRAWN.clear();
  X = OCTX; X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.filter = 'none';
  const dark = drawWorld(t);
  X = OCTX; X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  paperGrain(1, dark);
}
window.renderAt = (t, type = 'image/jpeg', q = .92) => { renderFrame(t); return OUT.toDataURL(type, q); };
window.lyricsAt = t => { renderFrame(t); return [...LYRIC_DRAWN]; };
window.renderSheet = (ts, cols = 3, w = 640) => {
  const h = Math.round(w * H / W), rows = Math.ceil(ts.length / cols), c = document.createElement('canvas');
  c.width = cols * w + (cols + 1) * 6; c.height = rows * (h + 30) + 6; const g = c.getContext('2d');
  g.fillStyle = '#222'; g.fillRect(0, 0, c.width, c.height); const ms = [];
  ts.forEach((t, i) => {
    const t0 = performance.now(); renderFrame(t); ms.push(Math.round(performance.now() - t0));
    const x = 6 + (i % cols) * (w + 6), y = 6 + Math.floor(i / cols) * (h + 30);
    g.drawImage(OUT, x, y, w, h); g.fillStyle = '#eee'; g.font = '600 18px monospace'; g.fillText(`t=${t.toFixed(2)}  ${ms[i]}ms`, x + 4, y + h + 21);
  });
  return { url: c.toDataURL('image/jpeg', .9), ms };
};
window.SPECIMEN = () => {
  T = 0; BOIL = 0; X = OCTX; X.setTransform(1, 0, 0, 1, 0, 0); paperBG();
  const s = '一拉就到位 厨房拉篮 HIGOLD 悍高';
  const rows = [['heavy 900', F.heavy, 900], ['smiley', F.smiley, 400], ['serif 900', F.serif, 900], ['qing', F.qing, 400], ['hand(Mang)', F.hand, 400], ['pen', F.pen, 400], ['anton', F.anton, 400], ['serifI', F.serifI, 400], ['mono', F.mono, 600], ['grotesk', F.grotesk, 700]];
  rows.forEach(([n, f, w], i) => { text(n, 40, 70 + i * 100, { size: 20, font: F.mono, col: PAL.grey }); text(s, 260, 80 + i * 100, { size: 72, font: f, weight: w }); });
  marker('一拉就到位', 1500, 900, { size: 110, align: 'center' });
  paperGrain(1);
  return OUT.toDataURL('image/png');
};

// ---------- boot ----------
(async () => {
  makePaper();
  const fams = [['900 80px NotoSans', '拉篮一就到位'], ['400 80px NotoSans', '拉篮'], ['900 80px NotoSerif', '拉篮'], ['80px Smiley', '拉篮'], ['80px Qingke', '拉篮'],
    ['80px Mang', '拉篮'], ['80px MaShan', '一拉就到位嗒跪着翻找退休了'], ['80px LongCang', '拉篮'], ['80px Anton', 'A'], ['80px Instrument', 'A'], ['80px InstrumentI', 'A'], ['600 80px Mono', 'A'], ['700 80px Grotesk', 'A'], ['80px Archivo', 'A']];
  await Promise.all(fams.map(([f, s]) => document.fonts.load(f, s).catch(e => console.warn('font', f, e))));
  await document.fonts.ready;
  window.ready = true;
  if (location.search.includes('render')) return;
  // interactive studio: scrub + play with the song as the master clock
  const scrub = document.getElementById('scrub'), tt = document.getElementById('tt'), song = document.getElementById('song'), play = document.getElementById('play');
  const show = t => { renderFrame(t); tt.textContent = t.toFixed(2) + ' s  · beat ' + beatN(t); };
  scrub.oninput = () => { song.currentTime = +scrub.value; show(+scrub.value); };
  play.onclick = () => { if (song.paused) { song.play(); play.textContent = 'pause'; } else { song.pause(); play.textContent = 'play'; } };
  const loop = () => { if (!song.paused) { scrub.value = song.currentTime; show(song.currentTime); } requestAnimationFrame(loop); };
  show(0); loop();
})();
