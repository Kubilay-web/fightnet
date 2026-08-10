import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="FIGHTNET ana sayfa">
      <span className="relative inline-flex size-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-lg shadow-blood-600/25 transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="size-5 text-white" fill="currentColor" aria-hidden>
          <path d="M6.5 3h4l1.5 5.5L13.5 3h4l-2.6 8.2 2.9 9.8h-4.2l-1.6-6.3-1.6 6.3H6.2l2.9-9.8L6.5 3z" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-lg font-black tracking-tight">
          FIGHT<span className="text-blood-500">NET</span>
        </span>
      )}
    </Link>
  );
}
