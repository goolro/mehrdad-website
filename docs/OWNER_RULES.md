# OWNER RULES — قانون عمومی کار (دستور مالک)

> **Status:** ACTIVE — standing law for every task, effective 2026-10-08.
> Source: owner's message «این یک دستور و قانون است — شروع قانون عمومی و ابتدای کار».
> This file is the canonical English-tracked record; the owner's original wording
> is Persian and governs. Nothing here may be relaxed without a new owner order.

---

## ۱. قانون مالک — عین عبارت‌ها (owner's law, verbatim intent)

1. **تغییر فقط همان‌جایی که گفته می‌شود** — دقیقاً همان قسمتی که مالک مشخص می‌کند
   تغییر می‌کند؛ هیچ چیز از خود اختراع نمی‌شود.
2. **نسخه وب‌سایت و نسخه موبایل جدا هستند** — برای هر دستور عمومی، تغییرات باید
   متناسب با نسخه وب اعمال شود؛ برای موبایل، کدنویسی و گرافیک **مخصوص موبایل**
   و جداگانه لازم است. تفاوت دو نسخه همیشه باید در نظر گرفته شود.
3. **انجماد سایر قسمت‌ها (freeze)** — هنگام تغییر هر بخش، بقیه بخش‌ها نباید
   دچار تغییر ناخواسته یا خطا شوند. اگر می‌دانم کاری باعث مشکل می‌شود،
   **قبل از انجام از مالک می‌پرسم**.
4. **گیت‌هاب منبع اصلی است** — تمام فایل‌ها و مستندات همیشه در گیت‌هاب همگام و
   به‌روز نگه داشته می‌شوند.
5. **بدون حدس و گمان** — کار باید منطقی باشد؛ اگر جایی لازم است حدس زده شود،
   **متوقف می‌شوم و از مالک می‌پرسم**.
6. **بکاپ قبل از تغییر** — هر جا لازم است، قبل از تغییر بکاپ گرفته می‌شود.
7. **تبدیل ایده به محصول** — اگر مالک ایده‌ای بدهد، به محصول تبدیل می‌شود و
   **فرایند و سیم‌کشی قسمت‌های مختلف** برای مالک شرح داده می‌شود.
8. **لاگ‌گیری هنگام مشکل** — در حین کدنویسی اگر به مشکل خوردم، لاگ می‌گیرم و
   ریشه‌یابی می‌کنم.
9. **لایه‌بندی و کدنویسی مهندسی** — همه قسمت‌های محصول در کد مشخص و لایه‌بندی
   شده‌اند؛ کدنویسی اصولی و مهندسی‌شده است. اگر غیر از این است، کار انجام نمی‌شود.
10. **اطلاع‌رسانی قبل از تغییر** — قبل از هر تغییر به مالک گفته می‌شود **چه چیزی
    چطور تغییر می‌کند** و **تغییرات کجا اعمال می‌شوند**.
11. **فازبندی کارهای بزرگ** — اگر تغییرات زیاد و بزرگ باشند، به فازهای کوچک
    شکسته می‌شوند و مرحله‌به‌مرحله اجرا می‌شوند.
12. **مستندسازی در گیت‌هاب** — تمام دستورات مالک و تمام کارهای انجام‌شده باید در
    گیت‌هاب مستند شوند.
13. **شروع کار با مرور مستندات** — هر بار قبل از شروع کار، مستندات دقیق بررسی و
    حافظه کاری به‌روز می‌شود.

## ۲. رویه اجرایی (how these rules are applied)

- **Pre-flight briefing:** for every owner instruction I first state, in Persian:
  (a) exactly which files/sections will change, (b) how the change behaves,
  (c) what stays frozen. Work starts only after that statement — for small
  fixes the briefing accompanies the report; for big ones it comes first.
- **Scope freeze:** a change touching file X may not alter file Y. Shared
  modules that could ripple (e.g. `SiteChrome`, `globals.css`, `lib/`) are
  declared in the briefing as "shared surface" before touching them.
- **Web vs mobile:** every UI change is checked at `lg` desktop width AND
  390px mobile width. When a directive needs mobile-specific layout, logic or
  graphics, it is implemented as a separate mobile branch (separate component
  code / media queries / assets), not as a shrunk-down copy of desktop.
- **No-guess stop:** any ambiguous point → work pauses and one concrete
  question goes to the owner in the chat report.
- **Backup:** for risky changes (schema, deletions, large refactors) a backup
  is taken first (`git` snapshot / file copy); trivial doc-only changes rely on
  git history itself.
- **Logging:** every error encountered is logged (dev.log, console, or
  worklog) with root cause before moving on.
- **Phases:** large directives are split into small phases; each phase is
  verified (lint + tsc + browser self-test) before the next begins.
- **Documentation:** owner commands → this file (or a task section in it) +
  `docs/DECISIONS.md` when a decision is involved + workspace `worklog.md`
  for the engineering log. Everything committed to GitHub.
- **Start-of-work ritual:** re-read this file, latest `docs/DECISIONS.md`
  entries and the newest `worklog.md` sections before writing any code.

## ۳. وضعیت همگام‌سازی گیت‌هاب (GitHub sync status)

- This document was committed on 2026-10-08 (author goolro).
- Push to GitHub requires the owner's PAT (transient token) — none is stored
  in this workspace by design (no credentials in git config, env, or files).
  When the PAT is provided in chat, the commit is pushed immediately and the
  Vercel auto-deploy is then verified.
