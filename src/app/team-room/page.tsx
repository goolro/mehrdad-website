import type { Metadata } from 'next';
import TeamRoom from './TeamRoom';

export const metadata: Metadata = {
  title: 'اتاق تیم — تیم ۶ ایجنتیِ هماهنگ | mehrdad.ir',
  description:
    'یک مأموریت بنویس؛ کاپیتان تقسیم کار می‌کند، ۵ متخصص با هم می‌سازند، ناقد cross-check می‌کند و تحویل نهایی را می‌گیری — روی گوشی هم مثل اپ کار می‌کند.',
  appleWebApp: { capable: true, title: 'اتاق تیم', statusBarStyle: 'black-translucent' },
  openGraph: {
    title: 'اتاق تیم — تیم ۶ ایجنتیِ هماهنگ',
    description: 'یک مأموریت بده؛ کاپیتان تقسیم کار می‌کند، ایجنت‌ها با هم می‌سازند.',
    type: 'website',
  },
};

export default function TeamRoomPage() {
  return <TeamRoom />;
}
