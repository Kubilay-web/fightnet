import Image from "next/image";
import Link from "next/link";
import { avatarUrl } from "@/lib/image";
import { cn, initials } from "@/lib/utils";
import type { VerificationLevel } from "@prisma/client";

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  "2xl": 112,
  "3xl": 160,
} as const;

export type AvatarSize = keyof typeof SIZES;

export function Avatar({
  src,
  name,
  size = "md",
  href,
  className,
  ring,
  priority,
}: {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  href?: string;
  className?: string;
  ring?: boolean;
  priority?: boolean;
}) {
  const px = SIZES[size];
  const body = src ? (
    <Image
      src={avatarUrl(src, px * 2)}
      alt={name}
      width={px}
      height={px}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className="size-full object-cover"
      sizes={`${px}px`}
    />
  ) : (
    <span
      className="flex size-full items-center justify-center bg-gradient-to-br from-blood-600 to-blood-800 font-black text-white"
      style={{ fontSize: px * 0.4 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );

  const wrapper = (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800",
        ring && "ring-2 ring-blood-500 ring-offset-2 ring-offset-[var(--bg)]",
        className,
      )}
      style={{ width: px, height: px }}
    >
      {body}
    </span>
  );

  return href ? (
    <Link href={href} aria-label={name} className="shrink-0">
      {wrapper}
    </Link>
  ) : (
    wrapper
  );
}

/** §4.5 — Doğrulama seviyesi rozeti */
export function VerifiedMark({
  level,
  className,
  showLabel,
}: {
  level: VerificationLevel;
  className?: string;
  showLabel?: boolean;
}) {
  if (level === "LEVEL_0") return null;
  const isL2 = level === "LEVEL_2";
  return (
    <span
      title={isL2 ? "Seviye 2 · Durum doğrulanmış" : "Seviye 1 · Kimlik doğrulanmış"}
      className={cn("inline-flex items-center gap-1", className)}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("size-4 shrink-0", isL2 ? "text-gold-500" : "text-blue-500")}
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 1.5l2.6 2.05 3.3-.36 1.05 3.15 2.85 1.7-1.4 3.01 1.4 3.01-2.85 1.7-1.05 3.15-3.3-.36L12 22.5l-2.6-2.05-3.3.36-1.05-3.15-2.85-1.7 1.4-3.01-1.4-3.01 2.85-1.7L6.1 3.19l3.3.36L12 1.5zm-1.2 13.6l5.3-5.3-1.4-1.4-3.9 3.9-1.9-1.9-1.4 1.4 3.3 3.3z" />
      </svg>
      {showLabel && (
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
          {isL2 ? "Seviye 2" : "Seviye 1"}
        </span>
      )}
    </span>
  );
}

export function FounderMark({ className }: { className?: string }) {
  return (
    <span
      title="Kurucu Üye"
      className={cn(
        "inline-flex items-center rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-gold-600 dark:text-gold-400",
        className,
      )}
    >
      Kurucu
    </span>
  );
}
