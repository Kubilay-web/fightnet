import type { Locale } from "@/lib/i18n/config";

/** `/sponsorluk` — sponsor teklifleri portalı. */
type Copy = {
  meta: { title: string; description: string };
  title: string;
  subtitle: string;
  becomeSponsor: string;
  emptyTitle: string;
  emptyBody: string;
  /** {count} → gereken takipçi sayısı */
  minFollowers: string;
  deadline: string;
  /** {count} → başvuru sayısı */
  applications: string;
};

export const sponsorshipCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Sponsoring",
      description: "Das Sponsorenportal, das Kampfsportmarken und Athleten zusammenbringt.",
    },
    title: "Sponsoring-Portal",
    subtitle: "Direkte Vermittlung zwischen Marken und Athleten",
    becomeSponsor: "Sponsor werden",
    emptyTitle: "Kein aktives Sponsoring",
    emptyBody: "Marken veröffentlichen ihre Angebote hier in Kürze.",
    minFollowers: "{count}+ Follower",
    deadline: "Bewerbungsschluss",
    applications: "{count} Bewerbungen",
  },
  en: {
    meta: {
      title: "Sponsorship",
      description: "The sponsor portal that brings combat sports brands and athletes together.",
    },
    title: "Sponsorship portal",
    subtitle: "Direct matching between brands and athletes",
    becomeSponsor: "Become a sponsor",
    emptyTitle: "No active sponsorship",
    emptyBody: "Brands will publish their offers here shortly.",
    minFollowers: "{count}+ followers",
    deadline: "Application deadline",
    applications: "{count} applications",
  },
  tr: {
    meta: {
      title: "Sponsorluk",
      description: "Dövüş sporu markalarıyla sporcuları buluşturan sponsor portalı.",
    },
    title: "Sponsorluk Portalı",
    subtitle: "Markalar ve sporcular arasında doğrudan eşleştirme",
    becomeSponsor: "Sponsor Ol",
    emptyTitle: "Aktif sponsorluk yok",
    emptyBody: "Yakında markalar tekliflerini burada yayınlayacak.",
    minFollowers: "{count}+ takipçi",
    deadline: "Son başvuru",
    applications: "{count} başvuru",
  },
};
