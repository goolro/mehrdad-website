import type { Metadata } from 'next';
import { PricingView } from '@/components/site/PricingView';
import { JsonLd } from '@/components/site/JsonLd';

// Static Persian twin of src/app/(site)/pricing/page.tsx: the (fa) root
// layout ships <html lang="fa" dir="rtl"> and lang-context pins lang='fa'
// on /fa*, so PricingView renders the Persian dictionary strings at BUILD
// time — crawlable with zero JS. Survey fix #1 (2026-11): قیمت شفاف.
export const metadata: Metadata = {
  title: { absolute: 'قیمت‌ها — پیش‌فاکتور ثابت، اعداد رو و باز | مهرداد — سازنده مستقل محصول' },
  description:
    'هر همکاری یک پیش‌فاکتور ثابت است — نه محاسبهٔ ساعتی، نه فاکتور غافلگیرکننده. جلسهٔ دامنه‌یابی رایگان · جلسه استراتژی ۹۹ دلار · MVP تک‌قابلیت از ۴۹۰ دلار · اسپرینت کامل از ۱٬۴۹۰ دلار.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/fa/pricing',
    languages: { en: '/pricing', fa: '/fa/pricing', 'x-default': '/pricing' },
  },
  openGraph: {
    title: 'قیمت‌ها، رو و باز — مهرداد',
    description:
      'هر همکاری یک پیش‌فاکتور ثابت است — نه محاسبهٔ ساعتی، نه فاکتور غافلگیرکننده. جلسهٔ دامنه‌یابی رایگان · جلسه استراتژی ۹۹ دلار · MVP تک‌قابلیت از ۴۹۰ دلار · اسپرینت کامل از ۱٬۴۹۰ دلار.',
    url: '/fa/pricing',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'قیمت‌ها، رو و باز — مهرداد',
    description:
      'هر همکاری یک پیش‌فاکتور ثابت است — نه محاسبهٔ ساعتی، نه فاکتور غافلگیرکننده. جلسهٔ دامنه‌یابی رایگان · جلسه استراتژی ۹۹ دلار · MVP تک‌قابلیت از ۴۹۰ دلار · اسپرینت کامل از ۱٬۴۹۰ دلار.',
  },
};

// Same entity shape as the EN /pricing schema, anchored to the Persian URL
// so search engines attach the Persian surface to the same Person entity.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${base}/fa/pricing#pricing-fa`,
  name: 'مهرداد — طراحی محصول و ساخت سریع با هوش مصنوعی',
  url: `${base}/fa/pricing`,
  provider: { '@id': `${base}/#person` },
  areaServed: 'Worldwide',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'شکل‌های همکاری و قیمت‌ها',
    itemListElement: [
      { '@type': 'Offer', name: 'جلسه دامنه‌یابی (۱۵ دقیقه)', price: '0', priceCurrency: 'USD', url: `${base}/mvp-sprint` },
      { '@type': 'Offer', name: 'جلسه استراتژی — ۴۵ دقیقه + مستند ۲۴ ساعته', price: '99', priceCurrency: 'USD', url: `${base}/consult` },
      { '@type': 'Offer', name: 'MVP تک‌قابلیت (۱ تا ۲ هفته)', priceSpecification: { '@type': 'PriceSpecification', minPrice: '490', priceCurrency: 'USD' }, url: `${base}/mvp-sprint` },
      { '@type': 'Offer', name: 'اسپرینت کامل (حدود ۳۰ روز)', priceSpecification: { '@type': 'PriceSpecification', minPrice: '1490', priceCurrency: 'USD' }, url: `${base}/mvp-sprint` },
    ],
  },
};

export default function FaPricingPage() {
  return (
    <>
      <JsonLd data={pricingSchema} />
      <PricingView />
    </>
  );
}
