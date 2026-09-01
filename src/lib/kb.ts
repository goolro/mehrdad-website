import { db } from '@/lib/db';

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

  const projects = await db.project.findMany();
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
        'Mehrdad is an independent product builder: "I design businesses and products with care, and build them fast with AI." Three connected activities — BUILD: AI-powered products, software, tools, experiments (BIZPAL AI marketing SaaS, KLIKA fintech, smart city & rail corridor research, smart waste management startup, investment platform). HELP: businesses using AI for measurable value — product design, sales & marketing, business consulting, invention commercialization. SHARE: 83+ articles of real research, decisions, failures and lessons. Contact: admin@mehrdad.ir or the contact form. | فارسی: مهرداد سازنده مستقل محصول است: «کسب‌وکار و محصولت رو با دقت طراحی می‌کنم، و با AI سریع می‌سازمش.» سه فعالیت به‌هم‌پیوسته — ساخت: محصولات و ابزارهای AI (BIZPAL، کلیکا، شهر هوشمند، کریدور ریلی، مدیریت زباله هوشمند، پلتفرم سرمایه‌گذاری). همراهی: به‌کارگیری AI با نتیجه قابل اندازه‌گیری — طراحی محصول، فروش و بازاریابی، مشاوره کسب‌وکار، تجاری‌سازی اختراع. به‌اشتراک‌گذاری: بیش از ۸۳ مقاله از پژوهش‌ها، تصمیم‌ها و درس‌های واقعی. تماس: admin@mehrdad.ir یا فرم تماس.',
    },
  });

  return db.kbChunk.count();
}
