"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * İstemci bileşenlerine aktif dili ve sözlüğü taşır.
 *
 * Sözlük sunucuda seçilip prop olarak geçilir; üç dilin tamamı istemci
 * paketine girmez — yalnızca aktif olan serialize edilir.
 */

interface LocaleValue {
  locale: Locale;
  dict: Dictionary;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: LocaleValue & { children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>;
}

/**
 * Sağlayıcı dışında da güvenli çalışır (ör. izole test veya hata sınırı):
 * dil varsayılana düşer, sözlük gerektiren bileşenler ise sağlayıcı ister.
 */
export function useLocale(): Locale {
  return useContext(LocaleContext)?.locale ?? DEFAULT_LOCALE;
}

export function useDict(): Dictionary {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useDict, LocaleProvider içinde kullanılmalı");
  return ctx.dict;
}
