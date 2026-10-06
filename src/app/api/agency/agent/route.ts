import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { agencyAgentById, agencyDivisionLabel } from '@/lib/agency/library';

export const dynamic = 'force-dynamic';

/** GET ?id= — one agent WITH its full persona body (detail view / prompt copy). */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get('id')?.trim() ?? '';
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const agent = agencyAgentById(id);
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  return NextResponse.json({ ...agent, divisionLabel: agencyDivisionLabel(agent.division) });
}
