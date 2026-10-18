import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DailyView, type DailyArticleCard } from '@/components/site/DailyView';
import { db } from '@/lib/db';
import { dailyVisibleWhere, DAILY_CATEGORIES } from '@/lib/daily';
import { importContentSeed } from '@/lib/seed-import';

// ISR — same contract as /daily: category pages re-render every 15 minutes
// so scheduled articles appear in their lane right after their random slot.
export const revalidate = 900;

type Props = { params: Promise<{ cat: string }> };

export function generateStaticParams() {
  return DAILY_CATEGORIES.map((cat) => ({ cat }));
}

const CAT_RE = /^[a-z]+$/;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // idempotent bootstrap before ANY prerender touches the table (same
  // self-healing contract as /daily and /work)
  await importContentSeed();
  const { cat } = await params;
  if (!(DAILY_CATEGORIES as readonly string[]).includes(cat)) {
    return { title: 'Not found | Mehrdad' };
  }
  const titles: Record<string, string> = {
    product: 'Daily analysis — Products | Mehrdad',
    ai: 'Daily analysis — AI | Mehrdad',
    startup: 'Daily analysis — Startups | Mehrdad',
    linkedin: 'Daily analysis — LinkedIn | Mehrdad',
  };
  const descriptions: Record<string, string> = {
    product:
      'Original short articles about successful products — what they do, why they win and my expert verdict. The products lane of the daily section.',
    ai: 'Original short articles about AI products and releases — what they do, why they matter and my expert verdict. The AI lane of the daily section.',
    startup:
      'Original short articles about startup decisions and models — what works, what fails and my expert verdict. The startups lane of the daily section.',
    linkedin:
      'My daily LinkedIn posts, mirrored here in full — build-in-public notes on shipping products. The LinkedIn lane of the daily section.',
  };
  return {
    title: titles[cat],
    description: descriptions[cat],
    alternates: {
      canonical: `/daily/cat/${cat}`,
      languages: {
        en: `/daily/cat/${cat}`,
        fa: `/daily/cat/${cat}?lang=fa`,
        'x-default': `/daily/cat/${cat}`,
      },
    },
  };
}

export default async function DailyCategoryPage({ params }: Props) {
  const { cat } = await params;
  if (!CAT_RE.test(cat) || !(DAILY_CATEGORIES as readonly string[]).includes(cat)) notFound();

  let rows: Awaited<ReturnType<typeof db.dailyArticle.findMany>> = [];
  try {
    rows = await db.dailyArticle.findMany({
      where: { ...dailyVisibleWhere(), category: cat },
      orderBy: [{ day: 'desc' }, { createdAt: 'desc' }],
      take: 120,
    });
  } catch (err) {
    const missing = err instanceof Error && /does not exist/i.test(err.message);
    if (!missing) throw err; // real outage → keep the previous deployment
    console.warn('[daily/cat] table missing at build time — empty lane until the boot bootstrap');
  }

  const articles: DailyArticleCard[] = rows.map((r) => ({
    slug: r.slug,
    day: r.day,
    category: r.category,
    titleEn: r.titleEn,
    titleFa: r.titleFa,
    summaryEn: r.summaryEn,
    summaryFa: r.summaryFa,
    tagsEn: tagsOf(r.tagsEn),
    tagsFa: tagsOf(r.tagsFa),
  }));

  return <DailyView articles={articles} category={cat} />;
}

function tagsOf(v: string | null): string[] {
  try {
    const arr = JSON.parse(v || '[]');
    return Array.isArray(arr) ? arr.filter((t) => typeof t === 'string' && t.trim()) : [];
  } catch {
    return [];
  }
}
