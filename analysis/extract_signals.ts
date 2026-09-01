/**
 * استخراج سیگنال‌های سنی برای هر پست:
 *  1) مسیر آپلود تصاویر داخل متن (uploads/YYYY/MM) از محتوای خام وردپرس
 *  2) مسیر آپلود کاور (با reverse-map از image_map.json)
 *  3) سال‌های ذکرشده در متن (شمسی + میلادی) و کلیدواژه‌های نسل فناوری
 *  4) اولین دیدگاه واقعی (از DB) = سقف سخت برای تاریخ پست
 * خروجی: analysis/signals.json
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const db = new PrismaClient()

// تبدیل ارقام فارسی/عربی به لاتین
const faDigits = '۰۱۲۳۴۵۶۷۸۹'
const arDigits = '٠١٢٣٤٥٦٧٨٩'
function toLatinDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (d) => {
    const i = faDigits.indexOf(d)
    return String(i >= 0 ? i : arDigits.indexOf(d))
  })
}

// کلیدواژه‌هایی که حضورشان، حداقل سال انتشار را لو می‌دهد
const KEYWORDS: { re: RegExp; minYear: number; label: string }[] = [
  { re: /chatgpt|چت\s?جی\s?پی\s?تی|chat\s?gpt/i, minYear: 2022, label: 'ChatGPT (Nov 2022)' },
  { re: /gpt-?4|جی\s?پی\s?تی\s?۴|جی\s?پی\s?تی\s?4/i, minYear: 2023, label: 'GPT-4 (2023)' },
  { re: /کلاب\s?هاوس|کلابهاوس|clubhouse|clubdeck/i, minYear: 2020, label: 'Clubhouse (2020-21)' },
  { re: /کرونا|کووید|corona|covid/i, minYear: 2020, label: 'COVID (2020)' },
  { re: /متاورس|metaverse/i, minYear: 2021, label: 'Metaverse (2021)' },
  { re: /\bnft\b|ان\s?اف\s?تی/i, minYear: 2021, label: 'NFT (2021)' },
  { re: /می\D{0,3}کرونز|elon\s?musk|ایلان\s?ماسک/i, minYear: 2018, label: 'Musk era' },
]

function extractSignalsFromHtml(html: string) {
  const uploads = [...html.matchAll(/uploads\/(\d{4})\/(\d{2})/g)].map((m) => `${m[1]}/${m[2]}`)
  const latin = toLatinDigits(html.replace(/<[^>]+>/g, ' '))
  const years = new Set<string>()
  for (const m of latin.matchAll(/\b(20[01]\d|202[0-6])\b/g)) years.add(m[1])
  for (const m of latin.matchAll(/\b(13[5-9]\d|14[0-4]\d)\b/g)) {
    const j = parseInt(m[1], 10) + 621
    if (j >= 2011 && j <= 2026) years.add(String(j))
  }
  const kws = KEYWORDS.filter((k) => k.re.test(html)).map((k) => ({ label: k.label, minYear: k.minYear }))
  return { uploads: [...new Set(uploads)].sort(), years: [...years].sort(), keywords: kws }
}

async function main() {
  const raw = JSON.parse(fs.readFileSync('analysis/migration_data.json', 'utf8'))
  const imageMap: Record<string, string> = JSON.parse(fs.readFileSync('analysis/image_map.json', 'utf8'))
  // reverse: local /media/x.png → original URL (دارای uploads/YYYY/MM)
  const revMap: Record<string, string> = {}
  for (const [orig, local] of Object.entries(imageMap)) revMap[local] = orig

  const posts = await db.post.findMany({
    select: { id: true, slug: true, wpId: true, date: true, modified: true, cover: true },
  })
  const comments = await db.comment.findMany({ select: { postId: true, date: true }, orderBy: { date: 'asc' } })
  const firstComment = new Map<string, Date>()
  for (const c of comments) {
    if (!firstComment.has(c.postId)) firstComment.set(c.postId, c.date)
  }

  const out: Record<string, unknown> = {}
  for (const p of posts) {
    const rawPost = raw.posts.find((x: { wp_id: number }) => x.wp_id === p.wpId)
    const html: string = rawPost?.content_fa_html ?? ''
    const s = extractSignalsFromHtml(html)

    // کاور: مسیر محلی → URL اصلی وردپرس → پوشه آپلود
    let coverUpload: string | undefined
    if (p.cover) {
      const orig = revMap[p.cover]
      const m = orig?.match(/uploads\/(\d{4})\/(\d{2})/)
      if (m) coverUpload = `${m[1]}/${m[2]}`
    }

    const fc = firstComment.get(p.id)
    out[String(p.wpId)] = {
      slug: p.slug,
      title: (rawPost?.title_fa ?? '').slice(0, 70),
      currentDate: p.date.toISOString(),
      currentModified: p.modified.toISOString(),
      contentUploads: s.uploads,
      earliestContentUpload: s.uploads[0] ?? null,
      coverUpload: coverUpload ?? null,
      yearsMentioned: s.years,
      keywords: s.keywords.map((k) => k.label),
      keywordMinYear: s.keywords.length ? Math.max(...s.keywords.map((k) => k.minYear)) : null,
      firstComment: fc ? fc.toISOString() : null,
    }
  }
  fs.writeFileSync('analysis/signals.json', JSON.stringify(out, null, 1))

  // خلاصه پوشش سیگنال‌ها
  const all = Object.values(out) as Record<string, unknown>[]
  const cov = (pred: (x: Record<string, unknown>) => boolean) => all.filter(pred).length
  console.log(`posts: ${all.length}`)
  console.log(`contentUpload: ${cov((x) => !!x.earliestContentUpload)}`)
  console.log(`coverUpload:   ${cov((x) => !!x.coverUpload)}`)
  console.log(`firstComment:  ${cov((x) => !!x.firstComment)}`)
  console.log(`yearMention:   ${cov((x) => (x.yearsMentioned as string[]).length > 0)}`)
  console.log(`keyword:       ${cov((x) => (x.keywords as string[]).length > 0)}`)
}

main().finally(() => db.$disconnect())
