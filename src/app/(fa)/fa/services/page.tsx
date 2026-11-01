import type { Metadata } from 'next';
import { ServicesView } from '@/components/site/ServicesView';
import { JsonLd } from '@/components/site/JsonLd';

// Static Persian twin of src/app/(site)/services/page.tsx (audit section 2,
// fix #1 — the fa tree): the (fa) root layout ships <html lang="fa" dir="rtl">
// and lang-context pins lang='fa' on /fa*, so ServicesView renders the same
// block with the Persian dictionary strings at BUILD time — crawlable with
// zero JS.
export const metadata: Metadata = {
  title: { absolute: 'چه کاری انجام می‌دهم | مهرداد — سازنده مستقل محصول' },
  description:
    'یک فرایند، نه هشت خدمت — مسئلهٔ واقعی را طراحی می‌کنم، با هوش مصنوعی سریع می‌سازم و آنچه جواب داد را منتشر می‌کنم.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/fa/services',
    languages: { en: '/services', fa: '/fa/services', 'x-default': '/services' },
  },
  openGraph: {
    title: 'چه کاری انجام می‌دهم — مهرداد',
    description:
      'یک فرایند، نه هشت خدمت — مسئلهٔ واقعی را طراحی می‌کنم، با هوش مصنوعی سریع می‌سازم و آنچه جواب داد را منتشر می‌کنم.',
    url: '/fa/services',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'چه کاری انجام می‌دهم — مهرداد',
    description:
      'یک فرایند، نه هشت خدمت — مسئلهٔ واقعی را طراحی می‌کنم، با هوش مصنوعی سریع می‌سازم و آنچه جواب داد را منتشر می‌کنم.',
  },
};

// Same entity shape as the EN /services schema, anchored to the Persian URL
// so search engines attach the Persian surface to the same Person entity.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const servicesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${base}/fa/services#service-fa`,
  name: 'مهرداد — طراحی محصول و ساخت سریع با هوش مصنوعی',
  url: `${base}/fa/services`,
  description:
    'یک فرایند، نه هشت خدمت — مسئلهٔ واقعی را طراحی می‌کنم، با هوش مصنوعی سریع می‌سازم و آنچه جواب داد را منتشر می‌کنم.',
  provider: { '@id': `${base}/#person` },
  areaServed: 'Worldwide',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'همکاری‌ها',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'اسپرینت MVP با هوش مصنوعی', url: `${base}/mvp-sprint` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'مهندسی استقرار پیشرو (FDE)', url: `${base}/fde` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'تعیین دامنهٔ MVP — رایگان', url: `${base}/scope-builder` } },
    ],
  },
};

export default function FaServicesPage() {
  return (
    <>
      <JsonLd data={servicesSchema} />
      <ServicesView />
    </>
  );
}
