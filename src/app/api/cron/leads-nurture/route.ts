import { NextRequest, NextResponse } from 'next/server';
import { processLeadNurture } from '@/lib/lead-nurture';
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
 * Auth (phase-1 security fix): ONLY `Authorization: Bearer $CRON_SECRET` —
 * Vercel cron sends it automatically once the env var exists. The old
 * manual `?key=<IndexNow key>` fallback is GONE: that key is PUBLIC by
 * protocol (served at /<key>.txt), so accepting it let anyone on the
 * internet trigger real emails to real leads. No secret configured → the
 * route FAILS CLOSED with an actionable 503 instead of staying open.
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
  // timing-safe compare — same contract as /api/cron/daily-generate
  if (!safeEqual(req.headers.get('authorization') || '', `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const run = await processLeadNurture();
    return NextResponse.json({ ok: true, ...run });
  } catch (e) {
    console.error('leads-nurture cron error:', e);
    return NextResponse.json({ ok: false, error: 'nurture failed' }, { status: 500 });
  }
}
