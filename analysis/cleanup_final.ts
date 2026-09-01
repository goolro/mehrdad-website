// پاکسازی نهایی موارد باقی‌مانده لینک‌ها و HTML های خرابه مهاجرت
import { PrismaClient } from '@prisma/client'
import { existsSync } from 'fs'

const db = new PrismaClient()
const APPLY = process.argv.includes('--apply')
const safe = (s: string) => s.replace(/%/g, '٪')

async function main() {
  const posts = await db.post.findMany()
  let touched = 0

  for (const p of posts) {
    const data: Record<string, string | null> = {}
    for (const f of ['contentFa', 'contentEn', 'excerptFa', 'excerptEn'] as const) {
      const orig = (p as unknown as Record<string, string | null>)[f]
      if (!orig) continue
      let h = orig
      const log: string[] = []

      // ۱) متن لینک‌های ویدیو: <a href="/uploads/...mp4">https://mehrdad.ir/...mp4</a> → دانلود ویدیو
      h = h.replace(/<a([^>]*)href="((?:\/uploads\/wp\/)?[^"]*\.mp4)"[^>]*>\s*https:\/\/mehrdad\.ir\/[^<]*<\/a>/gi,
        (_m, pre: string, local: string) => { log.push('video-link-text'); return `<a${pre}href="${local}">دانلود ویدیو</a>` })

      // ۲) شورت‌کد pdf-embedder با فایل سالم → لینک دانلود محلی
      h = h.replace(/\[pdf-embedder url=&#8221;https:\/\/mehrdad\.ir\/wp-content\/uploads\/(\d{4})\/(\d{2})\/([^&#]+)&#8221; title=&#8221;([^]*)&#8221;\]/gi,
        (_m, y: string, mo: string, name: string, title: string) => {
          log.push(`pdf-embedder:${name}`)
          return `<p><a href="/uploads/wp/${y}/${mo}/${name}">📄 دانلود PDF: ${title}</a></p>`
        })
      // فایل مرده (ساخت-نوآورانه-جامع-ترافیکی) → CTA تماس
      h = h.replace(/\[pdf-embedder url=&#8221;https:\/\/mehrdad\.ir\/wp-content\/uploads\/[^&#]*&#8221; title=&#8221;([^]*)&#8221;\]/gi,
        (_m, title: string) => { log.push(`pdf-dead:${title}`); return `<p><a href="#contact">📄 برای دریافت فایل «${title}» با ما تماس بگیرید</a></p>` })

      // ۳) پاراگراف Short Link باقی‌مانده (Marketing-Mastermind)
      h = h.replace(/<p[^>]*>\s*Short Link:?[^<]*<a[^>]*>\s*(?:<strong>)?\s*https:\/\/mehrdad\.ir\/[^<]*(?:<\/strong>)?\s*<\/a>\s*<\/p>/gi,
        () => { log.push('shortlink-p'); return '' })

      // ۴) تگ تصویر خرابه: src="..." خام در متن
      h = h.replace(/src="(\/media\/[^"]+)"/g, (m, path: string) => {
        // اگر داخل یک <img> واقعی نیست (قبلش <img نداریم)، تبدیل به img کن
        const before = h.slice(Math.max(0, (h.indexOf(m)) - 60), h.indexOf(m))
        if (/<img[^>]*$/.test(before)) return m
        const local = 'public' + decodeURIComponent(path)
        if (existsSync(local)) {
          log.push(`stray-img:${path}`)
          return `<img src="${path}" alt="تصویر" loading="lazy" />`
        }
        log.push(`stray-img-removed:${path}`)
        return ''
      })

      // ۵) شورت‌کدهای شکسته html5_video → حذف
      h = h.replace(/<p[^>]*>\s*\[?[a-z]*tml5_video id=\d+\]\s*<\/p>/gi, () => { log.push('html5-video-cruft'); return '' })

      if (h !== orig) {
        data[f] = h
        touched++
        console.log(`${safe(p.slug.slice(0, 34))} [${f}] → ${[...new Set(log)].join(', ')}`)
      }
    }
    if (APPLY && Object.keys(data).length) {
      await db.post.update({ where: { id: p.id }, data })
    }
  }

  console.log(APPLY ? `APPLIED — posts updated: ${touched}` : `DRY-RUN — would update: ${touched} field instances`)

  // صحت‌سنجی نهایی
  const left = await db.post.findMany({ select: { slug: true, contentFa: true, contentEn: true } })
  let rem = 0
  for (const p of left) for (const f of [p.contentFa, p.contentEn]) {
    if (!f) continue
    let i = f.indexOf('mehrdad.ir/wp-content')
    while (i !== -1) { rem++; console.log('LEFT wp-content:', safe(p.slug.slice(0, 30))); i = f.indexOf('mehrdad.ir/wp-content', i + 1) }
    i = f.indexOf('href="https://mehrdad.ir')
    while (i !== -1) { rem++; console.log('LEFT href:', safe(p.slug.slice(0, 30))); i = f.indexOf('href="https://mehrdad.ir', i + 1) }
    i = f.indexOf('[pdf-embedder')
    while (i !== -1) { rem++; console.log('LEFT shortcode:', safe(p.slug.slice(0, 30))); i = f.indexOf('[pdf-embedder', i + 1) }
  }
  console.log(`remaining problems: ${rem}`)
}

main().finally(() => db.$disconnect())
