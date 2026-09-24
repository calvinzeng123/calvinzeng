#!/usr/bin/env bash
# Fetch the non-committed inputs: the song (from the reference repo) and the OFL fonts; install a static ffmpeg.
set -e
cd "$(dirname "$0")/.."
mkdir -p .cache/fonts
[ -f .cache/song.mp3 ] || curl -sSL -o .cache/song.mp3 https://github.com/JohnHeibel/PDoomVideo/raw/main/assets/pdoom.mp3
B=https://raw.githubusercontent.com/google/fonts/main/ofl
cd .cache/fonts
for f in "notosanssc/NotoSansSC%5Bwght%5D.ttf" "notoserifsc/NotoSerifSC%5Bwght%5D.ttf" "zcoolqingkehuangyou/ZCOOLQingKeHuangYou-Regular.ttf" "zhimangxing/ZhiMangXing-Regular.ttf" "longcang/LongCang-Regular.ttf" "mashanzheng/MaShanZheng-Regular.ttf" "anton/Anton-Regular.ttf" "instrumentserif/InstrumentSerif-Regular.ttf" "instrumentserif/InstrumentSerif-Italic.ttf" "jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf" "spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf" "archivoblack/ArchivoBlack-Regular.ttf"; do
  n=$(basename "$f" | sed 's/%5Bwght%5D/-VF/'); [ -f "$n" ] || curl -gsSL -o "$n" "$B/$f"; done
[ -f SmileySans-Oblique.ttf ] || { curl -sSL -o s.zip https://github.com/atelier-anchor/smiley-sans/releases/download/v2.0.1/smiley-sans-v2.0.1.zip && python3 -c "import zipfile;zipfile.ZipFile('s.zip').extract('SmileySans-Oblique.ttf')" && rm s.zip; }
command -v ffmpeg >/dev/null || { pip install -q imageio-ffmpeg && ln -sf "$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')" /usr/local/bin/ffmpeg; }
echo ready
