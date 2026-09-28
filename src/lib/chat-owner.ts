import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { db } from './db';

/**
 * Chat session ownership (round-3 finding L4 — the residual).
 *
 * BEFORE: a ChatSession was addressable by its id alone, so anyone who
 * learned/guessed a sessionId could silently CONTINUE that conversation
 * (reading nothing, but injecting turns and burning AI cost) or DELETE it
 * via the privacy endpoint. Cuid entropy made guessing impractical — but
 * the ids do travel (admin panel, logs, referrers) and deletion had no
 * check at all, so the capability gap was real.
 *
 * NOW: every session carries a random 192-bit owner token (sha256-hashed
 * in the new `ownerHash` column). The server hands the raw token to the
 * visitor exactly once — together with the sessionId — and both chat
 * continuation and deletion REQUIRE the matching token:
 *
 * - valid (sessionId, sessionToken)  → the conversation continues
 * - legacy row without an ownerHash  → claimed on first contact (smooth
 *   deploy window; nothing for the visitor to notice)
 * - wrong/missing token              → a BRAND-NEW session is created —
 *   a mismatch is indistinguishable from "start chatting", so nothing
 *   about the original session is revealed
 *
 * The widget keeps the token next to the sessionId in memory, so the UX
 * is identical for a real visitor — and multi-session/multi-tab setups
 * keep working because each session owns its own token.
 *
 * STORAGE: the column is added lazily at first use (same runtime-DDL
 * pattern as lib/ai-articles and lib/brief) because neither Vercel nor
 * the cPanel artifact runs `prisma db push` at deploy time. Postgres
 * (and libsql ≥ recent) support `ADD COLUMN IF NOT EXISTS`; plain SQLite
 * falls back to the caught plain-ALTER variant.
 */

const OWNER_HASH_CONTEXT = 'mehrdad-chat-owner:';

/** sha256 of the raw owner token, namespaced so it never collides elsewhere. */
export function ownerTokenHash(token: string): string {
  return createHash('sha256').update(OWNER_HASH_CONTEXT + token, 'utf8').digest('hex');
}

/** A fresh 192-bit owner token (URL-safe, ~32 chars). */
export function mintOwnerToken(): string {
  return randomBytes(24).toString('base64url');
}

// ── one-time column bootstrap (memoized per process, retryable on failure) ──
let ensured: Promise<void> | null = null;

async function ensureOwnerHashColumn(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await db
        .$executeRawUnsafe(`ALTER TABLE "ChatSession" ADD COLUMN IF NOT EXISTS "ownerHash" TEXT`)
        .catch(async () => {
          await db
            .$executeRawUnsafe(`ALTER TABLE "ChatSession" ADD COLUMN "ownerHash" TEXT`)
            .catch(() => {});
        });
    })().catch((e) => {
      ensured = null; // allow retry on the next request
      throw e;
    });
  }
  return ensured;
}

/**
 * Resolve an incoming (sessionId, sessionToken) pair into an OWNED session.
 * Used by POST /api/chat for every message: it either continues the caller's
 * session or hands back a fresh one — never someone else's.
 */
export async function resolveOwnedSession(
  requestedId: string,
  clientToken: string
): Promise<{ sessionId: string; sessionToken: string }> {
  await ensureOwnerHashColumn();

  if (requestedId) {
    const row = await db.chatSession
      .findUnique({ where: { id: requestedId }, select: { id: true, ownerHash: true } })
      .catch(() => null);
    if (row) {
      // valid ownership → continue
      if (clientToken && row.ownerHash && sameOwnerHash(row.ownerHash, clientToken)) {
        return { sessionId: row.id, sessionToken: clientToken };
      }
      // legacy row (deployed before ownership existed) → claim on first
      // contact so in-flight conversations survive the deploy window
      if (row.ownerHash === null) {
        const token = clientToken || mintOwnerToken();
        await db.chatSession
          .update({ where: { id: row.id }, data: { ownerHash: ownerTokenHash(token) } })
          .catch(() => {});
        return { sessionId: row.id, sessionToken: token };
      }
      // owned by someone else → fall through to a brand-new session
    }
  }

  const token = mintOwnerToken();
  const created = await db.chatSession.create({ data: { ownerHash: ownerTokenHash(token) } });
  return { sessionId: created.id, sessionToken: token };
}

/**
 * Constant-time ownership check for the destructive/read-sensitive paths
 * (DELETE /api/chat and POST /api/chat/contact). No match → the caller
 * must refuse without distinguishing "wrong token" from "no such session".
 */
export async function isSessionOwner(sessionId: string, clientToken: string): Promise<boolean> {
  if (!sessionId || !clientToken) return false;
  await ensureOwnerHashColumn();
  const row = await db.chatSession
    .findUnique({ where: { id: sessionId }, select: { ownerHash: true } })
    .catch(() => null);
  if (!row || !row.ownerHash) return false;
  return sameOwnerHash(row.ownerHash, clientToken);
}

/** timing-safe comparison of the stored hash against the presented token */
function sameOwnerHash(storedHash: string, clientToken: string): boolean {
  const a = Buffer.from(storedHash, 'hex');
  const b = Buffer.from(ownerTokenHash(clientToken), 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
