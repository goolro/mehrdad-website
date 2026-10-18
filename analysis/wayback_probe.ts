/**
 * پروب Wayback Machine برای یافتن «اولین اسنپ‌شات» هر پست
 * روش: درخواست https://web.archive.org/web/20180101000000/<post-url>
 *  - اگر اسنپ‌شاتی وجود داشته باشد → ریدایرکت به نزدیک‌ترین اسنپ‌شات به 2018-01-01
 *    و timestamp داخل کد __wm.wombat("url","ts") ظاهر می‌شود
 *  - چون سایت بعد از ~2013 وجود داشته، نزدیک‌ترین اسنپ‌شات به 2018 = اولین اسنپ‌شاتِ ثبت‌شده
 *  - 404 = هیچ‌وقت آرشیو نشده
 * قابل resume: نتیجه‌ها incremental در analysis/wayback_first.json ذخیره می‌شود
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

const OUT = 'analysis/wayback_first.json'
const DOMAIN = 'https://mehrdad.ir/'
// نقطه لنگر: نزدیک‌ترین اسنپ‌شات به این لحظه = اولین اسنپ‌شات (سایت قبل از 2014 نبوده)
const ANCHOR = '20180101000000'

type Entry = { ts?: string; status: number; error?: string }

function load(): Record<string, Entry> {
  try { return JSON.parse(fs.readFileSync(OUT, 'utf8')) } catch { return {} }
}
const save = (d: Record<string, Entry>) => fs.writeFileSync(OUT, JSON.stringify(d, null, 1))

// timestamp صفحه آرشیوشده را از html استخراج کن (وِیژگی دوم wombat = ts صفحه)
function extractTs(html: string): string | undefined {
  const m = html.match(/__wm\.wombat\("[^"]*"\s*,\s*"(\d{14})"/)
  if (m) return m[1]
  const m2 = html.match(/"dat"\s*:\s*(\d{14})/)
  if (m2) return m2[1]
  const all = [...html.matchAll(/web\/(\d{14})/g)].map(x => x[1]).sort()
  return all[0]
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function main() {
  const data = JSON.parse(fs.readFileSync('analysis/migration_data.json', 'utf8'))
  const posts: { wp_id: number; slug: string }[] = data.posts
  const results = load()
  const zai = await ZAI.create()

  let done = 0, found = 0
  for (const p of posts) {
    const key = String(p.wp_id)
    if (results[key]?.status === 200) { done++; if (results[key].ts) found++; continue }

    const url = `https://web.archive.org/web/${ANCHOR}/${DOMAIN}${p.slug}/`
    let entry: Entry | null = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await zai.functions.invoke('page_reader', { url })
        const status = r?.data?.httpStatus ?? 0
        const html = r?.data?.html ?? ''
        if (status === 200) {
          entry = { status: 200, ts: extractTs(html) }
          break
        } else if (status === 404) {
          entry = { status: 404 }
          break
        } else {
          entry = { status, error: `http ${status}` }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        entry = { status: -1, error: msg.slice(0, 160) }
        // 422 از JINA معمولاً یعنی صفحه 404 آرشیو (no captures) — بپذیر
        if (msg.includes('404') || msg.includes('cannot') || msg.includes('not exist')) { entry = { status: 404 }; break }
      }
      await sleep(4000 * attempt)
    }
    results[key] = entry ?? { status: -1, error: 'unknown' }
    if (results[key].status === 200 && results[key].ts) found++
    done++
    save(results)
    console.log(`[${done}/${posts.length}] wpId=${key} ${p.slug.slice(0, 42)} → ${results[key].status} ts=${results[key].ts ?? '-'}`)
    await sleep(2500 + Math.floor(Math.random() * 2000))
  }
  console.log(`\n=== done: ${done}, with capture: ${found} ===`)
}

main().catch(e => { console.error('FATAL', e); process.exit(1) })
