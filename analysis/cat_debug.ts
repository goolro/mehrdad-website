// دیباگ دسته‌بندی‌ها و رابطه پست-دسته
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const cats = await db.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { nameEn: 'asc' },
  })
  console.log('=== CATEGORIES ===')
  for (const c of cats) {
    console.log(`slug=${c.slug}  posts=${c._count.posts}`)
  }

  // چند پست نمونه با دسته‌هایشان
  const posts = await db.post.findMany({
    take: 8,
    orderBy: { date: 'desc' },
    select: { slug: true, published: true, categories: { select: { slug: true } } },
  })
  console.log('\n=== SAMPLE POSTS ===')
  for (const p of posts) {
    console.log(`published=${p.published}  cats=[${p.categories.map((c) => c.slug).join(',') || 'NONE'}]  ${p.slug.slice(0, 50)}`)
  }

  const noCat = await db.post.count({ where: { categories: { none: {} } } })
  const published = await db.post.count({ where: { published: true } })
  const publishedNoCat = await db.post.count({ where: { published: true, categories: { none: {} } } })
  console.log(`\ntotal posts=${await db.post.count()}  published=${published}  noCategory=${noCat}  publishedNoCategory=${publishedNoCat}`)
}

main().finally(() => db.$disconnect())
