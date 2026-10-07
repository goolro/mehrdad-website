import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { ensureStudioSeed, listStudioSamples } from '@/lib/agency/content';

export const dynamic = 'force-dynamic';

/**
 * GET — the Content Studio root payload: all 10 reference samples with their
 * ideas and videos. Seeds the studio on first load (idempotent).
 */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  try {
    await ensureStudioSeed();
  } catch (e) {
    return NextResponse.json(
      { error: `خطا در راه‌اندازی اولیه: ${String((e as Error).message ?? e).slice(0, 160)}` },
      { status: 500 }
    );
  }

  const samples = await listStudioSamples();
  return NextResponse.json({ samples });
}
