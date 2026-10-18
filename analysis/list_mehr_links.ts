// لیست کامل hrefهای mehrdad.ir + اسکن src عناصر media
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const db = new PrismaClient()

function extractAttrs(html: string | null, attr: string): string[] {
  if (!html) return []
  const out: string[] = []
  const re = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'gi')
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) out.push(m[1])
  return out
}

const isMehr = (u: string) => /^https?:\/\/(www\.)?mehrdad\.ir/i.test(u)

async function main() {
  const posts = await db.post.findMany({
    select: { id: true, slug: true, contentFa: true, contentEn: true, excerptFa: true, excerptEn: true },
  })
  const comments = await db.comment.findMany({ select: { id: true, content: true } })

  const hrefs = new Map<string, number>()
  const srcs = new Map<string, number>()

  const bump = (map: Map<string, number>, u: string) => map.set(u, (map.get(u) || 0) + 1)

  for (const p of posts) {
    for (const f of [p.contentFa, p.contentEn, p.excerptFa, p.excerptEn]) {
      for (const h of extractAttrs(f, 'href')) if (isMehr(h)) bump(hrefs, h)
      for (const s of extractAttrs(f, 'src')) if (isMehr(s)) bump(srcs, s)
      // video/source/iframe هم با src گرفته می‌شوند
    }
  }
  for (const c of comments) {
    for (const h of extractAttrs(c.content, 'href')) if (isMehr(h)) bump(hrefs, h)
    for (const s of extractAttrs(c.content, 'src')) if (isMehr(s)) bump(srcs, s)
  }

  const hrefList = [...hrefs.keys()].sort()
  const srcList = [...srcs.keys()].sort()
  writeFileSync('analysis/mehrdad_hrefs.json', JSON.stringify({ hrefs: Object.fromEntries(hrefs), srcs: Object.fromEntries(srcs) }, null, 2))
  console.log(`unique mehrdad.ir hrefs: ${hrefList.length}`)
  for (const h of hrefList) console.log(`  [${hrefs.get(h)}] ${h}`)
  console.log(`\nunique mehrdad.ir srcs: ${srcList.length}`)
  for (const s of srcList) console.log(`  [${srcs.get(s)}] ${s}`)
}

main().finally(() => db.$disconnect())
