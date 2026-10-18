/**
 * تخصیص تاریخ نهایی هر پست بر اساس تحلیل شواهد
 *
 * لنگرها (به ترتیب اعتماد):
 *   U = ماه آپلود تصویر (کاور یا داخل متن)  → انتشار ≈ همان ماه + 0..60 روز
 *   F = اولین اسنپ‌شات Wayback               → فقط سقف سخت (پست باید قبل از آن باشد)
 *   C = اولین دیدگاه واقعی                    → سقف سخت (پست قبل از دیدگاه)
 *   Y = بیشینه سال ذکرشده/کلیدواژه           → کف تقریبی
 *   L = برآورد سال LLM
 *   I = درون‌یابی بین همسایه‌های wpId         → آخرین راه
 *
 * قاعده نهایی: date = anchor + jitter، سپس clamp با سقف‌ها، سپس کف نرم آپلود.
 * seed ثابت → plan تکرارپذیر. بدون --apply فقط گزارش می‌دهد.
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const db = new PrismaClient()

// ── PRNG با seed ثابت (تکرارپذیری) ──
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(20260218)
const randInt = (a: number, b: number) => Math.floor(rnd() * (b - a + 1)) + a
const DAY = 86_400_000

function ymToDate(ym: string): Date {
  const [y, m] = ym.split('/').map(Number)
  return new Date(Date.UTC(y, m - 1, 1))
}
function wbToDate(ts: string): Date {
  const y = +ts.slice(0, 4), mo = +ts.slice(4, 6), d = +ts.slice(6, 8), h = +ts.slice(8, 10), mi = +ts.slice(10, 12)
  return new Date(Date.UTC(y, mo - 1, d, h, mi))
}

// ماه‌های پرتکرار (خوشه آپلود گروهی) → پراکندگی بیشتر
function spreadDaysFor(ym: string, clusterCount: number): number {
  return clusterCount >= 6 ? randInt(0, 150) : randInt(1, 60)
}

async function main() {
  const apply = process.argv.includes('--apply')
  const marker = await db.siteSetting.findUnique({ where: { key: 'evidence_dating_applied_v1' } })
  if (marker && apply && !process.argv.includes('--force')) {
    console.log('⛔ قبلاً اعمال شده. برای اجرای دوباره --force بزن.')
    process.exit(0)
  }

  const signals = JSON.parse(fs.readFileSync('analysis/signals.json', 'utf8'))
  const wb = JSON.parse(fs.readFileSync('analysis/wayback_first.json', 'utf8'))
  const llm = fs.existsSync('analysis/llm_eras.json') ? JSON.parse(fs.readFileSync('analysis/llm_eras.json', 'utf8')) : {}

  const posts = await db.post.findMany({
    select: { id: true, slug: true, wpId: true, date: true },
    orderBy: { wpId: 'asc' },
  })
  const comments = await db.comment.findMany({ select: { postId: true, date: true }, orderBy: { date: 'asc' } })
  const firstComment = new Map<string, Date>()
  for (const c of comments) if (!firstComment.has(c.postId)) firstComment.set(c.postId, c.date)

  // شمارش خوشه‌های آپلود (ماه‌هایی که چند پست دارند → پخش)
  const clusterCount = new Map<string, number>()
  for (const p of posts) {
    const s = signals[String(p.wpId)] ?? {}
    const u = (s.coverUpload as string) || (s.earliestContentUpload as string)
    if (u) clusterCount.set(u, (clusterCount.get(u) ?? 0) + 1)
  }

  type Plan = { wpId: number; slug: string; title: string; oldDate: Date; newDate: Date | null; anchor: string; evidence: string }
  const plans: Plan[] = []
  const titles = JSON.parse(fs.readFileSync('analysis/signals.json', 'utf8'))

  for (const p of posts) {
    const s: Record<string, unknown> = signals[String(p.wpId)] ?? {}
    const F = wb[String(p.wpId)]?.ts ? wbToDate(wb[String(p.wpId)].ts) : null
    const uYm = (s.coverUpload as string) || (s.earliestContentUpload as string) || null
    const U = uYm ? ymToDate(uYm) : null
    const C = firstComment.get(p.id) ?? null
    const years = ((s.yearsMentioned as string[]) ?? []).map(Number)
    const kwY = s.keywordMinYear as number | null
    const Ymax = years.length || kwY ? Math.max(...years, kwY ?? 0) : null
    const L = llm[String(p.wpId)]?.year as number | undefined

    let base: Date | null = null
    let anchor = 'interpolate'
    const ev: string[] = []

    if (U) {
      base = new Date(U.getTime() + spreadDaysFor(uYm!, clusterCount.get(uYm!) ?? 1) * DAY)
      anchor = 'upload'
      ev.push(`آپلود تصویر ${uYm}`)
    } else if (F) {
      base = new Date(F.getTime() - randInt(14, 90) * DAY)
      anchor = 'wayback'
      ev.push(`اولین آرشیو ${F.toISOString().slice(0, 10)}`)
    } else if (C) {
      base = new Date(C.getTime() - randInt(15, 90) * DAY)
      anchor = 'comment'
      ev.push(`اولین دیدگاه ${C.toISOString().slice(0, 10)}`)
    } else if (Ymax) {
      base = new Date(Date.UTC(Ymax, 0, 1) + randInt(0, 240) * DAY)
      anchor = 'year-mention'
      ev.push(`سال ذکرشده ${Ymax}`)
    } else if (L) {
      base = new Date(Date.UTC(L, randInt(0, 11), randInt(1, 28), randInt(6, 22), randInt(0, 59)))
      anchor = `llm(${llm[String(p.wpId)].confidence})`
      ev.push(`LLM: ${L} — ${llm[String(p.wpId)].reason ?? ''}`)
    }

    if (base) {
      // سقف‌های سخت
      if (C) {
        const cap = new Date(C.getTime() - randInt(1, 20) * DAY)
        if (base > cap) { base = cap; ev.push('سقف: قبل از اولین دیدگاه') }
      }
      if (F) {
        const cap = new Date(F.getTime() - randInt(5, 90) * DAY)
        if (base > cap) { base = cap; ev.push('سقف: قبل از اولین آرشیو') }
      }
      // کف نرم آپلود (اگر با سقف‌ها تناقض ندارد)
      if (U) {
        const floor = new Date(U.getTime() - 2 * DAY)
        if (base < floor && (!C || floor <= C) && (!F || floor <= F)) { base = floor; ev.push('کف: آپلود تصویر') }
      }
      // کف و سقف کلی
      base = new Date(Math.max(base.getTime(), Date.UTC(2016, 0, 1)))
      base = new Date(Math.min(base.getTime(), Date.UTC(2026, 1, 1)))
      // ساعت طبیعی روز
      base = new Date(base)
      base.setUTCHours(randInt(6, 23), randInt(0, 59), randInt(0, 59), 0)
    }

    plans.push({
      wpId: p.wpId,
      slug: p.slug,
      title: (titles[String(p.wpId)]?.title as string) ?? p.slug.slice(0, 40),
      oldDate: p.date,
      newDate: base,
      anchor,
      evidence: ev.join(' | '),
    })
  }

  // ── درون‌یابی برای بی‌لنگرها (بر اساس wpId بین همسایه‌های تاریخ‌دار) ──
  const byWp = plans.slice().sort((a, b) => a.wpId - b.wpId)
  for (let i = 0; i < byWp.length; i++) {
    const cur = byWp[i]
    if (cur.newDate) continue
    let prev: Plan | null = null
    let next: Plan | null = null
    for (let j = i - 1; j >= 0; j--) if (byWp[j].newDate) { prev = byWp[j]; break }
    for (let j = i + 1; j < byWp.length; j++) if (byWp[j].newDate) { next = byWp[j]; break }
    if (prev && next) {
      const ratio = (cur.wpId - prev.wpId) / (next.wpId - prev.wpId)
      cur.newDate = new Date(prev.newDate!.getTime() + ratio * (next.newDate!.getTime() - prev.newDate!.getTime()))
      cur.anchor = 'interpolate'
      cur.evidence = `درون‌یابی بین wpId ${prev.wpId} و ${next.wpId}`
    } else if (prev) {
      cur.newDate = new Date(prev.newDate!.getTime() + randInt(20, 90) * DAY)
      cur.anchor = 'interpolate'
      cur.evidence = `بعد از wpId ${prev.wpId}`
    } else if (next) {
      cur.newDate = new Date(next.newDate!.getTime() - randInt(20, 90) * DAY)
      cur.anchor = 'interpolate'
      cur.evidence = `قبل از wpId ${next.wpId}`
    }
    if (cur.newDate) cur.newDate.setUTCHours(randInt(6, 23), randInt(0, 59), randInt(0, 59), 0)
  }

  // ── یکتاسازی دقیقه‌ها (نبود دو پست در یک لحظه) ──
  const seen = new Set<string>()
  for (const pl of plans) {
    if (!pl.newDate) continue
    let t = pl.newDate.getTime()
    while (seen.has(String(t))) t += randInt(3, 25) * 60_000
    seen.add(String(t))
    pl.newDate = new Date(t)
  }

  // ── گزارش ──
  const hist: Record<string, number> = {}
  for (const pl of plans) {
    const y = pl.newDate!.toISOString().slice(0, 4)
    hist[y] = (hist[y] ?? 0) + 1
  }
  console.log('توزیع سالانه جدید:', Object.entries(hist).sort().map(([y, n]) => `${y}:${n}`).join('  '))
  console.log('')
  const rows = plans
    .slice()
    .sort((a, b) => (a.newDate! < b.newDate! ? -1 : 1))
    .map(
      (pl) =>
        `${pl.newDate!.toISOString().slice(0, 10)}  (${pl.oldDate.toISOString().slice(0, 10)} ← قدیم)  wpId=${pl.wpId}  [${pl.anchor}]  ${pl.title.slice(0, 44)}`
    )
  console.log(rows.join('\n'))

  fs.writeFileSync(
    'analysis/dating_plan.json',
    JSON.stringify(
      plans.map((pl) => ({
        wpId: pl.wpId,
        slug: pl.slug,
        oldDate: pl.oldDate.toISOString(),
        newDate: pl.newDate!.toISOString(),
        anchor: pl.anchor,
        evidence: pl.evidence,
      })),
      null,
      1
    )
  )
  console.log('\n✔ plan ذخیره شد: analysis/dating_plan.json')

  // ── اعمال ──
  if (apply) {
    const modifiedCap = Date.UTC(2026, 1, 18)
    for (const pl of plans) {
      const mod = new Date(Math.min(pl.newDate!.getTime() + randInt(2, 21) * DAY, modifiedCap))
      await db.post.update({
        where: { id: (await db.post.findUnique({ where: { wpId: pl.wpId }, select: { id: true } }))!.id },
        data: { date: pl.newDate!, modified: mod },
      })
    }
    await db.siteSetting.upsert({
      where: { key: 'evidence_dating_applied_v1' },
      create: { key: 'evidence_dating_applied_v1', value: new Date().toISOString() },
      update: { value: new Date().toISOString() },
    })
    console.log(`✅ اعمال شد روی ${plans.length} پست (دیدگاه‌ها دست‌نخورده — تاریخ‌های واقعی‌اند)`)
  }
}

main()
  .then(() => db.$disconnect())
  .catch((e) => { console.error(e); process.exit(1) })
