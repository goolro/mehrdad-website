import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
// ROADMAP P1: post 7995 (smart-waste financials) awaits owner publish/draft
// decision — it is currently published with a completely EMPTY body, which
// renders as a broken article. Revert to draft until the owner decides.
const r = await db.post.update({
  where: { slug: 'startup-smart-waste-management-solution' },
  data: { published: false },
});
console.log('set to draft:', r.slug, '| published =', r.published);
await db.$disconnect();
