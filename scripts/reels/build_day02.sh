#!/bin/bash
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
ASSETS="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$ASSETS/tmp"
# D-061 reel: day-02 (MVP sprint) — resumable (cached scenes skipped)
set +e
IMG=$REPO/public/media/instagram/day-02.png
WORK=$ASSETS/tmp
FONTS=$ASSETS/fonts
ASS=$ASSETS/day02.ass
OUT=$REPO/public/media/instagram/reels/day-02-reel.mp4
mkdir -p "$WORK" "$(dirname "$OUT")"

scene () { # idx dur zoomexpr
  if [ -f "$WORK/d2s$1.mp4" ] && [ $(stat -c%s "$WORK/d2s$1.mp4" 2>/dev/null || echo 0) -gt 100000 ]; then
    echo "scene $1 cached"; return 0
  fi
  ffmpeg -y -loop 1 -framerate 30 -t "$2" -i "$IMG" -filter_complex \
"[0:v]scale=108:192,scale=1080:1920,boxblur=2:1,eq=brightness=-0.30:saturation=0.80[bg];[0:v]scale=950:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,zoompan=z='$3':x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':d=1:s=1080x1920:fps=30,format=yuv420p" \
    -c:v libx264 -preset ultrafast -crf 20 "$WORK/d2s$1.mp4" -v error -nostats
  echo "scene $1 ok"
}

scene 0 3.6 '1.0+0.07*on/108'
scene 1 3.6 '1.07-0.07*on/108'
scene 2 3.6 '1.0+0.07*on/108'
scene 3 3.6 '1.07-0.07*on/108'
scene 4 3.6 '1.0+0.07*on/108'
scene 5 5.8 '1.07-0.05*on/174'

if [ ! -f "$WORK/d2-silent.mp4" ]; then
  echo "--- concat+subs ---"
  ffmpeg -y -i "$WORK/d2s0.mp4" -i "$WORK/d2s1.mp4" -i "$WORK/d2s2.mp4" \
    -i "$WORK/d2s3.mp4" -i "$WORK/d2s4.mp4" -i "$WORK/d2s5.mp4" -filter_complex \
"[0:v][1:v]xfade=transition=fade:duration=0.4:offset=3.2[x1];[x1][2:v]xfade=transition=fade:duration=0.4:offset=6.4[x2];[x2][3:v]xfade=transition=fade:duration=0.4:offset=9.6[x3];[x3][4:v]xfade=transition=fade:duration=0.4:offset=12.8[x4];[x4][5:v]xfade=transition=fade:duration=0.4:offset=16.0[x5];[x5]subtitles=$ASS:fontsdir=$FONTS,format=yuv420p[vout]" \
    -map "[vout]" -c:v libx264 -preset faster -crf 26 -r 30 "$WORK/d2-silent.mp4" -v error -nostats
fi
echo "concat ok"

if [ ! -f "$WORK/d2-music.wav" ]; then
  echo "--- music ---"
  ffmpeg -y -f lavfi -i "sine=frequency=261.63:duration=26" \
   -f lavfi -i "sine=frequency=329.63:duration=26" \
   -f lavfi -i "sine=frequency=392:duration=26" \
   -f lavfi -i "sine=frequency=130.81:duration=26" \
   -f lavfi -i "anoisesrc=color=pink:duration=26:amplitude=0.35" -filter_complex \
"[0:a]tremolo=f=0.30:d=0.5,lowpass=f=900,volume=0.5[p0];[1:a]tremolo=f=0.30:d=0.5,lowpass=f=900,volume=0.5[p1];[2:a]tremolo=f=0.30:d=0.5,lowpass=f=900,volume=0.5[p2];[3:a]tremolo=f=0.15:d=0.6,lowpass=f=400,volume=0.42[p3];[4:a]lowpass=f=380,volume=0.10[air];[p0][p1][p2][p3][air]amix=inputs=5:normalize=0,aecho=0.7:0.55:60:0.22,afade=t=in:d=1.2,afade=t=out:st=22:d=4,aformat=sample_rates=44100:channel_layouts=stereo[out]" \
   -map "[out]" -c:a pcm_s16le "$WORK/d2-music.wav" -v error -nostats
  ffmpeg -y -f lavfi -i "anoisesrc=color=white:duration=0.5:amplitude=0.8" \
   -af "highpass=f=350,lowpass=f=1500,afade=t=in:d=0.1,afade=t=out:st=0.18:d=0.3,volume=0.9,aformat=sample_rates=44100:channel_layouts=stereo" \
   -c:a pcm_s16le "$WORK/d2-whoosh.wav" -v error -nostats
fi
echo "music ok"

echo "--- narration (Edge TTS fa-IR-FaridNeural — cached per line) ---"
mkdir -p "$WORK/voice"
if command -v bun >/dev/null 2>&1; then bun "$ASSETS/voice.mjs" day02 "$WORK/voice" | tail -1; else node "$ASSETS/voice.mjs" day02 "$WORK/voice" | tail -1; fi

echo "voice ok"

if [ ! -f "$OUT" ]; then
  echo "--- final mix (voice + music + whoosh) ---"
  ffmpeg -y -i "$WORK/d2-silent.mp4" -i "$WORK/d2-music.wav" -i "$WORK/d2-whoosh.wav" \
   -i "$WORK/voice/vday02-0.mp3" -i "$WORK/voice/vday02-1.mp3" -i "$WORK/voice/vday02-2.mp3" \
   -i "$WORK/voice/vday02-3.mp3" -i "$WORK/voice/vday02-4.mp3" -i "$WORK/voice/vday02-5.mp3" -filter_complex \
"[1:a]volume=0.16[m];[2:a]asplit=5[w0][w1][w2][w3][w4];[w0]volume=0.40,adelay=3200|3200[d0];[w1]volume=0.40,adelay=6400|6400[d1];[w2]volume=0.40,adelay=9600|9600[d2];[w3]volume=0.40,adelay=12800|12800[d3];[w4]volume=0.40,adelay=16000|16000[d4];[3:a]aresample=44100,aformat=channel_layouts=stereo,adelay=180|180[v0];[4:a]aresample=44100,aformat=channel_layouts=stereo,adelay=3380|3380[v1];[5:a]aresample=44100,aformat=channel_layouts=stereo,adelay=6580|6580[v2];[6:a]aresample=44100,aformat=channel_layouts=stereo,adelay=9780|9780[v3];[7:a]aresample=44100,aformat=channel_layouts=stereo,adelay=12980|12980[v4];[8:a]aresample=44100,aformat=channel_layouts=stereo,adelay=16180|16180[v5];[m][d0][d1][d2][d3][d4][v0][v1][v2][v3][v4][v5]amix=inputs=12:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aformat=sample_rates=44100:channel_layouts=stereo[aout]" \
   -map 0:v -map "[aout]" -shortest -c:v copy -c:a aac -b:a 160k "$OUT" -v error -nostats
fi
echo "REEL DONE"
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "$OUT"
for t in 1.5 8.0 19.0; do
  ffmpeg -y -ss $t -i "$OUT" -frames:v 1 "$ASSETS/tmp/reel2-f$t.png" -v error -nostats
done
echo "frames extracted"
