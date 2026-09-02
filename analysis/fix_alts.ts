/**
 * Alt-text completion for in-content images (ROADMAP P1, Task 13).
 *
 * Problem: all in-content images carry junk alt text ("Image" / "تصویر")
 * — zero descriptive alt (accessibility + SEO fail).
 *
 * Modes (idempotent + resumable):
 *   --audit      baseline report: img tags, junk-alt count, unique srcs,
 *                disk presence, cache/failed-queue status (no writes)
 *   (no args)    generate: VLM pass over pending images → resume-safe cache
 *                (alt_cache.json saved after EVERY success), failed queue
 *                (alt_failed.json), exponential backoff + jitter on 429.
 *                Circuit breaker: if the first ALT_STORM_ABORT images of a
 *                pass fail purely on 429 with zero successes, the pass
 *                sleeps ALT_STORM_SLEEP_MIN minutes and resumes, up to a
 *                total wall-time cap of ALT_MAX_HOURS.
 *                env: ALT_LIMIT=n cap images this run (smoke tests)
 *                     ALT_DELAY_MS=ms spacing between calls (default 2500)
 *                     ALT_STORM_ABORT=3  consecutive storm-only failures
 *                     ALT_STORM_SLEEP_MIN=10  sleep between storm retries
 *                     ALT_MAX_HOURS=8  total wall-time cap
 *   --validate   quality control of cache: junk patterns, length,
 *                duplicates, EN/FA language match
 *   --merge-manual  merge hand-authored alt (analysis/alt_manual.json,
 *                provenance `via: agent-vision`) into the cache; existing
 *                VLM keys are never overwritten
 *   --apply      backup DB → rewrite alt="..." (EN alt in contentEn,
 *                FA alt in contentFa) → marker alt_text_descriptive_v1
 *                → post-apply junk recount
 */
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const CACHE = path.resolve('analysis/alt_cache.json');
const FAILED = path.resolve('analysis/alt_failed.json');
const BACKUP_DIR = 'db';
const MARKER_KEY = 'alt_text_descriptive_v1';
const SKIP = '__SKIP__'; // unreadable / missing on disk → leave DB untouched

type AltPair = { en: string; fa: string };
type Cache = Record<string, AltPair | typeof SKIP>;
type FailedEntry = { name: string; reason: string; attempts: number; ts: string };

const JUNK_RE = /^(image|img|photo|picture|تصویر|عکس)$/i;
const IMG_RE = /<img\b[^>]*>/gi;
const SRC_RE = /\bsrc\s*=\s*"([^"]+)"/i;
const ALT_RE = /\balt\s*=\s*"([^"]*)"/i;

/* ---------------- cache / failed queue persistence ---------------- */

function loadCache(): Cache {
  try {
    return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  } catch {
    return {};
  }
}
function saveCache(c: Cache) {
  fs.writeFileSync(CACHE, JSON.stringify(c, null, 1));
}
function loadFailed(): Record<string, FailedEntry> {
  try {
    return JSON.parse(fs.readFileSync(FAILED, 'utf8'));
  } catch {
    return {};
  }
}
function saveFailed(f: Record<string, FailedEntry>) {
  fs.writeFileSync(FAILED, JSON.stringify(f, null, 1));
}

/* ---------------- DB helpers ---------------- */

async function withDb<T>(fn: (db: PrismaClient) => Promise<T>): Promise<T> {
  const db = new PrismaClient();
  try {
    return await fn(db);
  } finally {
    await db.$disconnect();
  }
}

async function collectSrcs(): Promise<Set<string>> {
  return withDb(async (db) => {
    const posts = await db.post.findMany({ select: { contentEn: true, contentFa: true } });
    const srcs = new Set<string>();
    for (const p of posts)
      for (const html of [p.contentEn || '', p.contentFa || ''])
        for (const tag of html.match(IMG_RE) || []) {
          const s = (tag.match(SRC_RE) || [])[1];
          if (s?.startsWith('/media/')) {
            let name = s.slice('/media/'.length);
            try {
              name = decodeURIComponent(name);
            } catch {}
            srcs.add(name);
          }
        }
    return srcs;
  });
}

