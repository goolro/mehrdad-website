// Task 25 — Persian narration generator for the D-061 reels (voice.mjs)
// Voice: Microsoft Edge neural voice fa-IR-FaridNeural (verified via TTS→ASR
// round-trip — near-perfect Persian; the z-ai voices garble Persian).
// Each line is a subtitle cue in dayXX.ass; spoken text mirrors the subtitle.
// Adaptive rate: any line longer than its scene window is re-synthesized
// with a higher SSML rate (max +20%) so narration never overlaps the next cue.
//
// Usage: bun scripts/reels/voice.mjs <day02|day04> <outDir>
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { execSync } from "node:child_process";
import { renameSync, existsSync, statSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [day, outDirArg] = process.argv.slice(2);
if (!day || !outDirArg) {
  console.error("usage: bun scripts/reels/voice.mjs <day02|day04> <outDir>");
  process.exit(1);
}
const outDir = outDirArg;
mkdirSync(outDir, { recursive: true });

// spoken lines: [index, startMs, slotMs, text] — timings mirror the .ass cues
const LINES = day === "day04" ? [
  [0,   180,  3200, "این پنج اشتباه ایده‌های خوب را می‌کشد"],
  [1,  3380,  3200, "اشتباه یک؛ منتظر لحظهٔ کامل ماندن"],
  [2,  6580,  3200, "اشتباه دو؛ ساختن همه‌چیز با هم"],
  [3,  9780,  3200, "اشتباه سه؛ ترس از نشان دادن نسخهٔ اول"],
  [4, 12980,  3200, "اشتباه چهار؛ خرج زیاد قبل از اولین مشتری"],
  [5, 16180,  3200, "اشتباه پنج؛ ول کردن ایده بعد از اولین نه"],
  [6, 19380,  5400, "کدامش برای تو آشناست؟ کامنت کن؛ سیو کن؛ ایده‌ات را پیام بزن"],
] : [
  [0,   180,  3200, "ایده‌ات دو هفته با دنیای واقعی فاصله دارد"],
  [1,  3380,  3200, "قدم یک؛ برش دقیق دامنه؛ فقط هستهٔ ارزش"],
  [2,  6580,  3200, "قدم دو؛ ساخت هستهٔ محصول؛ هفتهٔ اول"],
  [3,  9780,  3200, "قدم سه؛ پرداخت جزئیات و استقرار"],
  [4, 12980,  3200, "قدم چهار؛ تحویل محصول زنده"],
  [5, 16180,  5400, "آماده‌ای؟ ایده‌ات را پیام بزن"],
];

const VOICE = "fa-IR-FaridNeural";
const tts = new MsEdgeTTS();
await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

function durMs(file) {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`).toString().trim();
  return Math.round(parseFloat(out) * 1000);
}

const results = [];
for (const [idx, , slot, text] of LINES) {
  const finalPath = join(outDir, `v${day}-${idx}.mp3`);
  if (existsSync(finalPath) && statSync(finalPath).size > 8000) {
    const d = durMs(finalPath);
    results.push([idx, d, "cached"]);
    console.log(`line ${idx}: cached ${d}ms`);
    continue;
  }
  const usable = slot - 250; // breathing room before the next cue
  let rate = "+0%";
  await tts.toFile(outDir, text, { rate });
  renameSync(join(outDir, "audio.mp3"), finalPath);
  let d = durMs(finalPath);
  if (d > usable) {
    const pct = Math.min(20, Math.ceil(((d / usable) - 1) * 100));
    rate = `+${pct}%`;
    await tts.toFile(outDir, text, { rate });
    renameSync(join(outDir, "audio.mp3"), finalPath);
    d = durMs(finalPath);
  }
  results.push([idx, d, rate]);
  console.log(`line ${idx}: ${d}ms rate=${rate}`);
}
tts.close();
console.log(JSON.stringify(results));
