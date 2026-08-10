"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays, Swords, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Ana", icon: Home, exact: true },
  { href: "/dovuscular", label: "Dövüşçüler", icon: Users },
  { href: "/etkinlikler", label: "Etkinlik", icon: CalendarDays },
  { href: "/sparring", label: "Sparring", icon: Swords },
  { href: "/akis", label: "Keşfet", icon: Compass },
];

/** Mobil alt sekme çubuğu — başparmak erişimli birincil navigasyon */
export function MobileTabbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/panel")) return null;

  return (
    <nav
      aria-label="Alt menü"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl md:hidden"
    >
      <div className="flex h-16">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-blood-500" : "text-muted",
              )}
            >
              <Icon className={cn("size-5", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
