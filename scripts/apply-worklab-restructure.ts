/**
 * Work/Lab restructure — production content migration (2026-09-07).
 *
 * WHAT IT DOES (see DECISIONS.md D-0XX and the owner's restructure brief):
 *  1. Reclassifies the five earlier venture-style projects as `idea`:
 *     neutral one-sentence summaries, featured=false, fundingAsk=null,
 *     progress=0, legacy "Seeking partners" labels cleared.
 *  2. Sweeps legacy status values on any remaining rows
 *     (seeking→idea, under-construction→building, coming-soon→concept,
 *     "Archived" text→archived).
 *  3. Upserts the four new entries (game→lab, health→work, finance→work,
 *     car super-app→work with SW/HW framing). featured=true ONLY on
 *     car-super-app (owner confirms final 1–2 picks in the admin panel).
 *
 * SAFETY:
 *  - Default is DRY-RUN: prints every planned change and the current
 *    production rows (incl. any money-claim language found) — nothing is
 *    written unless `--apply` is passed. Every change was approved by the
 *    owner before this script ever runs.
 *  - Ambiguous keyword matches are NOT written; they are reported for the
 *    admin panel instead.
 *
 * RUN ORDER (after owner approval, see docs/DEPLOYMENT.md):
 *   export DATABASE_URL="<supabase postgres url>"
 *   bunx prisma db push --schema prisma/schema.postgres.prisma   # adds columns
 *   bun scripts/apply-worklab-restructure.ts                     # dry-run review
 *   bun scripts/apply-worklab-restructure.ts --apply             # execute
 *   # then trigger the Vercel deploy hook (or save any admin project) to rebuild
 */
import { PrismaClient } from '@prisma/client';

const APPLY = process.argv.includes('--apply');
const db = new PrismaClient();

const IDEA_EN = "An early idea I've explored; not currently in active development.";
const IDEA_FA = 'ایدهٔ اولیه‌ای است که بررسی کرده‌ام؛ در حال حاضر در حال توسعهٔ فعال نیست.';

/** the five venture-style entries — matched by slug/title substring (EN or FA) */
const FIVE: { keys: string[]; titleEn: string; titleFa: string }[] = [
  { keys: ['iran-rail', 'rail revolution', 'ریلی'], titleEn: 'Iran Rail Revolution', titleFa: 'انقلاب ریلی ایران' },
  { keys: ['bizpal', 'بیزپل'], titleEn: 'BIZPAL', titleFa: 'بیزپل' },
  { keys: ['waste', 'smart-city', 'smart city', 'پسماند', 'شهر هوشمند'], titleEn: 'Smart City Waste Sorting', titleFa: 'تفکیک پسماند هوشمند شهری' },
  { keys: ['investment-management', 'investment management', 'مدیریت سرمایه'], titleEn: 'Investment Management Platform', titleFa: 'پلتفرم مدیریت سرمایه‌گذاری' },
  { keys: ['klika', 'کلیکا'], titleEn: 'KLIKA', titleFa: 'کلیکا' },
];

/** the four new entries (owner confirms exact names/statuses before publish) */
const NEW = [
  {
    slug: 'lab-game', titleEn: 'Game Experiment (working title)', titleFa: 'آزمایش بازی (نام موقت)',
    summaryEn: 'A small game experiment, built in the open for curiosity and learning. Lab item — no business model attached.',
    summaryFa: 'یک آزمایش بازی کوچک که برای کنجکاوی و یادگیری به‌صورت باز ساخته می‌شود. آیتم آزمایشگاهی — بدون مدل کسب‌وکار.',
    section: 'lab', status: 'building', progress: 30, featured: false, order: 10,
  },
  {
    slug: 'health-app', titleEn: 'Personal Health Tool (working title)', titleFa: 'ابزار سلامت شخصی (نام موقت)',
    summaryEn: 'A personal health-tracking utility — everyday logs and trends, strictly a tool. Not a medical device and not a substitute for professional care; a data-handling note will be published before any personal data is collected.',
    summaryFa: 'ابزار شخصی ثبت و پیگیری سلامت — صرفاً یک ابزار روزمره؛ دستگاه پزشکی نیست و جایگزین متخصص نیست. یادداشت نحوهٔ مدیریت داده‌ها پیش از جمع‌آوری هر داده شخصی منتشر خواهد شد.',
    section: 'work', status: 'building', progress: 25, featured: false, order: 11,
  },
  {
    slug: 'personal-finance-tool', titleEn: 'Personal Finance Tool (working title)', titleFa: 'ابزار مالی شخصی (نام موقت)',
    summaryEn: 'A personal finance tool for tracking spending and budgets — a private utility. Not a bank and not financial advice.',
    summaryFa: 'ابزار مالی شخصی برای ثبت هزینه و بودجه‌بندی — یک ابزار خصوصی؛ بانک نیست و مشاورهٔ مالی هم نیست.',
    section: 'work', status: 'building', progress: 20, featured: false, order: 12,
  },
  {
    slug: 'car-super-app', titleEn: 'Car Super-App (working title)', titleFa: 'سوپراپ خودرو (نام موقت)',
    summaryEn: 'A connected-car companion, software first: the app is in early building. The hardware device is a labeled future concept — not part of the current product.',
    summaryFa: 'همراه خودرو با تمرکز بر نرم‌افزار: اپلیکیشن در مراحل اولیهٔ ساخت است. سخت‌افزار صرفاً یک ایدهٔ برچسب‌خورده برای آینده است و بخشی از محصول فعلی نیست.',
    section: 'work', status: 'building', progress: 35, featured: true, order: 13,
  },
];

