import type { Locale } from "@/lib/i18n/config";

/** `/kocluk` ilan listesi ve `/kocluk/[slug]` ilan sayfası. */
type Copy = {
  list: {
    meta: { title: string; description: string };
    title: string;
    subtitle: string;
    filterDiscipline: string;
    filterFormat: string;
    filterLevel: string;
    emptyTitle: string;
    emptyBody: string;
    /** {minutes} → seans süresi */
    duration: string;
  };
  detail: {
    notFound: string;
    /** {minutes} */
    duration: string;
    /** {count} → tamamlanan seans sayısı */
    sessions: string;
    minorsNotAllowed: string;
    reviews: string;
    perSession: string;
    inactive: string;
    ownOffer: string;
    paymentNote: string;
  };
};

export const coachingCopy: Record<Locale, Copy> = {
  de: {
    list: {
      meta: {
        title: "Online-Coaching",
        description:
          "Einzelcoaching online von verifizierten Trainern: Videosession, Videoanalyse und individueller Trainingsplan.",
      },
      title: "Online-Coaching",
      subtitle: "Einzelbetreuung von verifizierten Trainern — egal, wo du gerade bist",
      filterDiscipline: "Disziplin",
      filterFormat: "Format",
      filterLevel: "Niveau",
      emptyTitle: "Mit diesen Filtern gibt es keine Anzeige",
      emptyBody:
        "Lockere die Filter oder schau später noch einmal vorbei — es kommen laufend neue Trainer dazu.",
      duration: "{minutes} Minuten",
    },
    detail: {
      notFound: "Anzeige nicht gefunden",
      duration: "{minutes} Minuten",
      sessions: "{count} Sessions",
      minorsNotAllowed:
        "Diese Anzeige ist für Athletinnen und Athleten unter 18 Jahren gesperrt (§11.1 Jugendschutz).",
      reviews: "Bewertungen von Athleten",
      perSession: "/ Session",
      inactive: "Diese Anzeige nimmt derzeit keine neuen Anfragen an.",
      ownOffer: "Das ist deine eigene Anzeige.",
      paymentNote:
        "Die Zahlung läuft über Stripe. Sie wird erst an den Trainer weitergeleitet, nachdem sie bestätigt wurde.",
    },
  },

  en: {
    list: {
      meta: {
        title: "Online coaching",
        description:
          "One-to-one online coaching from verified coaches: video sessions, video analysis and a personal training plan.",
      },
      title: "Online coaching",
      subtitle: "One-to-one work with verified coaches — wherever you are",
      filterDiscipline: "Discipline",
      filterFormat: "Format",
      filterLevel: "Level",
      emptyTitle: "No listing matches these filters",
      emptyBody: "Loosen the filters or come back later — new coaches are joining all the time.",
      duration: "{minutes} minutes",
    },
    detail: {
      notFound: "Listing not found",
      duration: "{minutes} minutes",
      sessions: "{count} sessions",
      minorsNotAllowed:
        "This listing is closed to athletes under 18 (§11.1 child protection).",
      reviews: "Athlete reviews",
      perSession: "/ session",
      inactive: "This listing is not taking new requests at the moment.",
      ownOffer: "This is your own listing.",
      paymentNote:
        "Payment is taken through Stripe. It is only passed on to the coach once the payment is confirmed.",
    },
  },

  tr: {
    list: {
      meta: {
        title: "Online Koçluk",
        description:
          "Doğrulanmış antrenörlerden birebir online koçluk: görüntülü seans, video analizi ve kişiye özel antrenman planı.",
      },
      title: "Online Koçluk",
      subtitle: "Doğrulanmış antrenörlerden birebir çalışma — nerede olursan ol",
      filterDiscipline: "Disiplin",
      filterFormat: "Biçim",
      filterLevel: "Seviye",
      emptyTitle: "Bu filtrelerle ilan yok",
      emptyBody: "Filtreleri gevşet veya daha sonra tekrar bak — yeni antrenörler ekleniyor.",
      duration: "{minutes} dk",
    },
    detail: {
      notFound: "İlan bulunamadı",
      duration: "{minutes} dk",
      sessions: "{count} seans",
      minorsNotAllowed: "Bu ilan 18 yaş altı sporculara kapalıdır (§11.1 çocuk koruması).",
      reviews: "Sporcu değerlendirmeleri",
      perSession: "/ seans",
      inactive: "Bu ilan şu anda yeni talep almıyor.",
      ownOffer: "Bu senin ilanın.",
      paymentNote:
        "Ödeme Stripe üzerinden alınır. Antrenöre yalnızca ödeme onaylandıktan sonra iletilir.",
    },
  },
};
