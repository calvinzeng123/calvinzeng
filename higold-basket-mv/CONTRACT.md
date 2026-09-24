# 一拉就到位 — HIGOLD 悍高厨房拉篮 M/V · Contract, art bible, storyboard

This is the single source of truth for the video. Every chapter file is judged against it.

## 1 · The one-line idea

**The kitchen gets its singularity.** A dark, bottomless base cabinet (a literal black hole that eats pots) meets the HIGOLD pull-out basket, and from the first soft-close *嗒* the kitchen starts to **accelerate**: one drawer becomes two, two become a wall, storage efficiency goes exponential, cooking becomes a speedrun, old habits retire, and in the bridge the basket pulls out a whole galaxy. Performed as a K-pop comeback by LAN (小篮) and her four-member crew, drawn in single-line ink on clean paper.

- **Audience / platform:** Chinese social (小红书 / 抖音 / 视频号) and design-literate tech Twitter. 16:9 master, 1920×1080, 24 fps, 156.6 s, the song `.cache/song.mp3` (88 BPM, beats at `0.19 + n × 0.682 s`).
- **Lyrics:** original Chinese lyrics about the basket (`src/05_lyrics.js`), timed per character to the song's phrase slots. **Every line must be on screen while it is "sung"**, and every line gets a deliberate presentation.

## 2 · Art bible

### Look: PAPER × STEEL × POP
- **Paper:** clean matte white `PAL.paper` with fine grain (added automatically over every frame). Never yellowed, crumpled, or torn.
- **Ink:** `PAL.ink`, variable-width tapered brush-pen lines that "boil" at 12 fps (`inkStroke`, `handLine`, `handCircle`, `handRect`). Motion is 24 fps, and linework jitters on twos. That tension is the hand-made signature.
- **Steel:** the product. It's rendered by the 3D line engine (`02_three.js`) in one of three styles: `'steel'` (ink outline + steel body + white core highlight = chrome), `'ink'` (pure line art, the HIGOLD A-mode look), `'glow'` (white light lines on night, for the inverted choruses).
- **One accent: signal orange `PAL.orange`.** It marks the hook words, LAN's hair clip, the *嗒*, and stickers. Budget: it covers under ~12% of any frame, except deliberate full-bleed orange hits (max 4 in the video).
- **Cobalt `PAL.cobalt` = "the computer."** It's used only for the UI layer: detection boxes, cursors, selection, search carets.
- **Night mode** (`PAL.night` background, `DARK = true`) is for the escalation peaks: chorus 2's second half, the bridge, and chorus 4. The palette inverts: paper-coloured lines, glow baskets, orange stays orange.
- **No gradients** except the steel sheen, the light glow, and the vignette. No drop shadows except the hard 8–10 px offset shadow on UI elements (brutalist).

### Type (all OFL, loaded in studio.html)
| Role | Font | Use |
|---|---|---|
| Hero slam | `F.heavy` 900 (Noto Sans SC Black) | the hook, giant full-frame words |
| Sleek display | `F.smiley` (得意黑) | side-column lyrics, titles; the "now" Chinese design face |
| Editorial | `F.serif` 900 (Noto Serif SC) | vertical columns, museum labels, quiet moments |
| Marker | `marker()` / `F.hand` (Zhi Mang Xing + dry-brush 飞白) | handwritten brand-poster lines, onomatopoeia (嗒!) |
| Latin title | `F.anton`, `F.serifI` (Instrument Serif Italic) | teaser metadata, "M/V", big English accents |
| System | `F.mono` (JetBrains Mono), `F.grotesk` | UI, specs, timecodes, charts |