async function auditDb() {
  return withDb(async (db) => {
    const posts = await db.post.findMany({ select: { contentEn: true, contentFa: true } });
    let tags = 0;
    let junk = 0;
    let empty = 0;
    let descriptive = 0;
    let nonMedia = 0;
    const srcs = new Set<string>();
    for (const p of posts)
      for (const html of [p.contentEn || '', p.contentFa || ''])
        for (const tag of html.match(IMG_RE) || []) {
          tags++;
          const alt = (tag.match(ALT_RE) || [])[1] || '';
          if (!alt.trim()) empty++;
          else if (JUNK_RE.test(alt.trim())) junk++;
          else descriptive++;
          const s = (tag.match(SRC_RE) || [])[1];
          if (s?.startsWith('/media/')) {
            let name = s.slice('/media/'.length);
            try {
              name = decodeURIComponent(name);
            } catch {}
            srcs.add(name);
          } else nonMedia++;
        }
    return { posts: posts.length, tags, junk, empty, descriptive, nonMedia, unique: srcs.size, srcs: [...srcs] };
  });
}

/* ---------------- VLM generation ---------------- */

const PROMPT = `You are writing accessibility alt text for a personal blog about startups, smart cities, AI, investment and inventions (author: Mehrdad).
Reply ONLY with valid JSON, no markdown fences: {"en":"...","fa":"..."}
Rules:
- en: concise descriptive English alt text, max 120 chars, sentence case, no "image of"/"picture of" filler, no trailing period.
- fa: natural Persian translation of the same description (not machine-sounding), max 120 chars, correct Persian punctuation.
- Describe the actual visual subject: if it is an app/website screenshot name the app or UI shown; if a chart/diagram say what it charts; if a photo describe the scene; if it is a logo, name the brand.
- Do not guess information that is not visible in the image.
- If the image is unreadable/blank/corrupt, reply {"en":"__SKIP__","fa":"__SKIP__"}.`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
const jitter = (maxMs: number) => Math.floor(Math.random() * maxMs);

function parseAlt(raw: string): AltPair | null {
  let t = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a === -1 || b === -1) return null;
  try {
    const j = JSON.parse(t.slice(a, b + 1));
    if (typeof j.en === 'string' && typeof j.fa === 'string' && j.en.trim() && j.fa.trim()) {
      return { en: j.en.trim().slice(0, 200), fa: j.fa.trim().slice(0, 200) };
    }
  } catch {}
  return null;
}

type Totals = { generated: number; unreadable: number; failed: number; four29: number; retries: number };
type Outcome = 'success' | 'skip' | 'rate' | 'error' | 'missing';
const stormState = { consecutive429: 0 };

function writeStats(wallStart: number, totals: Totals) {
  const stats = {
    startedAt: new Date(wallStart).toISOString(),
    finishedAt: new Date().toISOString(),
    durationMin: +((Date.now() - wallStart) / 60000).toFixed(1),
    ...totals,
  };
  console.log(`RUN SUMMARY in ${stats.durationMin} min — generated: ${totals.generated}, unreadable: ${totals.unreadable}, failed: ${totals.failed}, 429s: ${totals.four29}, retries: ${totals.retries}`);
  fs.writeFileSync(path.resolve('analysis/alt_stats.json'), JSON.stringify(stats, null, 1));
}

