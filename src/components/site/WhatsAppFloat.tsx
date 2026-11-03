'use client';

import { useApp } from './store';
import { useLang } from './lang-context';
import { ui } from './i18n';

/**
 * WhatsApp direct line (survey fix #3-b: the contact page had NO reachable
 * channel — form only — and two testers flagged exactly that). One number,
 * three touchpoints:
 *   1. <WhatsAppFloat />          — green bubble stacked above the AI chat
 *                                   bubble, on every page (SiteChrome)
 *   2. ChatWidget panel header    — icon button inside the open chat panel
 *   3. ContactView (/contact)     — card next to the email row
 * All three open the same wa.me deep link. The prefilled greeting travels
 * in the URL (?text=, URL-encoded at build time for the prerendered HTML),
 * so the conversation starts ready-made. The link is target=_blank with
 * rel=noopener noreferrer and a bilingual aria-label.
 *
 * The float carries the `site-chat` class on purpose: bare surfaces
 * (/play/*, /factory, /deck/health) hide it through the same
 * body:has(...) CSS rules that hide the chat bubble (globals.css).
 */
export const WHATSAPP_ME = 'https://wa.me/989103500310';
// display grouping only — the digits are exactly +989103500310
export const WHATSAPP_DISPLAY = '+98 910 350 0310';

export function whatsappHref(prefilled: string): string {
  return `${WHATSAPP_ME}?text=${encodeURIComponent(prefilled)}`;
}

/** Inline brand icon (Simple Icons path) — no external dependency. */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function WhatsAppFloat() {
  const { chatOpen } = useApp();
  const lang = useLang();
  const t = ui[lang];
  // While the chat panel is open it owns this corner (same bottom-5 end-5
  // anchor, 32rem tall) — the float steps aside; the open panel carries its
  // own WhatsApp button in the header, so the channel is never lost.
  if (chatOpen) return null;
  return (
    <a
      href={whatsappHref(t.whatsapp.prefilled)}
      target="_blank"
      rel="noopener noreferrer"
      className="site-chat fixed bottom-[5.5rem] end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-700/30 transition-transform hover:scale-105"
      aria-label={t.whatsapp.aria}
      title={t.whatsapp.aria}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
