/**
 * One-time migration to the 5-theme engine (D-014):
 * maps legacy theme ids stored in SiteSetting("theme") to their successors
 * and stamps a marker so re-runs are no-ops (old "digital" violet vs the
 * NEW "digital" cyan theme are different themes — hence the marker).
 * Run: bun analysis/migrate_theme_setting.ts
 */
import { PrismaClient } from '@prisma/client';

const MARKER = 'theme_engine_v2_migrated';
const LEGACY: Record<string, string> = {
  digital: 'default', // pre-engine violet brand → today's default
  ocean: 'winter',
  forest: 'nowruz',
  sunset: 'autumn',
  midnight: 'digital',
};

const db = new PrismaClient();
const done = await db.siteSetting.findUnique({ where: { key: MARKER } });
if (done) {
  console.log('marker present — already migrated, nothing to do');
} else {
  const row = await db.siteSetting.findUnique({ where: { key: 'theme' } });
  if (row && LEGACY[row.value]) {
    await db.siteSetting.update({ where: { key: 'theme' }, data: { value: LEGACY[row.value] } });
    console.log(`migrated theme: ${row.value} -> ${LEGACY[row.value]}`);
  } else {
    console.log(`theme=${row?.value ?? '(unset)'} needs no mapping`);
  }
  await db.siteSetting.create({ data: { key: MARKER, value: new Date().toISOString() } });
  console.log('marker stamped');
}
await db.$disconnect();
