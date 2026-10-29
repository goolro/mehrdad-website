import { db } from '@/lib/db';
import { invalidateKbCache } from './rag';
import { visibleProjects } from './project-visibility';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function chunkText(text: string, maxLen = 1100): string[] {
  const sentences = text.split(/(?<=[.!?؟])\s+/);
  const chunks: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).length > maxLen && cur) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur += ' ' + s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

export async function addPostToKb(postId: string) {
  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) return;
  await db.kbChunk.deleteMany({ where: { refType: 'post', refId: postId } });
  invalidateKbCache(); // the delete above already changed the corpus
  const body = post.contentEn || post.contentFa || '';
  const title = post.titleEn || post.titleFa || '';
  if (!body) return;
  const parts = chunkText(stripHtml(body));
  for (const part of parts) {
    await db.kbChunk.create({
      data: {
        refType: 'post',
        refId: post.id,
        refSlug: post.slug,
        title,
        body: part,
        tokens: Math.ceil(part.length / 4),
      },
    });
  }
  invalidateKbCache();
}

export async function rebuildKb() {
  await db.kbChunk.deleteMany();

  const posts = await db.post.findMany();
  for (const post of posts) {
    const body = post.contentEn || post.contentFa || '';
    const title = post.titleEn || post.titleFa || '';
    if (!body) continue;
    const parts = chunkText(stripHtml(body));
    for (const part of parts) {
      await db.kbChunk.create({
        data: {
          refType: 'post',
          refId: post.id,
          refSlug: post.slug,
          title,
          body: part,
          tokens: Math.ceil(part.length / 4),
        },
      });
    }
  }

  const services = await db.service.findMany();
  for (const s of services) {
    const body = `${s.descEn} ${s.descFa}`;
    const parts = chunkText(stripHtml(body), 800);
    for (const part of parts) {
      await db.kbChunk.create({
        data: { refType: 'service', refId: s.id, refSlug: s.slug, title: s.titleEn, body: part },
      });
    }
  }

  // display kill-switch (project-visibility.ts): hidden projects stay out of
  // the AI-assistant knowledge base — the product is not shown anywhere
  const projects = visibleProjects(await db.project.findMany());
  for (const p of projects) {
    const body = `${p.summaryEn} ${p.summaryFa}`;
    const parts = chunkText(stripHtml(body), 800);
    for (const part of parts) {
      await db.kbChunk.create({
        data: { refType: 'project', refId: p.id, refSlug: p.slug, title: p.titleEn, body: part },
      });
    }
  }

  await db.kbChunk.create({
    data: {
      refType: 'site',
      title: 'About Mehrdad / درباره مهرداد',
      body:
        'Mehrdad is an independent product builder: "I design businesses and products with care, and build them fast with AI." Three connected activities — BUILD: AI-powered products, software, tools, experiments (BIZPAL AI marketing SaaS, kilika fintech, smart city & rail corridor research, smart waste management startup, investment platform). HELP: businesses using AI for measurable value — product design, sales & marketing, business consulting, invention commercialization. SHARE: 83+ articles of real research, decisions, failures and lessons. Contact: the contact form at mehrdad.ir/contact. | فارسی: مهرداد سازنده مستقل محصول است: «کسب‌وکار و محصولت رو با دقت طراحی می‌کنم، و با AI سریع می‌سازمش.» سه فعالیت به‌هم‌پیوسته — ساخت: محصولات و ابزارهای AI (BIZPAL، کلیکا، شهر هوشمند، کریدور ریلی، مدیریت زباله هوشمند، پلتفرم سرمایه‌گذاری). همراهی: به‌کارگیری AI با نتیجه قابل اندازه‌گیری — طراحی محصول، فروش و بازاریابی، مشاوره کسب‌وکار، تجاری‌سازی اختراع. به‌اشتراک‌گذاری: بیش از ۸۳ مقاله از پژوهش‌ها، تصمیم‌ها و درس‌های واقعی. تماس: فرم تماس در mehrdad.ir/contact.',
    },
  });

  await ingestPages();

  invalidateKbCache();
  return db.kbChunk.count();
}

