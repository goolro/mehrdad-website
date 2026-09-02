import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const total = await db.post.count();
  const noEn = await db.post.count({ where: { OR: [{ contentEn: { equals: '' } }, { contentEn: { equals: null as any } }] } });
  const faOnly = await db.post.findMany({ where: { OR: [{ contentEn: { equals: '' } }, { contentEn: { equals: null as any } }] }, select: { slug: true, titleFa: true }, take: 10 });
  let tags = 'no-model';
  let postTagLinks: any = 'n/a';
  try { tags = await (db as any).tag.count(); } catch {}
  try {
    const r = await db.$queryRawUnsafe('SELECT COUNT(*) as c FROM _PostToTag') as any;
    postTagLinks = r?.[0]?.c ?? 0;
  } catch { postTagLinks = 'no-table'; }
  console.log(JSON.stringify({ total, missingEn: noEn, faOnly, tagCount: tags, postTagLinks }, null, 2));
}
main().finally(() => db.$disconnect());
