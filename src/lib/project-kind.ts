import { db } from './db';

/**
 * Project KIND taxonomy (owner request 2026-09-29: «ما باید کارهایی که
 * کردیم را برچسب بزنیم») — a small, closed vocabulary rendered as a badge
 * on every project card / detail page:
 *
 *   super-app     سوپر اپ        (car super-app, personal finance tool)
 *   game-online   بازی آنلاین    (quiz of koko — Q&A with Koko)
 *   game-offline  بازی آفلاین
 *   app           اپ             (ordinary apps/tools — e.g. health tool)
 *
 * The column is the single source of truth once a row has a value (admin
 * select writes it). KIND_DEFAULT_SLUGS below only bootstrap the rows the
 * owner ALREADY classified by name — it is inert the moment a row carries
 * its own kind, and unknown slugs simply stay unlabeled.
 */

export const PROJECT_KINDS = ['super-app', 'game-online', 'game-offline', 'app'] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export function isProjectKind(v: unknown): v is ProjectKind {
  return typeof v === 'string' && (PROJECT_KINDS as readonly string[]).includes(v);
}

/** slug → kind bootstrap for the currently-shipped portfolio (see above). */
const KIND_DEFAULT_SLUGS: Record<string, ProjectKind> = {
  'car-super-app': 'super-app',
  'personal-finance-tool': 'super-app',
  'quiz-of-koko': 'game-online',
  'health-app': 'app',
};

/** own column value wins; legacy/unlabeled rows fall back to the slug map. */
export function resolveProjectKind(kind: string | null | undefined, slug: string): ProjectKind | null {
  const own = (kind || '').trim();
  if (own) return isProjectKind(own) ? own : null;
  return KIND_DEFAULT_SLUGS[slug] || null;
}

// ── one-time column bootstrap (same runtime-DDL pattern as chat-owner.ts:
//    neither Vercel nor the cPanel artifact runs `prisma db push` at deploy
//    time, so the column is added lazily before the first project query) ──
let ensured: Promise<void> | null = null;

export function ensureProjectKindColumn(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await db
        .$executeRawUnsafe(`ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "kind" TEXT`)
        .catch(async () => {
          await db
            .$executeRawUnsafe(`ALTER TABLE "Project" ADD COLUMN "kind" TEXT`)
            .catch(() => {});
        });
    })().catch((e) => {
      ensured = null; // allow retry on the next request
      throw e;
    });
  }
  return ensured;
}