// ─────────── full-page ingestion (owner order 2026-10-20: «چت گفتگو همه
// صفحات را مطالعه کنه») ───────────
// The posts/services/projects chunks above only cover DATABASE content. The
// assistant must also know the site's REAL rendered pages — home, about,
// contact, fde, lab, daily, the listing pages, the deck landings and the
// restored /s/kilika.html one-pager. Pages are fetched from the live origin
// (production truth — the same SITE_ORIGIN convention as the index-ping
// cron; self-fetch is an established pattern here, cf. daily-generate's
// after() self-chain), stripped to text and chunked as refType 'page'.
const KB_PAGES: { url: string; title: string }[] = [
  { url: '/', title: 'Home — mehrdad.ir / خانه' },
  { url: '/about', title: 'About Mehrdad / درباره مهرداد' },
  { url: '/contact', title: 'Contact / تماس با مهرداد' },
  { url: '/fde', title: 'Forward Deployed Engineering / مهندسی در خط مقدم حل مسئله' },
  { url: '/lab', title: 'Lab / آزمایشگاه' },
  { url: '/daily', title: 'Daily / روزنوشت' },
  { url: '/blog', title: 'Blog index / فهرست مقاله‌ها' },
  { url: '/work', title: 'Work & projects index / کارها و پروژه‌ها' },
  { url: '/services', title: 'Services index / خدمات' },
  { url: '/deck/health', title: 'Health & Wellness deck (EN) / ارائه ویوورا' },
  { url: '/deck/health/fa', title: 'Health & Wellness deck (FA) / ارائه ویوورا فارسی' },
  { url: '/s/kilika.html', title: 'kilika one-pager / صفحه تک‌تصویری کلیکا' },
];

/** rendered HTML → plain text (scripts/styles/svg/meta-attr noise removed) */
function pageText(html: string): string {
  return stripHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
  );
}

/** fetch every KB page from the live origin and store its text chunks. */
async function ingestPages(): Promise<number> {
  await db.kbChunk.deleteMany({ where: { refType: 'page' } }); // idempotent re-runs
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  const fetched = await Promise.allSettled(
    KB_PAGES.map(async (page) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      try {
        const res = await fetch(base + page.url, { signal: ctrl.signal, cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = pageText(await res.text());
        if (text.length < 200) throw new Error(`text too short (${text.length})`);
        return { page, text };
      } finally {
        clearTimeout(timer);
      }
    }),
  );
  let count = 0;
  for (let i = 0; i < fetched.length; i++) {
    const r = fetched[i];
    if (r.status !== 'fulfilled') {
      console.warn(`kb pages: ${KB_PAGES[i].url} skipped (${r.reason instanceof Error ? r.reason.message : r.reason})`);
      continue;
    }
    for (const part of chunkText(r.value.text, 900)) {
      await db.kbChunk.create({
        data: {
          refType: 'page',
          refId: r.value.page.url,
          refSlug: r.value.page.url,
          title: r.value.page.title,
          body: part,
          tokens: Math.ceil(part.length / 4),
        },
      });
      count++;
    }
  }
  if (count > 0) invalidateKbCache();
  return count;
}

// One-shot bootstrap for the chat hot path: the production KB predates the
// pages phase, so the first chat message after this deploy self-bootstraps
// the page corpus. The chat route calls this inside `after()` (official
// post-response work — a guaranteed execution window on Vercel, zero added
// latency on the request itself; the 5-min RAG cache is invalidated on
// success so the NEXT message already retrieves from pages). Safe to race:
// ingestPages() deletes its own refType first. Throttled to one attempt per
// 10 minutes until it succeeds.
let kbPagesReady = false;
let kbPagesLastAttempt = 0;

export async function ensureKbPages(): Promise<void> {
  if (kbPagesReady) return;
  if (Date.now() - kbPagesLastAttempt < 10 * 60 * 1000) return;
  kbPagesLastAttempt = Date.now();
  try {
    const existing = await db.kbChunk.count({ where: { refType: 'page' } });
    if (existing > 0) {
      kbPagesReady = true;
      return;
    }
    const n = await ingestPages();
    kbPagesReady = true;
    console.log(`kb bootstrap: ingested ${n} page chunks`);
  } catch (e) {
    console.error('kb bootstrap failed (will retry later):', e instanceof Error ? e.message : e);
  }
}
