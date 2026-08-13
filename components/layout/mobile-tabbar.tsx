"use client";

import { Link } from "@/components/i18n/link";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays, Swords, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDict } from "@/components/i18n/provider";

type TabKey = "home" | "fighters" | "events" | "sparring" | "discover";

const TABS: { href: string; key: TabKey; icon: typeof Home; exact?: boolean }[] = [
  { href: "/", key: "home", icon: Home, exact: true },
  { href: "/dovuscular", key: "fighters", icon: Users },
  { href: "/etkinlikler", key: "events", icon: CalendarDays },
  { href: "/sparring", key: "sparring", icon: Swords },
  { href: "/akis", key: "discover", icon: Compass },
];

/** Mobil alt sekme çubuğu — başparmak erişimli birincil navigasyon */
export function MobileTabbar() {
  const pathname = usePathname();
  const dict = useDict();
  // Proxy kanonik yola yeniden yazdığı için burada Türkçe yol karşılaştırması
  // dilden bağımsız çalışır.
  if (pathname.startsWith("/admin") || pathname.startsWith("/panel")) return null;

  return (
    <nav
      aria-label={dict.nav.menu}
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl md:hidden"
    >
      <div className="flex h-16">
        {TABS.map(({ href, key, icon: Icon, exact }) => {
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
              <span className="text-[10px] font-bold">{dict.nav[key]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
