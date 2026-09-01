// دیکود کردن اسلاگ‌های دسته‌بندی که به شکل percent-encoded ذخیره شده‌اند
// مثال: %d8%b1%d9%88%d8%b2%d8%a7%d9%86%d9%87 → روزانه
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function safeDecode(s: string): string | null {
  if (!s.includes('%')) return null
  try {
    const d = decodeURIComponent(s)
    return d !== s ? d : null
  } catch {
    return null
  }
}

async function main() {
  const cats = await db.category.findMany({ select: { id: true, slug: true } })
  const existingSlugs = new Set(cats.map((c) => c.slug))
  let changed = 0
  for (const c of cats) {
    const decoded = safeDecode(c.slug)
    if (!decoded) continue
    if (existingSlugs.has(decoded)) {
      console.log(`SKIP (collision): ${c.slug} → ${decoded}`)
      continue
    }
    await db.category.update({ where: { id: c.id }, data: { slug: decoded } })
    existingSlugs.delete(c.slug)
    existingSlugs.add(decoded)
    changed++
    console.log(`OK: ${c.slug} → ${decoded}`)
  }
  console.log(`\nchanged=${changed}/${cats.length}`)
}

main().finally(() => db.$disconnect())
