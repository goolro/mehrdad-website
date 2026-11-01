import type { Metadata } from 'next';
import { ContactView } from '@/components/site/ContactView';
import { JsonLd } from '@/components/site/JsonLd';

// Static Persian twin of src/app/(site)/contact/page.tsx (audit section 2,
// fix #1 — the fa tree). See (fa)/fa/services/page.tsx for the mechanism.
export const metadata: Metadata = {
  title: { absolute: 'تماس با مهرداد — سازنده مستقل محصول' },
  description:
    'یک مسیر روشن برای شروع گفتگو: راهکارهای هوش مصنوعی و محصول، پروژه‌ها، همکاری یا آشنایی.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/fa/contact',
    languages: { en: '/contact', fa: '/fa/contact', 'x-default': '/contact' },
  },
  openGraph: {
    title: 'تماس با مهرداد',
    description:
      'یک مسیر روشن برای شروع گفتگو: راهکارهای هوش مصنوعی و محصول، پروژه‌ها، همکاری یا آشنایی.',
    url: '/fa/contact',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تماس با مهرداد',
    description:
      'یک مسیر روشن برای شروع گفتگو: راهکارهای هوش مصنوعی و محصول، پروژه‌ها، همکاری یا آشنایی.',
  },
};

// ContactPage schema mirroring the EN one, anchored to the Persian URL.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${base}/fa/contact#contactpage-fa`,
  url: `${base}/fa/contact`,
  name: 'تماس با مهرداد',
  description:
    'یک مسیر روشن برای شروع گفتگو: راهکارهای هوش مصنوعی و محصول، پروژه‌ها، همکاری یا آشنایی.',
  inLanguage: 'fa-IR',
  mainEntity: { '@id': `${base}/#person` },
};

export default function FaContactPage() {
  return (
    <>
      <JsonLd data={contactSchema} />
      <ContactView />
    </>
  );
}
