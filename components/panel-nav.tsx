"use client";

import { Link } from "@/components/i18n/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, User, Dumbbell, Swords, CalendarCheck, BadgeCheck,
  Bell, Settings, Sparkles, Users, FileBadge, Image as ImageIcon, Building2, CalendarDays,
  MessagesSquare, ShoppingBag, Scale, GraduationCap, CreditCard, Watch, FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/provider";
import { panelNavCopy, type PanelNavKey } from "@/lib/i18n/pages/panel-nav";
import type { Role } from "@prisma/client";

/** `href` kanonik (Türkçe) kalır; çeviriyi `components/i18n/link` yapar. */
const BASE: { href: string; key: PanelNavKey; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { href: "/panel", key: "panel", icon: LayoutDashboard, exact: true },
  { href: "/panel/profil", key: "profil", icon: User },
  { href: "/panel/antrenman", key: "antrenman", icon: Dumbbell },
  { href: "/panel/sparring", key: "sparring", icon: Swords },
  { href: "/panel/rezervasyonlar", key: "rezervasyonlar", icon: CalendarCheck },
  { href: "/panel/mesajlar", key: "mesajlar", icon: MessagesSquare },
  { href: "/panel/gonderi", key: "gonderi", icon: ImageIcon },
  { href: "/panel/pazar", key: "pazar", icon: ShoppingBag },
  { href: "/panel/dogrulama", key: "dogrulama", icon: BadgeCheck },
  { href: "/panel/passport", key: "passport", icon: FileBadge },
  { href: "/panel/creator", key: "creator", icon: Sparkles },
  { href: "/panel/kocluk", key: "kocluk", icon: GraduationCap },
  { href: "/panel/cihazlar", key: "cihazlar", icon: Watch },
  { href: "/panel/sozlesmelerim", key: "sozlesmelerim", icon: FileSignature },
  { href: "/panel/abonelik", key: "abonelik", icon: CreditCard },
  { href: "/panel/bildirimler", key: "bildirimler", icon: Bell },
  { href: "/panel/itirazlar", key: "itirazlar", icon: Scale },
  { href: "/panel/ayarlar", key: "ayarlar", icon: Settings },
];

const COACH = { href: "/panel/kefalet", key: "kefalet" as const, icon: Users };
const GYM = { href: "/salon-yonetimi", key: "salonYonetimi" as const, icon: Building2 };
const ORGANIZER = { href: "/organizator", key: "etkinliklerim" as const, icon: CalendarDays };

export function PanelNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const t = panelNavCopy[useLocale()];

  const items = [...BASE];
  if (role === "COACH" || role === "ADMIN") {
    // Kefaletler sparring'in hemen ardında durur — antrenörün günlük akışı budur
    const at = items.findIndex((i) => i.href === "/panel/sparring");
    items.splice(at + 1, 0, COACH);
  }
  if (role === "GYM_OWNER" || role === "ADMIN") items.push(GYM);
  if (role === "ORGANIZER" || role === "ADMIN") items.push(ORGANIZER);

  return (
    <>
      {/* Masaüstü kenar çubuğu */}
      <nav aria-label={t.navAria} className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20 flex flex-col gap-0.5">
          {items.map(({ href, key, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-blood-600/10 text-blood-500"
                    : "text-muted hover:bg-ink-100 hover:text-[var(--fg)] dark:hover:bg-ink-800",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {t.nav[key]}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobil yatay kaydırmalı menü */}
      <nav
        aria-label={t.navAria}
        className="no-scrollbar scroll-snap-x fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-[var(--border)] bg-[var(--bg)]/95 p-2 backdrop-blur-xl lg:hidden safe-bottom"
      >
        {items.map(({ href, key, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "snap-item flex min-w-16 shrink-0 flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 transition-colors",
                active ? "text-blood-500" : "text-muted",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              <span className="whitespace-nowrap text-[10px] font-bold">{t.nav[key]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
