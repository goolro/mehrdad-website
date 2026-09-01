/**
 * Alt-text completion for in-content images (ROADMAP P1).
 *
 * Problem: all 118 unique in-content images carry junk alt text
 * ("Image" / "تصویر") — zero descriptive alt (accessibility + SEO fail).
 *
 * Pipeline:
 *  1. collect unique /media/ srcs from Post.contentEn + contentFa
 *  2. per image: VLM (createVision, base64) → { en, fa } concise alt text
 *  3. resume-safe cache analysis/alt_cache.json (saved after EVERY success)
 *  4. --apply: backup DB → rewrite alt="..." (EN alt in contentEn,
 *     FA alt in contentFa) → SiteSetting marker alt_text_descriptive_v1
 *
 * Run:   bun analysis/fix_alts.ts           (generate/cache only)
 *        bun analysis/fix_alts.ts --apply   (write DB once cache complete)
 */
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const CACHE = path.resolve('analysis/alt_cache.json');
const BACKUP_DIR = 'db';
const MARKER_KEY = 'alt_text_descriptive_v1';
const MISSING_FALLBACK = '__SKIP__';

type Cache = Record<string, { en: string; fa: string } | typeof MISSING_FALLBACK>;

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

const IMG_RE = /<img\b[^>]*>/gi;
const SRC_RE = /\bsrc\s*=\s*"([^"]+)"/i;
const ALT_RE = /\balt\s*=\s*"([^"]*)"/i;

function collectSrcs(): Set<string> {
  const db = new PrismaClient();
  return db.$transaction(async () => {
    const posts = await db.post.findMany({ select: { contentEn: true, contentFa: true } });
    const srcs = new Set<string>();
    for (const p of posts)
      for (const html of [p.contentEn || '', p.contentFa || ''])
        for (const tag of html.match(IMG_RE) || []) {
          const s = (tag.match(SRC_RE) || [])[1];
          if (s?.startsWith('/media/')) srcs.add(decodeURIComponent(s.replace('/media/', '')));
        }
    await db.$disconnect();
    return srcs;
  });
}

