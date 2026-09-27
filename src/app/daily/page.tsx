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
  // The table exists in every environment that ran `prisma db push`
  // (sandbox/cPanel) or one postgres boot (boot-time IF NOT EXISTS
  // bootstrap in seed-import.ts). EXACTLY on the very first postgres
  // deploy the table can still be missing during this build — degrade to
  // the empty state there instead of failing the whole deploy: the boot
  // bootstrap creates the table, seeds it and fires the deploy hook, so
  // the NEXT build bakes the digest in (self-healing, no manual DB access).
  // On the normal path this stays fail-loud: a DB outage at build time
  // keeps the previous GOOD deployment (eb906e3 policy) because a Turso
  // outage throws (connection error), it does not return "table missing".
  let items: Awaited<ReturnType<typeof db.dailyProduct.findMany>> = [];
  try {
    items = await db.dailyProduct.findMany({
      orderBy: [{ day: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
      take: 120,
    });
  } catch (err) {
    const missing = err instanceof Error && /does not exist/i.test(err.message);
    if (!missing) throw err; // real outage → keep the previous deployment
    console.warn('[daily] table missing at build time — empty digest until the boot bootstrap');
  }

  // group by digest day, newest day first
  const groups: { day: string; items: typeof items }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.day === item.day) last.items.push(item);
    else groups.push({ day: item.day, items: [item] });
  }

  return <DailyView groups={groups} />;
}
