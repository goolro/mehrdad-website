import { NextRequest, NextResponse, after } from 'next/server';
import { dailyGenerateStep } from '@/lib/daily-generator';
import { safeEqual } from '@/lib/admin';
import { processLeadNurture } from '@/lib/lead-nurture';
import { autoPublishInstagramToday } from '@/lib/instagram-publish';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * The morning generator (owner flow 2026-09-30: «یعنی روزانه یه سری مطلب
 * ساخته بشه… بعد من تایید کنم»). Vercel cron hits this once a day
 * (vercel.json, 02:00 UTC = 05:30 Tehran) and the route produces ONE
 * bilingual editorial for the approval queue, then chains ITSELF via
 * `after()` until the day's random quota (2..5) is filled — each
 * invocation carries a single AI call inside its own time budget.
 *
 * Everything it builds lands with `published: false` — nothing goes live
 * until the owner presses Approve in the Daily Articles studio.
 *
 * Auth (phase-1 security fix): ONLY `Authorization: Bearer $CRON_SECRET` —
 * Vercel cron sends it automatically once the env var exists. The old
 * manual `?key=<IndexNow key>` fallback is GONE: that key is PUBLIC by
 * protocol (served at /<key>.txt), so accepting it let anyone on the
 * internet trigger paid AI generation. No secret configured → the route
 * FAILS CLOSED with an actionable 503 instead of staying open.
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
  // timing-safe compare: never hand a remote party a microsecond oracle on
  // the secret bytes. safeEqual() hashes both sides so any length mismatch
  // is safe too.
  if (!safeEqual(req.headers.get('authorization') || '', `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await dailyGenerateStep();

    // chain: quota not yet filled AND this step actually produced something
    // (a failed step stops the chain — the next morning's cron retries).
    // The chain URL anchors to SITE_ORIGIN when configured: a Host-header
    // controlled request must never receive the bearer secret (phase-1).
    if (!result.done && !result.skipped) {
      const origin = (process.env.SITE_ORIGIN || req.nextUrl.origin).replace(/\/+$/, '');
      const headers: Record<string, string> = {};
      if (secret) headers.authorization = `Bearer ${secret}`;
      after(() => {
        fetch(`${origin}/api/cron/daily-generate`, { headers, cache: 'no-store' }).catch(() => {});
      });
    }

    // D-058 piggyback: the morning cron is the only registered schedule
    // (Vercel Hobby caps cron jobs at 2, both slots taken) — so the lead
    // nurture state machine rides along AFTER the response. Idempotent;
    // failures must never touch the generator itself.
    after(() => {
      processLeadNurture().catch((e) => console.error('lead nurture (piggyback) failed:', e));
    });
    // D-059 piggyback: one queued Instagram draft per day via Composio
    // (owner's 14-day @startup_mt campaign) — env-gated no-op until the
    // Composio credentials exist; a day-guard keeps chain calls from
    // burning the queue in one morning
    after(() => {
      autoPublishInstagramToday()
        .then((r) => {
          if (r.published) console.log('instagram autopublish:', r.detail);
        })
        .catch((e) => console.error('instagram autopublish (piggyback) failed:', e));
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error('daily-generate cron error:', e);
    return NextResponse.json({ ok: false, error: 'daily generation failed' }, { status: 500 });
  }
}