/** Single image: read file → VLM (up to maxAttempts with backoff) → persist immediately. */
async function tryOne(zai: Awaited<ReturnType<typeof ZAI.create>>, name: string, totals: Totals, maxAttempts: number): Promise<Outcome> {
  const cache = loadCache();
  const failed = loadFailed();
  const file = path.join('public/media', name);
  let buf: Buffer;
  try {
    buf = fs.readFileSync(file);
  } catch {
    console.log(`⚠ file missing on disk: ${name}`);
    cache[name] = SKIP; // missing file → cannot describe → leave DB untouched
    saveCache(cache);
    delete failed[name];
    saveFailed(failed);
    return 'missing';
  }
  const mime = file.endsWith('.png') ? 'image/png' : file.endsWith('.webp') ? 'image/webp' : file.endsWith('.gif') ? 'image/gif' : 'image/jpeg';
  const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;

  let lastReason = '';
  let only429 = true;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        thinking: { type: 'disabled' },
      });
      const raw = res.choices[0]?.message?.content || '';
      const parsed = parseAlt(raw);
      if (!parsed) {
        lastReason = `unparseable: ${raw.slice(0, 120)}`;
        console.log(`✗ unparseable for ${name}: ${raw.slice(0, 120)}`);
        break; // parse failures are deterministic → do not retry
      }
      if (parsed.en === SKIP) {
        cache[name] = SKIP;
        totals.unreadable++;
        console.log(`– skip (unreadable): ${name}`);
      } else {
        cache[name] = parsed;
        totals.generated++;
        console.log(`✓ [${totals.generated}] ${name.slice(0, 44)} → "${parsed.en.slice(0, 60)}"`);
      }
      saveCache(cache); // persistence after EVERY image (resume-safe)
      delete failed[name];
      saveFailed(failed);
      stormState.consecutive429 = 0;
      return parsed.en === SKIP ? 'skip' : 'success';
    } catch (e: any) {
      const msg = String(e?.message || e);
      lastReason = msg.slice(0, 200);
      if (msg.includes('429')) {
        totals.four29++;
        totals.retries++;
        stormState.consecutive429++;
        // exponential backoff + storm penalty + random jitter, capped 5 min
        const waitSec = Math.min(30 * Math.pow(2, attempt - 1) + 30 * Math.min(stormState.consecutive429 - 1, 10) + jitter(15), 300);
        if (attempt < maxAttempts) {
          console.log(`⏳ 429 for ${name} (attempt ${attempt}/${maxAttempts}), cooling down ${waitSec}s (storm: ${stormState.consecutive429})`);
          await sleep(waitSec * 1000);
        } else {
          console.log(`⏳ 429 for ${name} (attempt ${attempt}/${maxAttempts}) — exhausted`);
        }
      } else {
        only429 = false;
        totals.retries++;
        console.log(`✗ error for ${name} (attempt ${attempt}/${maxAttempts}): ${msg.slice(0, 140)}`);
        if (attempt < maxAttempts) await sleep(8_000 + jitter(4_000));
      }
    }
  }
  // failure isolation: log to failed queue, let caller decide
  totals.failed++;
  failed[name] = { name, reason: lastReason || 'exhausted retries', attempts: maxAttempts, ts: new Date().toISOString() };
  saveFailed(failed);
  console.log(`↩ failed: ${name} (queued for resume)`);
  return only429 ? 'rate' : 'error';
}

async function generate() {
  const wallStart = Date.now();
  const maxMs = parseFloat(process.env.ALT_MAX_HOURS || '8') * 3600_000;
  const delay = parseInt(process.env.ALT_DELAY_MS || '2000', 10);
  const totals: Totals = { generated: 0, unreadable: 0, failed: 0, four29: 0, retries: 0 };
  const attempted = new Set<string>(); // this-run exclusions → guaranteed termination
  const zai = await ZAI.create();

  for (;;) {
    const srcs = await collectSrcs();
    const cache = loadCache();
    const pending = [...srcs].filter((s) => !cache[s] && !attempted.has(s));
    const limit = process.env.ALT_LIMIT ? parseInt(process.env.ALT_LIMIT, 10) : pending.length;
    const queue = pending.slice(0, limit);
    console.log(`pass: unique srcs: ${srcs.size}, cached: ${srcs.size - [...srcs].filter((s) => !cache[s]).length}, pending(fresh): ${queue.length}, attempted-this-run: ${attempted.size}`);
    if (!queue.length) {
      const left = [...srcs].filter((s) => !cache[s]).length;
      if (!left) {
        console.log('nothing pending — generation finished');
        fs.writeFileSync(path.resolve('analysis/alt_done.flag'), new Date().toISOString());
      } else {
        console.log(`only previously-attempted failures remain (${left}) — ending run`);
      }
      break;
    }

    // PROBE phase: one single attempt on the first pending image.
    // While the service is down this burns no retry budget; on success the
    // image is already cached and the pass continues.
    const first = await tryOne(zai, queue[0], totals, 1);
    attempted.add(queue[0]);
    if (first === 'rate') {
      const probeMax = parseInt(process.env.ALT_PROBE_MAX || '6', 10);
      let up = false;
      for (let p = 2; p <= probeMax; p++) {
        if (Date.now() - wallStart > maxMs - 80_000) {
          console.log(`⏹ wall-time cap approaching while rate-limited — resume later`);
          writeStats(wallStart, totals);
          return;
        }
        console.log(`⛈ probe ${p - 1}/${probeMax} got 429 — waiting ~60s`);
        await sleep(60_000 + jitter(10_000));
        const r = await tryOne(zai, queue[0], totals, 1);
        if (r !== 'rate') {
          up = true;
          break;
        }
      }
      if (!up) {
        console.log(`⏹ LLM service still rate-limited after ${probeMax} probes — ending run (cache untouched, resume later)`);
        break;
      }
    }

    // MAIN pass: service is up (or first image succeeded) → process the rest
    const cache2 = loadCache();
    const rest = queue.filter((s) => !cache2[s]);
    for (const name of rest) {
      if (Date.now() - wallStart > maxMs) {
        console.log(`⏹ wall-time cap reached — resume later (progress is cached)`);
        writeStats(wallStart, totals);
        return;
      }
      attempted.add(name);
      const outcome = await tryOne(zai, name, totals, 3);
      if (outcome === 'rate') {
        console.log(`⛈ service went down mid-pass — ending run (resume later)`);
        break;
      }
      await sleep(delay + jitter(1_000)); // polite spacing between images
    }
    if (process.env.ALT_LIMIT) break; // single-batch smoke run
  }

  writeStats(wallStart, totals);
}

