import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostDetail } from '@/components/site/BlogView';
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

  return (
    <PostDetail
      post={detail.post}
      related={detail.related.map((r) => ({ ...r, categories: [] }))}
    />
  );
}
