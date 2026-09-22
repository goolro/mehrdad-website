'use client';

/**
 * DESIGN PROTOTYPE — «Momentum / شتاب»
 * Live, animated mockup of the design scenario the owner asked for:
 * sports & vehicles (bike/ski, train, car, football) fused into the
 * circuit→city narrative. Pure SVG + CSS animation (no JS loops, no libs).
 * Self-contained: delete this file + its <VelocityShowcase /> usage in
 * HomeView.tsx to remove the whole demo.
 */

import { useApp, pick } from './store';

const COPY = {
  title: { en: 'Momentum', fa: 'شتاب' },
  sub: {
    en: 'Design is motion — start small, pick up speed, arrive at the city.',
    fa: 'طراحی، حرکت است — از رکاب شروع می‌کنیم، سرعت می‌گیریم، به شهر می‌رسیم.',
  },
  steps: [
    {
      n: '01',
      title: { en: 'Pedal', fa: 'رکاب' },
      desc: {
        en: 'Everything great starts under human power.',
        fa: 'هر چیز بزرگ با نیروی پا شروع می‌شود.',
      },
    },
    {
      n: '02',
      title: { en: 'Rails', fa: 'ریل' },
      desc: {
        en: 'Rails are circuits: energy, routed at speed.',
        fa: 'ریل همان مدار است: انرژی که با سرعت مسیریابی می‌شود.',
      },
    },
    {
      n: '03',
      title: { en: 'City', fa: 'شهر' },
      desc: {
        en: 'Headlights at full speed become a skyline at night.',
        fa: 'نور چراغ‌ها در سرعت، به پنجره‌های روشن شهر بدل می‌شود.',
      },
    },
  ],
  lineup: {
    title: { en: 'The lineup', fa: 'ترکیب تیم' },
    sub: {
      en: 'Services are players — strategy is the passing game.',
      fa: 'هر سرویس یک بازیکن است؛ استراتژی یعنی پاس‌کاری.',
    },
  },
};

