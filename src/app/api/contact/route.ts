import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim().slice(0, 120);
    const email = (body.email || '').trim().slice(0, 200);
    const subject = (body.subject || '').trim().slice(0, 200) || null;
    const message = (body.message || '').trim().slice(0, 5000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await db.contactMessage.create({ data: { name, email, subject, body: message } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('contact api error:', e);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
