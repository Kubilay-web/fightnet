"use client";

import { Link } from "@/components/i18n/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BadgeCheck, Building2, CalendarDays, Flag,
  MessageSquare, Megaphone, ListChecks, KeyRound, Sparkles, FileBadge,
  TrendingUp, Scale, Handshake, Server, Database,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/provider";
import { adminShellCopy } from "@/lib/i18n/pages/admin-shell";
import type { Role } from "@prisma/client";

type NavKey = keyof (typeof adminShellCopy)["de"]["nav"];

/** `key` çeviri sözlüğündeki etiketi seçer; `href` kanonik (Türkçe) kalır. */
const ITEMS: { href: string; key: NavKey; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", key: "overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/kpi", key: "kpi", icon: TrendingUp },
  { href: "/admin/dogrulama", key: "verification", icon: BadgeCheck },
  { href: "/admin/raporlar", key: "moderation", icon: Flag },
  { href: "/admin/itirazlar", key: "appeals", icon: Scale },
  { href: "/admin/kullanicilar", key: "users", icon: Users },
  { href: "/admin/salonlar", key: "gyms", icon: Building2 },
  { href: "/admin/etkinlikler", key: "events", icon: CalendarDays },
  { href: "/admin/passport", key: "passport", icon: FileBadge },
  { href: "/admin/forum", key: "forum", icon: MessageSquare },
  { href: "/admin/spotlight", key: "spotlight", icon: Sparkles },
  { href: "/admin/sponsorlar", key: "sponsors", icon: Handshake },
  { href: "/admin/veri-lisansi", key: "dataLicense", icon: Database },
  { href: "/admin/reklamlar", key: "ads", icon: Megaphone },
  { href: "/admin/bekleme-listesi", key: "waitlist", icon: ListChecks },
  { href: "/admin/beta-kodlari", key: "betaCodes", icon: KeyRound },
  { href: "/admin/servisler", key: "services", icon: Server },
];

const ADMIN_ONLY = ["/admin/kullanicilar", "/admin/reklamlar", "/admin/beta-kodlari", "/admin/kpi", "/admin/sponsorlar", "/admin/veri-lisansi"];

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const t = adminShellCopy[useLocale()];
  const items = role === "ADMIN" ? ITEMS : ITEMS.filter((i) => !ADMIN_ONLY.includes(i.href));

  return (
    <>
      <nav aria-label={t.navLabel} className="hidden w-60 shrink-0 border-r border-[var(--border)] p-3 lg:block">
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

      <nav
        aria-label={t.navLabel}
        className="no-scrollbar scroll-snap-x safe-bottom fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-[var(--border)] bg-[var(--bg)]/95 p-2 backdrop-blur-xl lg:hidden"
      >
        {items.map(({ href, key, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "snap-item flex min-w-16 shrink-0 flex-col items-center gap-1 rounded-xl px-2.5 py-1.5",
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
