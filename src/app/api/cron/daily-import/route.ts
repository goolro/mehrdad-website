import { NextRequest, NextResponse } from 'next/server';
import { importDailyFromFeed } from '@/lib/daily-digest';
import { notifyIndexNow } from '@/lib/indexnow';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Daily Product Hunt import — the automation behind «هر روز منتشر کنیم».
 *
 * Schedule: vercel.json crons → 06:30 UTC ≈ 10:00 Tehran (the daily
 * launches have settled, the Iranian audience is having its morning
 * coffee). Fetches the public PH feed, stores every new launch as a
 * one-line bilingual card and pings /daily for indexing.
 *
 * Auth: same contract as /api/cron/index-ping — Vercel calls with
 * `Authorization: Bearer $CRON_SECRET` when configured; without the
 * secret the endpoint stays open but rate-limited (worst abuse = a
 * harmless duplicate-checked feed import).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  } else {
    const rl = rateLimit(`cron-daily:${clientIp(req)}`, 4, 60 * 60 * 1000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);
  }

  try {
    const summary = await importDailyFromFeed(8);
    if (summary.created.length > 0) {
      const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
      notifyIndexNow([`${BASE}/daily`]);
    }
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    console.error('daily-import cron error:', e);
    return NextResponse.json({ ok: false, error: 'daily import failed' }, { status: 500 });
  }
}
