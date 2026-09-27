import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { importDailyFromFeed, translateTaglineFa } from '@/lib/daily-digest';
import { db } from '@/lib/db';
import { notifyIndexNow } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

/**
 * Manual "Import from Product Hunt" — same routine as the daily cron:
 * fetch the feed, store what is new, translate each line to Persian.
 * mode=translate re-runs ONLY the translator on items that still miss
 * their Persian one-liner (e.g. a first import that ran without a
 * working AI provider).
 */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === 'translate' ? 'translate' : 'import';
    const limit = Math.min(20, Math.max(1, Number(body?.limit) || 8));

    if (mode === 'translate') {
      const pending = await db.dailyProduct.findMany({
        where: { taglineFa: null },
        take: 25,
      });
      let translated = 0;
      let failed = 0;
      for (const item of pending) {
        try {
          const fa = await translateTaglineFa(item.taglineEn);
          await db.dailyProduct.update({ where: { id: item.id }, data: { taglineFa: fa } });
          translated += 1;
        } catch {
          failed += 1;
        }
      }
      if (translated > 0 && process.env.VERCEL_DEPLOY_HOOK_URL) {
        await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
      }
      return NextResponse.json({ ok: true, mode, translated, failed });
    }

    const summary = await importDailyFromFeed(limit);
    if (summary.created.length > 0) {
      if (process.env.VERCEL_DEPLOY_HOOK_URL) {
        await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
      }
      notifyIndexNow([`${BASE}/daily`]);
    }
    return NextResponse.json({ ok: true, mode, ...summary });
  } catch (e) {
    console.error('admin daily import error:', e);
    return NextResponse.json({ ok: false, error: 'Import failed — Product Hunt feed unreachable' }, { status: 502 });
  }
}
