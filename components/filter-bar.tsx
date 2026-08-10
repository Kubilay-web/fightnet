"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

/**
 * URL tabanlı filtre çubuğu.
 * Filtreler arama parametrelerine yazılır — sunucu bileşeni yeniden render
 * edilir, istemci state'i yoktur, paylaşılabilir/geri düğmesi uyumlu URL üretir.
 */
export function FilterBar({
  basePath,
  current,
  filters,
  searchKey,
  searchPlaceholder,
}: {
  basePath: string;
  current: Record<string, string | undefined>;
  filters: FilterDef[];
  searchKey?: string;
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchKey ? (current[searchKey] ?? "") : "");
  const [open, setOpen] = useState(false);

  const push = useCallback(
    (next: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v) sp.set(k, v);
        else sp.delete(k);
      }
      sp.delete("page");
      startTransition(() => {
        router.replace(`${basePath}?${sp.toString()}`, { scroll: false });
      });
    },
    [params, router, basePath],
  );

  // Arama girdisini geciktir — her tuş vuruşunda sunucuya gitmez
  useEffect(() => {
    if (!searchKey) return;
    const currentValue = current[searchKey] ?? "";
    if (query === currentValue) return;
    const t = setTimeout(() => push({ [searchKey]: query || undefined }), 350);
    return () => clearTimeout(t);
  }, [query, searchKey, current, push]);

  const activeCount = filters.filter((f) => current[f.key]).length;
  const hasAny = activeCount > 0 || (searchKey && current[searchKey]);

  return (
    <div className={cn("flex flex-col gap-3", pending && "opacity-70 transition-opacity")}>
      <div className="flex gap-2">
        {searchKey && (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder ?? "Ara…"}
              aria-label="Ara"
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-blood-500 focus:ring-2 focus:ring-blood-500/20 dark:border-ink-700 dark:bg-ink-900"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Aramayı temizle"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors sm:hidden",
            activeCount
              ? "border-blood-500 bg-blood-500/10 text-blood-500"
              : "border-ink-200 dark:border-ink-700",
          )}
        >
          <SlidersHorizontal className="size-4" />
          {activeCount > 0 && activeCount}
        </button>
      </div>

      <div className={cn("flex-wrap gap-2", open ? "flex" : "hidden sm:flex")}>
        {filters.map((f) => (
          <select
            key={f.key}
            value={current[f.key] ?? ""}
            onChange={(e) => push({ [f.key]: e.target.value || undefined })}
            aria-label={f.label}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm font-semibold outline-none transition-colors",
              current[f.key]
                ? "border-blood-500 bg-blood-500/10 text-blood-500"
                : "border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900",
            )}
          >
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        {hasAny && (
          <button
            onClick={() => {
              setQuery("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-blood-500"
          >
            <X className="size-4" />
            Temizle
          </button>
        )}
      </div>
    </div>
  );
}
