// render.mjs: drive studio.html in headless Chromium (Playwright's bundled build).
//   node tools/render.mjs --sheet=23,23.5,24 [--cols=3] [--w=640] --out=out/check.jpg   contact sheet
//   node tools/render.mjs --stills=0.8,3 --out=out/stills                                full-res PNG stills
//   node tools/render.mjs --clip=0:6 --out=out/clip.mp4                                  short clip with audio
//   node tools/render.mjs --frames=0:156.6 --workers=3                                   JPEG frames → out/frames (resumable)
//   node tools/render.mjs --encode [--out=out/master.mp4]                                frames + song → MP4
//   node tools/render.mjs --specimen --out=out/specimen.png                              window.SPECIMEN() page
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const DUR = 156.6, fps = +(args.fps || 24);
const FRAMES_DIR = args.dir || 'out/frames';
const SONG = '.cache/song.mp3';
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });

if (args.encode) {
  const out = args.out || 'out/master.mp4', n = readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg')).length;
  console.log(`encoding ${n} frames → ${out}`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES_DIR}/f%05d.jpg`, '-i', SONG,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 17), '-tune', 'animation', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out]);
  console.log('wrote ' + out);
  process.exit(0);
}

const browser = await chromium.launch({
  headless: true,
  args: ['--allow-file-access-from-files', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--force-color-profile=srgb']
});
async function openPage(tag = '') {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(resolve('studio.html')).href + '?render');
  await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
  return page;
}
const frameOf = async (page, t, type, q) => {
  const url = await page.evaluate(([t, type, q]) => window.renderAt(t, type, q), [t, type, q]);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
};
const times = s => String(s).split(',').map(Number);

if (args.specimen) {
  const page = await openPage(), out = args.out || 'out/specimen.png'; mkdirSync(dirname(out), { recursive: true });
  const url = await page.evaluate(() => window.SPECIMEN());
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')); console.log(out);
} else if (args.sheet) {
  const page = await openPage(), out = args.out || 'out/sheet.jpg'; mkdirSync(dirname(out), { recursive: true });
  const { url, ms } = await page.evaluate(([ts, c, w]) => window.renderSheet(ts, c, w), [times(args.sheet), +(args.cols || 3), +(args.w || 640)]);
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log(`${out}  ms/frame: ${ms.join(' ')}`);
} else if (args.stills) {
  const page = await openPage(), out = args.out || 'out/stills'; mkdirSync(out, { recursive: true });
  for (const s of times(args.stills)) {
    const t0 = Date.now(), buf = await frameOf(page, s, 'image/png');
    const f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`; writeFileSync(f, buf);
    console.log(`${f}  ${Date.now() - t0} ms`);
  }
} else if (args.frames) {
  const [a, b] = String(args.frames).split(':').map(Number), workers = +(args.workers || 3);
  mkdirSync(FRAMES_DIR, { recursive: true });
  const first = Math.round(a * fps), last = Math.min(Math.ceil(DUR * fps) - 1, Math.round(b * fps) - 1);
  const todo = []; for (let i = first; i <= last; i++) { const f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`; if (args.force || !existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} frames to render (${last - first + 1 - todo.length} already done), ${workers} workers`);
  let next = 0, done = 0; const start = Date.now();
  const work = async w => {
    const page = await openPage('#' + w);
    while (next < todo.length) {
      const i = todo[next++], f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`;
      const buf = await frameOf(page, i / fps, 'image/jpeg', .95);
      writeFileSync(f + '.tmp', buf); renameSync(f + '.tmp', f);
      if (++done % 48 === 0 || done === todo.length) {
        const el = (Date.now() - start) / 1000;
        console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame eff  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`);
      }
    }
  };
  await Promise.all(Array.from({ length: workers }, (_, w) => work(w)));
} else {
  const page = await openPage();
  const [a, b] = args.clip ? String(args.clip).split(':').map(Number) : [0, DUR];
  const out = args.out || 'out/clip.mp4'; mkdirSync(dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-ss', String(a), '-t', String(b - a), '-i', SONG,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-vf', args.half ? 'scale=960:540' : 'null',
    '-c:a', 'aac', '-b:a', '160k', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((b - a) * fps), start = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await frameOf(page, a + i / fps, 'image/jpeg', .9);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 48 === 0 || i === n - 1) console.log(`frame ${i + 1}/${n}  ${((Date.now() - start) / (i + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`wrote ${out}`);
}
await browser.close();
