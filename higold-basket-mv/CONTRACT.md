# HIGOLD 悍高厨房拉篮 · Cheer M/V (v2) — contract, art bible, storyboard

v2 is re-cut to the supplied HIGOLD song (`.cache/song.wav`, 156.12 s). v1 was cut to a different track; its chapters are kept in `src/ch_v1/` as a code library, and the v1 video is at commit `3b0c2b1`.

## 1 · The idea

**Old kitchen, new style: the HIGOLD cheer squad.** The song is a cheer-pop anthem at about 140 BPM. It has a call-and-response chant (Give me an H! H!), a sports countdown (Ready? Set! 一二三走!), a counted drill (One Two 拉出来 / Three Four 推回来), shouts (Hey Hey!), and a practical story:
1. Monday-morning chaos: the frying pan is lost at the bottom of the cabinet.
2. The chorus: pull out, everything is arranged, push back, *咔嗒*, quiet.
3. Verse 2 is a DIY retrofit: no smashing, no new cabinets; measure, tighten the screws, done by the weekend.
4. The bridge lays out left, right, upper and lower, with everything standing in front of your eyes.

We perform it as a **paper pep rally**. LAN (小篮) and her crew are the HIGOLD cheer squad, drawn in single-line ink on clean paper, with pom-poms, varsity letters, a megaphone, a scoreboard, coach's play diagrams, bleachers and confetti.

The film escalates across the three choruses:
- **Chorus 1, practice** (paper, daytime).
- **Chorus 2, game day** (a stadium on paper, with crowd, jumbotron and scoreboard).
- **Chorus 3, championship night** (night stadium, light cones, confetti, trophy).

The end card lands back on calm paper.

## 2 · Art bible (changes from v1 in bold)

- **Paper · ink · steel · signal orange.** The palette is unchanged (`PAL`). **Orange is now the team colour**: pom-poms, varsity outlines, jersey stripes, the hook words. Cobalt is still for machine or UI marks only. Night is reserved for chorus 3 (the championship).
- **Type.** `varsity()` (Anton, paper fill + ink line + orange outer line + hard shadow) is the **new hero face** for chants, counts and brand words: `HIGOLD`, `ONE`, `TWO`, `THREE`, `FOUR`, `HEY`, `GO`. Chinese hero lines use `F.heavy` 900 or `F.smiley`, and handwriting uses `marker()` (Ma Shan Zheng). Mono is for UI, specs and scoreboards.
- **Lyric presentation.** Every lyric line must be on screen while it's sung (checked by `tools/check.mjs`). Tokens reveal on their onsets. A token is a Han character or a whole English word; `LY[i].tok` / `LY[i].t`.
  - Call-and-response lines ("Give me an H!", "Ready? Ready!", "Set? Set!") are shown as a **two-voice layout**: the lead call is solid, and the crowd answer is an outline echo offset down-right.
  - **Count words (One / Two / Three / Four / 一二三 / 走 / Hey) are always giant `countSlam()` hits.**
  - Vary the rest (`lyHero`, `lySide`, `lySub`, `lyMarker`, `lyVertical`, `lyEcho`, or private presenters on objects such as an exam paper, a manual page, the scoreboard, the jumbotron, card stunts). Private presenters must call `LYRIC_DRAWN.add(i)`.
- **Composition.** Text left / subject right by default. Hooks are centred and huge.
- **Cast.** LAN (bob, orange clip, jersey **1**) plus PONY 2, BUNS 3, LONG 4, KIT 5.
  - Use `cheerleader()` / `squad()` (pom-poms, jersey numbers) for cheer moments, and `dancer()` / `figure()` for story acting.
  - **New moves:** `cheer` (V up / V down / T), `clap`, `kick`, `pump`, `count`. Plus `pull` (the signature drawer yank), `bounce`, `jump`, `step`, `run`, `point`, `wave`, `heart`, `sway`, and key poses `KP.*` (`highV lowV tee clapUp kickR pumpR countR`, …).
