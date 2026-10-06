/**
 * Agency panel persistence (Task 54) — SERVER ONLY.
 *
 * Conversation storage for the private /agency panel, following the repo's
 * established runtime-table bootstrap pattern (ai-articles.ts / brief.ts):
 * raw CREATE TABLE IF NOT EXISTS through Prisma, cached per process — so
 * production Turso gets the tables on first use WITHOUT a schema push, and
 * the sandbox sqlite DB gets them the same way. Nothing here touches the
 * public tables.
 *
 * Schema:
 *   AgencySession  — one conversation (single agent or a team run)
 *   AgencyMessage  — one turn; agentId/agentName identify which specialist
 *                    produced an assistant turn (team runs interleave them)
 */
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';

export type AgencySessionKind = 'agent' | 'team';

export interface AgencySessionRow {
  id: string;
  title: string;
  kind: AgencySessionKind;
  meta: string | null; // JSON blob: runbook slug, task, agent id…
  createdAt: string;
  updatedAt: string;
}

export interface AgencyMessageRow {
  id: string;
  sessionId: string;
  agentId: string | null;
  agentName: string | null;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AgencySessionSummary extends AgencySessionRow {
  messageCount: number;
  lastActivity: string;
  preview: string;
}

let ensured: Promise<void> | null = null;

export function ensureAgencyTables(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AgencySession" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "kind" TEXT NOT NULL DEFAULT 'agent',
          "meta" TEXT,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL,
          CONSTRAINT "AgencySession_pkey" PRIMARY KEY ("id")
        )
      `);
      await db
        .$executeRawUnsafe(
          `CREATE INDEX IF NOT EXISTS "AgencySession_updatedAt_idx" ON "AgencySession"("updatedAt")`
        )
        .catch(() => {});
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AgencyMessage" (
          "id" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "agentId" TEXT,
          "agentName" TEXT,
          "role" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "createdAt" TEXT NOT NULL,
          CONSTRAINT "AgencyMessage_pkey" PRIMARY KEY ("id")
        )
      `);
      await db
        .$executeRawUnsafe(
          `CREATE INDEX IF NOT EXISTS "AgencyMessage_session_createdAt_idx" ON "AgencyMessage"("sessionId", "createdAt")`
        )
        .catch(() => {});
    })().catch((e) => {
      // allow a retry on the next request instead of caching the failure
      ensured = null;
      throw e;
    });
  }
  return ensured;
}

const now = () => new Date().toISOString();

export async function createAgencySession(input: {
  title: string;
  kind: AgencySessionKind;
  meta?: unknown;
}): Promise<AgencySessionRow> {
  await ensureAgencyTables();
  const row: AgencySessionRow = {
    id: randomUUID(),
    title: input.title,
    kind: input.kind,
    meta: input.meta === undefined ? null : JSON.stringify(input.meta),
    createdAt: now(),
    updatedAt: now(),
  };
  await db.$executeRawUnsafe(
    `INSERT INTO "AgencySession" ("id","title","kind","meta","createdAt","updatedAt") VALUES (?,?,?,?,?,?)`,
    row.id,
    row.title,
    row.kind,
    row.meta,
    row.createdAt,
    row.updatedAt
  );
  return row;
}

export async function getAgencySession(id: string): Promise<AgencySessionRow | null> {
  await ensureAgencyTables();
  const rows = await db.$queryRawUnsafe<AgencySessionRow[]>(
    `SELECT "id","title","kind","meta","createdAt","updatedAt" FROM "AgencySession" WHERE "id" = ? LIMIT 1`,
    id
  );
  const row = rows[0];
  if (!row) return null;
  return { ...row, kind: row.kind as AgencySessionKind };
}

export async function touchAgencySession(id: string): Promise<void> {
  await ensureAgencyTables();
  await db
    .$executeRawUnsafe(`UPDATE "AgencySession" SET "updatedAt" = ? WHERE "id" = ?`, now(), id)
    .catch(() => {});
}

export async function renameAgencySession(id: string, title: string): Promise<void> {
  await ensureAgencyTables();
  await db.$executeRawUnsafe(`UPDATE "AgencySession" SET "title" = ?, "updatedAt" = ? WHERE "id" = ?`, title, now(), id);
}

export async function deleteAgencySession(id: string): Promise<void> {
  await ensureAgencyTables();
  await db.$executeRawUnsafe(`DELETE FROM "AgencyMessage" WHERE "sessionId" = ?`, id);
  await db.$executeRawUnsafe(`DELETE FROM "AgencySession" WHERE "id" = ?`, id);
}

export async function listAgencySessions(limit = 100): Promise<AgencySessionSummary[]> {
  await ensureAgencyTables();
  const rows = await db.$queryRawUnsafe<
    {
      id: string;
      title: string;
      kind: string;
      meta: string | null;
      createdAt: string;
      updatedAt: string;
      messageCount: number;
      lastActivity: string | null;
      preview: string | null;
    }[]
  >(
    `SELECT s."id", s."title", s."kind", s."meta", s."createdAt", s."updatedAt",
            (SELECT COUNT(*) FROM "AgencyMessage" m WHERE m."sessionId" = s."id") AS "messageCount",
            (SELECT MAX(m."createdAt") FROM "AgencyMessage" m WHERE m."sessionId" = s."id") AS "lastActivity",
            (SELECT m."content" FROM "AgencyMessage" m WHERE m."sessionId" = s."id" ORDER BY m."createdAt" DESC LIMIT 1) AS "preview"
       FROM "AgencySession" s
       ORDER BY s."updatedAt" DESC
       LIMIT ?`,
    limit
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    kind: r.kind as AgencySessionKind,
    meta: r.meta,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    messageCount: Number(r.messageCount ?? 0),
    lastActivity: r.lastActivity ?? r.updatedAt,
    preview: (r.preview ?? '').slice(0, 140),
  }));
}

export async function listAgencyMessages(sessionId: string, limit = 300): Promise<AgencyMessageRow[]> {
  await ensureAgencyTables();
  // newest first for the take, then re-ascending in JS — same trick the
  // public chatbot uses to keep the tail of long threads
  const rows = await db.$queryRawUnsafe<AgencyMessageRow[]>(
    `SELECT "id","sessionId","agentId","agentName","role","content","createdAt"
       FROM "AgencyMessage" WHERE "sessionId" = ?
       ORDER BY "createdAt" DESC LIMIT ?`,
    sessionId,
    limit
  );
  return rows.reverse();
}

export async function addAgencyMessage(input: {
  sessionId: string;
  agentId?: string | null;
  agentName?: string | null;
  role: 'user' | 'assistant';
  content: string;
}): Promise<AgencyMessageRow> {
  await ensureAgencyTables();
  const row: AgencyMessageRow = {
    id: randomUUID(),
    sessionId: input.sessionId,
    agentId: input.agentId ?? null,
    agentName: input.agentName ?? null,
    role: input.role,
    content: input.content,
    createdAt: now(),
  };
  await db.$executeRawUnsafe(
    `INSERT INTO "AgencyMessage" ("id","sessionId","agentId","agentName","role","content","createdAt") VALUES (?,?,?,?,?,?,?)`,
    row.id,
    row.sessionId,
    row.agentId,
    row.agentName,
    row.role,
    row.content,
    row.createdAt
  );
  await touchAgencySession(input.sessionId);
  return row;
}
