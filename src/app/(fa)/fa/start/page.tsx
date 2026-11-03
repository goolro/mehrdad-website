import type { Metadata } from 'next';
import { StartView } from '@/components/site/StartView';

// Static Persian twin of src/app/(site)/start/page.tsx: the (fa) root
// layout ships <html lang="fa" dir="rtl"> and lang-context pins lang='fa'
// on /fa*, so StartView renders the Persian dictionary strings at BUILD
// time — crawlable with zero JS. Survey fix #2 (2026-11): صفحهٔ ساده.
export const metadata: Metadata = {
  title: { absolute: 'شروع ساده — بدون اصطلاحات فنی | مهرداد — سازنده مستقل محصول' },
  description:
    'فنی نیستید؟ از همین‌جا شروع کنید. تماس ۱۵ دقیقه‌ای رایگان ← پیش‌فاکتور ثابت ← چیزی واقعی تحویل بگیرید. سه قدم ساده، چهار پاسخ صادقانه، قیمت‌های منتشرشده.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/fa/start',
    languages: { en: '/start', fa: '/fa/start', 'x-default': '/start' },
  },
  openGraph: {
    title: 'شروع ساده — بدون اصطلاحات فنی | مهرداد',
    description:
      'فنی نیستید؟ از همین‌جا شروع کنید. تماس ۱۵ دقیقه‌ای رایگان ← پیش‌فاکتور ثابت ← چیزی واقعی تحویل بگیرید. سه قدم ساده، چهار پاسخ صادقانه، قیمت‌های منتشرشده.',
    url: '/fa/start',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'شروع ساده — بدون اصطلاحات فنی | مهرداد',
    description:
      'فنی نیستید؟ از همین‌جا شروع کنید. تماس ۱۵ دقیقه‌ای رایگان ← پیش‌فاکتور ثابت ← چیزی واقعی تحویل بگیرید. سه قدم ساده، چهار پاسخ صادقانه، قیمت‌های منتشرشده.',
  },
};

export default function FaStartPage() {
  return <StartView />;
}
