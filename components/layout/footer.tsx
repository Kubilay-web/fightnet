import { Logo } from "./logo";
import { Link } from "@/components/i18n/link";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ConsentSettingsLink } from "@/components/cookie-consent";
import { getDict } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Bağlantı hedefleri KANONİK (Türkçe) yolda tutulur; `@/components/i18n/link`
 * bunları aktif dile çevirir. Etiketler sözlükten gelir — yeni bir dil
 * eklendiğinde burada hiçbir değişiklik gerekmez.
 */
function columns(t: Dictionary["footer"]) {
  return [
    {
      title: t.colPlatform,
      links: [
        { href: "/dovuscular", label: t.fightersLink },
        { href: "/salonlar", label: t.gymsLink },
        { href: "/etkinlikler", label: t.eventsLink },
        { href: "/sparring", label: t.sparringSearch },
        { href: "/kocluk", label: t.coachingLink },
        { href: "/harita", label: t.mapLink },
      ],
    },
    {
      title: t.colCommunity,
      links: [
        { href: "/akis", label: t.discoverFeed },
        { href: "/forum", label: t.forumLink },
        { href: "/creator", label: t.creators },
        { href: "/pazar", label: t.marketplace },
        { href: "/sponsorluk", label: t.sponsorship },
      ],
    },
    {
      title: t.colBrand,
      links: [
        { href: "/hakkinda", label: t.about },
        { href: "/premium", label: t.premium },
        { href: "/salonlar-icin", label: t.forGyms },
        { href: "/beta", label: t.beta },
        { href: "/veri-lisansi", label: t.dataLicense },
        { href: "/iletisim", label: t.contact },
      ],
    },
    {
      title: t.colLegal,
      links: [
        { href: "/gizlilik", label: t.privacy },
        { href: "/sartlar", label: t.terms },
        { href: "/topluluk-kurallari", label: t.communityRules },
        { href: "/sparring-sozlesmesi", label: t.sparringAgreement },
        { href: "/seffaflik", label: t.transparency },
        { href: "/kunye", label: t.imprint },
      ],
    },
  ];
}

export async function Footer() {
  const dict = await getDict();
  const t = dict.footer;

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--bg-subtle)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted">{t.blurb}</p>
            <p className="text-xs text-muted">🇩🇪 🇦🇹 🇨🇭 · {t.hostedInEu}</p>
            <div className="-ml-2.5 mt-1">
              <LocaleSwitcher />
            </div>
          </div>

          {columns(t).map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">{col.title}</h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-[var(--fg)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} FIGHTNET. {t.independent}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span>{t.noBettingAds}</span>
            <span aria-hidden>·</span>
            <ConsentSettingsLink className="font-semibold underline transition-colors hover:text-[var(--fg)]" />
          </p>
        </div>
      </div>
      <div className="h-16 md:hidden" aria-hidden />
    </footer>
  );
}
