/**
 * Shared helpers for the /daily publication — the staggered-publishing
 * mechanics (owner rule: never dump N articles at once; slots spread them
 * across days) and the single visibility definition every reader of the
 * table must respect.
 */

/** visible = published AND (no slot OR slot already passed) */
export function dailyVisibleWhere(now = new Date()) {
  return {
    published: true,
    OR: [{ publishAt: null }, { publishAt: { lte: now } }],
  };
}

/** an article row is publicly visible right now? */
export function isArticleLive(a: { published: boolean; publishAt: Date | null }, now = new Date()): boolean {
  if (!a.published) return false;
  return !a.publishAt || a.publishAt.getTime() <= now.getTime();
}

/**
 * Tehran fixed offset is +03:30 (DST abolished 2022). Convert a Tehran
 * wall-clock (h, m) on the Tehran calendar day of `base` + `dayOffset`
 * into the exact UTC instant. Returns null when the day arithmetic fails.
 */
export function tehranSlotToUtc(base: Date, dayOffset: number, hour: number, minute: number): Date | null {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' });
  const tehranDay = fmt.format(new Date(base.getTime() + dayOffset * 86_400_000)); // 'YYYY-MM-DD'
  const [y, mo, d] = tehranDay.split('-').map(Number);
  if (!y || !mo || !d) return null;
  const totalMinutes = hour * 60 + minute - 210; // Tehran = UTC + 3:30
  const utcHour = Math.floor(totalMinutes / 60);
  const utcMinute = totalMinutes % 60;
  return new Date(Date.UTC(y, mo - 1, d, utcHour, utcMinute, 0, 0));
}