export function VelocityShowcase() {
  const { lang } = useApp();
  const rtl = lang === 'fa';

  return (
    <section aria-label={pick(lang, COPY.title.en, COPY.title.fa)} className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6">
      <div className="vel overflow-hidden rounded-3xl border border-border bg-card">
        {/* section header */}
        <div className="px-6 pt-6 text-center sm:px-8">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{pick(lang, COPY.title.en, COPY.title.fa)}</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{pick(lang, COPY.sub.en, COPY.sub.fa)}</p>
        </div>

        {/* three scenes — order follows reading direction */}
        <div dir={rtl ? 'rtl' : 'ltr'} className="grid gap-4 p-4 sm:p-6 md:grid-cols-3">
          {[
            { svg: <PedalScene />, step: COPY.steps[0] },
            { svg: <RailsScene />, step: COPY.steps[1] },
            { svg: <CityScene />, step: COPY.steps[2] },
          ].map(({ svg, step }) => (
            <figure key={step.n} className="rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div dir="ltr" className={rtl ? '-scale-x-100' : ''}>{svg}</div>
              <figcaption className="px-1 pb-1 pt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold tracking-widest text-violet-600 dark:text-violet-400">{step.n}</span>
                  <span className="font-bold">{pick(lang, step.title.en, step.title.fa)}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {pick(lang, step.desc.en, step.desc.fa)}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* football strip: services as a formation */}
        <div className="border-t border-border/60 bg-muted/30 px-4 py-5 sm:px-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1 px-1">
            <h3 className="font-bold">{pick(lang, COPY.lineup.title.en, COPY.lineup.title.fa)}</h3>
            <p className="text-sm text-muted-foreground">{pick(lang, COPY.lineup.sub.en, COPY.lineup.sub.fa)}</p>
          </div>
          <PitchScene />
        </div>
      </div>

      <style>{VEL_CSS}</style>
    </section>
  );
}

/* ── Scene 1: bike on a downhill, speed lines accelerating ── */
function PedalScene() {
  return (
    <svg viewBox="0 0 320 170" className="h-auto w-full text-violet-600 dark:text-violet-400" role="img" aria-hidden>
      {/* downhill slope */}
      <path d="M10 30 L310 150" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      {/* speed lines along the slope (dash flow = acceleration) */}
      <path className="vel-dash" d="M40 55 L120 87" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path className="vel-dash" style={{ animationDelay: '-0.25s' }} d="M20 80 L140 128" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path className="vel-dash" style={{ animationDelay: '-0.5s' }} d="M90 70 L150 94" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path className="vel-dash" style={{ animationDelay: '-0.7s' }} d="M150 96 L250 137" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      {/* bike: wheels + frame, riding the slope */}
      <g className="text-foreground">
        <circle cx="170" cy="81" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="215" cy="99" r="13" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M170 81 L192 62 L215 99 M170 81 L196 90 L215 99 M192 62 L206 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* motion blur arcs behind rear wheel */}
      <path className="vel-dash" d="M138 66 L158 74" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path className="vel-dash" style={{ animationDelay: '-0.4s' }} d="M134 78 L156 86" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/* ── Scene 2: railway that IS a circuit — train rides the trace ── */
function RailsScene() {
  const ties = Array.from({ length: 18 }, (_, i) => 10 + i * 17);
  return (
    <svg viewBox="0 0 320 170" className="h-auto w-full text-violet-600 dark:text-violet-400" role="img" aria-hidden>
      {/* rails */}
      <line x1="4" y1="76" x2="316" y2="76" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="90" x2="316" y2="90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* ties blink in sequence = motion */}
      {ties.map((x, i) => (
        <line key={x} className="vel-tie" style={{ animationDelay: `${(i % 9) * 0.12}s` }} x1={x} y1="77.5" x2={x} y2="88.5" stroke="currentColor" strokeWidth="2" />
      ))}
      {/* circuit branch: the rail powers a chip */}
      <path d="M160 90 V118 H150 M160 118 H186" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
      <circle cx="150" cy="118" r="3" fill="currentColor" />
      <circle cx="186" cy="118" r="3" fill="currentColor" />
      <rect className="text-foreground" x="150" y="124" width="36" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M158 124 V116 M166 124 V116 M174 124 V116 M182 124 V116" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* solder pads at rail ends */}
      <circle cx="4" cy="83" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <circle cx="316" cy="83" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      {/* the train: glowing amber unit sliding along */}
      <g className="vel-train text-amber-500">
        <rect x="-30" y="70" width="30" height="15" rx="4" fill="currentColor" />
        <rect x="-26" y="73" width="5" height="4" rx="1" fill="#fff" opacity="0.9" />
        <rect x="-19" y="73" width="5" height="4" rx="1" fill="#fff" opacity="0.9" />
        <rect x="-12" y="73" width="5" height="4" rx="1" fill="#fff" opacity="0.9" />
        <rect x="-33" y="74" width="4" height="7" rx="2" fill="currentColor" opacity="0.4" />
      </g>
    </svg>
  );
}

/* ── Scene 3: headlights streaming into a skyline that lights up ── */
function CityScene() {
  const buildings: Array<[number, number, number]> = [
    [10, 40, 28], [44, 64, 20], [70, 30, 32], [108, 52, 24],
    [140, 44, 30], [176, 70, 22], [204, 36, 34], [244, 56, 26], [276, 46, 30],
  ];
  const windows: Array<[number, number, number]> = [
    [16, 100, 0], [22, 112, 1], [50, 78, 2], [56, 92, 3], [78, 112, 4],
    [114, 90, 5], [120, 104, 6], [148, 98, 7], [182, 72, 8], [188, 88, 9],
    [212, 106, 10], [250, 86, 11], [256, 100, 12], [284, 96, 13],
  ];
  return (
    <svg viewBox="0 0 320 170" className="h-auto w-full text-violet-600 dark:text-violet-400" role="img" aria-hidden>
      {/* skyline */}
      {buildings.map(([x, h, w]) => (
        <rect key={x} x={x} y={150 - h} width={w} height={h} rx="2" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
      ))}
      {/* windows light up in sequence (headlights landing) */}
      {windows.map(([x, y, i]) => (
        <rect key={i} className="vel-window text-amber-500" style={{ animationDelay: `${i * 0.35}s` }} x={x} y={y} width="5" height="5" rx="1" fill="currentColor" />
      ))}
      {/* headlight streaks → become streets */}
      <g className="text-amber-500">
        <rect className="vel-streak" y="96" width="46" height="3" rx="1.5" fill="currentColor" />
        <rect className="vel-streak" style={{ animationDelay: '-0.7s' }} y="118" width="60" height="3" rx="1.5" fill="currentColor" />
        <rect className="vel-streak" style={{ animationDelay: '-1.4s' }} y="132" width="38" height="3" rx="1.5" fill="currentColor" />
      </g>
      {/* road with moving centre dashes */}
      <line x1="0" y1="146" x2="320" y2="146" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line className="vel-dash" x1="0" y1="146" x2="320" y2="146" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
      {/* the car */}
      <g className="text-foreground">
        <path d="M18 140 h34 a4 4 0 0 1 4 4 v3 h-42 v-3 a4 4 0 0 1 4 -4 Z" fill="currentColor" />
        <path d="M26 140 l4 -7 h12 l5 7 Z" fill="currentColor" opacity="0.85" />
        <circle cx="26" cy="147" r="4" fill="currentColor" />
        <circle cx="48" cy="147" r="4" fill="currentColor" />
      </g>
      <circle className="text-amber-500" cx="57" cy="141" r="2.5" fill="currentColor" />
    </svg>
  );
}

/* ── Strip: pitch + formation, pass lines flowing, ball moving ── */
function PitchScene() {
  const players: Array<[number, number]> = [
    [70, 35], [70, 85], [130, 60], [200, 40], [200, 80],
  ];
  return (
    <div dir="ltr">
      <svg viewBox="0 0 320 120" className="h-auto w-full text-emerald-600 dark:text-emerald-400" role="img" aria-hidden>
        {/* pitch */}
        <rect x="40" y="10" width="240" height="100" rx="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
        <line x1="160" y1="10" x2="160" y2="110" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <circle cx="160" cy="60" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <rect x="40" y="38" width="26" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <rect x="254" y="38" width="26" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        {/* pass lines (flowing dashes) */}
        <g className="text-violet-600 dark:text-violet-400">
          <path className="vel-pass" d="M70 35 L130 60 L200 40" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path className="vel-pass" style={{ animationDelay: '-0.5s' }} d="M70 85 L130 60 L200 80" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        </g>
        {/* players */}
        {players.map(([x, y], i) => (
          <g key={i} className="text-violet-600 dark:text-violet-400">
            <circle cx={x} cy={y} r="7" fill="currentColor" />
            <circle cx={x} cy={y} r="10" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
          </g>
        ))}
        {/* the ball, passing between players */}
        <g transform="translate(70,35)">
          <g className="vel-ball">
            <circle r="4.5" className="text-foreground" fill="currentColor" stroke="currentColor" strokeWidth="1" />
            <circle r="1.6" className="text-foreground" fill="currentColor" opacity="0.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ── all keyframes, scoped + reduced-motion aware ── */
const VEL_CSS = `
@keyframes vel-dash { to { stroke-dashoffset: -36; } }
.vel .vel-dash { stroke-dasharray: 10 26; animation: vel-dash 0.8s linear infinite; }
@keyframes vel-slide { from { transform: translateX(0); } to { transform: translateX(350px); } }
.vel .vel-train { animation: vel-slide 4.5s linear infinite; }
@keyframes vel-streak { 0% { transform: translateX(-70px); opacity: 0; } 12% { opacity: 0.95; } 100% { transform: translateX(330px); opacity: 0; } }
.vel .vel-streak { animation: vel-streak 2.2s linear infinite; }
@keyframes vel-tie { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; } }
.vel .vel-tie { animation: vel-tie 1.6s ease-in-out infinite; }
@keyframes vel-window { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; } }
.vel .vel-window { animation: vel-window 3.2s ease-in-out infinite; }
@keyframes vel-passflow { to { stroke-dashoffset: -20; } }
.vel .vel-pass { stroke-dasharray: 4 6; animation: vel-passflow 0.9s linear infinite; }
@keyframes vel-ball { 0% { transform: translate(0, 0); } 30% { transform: translate(60px, 25px); } 60% { transform: translate(130px, 5px); } 80% { transform: translate(60px, 25px); } 100% { transform: translate(0, 0); } }
.vel .vel-ball { animation: vel-ball 6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .vel .vel-dash, .vel .vel-train, .vel .vel-streak, .vel .vel-tie,
  .vel .vel-window, .vel .vel-pass, .vel .vel-ball { animation: none !important; }
}
`;
