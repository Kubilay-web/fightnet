import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export { Button, ButtonLink } from "./button";

// ---------------------------------------------------------------------------
// Kart
// ---------------------------------------------------------------------------

export function Card({ className, hover, ...props }: ComponentProps<"div"> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "surface rounded-2xl",
        hover && "transition-all duration-200 hover:border-blood-500/40 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-4 sm:p-5 border-b border-[var(--border)]", className)} {...props} />;
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-4 sm:p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("font-bold text-base sm:text-lg", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// Rozet
// ---------------------------------------------------------------------------

type Tone = "neutral" | "red" | "green" | "amber" | "blue" | "purple" | "gold" | "live";

const tones: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300",
  red: "bg-blood-100 text-blood-700 dark:bg-blood-900/40 dark:text-blood-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  gold: "bg-gold-500/15 text-gold-600 dark:text-gold-400",
  live: "bg-blood-600 text-white",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function LiveBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-blood-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white", className)}>
      <span className="size-1.5 rounded-full bg-white animate-[pulse-live_1.6s_ease-in-out_infinite]" />
      Canlı
    </span>
  );
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

const fieldBase =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 " +
  "placeholder:text-ink-400 outline-none transition-colors " +
  "focus:border-blood-500 focus:ring-2 focus:ring-blood-500/20 " +
  "dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50 dark:placeholder:text-ink-500 " +
  "disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-24 resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldBase, "appearance-none bg-no-repeat pr-9", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%239b9ea8' stroke-width='2'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.75rem center" }} {...props} />;
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
          {required && <span className="text-blood-500"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs font-medium text-blood-500">{error}</p>}
    </div>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<"input"> & { label?: ReactNode }) {
  return (
    <label className={cn("flex items-start gap-2.5 cursor-pointer group", className)}>
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 rounded border-ink-300 accent-blood-600 dark:border-ink-600"
        {...props}
      />
      {label && <span className="text-sm text-muted group-hover:text-[var(--fg)] transition-colors">{label}</span>}
    </label>
  );
}

export function Switch({ label, className, ...props }: ComponentProps<"input"> & { label?: ReactNode }) {
  return (
    <label className={cn("flex items-center justify-between gap-3 cursor-pointer", className)}>
      {label && <span className="text-sm">{label}</span>}
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span className="h-6 w-11 rounded-full bg-ink-300 transition-colors peer-checked:bg-blood-600 dark:bg-ink-700" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
  id,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("flex flex-col gap-4", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-xl sm:text-2xl font-black tracking-tight">{title}</h2>}
            {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] px-6 py-14 text-center">
      {icon && <div className="text-ink-300 dark:text-ink-600">{icon}</div>}
      <h3 className="font-bold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "red" | "green" | "amber" | "neutral";
}) {
  const color =
    tone === "red" ? "text-blood-500"
    : tone === "green" ? "text-emerald-500"
    : tone === "amber" ? "text-amber-500"
    : "";
  return (
    <div className="surface rounded-2xl p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-black tabular-nums", color)}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-t border-[var(--border)]", className)} />;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const build = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params ?? {})) if (v) sp.set(k, v);
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-2" aria-label="Sayfalama">
      {page > 1 && (
        <Link href={build(page - 1)} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-ink-100 dark:hover:bg-ink-800">
          ‹
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-muted px-1">…</span>}
          <Link
            href={build(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "min-w-9 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors",
              p === page ? "bg-blood-600 text-white" : "hover:bg-ink-100 dark:hover:bg-ink-800",
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={build(page + 1)} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-ink-100 dark:hover:bg-ink-800">
          ›
        </Link>
      )}
    </nav>
  );
}

export function Alert({
  tone = "neutral",
  title,
  children,
}: {
  tone?: "neutral" | "red" | "green" | "amber" | "blue";
  title?: string;
  children?: ReactNode;
}) {
  const map = {
    neutral: "border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-800/50",
    red: "border-blood-300 bg-blood-50 dark:border-blood-800 dark:bg-blood-900/20",
    green: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20",
    amber: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
    blue: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", map[tone])} role="status">
      {title && <p className="font-bold mb-0.5">{title}</p>}
      {children}
    </div>
  );
}
