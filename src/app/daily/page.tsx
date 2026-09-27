import type { Metadata } from 'next';
import { DailyView, type DailyArticleCard } from '@/components/site/DailyView';
import { db } from '@/lib/db';

// Fully static: rendered once per BUILD (same contract as /blog). Content
// updates publish via the VERCEL_DEPLOY_HOOK_URL fired by the admin panel,
// so the article index is rebuilt with fresh content after every publish.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Daily product analysis — short bilingual editorials | Mehrdad',
  description:
    'Original short articles about successful products — what they do, why they win and my expert verdict. English and Persian, fresh most days.',
  alternates: {
    canonical: '/daily',
    languages: { en: '/daily', fa: '/daily?lang=fa', 'x-default': '/daily' },
  },
};

function tagsOf(v: string | null): string[] {
  try {
    const arr = JSON.parse(v || '[]');
    return Array.isArray(arr) ? arr.filter((t) => typeof t === 'string' && t.trim()) : [];
  } catch {
    return [];
  }
}

export default async function DailyPage() {
  // The table exists in every environment that ran `prisma db push`
  // (sandbox/cPanel) or one postgres boot (boot-time IF NOT EXISTS
  // bootstrap in seed-import.ts). EXACTLY on the very first postgres
  // deploy the table can still be missing during this build — degrade to
  // the empty state there instead of failing the whole deploy: the boot
  // bootstrap creates the table, seeds it and fires the deploy hook, so
  // the NEXT build bakes the articles in (self-healing, no manual DB
  // access). On the normal path this stays fail-loud: a DB outage at
  // build time keeps the previous GOOD deployment (eb906e3 policy)
  // because a connection error throws — it does not return "missing".
  let rows: Awaited<ReturnType<typeof db.dailyArticle.findMany>> = [];
  try {
    rows = await db.dailyArticle.findMany({
      where: { published: true },
      orderBy: [{ day: 'desc' }, { createdAt: 'desc' }],
      take: 120,
    });
  } catch (err) {
    const missing = err instanceof Error && /does not exist/i.test(err.message);
    if (!missing) throw err; // real outage → keep the previous deployment
    console.warn('[daily] table missing at build time — empty index until the boot bootstrap');
  }

  const articles: DailyArticleCard[] = rows.map((r) => ({
    slug: r.slug,
    day: r.day,
    titleEn: r.titleEn,
    titleFa: r.titleFa,
    summaryEn: r.summaryEn,
    summaryFa: r.summaryFa,
    tagsEn: tagsOf(r.tagsEn),
    tagsFa: tagsOf(r.tagsFa),
  }));

  return <DailyView articles={articles} />;
}