### Lyric presentation: vary it on purpose
Presenters in `05_lyrics.js`: `lyHero` (giant per-character slam), `lySide` (left column with a line number), `lySub` (quiet subtitle tape with a karaoke underline), `lyMarker` (handwritten brush reveal), `lyVertical` (CJK columns), `lyEcho` (K-pop repetition bands). You may also write a private presenter in your chapter (lyrics typed into a search bar, printed on a receipt, on a museum label, on a toast, and so on), but **it must call `LYRIC_DRAWN.add(i)`** and reveal characters on their `LY[i].t` onsets.
- **Composition rule:** plan the frame around the words. The standard layout is **text left / subject right**: the left ~45% stays calm (paper, grid, a few marks) and holds the lyric, and the character or product sits right. Break the rule for hero moments: hook lines go huge and centred or full-bleed.
- Hook lines (`一拉就到位`, the first line of each chorus) are always **hero scale** (≥ 220 px), and each chorus presents them differently.
- Never let two lyric lines sit on screen at once, except for deliberate echo effects of the same line.
- Keep lyrics off the busiest parts of the picture. Check every line at 25/50/85% (`tools/check.mjs` does this automatically).

### Cast (all original; 03_cast.js)
- **LAN 小篮**: the lead. Bob cut, signal-orange hair clip, smile face with orange blush. She is always the centre of a formation and a little bigger (`lanScale 1.12`).
- **Crew**: PONY (high ponytail), BUNS (two buns), LONG (long hair), KIT (short hair + cap). Formation order left→right: pony, buns, **lan**, long, kit.
- **The signature move `pull` (拉):** reach out, grab, yank back to the hip on the beat. It is the point choreography, and the hook line always lands on a pull.
- Other moves: `bounce, point, wave, heart, jump, cross, sway, step, run, shrug, pointDown, idle`, plus the key poses in `KP` (`kneel`-like poses can be built with `pose({...})`).
- Scale guide: `s` = px per body unit, and the figure is ~10 units tall. Hero/close-up s 40–70, formation s 20–26, crowd s 6–12.
- **Scale contrast is the joke** (HIGOLD B-mode): tiny 小人 interacting with huge product parts: swinging on a basket rail, sitting in a plate slot, pushing a jar.

### The anchor + the one transition device
- **Anchor:** the pull-out motion itself, `E.soft` (a critically damped glide: fast pull, long silent settle). Something slides out with this curve in **every shot**: a basket, a drawer of type, a panel, a UI window, a row of dancers.
- **Chapter transitions** are automatic: "the pull" (the next scene glides in like a soft-close drawer, with a steel edge, at 23.0 / 38.5 / 59.0 / 73.0 / 95.4 / 109.4 / 123.5 / 135.9). **Inside chapters, use hard cuts on beats.** Match-cuts (same shape and position across a cut) are encouraged.
- Shots must keep rendering sensibly for up to 0.6 s past their end (the outgoing shot runs under the transition).

### Motion rules
- Every shot moves: the camera drifts or pushes, the 3D camera orbits, type slides, dancers dance. Nothing is ever frozen.
- Hits land **on beats** (`beatT(n)`, `pulse(t)`, `sinceBeat(t)`). K-pop hits are snappy: `E.out5` onto the pose, then hold.
- Chorus shots are short (1–2 beats to 2 bars). Verse shots run 1–3 bars.
- **Flash safety:** no more than 3 full-frame luminance flips per second, and never flash orange or white across the full frame on consecutive beats.
- **Readability:** every frame must read at a 240 px thumbnail. One focal action per shot.

### Web-brutalist meme layer (04_ui.js)
Hard 3 px ink borders, hard offset shadows, mono type, and cobalt for machine marks: `win()` OS windows, `bbox()` detection boxes ("锅 404", "盐 0.12"), `cursor()`, `toast()` notifications ("拉篮已到位 ✓"), `progress()`, `scalingChart()` (**Kitchen Scaling Law**), `splits()` (a speedrun timer), `searchBar()`, `sticker()`, `ticker()` marquee, `callout()` spec leaders, `barcode()`, `metaStrip()` (K-pop teaser metadata corners). Use Chinese-internet vernacular (强迫症狂喜, 收纳焦虑, 已老实, 家人们, 拉满, 速通, 下线, 退休) plus tech-Twitter cues (scaling laws, benchmarks, loading bars, detection boxes, terminals). **No real platform logos, no real people, and no copyrighted characters.**