const MONEY_RE = /\$|pre-?seed|seed round|market size|TAM|billion|trillion|درخواست سرمایه|همکار/i;

async function main() {
  const all = await db.project.findMany({ orderBy: { order: 'asc' } });
  console.log(`\n=== production projects today (${all.length}) ${APPLY ? '— APPLY MODE' : '— DRY-RUN (nothing written)'} ===`);
  for (const p of all) {
    const flagged = MONEY_RE.test(p.summaryEn) || MONEY_RE.test(p.statusEn) ? '  ⚠ venture/financial language' : '';
    console.log(`  [${p.slug}] "${p.titleEn}" status=${p.status} labels=${JSON.stringify(p.statusEn)}/${JSON.stringify(p.statusFa)}${flagged}`);
  }

  // ── 1. match the five ──
  const claimed = new Set<string>();
  const matches: { id: string; titleEn: string; titleFa: string }[] = [];
  const ambiguous: string[] = [];
  for (const five of FIVE) {
    const hits = all.filter((p) => {
      const hay = `${p.slug} ${p.titleEn} ${p.titleFa}`.toLowerCase();
      const matched = five.keys.some((k) => hay.includes(k.toLowerCase()));
      return matched && !claimed.has(p.id);
    });
    if (hits.length === 1) {
      claimed.add(hits[0].id);
      matches.push({ id: hits[0].id, titleEn: five.titleEn, titleFa: five.titleFa });
    } else {
      ambiguous.push(`${five.titleEn} → ${hits.length} matches (resolve manually in the admin panel)`);
    }
  }

  console.log('\n=== step 1: recast five as Idea ===');
  for (const m of matches) {
    const p = all.find((x) => x.id === m.id)!;
    console.log(`  ${APPLY ? '✎' : '·'} [${p.slug}] "${p.titleEn}" → "${m.titleEn}" | summary→neutral, status=idea, featured=false, fundingAsk=null`);
    if (APPLY) {
      await db.project.update({
        where: { id: p.id },
        data: {
          titleEn: m.titleEn,
          titleFa: m.titleFa,
          summaryEn: IDEA_EN,
          summaryFa: IDEA_FA,
          status: 'idea',
          progress: 0,
          featured: false,
          fundingAsk: null,
          statusEn: '',
          statusFa: '',
          section: 'work',
        },
      });
    }
  }
  for (const a of ambiguous) console.log(`  ⚠ AMBIGUOUS: ${a}`);

  // ── 2. legacy sweep on the rest ──
  console.log('\n=== step 2: legacy status sweep ===');
  for (const p of all) {
    if (claimed.has(p.id)) continue;
    const data: Record<string, unknown> = {};
    if (p.status === 'seeking') { data.status = 'idea'; }
    else if (p.status === 'under-construction') { data.status = 'building'; }
    else if (p.status === 'coming-soon') { data.status = 'concept'; }
    else if (p.status === 'live' && /archived|بایگانی/i.test(p.statusEn + p.statusFa)) { data.status = 'archived'; }
    if (/seeking|جستجوی همکار/i.test(p.statusEn + p.statusFa)) { data.statusEn = ''; data.statusFa = ''; }
    if (Object.keys(data).length) {
      console.log(`  ${APPLY ? '✎' : '·'} [${p.slug}] ${JSON.stringify(data)}`);
      if (APPLY) await db.project.update({ where: { id: p.id }, data });
    }
  }

  // ── 3. the four new entries ──
  console.log('\n=== step 3: upsert four new entries ===');
  for (const n of NEW) {
    const existing = await db.project.findUnique({ where: { slug: n.slug } });
    console.log(`  ${APPLY ? '✎' : '·'} [${n.slug}] ${existing ? 'update' : 'create'} | section=${n.section} status=${n.status} featured=${n.featured}`);
    if (APPLY) {
      await db.project.upsert({
        where: { slug: n.slug },
        update: {
          section: n.section, status: n.status, progress: n.progress,
          featured: n.featured, order: n.order,
          titleEn: n.titleEn, titleFa: n.titleFa, summaryEn: n.summaryEn, summaryFa: n.summaryFa,
        },
        create: { ...n, fundingAsk: null, cover: null, statusEn: '', statusFa: '' },
      });
    }
  }

  console.log(`\n${APPLY ? 'APPLY DONE — now trigger the deploy hook to rebuild static pages' : 'DRY-RUN ONLY — re-run with --apply to execute'}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
