#!/usr/bin/env node
/**
 * Post-build wrapper — the single entry point after `next build`:
 *
 * 1. inject the build-time hash CSP <meta> into every prerendered page
 *    (scripts/inject-csp.mjs — required on ALL platforms)
 * 2. copy static assets into the standalone output (SELF-HOSTED builds
 *    only — Vercel packages its own output and has no .next/standalone,
 *    so this step must never run there)
 */
import { execSync } from 'node:child_process';

execSync('node scripts/inject-csp.mjs', { stdio: 'inherit' });

// 3. Content Studio bootstrap on Vercel (Task 55, incident 2026-10-08):
//    the deployed Prisma client is generated from schema.postgres.prisma and
//    previously lacked the studio models, AND the runtime DDL used the SQLite
//    "DATETIME" type which does not exist in Postgres — the first studio
//    request could never create its tables, so the owner saw an empty studio
//    (۰ نمونه). This bootstrap creates the tables during the build through
//    the freshly generated client (Postgres/Supabase on Vercel), and the
//    portable runtime DDL stays as the fallback. DDL is dialect-portable:
//    TEXT/INTEGER/TIMESTAMP are valid in Postgres AND SQLite. Best-effort —
//    it must NEVER fail the build.
if (process.env.VERCEL && process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const bootstrap = new PrismaClient({ log: ['error'] });
    const ddl = [
      `CREATE TABLE IF NOT EXISTS "ContentSample" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "reelId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "account" TEXT NOT NULL,
        "styleTag" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "note" TEXT NOT NULL,
        "likes" TEXT NOT NULL,
        "hashtags" TEXT NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ContentSample.reelId_key" ON "ContentSample"("reelId")`,
      `CREATE TABLE IF NOT EXISTS "ContentIdea" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sampleId" TEXT NOT NULL,
        "idx" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "hook" TEXT NOT NULL,
        "script" TEXT NOT NULL,
        "videoPrompt" TEXT NOT NULL,
        "caption" TEXT NOT NULL,
        "hashtags" TEXT NOT NULL DEFAULT '[]',
        "status" TEXT NOT NULL DEFAULT 'idea',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ContentIdea.sampleId_idx_key" ON "ContentIdea"("sampleId", "idx")`,
      `CREATE TABLE IF NOT EXISTS "ContentVideo" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "ideaId" TEXT NOT NULL,
        "providerTaskId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'generating',
        "url" TEXT,
        "coverUrl" TEXT,
        "error" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS "ContentVideo.ideaId_createdAt_idx" ON "ContentVideo"("ideaId", "createdAt")`,
      `CREATE TABLE IF NOT EXISTS "HashtagBank" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "tag" TEXT NOT NULL,
        "lang" TEXT NOT NULL DEFAULT 'fa',
        "category" TEXT NOT NULL DEFAULT 'general'
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "HashtagBank.tag_key" ON "HashtagBank"("tag")`,
    ];
    for (const sql of ddl) {
      await bootstrap.$executeRawUnsafe(sql);
    }
    console.log('[postbuild] studio tables verified on the production DB (Task 55 bootstrap)');
    await bootstrap.$disconnect();
  } catch (e) {
    console.warn('[postbuild] studio bootstrap skipped:', String(e).slice(0, 200));
  }
} else if (process.env.VERCEL) {
  console.warn('[postbuild] VERCEL without DATABASE_URL — studio bootstrap skipped');
}

if (!process.env.VERCEL) {
  execSync('cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/', { stdio: 'inherit' });
  console.log('[postbuild] standalone assets copied (self-hosted output)');
} else {
  console.log('[postbuild] VERCEL detected — skipped standalone packaging');
}
