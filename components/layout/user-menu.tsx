"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, User, Dumbbell, Swords, CalendarCheck, BadgeCheck,
  Bell, Shield, LogOut, Settings, Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { SessionPayload } from "@/lib/session";

const ITEMS = [
  { href: "/panel", label: "Panelim", icon: LayoutDashboard },
  { href: "/panel/profil", label: "Profilim", icon: User },
  { href: "/panel/antrenman", label: "Antrenman Günlüğü", icon: Dumbbell },
  { href: "/panel/sparring", label: "Sparring", icon: Swords },
  { href: "/panel/rezervasyonlar", label: "Rezervasyonlarım", icon: CalendarCheck },
  { href: "/panel/dogrulama", label: "Doğrulama", icon: BadgeCheck },
  { href: "/panel/creator", label: "Creator", icon: Sparkles },
  { href: "/panel/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/panel/ayarlar", label: "Ayarlar", icon: Settings },
];

export function UserMenu({ session, unread = 0 }: { session: SessionPayload; unread?: number }) {
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
            {ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                <Icon className="size-4 text-muted" />
                {label}
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
                Admin Panel
              </Link>
            )}
          </div>

          <div className="border-t border-[var(--border)] p-1.5">
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-blood-500 transition-colors hover:bg-blood-500/10"
            >
              <LogOut className="size-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
