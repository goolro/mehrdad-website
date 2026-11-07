import type { Metadata } from 'next';
import { SocialMediaPlans } from '@/components/site/SocialMediaPlans';
import { JsonLd } from '@/components/site/JsonLd';

// Persian money page — the social-media tariff panel at /fa/social-media,
// with a full English twin at /social-media (owner request 2026-11-07:
// «سایت ما دو زبانه است — سئو هم رعایت کن»). Both sides of the pair carry
// the same hreflang triple; plan «توضیحات بیشتر» copy lives on standalone
// detail pages (/fa/social-media/[plan]). Static + crawlable: server
// component, the panel copy ships in the prerendered HTML.
export const metadata: Metadata = {
  title: { absolute: 'تعرفه مدیریت سوشال‌مدیا — پلن‌های ماهانه از ۵۹ دلار | مهرداد' },
  description:
    'پیج تو را سیستم راه می‌اندازد: محتوای اختصاصی، انتشار منظم و پاسخ دایرکت — هر روز، بدون وقفه. پلن اتومات ۵۹ دلار · همراه ۷۵ دلار · بیزینس ۲۴۵ دلار در ماه · پلن شبکه برای مدیریت انبوه اکانت‌ها. بدون قفل قرارداد، تسویهٔ تومانی.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/fa/social-media',
    languages: {
      en: '/social-media',
      fa: '/fa/social-media',
      'x-default': '/social-media',
    },
  },
  openGraph: {
    title: 'تعرفه مدیریت سوشال‌مدیا با هوش مصنوعی — مهرداد',
    description:
      'محتوای اختصاصی، انتشار منظم و پاسخ دایرکت — هر روز، بدون وقفه. پلن اتومات ۵۹ دلار · همراه ۷۵ دلار · بیزینس ۲۴۵ دلار در ماه. بدون قفل قرارداد.',
    url: '/fa/social-media',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تعرفه مدیریت سوشال‌مدیا با هوش مصنوعی — مهرداد',
    description:
      'محتوای اختصاصی، انتشار منظم و پاسخ دایرکت — هر روز، بدون وقفه. پلن اتومات ۵۹ دلار · همراه ۷۵ دلار · بیزینس ۲۴۵ دلار در ماه. بدون قفل قرارداد.',
  },
};

// Same entity pattern as /fa/pricing: anchored to the Person entity so the
// offer catalog attaches to the site entity graph.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const plansSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${base}/fa/social-media#social-plans`,
  name: 'مهرداد — مدیریت سوشال‌مدیا با هوش مصنوعی',
  url: `${base}/fa/social-media`,
  provider: { '@id': `${base}/#person` },
  areaServed: 'IR',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'پلن‌های مدیریت سوشال‌مدیا',
    itemListElement: [
      { '@type': 'Offer', name: 'پلن اتومات — ۱۲ پست + ۸ استوری در ماه، پاسخ دایرکت خودکار', price: '59', priceCurrency: 'USD', url: `${base}/fa/social-media/auto` },
      { '@type': 'Offer', name: 'پلن همراه — بازبینی انسانی هر محتوا و پیام مهم', price: '75', priceCurrency: 'USD', url: `${base}/fa/social-media/companion` },
      { '@type': 'Offer', name: 'پلن بیزینس — ۴ ریلز، جلسه استراتژی، گزارش هفتگی', price: '245', priceCurrency: 'USD', url: `${base}/fa/social-media/business` },
      { '@type': 'Offer', name: 'ساخت اکانت (حالت اول — با ایمیل و شماره خودت)', price: '17', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'ساخت اکانت (حالت دوم — شماره و جیمیل امن + ۷ روز گرم‌سازی)', price: '21', priceCurrency: 'USD' },
    ],
  },
};

export default function FaSocialMediaPage() {
  return (
    <>
      <JsonLd data={plansSchema} />
      <SocialMediaPlans lang="fa" />
    </>
  );
}
