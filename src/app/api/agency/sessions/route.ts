import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { listAgencySessions } from '@/lib/agency/store';

export const dynamic = 'force-dynamic';

/** GET — session list (title, kind, counts, preview) for the history tab. */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const sessions = await listAgencySessions(200);
  return NextResponse.json({ sessions });
}
