import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="text-6xl">☼</div>
      <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">Page not found</h1>
      <p className="mt-3 text-muted-foreground" dir="rtl">
        صفحه‌ای که دنبالش بودید پیدا نشد — شاید آدرس قدیمی بوده باشد.
      </p>
      <p className="mt-1 text-muted-foreground">
        The page you are looking for does not exist — the link may be outdated.
      </p>
      <Button asChild className="mt-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
