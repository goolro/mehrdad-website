/**
 * Rebuild the content database from the analysis artifacts.
 *
 * The sandbox/local `db/custom.db` was found empty (data lives in the
 * remote production DB), so this script replays the documented content
 * pipeline (docs/CONTENT_MIGRATION.md) from the original sources:
 *
 *   - analysis/migration_data.json  (posts/categories/services/projects/site)
 *   - analysis/translations.json    (wp_id → {title_en, content_en})
 *   - analysis/wp_comments.json     (17 migrated WP comments)
 *
 * Rules honored (CONTENT_MIGRATION.md):
 *   - post 7995 imported as draft (published=false)
 *   - migrated WP comments approved=true
 *   - ids are new cuids; wpId preserved (301 redirect mapping depends on it)
 *   - implicit m-n Post↔Category rebuilt via connect
 *
 * Run:  bun analysis/import_content.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient({ log: ['error'] })

interface MigPost {
  wp_id: number
  slug: string
  title_fa: string
  excerpt_fa: string
  content_fa_html: string
  date: string
  modified: string
  cover: string | null
  categories: string[]
}
interface MigData {
  site: Record<string, string>
  categories: { wp_id: number; slug: string; name_fa: string; count: number; name_en: string }[]
  posts: MigPost[]
  services: { slug: string; title_fa: string; order: number; desc_fa: string; icon: string; title_en: string; desc_en: string }[]
  projects: { slug: string; order: number; title_fa: string; summary_fa: string; cover: string | null; title_en: string; summary_en: string }[]
}
type Translations = Record<string, { title_en?: string; content_en?: string }>
interface WpComment {
  id: number
  post: number
  parent: number
  author_name: string
  author_url?: string
  date_gmt?: string
  date?: string
  content: { rendered: string }
}

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const deriveExcerptEn = (html: string | undefined) => {
  if (!html) return null
  const t = stripHtml(html)
  return t.length > 220 ? t.slice(0, 220).trimEnd() + '…' : t || null
}
const parseDate = (s: string | undefined) => {
  if (!s) return new Date()
  return new Date(s.endsWith('Z') ? s : s + 'Z')
}

async function main() {
  const mig: MigData = JSON.parse(await Bun.file('analysis/migration_data.json').text())
  const tr: Translations = JSON.parse(await Bun.file('analysis/translations.json').text())
  const wpComments: WpComment[] = JSON.parse(await Bun.file('analysis/wp_comments.json').text())

  // ── 0. wipe (FK-safe) — idempotent re-runs ──
  await db.postTag.deleteMany()
  await db.comment.deleteMany()
  await db.post.deleteMany()
  await db.tag.deleteMany()
  await db.category.deleteMany()
  await db.siteSetting.deleteMany()
  await db.service.deleteMany()
  await db.project.deleteMany()
  await db.contactMessage.deleteMany()
  await db.chatMessage.deleteMany()
  await db.chatSession.deleteMany()
  await db.kbChunk.deleteMany()
  await db.adminUser.deleteMany()
  await db.aiJob.deleteMany()

  // ── 1. site settings ──
  const settings = { ...mig.site, theme: 'default' }
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.create({ data: { key, value: String(value) } })
  }
  console.log(`✓ SiteSetting: ${Object.keys(settings).length}`)

  // ── 2. categories ──
  const catByWpId = new Map<number, string>()
  for (const c of mig.categories) {
    const created = await db.category.create({
      data: { slug: c.slug, nameEn: c.name_en, nameFa: c.name_fa, wpId: c.wp_id },
    })
    catByWpId.set(c.wp_id, created.id)
  }
  console.log(`✓ Category: ${mig.categories.length}`)

  // ── 3. services & projects ──
  for (const s of mig.services) {
    await db.service.create({
      data: {
        slug: s.slug, titleEn: s.title_en, titleFa: s.title_fa,
        descEn: s.desc_en, descFa: s.desc_fa, icon: s.icon, order: s.order,
      },
    })
  }
  for (const p of mig.projects) {
    await db.project.create({
      data: {
        slug: p.slug, titleEn: p.title_en, titleFa: p.title_fa,
        summaryEn: p.summary_en, summaryFa: p.summary_fa, cover: p.cover ?? null, order: p.order,
      },
    })
  }
  console.log(`✓ Service: ${mig.services.length} | Project: ${mig.projects.length}`)

  // ── 4. posts (bilingual, categories connected by wp_id) ──
  let noTranslation = 0
  for (const p of mig.posts) {
    const t = tr[String(p.wp_id)]
    if (!t) noTranslation++
    await db.post.create({
      data: {
        wpId: p.wp_id,
        slug: p.slug,
        titleFa: p.title_fa || null,
        titleEn: t?.title_en || null,
        excerptFa: p.excerpt_fa || null,
        excerptEn: deriveExcerptEn(t?.content_en),
        contentFa: p.content_fa_html || null,
        contentEn: t?.content_en || null,
        cover: p.cover || null,
        date: new Date(p.date),
        modified: new Date(p.modified),
        // CONTENT_MIGRATION.md: post 7995 = draft until owner decision
        published: p.wp_id !== 7995,
        source: 'wordpress',
        ...(p.categories.length
          ? {
              categories: {
                connect: p.categories
                  .map((c) => catByWpId.get(Number(c)))
                  .filter((id): id is string => !!id)
                  .map((id) => ({ id })),
              },
            }
          : {}),
      },
    })
  }
  console.log(`✓ Post: ${mig.posts.length}${noTranslation ? ` (${noTranslation} without translation)` : ''}`)

  // ── 5. comments (migrated WP comments → approved) ──
  const postByWpId = new Map(
    (await db.post.findMany({ select: { id: true, wpId: true } }))
      .filter((p): p is { id: string; wpId: number } => p.wpId != null)
      .map((p) => [p.wpId, p.id])
  )
  let commentsWritten = 0, commentsSkipped = 0
  for (const c of wpComments) {
    const postId = postByWpId.get(Number(c.post))
    if (!postId) { commentsSkipped++; continue }
    await db.comment.create({
      data: {
        wpId: c.id,
        postId,
        parentWpId: c.parent ? Number(c.parent) : null,
        author: c.author_name || 'ناشناس',
        content: c.content?.rendered || '',
        date: parseDate(c.date_gmt || c.date),
        approved: true, // migrated comments are public-by-origin
      },
    })
    commentsWritten++
  }
  console.log(`✓ Comment: ${commentsWritten} (skipped ${commentsSkipped} without matching post)`)

  // ── 6. verify ──
  const counts = {
    settings: await db.siteSetting.count(),
    categories: await db.category.count(),
    posts: await db.post.count(),
    published: await db.post.count({ where: { published: true } }),
    services: await db.service.count(),
    projects: await db.project.count(),
    comments: await db.comment.count(),
  }
  console.log('── verification ──')
  console.log(JSON.stringify(counts))
  if (counts.posts !== mig.posts.length) throw new Error('post count mismatch!')
  const spot = await db.post.findFirst({ where: { published: true }, orderBy: { date: 'desc' } })
  console.log('spot check (latest):', spot?.slug, '|', (spot?.titleFa ?? '').slice(0, 50))
  console.log('🎉 import complete — next: bun analysis/seed_tags.ts --apply')
}

main()
  .catch((e) => { console.error('import failed:', e); process.exit(1) })
  .finally(() => db.$disconnect())
