import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Admin access to visitor↔AI conversations.
 *
 * GET            → list with filters (?filter=all|lead|contact|unread&q=text)
 * GET ?id=<sid>  → one session with its full message thread
 * PATCH          → { id, read } / { id, lead } flags
 * DELETE ?id=    → remove a conversation (messages cascade)
 *
 * Anonymous sessions are auto-purged by the chat route's retention job;
 * sessions with contact info or lead=true are business records and survive,
 * so this panel is where the owner finds people worth replying to.
 */

const LIST_TAKE = 60;

export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const sp = req.nextUrl.searchParams;
  const id = sp.get('id');

  // single conversation detail (full thread)
  if (id) {
    const session = await db.chatSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ session });
  }

  const filter = sp.get('filter') || 'all';
  const q = (sp.get('q') || '').trim().slice(0, 120);

  const where: Prisma.ChatSessionWhereInput = {};
  if (filter === 'lead') where.lead = true;
  if (filter === 'contact') where.OR = [{ contactName: { not: null } }, { contactEmail: { not: null } }, { contactPhone: { not: null } }];
  if (filter === 'unread') where.read = false;
  if (q) {
    where.AND = [
      {
        OR: [
          { contactName: { contains: q } },
          { contactEmail: { contains: q } },
          { contactPhone: { contains: q } },
          { contactNote: { contains: q } },
          { messages: { some: { content: { contains: q } } } },
        ],
      },
    ];
  }

  const sessions = await db.chatSession.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: LIST_TAKE,
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

  const list = sessions.map((s) => {
    const firstUser = s.messages.find((m) => m.role === 'user');
    const last = s.messages[s.messages.length - 1];
    return {
      id: s.id,
      createdAt: s.createdAt,
      read: s.read,
      lead: s.lead,
      contactName: s.contactName,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      contactNote: s.contactNote,
      messageCount: s.messages.length,
      firstUserMessage: firstUser ? firstUser.content.slice(0, 220) : null,
      lastMessage: last ? { role: last.role, content: last.content.slice(0, 220), createdAt: last.createdAt } : null,
    };
  });

  return NextResponse.json({ sessions: list });
}

export async function PATCH(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const data: { read?: boolean; lead?: boolean } = {};
  if (typeof body?.read === 'boolean') data.read = body.read;
  if (typeof body?.lead === 'boolean') data.lead = body.lead;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  try {
    await db.chatSession.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await db.chatSession.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
