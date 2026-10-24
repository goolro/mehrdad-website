import { NextRequest, NextResponse, after } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { clientIp, readJsonBody, jsonBodyError, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { trackServerEvent } from '@/lib/server-analytics';

export const dynamic = 'force-dynamic';

// D-052 (growth-agent P1, 2026-10-24): lightweight lead capture for the
// article CTA — a reader who is NOT ready to click /mvp-sprint or /contact
// can leave just an email. Follows the /api/contact pattern exactly:
// rate-limit → size-capped body → validate → DB row is the source of truth
// → best-effort SMTP forward → server-side PostHog event.

const CONTACT_TO = (process.env.CONTACT_TO_EMAIL || 'moshtarakinapp@gmail.com').trim();
const SMTP_USER = (process.env.SMTP_USER || '').trim();
const SMTP_PASS = process.env.SMTP_PASS || '';

async function notifyOwner(lead: { email: string; source: string; lang: string | null; slug: string | null }): Promise<boolean> {
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('lead email notify skipped: SMTP_USER/SMTP_PASS not configured');
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
    const where = lead.slug ? ` (article: ${lead.slug})` : '';
    await transporter.sendMail({
      from: `"mehrdad.ir lead form" <${SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: lead.email,
      subject: `mehrdad.ir — new lead from ${lead.source}${where}`,
      text: `New lead captured on mehrdad.ir\n\nEmail: ${lead.email}\nSource: ${lead.source}\nArticle: ${lead.slug || '—'}\nLanguage: ${lead.lang || '—'}\n\nReply directly to this email to reach the reader.`,
      html: [
        '<div style="font:14px/1.6 -apple-system,Segoe UI,Tahoma,sans-serif;color:#222">',
        '<table style="border-collapse:collapse">',
        `<tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td style="padding:4px 0"><b>${esc(lead.email)}</b></td></tr>`,
        `<tr><td style="padding:4px 12px 4px 0;color:#666">Source</td><td style="padding:4px 0">${esc(lead.source)}</td></tr>`,
        `<tr><td style="padding:4px 12px 4px 0;color:#666">Article</td><td style="padding:4px 0">${esc(lead.slug || '—')}</td></tr>`,
        `<tr><td style="padding:4px 12px 4px 0;color:#666">Language</td><td style="padding:4px 0">${esc(lead.lang || '—')}</td></tr>`,
        '</table>',
        `<p style="color:#666;margin-top:12px">Reply directly to this email to reach the reader.</p>`,
        '</div>',
      ].join(''),
    });
    return true;
  } catch (e) {
    console.error('lead email notify failed:', e);
    return false;
  }
}

// minimal HTML escaper for the email template
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGS = new Set(['fa', 'en']);

export async function POST(req: NextRequest) {
  // spam guard: 5 leads per IP per 10 minutes (a bit looser than /contact —
  // this is a one-field form on a reading page)
  const rl = rateLimit(`lead:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const parsed = await readJsonBody(req);
  if (!parsed.ok) return jsonBodyError(parsed.error);

  try {
    const body = parsed.data || {};

    // honeypot (D-052): the form ships a hidden "website" field a human
    // never fills. Bots that do get a fake-success so they learn nothing —
    // and no row is written.
    if ((body.website || '').trim() !== '') {
      return NextResponse.json({ ok: true, emailed: false });
    }

    const email = (body.email || '').trim().slice(0, 200).toLowerCase();
    const source = ((body.source || '').trim().slice(0, 60) || 'article_cta');
    const lang = LANGS.has(body.lang) ? body.lang : null;
    const slug = (body.slug || '').trim().slice(0, 200) || null;

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const lead = await db.lead.create({ data: { email, source, lang, slug } });
    const emailed = await notifyOwner({ email, source, lang, slug });
    // server-side PostHog event — the validated DB row is the source of
    // truth; the reader's email becomes the PostHog person id so the owner
    // can trace the lead back to their article visit history.
    after(() =>
      trackServerEvent('lead_captured', email, {
        source,
        slug,
        lang,
        emailed,
        $set: { email },
      })
    );
    return NextResponse.json({ ok: true, emailed, id: lead.id });
  } catch (e) {
    console.error('lead api error:', e);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}
