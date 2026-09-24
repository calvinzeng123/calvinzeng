// check.mjs — automated gates. node tools/check.mjs [--from=0 --to=156.6] [--fps=4]
//  1. source: no Math.random / Date.now / performance.now in scene code
//  2. lyric coverage: every lyric line in range is drawn by some presenter at 25/50/85% through the line
//  3. determinism: 6 sample frames rendered twice are byte-identical
//  4. frame time: max / mean ms per frame over a sweep at --fps (default 4)
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const from = +(args.from ?? 0), to = +(args.to ?? 156.6), fps = +(args.fps ?? 4);
let fail = 0; const bad = m => { fail++; console.log('✗ ' + m); }, ok = m => console.log('✓ ' + m);
// 1
const files = ['src', 'src/ch'].flatMap(d => readdirSync(d).filter(f => f.endsWith('.js')).map(f => d + '/' + f));
for (const f of files) { const s = readFileSync(f, 'utf8'); for (const pat of ['Math.random', 'Date.now', 'performance.now']) if (s.includes(pat) && !f.endsWith('90_frame.js')) bad(`${f} uses ${pat}`); }
ok('source scan done');
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(pathToFileURL(resolve('studio.html')).href + '?render'); await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
// 2
const LY = await page.evaluate(() => LY.map(l => [l.a, l.b, l.text]));
for (let i = 0; i < LY.length; i++) {
  const [a, b, txt] = LY[i]; if (b < from || a > to) continue;
  for (const f of [.25, .5, .85]) { const t = a + (b - a) * f; const drawn = await page.evaluate(t => window.lyricsAt(t), t); if (!drawn.includes(i)) bad(`lyric ${i} "${txt}" not drawn at t=${t.toFixed(2)}`); }
}
ok('lyric coverage checked');
// 3
for (let k = 0; k < 6; k++) { const t = from + (to - from) * (k + .37) / 6; const A = await page.evaluate(t => window.renderAt(t, 'image/png'), t), B = await page.evaluate(t => window.renderAt(t, 'image/png'), t); if (A !== B) bad(`non-deterministic frame at t=${t.toFixed(2)}`); }
ok('determinism checked');
// 4
const ms = []; for (let t = from; t < to; t += 1 / fps) { const m = await page.evaluate(t => { const a = performance.now(); window.renderAt(t, 'image/jpeg', .5); return performance.now() - a; }, t); ms.push([m, t]); }
ms.sort((a, b) => b[0] - a[0]); const mean = ms.reduce((s, q) => s + q[0], 0) / ms.length;
console.log(`frame ms: mean ${mean.toFixed(0)}, worst ${ms.slice(0, 3).map(q => q[0].toFixed(0) + '@' + q[1].toFixed(2)).join(', ')}`);
if (ms[0][0] > 1500) bad('a frame takes > 1.5 s');
if (errs.length) { bad(`${errs.length} page errors, first: ${errs[0]}`); }
console.log(fail ? `${fail} FAILED` : 'ALL GREEN'); await browser.close(); process.exit(fail ? 1 : 0);
