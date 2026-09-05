import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

/**
 * Dual-mode database client:
 *
 * - TURSO_DATABASE_URL set  → remote libsql/Turso cloud DB (production on
 *   shared hosting: stateless app, no native query-engine child process,
 *   no DB file on the host — the lightest possible footprint for LVE limits)
 * - otherwise               → local SQLite file via DATABASE_URL (development
 *   and `next build` prerendering, exactly as before)
 *
 * The Prisma schema stays `provider = "sqlite"` in both modes.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// query logging is OPT-IN only (PRISMA_DEBUG=1) — it can leak request
// payloads (contact/chat inserts) into stdout/dev logs, so it must never
// run by default, even in development. Production logs only error/warn.
const log: ('query' | 'error' | 'warn')[] =
  process.env.PRISMA_DEBUG === '1' ? ['query', 'error', 'warn'] : ['error', 'warn']

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL

  if (tursoUrl) {
    const authToken = process.env.TURSO_AUTH_TOKEN
    if (!authToken) {
      // fail fast with an actionable message instead of an opaque 500 later
      throw new Error(
        'TURSO_DATABASE_URL is set but TURSO_AUTH_TOKEN is missing — add both in the hosting environment.'
      )
    }
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken })
    return new PrismaClient({ adapter, log })
  }

  return new PrismaClient({ log })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
