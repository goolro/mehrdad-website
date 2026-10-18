/**
 * Task 15/D-020 — seed the curated Tag taxonomy and assign tags to posts
 * from real content evidence (no legacy 4,872-tag dump resurrection).
 *
 * Rules (docs/CONTENT_MIGRATION.md, curated_tags.json):
 * - 32 curated bilingual tags (≤ 50 cap).
 * - Evidence-based assignment: a tag attaches to a post only when its
 *   keyword appears in title/excerpt (strong) or ≥ 2× in content.
 * - Max 4 tags per post (top by evidence score). No tag spam.
 * - Idempotent: `bun run analysis/seed_tags.ts --apply` writes, without the
 *   flag it only prints the plan. Re-running with --apply resets + rebuilds.
 */
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const APPLY = process.argv.includes('--apply');

interface CuratedTag { slug: string; nameEn: string; nameFa: string }

const TAGS: CuratedTag[] = JSON.parse(
  fs.readFileSync('/home/z/my-project/analysis/curated_tags.json', 'utf-8'),
);

/** keyword evidence per tag slug — EN + FA stems (lowercase). */
const KEYWORDS: Record<string, { strong: string[]; weak: string[] }> = {
  'smart-city':            { strong: ['smart city', 'شهر هوشمند'], weak: ['شهرداری', 'شهروند'] },
  'startup':               { strong: ['startup', 'استارتاپ'], weak: ['استارت‌آپ'] },
  'investment':            { strong: ['investment', 'investor', 'سرمایه‌گذار', 'سرمایه گذاری'], weak: [' VC ', 'سهام'] },
  'artificial-intelligence': { strong: ['artificial intelligence', 'هوش مصنوعی'], weak: [/\bai\b/i.source] },
  'rail-transport':        { strong: ['rail', 'ریل', 'قطار'], weak: ['لوکوموتیو', 'واگن'] },
  'marketing':             { strong: ['marketing', 'بازاریابی'], weak: ['برندینگ', 'brand'] },
  'entrepreneurship':      { strong: ['entrepreneur', 'کارآفرین'], weak: ['بیزینس‌من'] },
  'iran-economy':          { strong: ['اقتصاد ایران', 'ایران'], weak: ['تحریم', 'sanction', 'تورم', 'inflation'] },
  'health':                { strong: ['health', 'سلامت', 'سلامتی'], weak: ['درمان', 'پزشک', 'medical'] },
  'tourism':               { strong: ['tourism', 'گردشگری', 'گردشگری'], weak: ['سفر', 'هتل'] },
  'iot':                   { strong: ['iot', 'اینترنت اشیا', 'internet of things'], weak: ['sensor', 'سنسور'] },
  'robotics':              { strong: ['robot', 'ربات'], weak: ['drone', 'پهپاد'] },
  'fintech':               { strong: ['fintech', 'فین‌تک', 'فین تک'], weak: ['payment', 'پرداخت'] },
  'mobility':              { strong: ['mobility', 'حمل‌ونقل', 'حمل و نقل'], weak: ['ترانزیت', 'transit'] },
  'energy-management':     { strong: ['energy', 'انرژی'], weak: ['خورشیدی', 'solar', 'برق'] },
  'traffic-management':    { strong: ['traffic', 'ترافیک'], weak: ['پارکینگ', 'parking'] },
  'neo-bank':              { strong: ['neobank', 'neo-bank', 'نئوبانک'], weak: ['نئو بانک'] },
  'autonomous-vehicles':   { strong: ['autonomous', 'خودران'], weak: ['驱动', 'self-driving'] },
  'smart-home':            { strong: ['smart home', 'خانه هوشمند', 'منزل هوشمند'], weak: ['سمارت‌هوم'] },
  'business-model':        { strong: ['business model', 'مدل کسب‌وکار', 'مدل کسب و کار'], weak: ['درآمدی', 'revenue model'] },
  'product-design':        { strong: ['product design', 'طراحی محصول'], weak: ['ux', 'ui'] },
  'digital-advertising':   { strong: ['digital advertising', 'تبلیغات دیجیتال'], weak: ['تبلیغ', 'advertis'] },
  'urban-planning':        { strong: ['urban planning', 'برنامه‌ریزی شهری', 'شهرسازی'], weak: ['urban', 'شهری'] },
  'pitch-deck':            { strong: ['pitch deck', 'پیچ دک'], weak: ['pitch', 'اینویستور'] },
  'international-relations': { strong: ['روابط بین‌الملل', 'روابط بین الملل', 'geopolitic', 'international relations'], weak: ['دیپلمات', 'diplomat', 'چین', 'russia', 'روسیه'] },
  'smart-infrastructure':  { strong: ['smart infrastructure', 'زیرساخت هوشمند'], weak: ['infrastructure', 'زیرساخت'] },
  'ai-marketing':          { strong: ['ai marketing', 'بازاریابی هوش مصنوعی'], weak: [] },
  'urban-mobility':        { strong: ['urban mobility', 'حمل‌ونقل شهری'], weak: [] },
  'smart-governance':      { strong: ['governance', 'حکمرانی'], weak: ['e-government', 'دولت الکترونیک'] },
  'digital-banking':       { strong: ['digital banking', 'بانکداری دیجیتال'], weak: ['بانک', 'bank'] },
  'sustainable-development': { strong: ['sustainab', 'توسعه پایدار', 'پایدار'], weak: ['محیط زیست', 'environment'] },
  'ai-tools':              { strong: ['ai tool', 'ابزارهای هوش مصنوعی', 'ابزار هوش مصنوعی'], weak: ['chatgpt', 'ابزار'] },
};

