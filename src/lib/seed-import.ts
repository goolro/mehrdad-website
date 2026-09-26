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

const SEED_PROJECTS: SeedProject[] = [
  {
    slug: 'traffic-tempo',
    titleEn: 'Traffic Tempo',
    titleFa: 'ترافیک تمپو',
    summaryEn:
      'A traffic intersection puzzle for Android — 50 handcrafted levels across 3 difficulties, a global daily challenge and a live leaderboard. Every level is verified by an algorithmic solver.',
    summaryFa:
      'بازی پازل تقاطع برای اندروید با ۵۰ مرحله دست‌ساز در سه سختی و چالش روزانه جهانی و لیدربورد زنده. هر مرحله با حل‌کننده الگوریتمی تأیید شده است.',
    cover: '/media/traffic-tempo-icon.webp',
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
      if (existing) continue;
      await db.project.create({ data: { ...row } });
      console.log(`[seed] project "${row.slug}" created`);
    }
  } catch (err) {
    console.warn('[seed] import skipped:', err instanceof Error ? err.message : err);
  }
}
