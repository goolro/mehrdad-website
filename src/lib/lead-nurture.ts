import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

// D-058 (growth funnel, 2026-10-25): D-052 captures leads and emails the
// OWNER — but nothing ever writes BACK to the reader. This module is the
// nurture side of the funnel, capped at exactly two emails per lead ever:
//
//   nurtureStep 0 → welcome email right after capture (sent by /api/leads)
//   nurtureStep 1 → follow-up email once the lead is ≥48h old (daily cron)
//   nurtureStep 2 → done — never emailed again
//
// The state machine is idempotent (safe to run on every cron chain call),
// SMTP failure leaves the step untouched so the next run retries, and a
// lead that is already ≥48h old skips the welcome entirely (a two-day-old
// "hi!" would read like a glitch — it goes straight to the follow-up).

const CONTACT_TO = (process.env.CONTACT_TO_EMAIL || 'moshtarakinapp@gmail.com').trim();
const SMTP_USER = (process.env.SMTP_USER || '').trim();
const SMTP_PASS = process.env.SMTP_PASS || '';
const SITE = 'https://mehrdad.ir';

// lang comes from the DB as a plain string — anything that is not exactly
// 'en' renders the Persian version (the site's primary audience)
type MailLang = string | null | undefined;

// ─────────── lazy migration shim ───────────

let ensured: Promise<void> | null = null;

/** The production Lead table predates nurtureStep — add it lazily before
 * the first query that touches it (D-058), the same lazy-shim pattern as
 * ensureProjectKindColumn. Local sqlite gets the column from `prisma db
 * push`; the remote DB gets it here on first nurture/admin touch. */
export function ensureLeadNurtureColumn(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await db
        .$executeRawUnsafe(
          `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "nurtureStep" INTEGER NOT NULL DEFAULT 0`,
        )
        .catch(async () => {
          await db
            .$executeRawUnsafe(
              `ALTER TABLE "Lead" ADD COLUMN "nurtureStep" INTEGER NOT NULL DEFAULT 0`,
            )
            .catch(() => {});
        });
    })().catch((e) => {
      ensured = null; // allow retry on the next request
      throw e;
    });
  }
  return ensured;
}

// ─────────── transport ───────────

function smtpReady(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS);
}

function transporter() {
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 6000,
    socketTimeout: 10000,
  });
}

// ─────────── templates (FA copy: zero «،» per the standing rule) ───────────

interface LeadMail {
  subject: string;
  text: string;
  html: string;
}

function htmlWrap(dir: 'rtl' | 'ltr', lines: string[], ctaLabel: string, ctaHref: string): string {
  const cta =
    `<p style="margin:20px 0">` +
    `<a href="${ctaHref}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">${ctaLabel}</a></p>`;
  const body = lines.map((l) => `<p style="margin:0 0 12px">${l}</p>`).join('');
  return (
    `<div dir="${dir}" style="font:14px/1.8 -apple-system,Segoe UI,Tahoma,sans-serif;color:#222;max-width:560px">` +
    body +
    cta +
    `<p style="color:#888;font-size:12px;margin-top:24px">mehrdad.ir</p>` +
    `</div>`
  );
}

