import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { agencyRosterPayload } from '@/lib/agency/library';

export const dynamic = 'force-dynamic';

/** GET — slim roster (no persona bodies) + divisions + runbooks + stats. */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  return NextResponse.json(agencyRosterPayload());
}
