import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "gold";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 " +
  "disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.97] whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-blood-600 text-white hover:bg-blood-500 shadow-lg shadow-blood-600/20 hover:shadow-blood-500/30",
  secondary:
    "bg-ink-100 text-ink-900 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-50 dark:hover:bg-ink-600",
  ghost:
    "text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-ink-50",
  outline:
    "border border-ink-200 text-ink-900 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-100 dark:hover:bg-ink-800",
  danger: "bg-red-600 text-white hover:bg-red-500",
  gold: "bg-gold-500 text-ink-950 hover:bg-gold-400 shadow-lg shadow-gold-500/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
  icon: "h-10 w-10",
};

interface Common {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  ...props
}: Common & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  full,
  className,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
      {...props}
    />
  );
}
