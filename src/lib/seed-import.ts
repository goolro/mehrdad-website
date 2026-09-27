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

/**
 * First real digest content (2026-09-27): eight Product Hunt launches from
 * the public feed — distilled one-liners in EN + FA (no Persian comma per
 * the editorial rule). INSERT-IF-MISSING on the unique url, so future
 * imports and admin edits always win over these rows.
 */
interface SeedDaily {
  day: string;
  name: string;
  taglineEn: string;
  taglineFa: string;
  url: string;
}

const SEED_DAILY: SeedDaily[] = [
  {
    day: '2026-09-27',
    name: 'GPT-6 Sol & Luna',
    taglineEn: 'Frontier AI intelligence, now at half the price',
    taglineFa: 'هوش مصنوعی مرزی OpenAI حالا با نصف قیمت',
    url: 'https://www.producthunt.com/products/openai',
  },
  {
    day: '2026-09-27',
    name: 'Superhuman Go',
    taglineEn: 'The AI assistant that works where you do',
    taglineFa: 'دستیار هوشمندی که همان‌جا که کار می‌کنی کار می‌کند',
    url: 'https://www.producthunt.com/products/superhuman-go',
  },
  {
    day: '2026-09-27',
    name: 'Cuey',
    taglineEn: 'Compare ChatGPT, Claude & Gemini answers in one tab.',
    taglineFa: 'مقایسهٔ پاسخ‌های ChatGPT و Claude و Gemini در یک تب',
    url: 'https://www.producthunt.com/products/cuey-2',
  },
  {
    day: '2026-09-27',
    name: 'Fewer',
    taglineEn: 'The launcher that counts how often you pick up your phone',
    taglineFa: 'لانچری که می‌شمارد چند بار در روز گوشی را برمی‌داری',
    url: 'https://www.producthunt.com/products/fewer',
  },
  {
    day: '2026-09-26',
    name: 'KiwiDesk',
    taglineEn: 'Tiling that feels like it shipped with macOS.',
    taglineFa: 'چیدمان پنجره برای مک که انگار جزو خود سیستم است',
    url: 'https://www.producthunt.com/products/kiwidesk',
  },
  {
    day: '2026-09-26',
    name: 'Harmony',
    taglineEn: 'AI agents that resolve IT/HR tickets inside Slack and Teams',
    taglineFa: 'ایجنت‌های هوشمندی که تیکت‌های IT و منابع انسانی را در Slack و Teams حل می‌کنند',
    url: 'https://www.producthunt.com/products/harmony-it',
  },
  {
    day: '2026-09-26',
    name: 'Donna',
    taglineEn: 'Schedule multiple meetings with one link',
    taglineFa: 'زمان‌بندی چند جلسه با یک لینک',
    url: 'https://www.producthunt.com/products/donna-4',
  },
  {
    day: '2026-09-26',
    name: 'Paragraph Notes',
    taglineEn: 'A private Markdown notes app for Mac',
    taglineFa: 'اپ یادداشت خصوصی با Markdown برای مک',
    url: 'https://www.producthunt.com/products/paragraph-notes',
  },
];

let done = false;

/**
 * Schema bootstrap for the DailyProduct table (2026-09-27).
 *
 * The daily digest ships its TABLE with git on the same basis as its
 * rows: `prisma db push` against the production URL needs manual access
 * this project deliberately avoids, so the first postgres boot runs an
 * idempotent CREATE TABLE IF NOT EXISTS — non-destructive by
 * construction (it can never alter or drop existing data) and a no-op
 * on every later boot. SQLite environments (sandbox/cPanel) already get
 * the table from `prisma db push`, so the DDL is skipped there.
 * After the table exists and the first rows are seeded, the deploy hook
 * fires once so the static /daily page rebuilds WITH content.
 */
async function bootstrapDailyTable(): Promise<boolean> {
  const url = process.env.DATABASE_URL || '';
  if (url.startsWith('file:')) return false; // sqlite — schema lives in prisma db push
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DailyProduct" (
        "id" TEXT NOT NULL,
        "day" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "taglineEn" TEXT NOT NULL,
        "taglineFa" TEXT,
        "url" TEXT NOT NULL,
        "logo" TEXT,
        "votes" INTEGER NOT NULL DEFAULT 0,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DailyProduct_pkey" PRIMARY KEY ("id")
      )`);
    await db.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "DailyProduct_url_key" ON "DailyProduct"("url")`
    );
    await db.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "DailyProduct_day_order_idx" ON "DailyProduct"("day", "order")`
    );
    return true;
  } catch (err) {
    console.warn('[seed] daily table bootstrap skipped:', err instanceof Error ? err.message : err);
    return false;
  }
}

export async function importContentSeed(): Promise<void> {
  if (done) return;
  done = true;
  try {
    let dailyChanged = await bootstrapDailyTable();

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
      if (
        prevCovers &&
        existing.cover !== null &&
        row.cover !== null &&
        prevCovers.includes(existing.cover) &&
        !prevCovers.includes(row.cover)
      ) {
        await db.project.update({ where: { slug: row.slug }, data: { cover: row.cover } });
        console.log(`[seed] project "${row.slug}" cover repaired → ${row.cover}`);
      }
    }

    for (const row of SEED_DAILY) {
      const existing = await db.dailyProduct.findUnique({ where: { url: row.url } });
      if (existing) continue;
      await db.dailyProduct.create({ data: row });
      console.log(`[seed] daily "${row.name}" created (${row.day})`);
      dailyChanged = true;
    }

    // the static /daily page is prerendered at BUILD time — when this boot
    // actually created the table or the first rows, fire the deploy hook
    // once so the next build bakes the digest in (self-healing first
    // deploy; the guard below keeps it from looping).
    if (dailyChanged && process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
      console.log('[seed] deploy hook fired for the daily digest');
    }
  } catch (err) {
    console.warn('[seed] import skipped:', err instanceof Error ? err.message : err);
  }
}
