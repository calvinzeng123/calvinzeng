# flashcheck.py — photosensitivity gate over the rendered frames (out/frames). Downscales each frame to 108 px wide, counts a
# "flash" when >25% of pixels change luminance by >0.1 between consecutive frames, and flags any 1-second window with >3 flashes.
import subprocess, sys, numpy as np
FF = 'ffmpeg'; w, h = 108, 61
src = sys.argv[1] if len(sys.argv) > 1 else 'out/frames/f%05d.jpg'
cmd = [FF, '-loglevel', 'error', '-framerate', '24', '-i', src, '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-']
raw = subprocess.run(cmd, capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32) / 255
d = np.abs(np.diff(fr, axis=0)); flash = ((d > .1).mean(axis=(1, 2)) > .25)
idx = np.where(flash)[0]; bad = []
for i in range(len(flash)):
    n = flash[i:i + 24].sum()
    if n > 3: bad.append((i / 24, int(n)))
print(f'{len(fr)} frames, {len(idx)} flash transitions at s:', [round(i / 24, 2) for i in idx][:80])
if bad:
    segs = []; 
    for t, n in bad:
        if not segs or t - segs[-1][1] > .05: segs.append([t, t, n])
        else: segs[-1][1] = t; segs[-1][2] = max(segs[-1][2], n)
    print('UNSAFE windows (start, end, max flashes/s):', [(round(a, 2), round(b + 1, 2), n) for a, b, n in segs]); sys.exit(1)
print('flash safety OK')