### Product truth (brand safety)
Show and say only these features: **pulls out fully (全拉出); soft-close damping (阻尼缓冲, 静音); wire basket for dishes/bowls (碗碟拉篮); seasoning basket (调味拉篮); corner unit (转角拉篮); tall pantry unit (高柜拉篮); lift-down wall-cabinet basket (升降拉篮).** **No numbers** (no kg, no mm, no years, no percentages as product claims; joke UI numbers such as a progress bar or a scaling-chart axis are fine when they are obviously playful), **no material grades** (no 304), and no health or antibacterial claims.

## 3 · Engine API (read the source for details)
- **00_core.js:** `W H CX CY TAU`, `clamp lerp inv seg frac`, easings `E.io E.io3 E.io5 E.out E.out5 E.outExpo E.in E.inExpo E.back E.elastic E.soft`, `spring(lt, f, z)`, `hash hash2 mulberry32 noise1 noise2 fbm`, `jit(seed, amp)` (boils at 12 fps), timing `bp beatN beatT barN snapBeat pulse pulse8 pulseBar sinceBeat`, `kf(t, keys, ease)`, colour `mixCol rgba`.
- **01_draw.js:** `PAL`, `poly smoothPath fillPoly rect line circle rrect ellipsePts`, `inkStroke handLine handRect handCircle`, `hatch halftone dotGrid gridPaper`, `paperBG(col)`, `text(str, x, y, {size, font, weight, col, align, base, track, rot, a, stroke, sw, skew, sx, sy})`, `measure`, `marker(str, x, y, {size, col, align, rot})`, `markerWidth`, `sparkle arrow speedLines flash vignette`, `cam(cx, cy, zoom, rot)` / `camEnd()`, `shake`.
- **02_three.js:** `camera3 orbit`; primitives `basketModel dishDrawer spiceDrawer slideModel doorModel boxModel lathe PROF.{plate, bowl, cup, jar, bottle, tall, pot, lid}`; transforms `translate3 rotateY3 rotateX3 scale3 xf`; `render3(prims, cam, {style, shine, dark, lw, a, inkCol})`. Primitives carry `layer` (0 carcass, 1 basket and items, 2 fronts) and are depth-sorted within a layer.
- **03_cast.js:** `figure(x, y, s, pose, o)`, `dancer(x, y, s, move, t, o)`, `move(name, t, seed)`, `KP`, `pose()`, `lerpPose`, `mirrorPose`, `CREW`. Options: `who, face ('dot'|'smile'|'o'|'wow'|'happy'|'closed'|'star'), blush, flip, col, dark, a, w`.
- **04_ui.js:** listed above.
- **05_lyrics.js:** `LY`, `lyIndex(t)`, `lyRows(i)`, `chK`, `lyEnv`, `lySung`, presenters, `LYRIC_DRAWN`.
- **07_sets.js:** `frameCam(at, yaw, pitch, sx, sy, span, px)`, `productShot(ext, o)`, `pin(C, p)`, `stageFloor`, `formation(t, o)`, `bigBasketBG(t, o)`.
- **Global state:** `X` (the current context), `T` (the song time), `BOIL`, and `DARK` (set `DARK = true` in a shot whose frame is mostly night).

## 4 · Storyboard

Energy map (measured): 0–16 s quiet → 16–23 s build → 23–88 s full → **88–108 s dip (chorus 3 is a quiet breakdown)** → 108–136 s full → 136–140 s dip → **140–152 s loudest (instrumental dance break)** → 152–156.6 s fade.
Palette arc: paper → paper with a first orange → paper/night split → paper (museum white) → soft paper (breakdown) → night + cosmos → night + orange → paper finale.

