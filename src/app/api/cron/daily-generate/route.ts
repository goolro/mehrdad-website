import { NextRequest, NextResponse, after } from 'next/server';
import { dailyGenerateStep } from '@/lib/daily-generator';
import { indexNowKey } from '@/lib/indexnow';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { safeEqual } from '@/lib/admin';
import { processLeadNurture } from '@/lib/lead-nurture';

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
 * Auth mirrors /api/cron/index-ping: Vercel calls with
 * `Authorization: Bearer $CRON_SECRET`; manual runs use ?key=<IndexNow
 * key>; if CRON_SECRET is unset the endpoint stays open but rate-limited
 * (worst abuse = one extra editorial in a sandbox — bounded by the
 * approval-queue cap anyway).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') || '';
    const key = req.nextUrl.searchParams.get('key') || '';
    // timing-safe compares (round-3 follow-up): never hand a remote party a
    // microsecond oracle on the secret bytes. safeEqual() hashes both sides
    // so any length mismatch is safe too; an empty IndexNow key would fail
    // closed (manual ?key= runs just need the real key, which is non-empty
    // by construction).
    const authOk = safeEqual(auth, `Bearer ${secret}`);
    const keyOk = safeEqual(key, indexNowKey());
    if (!authOk && !keyOk) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  } else {
    const rl = rateLimit(`dailygen:${clientIp(req)}`, 4, 60 * 1000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);
  }

  try {
    const result = await dailyGenerateStep();

    // chain: quota not yet filled AND this step actually produced something
    // (a failed step stops the chain — the next morning's cron retries)
    if (!result.done && !result.skipped) {
      const origin = req.nextUrl.origin;
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

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error('daily-generate cron error:', e);
    return NextResponse.json({ ok: false, error: 'daily generation failed' }, { status: 500 });
  }
}
