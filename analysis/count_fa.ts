import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const faOnly = await db.post.findMany({
  where: { published: true, OR: [{ contentEn: null }, { contentEn: '' }] },
  select: { id: true, slug: true, titleFa: true, contentFa: true },
});
console.log('FA-only published posts:', faOnly.length);
const buckets = { 'a<3k': 0, 'b3-8k': 0, 'c8-20k': 0, 'd>20k': 0 } as Record<string, number>;
for (const p of faOnly) {
  const L = (p.contentFa || '').length;
  buckets[L < 3000 ? 'a<3k' : L < 8000 ? 'b3-8k' : L < 20000 ? 'c8-20k' : 'd>20k']++;
}
console.log(buckets);
for (const p of faOnly.slice(0, 5)) console.log('-', p.slug, '|', (p.titleFa || '').slice(0, 40), '|', (p.contentFa || '').length);
await db.$disconnect();
