import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin, originAllowed } from '@/lib/admin';
import { readJsonBody } from '@/lib/rate-limit';
import {
  deleteAgencySession,
  getAgencySession,
  listAgencyMessages,
  renameAgencySession,
} from '@/lib/agency/store';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** GET — full thread of one session (messages include per-agent attribution). */
export async function GET(req: NextRequest, ctx: Ctx) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  const session = await getAgencySession(id);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const messages = await listAgencyMessages(id);
  let meta: unknown = null;
  if (session.meta) {
    try {
      meta = JSON.parse(session.meta);
    } catch {
      meta = null;
    }
  }
  return NextResponse.json({ session: { ...session, meta }, messages });
}

/** PATCH — rename a session. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  if (!originAllowed(req)) {
    return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const parsed = await readJsonBody(req, 4);
  if (!parsed.ok || typeof parsed.data?.title !== 'string' || !parsed.data.title.trim()) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
  }
  const session = await getAgencySession(id);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  await renameAgencySession(id, parsed.data.title.trim().slice(0, 120));
  return NextResponse.json({ ok: true });
}

/** DELETE — remove a session and its messages. */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  if (!originAllowed(req)) {
    return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const session = await getAgencySession(id);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  await deleteAgencySession(id);
  return NextResponse.json({ ok: true });
}
