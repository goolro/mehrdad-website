import { NextRequest, NextResponse } from 'next/server';
import { processLeadNurture } from '@/lib/lead-nurture';
import { indexNowKey } from '@/lib/indexnow';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { safeEqual } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * D-058 — manual/standalone nurture runner. The DAILY trigger is the
 * existing morning cron: Vercel's Hobby plan caps cron jobs at 2 (both
 * slots are taken in vercel.json), so /api/cron/daily-generate piggybacks
 * processLeadNurture() after its own step and this endpoint is NOT
 * registered there. It exists so the owner (or a future plan upgrade)
 * can run the same idempotent state machine on demand.
 *
 * Auth mirrors /api/cron/daily-generate exactly: Vercel-style
 * `Authorization: Bearer $CRON_SECRET`, manual runs use ?key=<IndexNow
 * key>; if CRON_SECRET is unset the endpoint stays open but rate-limited
 * (bounded abuse: the state machine sends at most one welcome + one
 * follow-up per lead, ever).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') || '';
    const key = req.nextUrl.searchParams.get('key') || '';
    const authOk = safeEqual(auth, `Bearer ${secret}`);
    const keyOk = safeEqual(key, indexNowKey());
    if (!authOk && !keyOk) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  } else {
    const rl = rateLimit(`nurture:${clientIp(req)}`, 4, 60 * 1000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);
  }

  try {
    const run = await processLeadNurture();
    return NextResponse.json({ ok: true, ...run });
  } catch (e) {
    console.error('leads-nurture cron error:', e);
    return NextResponse.json({ ok: false, error: 'nurture failed' }, { status: 500 });
  }
}
