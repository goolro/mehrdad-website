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
};

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
