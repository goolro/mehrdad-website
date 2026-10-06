/**
 * Division visual helpers (Task 55) — map the icon names produced by
 * build-agency-library.mjs to lucide components, and give every division a
 * short Persian subtitle for the big division boxes.
 * Client-safe (pure constants, no server imports).
 */
import {
  Bot,
  Box,
  Boxes,
  ClipboardList,
  Code,
  DollarSign,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  LifeBuoy,
  Map,
  Megaphone,
  PenTool,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  GraduationCap,
  PenTool,
  Code,
  DollarSign,
  Gamepad2,
  Map,
  Stethoscope,
  Megaphone,
  Target,
  Box,
  ClipboardList,
  Search,
  TrendingUp,
  ShieldCheck,
  Boxes,
  Sparkles,
  LifeBuoy,
  FlaskConical,
};

/** Module-level icon lookup — components index this directly (a function
 * call during render would trip the react-hooks/static-components rule). */
export const DIVISION_ICONS: Record<string, LucideIcon> = ICONS;

/** Resolve a library icon name to a lucide component (Bot as fallback). */
export function divisionIcon(icon: string | null): LucideIcon {
  if (icon && ICONS[icon]) return ICONS[icon];
  return Bot;
}

/** Short Persian subtitle per division id (used on the big boxes). */
export const DIVISION_FA: Record<string, string> = {
  engineering: 'مهندسی و توسعه محصول',
  specialized: 'تخصص‌های ویژه و کسب‌وکار',
  marketing: 'مارکتینگ، محتوا و رشد',
  gis: 'اطلاعات جغرافیایی و نقشه',
  security: 'امنیت و مقاوم‌سازی',
  design: 'طراحی محصول و برند',
  sales: 'فروش و مذاکره',
  testing: 'تست و تضمین کیفیت',
  'paid-media': 'تبلیغات پولی و کمپین',
  'project-management': 'مدیریت پروژه و اجرا',
  'game-development': 'بازی‌سازی',
  academic: 'دانشگاهی و آموزش',
  product: 'مدیریت محصول',
  'spatial-computing': 'واقعیت افزوده و فضایی',
  support: 'پشتیبانی و عملیات',
  finance: 'مالی و سرمایه‌گذاری',
  healthcare: 'سلامت و درمان',
  research: 'پژوهش و تحلیل',
};

/** Persian subtitle for a division (empty string when unknown). */
export function divisionFa(id: string): string {
  return DIVISION_FA[id] ?? '';
}
