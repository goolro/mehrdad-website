import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clientIp, readJsonBody, jsonBodyError, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Visitor asks for a personal follow-up on an ongoing AI chat.
 *
 * Attaches contact details to the ChatSession and flags it as a "lead" so it
 * shows up (unread) in the admin Conversations tab and is excluded from
 * automatic retention purges. Email OR phone is required so the owner can
 * actually reach the person; the session must already exist (i.e. the
 * visitor has chatted at least once).
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`chatlead:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const parsed = await readJsonBody(req, 8);
  if (!parsed.ok) return jsonBodyError(parsed.error);

  try {
    const body = parsed.data || {};
    const sessionId = String(body.sessionId ?? '').trim().slice(0, 64);
    const name = String(body.name ?? '').trim().slice(0, 120);
    const email = String(body.email ?? '').trim().slice(0, 200);
    const phone = String(body.phone ?? '').trim().slice(0, 40);
    const note = String(body.note ?? '').trim().slice(0, 1000);

    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone required' },
        { status: 400 }
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const session = await db.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await db.chatSession.update({
      where: { id: sessionId },
      data: {
        contactName: name,
        contactEmail: email || null,
        contactPhone: phone || null,
        contactNote: note || null,
        lead: true,
        read: false, // surface as unread in the admin panel
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('chat contact api error:', e);
    return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
  }
}