function welcomeMail(lang: MailLang): LeadMail {
  if (lang === 'en') {
    return {
      subject: 'Your idea landed — here is the next step',
      text: [
        'Hi!',
        '',
        `Your email reached me — I'm Mehrdad, a product builder at mehrdad.ir.`,
        '',
        'If you have an idea that deserves to go live: in one MVP Sprint I take it from first sketch to a real product in about two weeks — design, development and deployment together.',
        '',
        'Two ways to continue:',
        `1) See the MVP Sprint page: ${SITE}/mvp-sprint`,
        '2) Just reply to this email — I read every reply myself.',
        '',
        'No spam: at most one more email later (a real example).',
        '',
        'Mehrdad — mehrdad.ir',
      ].join('\n'),
      html: htmlWrap(
        'ltr',
        [
          `Hi!`,
          `Your email reached me — I'm <b>Mehrdad</b>, a product builder at mehrdad.ir.`,
          `If you have an idea that deserves to go live: in one <b>MVP Sprint</b> I take it from first sketch to a real product in about two weeks — design, development and deployment together.`,
          `Two ways to continue: see the MVP Sprint page or just reply to this email — I read every reply myself.`,
          `No spam: at most one more email later (a real example).`,
        ],
        'See the MVP Sprint',
        `${SITE}/mvp-sprint`,
      ),
    };
  }
  return {
    subject: 'ایده‌ات رسید — قدم بعدی چیست؟',
    text: [
      'سلام!',
      '',
      'ایمیلت رسید — من مهردادم؛ سازندهٔ محصول در mehrdad.ir.',
      '',
      'اگر ایده‌ای داری که باید زنده شود: در یک اسپرینت MVP آن را در حدود دو هفته از اولین طرح تا محصول واقعی می‌رسانم — طراحی و توسعه و استقرار با هم.',
      '',
      'دو راه برای ادامه:',
      `۱) صفحهٔ اسپرینت MVP را ببین: ${SITE}/mvp-sprint`,
      '۲) فقط به همین ایمیل جواب بده — خودم می‌خوانم.',
      '',
      'قرار نیست اسپم بفرستم؛ حداکثر یک ایمیل دیگر (معرفی یک نمونهٔ واقعی) بعداً برایت می‌فرستم.',
      '',
      'مهرداد — mehrdad.ir',
    ].join('\n'),
    html: htmlWrap(
      'rtl',
      [
        `سلام!`,
        `ایمیلت رسید — من <b>مهردادم</b>؛ سازندهٔ محصول در mehrdad.ir.`,
        `اگر ایده‌ای داری که باید زنده شود: در یک <b>اسپرینت MVP</b> آن را در حدود دو هفته از اولین طرح تا محصول واقعی می‌رسانم — طراحی و توسعه و استقرار با هم.`,
        `دو راه برای ادامه: صفحهٔ اسپرینت MVP را ببین یا فقط به همین ایمیل جواب بده — خودم می‌خوانم.`,
        `قرار نیست اسپم بفرستم؛ حداکثر یک ایمیل دیگر (معرفی یک نمونهٔ واقعی) بعداً برایت می‌فرستم.`,
      ],
      'اسپرینت MVP را ببین',
      `${SITE}/mvp-sprint`,
    ),
  };
}

function followupMail(lang: MailLang): LeadMail {
  if (lang === 'en') {
    return {
      subject: 'A real example: from pitch deck to fintech super-app',
      text: [
        'Hi again!',
        '',
        'Two days ago your email reached me. Here is a real example of how this path works end to end:',
        '',
        'kilika — a fintech super-app pitch for Iran: a full investor deck plus a project page telling the whole product story:',
        `${SITE}/work/kilika-fintech`,
        '',
        `And if you would rather jump straight to your own idea:`,
        `${SITE}/mvp-sprint`,
        'Or simply reply to this email.',
        '',
        'If the timing is not right — no problem; this was my last email.',
        '',
        'Mehrdad — mehrdad.ir',
      ].join('\n'),
      html: htmlWrap(
        'ltr',
        [
          `Hi again!`,
          `Two days ago your email reached me. Here is a <b>real example</b> of how this path works end to end:`,
          `kilika — a fintech super-app pitch for Iran: a full investor deck plus a project page telling the whole product story.`,
          `If you would rather jump straight to your own idea: open the MVP Sprint page or simply reply to this email.`,
          `If the timing is not right — no problem; this was my last email.`,
        ],
        'See the MVP Sprint',
        `${SITE}/mvp-sprint`,
      ),
    };
  }
  return {
    subject: 'یک نمونهٔ واقعی: از دِک سرمایه‌گذاری تا ابراپ فین‌تک',
    text: [
      'سلام دوباره!',
      '',
      'دو روز پیش ایمیلت را گرفتم. یک نمونهٔ واقعی برای اینکه ببینی این مسیر سر تا ته چطور انجام می‌شود:',
      '',
      'کلیکا — دِک سرمایه‌گذاری یک ابراپ فین‌تک برای ایران + صفحهٔ پروژه با داستان کامل محصول:',
      `${SITE}/work/kilika-fintech`,
      '',
      'و اگر ترجیح می‌دهی مستقیم سراغ ایدهٔ خودت برویم:',
      `${SITE}/mvp-sprint`,
      'یا ساده‌تر: همین ایمیل را جواب بده.',
      '',
      'اگر فعلاً وقتش نیست — اشکالی ندارد؛ این آخرین ایمیل من بود.',
      '',
      'مهرداد — mehrdad.ir',
    ].join('\n'),
    html: htmlWrap(
      'rtl',
      [
        `سلام دوباره!`,
        `دو روز پیش ایمیلت را گرفتم. یک <b>نمونهٔ واقعی</b> برای اینکه ببینی این مسیر سر تا ته چطور انجام می‌شود:`,
        `کلیکا — دِک سرمایه‌گذاری یک ابراپ فین‌تک برای ایران + صفحهٔ پروژه با داستان کامل محصول.`,
        `اگر ترجیح می‌دهی مستقیم سراغ ایدهٔ خودت برویم: صفحهٔ اسپرینت MVP را باز کن یا همین ایمیل را جواب بده.`,
        `اگر فعلاً وقتش نیست — اشکالی ندارد؛ این آخرین ایمیل من بود.`,
      ],
      'اسپرینت MVP را ببین',
      `${SITE}/mvp-sprint`,
    ),
  };
}

