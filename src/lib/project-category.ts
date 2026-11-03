import { db } from './db';

/**
 * Project CATEGORY track (owner request 2026-11-01: «دسته‌بندی جدید بزاریم
 * مثلا پروژه‌های کسب و کار» — inside the SAME projects page, NOT a new menu).
 *
 * A small, closed vocabulary that answers "why does this project exist /
 * which track does it belong to". Orthogonal to the three existing axes:
 *
 *   section   (work | lab)            → WHERE it lives (which page)
 *   status    (idea … archived)       → WHERE it is in its lifecycle
 *   kind      (super-app … app)       → WHAT it is (card badge)
 *   category  (business …)            → owner grouping — rendered as a filter
 *                                       row inside the existing /work tabs
 *
 * NULL = uncategorized: those rows render exactly as before and the filter
 * row only appears once at least one project carries a category, so an
 * unused category costs the public site nothing.
 *
 * Unlike project-kind.ts there is NO slug bootstrap map on purpose — every
 * assignment is the owner's explicit admin-panel decision.
 */

export const PROJECT_CATEGORIES = ['business'] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/** display metadata — admin panel + the on-page filter chips */
export const CATEGORY_META: Record<ProjectCategory, { nameEn: string; nameFa: string }> = {
  business: { nameEn: 'Business', nameFa: 'کسب‌وکار' },
};

export function isProjectCategory(v: unknown): v is ProjectCategory {
  return typeof v === 'string' && (PROJECT_CATEGORIES as readonly string[]).includes(v);
}

/** row value → closed-vocabulary member or null (unknown strings stay hidden) */
export function normalizeProjectCategory(v: string | null | undefined): ProjectCategory | null {
  return isProjectCategory(v) ? v : null;
}

// ── one-time column bootstrap (same runtime-DDL pattern as project-kind.ts:
//    neither Vercel nor the cPanel artifact runs `prisma db push` at deploy
//    time, so the column is added lazily before the first project query) ──
let ensured: Promise<void> | null = null;

export function ensureProjectCategoryColumn(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await db
        .$executeRawUnsafe(`ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "category" TEXT`)
        .catch(async () => {
          await db
            .$executeRawUnsafe(`ALTER TABLE "Project" ADD COLUMN "category" TEXT`)
            .catch(() => {});
        });
    })().catch((e) => {
      ensured = null; // allow retry on the next request
      throw e;
    });
  }
  return ensured;
}
