# 一拉就到位 · HIGOLD 悍高厨房拉篮 M/V

A 156.6-second music video about the HIGOLD kitchen pull-out basket. Every frame is drawn in code (Canvas 2D in headless Chromium), with no stock footage, no generated images and no image assets. The look is ink line on paper with steel wire and one signal orange. The cast is LAN (小篮) and her four-member crew, drawn as single-line stick figures doing K-pop point choreography. The story is "the kitchen gets its singularity": a black-hole cabinet meets the pull-out basket, and the kitchen starts to accelerate.

- **Lyrics:** original Chinese lyrics written for the basket, fitted to the song's phrase slots and timed per character to its 16th-note grid. See [`LYRICS.md`](LYRICS.md).
- **Plan:** art bible, cast, the anchor motion and the shot-by-shot storyboard are in [`CONTRACT.md`](CONTRACT.md).

## Layout

| Path | What it is |
|---|---|
| `src/00_core.js` | math, easing (incl. `E.soft`, the soft-close drawer curve), deterministic noise, beat grid (88 BPM, beats at 0.19 + n·0.682 s) |
| `src/01_draw.js` | palette, variable-width boiling ink strokes, paper grain, hatching/halftone, type incl. dry-brush marker lettering |
| `src/02_three.js` | a small 3D line renderer: wire baskets, slides, doors, cabinets, lathe kitchenware; `steel` / `ink` / `glow` styles |
| `src/03_cast.js` | the cast and choreography (`pull` = the signature move) |
| `src/04_ui.js` | web-brutalist UI layer: windows, detection boxes, toasts, scaling-law chart, speedrun splits, stickers, tickers |
| `src/05_lyrics.js` | lyric data + presenters (hero slam, side column, subtitle tape, marker, vertical, echo bands) |
| `src/06_timeline.js`, `07_sets.js` | chapter registry, the "pull" chapter transition, shared chorus stage |
| `src/ch/` | nine chapters, one file each |
| `studio.html` | the page every frame is painted in; open it in a browser to scrub and play with the song |
| `tools/render.mjs` | contact sheets, stills, clips, full frame render, encode |
| `tools/check.mjs`, `tools/flashcheck.py` | gates: lyric coverage, determinism, frame time, photosensitivity |

## Rendering

```bash
tools/setup.sh                                   # fetch the song + OFL fonts into .cache/, install a static ffmpeg if missing
node tools/check.mjs                             # gates
node tools/render.mjs --frames=0:156.6 --workers=3
python3 tools/flashcheck.py
node tools/render.mjs --encode --out=out/master.mp4
```

## Rights note

The soundtrack is the song from the reference project (`JohnHeibel/PDoomVideo`, whose README credits a 2024 YouTube upload). It isn't committed here. Before any commercial or brand publication, secure a license for that track, or swap in a licensed or newly produced track sung to `LYRICS.md`. The fonts are all SIL OFL (Noto Sans/Serif SC, Smiley Sans 得意黑, Zhi Mang Xing, Long Cang, ZCOOL QingKe HuangYou, Anton, Instrument Serif, JetBrains Mono, Space Grotesk, Archivo Black).
