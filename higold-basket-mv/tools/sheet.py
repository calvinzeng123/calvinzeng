# sheet.py — contact sheet from rendered frames (out/frames/f%05d.jpg), with timestamps.
#   python3 tools/sheet.py --from=23 --to=38.5 --fps=4 [--cols=6] [--w=320] [--out=out/review/x.jpg]
#   python3 tools/sheet.py --times=23.0,23.04,23.08 ...        (explicit times; snapped to frames)
import sys, os
from PIL import Image, ImageDraw, ImageFont
a = dict(x.lstrip('-').split('=', 1) for x in sys.argv[1:] if '=' in x)
FPS = 24; D = a.get('dir', 'out/frames')
if 'times' in a: ts = [float(v) for v in a['times'].split(',')]
else:
    t0, t1, f = float(a.get('from', 0)), float(a.get('to', 156.6)), float(a.get('fps', 4))
    ts = []; t = t0
    while t < t1 - 1e-6: ts.append(t); t += 1 / f
cols = int(a.get('cols', 6)); w = int(a.get('w', 320)); h = round(w * 9 / 16); rows = (len(ts) + cols - 1) // cols
S = Image.new('RGB', (cols * (w + 4) + 4, rows * (h + 22) + 4), (30, 30, 30)); dr = ImageDraw.Draw(S)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 14)
except Exception: font = ImageFont.load_default()
for i, t in enumerate(ts):
    n = min(3757, round(t * FPS)); p = f'{D}/f{n:05d}.jpg'
    x, y = 4 + (i % cols) * (w + 4), 4 + (i // cols) * (h + 22)
    if os.path.exists(p): S.paste(Image.open(p).resize((w, h), Image.LANCZOS), (x, y))
    dr.text((x + 2, y + h + 3), f'{n / FPS:.2f}s  #{n}', fill=(230, 230, 230), font=font)
out = a.get('out', 'out/review/sheet.jpg'); os.makedirs(os.path.dirname(out), exist_ok=True); S.save(out, quality=88); print(out, len(ts), 'frames')
