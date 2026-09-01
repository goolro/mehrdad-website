/**
 * Generates src/lib/wp-redirects.json — a lookup map from every old
 * WordPress URL path (encoded + decoded forms) to the new hash route.
 * Used by src/middleware.ts to 301-redirect old links (SEO).
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const db = new PrismaClient();

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

async function main() {
  const posts = await db.post.findMany({ where: { wpId: { not: null } }, select: { wpId: true, slug: true } });

  const paths: Record<string, string> = {};

  // 1. post slugs — encoded (as stored/served by WP) and decoded forms
  for (const p of posts) {
    const target = `/#blog/${p.slug}`;
    const encoded = `/${p.slug}`;
    paths[encoded] = target;
    const decoded = safeDecode(p.slug);
    if (decoded !== p.slug) {
      paths[`/${decoded}`] = target;
    }
  }

  // 2. wpId lookups (?p= & ?page_id=)
  const wpIds: Record<string, string> = {};
  for (const p of posts) wpIds[String(p.wpId)] = `/#blog/${p.slug}`;

  // 3. known WP pages → view routes
  const extras: Record<string, string> = {
    '/blog': '/#blog',
    '/services': '/#services',
    '/contact': '/#contact',
    '/contact-us': '/#contact',
    '/about': '/#about',
    '/about-us': '/#about',
    '/participation-in-projects': '/#projects',
    '/home': '/',
    '/s/invest.html': '/#projects',
    '/s/invest-fa.html': '/#projects',
    '/s/invest-ar.html': '/#projects',
    '/feed': '/',
    '/comments/feed': '/',
    '/wp-json': '/',
    '/wp-sitemap.xml': '/',
    '/logo': '/',
  };

  const out = { paths: { ...paths, ...extras }, wpIds };
  fs.writeFileSync('/home/z/my-project/src/lib/wp-redirects.json', JSON.stringify(out, null, 0), 'utf-8');
  console.log(`wrote ${Object.keys(out.paths).length} path redirects + ${Object.keys(wpIds).length} wpId lookups`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
