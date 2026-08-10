import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <Logo compact />
          <Badge tone="gold">Admin</Badge>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="text-sm font-semibold text-muted hover:text-[var(--fg)]">
              Siteye dön
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <AdminNav role={session.role} />
        <main id="main" className="min-w-0 flex-1 p-4 pb-24 sm:p-6 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
