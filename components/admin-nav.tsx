"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BadgeCheck, Building2, CalendarDays, Flag,
  MessageSquare, Megaphone, ListChecks, KeyRound, Sparkles, FileBadge,
  TrendingUp, Scale, Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

const ITEMS = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/kpi", label: "KPI Takibi", icon: TrendingUp },
  { href: "/admin/dogrulama", label: "Doğrulama Kuyruğu", icon: BadgeCheck },
  { href: "/admin/raporlar", label: "Moderasyon", icon: Flag },
  { href: "/admin/itirazlar", label: "İtirazlar (DSA)", icon: Scale },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/salonlar", label: "Salonlar", icon: Building2 },
  { href: "/admin/etkinlikler", label: "Etkinlikler", icon: CalendarDays },
  { href: "/admin/passport", label: "Passport Belgeleri", icon: FileBadge },
  { href: "/admin/forum", label: "Forum", icon: MessageSquare },
  { href: "/admin/spotlight", label: "Spotlight", icon: Sparkles },
  { href: "/admin/sponsorlar", label: "Sponsorlar", icon: Handshake },
  { href: "/admin/reklamlar", label: "Reklamlar", icon: Megaphone },
  { href: "/admin/bekleme-listesi", label: "Bekleme Listesi", icon: ListChecks },
  { href: "/admin/beta-kodlari", label: "Beta Kodları", icon: KeyRound },
];

const ADMIN_ONLY = ["/admin/kullanicilar", "/admin/reklamlar", "/admin/beta-kodlari", "/admin/kpi", "/admin/sponsorlar"];

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = role === "ADMIN" ? ITEMS : ITEMS.filter((i) => !ADMIN_ONLY.includes(i.href));

  return (
    <>
      <nav aria-label="Admin menüsü" className="hidden w-60 shrink-0 border-r border-[var(--border)] p-3 lg:block">
        <div className="sticky top-20 flex flex-col gap-0.5">
          {items.map(({ href, label, icon: Icon, exact }) => {
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
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav
        aria-label="Admin menüsü"
        className="no-scrollbar scroll-snap-x safe-bottom fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-[var(--border)] bg-[var(--bg)]/95 p-2 backdrop-blur-xl lg:hidden"
      >
        {items.map(({ href, label, icon: Icon, exact }) => {
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
              <span className="whitespace-nowrap text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
