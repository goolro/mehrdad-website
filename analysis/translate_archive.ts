/**
 * Batch EN translation for Persian-only archive posts (ROADMAP P0).
 *
 * Reuses the exact pipeline of /api/admin/ai/translate (chunked HTML
 * translation via z-ai SDK) as a resumable standalone batch:
 *  - processes published posts that have contentFa but no contentEn
 *  - translates content (7k-char HTML-aware chunks), title, excerpt
 *  - saves per-post + adds to the AI knowledge base
 *  - progress file analysis/translate_archive_progress.json → re-running
 *    skips already-done posts (idempotent, crash-safe)
 *
 * Run: bun analysis/translate_archive.ts                  (full batch)
 *      bun analysis/translate_archive.ts --one             (first pending only, smoke)
 *      bun analysis/translate_archive.ts --budget 480      (stop cleanly after 480s —
 *                                                           resumable; sandbox-safe)
 */
import { PrismaClient } from '@prisma/client';
import ZAI from 'z-ai-web-dev-sdk';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { addPostToKb } from '../src/lib/kb';

const db = new PrismaClient();

const SYS = `You are a professional translator between Persian (Farsi) and English for an independent product builder's blog about startups, smart cities, AI, rail corridors, and investment.
1. Preserve ALL HTML tags exactly as given (only translate visible text inside them).
2. Keep brand names unchanged: BIZPAL, KLIKA, Mehrdad, Iran, SaaS, IoT, AI, B2B, MVP.
3. Return ONLY the translated HTML. No explanations, no markdown fences.`;

const PROGRESS_FILE = 'analysis/translate_archive_progress.json';

interface Progress {
  done: string[];
  failed: Record<string, string>;
  startedAt: string;
  updatedAt: string;
}

function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    try {
      const p = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')) as Progress;
      // 429 rate-limit failures are retryable — clear them so re-runs retry
      for (const [id, err] of Object.entries(p.failed)) {
        if (err.includes('429')) delete p.failed[id];
      }
      return p;
    } catch {}
  }
  return { done: [], failed: {}, startedAt: new Date().toISOString(), updatedAt: '' };
}

function saveProgress(p: Progress) {
  p.updatedAt = new Date().toISOString();
  writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

function chunkHtml(html: string, maxLen = 7000): string[] {
  const size = Number(process.env.TRANSLATE_CHUNK || maxLen);
  if (html.length <= size) return [html];
  const parts = html.split(/(?=<(?:p|h2|h3|h4|li|blockquote)[ >])|(?<=<\/(?:p|h2|h3|h4|li|blockquote|table)>)/);
  const chunks: string[] = [];
  let cur = '';
  for (const part of parts) {
    if ((cur + part).length > size && cur) {
      chunks.push(cur);
      cur = part;
    } else {
      cur += part;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

/** strip markdown fences the model sometimes adds despite instructions */
function clean(out: string): string {
  let s = (out || '').trim();
  s = s.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');
  return s.trim();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** LLM call with 429 backoff: 30s → 60s → 120s, then give up (post marked failed, retryable) */
async function llmCall(zai: Awaited<ReturnType<typeof ZAI.create>>, messages: { role: string; content: string }[]): Promise<string> {
  const waits = [30_000, 60_000, 120_000];
  for (let attempt = 0; ; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: messages as never,
        thinking: { type: 'disabled' },
      });
      return clean(completion.choices[0]?.message?.content || '');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('429') && attempt < waits.length) {
        console.log(`  ⏳ 429 — waiting ${waits[attempt] / 1000}s (attempt ${attempt + 1}/${waits.length})`);
        await sleep(waits[attempt]);
        continue;
      }
      throw e;
    }
  }
}

async function translateText(zai: Awaited<ReturnType<typeof ZAI.create>>, text: string): Promise<string> {
  return llmCall(zai, [
    { role: 'assistant', content: 'Translate Persian to English. Return ONLY the translation.' },
    { role: 'user', content: text },
  ]);
}

async function translateHtml(zai: Awaited<ReturnType<typeof ZAI.create>>, html: string): Promise<string> {
  const chunks = chunkHtml(html);
  const out: string[] = [];
  for (const c of chunks) {
    out.push(
      await llmCall(zai, [
        { role: 'assistant', content: SYS },
        { role: 'user', content: c },
      ])
    );
    await sleep(1500); // gentle pacing between chunk calls
  }
  return out.join('');
}

async function main() {
  const oneOnly = process.argv.includes('--one');
  const budgetIdx = process.argv.indexOf('--budget');
  const budgetSec = budgetIdx > -1 ? parseInt(process.argv[budgetIdx + 1], 10) || 0 : 0;
  const tStart = Date.now();
  const progress = loadProgress();

  const posts = await db.post.findMany({
    where: {
      published: true,
      contentFa: { not: '' },
      OR: [{ contentEn: null }, { contentEn: '' }],
    },
    select: { id: true, slug: true, titleFa: true, excerptFa: true, contentFa: true },
    orderBy: { date: 'asc' },
  });

  const slugIdx = process.argv.indexOf('--slug');
  const slugFilter = slugIdx > -1 ? process.argv[slugIdx + 1] : null;
  const candidates = slugFilter ? posts.filter((p) => p.slug === slugFilter) : posts;

  const pending = candidates.filter((p) => !progress.done.includes(p.id));
  console.log(`FA-only posts: ${candidates.length}${slugFilter ? ` (slug: ${slugFilter})` : ''} | already done: ${progress.done.length} | pending now: ${pending.length}${oneOnly ? ' (smoke: --one)' : ''}`);

  if (!pending.length) {
    console.log('Nothing to translate.');
    return;
  }

  const zai = await ZAI.create();

  for (const post of oneOnly ? [pending[0]] : pending) {
    if (budgetSec && Date.now() - tStart > budgetSec * 1000) {
      console.log(`⏱ budget (${budgetSec}s) reached — stopping cleanly. done=${progress.done.length}/${posts.length}`);
      break;
    }
    const t0 = Date.now();
    const faLen = (post.contentFa || '').length;
    try {
      const contentEn = await translateHtml(zai, post.contentFa || '');
      if (!contentEn || contentEn.length < 40) throw new Error(`suspicious translation (${(contentEn || '').length} chars)`);

      const titleEn = (post.titleFa && (await translateText(zai, post.titleFa))) || post.titleFa || '';
      const excerptEn = post.excerptFa ? (await translateText(zai, post.excerptFa)).slice(0, 500) : null;

      await db.post.update({
        where: { id: post.id },
        data: { contentEn, titleEn: titleEn || post.titleFa, excerptEn: excerptEn || null },
      });
      await addPostToKb(post.id);

      progress.done.push(post.id);
      delete progress.failed[post.id];
      console.log(`✓ ${post.slug} | fa:${faLen} → en:${contentEn.length} | ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      progress.failed[post.id] = msg;
      console.error(`✗ ${post.slug} | ${msg}`);
    }
    saveProgress(progress);
    if (!oneOnly) await sleep(8000); // pacing between posts (429-safe)
  }

  console.log(`Batch finished. done=${progress.done.length} failed=${Object.keys(progress.failed).length}`);
}

main()
  .catch((e) => {
    console.error('fatal:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