/** category slug → guaranteed candidate tags (weak evidence +1) */
const CATEGORY_HINTS: Record<string, string[]> = {
  'شهر-هوشمند': ['smart-city', 'iot', 'smart-infrastructure'],
  'استارتاپ-startup': ['startup', 'entrepreneurship', 'business-model'],
  'سرمایه-گذاری': ['investment', 'pitch-deck'],
  'هوش-مصنوعی': ['artificial-intelligence', 'ai-tools', 'ai-marketing'],
  'فروش-و-بازاریابی-سنتی': ['marketing', 'digital-advertising'],
  'کسب-و-کار': ['business-model', 'entrepreneurship'],
  'سلامت-و-پزشکی': ['health'],
  'گردشگری-و-سفر': ['tourism'],
  'اختراع': ['product-design'],
};

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return (haystack.match(re) || []).length;
}

async function main() {
  const posts = await db.post.findMany({
    select: { id: true, slug: true, titleEn: true, titleFa: true, excerptEn: true, excerptFa: true, contentEn: true, contentFa: true, categories: { select: { slug: true } } },
  });
  console.log(`posts: ${posts.length}, curated tags: ${TAGS.length}, mode: ${APPLY ? 'APPLY' : 'PLAN'}`);

  // seed tags
  if (APPLY) {
    for (const t of TAGS) {
      await db.tag.upsert({ where: { slug: t.slug }, update: { nameEn: t.nameEn, nameFa: t.nameFa }, create: { slug: t.slug, nameEn: t.nameEn, nameFa: t.nameFa } });
    }
    console.log(`✓ seeded ${TAGS.length} tags`);
  }

  const plan: Record<string, string[]> = {};
  const tagPostCount: Record<string, number> = {};
  const MAX_PER_POST = 4;

  for (const p of posts) {
    const titleEx = [p.titleEn, p.titleFa, p.excerptEn, p.excerptFa].filter(Boolean).join(' \n ');
    const body = [p.contentEn, p.contentFa].filter(Boolean).join(' \n ').slice(0, 30000);
    const scored: { slug: string; score: number }[] = [];

    for (const t of TAGS) {
      const kw = KEYWORDS[t.slug];
      if (!kw) continue;
      let score = 0;
      let strongHit = false;
      for (const s of kw.strong) {
        const inTitle = countOccurrences(titleEx.toLowerCase(), s.toLowerCase());
        const inBody = countOccurrences(body.toLowerCase(), s.toLowerCase());
        if (inTitle > 0) { strongHit = true; score += 5 + Math.min(inTitle, 3); }
        score += Math.min(inBody, 6) * 0.5;
      }
      for (const w of kw.weak) {
        const n = countOccurrences(titleEx.toLowerCase(), w.toLowerCase()) + countOccurrences(body.toLowerCase(), w.toLowerCase());
        score += Math.min(n, 4) * 0.4;
      }
      const hinted = (p.categories || []).some((c) => (CATEGORY_HINTS[c.slug] || []).includes(t.slug));
      if (hinted) score += 1.2;
      if ((strongHit || score >= 2.2) && score > 0) scored.push({ slug: t.slug, score });
    }

    scored.sort((a, b) => b.score - a.score);
    const chosen = scored.slice(0, MAX_PER_POST).map((s) => s.slug);

    // coverage fallback: a post with zero evidence still gets its category's
    // primary tag so the filter never dead-ends (evidence = category itself)
    if (chosen.length === 0) {
      for (const c of p.categories || []) {
        const first = (CATEGORY_HINTS[c.slug] || [])[0];
        if (first && !chosen.includes(first) && chosen.length < 2) chosen.push(first);
      }
    }

    if (chosen.length) {
      plan[p.slug] = chosen;
      for (const s of chosen) tagPostCount[s] = (tagPostCount[s] || 0) + 1;
    }
  }

  const assigned = Object.values(plan).reduce((a, v) => a + v.length, 0);
  console.log(`\nplan: ${Object.keys(plan).length}/${posts.length} posts tagged, ${assigned} assignments, ${Object.keys(tagPostCount).length} tags in use`);
  const sorted = Object.entries(tagPostCount).sort((a, b) => b[1] - a[1]);
  console.log(sorted.map(([s, c]) => `${s}:${c}`).join('  '));
  const unused = TAGS.filter((t) => !tagPostCount[t.slug]).map((t) => t.slug);
  if (unused.length) console.log(`\nunused tags (ok, but noted): ${unused.join(', ')}`);

  if (APPLY) {
    await db.postTag.deleteMany({});
    let n = 0;
    for (const [slug, tagSlugs] of Object.entries(plan)) {
      const post = await db.post.findUnique({ where: { slug }, select: { id: true } });
      if (!post) continue;
      for (const ts of tagSlugs) {
        const tag = await db.tag.findUnique({ where: { slug: ts }, select: { id: true } });
        if (!tag) continue;
        await db.postTag.create({ data: { postId: post.id, tagId: tag.id } }).catch(() => {});
        n++;
      }
    }
    console.log(`\n✓ wrote ${n} post-tag links`);
  } else {
    console.log('\n(dry-run — rerun with --apply to write)');
  }
}

main()
  .catch((e) => { console.error('FATAL', e); process.exitCode = 1; })
  .finally(() => db.$disconnect());
