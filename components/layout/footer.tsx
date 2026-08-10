import Link from "next/link";
import { Logo } from "./logo";
import { ConsentSettingsLink } from "@/components/cookie-consent";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/dovuscular", label: "Dövüşçüler" },
      { href: "/salonlar", label: "Salonlar" },
      { href: "/etkinlikler", label: "Etkinlikler" },
      { href: "/sparring", label: "Sparring Arama" },
      { href: "/harita", label: "Harita" },
    ],
  },
  {
    title: "Topluluk",
    links: [
      { href: "/akis", label: "Keşfet Akışı" },
      { href: "/forum", label: "Forum" },
      { href: "/creator", label: "Creator'lar" },
      { href: "/pazar", label: "Ekipman Pazarı" },
      { href: "/sponsorluk", label: "Sponsorluk" },
    ],
  },
  {
    title: "FIGHTNET",
    links: [
      { href: "/hakkinda", label: "Hakkımızda" },
      { href: "/salonlar-icin", label: "Salonlar İçin" },
      { href: "/beta", label: "Beta Programı" },
      { href: "/iletisim", label: "İletişim" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { href: "/gizlilik", label: "Gizlilik (KVKK/GDPR)" },
      { href: "/sartlar", label: "Kullanım Şartları" },
      { href: "/topluluk-kurallari", label: "Topluluk Kuralları" },
      { href: "/sparring-sozlesmesi", label: "Sparring Sözleşmesi" },
      { href: "/seffaflik", label: "Şeffaflık Raporu (DSA)" },
      { href: "/kunye", label: "Künye (Impressum)" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--bg-subtle)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted">
              DACH bölgesinde dövüş sporları için bağımsız platform. Sporcular, antrenörler,
              salonlar ve hayranlar için tek dijital ev.
            </p>
            <p className="text-xs text-muted">🇩🇪 🇦🇹 🇨🇭 · AB&apos;de barındırılır · KVKK/GDPR uyumlu</p>
          </div>

          {COLUMNS.map((col) => (
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
            © {new Date().getFullYear()} FIGHTNET. Federasyondan bağımsız.
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span>Spor bahis reklamı yayınlamıyoruz · 18 yaş altı koruma aktif</span>
            <span aria-hidden>·</span>
            <ConsentSettingsLink className="font-semibold underline transition-colors hover:text-[var(--fg)]" />
          </p>
        </div>
      </div>
      <div className="h-16 md:hidden" aria-hidden />
    </footer>
  );
}
