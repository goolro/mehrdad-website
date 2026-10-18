# Alt-Text Pipeline — مستندات اجرا و اجرای مجدد

مسیر اسکریپت: `analysis/fix_alts.ts` — تولید alt توصیفی دوزبانه (EN/FA) برای تصاویر داخل محتوای پست‌ها با VLM.

## چه چیزی را پوشش می‌دهد؟
- فقط تصاویر داخل `Post.contentEn` و `Post.contentFa` (HTML مهاجرت‌شده از وردپرس).
- کاور پست‌ها نیازی به این pipeline ندارند: در فرانت `alt={title}` (صفحه مقاله) یا `alt=""` (کارت‌های لیست — تزئینی در بافت کارت که عنوان کنارش است) دارند.
- `Service`/`Project` فیلد محتوای HTML ندارند.

## Modes

```bash
bun analysis/fix_alts.ts                 # تولید: فقط entryهای کش‌نشده (resumable)
bun analysis/fix_alts.ts --limit N       # فقط N تصویر بعدی (برای تست)
bun analysis/fix_alts.ts --retry-failed  # موارد failed دائمی هم دوباره تلاش شوند
bun analysis/fix_alts.ts --report        # گزارش QC بدون فراخوانی VLM
bun analysis/fix_alts.ts --apply         # اعمال کش به DB (بکاپ خودکار + مارکر)
bun analysis/fix_alts.ts --apply --force # اعمال حتی اگر مارکر قبلاً ثبت شده باشد
```

## تضمین‌های pipeline

| الزام | پیاده‌سازی |
|---|---|
| Idempotent | کش با کلید src نرمال‌شده (percent-decoded)؛ در apply مقایسه alt قدیم/جدید — بدون تغییر اضافی؛ مارکر `alt_text_descriptive_v1` جلوی apply دوباره را می‌گیرد (مگر `--force`) |
| Resumable | بعد از **هر** موفقیت کش به‌صورت atomic (tmp+rename) ذخیره می‌شود؛ قطع شدن/process kill هیچ داده‌ای از دست نمی‌دهد؛ اجرای بعدی از همان‌جا ادامه می‌دهد |
| Rate limiting | کاملاً sequential؛ تأخیر `DELAY_MS` بین درخواست‌های موفق؛ **بدون موازی‌سازی** (قانون ثابت پروژه) |
| 429 | exponential backoff (پایه ۳۰s، سقف ۵ دقیقه) + random jitter + حداکثر ۸ تلاش؛ اگر 429 پایدار ماند، اجرا **تمیز متوقف** می‌شود و item در pending می‌ماند (به failed queue سوخته نمی‌شود) — 429 توقف پروژه نیست، فقط pause |
| Failure isolation | خطاهای دائمی (QC fail / پاسخ non-JSON) بعد از max retry به `failed` در کش می‌روند و جلوی بقیه را نمی‌گیرند |
| Cache پایدار | `analysis/alt_cache.json` — شناسه = مسیر نرمال‌شده تصویر (decode + بدون query) |
| QC خودکار | junk alt (`image/photo/تصویر/عکس` به‌تنهایی)، طول > ۱۶۰ نویسه، کلمه‌ی تکی، keyword stuffing (تکرار کلمات)، زبان اشتباه (فارسی در EN / نبود فارسی در FA) — رد شده‌ها با instruction اصلاحی دوباره تلاش می‌شوند |
| دوزبانه طبیعی | پرامپت صریحاً «فارسی روان، نه ترجمه ماشینی» + EN طبیعی؛ QC زبانی enforcing |
| تزئینی | VLM می‌تواند `decorative:true` برگرداند → در apply می‌شود `alt=""` |

## اجرای مجدد (مثلاً بعد از اضافه شدن پست جدید)

```bash
# ۱) تولید برای تصاویر جدید (کش قدیمی دست‌نخورده می‌ماند)
bun analysis/fix_alts.ts

# ۲) گزارش وضعیت
bun analysis/fix_alts.ts --report

# ۳) اعمال — اگر مارکر هست از --force استفاده کنید (altهای قبلی دست‌نخورده می‌مانند چون مقایسه idempotent است)
bun analysis/fix_alts.ts --apply --force
```

## اجرای طولانی در پس‌زمینه (sandbox)

فرآیند فرزند عادی با پایان command کشته می‌شود؛ از `setsid` استفاده کنید:

```bash
setsid nohup bun analysis/fix_alts.ts >> analysis/alt_run.log 2>&1 < /dev/null &
tail -f analysis/alt_run.log   # مانیتور
```

اگر فرآیند به هر دلیلی مرد، کافی است همان دستور generate را دوباره بزنید — از کش resume می‌کند.

## فایل‌های مرتبط

| فایل | نقش |
|---|---|
| `analysis/alt_cache.json` | کش تولید (resume) — `entries` + `failed` |
| `analysis/alt_inventory.json` | فهرست تصاویر یکتا از DB (تشخیصی) |
| `analysis/alt_run.log` | لاگ آخرین اجرای generate |
| `db/custom.backup-*.db` | بکاپ خودکار قبل از هر apply |

## قواعد ثابت

1. **هرگز برای دور زدن 429 درخواست موازی اضافه نکنید.** فقط backoff طولانی‌تر.
2. قبل از هر اجرای مجدد، `--report` بگیرید تا وضعیت واقعی کش/failed را ببینید.
3. apply بدون بکاپ انجام نمی‌شود (اسکریپت خودش بکاپ می‌گیرد؛ فایل را حذف نکنید).
4. alt معتبر = توصیف دقیق و کوتاه از محتوای قابل‌مشاهده؛ انتقال متن مهم داخل تصویر؛ بدون hallucination و بدون keyword stuffing.

## وضعیت: Phase 2 کامل شد (118/118)

Phase 1: ۱۶ تصویر دستی → Phase 2: ۱۰۲ تصویر باقی‌مانده. چون LLM API سندباکس
۸+ ساعت در 429 بود (vision+text)، altها با **vision خود ایجنت** نوشته شدند
(همان Plan B تأییدشده Phase 1): همه تصاویر واقعاً مشاهده شدند و جفت‌های
دوزبانه مستقیماً در `analysis/alt_manual.json` (provenance `via:
agent-vision`) ثبت و از مسیر استاندارد pipeline عبور کردند:
`--merge-manual` → `--validate` (PASS) → `--apply` (بکاپ + مارکر + post-audit
junk=0). نتیجه نهایی: 242/242 تگ img توصیفی، 118/118 تصویر یکتا.

برای پست‌های آینده همان جریان VLM/manual بالا استفاده می‌شود؛ اگر تصویر
جدیدی اضافه شد: `bun analysis/fix_alts.ts` (VLM) یا افزودن دستی به
`alt_manual.json` سپس merge/validate/apply.
