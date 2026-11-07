import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SocialMediaPlanDetail } from '@/components/site/SocialMediaPlanDetail';
import { JsonLd } from '@/components/site/JsonLd';
import { PLANS, SECTION_UI, isSocialPlanId } from '@/components/site/social-media-plans-data';

// English detail page for one social-media plan (/social-media/[plan]) —
// hreflang twin of /fa/social-media/[plan]. Slugs identical on both trees.
export const dynamic = 'force-static';

export function generateStaticParams() {
  return Object.keys(PLANS.en).map((plan) => ({ plan }));
}

type Props = { params: Promise<{ plan: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { plan } = await params;
  if (!isSocialPlanId(plan)) return { title: { absolute: 'Not found | Mehrdad' } };
  const copy = PLANS.en[plan as keyof typeof PLANS.en];
  return {
    title: { absolute: `${copy.detail.h1} — ${copy.price}/mo | Mehrdad` },
    description: copy.detail.intro,
    alternates: {
      canonical: `/social-media/${plan}`,
      languages: {
        en: `/social-media/${plan}`,
        fa: `/fa/social-media/${plan}`,
        'x-default': `/social-media/${plan}`,
      },
    },
    openGraph: {
      title: `${copy.detail.h1} — ${copy.price}/mo | Mehrdad`,
      description: copy.detail.intro,
      url: `/social-media/${plan}`,
      siteName: 'mehrdad.ir',
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['fa_IR'],
    },
  };
}

const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

export default async function SocialPlanPage({ params }: Props) {
  const { plan } = await params;
  if (!isSocialPlanId(plan)) notFound();
  const copy = PLANS.en[plan];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${base}/social-media/${plan}#plan`,
      name: copy.detail.h1,
      description: copy.detail.intro,
      url: `${base}/social-media/${plan}`,
      brand: { '@type': 'Brand', name: 'Mehrdad' },
      offers: {
        '@type': 'Offer',
        price: copy.price.replace('$', ''),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${base}/social-media/${plan}`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SECTION_UI.en.breadcrumbHome, item: `${base}/` },
        { '@type': 'ListItem', position: 2, name: SECTION_UI.en.breadcrumbPlans, item: `${base}/social-media` },
        { '@type': 'ListItem', position: 3, name: copy.name, item: `${base}/social-media/${plan}` },
      ],
    },
  ];

  return (
    <>
      {schema.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
      <SocialMediaPlanDetail lang="en" planId={plan} />
    </>
  );
}
