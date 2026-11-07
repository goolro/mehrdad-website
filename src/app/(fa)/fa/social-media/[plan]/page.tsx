import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SocialMediaPlanDetail } from '@/components/site/SocialMediaPlanDetail';
import { JsonLd } from '@/components/site/JsonLd';
import { PLANS, SECTION_UI, isSocialPlanId } from '@/components/site/social-media-plans-data';

// Standalone Persian detail page for one social-media plan
// (/fa/social-media/[plan]) — the «توضیحات بیشتر» copy of each plan on its
// own crawlable URL (owner request 2026-11-07). hreflang-paired 1:1 with
// the English twin /social-media/[plan]; slugs are identical on both trees.
export const dynamic = 'force-static';

export function generateStaticParams() {
  return Object.keys(PLANS.fa).map((plan) => ({ plan }));
}

type Props = { params: Promise<{ plan: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { plan } = await params;
  if (!isSocialPlanId(plan)) return { title: { absolute: 'یافت نشد | مهرداد' } };
  const copy = PLANS.fa[plan as keyof typeof PLANS.fa];
  return {
    title: { absolute: `${copy.detail.h1} — ${copy.price} در ماه | مهرداد` },
    description: `${copy.detail.intro} ${copy.tag}`,
    alternates: {
      canonical: `/fa/social-media/${plan}`,
      languages: {
        en: `/social-media/${plan}`,
        fa: `/fa/social-media/${plan}`,
        'x-default': `/social-media/${plan}`,
      },
    },
    openGraph: {
      title: `${copy.detail.h1} — ${copy.price} در ماه | مهرداد`,
      description: copy.detail.intro,
      url: `/fa/social-media/${plan}`,
      siteName: 'mehrdad.ir',
      type: 'website',
      locale: 'fa_IR',
      alternateLocale: ['en_US'],
    },
  };
}

const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

export default async function FaSocialPlanPage({ params }: Props) {
  const { plan } = await params;
  if (!isSocialPlanId(plan)) notFound();
  const copy = PLANS.fa[plan];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${base}/fa/social-media/${plan}#plan`,
      name: copy.detail.h1,
      description: copy.detail.intro,
      url: `${base}/fa/social-media/${plan}`,
      brand: { '@type': 'Brand', name: 'مهرداد' },
      offers: {
        '@type': 'Offer',
        price: copy.price.replace('$', ''),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${base}/fa/social-media/${plan}`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SECTION_UI.fa.breadcrumbHome, item: `${base}/fa` },
        { '@type': 'ListItem', position: 2, name: SECTION_UI.fa.breadcrumbPlans, item: `${base}/fa/social-media` },
        { '@type': 'ListItem', position: 3, name: copy.name, item: `${base}/fa/social-media/${plan}` },
      ],
    },
  ];

  return (
    <>
      {schema.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
      <SocialMediaPlanDetail lang="fa" planId={plan} />
    </>
  );
}
