import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { listStudioSamplesSafe } from '@/lib/agency/content';

export const dynamic = 'force-dynamic';
// cold-start first call may create tables + seed 36 rows over remote Turso;
// Vercel's default 10s function timeout killed it mid-seed (2026-10-08
// incident: empty studio). 60s = Hobby-plan maximum, matches /api/agency/run.
export const maxDuration = 60;

/**
 * GET — the Content Studio root payload: all 10 reference samples with their
 * ideas and videos. Seeds the studio on first load (idempotent).
 *
 * NEVER returns an empty studio: if the database is degraded, the committed
 * sample constants are returned with a `warning` that the UI shows as a
 * persistent banner (an empty panel looked like «the feature does not exist»
 * to the owner — that must be impossible).
 */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const payload = await listStudioSamplesSafe();
  return NextResponse.json(payload);
}
