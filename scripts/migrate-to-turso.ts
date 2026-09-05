/**
 * One-time data migration: local SQLite (file:/…/db/custom.db) → Turso cloud DB.
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… \
 *     bun run scripts/migrate-to-turso.ts --yes
 *
 * - Requires --yes (destructive: wipes rows currently in the REMOTE DB first)
 * - Preserves all ids (cuid) so URLs / foreign references stay stable
 * - Implicit m-n (Post ↔ Category) is rebuilt via Prisma `connect`
 * - Verifies row counts on both sides at the end
 */
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

async function main() {
  if (!process.argv.includes('--yes')) {
    console.error('Refusing to run without --yes (this wipes the remote DB rows first).')
    process.exit(1)
  }
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) {
    console.error('Missing TURSO_DATABASE_URL / TURSO_AUTH_TOKEN environment variables.')
    process.exit(1)
  }

  const local = new PrismaClient({ log: ['error'] })
  const remote = new PrismaClient({
    adapter: new PrismaLibSQL({ url, authToken }),
    log: ['error'],
  })

  try {
    // ── 1. read everything from local ──────────────────────────────────
    // NOTE: implicit m-n (Category ↔ Post) is read via its physical join
    // table (_CategoryToPost, columns A=categoryId, B=postId) — plain scalar
    // reads avoid Prisma's implicit-m-n include quirks entirely.
    const [settings, categories, tags, posts, postTagLinks, comments, services,
      projects, contacts, sessions, messages, kbChunks, admins, aiJobs] = await Promise.all([
      local.siteSetting.findMany(),
      local.category.findMany(),
      local.tag.findMany(),
      local.post.findMany(),
      local.postTag.findMany(), // explicit m-n (Post ↔ Tag)
      local.comment.findMany({ orderBy: { createdAt: 'asc' } }),
      local.service.findMany(),
      local.project.findMany(),
      local.contactMessage.findMany(),
      local.chatSession.findMany(),
      local.chatMessage.findMany(),
      local.kbChunk.findMany(),
      local.adminUser.findMany(),
      local.aiJob.findMany(),
    ])
    // implicit m-n join table read (columns A=categoryId, B=postId)
    const catPostRaw = await local.$queryRawUnsafe<Record<string, unknown>[]>(`SELECT * FROM "_CategoryToPost"`)
    const catPostLinks = catPostRaw.map(r => ({ categoryId: String(r.A), postId: String(r.B) }))

    console.log('source counts:',
      { settings: settings.length, categories: categories.length, tags: tags.length,
        posts: posts.length, comments: comments.length, services: services.length,
        projects: projects.length, contacts: contacts.length, sessions: sessions.length,
        messages: messages.length, kbChunks: kbChunks.length, admins: admins.length, aiJobs: aiJobs.length })

    // ── 2. wipe remote (FK-safe order) so the migration is idempotent ──
    await remote.chatMessage.deleteMany()
    await remote.chatSession.deleteMany()
    await remote.comment.deleteMany()
    await remote.post.deleteMany()
    await remote.tag.deleteMany()
    await remote.category.deleteMany()
    await remote.contactMessage.deleteMany()
    await remote.siteSetting.deleteMany()
    await remote.service.deleteMany()
    await remote.project.deleteMany()
    await remote.kbChunk.deleteMany()
    await remote.adminUser.deleteMany()
    await remote.aiJob.deleteMany()

    // ── 3. copy in dependency order ────────────────────────────────────
    for (const s of settings) await remote.siteSetting.create({ data: { key: s.key, value: s.value } })
    for (const c of categories) await remote.category.create({ data: c })
    for (const t of tags) await remote.tag.create({ data: t })
    for (const p of posts) {
      const categoryIds = catPostLinks.filter(l => l.postId === p.id).map(l => l.categoryId)
      const tagIds = postTagLinks.filter(l => l.postId === p.id).map(l => l.tagId)
      await remote.post.create({
        data: {
          ...p,
          ...(categoryIds.length ? { categories: { connect: categoryIds.map(id => ({ id })) } } : {}),
          // PostTag is an explicit junction model (no `id`) → create junction rows
          ...(tagIds.length ? { tags: { create: tagIds.map(tagId => ({ tagId })) } } : {}),
        },
      })
    }
    for (const c of comments) await remote.comment.create({ data: c })
    for (const s of services) await remote.service.create({ data: s })
    for (const p of projects) await remote.project.create({ data: p })
    for (const m of contacts) await remote.contactMessage.create({ data: m })
    for (const s of sessions) await remote.chatSession.create({ data: s })
    for (const m of messages) await remote.chatMessage.create({ data: m })
    for (const k of kbChunks) await remote.kbChunk.create({ data: k })
    for (const a of admins) await remote.adminUser.create({ data: a })
    for (const j of aiJobs) await remote.aiJob.create({ data: j })

    // ── 4. verify ──────────────────────────────────────────────────────
    const [rSettings, rCategories, rTags, rPosts, rComments, rServices, rProjects,
      rContacts, rSessions, rMessages, rKb, rAdmins, rJobs] = await Promise.all([
      remote.siteSetting.count(), remote.category.count(), remote.tag.count(),
      remote.post.count(), remote.comment.count(), remote.service.count(),
      remote.project.count(), remote.contactMessage.count(), remote.chatSession.count(),
      remote.chatMessage.count(), remote.kbChunk.count(), remote.adminUser.count(),
      remote.aiJob.count(),
    ])
    const expect = { settings: settings.length, categories: categories.length, tags: tags.length,
      posts: posts.length, comments: comments.length, services: services.length,
      projects: projects.length, contacts: contacts.length, sessions: sessions.length,
      messages: messages.length, kbChunks: kbChunks.length, admins: admins.length, aiJobs: aiJobs.length }
    const got = { settings: rSettings, categories: rCategories, tags: rTags, posts: rPosts,
      comments: rComments, services: rServices, projects: rProjects, contacts: rContacts,
      sessions: rSessions, messages: rMessages, kbChunks: rKb, admins: rAdmins, aiJobs: rJobs }

    const mismatches = Object.entries(expect).filter(([k, v]) => got[k as keyof typeof got] !== v)
    if (mismatches.length) {
      console.error('❌ MISMATCH after migration:', mismatches)
      process.exit(1)
    }
    console.log('✅ migration verified — remote counts match source:', got)

    const spot = await remote.post.findFirst({ where: { published: true }, orderBy: { date: 'desc' } })
    console.log('spot check (latest post):', spot?.slug, '|', (spot?.titleFa ?? spot?.titleEn ?? '').slice(0, 60))
  } finally {
    await local.$disconnect()
    await remote.$disconnect()
  }
}

main().catch((e) => {
  console.error('migration failed:', e)
  process.exit(1)
})
