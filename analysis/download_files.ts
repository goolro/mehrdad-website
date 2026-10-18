// دانلود فایل‌های wp-content از سایت قدیمی (با Referer برای دور زدن هات‌لینک‌پروتکت)
// و ذخیره در public/uploads/wp/<year>/<month>/<name>
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs'
import { dirname } from 'path'

const files: string[] = (JSON.parse(readFileSync('analysis/link_scan2.json', 'utf8')) as { files: string[] }).files

function encodeUrl(u: string): string {
  // مسیر را با حفظ / انکود می‌کنیم (بخش query را جدا نگه می‌داریم)
  const [base, query] = u.split('?')
  const enc = base.split('/').map((seg) => {
    if (!seg) return seg
    if (/^%[0-9a-f]{2}/i.test(seg) || !/[^\x00-\x7F]/.test(seg)) return seg // از قبل انکود یا ASCII
    return encodeURIComponent(seg)
  }).join('/')
  return query ? `${enc}?${query}` : enc
}

function localPathFor(u: string): string {
  const clean = u.split('?')[0]
  const m = /wp-content\/uploads\/(\d{4})\/(\d{2})\/(.+)$/.exec(clean)
  if (!m) throw new Error(`bad path: ${u}`)
  let name = m[3]
  try { name = decodeURIComponent(name) } catch { /* همان خام */ }
  name = name.replace(/[\x00-\x1f]/g, '').trim()
  return `public/uploads/wp/${m[1]}/${m[2]}/${name}`
}

async function head(url: string): Promise<{ size: number; ok: boolean }> {
  const r = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', Referer: 'https://mehrdad.ir/' }, redirect: 'follow' })
  return { size: Number(r.headers.get('content-length') || 0), ok: r.ok }
}

async function download(url: string, dest: string): Promise<void> {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', Referer: 'https://mehrdad.ir/' }, redirect: 'follow' })
  if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`)
  mkdirSync(dirname(dest), { recursive: true })
  const buf = Buffer.from(await r.arrayBuffer())
  await Bun.write(dest, buf)
}

const results: Array<{ old: string; local: string; bytes: number }> = []
for (const f of files) {
  const url = encodeUrl(f)
  const dest = localPathFor(f)
  const publicUrl = '/' + dest.replace(/^public\//, '')
  try {
    if (existsSync(dest)) {
      const s = statSync(dest).size
      console.log(`EXISTS ${s}B ${dest}`)
      results.push({ old: f, local: publicUrl, bytes: s })
      continue
    }
    const h = await head(url)
    await download(url, dest)
    const s = statSync(dest).size
    console.log(`OK ${h.size ? `(${(h.size / 1e6).toFixed(1)}MB expected) ` : ''}${(s / 1e6).toFixed(1)}MB ${dest}`)
    results.push({ old: f, local: publicUrl, bytes: s })
  } catch (e) {
    console.log(`FAIL ${f} → ${(e as Error).message}`)
  }
  await new Promise((r) => setTimeout(r, 800))
}
writeFileSync('analysis/file_map.json', JSON.stringify(results, null, 2))
console.log(`\ndone: ${results.length}/${files.length}`)
