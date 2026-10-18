// بازنویسی همه لینک‌های mehrdad.ir داخل محتوا به مسیرهای داخلی سایت جدید
// - لینک پست‌ها → #blog/<slug>
// - صفحه‌ها (contact/invest/about/team) → #contact / #about / #home
// - شورت‌لینک‌ها → لینک کوتاه خودِ پست مبدأ (یا پست مالک)
// - فایل‌ها → /uploads/wp/... (دانلود محلی)
// - وب‌استوری‌ها → #blog ، موارد خاص با تطبیق فازی
// استفاده: bun analysis/rewrite_links.ts --apply   (بدون فلگ = فقط گزارش)
import { PrismaClient } from '@prisma/client'
import { readFileSync, writeFileSync, copyFileSync } from 'fs'

const db = new PrismaClient()
const APPLY = process.argv.includes('--apply')
const MARKER = 'content_links_internalized_v1'

const RAILWAY_FALLBACK = '#blog/iran-railway-technology-startup' // فایل پی‌دی‌اف ریلی روی مبدأ صفر بایتی است
const MARKETING_MM = '#blog/welcome-to-marketing-mastermind-your-gateway-to-the-future-of-marketing-startup-2'

function stripDomain(u: string): string {
  return u.replace(/^https?:\/\/(www\.)?mehrdad\.ir/i, '').replace(/^\/+/, '').replace(/\/$/, '').toLowerCase()
}

