# HIGOLD 悍高厨房拉篮 M/V

**v2 (current)** is cut to the supplied HIGOLD brand song (a cheer-pop anthem, 156.12 s): a paper pep rally with the HIGOLD cheer squad.
**v1** (commit `3b0c2b1`) was cut to a different reference track; its chapters live on in `src/ch_v1/` as a code library.

A 156.12-second music video about the HIGOLD kitchen pull-out basket. Every frame is drawn in code (Canvas 2D in headless Chromium), with no stock footage, no generated images and no image assets. The look is ink line on paper with steel wire and one signal orange, now worn as team colours. The cast is LAN (小篮) and her four-member crew, a single-line stick-figure cheer squad with pom-poms. The story follows the song: Monday-morning chaos in the cabinet, the counted pull-out drill (One Two 拉出来 / Three Four 推回来), a DIY retrofit with no new cabinets, and three escalating choruses: practice, game day, championship night.

- **Lyrics:** proofread from the supplied song's vocals (ASR + context), timed per token and snapped to the measured beat map. See [`LYRICS.md`](LYRICS.md); `tools/lyrics2_build.py` rebuilds them.
- **Plan:** art bible, cast, the anchor motion and the shot-by-shot storyboard are in [`CONTRACT.md`](CONTRACT.md).

## Layout

| Path | What it is |
|---|---|
| `src/00_beats.js`, `src/00_core.js` | measured beat map of the song (it speeds up 139.7 → 141.6 BPM), math, easing (incl. `E.soft`), deterministic noise |
| `src/01_draw.js` | palette, variable-width boiling ink strokes, paper grain, hatching/halftone, type incl. dry-brush marker lettering |
| `src/02_three.js` | a small 3D line renderer: wire baskets, slides, doors, cabinets, lathe kitchenware; `steel` / `ink` / `glow` styles |
| `src/03_cast.js` | the cast and choreography (`pull` = the signature move) |
| `src/04_ui.js` | web-brutalist UI layer: windows, detection boxes, toasts, scaling-law chart, speedrun splits, stickers, tickers |
| `src/05_lyrics.js` | lyric data + presenters (hero slam, side column, subtitle tape, marker, vertical, echo bands) |
| `src/08_cheer.js` | v2 cheer vocabulary: pom-poms, squad, varsity lettering, count slams, megaphone, scoreboard, bleachers, confetti |
| `src/06_timeline.js`, `07_sets.js` | chapter registry, the "pull" chapter transition, shared chorus stage |
| `src/ch/` | ten v2 chapters, one file each (`src/ch_v1/`: the nine v1 chapters) |
| `studio.html` | the page every frame is painted in; open it in a browser to scrub and play with the song |
| `tools/render.mjs` | contact sheets, stills, clips, full frame render, encode |
| `tools/check.mjs`, `tools/flashcheck.py` | gates: lyric coverage, determinism, frame time, photosensitivity |

## Rendering

```bash
tools/setup.sh                                   # fetch the OFL fonts into .cache/, install a static ffmpeg if missing
cp <the supplied song>.wav .cache/song.wav       # v2 audio (not public, not committed)
node tools/check.mjs                             # gates
node tools/render.mjs --frames=0:156.12 --workers=3
python3 tools/flashcheck.py
node tools/render.mjs --encode --out=out/master.mp4
```

## Rights note

The v2 soundtrack is the HIGOLD song supplied for this project. It isn't committed; put it at `.cache/song.wav` before rendering. The fonts are all SIL OFL (Noto Sans/Serif SC, Smiley Sans 得意黑, Ma Shan Zheng, Zhi Mang Xing, Long Cang, ZCOOL QingKe HuangYou, Anton, Instrument Serif, JetBrains Mono, Space Grotesk, Archivo Black).
