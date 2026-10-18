'use client';

/**
 * Guide tab — static how-to: using the panel, and installing the same agent
 * library into external tools (Claude Code, Cursor, …) from the local clone.
 */
import { Bot, Terminal, Users } from 'lucide-react';
import type { RosterPayload } from '@/components/agency/agency-client';

const CODE_DIR = 'ltr';

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      dir={CODE_DIR}
      className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-start font-mono text-[11px] leading-5 text-emerald-300"
    >
      {children}
    </pre>
  );
}

export function AgencyGuide({ roster }: { roster: RosterPayload }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6" dir="rtl">
      <section aria-label="این پنل چیست">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Bot className="h-4 w-4 text-emerald-400" aria-hidden /> این پنل چیست؟
        </h2>
        <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs leading-6 text-zinc-300">
          <p>
            یک فضای کار خصوصی روی سایت خودت که کتابخانهٔ متن‌باز «The Agency»
            {' '}({roster.stats.agentCount.toLocaleString('fa-IR')} ایجنت تخصصی از
            {' '}msitarzewski/agency-agents، مجوز MIT) را سرو می‌کند. هر ایجنت یک پرسونای کامل
            دارد — متخصص فرانت‌اند، معمار بک‌اند، هکر رشد، مدیر محصول و…
          </p>
          <p>
            گفتگوها با هوش مصنوعی خودِ سایت انجام می‌شود (همان موتوری که چت عمومی سایت را
            روشن نگه می‌دارد)، تاریخچه در دیتابیس سایت ذخیره می‌شود و فقط با رمز پنل مدیریت
            در دسترس است.
          </p>
        </div>
      </section>

      <section aria-label="چطور استفاده کنم">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Users className="h-4 w-4 text-amber-300" aria-hidden /> چطور استفاده کنم؟
        </h2>
        <ul className="list-inside list-disc space-y-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs leading-6 text-zinc-300">
          <li>
            <b>دپارتمان‌ها:</b> در تب «دپارتمان‌ها» روی باکس هر دپارتمان بزن تا صفحهٔ اختصاصی‌اش
            باز شود — همهٔ ایجنت‌های همان حوزه، با جستجو و گفتگو.
          </li>
          <li>
            <b>گفتگوی تکی:</b> در تب «ایجنت‌ها» یک متخصص پیدا کن و «گفتگو» را بزن — مثلاً
            UX Researcher برای بررسی تجربهٔ کاربری، یا Security Auditor برای بازبینی امنیتی.
          </li>
          <li>
            <b>اجرای تیمی:</b> در تب «اجرای تیمی» یک ران‌بوک آماده انتخاب کن — برای کارهای
            کسب‌وکار ران‌بوک‌های اختصاصی هم داریم: Startup Strategy، Investor Ready Kit،
            Content Factory و Social Launch Engine؛ یک تسک می‌دهی و هر عضو تیم از دید تخصص خودش
            جواب می‌دهد — خروجی جمعی با یک فایل Markdown قابل export است.
          </li>
          <li>
            <b>منتخب‌ها:</b> ستارهٔ ایجنت‌های پرکاربردت را بزن تا در داشبورد میان‌بر بسازند.
          </li>
          <li>
            <b>پرامپت برای ابزارهای دیگر:</b> دکمهٔ «کپی پرامپت» پرسونای کامل ایجنت را می‌دهد؛ آن
            را در Claude Code / Cursor / هر چت‌باتی paste کن تا همان متخصص را آنجا هم داشته باشی.
          </li>
        </ul>
      </section>

      <section aria-label="نصب در ابزارهای محلی">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Terminal className="h-4 w-4 text-sky-300" aria-hidden /> نصب همان ایجنت‌ها در ابزارهای محلی
        </h2>
        <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs leading-6 text-zinc-300">
          <p>
            این کتابخانه از قبل روی همین سرور هم نصب است. برای استفاده در Claude Code یا Cursor
            روی لپ‌تاپ/سرور خودت، کلون کن و اسکریپت نصب را اجرا کن:
          </p>
          <CodeBlock>{`git clone https://github.com/msitarzewski/agency-agents.git
cd agency-agents

# Claude Code (all 282 agents → ~/.claude/agents)
./scripts/install.sh --tool claude-code

# or pick a team only
./scripts/install.sh --tool claude-code --division engineering,security`}</CodeBlock>
          <p className="text-zinc-400">
            برای به‌روزرسانی کتابخانهٔ همین پنل: کلون محلی را pull کن و
            {' '}<code dir="ltr" className="rounded bg-zinc-800 px-1 font-mono text-[10px]">node scripts/build-agency-library.mjs</code>
            {' '}داخل ریپوی سایت اجرا شود.
          </p>
        </div>
      </section>

      <section aria-label="حریم خصوصی">
        <h2 className="mb-2 text-sm font-bold">حریم خصوصی</h2>
        <ul className="list-inside list-disc space-y-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs leading-6 text-zinc-400">
          <li>این صفحه در هیچ‌جای سایت لینک نمی‌شود و از ایندکس موتورهای جستجو مستثناست.</li>
          <li>همهٔ APIهای پنل با کوکی امضاشدهٔ پنل مدیریت محافظت می‌شوند؛ بدون ورود چیزی برگردانده نمی‌شود.</li>
          <li>مصرف هوش مصنوعی محدودسازی نرخ دارد تا سوءاستفاده از کوکی مسدود بماند.</li>
        </ul>
      </section>
    </div>
  );
}
