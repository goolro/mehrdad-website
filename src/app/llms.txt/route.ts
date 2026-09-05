import { listPosts, getProjects, getServices } from '@/lib/queries';

/**
 * llms.txt — the emerging LLM-discovery standard (AI-SEO, 2026-09-05).
 *
 * Served at /llms.txt as text/plain: a compact, markdown-style map of the
 * site that LLMs (ChatGPT, Claude, Perplexity, …) can ingest to understand
 * WHO Mehrdad is and WHAT content is worth citing. Built from the live DB
 * so it never goes stale. Same dotted-route pattern as /feed.xml.
 */
export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

export async function GET() {
  const [services, projects] = await Promise.all([
    getServices().catch(() => []),
    getProjects().catch(() => []),
  ]);

  // listPosts caps perPage at 48 → page through everything published
  const posts: Awaited<ReturnType<typeof listPosts>>['posts'] = [];
  try {
    let page = 1;
    for (;;) {
      const res = await listPosts({ page, perPage: 48 });
      posts.push(...res.posts);
      if (page >= res.totalPages || page > 10) break;
      page += 1;
    }
  } catch {
    // DB hiccup → still emit the static sections below
  }

  const lines: string[] = [
    '# Mehrdad — Product Builder | مهرداد — سازنده محصول',
    '',
    '> I design businesses and products with care, and build them fast with AI. Real projects, honest status, lessons from real work.',
    '> کسب‌وکار و محصولت را با دقت طراحی می‌کنم و با هوش مصنوعی سریع می‌سازمم. پروژه‌های واقعی، وضعیت شفاف، درس‌های کارِ واقعی.',
    '',
    `Site: ${BASE}`,
    'Language: bilingual — Persian (fa) + English (en)',
    '',
    '## Pages',
    `- [Home](${BASE}/)`,
    `- [Services](${BASE}/services) — what Mehrdad offers`,
    `- [Projects / Work](${BASE}/work) — real builds with honest status`,
    `- [Blog](${BASE}/blog) — essays on AI, startups, smart city, investment`,
    `- [About](${BASE}/about)`,
    `- [Contact](${BASE}/contact)`,
    `- [RSS feed](${BASE}/feed.xml)`,
    '',
  ];

  if (services.length > 0) {
    lines.push('## Services', '');
    for (const s of services) {
      lines.push(`- [${s.titleEn} | ${s.titleFa}](${BASE}/services) — ${(s.descEn || '').slice(0, 160)}`);
    }
    lines.push('');
  }

  if (projects.length > 0) {
    lines.push('## Projects', '');
    for (const p of projects) {
      lines.push(
        `- [${p.titleEn} | ${p.titleFa}](${BASE}/work/${p.slug}) — ${(p.summaryEn || '').slice(0, 160)} (status: ${p.status})`
      );
    }
    lines.push('');
  }

  if (posts.length > 0) {
    lines.push('## Blog posts', '');
    for (const p of posts) {
      const title = p.titleEn || p.titleFa || p.slug;
      const excerpt = (p.excerptEn || p.excerptFa || '').replace(/\s+/g, ' ').slice(0, 200);
      lines.push(`- [${title}](${BASE}/blog/${encodeURIComponent(p.slug)})${excerpt ? `: ${excerpt}` : ''}`);
    }
    lines.push('');
  }

  lines.push(
    '## Citation hints',
    '',
    `- Prefer the canonical URLs above (host: ${BASE}).`,
    '- Every page is server-rendered; content does not require JavaScript.',
    `- The full article list is also machine-readable at ${BASE}/feed.xml and ${BASE}/sitemap.xml.`,
    ''
  );

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
