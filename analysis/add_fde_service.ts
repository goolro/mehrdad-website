/**
 * Adds the "Forward Deployed Engineering" core service (ROADMAP sprint).
 * Idempotent: run-safe via unique slug upsert. Places the service first.
 * Run: bun analysis/add_fde_service.ts
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const FDE = {
  slug: 'forward-deployed-engineering',
  titleEn: 'Forward Deployed Engineering',
  titleFa: 'مهندسی در خط مقدم حل مسئله',
  descEn:
    'From real-world problems to working solutions — combining product thinking, engineering, and AI.',
  descFa: 'از مسئله واقعی تا راه‌حل اجرایی؛ با ترکیب تفکر محصول، مهندسی و هوش مصنوعی.',
  icon: 'Compass',
};

async function main() {
  const existing = await db.service.findUnique({ where: { slug: FDE.slug } });
  const minOrder = await db.service.aggregate({ _min: { order: true } });
  const firstOrder = Math.min((minOrder._min.order ?? 1) - 1, 0);

  if (existing) {
    await db.service.update({
      where: { slug: FDE.slug },
      data: { ...FDE, order: Math.min(existing.order, firstOrder) },
    });
    console.log(`updated existing service ${FDE.slug} (order ${Math.min(existing.order, firstOrder)})`);
  } else {
    const s = await db.service.create({ data: { ...FDE, order: firstOrder } });
    console.log(`created service ${FDE.slug} id=${s.id} order=${firstOrder}`);
  }

  const all = await db.service.findMany({ orderBy: { order: 'asc' }, select: { slug: true, order: true } });
  console.log(`total services: ${all.length}; first three: ${all.slice(0, 3).map((s) => `${s.slug}@${s.order}`).join(', ')}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