### c01 · Verse 1 · "The black-hole cabinet" (0 – 23.0) · paper, then the first orange
| Time | Lyric | Shot |
|---|---|---|
| 0.0–1.5 | — | **Cold open, the hook frame.** A closed base-cabinet door in clean line art, centred and frontal. On each beat the door rattles and a thin line of dark leaks from its edges. Mono metadata corners (`metaStrip`). The title stamps in tiny, then a *咚*. It must read instantly as "something is wrong in this cabinet". |
| 1.5–5.9 | 0 我家橱柜 / 深处有黑洞 | The door swings open (hinged, 3D) onto **a black hole inside the cabinet**: an ink-black disc with an accretion disk of orbiting lids, spoons and bowls, and the paper grid lines bending into it (gravitational lensing). The lyric is `lyHero`, left, with 黑洞 in orange. |
| 6.0–7.9 | 1 锅碗瓢盆全失踪 | Kitchenware spirals into the hole. Each item gets a cobalt `bbox` label that flips to "404" as it vanishes. The lyric is `lySide`. |
| 8.0–8.95 | 2 跪着翻找 | LAN kneeling with her head and arms inside the cabinet, only her legs and bottom visible, kicking (B-mode humour). `lyMarker` handwritten. |
| 9.0–12.4 | 3 调料瓶倒成一片 / 找不到盐 | Spice bottles topple like dominoes in slow motion (lathe bottles tipping). Then a `searchBar` types "盐" → "0 个结果". The lyric sits on the search UI or at side. |
| 13.0–16.5 | 4 直到那天 / 我拉开了你 | **The first pull.** A hand grabs the handle, and the drawer glides out with `E.soft`. Light sweeps across the steel (`shine`), and the basket is revealed in full `'steel'` product style, the camera orbiting. The drawer's damping curve is drawn as a live plot beside it. The lyric is `lySide` or `lyHero`. |
| 16.5–17.9 | — | Beat: LAN's face close-up (s ≈ 70) with star eyes and blush. |
| 17.9–22.5 | 5 阻尼一收，/ 刚刚好 | Slow motion: the drawer closes by itself and settles silently; the handwritten *嗒* pops in orange (`marker`). A spec `callout` reads "SOFT-CLOSE 阻尼缓冲". Build: the grid starts to scroll faster, and 2–3 accelerating cuts toward the chorus. |

### c02 · Chorus 1 · "Comeback stage" (23.0 – 38.5) · paper + orange
| 23.0–24.4 | 6 一拉就到位 | **HOOK.** Full-frame `lyHero` (≈300 px), centred, one char per onset. Behind it, the 5-member formation hits `pull` exactly on the syllables. A giant faint `bigBasketBG`. |
| 24.5–26.4 | 7 锅碗瓢盆排队 | Match-cut: plates, bowls and jars march into the basket slots in a single-file line, like a K-pop line dance. The lyric is at left. |
| 26.5–27.9 | 8 调料一眼看见 | Top-down `'ink'` view into the seasoning basket; `bbox` labels pop on every jar, all found (✓). |
| 28.0–29.4 | 9 不用再弯腰 | LAN stands tall and a crossed-out kneeling icon stamps (B-mode sticker); or a split screen of before (bent) and after (upright). |
| 29.5–33.4 | 10 钢丝闪闪发亮 | Hero product orbit in `'steel'` with sweeping shine and `sparkle` glints on the beats. `lyVertical` columns on the left. |
| 33.5–35.5 | 11 每一次拉开 / 都心动 | Crew `heart` pose, with hearts made of basket-wire loops; `lyHero` or `lyEcho`. |
| 35.5–38.5 | — | Instrumental tag: a 2-bar logo sting. "HIGOLD 悍高 · 一拉就到位" as teaser typography in orange + ink, a `ticker`, then set up the pull transition (from the left). |

