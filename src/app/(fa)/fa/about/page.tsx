import type { Metadata } from 'next';
import { AboutView } from '@/components/site/AboutView';
import { JsonLd } from '@/components/site/JsonLd';

// Static Persian twin of src/app/(site)/about/page.tsx (audit section 2,
// fix #1 — the fa tree). See (fa)/fa/services/page.tsx for the mechanism.
export const metadata: Metadata = {
  title: { absolute: 'درباره مهرداد — سازنده مستقل محصول' },
  description:
    'سازندهٔ مستقل محصول — حلقهٔ مهندسی استقرار پیشرو که کوئیز کوکو را از صفحهٔ سفید به بازی زندهٔ هوش مصنوعی رساند. نتیجه تحویل می‌دهم، نه ساعت.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/fa/about',
    languages: { en: '/about', fa: '/fa/about', 'x-default': '/about' },
  },
  openGraph: {
    title: 'درباره مهرداد',
    description:
      'سازندهٔ مستقل محصول — حلقهٔ مهندسی استقرار پیشرو که کوئیز کوکو را از صفحهٔ سفید به بازی زندهٔ هوش مصنوعی رساند.',
    url: '/fa/about',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'درباره مهرداد',
    description:
      'سازندهٔ مستقل محصول — حلقهٔ مهندسی استقرار پیشرو که کوئیز کوکو را از صفحهٔ سفید به بازی زندهٔ هوش مصنوعی رساند.',
  },
};

// AboutPage schema mirroring the EN one, anchored to the Persian URL and
// referencing the same Person @id from the home-page graph.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${base}/fa/about#aboutpage-fa`,
  url: `${base}/fa/about`,
  name: 'درباره مهرداد',
  description:
    'سازندهٔ مستقل محصول — حلقهٔ مهندسی استقرار پیشرو که کوئیز کوکو را از صفحهٔ سفید به بازی زندهٔ هوش مصنوعی رساند. نتیجه تحویل می‌دهم، نه ساعت.',
  inLanguage: 'fa-IR',
  mainEntity: { '@id': `${base}/#person` },
};

export default function FaAboutPage() {
  return (
    <>
      <JsonLd data={aboutSchema} />
      <AboutView />
    </>
  );
}
