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
 * Optional social channels with scannable QR per project slug — the
 * product's own broadcast/community surfaces (owner orders 2026-10-23:
 * «https://t.me/quizofkoko ادرس کانال تلگرام را توی سایت بزار» + Telegram QR,
 * then «https://www.instagram.com/quizofkoko/ پس اینستاگرام هم در همین باکسی
 * که تلگرام را گذاشتی بزار» + the Instagram QR). Rendered by ProjectDetail as
 * ONE social card inside the live-links box: one big QR per channel, the
 * channel URL as a selectable link directly under its QR (owner feedback:
 * QR big, link below it). Same pure-code pattern as every map in this file:
 * content travels with git, no DB column, other projects untouched.
 * NOTE: currently rendered inside the playLink card — every slug listed here
 * must therefore also have a PROJECT_LINKS entry until the card is decoupled.
 */
export const PROJECT_SOCIALS: Record<
  string,
  Array<{ href: string; titleEn: string; titleFa: string; qr: string }>
> = {
  'quiz-of-koko': [
    {
      href: 'https://t.me/quizofkoko',
      titleEn: 'Telegram channel',
      titleFa: 'کانال تلگرام',
      qr: '/media/quizofkoko-telegram-qr.png',
    },
    {
      href: 'https://www.instagram.com/quizofkoko/',
      titleEn: 'Instagram',
      titleFa: 'اینستاگرام',
      qr: '/media/quizofkoko-instagram-qr.png',
    },
  ],
};

/** validated social channels for a slug, or null when the project has none */
export function getProjectSocials(
  slug: string,
): Array<{ href: string; titleEn: string; titleFa: string; qr: string }> | null {
  const socials = PROJECT_SOCIALS[slug];
  if (!socials || socials.length === 0) return null;
  try {
    // parse once here — a malformed entry must never render as an href
    return socials.map((s) => ({ ...s, href: new URL(s.href).toString() }));
  } catch {
    return null;
  }
}

/**
 * Investor pitch deck per project slug (owner order 2026-10-16: on
 * /work/health-app say the pitch deck is live and link BOTH language
 * versions — «بگی پیچ دک داریم و … و اینم لینکشه»). Same pure-code pattern
 * as every map in this file: content travels with git, production Postgres
 * stays untouched. The deck pages are the standalone /deck/* and /s/*
 * surfaces (D-035/D-036/D-045) — they have no site chrome and no back link,
 * so they open in a new tab and the project page stays open.
 *
 * deckFa is OPTIONAL: health-app has two standalone language versions
 * (EN + FA mirror), so both buttons render with language labels. A product
 * with ONE deck page (kilika-fintech — the owner's restored KLIKA one-pager,
 * owner order 2026-10-20 «اینو بررسی کن بعنوان پیج دک … و فقط لینک بشه به
 * دامنه اصلی سایت», connected from /work/kilika-fintech per owner order
 * 2026-10-25) omits deckFa and gets a single unlabelled button.
 */
export const PROJECT_PITCH_DECKS: Record<
  string,
  { deckEn: string; deckFa?: string; noteEn: string; noteFa: string }
> = {
  'health-app': {
    deckEn: 'https://mehrdad.ir/deck/health',
    deckFa: 'https://mehrdad.ir/deck/health/fa',
    noteEn: 'The full pitch deck of this product is live — in both Persian and English:',
    noteFa: 'پیچ دک کامل این محصول منتشر شده است — به هر دو زبان فارسی و انگلیسی:',
  },
  'kilika-fintech': {
    deckEn: 'https://mehrdad.ir/s/kilika.html',
    noteEn: 'The full pitch deck of this product is live:',
    noteFa: 'پیچ دک کامل این محصول منتشر شده است:',
  },
};

/** validated pitch-deck links for a slug, or null when the project has none */
export function getProjectPitchDecks(
  slug: string,
): { deckEn: string; deckFa: string | null; noteEn: string; noteFa: string } | null {
  const deck = PROJECT_PITCH_DECKS[slug];
  if (!deck) return null;
  try {
    // parse once here — a malformed entry must never render as an href
    return {
      ...deck,
      deckEn: new URL(deck.deckEn).toString(),
      deckFa: deck.deckFa ? new URL(deck.deckFa).toString() : null,
    };
  } catch {
    return null;
  }
}

/**
 * Blog series that ARE a pitch deck, published one slide per post (owner
 * order 2026-10-25: «پیج دک هم اول و اخر متن معرفی بشه» — the pitch-deck
 * page must be introduced at the beginning AND the end of the text). The
 * vivora-deck-* posts ARE the health-app deck slide by slide, and the
 * owner's own first paragraph already introduces the interactive deck at
 * the TOP of every post in the series (live-verified 2026-10-25), so the
 * site completes that system with the END-of-text deck box (PostDetail).
 * Keyed by slug prefix; each entry maps to the PROJECT_PITCH_DECKS entry
 * that owns the deck URLs + bilingual note — ONE source of truth for deck
 * copy across work pages and blog series (D-054).
 */
export const BLOG_SERIES_PITCH_DECKS: Array<{ prefix: string; projectSlug: string }> = [
  { prefix: 'vivora-deck-', projectSlug: 'health-app' },
];

/** pitch deck of the series a blog-post slug belongs to, or null when the post is not part of a deck series */
export function getSeriesPitchDeck(
  slug: string,
): { deckEn: string; deckFa: string | null; noteEn: string; noteFa: string } | null {
  const series = BLOG_SERIES_PITCH_DECKS.find((s) => slug.startsWith(s.prefix));
  if (!series) return null;
  return getProjectPitchDecks(series.projectSlug);
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
