import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clientIp, readJsonBody, jsonBodyError, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // spam guard: 3 submissions per IP per 10 minutes
  const rl = rateLimit(`contact:${clientIp(req)}`, 3, 10 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  // memory guard on the shared host: real submissions are ≤ ~5.5 KB.
  // readJsonBody enforces the cap while streaming, so a chunked body with no
  // Content-Length cannot bypass it — round-3 finding M3.
  const parsed = await readJsonBody(req);
  if (!parsed.ok) return jsonBodyError(parsed.error);

  try {
    const body = parsed.data || {};
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