- **The anchor.** Something always slides with `E.soft` (the soft-close glide) in every shot. The signature choreography is still the **pull**: the reach on "One", the yank on "拉", the push on "推", and the freeze on "咔嗒".
- **Tempo.** At 140 BPM a beat is ≈0.426 s. Chorus shots last 2 beats to 2 bars, and verse shots 1–2 bars. **Cut on beats.** Hits snap with `E.out5`.
- **Flash safety.** At most 3 opposing full-frame luminance flips per second. **Full-bleed orange hits: at most 3 in the whole film**, reserved for c01 (the first HIGOLD!), c03 (走!) and c09 (the chorus-3 opener).
- **Product truth.** Pulls out fully (全拉出); soft-close damping (阻尼缓冲, 咔嗒); dish basket (碗碟拉篮); seasoning basket (调味拉篮); fits existing cabinets (retrofit, as the lyrics say: 不换柜子). **No numbers** (no sizes, loads or years), no material grades and no health claims. Joke UI numbers (scores, timers, counts) are fine.
- **Originality.** Original cast only. No real logos, real people, real teams or leagues, or copyrighted characters. The stadium, jerseys and trophy are generic.

## 3 · Engine additions (v2)

- **Timing is a measured beat map** (`src/00_beats.js`). The song speeds up in steps: 139.7 → 140.6 → 141.6 BPM.
  - Use `bp(t)` (beat position), `beatT(n)` (time of beat n, fractional allowed), `barT(k)` (bar k's downbeat; `BAR0 = 0`, so bars start at beats 0, 4, 8, …), `beatN`, `barN`, `pulse`, `pulse8`, `pulseBar` and `sinceBeat`.
  - **Never hard-code 0.682 or 88 BPM.** `BEAT` ≈ 0.4256 is only a nominal duration.
- `src/08_cheer.js`: `pompom`, `cheerleader`, `squad`, `varsity`, `countSlam`, `megaphone`, `pennant`, `scoreboard`, `playX`, `playO`, `playArrow`, `bleachers`, `confetti`, `stadiumLights`.
- Everything from v1 still applies: `02_three.js` baskets and cabinets, `productShot`, `frameCam`, `04_ui.js`, the presenters, `inkStroke`/`hand*`, `marker()` and so on.
- **v1 code library:** `src/ch_v1/*.js` holds tested shots you may COPY private helpers from into your own file, since those files are not loaded:
  - c02: the drawer-pull choreography, where each dancer has a mini drawer with an orange handle;
  - c04: the soft-close macro 嗒 and the damping graph;
  - c05: the corner, pantry and lift-down units;
  - c06: architectural plans;
  - c07: the galaxy, Droste and the drawer wall;
  - c08: the product-family HIGOLD brand line and the KITCHEN.OS windows;
  - c09: the dance-break shots and the end card.

## 4 · Storyboard — 10 chapters (times are fixed; lyric indices refer to `LY`)

Pull transitions (the soft-close slide) sit at 13.649 / 28.423 / 60.848 / 75.052 / 106.812 / 119.419. **All other chapter joins are hard cuts on the beat. Match the neighbouring chapter's look at those joins** (c03→c04 at 46.943, c06→c07 at 92.976, c09→c10 at 131.789).

| Ch | Time | Lines | Setting | Beats |
|---|---|---|---|---|
| **c01 cheer** | 0 – 13.649 | 0–5 | Paper pep rally | **Frame 0 hooks.** LAN with a megaphone, the squad behind her, bleachers faint at the top. Each chant letter lands as a giant varsity letter (H on its onset, the crowd echo "H!" as an outline). Build H-I-G-O-L-D (the letters could be held up as card stunts, or formed by the squad in an overhead formation). "What's that spell?" LAN points the megaphone at the lens. **HIGOLD!** is the full word slam, full-bleed orange hit #1, confetti. The second HIGOLD! is the crowd card-stunt mosaic. Then a whistle, and the squad turns and runs, which sets up the pull into Monday morning. |
| **c02 verse1** | 13.649 – 28.423 | 6–9 | Monday chaos (paper) | 周一早上闹钟响三遍: an alarm clock rings three times on the beats, with an ×3 counter. 冲进厨房找我的煎蛋锅: LAN sprints into the kitchen with speed lines, searching. 柜子里面像一场考试: the cabinet opens onto an **exam paper**, with a multiple-choice question about where the pan is, a timer, and LAN sweating. 所有答案都压在柜底下: an x-ray cutaway shows the answer (the pan) crushed at the very bottom under a stack of pots. |
| **c03 go1** | 28.423 – 46.943 | 10–16 | Chorus 1: PRACTICE (paper, daytime) | Ready? Ready! / Set? Set!: a starting line on a paper track, the squad in sprinter crouch, a coach's whistle, two-voice call/response. 一 二 三 are countSlams; **走!** is orange hit #2 and the explosion start. One / Two are ONE and TWO slams while the squad reaches; on 拉出来 each dancer yanks a drawer out (port v1 c02's mini-drawer choreography). 碗碟调料排好展开: items line up and fan out in the basket. Three / Four with 推回来: push back. 咔嗒一声安静下来: macro on the damper, 咔嗒 stamped in orange, then everything freezes quiet (a "shh" beat). |
| **c04 chorus1b** | 46.943 – 60.848 | 17–21 | Practice, continued | 不换柜子也能 Hey Hey!: a new cabinet and a sledgehammer are crossed out; the squad jumps with pom-poms on each HEY slam. 旧厨房换个style: a before/after split, where the same old cabinet (grey hatch, dust) is pulled into the new style with a HIGOLD basket; a "NEW STYLE" sticker. One Two 拉出来 → 悍高拉篮 → 拉出来: the brand hook, 悍高拉篮 as varsity/hero type, and a product hero orbit. |
| **c05 verse2** | 60.848 – 75.052 | 22–25 | DIY retrofit as an **instruction manual / textbook** page (paper) | 室友说这房子老得像课本: the old flat drawn as a vintage textbook illustration (page numbers, margin notes); the roommate is KIT. 我说不用砸也不用换: a sledgehammer and a "buy new cabinets" icon each get an orange ✕. 量好尺寸 / 拧紧螺丝: manual steps; a tape measure across the opening (dimension lines, no numbers) and a screwdriver turning on the beats; the slide is fitted into the existing cabinet. 周末下午搞定这一关: a weekend clock, a checklist ticking, a game-style "CLEAR!" stamp. |
| **c06 go2** | 75.052 – 92.976 | 26–32 | Chorus 2: GAME DAY (a paper stadium in daylight: bleachers, jumbotron, scoreboard) | Ready/Set: the squad runs out of the tunnel onto the field while the crowd answers. 一二三 走! (no orange hit this time; the crowd card stunt flips instead). The chorus is staged in the stadium: the jumbotron shows the drawer pull, and a coach's play diagram (X/O/arrows) diagrams "Three Four 推回来". **咔嗒一声安静下来: the whole stadium freezes silent on 咔嗒.** |
| **c07 chorus2b** | 92.976 – 106.812 | 33–37 | Game day, continued | Hey Hey: a stadium wave rolls through the bleachers. 旧厨房换个style: a half-time makeover on the jumbotron (before → after). 悍高拉篮: the crowd card stunt spells it. 拉出来: the scoreboard flips to HIGOLD. |
| **c08 bridge** | 106.812 – 119.419 | 38–42 | Clean plan / elevation drawings (paper, calmer, since the music dips around 108–112) | 左边一个放调料: the left half of the frame, a seasoning pull-out glides out left. 右边一个放碗碟: the right half, a dish basket glides out right. 上面一层 / 下面一层: top and bottom tiers split vertically. 所有东西: every item in a neat grid. 站到我眼前: every item stands up and faces camera like a team photo, with LAN in front. |
| **c09 chorus3a** | 119.419 – 131.789 | 43–46 | Chorus 3: CHAMPIONSHIP NIGHT (night stadium, `stadiumLights`, `DARK = true`) | The opener One Two is orange hit #3, then night. This is the maximal squad: pull-drawers under light cones, glowing baskets (`'glow'` style), confetti bursts. 咔嗒 is macro plus a stadium-wide freeze under the lights. |
| **c10 final** | 131.789 – 156.12 | 47–52 | Night → paper | Hey Hey with confetti. 旧厨房换个style: a trophy moment (an original generic trophy shaped like a drawer basket). One Two 拉出来 / 悍高拉篮 / 拉出来 (145.5): the biggest hook. 146.5–152: an instrumental celebration and team photo; night lifts to paper. 152.2 拉出来 is the last yank. **End card (153–156.12):** "HIGOLD 悍高 · 厨房拉篮 · 旧厨房 换个 style", a basket glides shut on the last note, calm. The audio fades from about 152 s. |
