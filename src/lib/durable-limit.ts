import { db } from './db';

/**
 * DURABLE budget/rate buckets (round-3 finding M4 follow-up — phase-1 fix).
 *
 * WHY: every bucket in lib/rate-limit.ts lives in a per-process Map. On the
 * cPanel standalone artifact (one Node process) that is exactly right — but
 * on Vercel each lambda instance owns a FRESH map, so any bucket that guards
 * money (AI spend) or the admin login resets on every cold start and is
 * multiplied by the instance count. IP-rotation becomes a limit-lift.
 *
 * The buckets counted here must survive process boundaries, so they live in
 * the shared database (local SQLite in dev, Turso in production) — one row
 * per key, updated by a SINGLE atomic UPSERT, so concurrent lambda
 * instances cannot race the count. No Prisma model / no migration: the
 * table is bootstrapped lazily with the same runtime-DDL pattern as
 * lib/chat-owner and lib/ai-articles (neither Vercel nor the cPanel
 * artifact runs `prisma db push` at deploy time).
 *
 * Semantics: fixed window, identical to lib/rate-limit. `resetAt` re-anchors
 * at the first hit of a new window; RETURNING hands back the post-update
 * row so one round-trip yields both pass/fail and the retry time.
 *
 * FAILURE MODE: if the DB is unreachable the check fails OPEN (ok=true) and
 * logs loudly — a degraded limiter must never take the admin login or the
 * chat endpoint down with it. The in-memory layer in lib/rate-limit keeps
 * running regardless, so the first-line per-IP guard is unaffected.
 */

export interface DurableLimitResult {
  ok: boolean;
  /** seconds until the window resets (for Retry-After) */
  retryAfter: number;
}

let ensured: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await db.$executeRawUnsafe(
        // "resetAt" must be BIGINT (epoch millis) — Prisma's SQLite connector
        // materializes INTEGER columns as Int32, and millis overflow it.
        // BIGINT comes back as BigInt and is converted below.
        `CREATE TABLE IF NOT EXISTS "RateBucket" (
           "key" TEXT PRIMARY KEY,
           "count" INTEGER NOT NULL,
           "resetAt" BIGINT NOT NULL
         )`,
      );
    })().catch((e) => {
      ensured = null; // allow retry on the next request
      throw e;
    });
  }
  return ensured;
}

/**
 * Check and consume one unit for `key` in the shared database.
 * @param limit     max hits allowed per window
 * @param windowMs  window length in milliseconds
 */
export async function durableLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<DurableLimitResult> {
  try {
    await ensureTable();
    const now = Date.now();
    const rows = await db.$queryRaw<{ count: number; resetAt: bigint }[]>`
      INSERT INTO "RateBucket" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${now + windowMs})
      ON CONFLICT("key") DO UPDATE SET
        "count" = CASE WHEN ${now} >= "RateBucket"."resetAt" THEN 1
                       ELSE "RateBucket"."count" + 1 END,
        "resetAt" = CASE WHEN ${now} >= "RateBucket"."resetAt" THEN ${now + windowMs}
                         ELSE "RateBucket"."resetAt" END
      RETURNING "count" AS "count", "resetAt" AS "resetAt"`;
    const row = rows[0];
    if (!row) return { ok: true, retryAfter: 0 };
    // BIGINT columns arrive as BigInt — narrow to Number (epoch millis fit
    // exactly in a JS double until ~275,760 AD)
    const resetAtMs = Number(row.resetAt);
    if (row.count > limit) {
      return { ok: false, retryAfter: Math.max(1, Math.ceil((resetAtMs - now) / 1000)) };
    }
    return { ok: true, retryAfter: 0 };
  } catch (e) {
    // fail OPEN (see header) — but never silently
    console.error(
      `durableLimit(${key}) unavailable, failing OPEN:`,
      e instanceof Error ? e.message : e,
    );
    return { ok: true, retryAfter: 0 };
  }
}
