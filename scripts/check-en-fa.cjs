// One-off QA scan: Persian characters inside ENGLISH seed fields.
// Tracks contentEn: [...] arrays until ].join and checks each line.
const fs = require('fs');
const src = fs.readFileSync('src/lib/seed-import.ts', 'utf8');
const lines = src.split('\n');
const FA = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
let mode = null; // 'en' | 'fa' | null
let inEnArray = false;
let bad = 0;
lines.forEach((line, i) => {
  const n = i + 1;
  // single-line EN fields (titleEn:, excerptEn:, summaryEn:, nameEn:, contentEn: '...')
  const singleEn = line.match(/\b(titleEn|excerptEn|summaryEn|nameEn|contentEn|quoteEn|descEn)\s*:\s*['"`]/);
  if (singleEn) {
    // only flag when this line is a complete single-line string for the EN field
    if (FA.test(line)) {
      console.log(`L${n} [single-line EN field "${singleEn[1]}"] has Persian: ${line.trim().slice(0, 140)}`);
      bad++;
    }
  }
  // array mode tracking
  if (/contentEn\s*:\s*\[/.test(line)) { inEnArray = true; mode = 'en'; return; }
  if (/contentFa\s*:\s*\[|titleFa\s*:|excerptFa\s*:|summaryFa\s*:|nameFa\s*:|contentFa\s*:/.test(line)) { if (!inEnArray) mode = 'fa'; return; }
  if (inEnArray && /\]\s*\.join/.test(line)) { inEnArray = false; mode = null; return; }
  if (inEnArray && mode === 'en' && FA.test(line)) {
    console.log(`L${n} [inside contentEn array] has Persian: ${line.trim().slice(0, 140)}`);
    bad++;
  }
});
console.log(bad === 0 ? 'PASS: no Persian characters in any ENGLISH seed field' : `FAIL: ${bad} line(s) with Persian inside EN fields`);
