"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/components/i18n/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, User, Dumbbell, Swords, CalendarCheck, BadgeCheck,
  Bell, Shield, LogOut, Settings, Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useLocale } from "@/components/i18n/provider";
import { panelNavCopy, type UserMenuKey } from "@/lib/i18n/pages/panel-nav";
import type { SessionPayload } from "@/lib/session";

/** `href` kanonik (Türkçe) kalır; çeviriyi `components/i18n/link` yapar. */
const ITEMS: { href: string; key: UserMenuKey; icon: typeof LayoutDashboard }[] = [
  { href: "/panel", key: "panel", icon: LayoutDashboard },
  { href: "/panel/profil", key: "profil", icon: User },
  { href: "/panel/antrenman", key: "antrenman", icon: Dumbbell },
  { href: "/panel/sparring", key: "sparring", icon: Swords },
  { href: "/panel/rezervasyonlar", key: "rezervasyonlar", icon: CalendarCheck },
  { href: "/panel/dogrulama", key: "dogrulama", icon: BadgeCheck },
  { href: "/panel/creator", key: "creator", icon: Sparkles },
  { href: "/panel/bildirimler", key: "bildirimler", icon: Bell },
  { href: "/panel/ayarlar", key: "ayarlar", icon: Settings },
];

export function UserMenu({ session, unread = 0 }: { session: SessionPayload; unread?: number }) {
  const t = panelNavCopy[useLocale()];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const isAdmin = session.role === "ADMIN" || session.role === "MODERATOR";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex items-center rounded-full transition-transform hover:scale-105"
      >
        <Avatar src={session.avatarUrl} name={session.name} size="md" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-blood-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right animate-[slide-up_0.15s_ease-out] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/20"
        >
          <div className="flex items-center gap-3 border-b border-[var(--border)] p-3">
            <Avatar src={session.avatarUrl} name={session.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{session.name}</p>
              <p className="truncate text-xs text-muted">@{session.username}</p>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-1.5">
            {ITEMS.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                <Icon className="size-4 text-muted" />
                {t.menu[key]}
                {href === "/panel/bildirimler" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-blood-600 px-1.5 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-gold-600 transition-colors hover:bg-gold-500/10 dark:text-gold-400"
              >
                <Shield className="size-4" />
                {t.admin}
              </Link>
            )}
          </div>

          <div className="border-t border-[var(--border)] p-1.5">
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-blood-500 transition-colors hover:bg-blood-500/10"
            >
              <LogOut className="size-4" />
              {t.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