async function main() {
  const marker = await db.siteSetting.findUnique({ where: { key: MARKER } })
  if (marker && !APPLY) console.log('NOTE: قبلاً اعمال شده (marker موجود است) — فقط گزارش\n')

  const posts = await db.post.findMany({ select: { id: true, slug: true, titleEn: true } })
  const slugByLower = new Map<string, string>()
  for (const p of posts) slugByLower.set(p.slug.toLowerCase(), p.slug)

  const map = new Map<string, string>() // href دقیق (مقدار attribute) → مقصد جدید

  // ۱) فایل‌ها → مسیر محلی
  const fileMap = JSON.parse(readFileSync('analysis/file_map.json', 'utf8')) as Array<{ old: string; local: string; bytes: number }>
  for (const f of fileMap) {
    if (f.bytes === 0) map.set(f.old, RAILWAY_FALLBACK) // فایل مرده مبدأ
    else map.set(f.old, f.local)
  }

  // ۲) شورت‌لینک‌ها: مالک = پستی که به‌عنوان SELF-LINK یا URL تنها در انتهای خودش دارد
  const shortRe = /^https:\/\/mehrdad\.ir\/[0-9a-z]{4}$/i
  const allPosts = await db.post.findMany({ select: { id: true, slug: true, contentFa: true, contentEn: true } })
  const shortOwner = new Map<string, string>() // code url → full db slug
  for (const p of allPosts) {
    for (const field of [p.contentFa, p.contentEn]) {
      if (!field) continue
      for (const m of field.matchAll(/https:\/\/mehrdad\.ir\/[0-9a-z]{4}/gi)) {
        const url = m[0]
        if (shortOwner.has(url)) continue // اولین مالک (SELF-LINK ها اول پیدا نمی‌شوند — پایین اولویت‌بندی می‌کنیم)
        shortOwner.set(url, p.slug)
      }
    }
  }
  // اولویت: پستی که «لینک کوتاه/Short Link» کنارش است
  const selfOwner = new Map<string, string>()
  for (const p of allPosts) {
    for (const field of [p.contentFa, p.contentEn]) {
      if (!field) continue
      for (const m of field.matchAll(/https:\/\/mehrdad\.ir\/[0-9a-z]{4}/gi)) {
        const url = m[0]
        if (selfOwner.has(url)) continue
        const after = field.slice(m.index, m.index + 300)
        const before = field.slice(Math.max(0, m.index - 200), m.index)
        if (/لینک کوتاه|Short Link/i.test(before) || /لینک کوتاه|Short Link/i.test(after.slice(0, 80))) {
          selfOwner.set(url, p.slug)
        }
      }
    }
  }
  for (const [url, owner] of selfOwner) shortOwner.set(url, owner)
  for (const [url, owner] of shortOwner) map.set(url, `#blog/${owner}`)

  // ۳) صفحه‌ها و ریشه
  map.set('https://mehrdad.ir', '#home')
  map.set('https://mehrdad.ir/', '#home')
  for (const pg of ['contact', 'contact/', 'invest', 'invest/']) map.set(`https://mehrdad.ir/${pg}`, '#contact')
  for (const pg of ['about-mehrdad', 'about-us-1/', 'our-team/', 'team/']) map.set(`https://mehrdad.ir/${pg}`, '#about')
  map.set('https://mehrdad.ir/tj-header-builder/%d9%87%d8%af%d8%b1-%d8%ae%d8%a7%d9%86%d9%87-04-%d8%b1%d9%88%d8%b4%d9%86/logo-secondary/', '#home')

  // ۴) وب‌استوری‌ها → لیست بلاگ
  const raw = JSON.parse(readFileSync('analysis/mehrdad_hrefs.json', 'utf8')) as { hrefs: Record<string, number> }
  for (const u of Object.keys(raw.hrefs)) {
    if (/mehrdad\.ir\/web-stories\//i.test(u)) map.set(u, '#blog')
  }

  // ۵) پست‌های تطبیق‌یافته با اسلاگ DB
  for (const u of Object.keys(raw.hrefs)) {
    if (map.has(u)) continue
    const m = /^https:\/\/mehrdad\.ir\/(.+?)\/?$/i.exec(u)
    if (!m) continue
    const path = stripDomain(u)
    if (/^(web-stories|wp-content|tj-header-builder)/.test(path)) continue
    if (shortRe.test(u)) continue
    const dbSlug = slugByLower.get(path)
    if (dbSlug) { map.set(u, `#blog/${dbSlug}`); continue }
    // موارد خاص بی‌تطبیق
    if (/^w-online/.test(path)) map.set(u, '#blog')
    else if (/^%d9%be%d8%b1%d9%88%da%98%d9%87-%d8%a8%d9%87%d9%86%d9%88%d8%b4/.test(path)) map.set(u, '#projects')
    else if (/^marketing-mastermind$/i.test(path)) map.set(u, MARKETING_MM)
    else if (path.startsWith('%d8%a8%d8%b1%d8%af%d8%b2%d8%a7%d8%b1%db%8c-')) {
      // تایپوی بردزاری→برگزاری
      const fixed = path.replace('%d8%a8%d8%b1%d8%af%d8%b2%d8%a7%d8%b1%db%8c', '%d8%a8%d8%b1%da%af%d8%b2%d8%a7%d8%b1%db%8c')
      const dbSlug2 = slugByLower.get(fixed)
      map.set(u, dbSlug2 ? `#blog/${dbSlug2}` : '#blog')
    } else {
      map.set(u, '#blog')
      console.log('UNKNOWN → #blog:', u.slice(0, 100))
    }
  }

  // srcهای ویدیو (با ?_=N) را هم از روی فایل‌ها بساز
  const srcs = Object.keys((JSON.parse(readFileSync('analysis/mehrdad_hrefs.json', 'utf8')) as { srcs: Record<string, number> }).srcs)
  for (const s of srcs) {
    const base = s.split('?')[0]
    const local = fileMap.find((f) => f.old === base && f.bytes > 0)
    map.set(s, local ? local.local : RAILWAY_FALLBACK)
  }

  console.log(`mapping entries: ${map.size}`)

  // ── اعمال روی محتوا ──
  let touchedPosts = 0, touchedComments = 0, totalRepl = 0
  const report: Array<{ slug: string; changes: Array<[string, string]> }> = []

  function rewrite(html: string | null, slug: string, collect: boolean): { html: string | null; n: number; changes?: Array<[string, string]> } {
    if (!html) return { html, n: 0 }
    let out = html
    let n = 0
    const changes: Array<[string, string]> = []

    // ۰) حذف بلوک‌های بی‌مصرف «Short Link» (لینک کوتاه خودِ پست — در سایت جدید معنا ندارد)
    const cruft1 = /<p[^>]*>\s*Short Link[^<]*(?:<br\s*\/?>)?\s*<a[^>]*href="https:\/\/mehrdad\.ir\/[0-9a-z]{4}"[^>]*>\s*(?:<strong>)?\s*https:\/\/mehrdad\.ir\/[0-9a-z]{4}\s*(?:<\/strong>)?\s*<\/a>\s*<\/p>/gi
    const cruft2 = /<(?:p|h[1-6])[^>]*>\s*<a[^>]*href="https:\/\/mehrdad\.ir\/[0-9a-z]{4}"[^>]*>\s*https:\/\/mehrdad\.ir\/[0-9a-z]{4}\s*<\/a>\s*<\/(?:p|h[1-6])>/gi
    for (const re of [cruft1, cruft2]) {
      out = out.replace(re, () => { n++; return '' })
    }
    for (const [oldU, newU] of map) {
      for (const attr of ['href', 'src']) {
        for (const q of ['"', "'"]) {
          const needle = `${attr}=${q}${oldU}${q}`
          if (!out.includes(needle)) continue
          const repl = `${attr}=${q}${newU}${q}`
          out = out.split(needle).join(repl)
          n++
          if (collect && changes.length < 200) changes.push([oldU.slice(0, 90), newU.slice(0, 60)])
        }
      }
    }
    // ۲) حذف متن خام شورت‌لینک‌های باقی‌مانده (خودارجاع؛ بعد از بازنویسی href ها فقط متن اند)
    const bareRe = /https:\/\/mehrdad\.ir\/[0-9a-z]{4}(?![0-9a-z%-])/g
    const bare = out.match(bareRe)
    if (bare?.length) {
      out = out.replace(bareRe, '')
      n += bare.length
    }
    // حذف target/rel از لینک‌های داخلی
    out = out.replace(/<a\s[^>]*>/gi, (tag) => {
      if (!/href="#/.test(tag)) return tag
      const t = tag.replace(/\starget="[^"]*"/gi, '').replace(/\srel="[^"]*"/gi, '')
      return t
    })
    return { html: out === html ? html : out, n, changes }
  }

  if (APPLY && !marker) {
    const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)
    copyFileSync('db/custom.db', `db/custom.backup-${ts}.db`)
    console.log(`backup: db/custom.backup-${ts}.db`)
  }

  for (const p of await db.post.findMany()) {
    let any = 0
    const data: Record<string, string | null> = {}
    for (const f of ['contentFa', 'contentEn', 'excerptFa', 'excerptEn'] as const) {
      const r = rewrite((p as unknown as Record<string, string | null>)[f], p.slug, report.length < 500)
      if (r.html !== (p as unknown as Record<string, string | null>)[f]) data[f] = r.html
      any += r.n
      if (r.changes?.length && report.length < 500) report.push({ slug: p.slug, changes: r.changes })
    }
    if (any > 0) {
      touchedPosts++
      totalRepl += any
      if (APPLY) await db.post.update({ where: { id: p.id }, data })
    }
  }

  for (const c of await db.comment.findMany()) {
    const r = rewrite(c.content, `comment:${c.id}`, false)
    if (r.html !== c.content) {
      touchedComments++
      totalRepl += r.n
      if (APPLY) await db.comment.update({ where: { id: c.id }, data: { content: r.html! } })
    }
  }

  console.log(`posts touched: ${touchedPosts} | comments touched: ${touchedComments} | replacements: ${totalRepl}`)
  writeFileSync('analysis/link_rewrite_report.json', JSON.stringify(report, null, 2))

  // صحت‌سنجی: هیچ mehrdad.ir باقی مانده؟
  const left = await db.post.findMany({ select: { slug: true, contentFa: true, contentEn: true } })
  let remaining = 0
  for (const p of left) for (const f of [p.contentFa, p.contentEn]) {
    if (!f) continue
    for (const m of f.matchAll(/(href|src)="(https?:\/\/[^"]*mehrdad\.ir[^"]*)"/gi)) {
      remaining++
      if (remaining <= 10) console.log('REMAINING:', JSON.stringify(p.slug.slice(0, 40)), '→', JSON.stringify(m[2].slice(0, 90)))
    }
    for (const m of f.matchAll(/https?:\/\/[^\s"'<>]*mehrdad\.ir[^\s"'<>]*/gi)) {
      remaining++
      if (remaining <= 20) console.log('REMAINING:', JSON.stringify(p.slug.slice(0, 40)), '→bare→', JSON.stringify(m[0].slice(0, 90)))
    }
  }
  console.log(`remaining mehrdad.ir refs in posts: ${remaining}`)

  if (APPLY && !marker) await db.siteSetting.create({ data: { key: MARKER, value: new Date().toISOString() } })
  console.log(APPLY ? 'APPLIED ✓' : 'DRY-RUN (برای اعمال: --apply)')
}

main().finally(() => db.$disconnect())
