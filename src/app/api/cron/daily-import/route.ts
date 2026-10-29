import { NextRequest, NextResponse } from 'next/server';
import { importDailyFromFeed } from '@/lib/daily-digest';
import { notifyIndexNow } from '@/lib/indexnow';
import { safeEqual } from '@/lib/admin';

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
 * Auth (phase-1 security fix): ONLY `Authorization: Bearer $CRON_SECRET` —
 * Vercel cron sends it automatically once the env var exists. The old
 * open-but-rate-limited mode (no secret configured) is GONE: without the
 * secret this endpoint refuses to run (fail-closed, 503) — a feed import
 * that also fires IndexNow pings and deploy hooks is not something the
 * internet should be able to trigger anonymously.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('cron auth misconfigured: CRON_SECRET is not set — refusing to run (fail-closed)');
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured — set it in the hosting environment' },
      { status: 503 },
    );
  }
  // timing-safe compare — same contract as the other cron routes (the old
  // `!==` string compare was a microsecond oracle on the secret bytes)
  if (!safeEqual(req.headers.get('authorization') || '', `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const summary = await importDailyFromFeed(8);
    if (summary.created.length > 0) {
      const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
      notifyIndexNow([`${BASE}/daily`]);
      // /daily is a build-time static page — rebuild it so today's import
      // is actually visible (same publish path as every content mutation)
      if (process.env.VERCEL_DEPLOY_HOOK_URL) {
        await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
      }
    }
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    console.error('daily-import cron error:', e);
    return NextResponse.json({ ok: false, error: 'daily import failed' }, { status: 500 });
  }
}
