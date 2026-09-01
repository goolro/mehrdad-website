// بررسی: چند src="/media/ داخل تگ img واقعی است؟ فایل‌ها موجودند؟
import { PrismaClient } from '@prisma/client'
import { existsSync } from 'fs'

const db = new PrismaClient()

async function main() {
  const posts = await db.post.findMany({ select: { slug: true, contentFa: true, contentEn: true } })
  let inImg = 0, stray = 0
  const missing = new Set<string>(), found = new Set<string>()
  for (const p of posts) for (const f of [p.contentFa, p.contentEn]) {
    if (!f) continue
    for (const m of f.matchAll(/src="(\/media\/[^"]+)"/g)) {
      const path = m[1]
      const before = f.slice(Math.max(0, (m.index ?? 0) - 200), m.index ?? 0)
      if (/<img[^>]*$/.test(before)) inImg++; else stray++
      const local = 'public' + decodeURIComponent(path)
      if (existsSync(local)) found.add(path)
      else missing.add(path)
    }
  }
  console.log(`inside real <img>: ${inImg} | stray: ${stray}`)
  console.log(`files exist: ${found.size} | missing: ${missing.size}`)
  for (const m of [...missing].slice(0, 20)) console.log('MISSING:', m)
}

main().finally(() => db.$disconnect())
