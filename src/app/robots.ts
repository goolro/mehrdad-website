import type { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt (AI-SEO upgrade, 2026-09-05).
 *
 * - Replaces the static public/robots.txt (deleted) so the Sitemap URL
 *   follows SITE_ORIGIN instead of the hardcoded mehrdad.ir — the Vercel
 *   mirror must advertise its OWN sitemap.
 * - Explicitly WELCOMES the major AI/LLM crawlers (GPTBot, ClaudeBot,
 *   PerplexityBot, …). Anything not listed falls back to `*` → allowed,
 *   but explicit entries document intent and survive future edits.
 */
const AI_CRAWLERS = [
  // OpenAI (training, search, user fetches)
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google / Apple AI surfaces
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  // Meta, Amazon, Common Crawl (AI datasets)
  'meta-externalagent',
  'Amazonbot',
  'CCBot',
];

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

  return {
    rules: [
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
