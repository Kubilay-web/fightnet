import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { NavLinks, MobileMenu } from "./nav-links";
import { ButtonLink } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const NAV = [
  { href: "/dovuscular", label: "Dövüşçüler" },
  { href: "/salonlar", label: "Salonlar" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/sparring", label: "Sparring" },
  { href: "/akis", label: "Keşfet" },
  { href: "/forum", label: "Forum" },
];

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--bg)]/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <MobileMenu items={NAV} isAuthed={!!session} />
        <Logo />

        <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Ana menü">
          <NavLinks items={NAV} />
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/arama"
            aria-label="Ara"
            className="inline-flex size-10 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50"
          >
            <Search className="size-5" />
          </Link>

          <ThemeToggle />

          {session ? (
            /* Okunmamış sayısı DB'ye gider — ilk baytı bloklamaması için
               akışa alınır; menü rozetsiz anında görünür. */
            <Suspense fallback={<UserMenu session={session} unread={0} />}>
              <UserMenuWithBadge />
            </Suspense>
          ) : (
            <div className="flex items-center gap-2">
              <ButtonLink href="/giris" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Giriş
              </ButtonLink>
              <ButtonLink href="/kayit" size="sm">
                Katıl
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

async function UserMenuWithBadge() {
  const session = await getSession();
  if (!session) return null;
  const unread = await prisma.notification
    .count({ where: { userId: session.sub, isRead: false } })
    .catch(() => 0);
  return <UserMenu session={session} unread={unread} />;
}
