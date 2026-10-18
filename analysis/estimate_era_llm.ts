/**
 * برآورد era انتشار با LLM فقط برای پست‌هایی که هیچ سیگنال قطعی ندارند
 * (نه Wayback، نه آپلود تصویر، نه دیدگاه، نه سال در متن)
 * خروجی: analysis/llm_eras.json  →  { wpId: { year, confidence, reason } }
 */
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

async function main() {
  const signals = JSON.parse(fs.readFileSync('analysis/signals.json', 'utf8'))
  const wb = fs.existsSync('analysis/wayback_first.json')
    ? JSON.parse(fs.readFileSync('analysis/wayback_first.json', 'utf8'))
    : {}
  const raw = JSON.parse(fs.readFileSync('analysis/migration_data.json', 'utf8'))

  const gaps: { wpId: string; title: string; excerpt: string; content: string }[] = []
  for (const [wpId, s0] of Object.entries(signals as Record<string, Record<string, unknown>>)) {
    const s = s0 as Record<string, unknown>
    const hasWb = !!wb[wpId]?.ts
    const hasUpload = !!s.coverUpload || !!s.earliestContentUpload
    const hasComment = !!s.firstComment
    const years = (s.yearsMentioned as string[]) ?? []
    const kws = (s.keywords as string[]) ?? []
    if (hasWb || hasUpload || hasComment || years.length || kws.length) continue
    const rp = raw.posts.find((x: { wp_id: number }) => String(x.wp_id) === wpId)
    if (!rp) continue
    gaps.push({
      wpId,
      title: rp.title_fa ?? '',
      excerpt: (rp.excerpt_fa ?? '').slice(0, 300),
      content: rp.content_fa_html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').slice(0, 900),
    })
  }

  if (!gaps.length) { console.log('هیچ گپی نیست — LLM لازم نشد'); fs.writeFileSync('analysis/llm_eras.json', JSON.stringify({}, null, 1)); return }
  console.log(`پست‌های بی‌سیگنال برای LLM: ${gaps.map((g) => g.wpId).join(', ')}`)

  const zai = await ZAI.create()
  const prompt = `تو تحلیل‌گر محتوای فارسی هستی. برای هر مطلب وبلاگ زیر، سال «انتشار اولیه» را تخمین بزن.
نشانه‌ها: موضوعات، فناوری‌های اشاره‌شده، لحن، رخدادهای تاریخی. وبلاگ شخصی طراح/پژوهشگر ایرانی (استارتاپ، شهر هوشمند، هوش مصنوعی، ربات، سرمایه‌گذاری) است که بین ۲۰۱۹ تا ۲۰۲۵ فعال بوده.
فقط JSON برگردان بدون هیچ متن اضافه:
{"items":[{"wpId":"...","year":2021,"confidence":"low|medium|high","reason":"خیلی کوتاه"}]}

مطالب:
${gaps
    .map(
      (g, i) =>
        `--- مطلب ${i + 1} (wpId=${g.wpId}) ---
عنوان: ${g.title}
خلاصه: ${g.excerpt}
متن: ${g.content}`
    )
    .join('\n\n')}`

  const completion = await zai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  })
  const text = completion.choices[0]?.message?.content ?? ''
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('پاسخ JSON نبود: ' + text.slice(0, 200))
  const parsed = JSON.parse(m[0])
  const out: Record<string, unknown> = {}
  for (const it of parsed.items ?? []) out[String(it.wpId)] = { year: it.year, confidence: it.confidence, reason: it.reason }
  fs.writeFileSync('analysis/llm_eras.json', JSON.stringify(out, null, 1))
  console.log('LLM eras:', JSON.stringify(out, null, 1))
}

main().catch((e) => { console.error(e); process.exit(1) })
