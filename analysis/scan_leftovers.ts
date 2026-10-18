// اسکن نهایی: شورت‌کدها و ارجاع‌های خام wp-content بیرون از attribute ها
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const safe = (s: string) => s.replace(/%/g, '٪')

async function main() {
  const posts = await db.post.findMany({ select: { slug: true, contentFa: true, contentEn: true } })
  for (const p of posts) {
    for (const [f] of [[p.contentFa], [p.contentEn]] as const) {
      if (!f) continue
      for (const m of f.matchAll(/\[[a-z-]+[^\]]*\]/gi)) {
        if (/pdf|embed|video|gallery|caption|popup/i.test(m[0]))
          console.log('SHORTCODE in', safe(p.slug.slice(0, 32)), '::', safe(m[0].slice(0, 160)))
      }
      const re = /[^"'=\w]{0,40}wp-content\/uploads\/[^\s"'<>\\]+/g
      for (const m of f.matchAll(re)) {
        const u = m[0].replace(/^[^a-z0-9]+/i, '').replace(/^url=/, '')
        console.log('RAW-REF in', safe(p.slug.slice(0, 32)), '::', safe(u.slice(0, 130)))
      }
    }
  }
}

main().finally(() => db.$disconnect())
