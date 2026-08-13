import { Suspense } from "react";
import { Search } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { NavLinks, MobileMenu } from "./nav-links";
import { Link } from "@/components/i18n/link";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ButtonLink } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import prisma from "@/lib/prisma";

/**
 * Menü hedefleri kanonik (Türkçe) yolda tutulur; dile çevirme işini
 * `@/components/i18n/link` yapar. Etiketler sözlükten gelir.
 */
export function navItems(t: Dictionary["nav"]) {
  return [
    { href: "/dovuscular", label: t.fighters },
    { href: "/salonlar", label: t.gyms },
    { href: "/etkinlikler", label: t.events },
    { href: "/sparring", label: t.sparring },
    { href: "/kocluk", label: t.coaching },
    { href: "/akis", label: t.discover },
    { href: "/forum", label: t.forum },
  ];
}

export async function Header() {
  const [session, dict] = await Promise.all([getSession(), getDict()]);
  const nav = navItems(dict.nav);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--bg)]/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <MobileMenu items={nav} isAuthed={!!session} />
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label={dict.nav.menu}>
          <NavLinks items={nav} />
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/arama"
            aria-label={dict.nav.search}
            className="inline-flex size-10 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50"
          >
            <Search className="size-5" />
          </Link>

          <LocaleSwitcher className="hidden sm:block" />
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
                {dict.auth.login}
              </ButtonLink>
              <ButtonLink href="/kayit" size="sm">
                {dict.auth.register}
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
