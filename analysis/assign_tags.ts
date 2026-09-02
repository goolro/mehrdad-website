/**
 * Task 15 — curated topic tags (D-020):
 *  1. seeds the fixed 32-tag taxonomy from analysis/curated_tags.json
 *  2. assigns up to 4 tags per published post via one LLM call each
 *     (choice is CONSTRAINED to the taxonomy — no free-form tags)
 *  - resumable via analysis/assign_tags_progress.json; --budget <sec>; --one
 * Run: bun analysis/assign_tags.ts --budget 500
 */
import { PrismaClient } from '@prisma/client';
import ZAI from 'z-ai-web-dev-sdk';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const db = new PrismaClient();
const PROGRESS_FILE = 'analysis/assign_tags_progress.json';
const TAXONOMY_FILE = 'analysis/curated_tags.json';

interface Progress { done: string[]; failed: Record<string, string>; }
function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    try {
      const p = JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')) as Progress;
      for (const [id, err] of Object.entries(p.failed)) if (err.includes('429')) delete p.failed[id];
      return p;
    } catch {}
  }
  return { done: [], failed: {} };
}
const saveProgress = (p: Progress) => writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function llm(zai: Awaited<ReturnType<typeof ZAI.create>>, sys: string, user: string): Promise<string> {
  const waits = [30_000, 60_000, 120_000];
  for (let a = 0; ; a++) {
    try {
      const c = await zai.chat.completions.create({
        messages: [{ role: 'assistant', content: sys }, { role: 'user', content: user }],
        thinking: { type: 'disabled' },
      });
      return (c.choices[0]?.message?.content || '').replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('429') && a < waits.length) {
        console.log(`  ⏳ 429 — ${waits[a] / 1000}s`);
        await sleep(waits[a]);
        continue;
      }
      throw e;
    }
  }
}

async function main() {
  const oneOnly = process.argv.includes('--one');
  const bIdx = process.argv.indexOf('--budget');
  const budget = bIdx > -1 ? parseInt(process.argv[bIdx + 1], 10) || 0 : 0;
  const t0 = Date.now();

  // 1. seed taxonomy (idempotent upsert)
  const taxonomy: { slug: string; nameEn: string; nameFa: string }[] = JSON.parse(readFileSync(TAXONOMY_FILE, 'utf8'));
  for (const tag of taxonomy) {
    await db.tag.upsert({ where: { slug: tag.slug }, update: { nameEn: tag.nameEn, nameFa: tag.nameFa }, create: tag });
  }
  console.log(`taxonomy seeded: ${taxonomy.length} tags`);

  // 2. posts to tag
  const posts = await db.post.findMany({
    where: { published: true },
    select: {
      id: true, slug: true, titleEn: true, titleFa: true, excerptEn: true, excerptFa: true,
      tags: { select: { tagId: true } },
      categories: { select: { nameEn: true } },
    },
    orderBy: { date: 'asc' },
  });
  const tagIds = new Map((await db.tag.findMany()).map((t) => [t.slug, t.id]));
  const validSlugs = new Set(taxonomy.map((t) => t.slug));

  const progress = loadProgress();
  const pending = posts.filter((p) => !progress.done.includes(p.id) && p.tags.length === 0);
  console.log(`posts: ${posts.length} | already tagged: ${posts.length - pending.length} | pending: ${pending.length}`);

  if (!pending.length || oneOnly && progress.done.length) {
    if (!pending.length) console.log('All posts tagged.');
  }
  if (!pending.length) return;

  const zai = await ZAI.create();
  const SYS = `You tag articles for a product-builder blog. Given a title, excerpt and categories, pick the 1-4 BEST matching topic tags from this FIXED list:\n${taxonomy.map((t) => t.slug).join(', ')}\nRules: only slugs from the list; 1-4 tags; prefer specific over generic. Return ONLY a JSON array of slug strings, e.g. ["smart-city","startup"] — no fences.`;

  for (const post of oneOnly ? [pending[0]] : pending) {
    if (budget && Date.now() - t0 > budget * 1000) {
      console.log(`⏱ budget reached — done=${progress.done.length}`);
      break;
    }
    try {
      const user = [
        `Title: ${post.titleEn || post.titleFa || ''}`,
        post.titleFa ? `عنوان: ${post.titleFa}` : '',
        `Excerpt: ${(post.excerptEn || post.excerptFa || '').slice(0, 300)}`,
        `Categories: ${post.categories.map((c) => c.nameEn).join(', ')}`,
      ].filter(Boolean).join('\n');

      const raw = await llm(zai, SYS, user);
      const picked: string[] = JSON.parse(raw).filter((s: string) => validSlugs.has(s)).slice(0, 4);

      if (!picked.length) throw new Error(`no valid tags in: ${raw.slice(0, 80)}`);
      await db.postTag.createMany({
        data: picked.map((slug) => ({ postId: post.id, tagId: tagIds.get(slug)! })),
        skipDuplicates: true,
      });
      progress.done.push(post.id);
      delete progress.failed[post.id];
      console.log(`✓ ${post.slug.slice(0, 44)} → ${picked.join(', ')}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      progress.failed[post.id] = msg;
      console.error(`✗ ${post.slug.slice(0, 44)} | ${msg.slice(0, 90)}`);
    }
    saveProgress(progress);
    await sleep(4000);
  }
  console.log(`finished. tagged=${progress.done.length} failed=${Object.keys(progress.failed).length}`);
}

main()
  .catch((e) => { console.error('fatal:', e); process.exit(1); })
  .finally(() => db.$disconnect());
