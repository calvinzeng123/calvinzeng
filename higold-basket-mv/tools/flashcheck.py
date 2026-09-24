# flashcheck.py — photosensitivity gate over the rendered frames (out/frames). Downscales each frame to 108 px wide, counts a
# "flash" when >25% of pixels change luminance by >0.1 between consecutive frames, and flags any 1-second window with >3 flashes.
import subprocess, sys, numpy as np
FF = 'ffmpeg'; w, h = 108, 61
src = sys.argv[1] if len(sys.argv) > 1 else 'out/frames/f%05d.jpg'
cmd = [FF, '-loglevel', 'error', '-framerate', '24', '-i', src, '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-']
raw = subprocess.run(cmd, capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32) / 255
d = np.diff(fr, axis=0)
# WCAG-style: a transition is +1 (>25% of the frame brightens by >0.1) or -1 (>25% darkens by >0.1); a FLASH is a pair of
# opposing transitions. Fast high-contrast motion (lines sweeping) is reported separately as "hard motion", not as flashing.
up = (d > .1).mean(axis=(1, 2)); dn = (d < -.1).mean(axis=(1, 2))
sign = np.where((up > .25) & (up >= dn), 1, np.where((dn > .25) & (dn > up), -1, 0))
bad = []
for i in range(len(sign)):
    w = [v for v in sign[i:i + 24] if v != 0]
    flashes = sum(1 for a, b in zip(w, w[1:]) if a != b)
    if flashes > 3: bad.append((i / 24, flashes))
hard = [round(i / 24, 2) for i in np.where((np.abs(d) > .1).mean(axis=(1, 2)) > .25)[0]]
print(f'{len(fr)} frames; {int((sign != 0).sum())} big luminance transitions; hard-motion frames: {len(hard)}')
if bad:
    segs = []
    for t, n in bad:
        if not segs or t - segs[-1][1] > .05: segs.append([t, t, n])
        else: segs[-1][1] = t; segs[-1][2] = max(segs[-1][2], n)
    print('UNSAFE flashing windows (start, end, max opposing pairs/s):', [(round(a, 2), round(b + 1, 2), n) for a, b, n in segs]); sys.exit(1)
print('flash safety OK (no window with more than 3 opposing luminance flips per second)')
