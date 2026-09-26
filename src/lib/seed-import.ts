/**
 * Content seed importer — real site content that must exist in the
 * production database, shipped as code (same philosophy as
 * src/lib/project-profiles.ts: content travels with git, zero manual
 * production DB access needed).
 *
 * Behaviour:
 * - INSERT-IF-MISSING only: an existing row (e.g. edited later via the
 *   admin panel) is NEVER overwritten — admin stays the source of truth.
 * - Idempotent and cheap: after the first pass per process it no-ops.
 * - Fail-safe by design: any error (missing table on a fresh DB, remote
 *   DB hiccup during boot) is logged and swallowed — seeding must never
 *   crash the server or a deploy.
 *
 * Invoked from src/instrumentation.ts (server boot) and from the /work
 * page (build-time prerender, so the statically generated list includes
 * seeded rows on the very first deploy).
 */
import { db } from '@/lib/db';

interface SeedProject {
  slug: string;
  titleEn: string;
  titleFa: string;
  summaryEn: string;
  summaryFa: string;
  cover: string | null;
  section: 'work' | 'lab';
  status: 'live' | 'building' | 'testing' | 'idea' | 'concept' | 'paused' | 'archived';
  featured: boolean;
  order: number;
}

// cache-busting repair (2026-09-26): the traffic-tempo cover bytes were
// REPLACED (official app icon) while keeping the same URL — visitors whose
// browser/ISP proxy had cached the old bytes kept seeing the old icon.
// Fix: keep ONE file at the stable path and bust caches via a version query
// (?v=2) in the cover URL. The repair fires ONLY while the row still holds
// one of the previously-seeded raw values — a real admin edit (anything
// else) is never overwritten. INSERT-IF-MISSING stays the default.
const PREV_SEED_COVERS: Record<string, string[]> = {
  'traffic-tempo': ['/media/traffic-tempo-icon.webp', '/media/traffic-tempo-icon-2.webp'],
};

const SEED_PROJECTS: SeedProject[] = [
  {
    slug: 'traffic-tempo',
    titleEn: 'Traffic Tempo',
    titleFa: 'ترافیک تمپو',
    summaryEn:
      'A traffic intersection puzzle for Android — 50 handcrafted levels across 3 difficulties, a global daily challenge and a live leaderboard. Every level is verified by an algorithmic solver.',
    summaryFa:
      'بازی پازل تقاطع برای اندروید با ۵۰ مرحله دست‌ساز در سه سختی و چالش روزانه جهانی و لیدربورد زنده. هر مرحله با حل‌کننده الگوریتمی تأیید شده است.',
    cover: '/media/traffic-tempo-icon.webp?v=2',
    section: 'work',
    status: 'live',
    featured: false,
    order: 50,
  },
];

let done = false;

export async function importContentSeed(): Promise<void> {
  if (done) return;
  done = true;
  try {
    for (const row of SEED_PROJECTS) {
      const existing = await db.project.findUnique({ where: { slug: row.slug } });
      if (!existing) {
        await db.project.create({ data: { ...row } });
        console.log(`[seed] project "${row.slug}" created`);
        continue;
      }
      // cache-busting repair: the row was seeded by an OLDER version of this
      // file and still holds the exact previously-seeded cover URL, while the
      // bytes under that URL have changed — repair it so visitors see the
      // current asset. Any other (admin-authored) value is left untouched.
      const prevCovers = PREV_SEED_COVERS[row.slug];
      if (prevCovers && prevCovers.includes(existing.cover) && !prevCovers.includes(row.cover)) {
        await db.project.update({ where: { slug: row.slug }, data: { cover: row.cover } });
        console.log(`[seed] project "${row.slug}" cover repaired → ${row.cover}`);
      }
    }
  } catch (err) {
    console.warn('[seed] import skipped:', err instanceof Error ? err.message : err);
  }
}
