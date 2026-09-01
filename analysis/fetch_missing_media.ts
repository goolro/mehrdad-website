// دانلود ۱۰ تصویر گمشده /media/ از سایت قدیمی (با Referer)
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { mkdirSync } from 'fs'

const missing = [
  '/media/ربات-Handle.jpg',
  '/media/ایران_سال_نو_فصل_بهار_شکوفه_های_زیبا_استارتاپ_تبلیغات_وب_سایت_مهرداد1.png',
  '/media/ایران_سال_نو_فصل_بهار_شکوفه_های_زیبا_استارتاپ_تبلیغات_وب_سایت_مهرداد.png',
  '/media/شاخص-2.jpg',
  '/media/روش-های-حمل-و-نقل.jpg',
  '/media/خانه_هوشمند_ساخته_می_شود_.png',
  '/media/هوشمند_و_اینترنت_اشیا.png',
  '/media/هوشمند_و_کودک_و_سگ_و_گربه.png',
  '/media/هوشمند_مدرن.png',
  '/media/هوشمند_سفارشی_خود_را_داشته_باشید_mehrdad.png',
]

const results: Array<{ path: string; ok: boolean; bytes: number }> = []
for (const p of missing) {
  const dest = 'public' + p
  const url = 'https://mehrdad.ir' + p.split('/').map(encodeURIComponent).join('/')
  try {
    if (existsSync(dest)) {
      results.push({ path: p, ok: true, bytes: statSync(dest).size })
      console.log('EXISTS', p)
      continue
    }
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', Referer: 'https://mehrdad.ir/' }, redirect: 'follow' })
    if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`)
    const buf = Buffer.from(await r.arrayBuffer())
    if (buf.length < 100) throw new Error(`too small: ${buf.length}`)
    mkdirSync(dest.slice(0, dest.lastIndexOf('/')), { recursive: true })
    await Bun.write(dest, buf)
    results.push({ path: p, ok: true, bytes: buf.length })
    console.log(`OK ${(buf.length / 1024).toFixed(0)}KB`, p)
  } catch (e) {
    results.push({ path: p, ok: false, bytes: 0 })
    console.log('FAIL', p, (e as Error).message)
  }
  await new Promise((r) => setTimeout(r, 700))
}
writeFileSync('analysis/missing_media_results.json', JSON.stringify(results, null, 2))
console.log(`done ${results.filter((r) => r.ok).length}/${results.length}`)
