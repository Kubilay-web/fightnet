"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Globe } from "lucide-react";
import {
  LOCALES,
  LOCALE_FLAG,
  LOCALE_LABEL,
  canonicalizePath,
  localizePath,
  splitLocale,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useDict, useLocale } from "./provider";

/**
 * §5.2 — Dil değiştirici.
 *
 * Kullanıcıyı ana sayfaya atmaz: bulunduğu sayfanın karşılığına götürür.
 * Bunun için önce mevcut URL kanonik hâle getirilir, sonra hedef dile
 * yeniden çevrilir — `/de/kaempfer/max` → `/en/fighters/max`.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = useLocale();
  const dict = useDict();
  const [open, setOpen] = useState(false);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === current) return;

    // Proxy kanonik yola yeniden yazdığı için `usePathname` çoğu zaman zaten
    // kanoniktir; yine de önek varsa güvenli biçimde ayıklıyoruz.
    const { locale: urlLocale, rest } = splitLocale(pathname);
    const canonical = urlLocale ? canonicalizePath(rest, urlLocale) : pathname;

    const query = searchParams.toString();
    const target = `${localizePath(canonical, next)}${query ? `?${query}` : ""}`;

    // Tercih çerezini proxy yazar: hedef URL zaten dil önekli olduğu için
    // dil kararı URL'den gelir, çerez yalnızca öneksiz ziyaretlerde okunur.
    router.push(target);
    router.refresh();
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={dict.locale.switchLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-muted transition-colors hover:text-[var(--fg)]"
      >
        <Globe className="size-4" />
        <span className="uppercase">{current}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul
            role="listbox"
            aria-label={dict.locale.switchLabel}
            className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl"
          >
            {LOCALES.map((locale) => (
              <li key={locale}>
                <button
                  type="button"
                  role="option"
                  aria-selected={locale === current}
                  onClick={() => switchTo(locale)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--surface-2)]"
                >
                  <span aria-hidden>{LOCALE_FLAG[locale]}</span>
                  <span className="flex-1 text-left">{LOCALE_LABEL[locale]}</span>
                  {locale === current && <Check className="size-4 text-blood-500" />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
