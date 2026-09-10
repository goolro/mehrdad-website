import { db } from '@/lib/db';

/**
 * Idempotent runtime bootstrap for the SocialDraft table.
 *
 * The Vercel build only runs `prisma generate` — DDL against the managed
 * Postgres is applied separately. To keep the Social Studio self-sufficient
 * (no manual Supabase SQL step), the first drafts request after a deploy
 * creates the table if it is missing. Matches the Prisma mapping in
 * prisma/schema.postgres.prisma exactly; safe to call concurrently (a
 * module-level promise collapses racing callers into one execution).
 */
let ensured: Promise<void> | null = null;

export function ensureSocialDraftTable(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SocialDraft" (
          "id" TEXT NOT NULL,
          "platform" TEXT NOT NULL,
          "lang" TEXT NOT NULL,
          "topic" TEXT,
          "sourceSlug" TEXT,
          "content" TEXT NOT NULL,
          "posted" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SocialDraft_pkey" PRIMARY KEY ("id")
        )
      `);
    })().catch((e) => {
      ensured = null; // allow retry on the next request
      throw e;
    });
  }
  return ensured;
}
