import type { Metadata } from 'next';
import { DailyView } from '@/components/site/DailyView';
import { db } from '@/lib/db';

// Fully static: rendered once per BUILD (same contract as /blog). Content
// updates publish via the VERCEL_DEPLOY_HOOK_URL fired by the admin import
// button and by the daily cron (VERCEL cron → import → deploy hook on
// change), so the digest page is rebuilt with fresh items every day.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Product Hunt Daily — one line a day | Mehrdad',
  description:
    'Successful Product Hunt launches distilled to a single line — English and Persian, every day. A short cut to what is shipping now.',
  alternates: {
    canonical: '/daily',
    languages: { en: '/daily', fa: '/daily?lang=fa', 'x-default': '/daily' },
  },
};

export default async function DailyPage() {
  // fail-loud (build keeps the previous GOOD deployment on a DB outage —
  // eb906e3 policy): never bake an empty digest silently
  const items = await db.dailyProduct.findMany({
    orderBy: [{ day: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
    take: 120,
  });

  // group by digest day, newest day first
  const groups: { day: string; items: typeof items }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.day === item.day) last.items.push(item);
    else groups.push({ day: item.day, items: [item] });
  }

  return <DailyView groups={groups} />;
}
