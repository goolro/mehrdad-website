import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostDetail } from '@/components/site/BlogView';
import { JsonLd } from '@/components/site/JsonLd';
import { getPostDetail } from '@/lib/queries';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPostDetail(slug).catch(() => null);
  if (!detail) return { title: 'Article not found | Mehrdad' };

  const { post } = detail;
  const title = post.titleEn || post.titleFa || 'Article';
  const description =
    post.excerptEn || post.excerptFa || 'An article by Mehrdad — product builder.';
  const published = typeof post.date === 'string' ? post.date : post.date.toISOString();

  return {
    title: `${title} | Mehrdad`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: published,
      url: `/blog/${post.slug}`,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getPostDetail(slug);
  // unknown or unpublished slugs → real 404 (also covers old WP
  // /blog/<slug> links whose content never migrated)
  if (!detail) notFound();

  const { post } = detail;
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  const pageUrl = `${base}/blog/${post.slug}`;
  const headline = post.titleEn || post.titleFa || 'Article';
  const altHeadline = post.titleEn && post.titleFa ? (headline === post.titleEn ? post.titleFa : post.titleEn) : undefined;
  const published = typeof post.date === 'string' ? post.date : post.date.toISOString();
  const modified = typeof post.updatedAt === 'string' ? post.updatedAt : post.updatedAt.toISOString();

  // AI-SEO: BlogPosting + Breadcrumb — what ChatGPT/Claude/Perplexity/
  // Google AI parse to attribute and cite the article correctly
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${pageUrl}#article`,
        headline,
        ...(altHeadline ? { alternativeHeadline: altHeadline } : {}),
        description: post.excerptEn || post.excerptFa || undefined,
        datePublished: published,
        dateModified: modified,
        inLanguage: ['fa', 'en'],
        author: { '@type': 'Person', '@id': `${base}/#person`, name: 'Mehrdad', url: `${base}/` },
        publisher: { '@type': 'Person', '@id': `${base}/#person`, name: 'Mehrdad' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        ...(post.cover ? { image: [post.cover] } : {}),
        ...(detail.post.tags.length > 0
          ? { keywords: detail.post.tags.map((t) => t.nameEn || t.nameFa || t.slug).join(', ') }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/blog` },
          { '@type': 'ListItem', position: 3, name: headline, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PostDetail
        post={detail.post}
        related={detail.related.map((r) => ({ ...r, categories: [] }))}
        shareUrl={pageUrl}
      />
    </>
  );
}
