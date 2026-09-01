/**
 * اسلاگ‌ها در دیتابیس به همان شکل اصلی وردپرس ذخیره شده‌اند
 * (اسلاگ‌های فارسی: percent-encoded با حروف کوچک مثل %d8%aa...)
 * اما Next.js پارامترهای مسیر را به‌طور خودکار decode می‌کند؛
 * بنابراین lookup باید همه شکل‌های ممکن را امتحان کند.
 */
export function slugCandidates(raw: string): string[] {
  const out = new Set<string>();
  const push = (s?: string | null) => {
    if (s && s.length > 0) out.add(s);
  };
  push(raw);
  try {
    const dec = decodeURIComponent(raw);
    push(dec);
    push(encodeURIComponent(dec));
    push(encodeURIComponent(dec).toLowerCase());
  } catch {
    // raw قابل decode نبود — همینCandidates کافی است
  }
  push(encodeURIComponent(raw));
  push(encodeURIComponent(raw).toLowerCase());
  return [...out];
}
