import { readFile } from 'node:fs/promises';

/**
 * Shared font + palette for opengraph-image routes (SEO-growth, 2026-09-08).
 *
 * Vazirmatn covers BOTH Persian and Latin glyphs, so a single embedded font
 * renders every card (no satori "missing glyph" tofu). satori canNOT parse
 * WOFF2 ("Unsupported OpenType signature wOF2") — the site's variable woff2
 * is for the browser; these static TTFs are only for image generation.
 * Loading follows the official next/og pattern — `new URL(rel,
 * import.meta.url)` — which the bundler traces into serverless output.
 */
export type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };

let cache: OgFont[] | null = null;

async function load(file: string): Promise<ArrayBuffer> {
  try {
    return (await readFile(new URL(`../fonts/${file}`, import.meta.url))).buffer as ArrayBuffer;
  } catch {
    return fetch(new URL(`../fonts/${file}`, import.meta.url)).then((r) => r.arrayBuffer());
  }
}

export async function ogFonts(): Promise<OgFont[]> {
  if (cache) return cache;
  cache = [
    { name: 'Vazirmatn', data: await load('Vazirmatn-Regular.ttf'), weight: 400, style: 'normal' },
    { name: 'Vazirmatn', data: await load('Vazirmatn-Bold.ttf'), weight: 700, style: 'normal' },
  ];
  return cache;
}

/** Brand palette — matches the site theme (violet on deep violet) */
export const OG = {
  bg: '#0e0a18',
  card: '#17102b',
  violet: '#7c3aed',
  violetSoft: '#a78bfa',
  emerald: '#10b981',
  text: '#f5f3ff',
  muted: '#b4a9d6',
  dim: '#8b7fae',
  border: 'rgba(167,139,250,0.25)',
} as const;