/* ---------------- quality control ---------------- */

function validate() {
  const cache = loadCache();
  const entries = Object.entries(cache).filter(([, v]) => v !== SKIP) as [string, AltPair][];
  const skipped = Object.values(cache).filter((v) => v === SKIP).length;

  const junk: string[] = [];
  const tooLong: string[] = [];
  const wrongLang: string[] = [];
  const byEn = new Map<string, string[]>();

  for (const [name, alt] of entries) {
    if (JUNK_RE.test(alt.en) || JUNK_RE.test(alt.fa)) junk.push(name);
    if (alt.en.length > 150 || alt.fa.length > 150) tooLong.push(name);
    const enIsLatin = /[A-Za-z]/.test(alt.en) && !/[\u0600-\u06FF]/.test(alt.en);
    const faIsPersian = /[\u0600-\u06FF]/.test(alt.fa);
    if (!enIsLatin || !faIsPersian) wrongLang.push(name);
    byEn.set(alt.en, [...(byEn.get(alt.en) || []), name]);
  }
  const dupes = [...byEn.entries()].filter(([, v]) => v.length > 1);

  console.log(`cache: ${entries.length} descriptive, ${skipped} skipped (unreadable/missing)`);
  console.log(`junk-pattern: ${junk.length}${junk.length ? ' → ' + junk.slice(0, 5).join(', ') : ''}`);
  console.log(`too long (>150): ${tooLong.length}${tooLong.length ? ' → ' + tooLong.slice(0, 5).join(', ') : ''}`);
  console.log(`language mismatch: ${wrongLang.length}${wrongLang.length ? ' → ' + wrongLang.slice(0, 5).join(', ') : ''}`);
  console.log(`duplicate EN alt groups: ${dupes.length}`);
  for (const [en, names] of dupes.slice(0, 10)) console.log(`  dup "${en.slice(0, 60)}" × ${names.length}: ${names.slice(0, 4).join(' | ')}`);
  if (!junk.length && !tooLong.length && !wrongLang.length) console.log('VALIDATION PASS ✓');
}

/* ---------------- apply to DB ---------------- */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function rewriteTag(tag: string, altText: string): string {
  if (/\balt\s*=/i.test(tag)) return tag.replace(ALT_RE, `alt="${esc(altText)}"`);
  return tag.replace(/\/?>$/, ` alt="${esc(altText)}"$&`); // insert before closing bracket (single insert)
}

function rewriteHtml(html: string, name: string, altText: string): { html: string; count: number } {
  let count = 0;
  const out = html.replace(IMG_RE, (tag) => {
    const src = (tag.match(SRC_RE) || [])[1];
    if (!src?.startsWith('/media/')) return tag;
    let decoded = src.slice('/media/'.length);
    try {
      decoded = decodeURIComponent(decoded);
    } catch {}
    if (decoded !== name) return tag;
    count++;
    return rewriteTag(tag, altText);
  });
  return { html: out, count };
}

