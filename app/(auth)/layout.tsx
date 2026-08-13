import { Link } from "@/components/i18n/link";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getLocale } from "@/lib/i18n/server";
import { authCopy } from "@/lib/i18n/pages/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const copy = authCopy[await getLocale()].layout;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="absolute inset-0 mesh-hero opacity-70" />
      <div className="absolute inset-0 grid-lines opacity-[0.3]" />

      <header className="relative flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/" className="text-sm font-semibold text-muted hover:text-[var(--fg)]">
            {copy.home}
          </Link>
        </div>
      </header>

      <main id="main" className="relative flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        {children}
      </main>

      <footer className="relative px-4 pb-6 text-center text-xs text-muted">
        <Link href="/gizlilik" className="hover:underline">{copy.privacy}</Link>
        {" · "}
        <Link href="/sartlar" className="hover:underline">{copy.terms}</Link>
        {" · "}
        <Link href="/kunye" className="hover:underline">{copy.imprint}</Link>
      </footer>
    </div>
  );
}
