import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const db = new PrismaClient();
const TRANS = JSON.parse(fs.readFileSync('/home/z/my-project/analysis/translations.json', 'utf-8'));

async function main() {
  const posts = await db.post.findMany({ select: { id: true, wpId: true, contentEn: true } });
  let updated = 0;
  for (const p of posts) {
    if (!p.wpId) continue;
    const t = TRANS[String(p.wpId)];
    if (!t) continue;
    const data: Record<string, string | null> = {};
    if (t.title_en && t.title_en.trim()) data.titleEn = t.title_en.trim();
    if (t.excerpt_en && t.excerpt_en.trim()) data.excerptEn = t.excerpt_en.trim();
    if (t.content_en && t.content_en.trim() && !p.contentEn) data.contentEn = t.content_en.trim();
    if (Object.keys(data).length === 0) continue;
    await db.post.update({ where: { id: p.id }, data });
    updated++;
  }
  const en = await db.post.count({ where: { contentEn: { not: null } } });
  console.log(`synced ${updated} posts | posts with EN content: ${en}`);
}

main().finally(() => db.$disconnect());