const PROMPT = `You are writing accessibility alt text for a personal blog about startups, smart cities, AI, investment and inventions (author: Mehrdad).
Reply ONLY with valid JSON, no markdown fences: {"en":"...","fa":"..."}
Rules:
- en: concise descriptive English alt text, max 120 chars, sentence case, no "image of"/"picture of" filler, no trailing period.
- fa: natural Persian translation of the same description (not machine-sounding), max 120 chars, correct Persian punctuation.
- Describe the actual visual subject: if it is an app/website screenshot name the app or UI shown; if a chart/diagram say what it charts; if a photo describe the scene; if it is a logo, name the brand.
- If the image is unreadable/blank/corrupt, reply {"en":"__SKIP__","fa":"__SKIP__"}.`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseAlt(raw: string): { en: string; fa: string } | null {
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

async function main() {
  const apply = process.argv.includes('--apply');
  const srcs = await collectSrcs();
  const cache = loadCache();
  const pending = [...srcs].filter((s) => !cache[s]);
  console.log(`unique srcs: ${srcs.size}, cached: ${srcs.size - pending.length}, pending: ${pending.length}`);
  if (!apply) {
    const zai = await ZAI.create();
    let done = 0;
    let consecutive429 = 0;
    for (const name of pending) {
      const file = path.join('public/media', name);
      let buf: Buffer;
      try {
        buf = fs.readFileSync(file);
      } catch {
        console.log(`⚠ file missing on disk: ${name}`);
        cache[name] = MISSING_FALLBACK;
        saveCache(cache);
        continue;
      }
      const mime = file.endsWith('.png') ? 'image/png' : file.endsWith('.webp') ? 'image/webp' : file.endsWith('.gif') ? 'image/gif' : 'image/jpeg';
      const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
      let ok = false;
      for (let attempt = 1; attempt <= 5 && !ok; attempt++) {
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
            console.log(`✗ unparseable for ${name}: ${raw.slice(0, 120)}`);
            break; // do not retry parse failures
          }
          if (parsed.en === '__SKIP__') {
            cache[name] = MISSING_FALLBACK;
            console.log(`– skip (unreadable): ${name}`);
          } else {
            cache[name] = parsed;
            console.log(`✓ [${++done}/${pending.length}] ${name.slice(0, 40)} → "${parsed.en.slice(0, 60)}"`);
          }
          saveCache(cache);
          ok = true;
          consecutive429 = 0;
        } catch (e: any) {
          const msg = String(e?.message || e);
          if (msg.includes('429')) {
            consecutive429++;
            const wait = Math.min(60 * consecutive429 + 45 * attempt, 600);
            console.log(`⏳ 429 for ${name}, cooling down ${wait}s (consecutive storms: ${consecutive429})`);
            await sleep(wait * 1000);
          } else {
            console.log(`✗ error for ${name}: ${msg.slice(0, 140)}`);
            await sleep(8_000);
          }
        }
      }
      if (!ok) console.log(`↩ giving up on ${name} this run (resume later)`);
      await sleep(2_000); // polite spacing between calls
    }
    console.log('generation pass finished');
  }

  if (apply) {
    const cache2 = loadCache();
    const doneEntries = Object.entries(cache2).filter(([, v]) => v !== MISSING_FALLBACK) as [string, { en: string; fa: string }][];
    console.log(`apply: ${doneEntries.length} alts in cache`);
    if (!doneEntries.length) {
      console.log('nothing to apply');
      return;
    }
    const db = new PrismaClient();
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    fs.copyFileSync('db/custom.db', path.join(BACKUP_DIR, `custom.backup-${stamp}.db`));
    console.log(`backup: db/custom.backup-${stamp}.db`);

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const posts = await db.post.findMany({ select: { id: true, contentEn: true, contentFa: true } });
    let postsChanged = 0;
    let tagsRewritten = 0;
    for (const p of posts) {
      let en = p.contentEn || '';
      let fa = p.contentFa || '';
      const before = en + fa;
      for (const [name, alt] of doneEntries) {
        // match the img tag whose src is this file (raw or percent-encoded)
        const srcVariants = [name, encodeURIComponent(name)];
        for (const variant of srcVariants) {
          const srcEsc = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const tagRe = new RegExp(`<img\\b[^>]*src="/media/${srcEsc}"[^>]*>`, 'gi');
          const rewrite = (html: string, altText: string) =>
            html.replace(tagRe, (tag) => {
              if (!/\balt\s*=/i.test(tag)) return tag.replace(/\/?>$/, ` alt="${esc(altText)}"$&`.replace(' alt=', ' alt=') ).replace(/>$/, ` alt="${esc(altText)}">`);
              return tag.replace(ALT_RE, `alt="${esc(altText)}"`);
            });
          if (en) en = rewrite(en, alt.en);
          if (fa) fa = rewrite(fa, alt.fa);
        }
      }
      if ((en + fa) !== before) {
        await db.post.update({ where: { id: p.id }, data: { contentEn: en, contentFa: fa } });
        postsChanged++;
        tagsRewritten += countChanges(before, en + fa);
      }
    }
    const marker = await db.siteSetting.findUnique({ where: { key: MARKER_KEY } });
    if (!marker) await db.siteSetting.create({ data: { key: MARKER_KEY, value: new Date().toISOString() } });
    else await db.siteSetting.update({ where: { key: MARKER_KEY }, data: { value: new Date().toISOString() } });
    console.log(`applied: ${postsChanged} posts updated, ~${tagsRewritten} img tags rewritten`);
    console.log('marker set:', MARKER_KEY);
    await db.$disconnect();
  }
}

function countChanges(before: string, after: string): number {
  let n = 0;
  for (let i = 0; i < Math.min(before.length, after.length); i++) if (before[i] !== after[i]) n++;
  return n;
}

main().catch((e) => {
  console.error('fatal:', e);
  process.exit(1);
});
