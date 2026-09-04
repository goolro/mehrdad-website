import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // query logging is OPT-IN only (PRISMA_DEBUG=1) — it can leak request
    // payloads (contact/chat inserts) into stdout/dev logs, so it must never
    // run by default, even in development. Production logs only error/warn.
    log: process.env.PRISMA_DEBUG === '1' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
