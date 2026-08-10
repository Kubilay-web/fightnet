"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, User, Dumbbell, Swords, CalendarCheck, BadgeCheck,
  Bell, Settings, Sparkles, Users, FileBadge, Image as ImageIcon, Building2, CalendarDays,
  MessagesSquare, ShoppingBag, Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

const BASE = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/panel/profil", label: "Profil", icon: User },
  { href: "/panel/antrenman", label: "Antrenman", icon: Dumbbell },
  { href: "/panel/sparring", label: "Sparring", icon: Swords },
  { href: "/panel/rezervasyonlar", label: "Rezervasyonlar", icon: CalendarCheck },
  { href: "/panel/mesajlar", label: "Mesajlar", icon: MessagesSquare },
  { href: "/panel/gonderi", label: "Gönderilerim", icon: ImageIcon },
  { href: "/panel/pazar", label: "İlanlarım", icon: ShoppingBag },
  { href: "/panel/dogrulama", label: "Doğrulama", icon: BadgeCheck },
  { href: "/panel/passport", label: "Passport", icon: FileBadge },
  { href: "/panel/creator", label: "Creator", icon: Sparkles },
  { href: "/panel/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/panel/itirazlar", label: "İtirazlarım", icon: Scale },
  { href: "/panel/ayarlar", label: "Ayarlar", icon: Settings },
];

const COACH = { href: "/panel/kefalet", label: "Kefaletlerim", icon: Users };
const GYM = { href: "/salon-yonetimi", label: "Salon Yönetimi", icon: Building2 };
const ORGANIZER = { href: "/organizator", label: "Etkinliklerim", icon: CalendarDays };

export function PanelNav({ role }: { role: Role }) {
  const pathname = usePathname();

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
      <nav aria-label="Panel menüsü" className="hidden w-56 shrink-0 lg:block">
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

      {/* Mobil yatay kaydırmalı menü */}
      <nav
        aria-label="Panel menüsü"
        className="no-scrollbar scroll-snap-x fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-[var(--border)] bg-[var(--bg)]/95 p-2 backdrop-blur-xl lg:hidden safe-bottom"
      >
        {items.map(({ href, label, icon: Icon, exact }) => {
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
              <span className="whitespace-nowrap text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