### c03 · Verse 2 · "Acceleration" (38.5 – 59.0) · paper → night
| 38.5–41.4 | 12 一个抽屉 / 变成两个 | Cell division: one drawer front splits into two with a satisfying snap (on the beat). |
| 41.5–44.9 | 13 两个变成 / 整面墙的拉篮 | Exponential tiling: 2 → 4 → 8 → 16 → 64 drawers fill a whole wall, each sliding out with `E.soft` in a wave. |
| 45.0–48.5 | 14 收纳效率 / 指数一样往上涨 | **KITCHEN SCALING LAW.** `scalingChart` draws an exponential curve with labelled points (碗碟篮 → 调味篮 → 转角 → 高柜 → 升降). The tech-Twitter moment: a big bold title in `F.grotesk`/`F.anton`. |
| 48.5–49.4 | — | Hard beat cut: the chart line shoots off the top of the frame. |
| 49.4–51.9 | 15 做一顿饭 / 像在速通 | **Speedrun:** `splits()` panel (找锅 / 找碗 / 找盐 / 开火 / 出锅 with green gold splits) beside LAN cooking in fast-forward (`run` or quick arm moves, motion streaks). |
| 51.9–53.4 | — | Build: the timer digits blur and the camera pushes into the basket. |
| 53.4–58.4 | 16 厨房，/ 开始加速 | **The acceleration tunnel.** Night mode; an infinite corridor of baskets pulling out toward the camera, faster and faster (exponential push), `speedLines`, the lyric huge and cool (`lyHero` in paper colour). It ends pushing into a bright slot for the pull transition. |

### c04 · Chorus 2 · "Night stage" (59.0 – 73.0) · night + glow steel + orange
| 59.0–60.4 | 17 一拉就到位 | HOOK, inverted: night stage, dancers in paper-coloured line, `lyHero` outline type (`stroke`), orange fill on 拉. The formation is in a V. |
| 60.5–62.4 | 18 左边调料 / 右边锅 | Split screen: the left half is a seasoning basket, the right half a pot drawer; the text sits in each half, mirroring. |
| 63.0–64.4 | 19 轻轻一嗒 | Extreme macro on the damper: the rail settles; a big orange handwritten *嗒*; everything freezes for one beat. |
| 64.5–65.9 | 20 阻尼稳稳 / 收回原位 | The drawer closes itself in slow motion; a damping graph animates. |
| 66.0–68.5 | 21 满满一篮 / 也拉得动 | Comic strength test: the basket is loaded absurdly full (a stacked tower of pots), and a tiny LAN pulls it out with one finger (scale contrast). No numbers. |
| 68.5–70.0 | — | Dance hit: a 4-up grid of the crew doing `point`. |
| 70.0–72.9 | 22 关上柜门 / 一片清净 | Every door closes in sequence; the frame empties to calm white paper; the lyric is quiet `lySub`. Breathing room before verse 3. |

### c05 · Verse 3 · "The product family / retirement party" (73.0 – 95.4) · museum white, editorial
| 73.0–77.4 | 23 转角 / 不再是死角 | The corner unit: an L-shaped cabinet whose dead corner swings out on arms (a 3D line animation). The lyric is `lyVertical` serif. |
| 77.5–81.0 | 24 高柜一拉 / 看到底 | A tall pantry unit: a floor-to-ceiling multi-tier basket slides out; the camera tilts from top to bottom. |
| 81.4–84.9 | 25 吊柜 / 轻轻降下来 | A lift-down wall-cabinet basket: it swings down and forward on its arms to eye level. |
| 85.0–88.0 | 26 不用踮脚 / 去够 | LAN on tiptoe (`KP.tiptoe`) reaching for a high shelf, then relaxed when the basket comes down to her. |
| 89.4–95.0 | 27 蹲下翻找，/ 退休了 | **The retirement party.** A museum vitrine holds a kneeling figure pose frozen as a statue, with an editorial museum label (serif, "蹲下翻找 · 已退休"); the crew clap; a `toast` ("习惯「蹲下翻找」已下线"). The music dips here: calm, funny, dignified. |

