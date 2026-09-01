import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const db = new PrismaClient();
async function main() {
  const posts = await db.post.findMany({ select: { id: true, cover: true } });
  let fixed = 0;
  for (const p of posts) {
    if (!p.cover) continue;
    const path = p.cover.replace('/media/', 'public/media/');
    if (!fs.existsSync(path) || fs.statSync(path).size < 500) {
      await db.post.update({ where: { id: p.id }, data: { cover: null } });
      fixed++;
    }
  }
  console.log('fixed covers:', fixed, '/', posts.length);
}
main().finally(() => db.$disconnect());
