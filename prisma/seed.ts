import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const db = new PrismaClient();

const DATA = JSON.parse(fs.readFileSync('/home/z/my-project/analysis/migration_data.json', 'utf-8'));
const TRANS = fs.existsSync('/home/z/my-project/analysis/translations.json')
  ? JSON.parse(fs.readFileSync('/home/z/my-project/analysis/translations.json', 'utf-8'))
  : {};

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
  const sentences = text.split(/(?<=[.!?؟。])\s+/);
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

async function addChunks(
  refType: string,
  refId: string | null,
  refSlug: string | null,
  title: string,
  body: string
) {
  const clean = stripHtml(body);
  if (!clean || clean.length < 40) return;
  const parts = chunkText(clean);
  for (const part of parts) {
    await db.kbChunk.create({
      data: { refType, refId, refSlug, title, body: part, tokens: Math.ceil(part.length / 4) },
    });
  }
}

async function main() {
  console.log('Clearing existing data...');
  await db.chatMessage.deleteMany();
  await db.chatSession.deleteMany();
  await db.kbChunk.deleteMany();
  await db.post.deleteMany();
  await db.category.deleteMany();
  await db.service.deleteMany();
  await db.project.deleteMany();

  // ── Categories ──
  const catMap = new Map<string, string>();
  for (const c of DATA.categories) {
    const cat = await db.category.create({
      data: {
        slug: c.slug,
        nameEn: c.name_en,
        nameFa: c.name_fa || c.name_en,
        wpId: c.wp_id,
      },
    });
    catMap.set(String(c.wp_id), cat.id);
  }
  console.log(`categories: ${catMap.size}`);

  // ── Posts ──
  let withEn = 0;
  for (const p of DATA.posts) {
    const t = TRANS[String(p.wp_id)] || {};
    const titleEn = (t.title_en || '').trim();
    const hasEn = Boolean(titleEn);
    if (hasEn) withEn++;
    const post = await db.post.create({
      data: {
        slug: p.slug,
        wpId: p.wp_id,
        titleFa: p.title_fa,
        titleEn: titleEn || p.title_fa,
        excerptFa: p.excerpt_fa || null,
        excerptEn: (t.excerpt_en || '').trim() || (hasEn ? null : p.excerpt_fa || null),
        contentFa: p.content_fa_html || null,
        contentEn: (t.content_en || '').trim() || null,
        cover: p.cover,
        date: new Date(p.date),
        modified: new Date(p.modified || p.date),
        published: true,
        categories: {
          connect: (p.categories || [])
            .map((cid: string) => catMap.get(cid))
            .filter(Boolean)
            .map((id: string) => ({ id })),
        },
      },
    });
    // KB chunks: prefer EN content (primary lang), else FA
    const kbBody = post.contentEn || post.contentFa || '';
    const kbTitle = post.titleEn || post.titleFa || '';
    await addChunks('post', post.id, post.slug, kbTitle, kbBody);
  }
  console.log(`posts: ${DATA.posts.length} (with EN content: ${withEn})`);

  // ── Services ──
  for (const s of DATA.services) {
    const svc = await db.service.create({
      data: {
        slug: s.slug,
        titleFa: s.title_fa,
        titleEn: s.title_en || s.slug, // filled below
        descFa: s.desc_fa,
        descEn: s.desc_en || s.desc_fa, // filled below
        icon: s.icon || 'Sparkles',
        order: s.order || 0,
      },
    });
    await addChunks('service', svc.id, svc.slug, svc.titleEn, svc.descEn);
  }
  console.log(`services: ${DATA.services.length}`);

  // ── Projects ──
  for (const pr of DATA.projects) {
    const proj = await db.project.create({
      data: {
        slug: pr.slug,
        titleFa: pr.title_fa,
        titleEn: pr.title_en || pr.title_fa,
        summaryFa: pr.summary_fa,
        summaryEn: pr.summary_en || pr.summary_fa,
        cover: pr.cover || null,
        order: pr.order || 0,
      },
    });
    await addChunks('project', proj.id, proj.slug, proj.titleEn, proj.summaryEn);
  }
  console.log(`projects: ${DATA.projects.length}`);

  // ── Site info chunks ──
  const site = DATA.site;
  await addChunks('site', null, null, 'About Mehrdad', `${site.about_en} Tagline: ${site.tagline_en}. ${site.hero_en}`);
  await addChunks('site', null, null, 'درباره مهرداد', `${site.about_fa} ${site.hero_fa}`);
  await addChunks('site', null, null, 'Contact', `Contact email: ${site.email}. You can use the contact form on the website. Persian: ایمیل تماس ${site.email} و فرم تماس در سایت موجود است.`);

  const totalChunks = await db.kbChunk.count();
  console.log(`KB chunks: ${totalChunks}`);
  console.log('SEED DONE ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
