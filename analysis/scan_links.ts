// اسکن و طبقه‌بندی همه لینک‌های داخل محتوای پست‌ها و دیدگاه‌ها
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function extractHrefs(html: string | null): string[] {
  if (!html) return []
  const out: string[] = []
  const re = /href\s*=\s*["']([^"']+)["']/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) out.push(m[1])
  return out
}

function classify(href: string): string {
  const h = href.trim()
  if (/^https?:\/\/(www\.)?mehrdad\.ir/i.test(h)) {
    const path = h.replace(/^https?:\/\/(www\.)?mehrdad\.ir/i, '')
    if (/^\/\w{3,8}$/.test(path) && !path.includes('.')) return 'wp-shortlink' // مثل /8z2g
    if (/\.(pdf|zip|docx?|xlsx?|png|jpe?g|gif|webp|mp3|mp4)(\?|$)/i.test(path)) return 'mehrdad-file'
    if (/^\/?(\?p=\d+|\/\?p=\d+)/.test(path)) return 'wp-shortlink-p'
    if (/\/(contact|about|services|projects|blog|home)(\/|$)/i.test(path)) return 'mehrdad-page'
    return 'mehrdad-post-or-other'
  }
  if (/^https?:\/\//i.test(h)) return 'external'
  if (/^#/.test(h)) return 'anchor'
  if (/\.(pdf|zip|docx?|xlsx?|png|jpe?g|gif|webp)(\?|$)/i.test(h)) return 'relative-file'
  if (/^\/|^\.\.?\//.test(h)) return 'relative-path'
  return 'other'
}

async function main() {
  const posts = await db.post.findMany({
    select: { id: true, slug: true, contentFa: true, contentEn: true, excerptFa: true, excerptEn: true },
  })
  const comments = await db.comment.findMany({ select: { id: true, author: true, content: true } })

  const byType = new Map<string, { count: number; examples: Set<string> }>()
  const perPost = new Map<string, Set<string>>()

  function add(href: string, ctx: string) {
    const t = classify(href)
    if (!byType.has(t)) byType.set(t, { count: 0, examples: new Set() })
    const e = byType.get(t)!
    e.count++
    if (e.examples.size < 12) e.examples.add(href.slice(0, 120))
    if (!perPost.has(ctx)) perPost.set(ctx, new Set())
    perPost.get(ctx)!.add(t)
  }

  for (const p of posts) {
    for (const field of [p.contentFa, p.contentEn, p.excerptFa, p.excerptEn]) {
      for (const href of extractHrefs(field)) add(href, p.slug)
    }
  }
  for (const c of comments) {
    for (const href of extractHrefs(c.content)) add(href, `comment:${c.author}`)
  }

  console.log('=== LINK TYPES ===')
  for (const [t, e] of [...byType.entries()].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`\n[${t}] count=${e.count}`)
    for (const ex of e.examples) console.log('   ', ex)
  }

  console.log('\n=== POSTS WITH mehrdad.ir LINKS ===')
  for (const [slug, types] of perPost) {
    const bad = [...types].filter((t) => t.startsWith('mehrdad') || t === 'wp-shortlink' || t === 'wp-shortlink-p')
    if (bad.length) console.log(`${slug.slice(0, 60)} → ${[...types].join(',')}`)
  }
}

main().finally(() => db.$disconnect())
