/**
 * Site Theme Engine — one shared design-token system, five themes.
 *
 * ARCHITECTURE (docs/THEME_ENGINE.md, decision D-014):
 *
 *   Theme Engine (shared design tokens)
 *   ├── Default  ☼  brand violet            · aurora background
 *   ├── Autumn   🍂 orange / rose           · falling leaves
 *   ├── Winter   ❄️  icy sky / cyan          · snowfall
 *   ├── Digital  ⚡ neon cyan / lime        · falling glyphs + grid
 *   └── Nowruz   🌱 emerald / gold          · spring petals
 *
 *   Light / Dark is a SEPARATE, independent user preference
 *   (`mode` in the app store → `.dark` class on <html>).
 *
 * How the tokens work:
 * - Every theme overrides Tailwind's color-palette CSS variables
 *   (--color-violet-*, --color-fuchsia-*) under `[data-theme="id"]`
 *   in globals.css. Since all components use `violet-*`/`fuchsia-*`
 *   utility classes, the whole site re-colors instantly — that shared
 *   variable layer IS the design system; a theme is just a palette
 *   + an animated background, never a layout change.
 * - The active theme id is stored in the DB (SiteSetting key "theme"),
 *   managed from the admin panel; visitors see the global theme.
 * - Legacy ids (pre-5-theme engine) are resolved through
 *   LEGACY_THEME_MAP so no stored value can ever render unstyled.
 */

export type ThemeEffect = 'aurora' | 'leaves' | 'snow' | 'matrix' | 'petals';

export interface SiteTheme {
  id: string;
  nameEn: string;
  nameFa: string;
  emoji: string;
  effect: ThemeEffect;
  /** swatches for admin preview: [primary, primaryDark, secondary, effect tint] */
  swatch: [string, string, string, string];
}

export const THEMES: SiteTheme[] = [
  {
    id: 'default',
    nameEn: 'Mehrdad (Default)',
    nameFa: 'مهرداد (پیش‌فرض)',
    emoji: '☼',
    effect: 'aurora',
    swatch: ['#8b5cf6', '#7c3aed', '#d946ef', '#a78bfa'],
  },
  {
    id: 'autumn',
    nameEn: 'Autumn',
    nameFa: 'پاییز',
    emoji: '🍂',
    effect: 'leaves',
    swatch: ['#f97316', '#c2410c', '#e11d48', '#fb923c'],
  },
  {
    id: 'winter',
    nameEn: 'Winter',
    nameFa: 'زمستان',
    emoji: '❄️',
    effect: 'snow',
    swatch: ['#38bdf8', '#0284c7', '#67e8f9', '#bae6fd'],
  },
  {
    id: 'digital',
    nameEn: 'Digital',
    nameFa: 'دیجیتال',
    emoji: '⚡',
    effect: 'matrix',
    swatch: ['#22d3ee', '#0891b2', '#4ade80', '#164e63'],
  },
  {
    id: 'nowruz',
    nameEn: 'Nowruz',
    nameFa: 'نوروز',
    emoji: '🌱',
    effect: 'petals',
    swatch: ['#10b981', '#059669', '#f59e0b', '#6ee7b7'],
  },
];

export const DEFAULT_THEME = 'default';

/**
 * Ids used before the 5-theme engine (v1) mapped to their nearest
 * successor. Applied when reading stored settings so old DB values and
 * old clients resolve cleanly. Order matters: resolve once, no chains
 * (every key maps directly to a current id).
 */
export const LEGACY_THEME_MAP: Record<string, string> = {
  digital: 'default', // pre-engine "Digital Violet" = today's brand default
  ocean: 'winter', // teal/cyan  → icy winter
  forest: 'nowruz', // emerald    → spring green
  sunset: 'autumn', // rose/orange → autumn warmth
  midnight: 'digital', // dark neon  → digital neon
};

export function getTheme(id: string | null | undefined): SiteTheme {
  const resolved = (id && LEGACY_THEME_MAP[id]) || id;
  return THEMES.find((t) => t.id === resolved) || THEMES[0];
}
