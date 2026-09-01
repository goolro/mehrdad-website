import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const posts = await db.post.findMany({
  where: { published: true, OR: [{ contentEn: null }, { contentEn: '' }] },
  select: { id: true, slug: true, titleFa: true, titleEn: true, contentFa: true, excerptFa: true, published: true },
});
const empty = posts.filter((p) => !(p.contentFa || '').trim());
console.log('published, no-EN, and EMPTY-FA:', empty.length);
for (const p of empty) console.log(JSON.stringify(p, null, 1).slice(0, 400));
await db.$disconnect();
