/**
 * NEXUS — data layer for the «living field» prototype (Phase 3 R&D).
 * Six disciplines anchor the field. Their hues are the only color
 * system in the world — everything else is near-black + golden lines.
 * Synthesis pairs encode the core idea: two unrelated disciplines
 * collide → a named, real possibility (Mehrdad's actual offerings).
 *
 * COLOR TOKENS (scenario v2 — analysis/nexus-scenario.md):
 * one hue per discipline, hard roles, min 40° wheel gap, and each hue
 * is only ever visible INSIDE its own district (node + local well +
 * particle cluster). No global tint washes — colors stay distinct.
 */

export type Bi = { fa: string; en: string };

export interface Discipline {
  id: number;
  key: 'engineering' | 'math' | 'physics' | 'chemistry' | 'digital' | 'design';
  name: Bi;
  /** 0..360 — the discipline's light in the field */
  hue: number;
  /** % position inside the stage */
  x: number;
  y: number;
  /** parallax depth 0.7 (far) … 1.4 (near) */
  depth: number;
}

export const DISCIPLINES: Discipline[] = [
  { id: 0, key: 'engineering', name: { fa: 'مهندسی', en: 'Engineering' }, hue: 40, x: 17, y: 32, depth: 1.15 },
  { id: 1, key: 'math', name: { fa: 'ریاضی', en: 'Mathematics' }, hue: 250, x: 43, y: 20, depth: 0.8 },
  { id: 2, key: 'physics', name: { fa: 'فیزیک', en: 'Physics' }, hue: 175, x: 74, y: 27, depth: 1.3 },
  { id: 3, key: 'chemistry', name: { fa: 'شیمی', en: 'Chemistry' }, hue: 105, x: 25, y: 71, depth: 0.75 },
  { id: 4, key: 'digital', name: { fa: 'دیجیتال', en: 'Digital' }, hue: 310, x: 55, y: 74, depth: 1.05 },
  { id: 5, key: 'design', name: { fa: 'طراحی', en: 'Design' }, hue: 355, x: 84, y: 64, depth: 1.35 },
];

export interface Synthesis {
  a: number;
  b: number;
  title: Bi;
  desc: Bi;
  sample?: Bi;
}

const S = (a: number, b: number, title: Bi, desc: Bi, sample?: Bi): Synthesis => ({ a, b, title, desc, sample });

/** Curated collisions — the pipeline DISCIPLINES → CONNECTIONS → POSSIBILITY */
export const SYNTHESES: Synthesis[] = [
  S(0, 4,
    { fa: 'زیرساخت زنده', en: 'Living Infrastructure' },
    { fa: 'سایت‌هایی که مثل یک سیستم نرم‌افزاری رفتار می‌کنند، نه یک بروشور.', en: 'Sites that behave like software systems, not brochures.' },
    { fa: 'همین سایت', en: 'This very site' }),
  S(0, 5,
    { fa: 'نمونه‌سازی سریع', en: 'Rapid Prototyping' },
    { fa: 'از اسکیس تا پروتکل قابل استفاده، در یک گردش کار.', en: 'From sketch to a usable build in one workflow.' }),
  S(1, 4,
    { fa: 'الگوریتم و بهینه‌سازی', en: 'Algorithm & Optimization' },
    { fa: 'جست‌وجو، رتبه و داده؛ ریاضیِ به‌کاررفته، نه ادعایی.', en: 'Search, ranking and data — applied math, not claims.' },
    { fa: 'سئوی فنی', en: 'Technical SEO' }),
  S(2, 4,
    { fa: 'شبیه‌سازی و حرکت', en: 'Simulation & Motion' },
    { fa: 'فیزیک واقعی در انیمیشن و رندر؛ حرکتی که دلیل دارد.', en: 'Real physics in animation and rendering — motion with a reason.' }),
  S(1, 2,
    { fa: 'مدل‌های میدانی', en: 'Field Models' },
    { fa: 'همان میدانی که همین حالا دور شما جریان دارد.', en: 'The very field flowing around you right now.' }),
  S(3, 5,
    { fa: 'ساختار و فرم', en: 'Structure & Form' },
    { fa: 'هندسهٔ طبیعت، در رابط‌ها و هویت بصری.', en: 'Nature\'s geometry, inside interfaces and identities.' }),
  S(4, 5,
    { fa: 'رابط‌های زنده', en: 'Living Interfaces' },
    { fa: 'محصولاتی که واکنش‌گرا نفس می‌کشند.', en: 'Products that breathe responsively.' },
    { fa: 'استودیوی رسانه', en: 'Media Studio' }),
  S(0, 1,
    { fa: 'دقت مهندسی', en: 'Engineering Precision' },
    { fa: 'تولرانس‌های سخت‌گیرانه در جزئیات؛ خطا جایی ندارد.', en: 'Tight tolerances in the details — no room for drift.' }),
  S(2, 3,
    { fa: 'از مولکول تا میدان', en: 'Molecule to Field' },
    { fa: 'ساختارهای ریز، انرژی‌های کلان.', en: 'Micro structures, macro energy.' }),
  S(1, 5,
    { fa: 'نظم و زیبایی', en: 'Order & Beauty' },
    { fa: 'تناسب به‌عنوان ابزار کار، نه شعار.', en: 'Proportion as a working tool, not a slogan.' }),
];

export const GENERIC_SYNTHESIS: Synthesis = {
  a: -1,
  b: -1,
  title: { fa: 'ترکیب تازه', en: 'A New Compound' },
  desc: {
    fa: 'هر برخورد دو نگاهِ متفاوت، احتمالی جدید می‌سازد.',
    en: 'Every collision of two different lenses creates a new possibility.',
  },
};

export function synthesisFor(a: number, b: number): Synthesis {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return SYNTHESES.find((s) => s.a === lo && s.b === hi) ?? { ...GENERIC_SYNTHESIS, a: lo, b: hi };
}