async function apply() {
  const cache = loadCache();
  const doneEntries = Object.entries(cache).filter(([, v]) => v !== SKIP) as [string, AltPair][];
  const skipCount = Object.values(cache).filter((v) => v === SKIP).length;
  console.log(`apply: ${doneEntries.length} descriptive alts in cache, ${skipCount} skipped entries (untouched)`);
  if (!doneEntries.length) {
    console.log('nothing to apply');
    return;
  }
  const srcs = await collectSrcs();
  const missing = doneEntries.filter(([n]) => !srcs.has(n)).map(([n]) => n);
  if (missing.length) console.log(`⚠ ${missing.length} cache keys not found in current content (ignored): ${missing.slice(0, 3).join(', ')}`);

  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  fs.copyFileSync('db/custom.db', path.join(BACKUP_DIR, `custom.backup-${stamp}.db`));
  console.log(`backup: db/custom.backup-${stamp}.db`);

  await withDb(async (db) => {
    const posts = await db.post.findMany({ select: { id: true, contentEn: true, contentFa: true } });
    let postsChanged = 0;
    let tagsEn = 0;
    let tagsFa = 0;
    for (const p of posts) {
      let en = p.contentEn || '';
      let fa = p.contentFa || '';
      let cEn = 0;
      let cFa = 0;
      for (const [name, alt] of doneEntries) {
        const r1 = rewriteHtml(en, name, alt.en);
        en = r1.html;
        cEn += r1.count;
        const r2 = rewriteHtml(fa, name, alt.fa);
        fa = r2.html;
        cFa += r2.count;
      }
      if (cEn || cFa) {
        await db.post.update({ where: { id: p.id }, data: { contentEn: en, contentFa: fa } });
        postsChanged++;
        tagsEn += cEn;
        tagsFa += cFa;
      }
    }
    console.log(`applied: ${postsChanged} posts updated, ${tagsEn} EN img tags rewritten, ${tagsFa} FA img tags rewritten`);

    const marker = await db.siteSetting.findUnique({ where: { key: MARKER_KEY } });
    if (!marker) await db.siteSetting.create({ data: { key: MARKER_KEY, value: new Date().toISOString() } });
    else await db.siteSetting.update({ where: { key: MARKER_KEY }, data: { value: new Date().toISOString() } });
    console.log('marker set:', MARKER_KEY);
  });

  const after = await auditDb();
  console.log(`POST-APPLY AUDIT: tags=${after.tags} junk=${after.junk} empty=${after.empty} descriptive=${after.descriptive} nonMedia=${after.nonMedia} unique=${after.unique}`);
}

/* ---------------- main ---------------- */

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--audit')) {
    const a = await auditDb();
    const srcs = new Set(a.srcs);
    const onDisk = a.srcs.filter((n) => fs.existsSync(path.join('public/media', n))).length;
    const cache = loadCache();
    const failed = loadFailed();
    console.log(`posts: ${a.posts}`);
    console.log(`img tags total: ${a.tags} (junk alt: ${a.junk}, empty: ${a.empty}, descriptive: ${a.descriptive}, non-/media/: ${a.nonMedia})`);
    console.log(`unique /media/ images: ${a.unique} — on disk: ${onDisk}, missing: ${a.unique - onDisk}`);
    console.log(`cache: ${Object.keys(cache).length} entries (${Object.values(cache).filter((v) => v !== SKIP).length} descriptive, ${Object.values(cache).filter((v) => v === SKIP).length} skipped)`);
    console.log(`failed queue: ${Object.keys(failed).length}`);
    const junkSample = a.srcs.slice(0, 3);
    console.log(`src sample: ${junkSample.join(' | ').slice(0, 200)}`);
    return;
  }
  if (argv.includes('--validate')) {
    validate();
    return;
  }
  if (argv.includes('--merge-manual')) {
    // merge hand-authored entries (analysis/alt_manual.json) into the cache;
    // existing cache keys (VLM) are never overwritten
    const manual = JSON.parse(fs.readFileSync(path.resolve('analysis/alt_manual.json'), 'utf8')) as Cache;
    const cache = loadCache();
    let added = 0;
    for (const [k, v] of Object.entries(manual)) {
      if (!cache[k]) {
        cache[k] = v;
        added++;
      }
    }
    saveCache(cache);
    console.log(`merged ${added} manual entries into cache (total: ${Object.keys(cache).length})`);
    return;
  }
  if (argv.includes('--apply')) {
    await apply();
    return;
  }
  await generate();
}

main().catch((e) => {
  console.error('fatal:', e);
  process.exit(1);
});