// ─────────── senders ───────────

interface NurtureLead {
  id: string;
  email: string;
  lang: string | null;
}

async function sendLeadEmail(lead: NurtureLead, mail: LeadMail): Promise<boolean> {
  if (!smtpReady()) return false;
  try {
    await transporter().sendMail({
      from: `"Mehrdad — mehrdad.ir" <${SMTP_USER}>`,
      to: lead.email,
      replyTo: CONTACT_TO,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return true;
  } catch (e) {
    // never throw into the caller's flow — SMTP hiccups must not break lead
    // capture or the cron; the step stays untouched so the next run retries
    console.error('lead nurture email failed:', e);
    return false;
  }
}

export async function sendLeadWelcome(lead: NurtureLead): Promise<boolean> {
  const ok = await sendLeadEmail(lead, welcomeMail(lead.lang));
  if (ok) {
    await db.lead.update({ where: { id: lead.id }, data: { nurtureStep: 1 } }).catch(() => {});
  }
  return ok;
}

export async function sendLeadFollowup(lead: NurtureLead): Promise<boolean> {
  const ok = await sendLeadEmail(lead, followupMail(lead.lang));
  if (ok) {
    await db.lead.update({ where: { id: lead.id }, data: { nurtureStep: 2 } }).catch(() => {});
  }
  return ok;
}

// ─────────── daily state machine ───────────

export interface NurtureRun {
  checked: number;
  welcomed: number;
  followed: number;
  failed: number;
}

const DAY = 86_400_000;

/** Idempotent: safe to piggyback on every morning-cron chain call.
 * With SMTP unset it is a no-op (state is never burned by a broken setup). */
export async function processLeadNurture(now = Date.now()): Promise<NurtureRun> {
  await ensureLeadNurtureColumn();
  const run: NurtureRun = { checked: 0, welcomed: 0, followed: 0, failed: 0 };
  if (!smtpReady()) return run;
  const leads = await db.lead.findMany({ orderBy: { createdAt: 'asc' } });
  for (const lead of leads) {
    run.checked++;
    const step = lead.nurtureStep ?? 0;
    if (step >= 2) continue;
    const age = now - new Date(lead.createdAt).getTime();
    if (age >= 2 * DAY) {
      const ok = await sendLeadFollowup(lead);
      if (ok) run.followed++;
      else run.failed++;
    } else if (step === 0) {
      // fresh lead whose welcome failed at capture time (SMTP was down)
      const ok = await sendLeadWelcome(lead);
      if (ok) run.welcomed++;
      else run.failed++;
    }
  }
  return run;
}