### c06 · Chorus 3 · "Breakdown" (95.4 – 109.4) · soft paper, sparse, intimate (the song is QUIET here)
| 95.4–97.4 | 28 一拉就到位 | The hook as a whisper: small, precise, centred type (`F.serif`) with lots of white; LAN alone in silhouette doing the pull slowly. |
| 97.5–98.9 | 29 收纳焦虑 / 全下线 | A single OS `win()` with "收纳焦虑.exe", then "已下线". |
| 99.0–100.4 | 30 强迫症狂喜 | Perfectly aligned items snapping into a grid (satisfying); a sticker "强迫症狂喜". |
| 100.5–102.4 | 31 每样东西 / 有位置 | Top-down `'ink'` plan drawing of a basket with every item outlined and labelled like an architectural plan. |
| 102.5–104.4 | 32 一眼找到 / 不用翻 | An eye icon or lens sweep finds the item instantly (cobalt ring). |
| 105.4–109.4 | 33 这就是 / 厨房的新秩序 | Build: the camera pulls back to reveal an entire kitchen as a perfect axonometric line drawing, all drawers open in a wave, the lyric large; ends on a hard beat into the bridge. |

### c07 · Bridge · "The kitchen singularity" (109.4 – 123.5) · night + cosmos
| 109.4–113.4 | 34 一格一格 / 往外拉 | Drawers pull out one by one in a spiral, each revealing another drawer. |
| 113.5–115.4 | 35 拉出 / 整个银河系 | A drawer pulls out the Milky Way: a spiral galaxy made of glowing basket wires and plates as planets. |
| 115.5–116.9 | 36 篮子里面 / 还有篮 | **Droste recursion:** zoom into a basket slot, which contains a basket, which contains a basket (infinite zoom). |
| 117.0–118.9 | 37 所有东西 / 都回了家 | Scattered items fly back into their exact slots (a reverse explosion) with a satisfying lock-in. |
| 119.0–120.4 | 38 越拉越多 | A stack of drawers extends to the horizon. |
| 120.9–123.4 | 39 越拉越稳 | Everything settles; the camera stops dead on the downbeat; silence-ready; big steady type. |

### c08 · Chorus 4 · "Everything at once" (123.5 – 135.9) · night + orange, maximal
| 123.5–125.9 | 40 一拉就到位 | Final hook: the biggest one. Full-bleed orange hit (one of the 4 allowed), the formation plus an army of mini-crews to the horizon, `lyEcho` bands. |
| 126.0–127.9 | 41 整个厨房 / 都在线 | A dashboard of `win()`s: every cabinet is a window, all "在线" green dots. |
| 128.0–129.9 | 42 每个角落 / 闪亮 | Sparkle sweep over the whole kitchen line art; glints on the beats. |
| 130.0–131.9 | 43 悍高拉篮，/ 全拉满 | The brand line: "HIGOLD 悍高" in giant type, a `progress()` bar to "拉满" (a playful 100%). |
| 132.0–135.4 | 44 轻轻一嗒，/ 收好这一天 | Deceleration: everything glides home with `E.soft`; the last drawer closes with an orange *嗒*; the night turns back to paper. |

### c09 · Outro · "Dance break + end card" (135.9 – 156.6)
| 137.4–140.5 | 45 一拉就到位 | The final hook, calm and confident, handwritten `lyMarker` in orange + ink, LAN centre. |
| 140.5–152.0 | — | **Dance break (the loudest section).** Cuts on every bar: formation in different camera framings (wide / 3-up / close / 9-grid mosaic / overhead), with basket product cameos between. K-pop MV energy, all synced to beats. |
| 152.0–156.6 | — | End card: clean paper; "HIGOLD 悍高" + "厨房拉篮 · 一拉就到位"; a basket slides closed with `E.soft` on the last note; tiny mono credits "animated in code, frame by frame". Fade the sound out visually to calm. |
