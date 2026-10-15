/**
 * /deck/health — reserved standalone surface (D-034).
 *
 * The owner will deliver the Health & Wellness deck page and it will render
 * HERE exactly as given — OUTSIDE the site template (no header, footer, chat
 * bubble, lang banner or theme background), same full-bare pattern as /play.
 * Until the owner's page arrives this renders the most restrained honest
 * placeholder possible: a reserved-address note in both site languages.
 * Zero claims, zero numbers — nothing invented (owner law).
 *
 * The `deck-root` class is the bare-surface marker: globals.css hides the
 * chrome via body:has(.deck-root) rules — the always-rendered-chrome +
 * CSS-opt-out pattern that can never hydration-mismatch (see SiteChrome).
 */
export function DeckHealthReserved() {
  return (
    <div className="deck-root flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Mehrdad
      </p>
      <p className="text-lg font-bold">Health Deck</p>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground" dir="ltr">
        This address is reserved — the deck will be published here.
      </p>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground" dir="rtl">
        این آدرس رزرو شده است — دک همین‌جا منتشر می‌شود
      </p>
    </div>
  );
}
