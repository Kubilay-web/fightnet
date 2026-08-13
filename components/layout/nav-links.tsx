"use client";

import { Link } from "@/components/i18n/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  href: string;
  label: string;
}

export function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              active
                ? "text-[var(--fg)]"
                : "text-muted hover:text-[var(--fg)]",
            )}
          >
            {item.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-blood-500" />
            )}
          </Link>
        );
      })}
    </>
  );
}

export function MobileMenu({ items, isAuthed }: { items: Item[]; isAuthed: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Rota değişince menü kapanır — render sırasında türetilen durum
  // (effect içinde setState zincirleme render tetikler).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /**
   * Panel `body`'ye porta edilir. Header'da `backdrop-blur` var; bir ata
   * elementte backdrop-filter olması `position: fixed` için yeni containing
   * block oluşturur ve menü tüm ekran yerine header kutusuna hapsolurdu.
   */
  const overlay = (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menü">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]"
        onClick={() => setOpen(false)}
      />
      <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-[var(--border)] bg-[var(--bg)] animate-[slide-in-left_0.2s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
          <span className="font-display text-lg font-black">
            FIGHT<span className="text-blood-500">NET</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
            className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-xl px-4 py-3 text-base font-bold transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-blood-600/10 text-blood-500"
                  : "hover:bg-ink-100 dark:hover:bg-ink-800",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="my-3 border-t border-[var(--border)]" />
          <Link href="/pazar" className="block rounded-xl px-4 py-3 text-base font-bold hover:bg-ink-100 dark:hover:bg-ink-800">
            Ekipman Pazarı
          </Link>
          <Link href="/creator" className="block rounded-xl px-4 py-3 text-base font-bold hover:bg-ink-100 dark:hover:bg-ink-800">
            Creator&apos;lar
          </Link>
          <Link href="/sponsorluk" className="block rounded-xl px-4 py-3 text-base font-bold hover:bg-ink-100 dark:hover:bg-ink-800">
            Sponsorluk
          </Link>
          <Link href="/harita" className="block rounded-xl px-4 py-3 text-base font-bold hover:bg-ink-100 dark:hover:bg-ink-800">
            Harita
          </Link>
        </nav>

        {!isAuthed && (
          <div className="safe-bottom border-t border-[var(--border)] p-3">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/giris" className="rounded-xl border border-[var(--border)] py-3 text-center text-sm font-bold">
                Giriş
              </Link>
              <Link href="/kayit" className="rounded-xl bg-blood-600 py-3 text-center text-sm font-bold text-white">
                Katıl
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        aria-expanded={open}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* `open` yalnızca istemcide true olabildiği için portal SSR'da çalışmaz */}
      {open && createPortal(overlay, document.body)}
    </>
  );
}

