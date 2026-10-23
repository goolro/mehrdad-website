/**
 * External live link per project slug — e.g. a playable game build that
 * lives on its own domain. Rendered by ProjectDetail (/work/<slug>) as the
 * primary CTA when the slug has an entry here.
 *
 * Deliberately a tiny typed map instead of a new Project DB column: a
 * column would need a coordinated production Postgres migration, while a
 * slug-keyed map ships as pure code. Graduates to a nullable `link`
 * column on the Project model if many projects ever need external links.
 */
export const PROJECT_LINKS: Record<string, string> = {
  'quiz-of-koko': 'https://quizofkoko.com',
  'traffic-tempo': 'https://cafebazaar.ir/app/com.traffictempo.game',
  'driving-exam': 'https://cafebazaar.ir/app/mix.azmon.app',
};

/**
 * Optional per-slug CTA microcopy for the external link — the default CTA
 * reads «Play now» (game-oriented, Gamepad icon). A non-game product (e.g.
 * the driving-exam app) overrides it so the button says what actually
 * happens. Same slug-keyed pure-code pattern as PROJECT_LINKS: content
 * travels with git, no DB column, traffic-tempo etc. stay untouched.
 */
export const PROJECT_LINK_CTA: Record<string, { labelEn: string; labelFa: string }> = {
  'driving-exam': { labelEn: 'Get it on Cafe Bazaar', labelFa: 'دریافت از بازار' },
};

/**
 * Optional SECOND live link per project slug — for products that exist in
 * more than one place. quiz-of-koko plays on the web (quizofkoko.com) AND
 * ships as an Android app on Cafe Bazaar (owner link, verified HTTP 200
 * 2026-10-13). driving-exam is on Cafe Bazaar (primary CTA) AND on Myket
 * (owner link 2026-10-22: «اینو برای برنامه مرتبط بزار در صفحه خودش»,
 * verified HTTP 200 on 2026-10-22). Rendered by ProjectDetail as a
 * secondary button beside the primary CTA so all distribution channels
 * read as one system — the same one-product-story pattern traffic-tempo
 * uses for its Bazaar link + browser demo. Every other project stays
 * untouched.
 */
export const PROJECT_EXTRA_LINKS: Record<
  string,
  { href: string; labelEn: string; labelFa: string }
> = {
  'quiz-of-koko': {
    href: 'https://cafebazaar.ir/app/com.quizofkoko.game',
    labelEn: 'Get it on Cafe Bazaar',
    labelFa: 'دریافت از بازار',
  },
  'driving-exam': {
    href: 'https://myket.ir/app/mix.azmon.app',
    labelEn: 'Get it on Myket',
    labelFa: 'دریافت از مایکت',
  },
};

/** validated secondary link for a slug, or null when the project has none */
export function getProjectExtraLink(
  slug: string,
): { href: string; labelEn: string; labelFa: string } | null {
  const extra = PROJECT_EXTRA_LINKS[slug];
  if (!extra) return null;
  try {
    // parse once here — a malformed entry must never render as an href
    return { ...extra, href: new URL(extra.href).toString() };
  } catch {
    return null;
  }
}

/**
 * Optional Telegram channel per project slug — the product's own broadcast
 * channel (owner order 2026-10-23: «https://t.me/quizofkoko ادرس کانال تلگرام
 * را توی سایت بزار» + the official @QUIZOFKOKO QR image he uploaded). Rendered
 * by ProjectDetail as a third CTA button (paper-plane icon) inside the
 * live-links card, with the QR thumbnail underneath so desktop visitors can
 * scan it straight into their phone. Same pure-code pattern as every map in
 * this file: content travels with git, no DB column, other projects untouched.
 * NOTE: currently rendered inside the playLink card — every slug listed here
 * must therefore also have a PROJECT_LINKS entry until the card is decoupled.
 */
export const PROJECT_TELEGRAM: Record<
  string,
  { href: string; labelEn: string; labelFa: string; handle: string; qr: string }
> = {
  'quiz-of-koko': {
    href: 'https://t.me/quizofkoko',
    labelEn: 'Telegram channel',
    labelFa: 'کانال تلگرام',
    handle: '@quizofkoko',
    qr: '/media/quizofkoko-telegram-qr.png',
  },
};

/** validated Telegram channel info for a slug, or null when the project has none */
export function getProjectTelegram(
  slug: string,
): { href: string; labelEn: string; labelFa: string; handle: string; qr: string } | null {
  const tg = PROJECT_TELEGRAM[slug];
  if (!tg) return null;
  try {
    // parse once here — a malformed entry must never render as an href
    return { ...tg, href: new URL(tg.href).toString() };
  } catch {
    return null;
  }
}

/**
 * Investor pitch deck per project slug (owner order 2026-10-16: on
 * /work/health-app say the pitch deck is live and link BOTH language
 * versions — «بگی پیچ دک داریم و … و اینم لینکشه»). Same pure-code pattern
 * as every map in this file: content travels with git, production Postgres
 * stays untouched. The deck pages are the standalone /deck/* surfaces
 * (D-035/D-036) — they have no site chrome and no back link, so they open
 * in a new tab and the project page stays open.
 */
export const PROJECT_PITCH_DECKS: Record<
  string,
  { deckEn: string; deckFa: string; noteEn: string; noteFa: string }
> = {
  'health-app': {
    deckEn: 'https://mehrdad.ir/deck/health',
    deckFa: 'https://mehrdad.ir/deck/health/fa',
    noteEn: 'The full pitch deck of this product is live — in both Persian and English:',
    noteFa: 'پیچ دک کامل این محصول منتشر شده است — به هر دو زبان فارسی و انگلیسی:',
  },
};

/** validated pitch-deck links for a slug, or null when the project has none */
export function getProjectPitchDecks(
  slug: string,
): { deckEn: string; deckFa: string; noteEn: string; noteFa: string } | null {
  const deck = PROJECT_PITCH_DECKS[slug];
  if (!deck) return null;
  try {
    // parse once here — a malformed entry must never render as an href
    return {
      ...deck,
      deckEn: new URL(deck.deckEn).toString(),
      deckFa: new URL(deck.deckFa).toString(),
    };
  } catch {
    return null;
  }
}

/** validated external link for a slug, or null when the project has none */
export function getProjectLink(slug: string): string | null {
  const link = PROJECT_LINKS[slug];
  if (!link) return null;
  try {
    // parse once here — a malformed entry must never render as an href
    return new URL(link).toString();
  } catch {
    return null;
  }
}

/** CTA microcopy override for a slug, or null when it should use the default */
export function getProjectLinkCta(slug: string): { labelEn: string; labelFa: string } | null {
  return PROJECT_LINK_CTA[slug] ?? null;
}

/** hostname of the external link (for CTA microcopy), or null */
export function getProjectLinkHost(slug: string): string | null {
  const link = PROJECT_LINKS[slug];
  if (!link) return null;
  try {
    return new URL(link).hostname;
  } catch {
    return null;
  }
}
