/**
 * Site theme definitions.
 *
 * How it works:
 * - Every theme overrides Tailwind's color palette CSS variables
 *   (--color-violet-*, --color-fuchsia-*) under `[data-theme="id"]`
 *   in globals.css. Since all components use `violet-*`/`fuchsia-*`
 *   utility classes, the whole site re-colors instantly.
 * - Each theme also has an animated background effect rendered by
 *   ThemeBackground.tsx.
 * - The active theme id is stored in DB (SiteSetting key "theme"),
 *   managed from the admin panel; visitors always see the global theme.
 */

export interface SiteTheme {
  id: string;
  nameEn: string;
  nameFa: string;
  emoji: string;
  effect:
    | 'aurora'    // soft moving gradient blobs + faint grid (digital)
    | 'leaves'    // falling autumn leaves
    | 'bubbles'   // rising bubbles + waves (ocean)
    | 'fireflies' // glowing floating dots (forest)
    | 'glow'      // warm slow aurora glow (sunset)
    | 'stars';    // twinkling starfield (midnight, dark)
  /** swatches for admin preview: [primary, primaryDark, secondary, effect tint] */
  swatch: [string, string, string, string];
  dark?: boolean; // theme forces a dark canvas
}

export const THEMES: SiteTheme[] = [
  {
    id: 'digital',
    nameEn: 'Digital Violet',
    nameFa: 'بنفش دیجیتال',
    emoji: '✦',
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
    id: 'ocean',
    nameEn: 'Ocean',
    nameFa: 'اقیانوس',
    emoji: '🌊',
    effect: 'bubbles',
    swatch: ['#14b8a6', '#0f766e', '#06b6d4', '#2dd4bf'],
  },
  {
    id: 'forest',
    nameEn: 'Forest',
    nameFa: 'جنگل',
    emoji: '🌿',
    effect: 'fireflies',
    swatch: ['#10b981', '#047857', '#84cc16', '#34d399'],
  },
  {
    id: 'sunset',
    nameEn: 'Sunset',
    nameFa: 'غروب',
    emoji: '🌅',
    effect: 'glow',
    swatch: ['#f43f5e', '#be123c', '#f97316', '#fb7185'],
  },
  {
    id: 'midnight',
    nameEn: 'Midnight Neon',
    nameFa: 'نیمه‌شب نئون',
    emoji: '🌙',
    effect: 'stars',
    swatch: ['#8b5cf6', '#a78bfa', '#22d3ee', '#e6e6f0'],
    dark: true,
  },
];

export const DEFAULT_THEME = 'digital';

export function getTheme(id: string | null | undefined): SiteTheme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
