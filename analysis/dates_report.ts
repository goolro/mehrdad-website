// گزارش تاریخ‌های فعلی پست‌ها و دیدگاه‌ها
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const posts = await db.post.findMany({
    select: { id: true, slug: true, wpId: true, date: true, modified: true, source: true },
    orderBy: { date: 'desc' },
  })
  const comments = await db.comment.findMany({
    select: { id: true, postId: true, wpId: true, date: true },
    orderBy: { date: 'desc' },
  })

  console.log(`=== POSTS: ${posts.length} ===`)
  for (const p of posts) {
    console.log(`${p.date.toISOString()}  (mod: ${p.modified.toISOString()})  src=${p.source}  wpId=${p.wpId ?? '-'}  ${p.slug.slice(0, 60)}`)
  }

  console.log(`\n=== COMMENTS: ${comments.length} ===`)
  const postMap = new Map(posts.map((p) => [p.id, p]))
  for (const c of comments) {
    const post = postMap.get(c.postId)
    console.log(`${c.date.toISOString()}  wpId=${c.wpId ?? '-'}  post=${post?.slug.slice(0, 40) ?? '?'}`)
  }

  // محدوده کلی
  const dates = posts.map((p) => p.date.getTime())
  console.log(`\nmin=${new Date(Math.min(...dates)).toISOString()}  max=${new Date(Math.max(...dates)).toISOString()}`)
}

main().finally(() => db.$disconnect())
