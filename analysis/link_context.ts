// تحلیل بافت شورت‌لینک‌ها + نقشه اسلاگ پست‌ها + لیست فایل‌ها
import { PrismaClient } from '@prisma/client'
import { readFileSync, writeFileSync } from 'fs'

const db = new PrismaClient()

async function main() {
  const posts = await db.post.findMany({
    select: { id: true, slug: true, wpId: true, contentFa: true, contentEn: true },
  })
  const dbSlugs = new Set(posts.map((p) => p.slug.toLowerCase()))

  const raw = JSON.parse(readFileSync('analysis/mehrdad_hrefs.json', 'utf8')) as { hrefs: Record<string, number> }
  const all = Object.keys(raw.hrefs)

  const shortRe = /^https:\/\/mehrdad\.ir\/[0-9a-z]{4}$/i
  const shorts = all.filter((u) => shortRe.test(u))
  console.log(`shortlink codes: ${shorts.length}`)

  // برای هر پست: شورت‌لینک‌های داخلش و اینکه آیا بافت «لینک کوتاه/Short Link» دارد
  const shortOwner = new Map<string, string[]>() // code -> [post slugs]
  const shortContext: string[] = []
  for (const p of posts) {
    for (const [field, name] of [[p.contentFa, 'fa'], [p.contentEn, 'en']] as const) {
      if (!field) continue
      for (const code of shorts) {
        const url = code // shorts شامل URL کامل است
        let idx = field.indexOf(url)
        while (idx !== -1) {
          const ctx = field.slice(Math.max(0, idx - 200), idx + 60).replace(/<[^>]*>/g, ' ')
          const isSelf = /لینک کوتاه|Short Link|shortlink/i.test(ctx)
          if (!shortOwner.has(code)) shortOwner.set(code, [])
          const arr = shortOwner.get(code)!
          const label = `${p.slug.slice(0, 40)}[${name}]${isSelf ? ' SELF-LINK' : ''}`
          if (!arr.includes(label)) arr.push(label)
          if (!isSelf) shortContext.push(`code=${code} in=${p.slug.slice(0, 40)} ctx=…${ctx.slice(-140).trim()}`)
          idx = field.indexOf(url, idx + 1)
        }
      }
    }
  }

  console.log('\n=== SHORTLINK OWNERS ===')
  for (const [code, owners] of [...shortOwner.entries()].sort()) {
    console.log(`${code} (${owners.length}): ${owners.join(' | ')}`)
  }
  console.log(`\nnon-self contexts: ${shortContext.length}`)
  for (const c of shortContext.slice(0, 25)) console.log('  ', c)

  // کدام URLهای پست در DB هستند؟
  const postRe = /^https:\/\/mehrdad\.ir\/(%[0-9a-f]{2}.*|[a-z0-9-]+)\/?$/i
  const matched: string[] = []
  const unmatched: string[] = []
  for (const u of all) {
    const m = postRe.exec(u)
    if (!m) continue
    const path = m[1].toLowerCase().replace(/\/$/, '')
    if (/^(web-stories|wp-content|tj-header-builder|contact|invest|about|about-us-1|our-team|team|about-mehrdad)$/.test(path)) continue
    if (shortRe.test(u)) continue
    if (dbSlugs.has(path)) matched.push(u)
    else unmatched.push(u)
  }
  console.log(`\n=== POST URLS: matched=${matched.length} unmatched=${unmatched.length}`)
  for (const u of unmatched) console.log('  UNMATCHED:', u)

  // فایل‌ها
  const files = all.filter((u) => /wp-content\/uploads\//.test(u))
  console.log(`\n=== FILES (${files.length}) ===`)
  for (const f of files) console.log('  ', f)
  writeFileSync('analysis/link_scan2.json', JSON.stringify({ shortOwner: Object.fromEntries(shortOwner), matched, unmatched, files }, null, 2))
}

main().finally(() => db.$disconnect())
