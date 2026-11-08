/**
 * Compile-time feature flags — plain constants, deliberately NOT env vars:
 * the behavior must be identical on every host (Vercel, cPanel, Netlify)
 * with zero environment setup, and flipping one value restores the feature.
 */

/**
 * AI assistant (دستیار هوش مصنوعی) — DISABLED by owner request (2026-11).
 *
 * What this flag controls when `false`:
 *  - the floating chat widget and its dialog never render (ChatWidget);
 *  - every site CTA that opened the assistant is removed from the UI
 *    (home hero + AI section, header ✦ AI, about, contact, FDE hero/CTA,
 *    Koko case study, investors assistant strip, PWA ?chat=open shortcut);
 *  - POST /api/chat answers 410 with a friendly pointing-to-humans reply
 *    (the standalone deck chat twin degrades to that same message) and
 *    POST /api/chat/contact refuses leads with 410.
 *
 * No LLM call, KB crawl or DB write can happen while it is off — the flag
 * is checked before any of those code paths.
 *
 * Set to `true` to restore the assistant exactly as it was.
 */
export const AI_ASSISTANT_ENABLED = false;
