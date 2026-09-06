import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { clientIp, readJsonBody, jsonBodyError, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Destination inbox for contact-form messages (changeable via env without a redeploy of code).
const CONTACT_TO = (process.env.CONTACT_TO_EMAIL || 'moshtarakinapp@gmail.com').trim();
const SMTP_USER = (process.env.SMTP_USER || '').trim();
const SMTP_PASS = process.env.SMTP_PASS || '';

// Deliver the message straight to the owner's inbox over SMTP (Gmail app
// password or any provider). Kept server-side so credentials and the
// destination address never ship in the client bundle. Best-effort: the DB
// copy (below) is the source of truth; a delivery hiccup must never lose a
// message or fail the user's submission.
async function forwardByEmail(fields: {
  name: string;
  email: string;
  subject: string | null;
  message: string;
}): Promise<boolean> {
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('contact email forward skipped: SMTP_USER/SMTP_PASS not configured');
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 6000,
      socketTimeout: 10000,
    });
    const subject = fields.subject
      ? `mehrdad.ir — ${fields.subject}`
      : 'mehrdad.ir — new contact message';
    await transporter.sendMail({
      from: `"mehrdad.ir contact form" <${SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: fields.email,
      subject,
      text: `Name: ${fields.name}\nEmail: ${fields.email}\nSubject: ${fields.subject || '—'}\n\n${fields.message}`,
      html: [
        '<div style="font:14px/1.6 -apple-system,Segoe UI,Tahoma,sans-serif;color:#222">',
        '<table style="border-collapse:collapse">',
        `<tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td style="padding:4px 0"><b>${esc(fields.name)}</b></td></tr>`,
        `<tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td style="padding:4px 0">${esc(fields.email)}</td></tr>`,
        `<tr><td style="padding:4px 12px 4px 0;color:#666">Subject</td><td style="padding:4px 0">${esc(fields.subject || '—')}</td></tr>`,
        '</table>',
        `<hr style="border:none;border-top:1px solid #eee;margin:12px 0"><p style="white-space:pre-wrap">${esc(fields.message)}</p>`,
        '</div>',
      ].join(''),
    });
    return true;
  } catch (e) {
    console.error('contact email forward failed:', e);
    return false;
  }
}

// minimal HTML escaper for the email template
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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
    const emailed = await forwardByEmail({ name, email, subject, message });
    return NextResponse.json({ ok: true, emailed });
  } catch (e) {
    console.error('contact api error:', e);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
