import type { Locale } from "@/lib/i18n/config";

/** `/salonlar` liste sayfası ve `/salonlar/[slug]` salon sayfası. */
type Copy = {
  list: {
    meta: { title: string; description: string };
    title: string;
    subtitle: string;
    mapCta: string;
    filterDiscipline: string;
    filterCity: string;
    filterTrial: string;
    trialAvailable: string;
    filterSort: string;
    sortMembers: string;
    sortRating: string;
    sortNew: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    /** {count} → bulunan salon sayısı */
    resultCount: string;
  };
  detail: {
    notFound: string;
    /** {name} {city} {disciplines} */
    metaDescription: string;
    haloGym: string;
    founderGym: string;
    members: string;
    about: string;
    schedule: string;
    noScheduleTitle: string;
    noScheduleBody: string;
    trialOk: string;
    coaches: string;
    coachFallbackTitle: string;
    headCoach: string;
    reviews: string;
    /** {avg} {count} */
    reviewSummary: string;
    noReviews: string;
    trialTitle: string;
    trialBody: string;
    contact: string;
    website: string;
    directions: string;
    openingHours: string;
    closed: string;
    amenities: string;
  };
};

export const gymsCopy: Record<Locale, Copy> = {
  de: {
    list: {
      meta: {
        title: "Gym-Finder",
        description:
          "Finde Kampfsport-Gyms im DACH-Raum. MMA, Boxen, BJJ, Muay Thai — buche sofort ein Probetraining.",
      },
      title: "Gym-Finder",
      subtitle: "Entdecke Kampfsport-Gyms in deiner Region und vereinbare ein Probetraining",
      mapCta: "Auf der Karte ansehen",
      filterDiscipline: "Disziplin",
      filterCity: "Stadt",
      filterTrial: "Probetraining",
      trialAvailable: "Probetraining vorhanden",
      filterSort: "Sortierung",
      sortMembers: "Meiste Mitglieder",
      sortRating: "Beste Bewertung",
      sortNew: "Neueste",
      searchPlaceholder: "Gym-Name oder Stadt suchen…",
      emptyTitle: "Kein Gym gefunden",
      emptyBody: "Ändere die Filter oder trag dein Gym bei FIGHTNET ein.",
      emptyCta: "Mein Gym eintragen",
      resultCount: "{count} Gyms gefunden",
    },
    detail: {
      notFound: "Gym nicht gefunden",
      metaDescription:
        "{name}, {city} — {disciplines}. Buche jetzt ein Probetraining.",
      haloGym: "Halo-Gym",
      founderGym: "Gründungs-Gym",
      members: "Mitglieder",
      about: "Über das Gym",
      schedule: "Kursplan",
      noScheduleTitle: "Noch kein Kursplan hinterlegt",
      noScheduleBody: "Das Gym veröffentlicht seinen Kursplan in Kürze.",
      trialOk: "Probetraining möglich",
      coaches: "Trainer",
      coachFallbackTitle: "Trainer",
      headCoach: "Cheftrainer",
      reviews: "Bewertungen",
      reviewSummary: "{avg} / 5 · {count} Bewertungen",
      noReviews: "Noch keine Bewertung — schreib die erste",
      trialTitle: "Probetraining",
      trialBody:
        "Zum ersten Mal hier? Melde dich über den eigenen Ablauf für ein Probetraining an — das Gym erwartet dich dann schon.",
      contact: "Kontakt",
      website: "Website",
      directions: "Route berechnen",
      openingHours: "Öffnungszeiten",
      closed: "Geschlossen",
      amenities: "Ausstattung",
    },
  },

  en: {
    list: {
      meta: {
        title: "Gym finder",
        description:
          "Find combat sports gyms across the DACH region. MMA, boxing, BJJ, Muay Thai — book a trial session right away.",
      },
      title: "Gym finder",
      subtitle: "Discover combat sports gyms near you and arrange a trial session",
      mapCta: "View on the map",
      filterDiscipline: "Discipline",
      filterCity: "City",
      filterTrial: "Trial",
      trialAvailable: "Trial session available",
      filterSort: "Sorting",
      sortMembers: "Most members",
      sortRating: "Highest rated",
      sortNew: "Newest",
      searchPlaceholder: "Search by gym name or city…",
      emptyTitle: "No gym found",
      emptyBody: "Change the filters, or add your gym to FIGHTNET.",
      emptyCta: "Add my gym",
      resultCount: "{count} gyms found",
    },
    detail: {
      notFound: "Gym not found",
      metaDescription: "{name}, {city} — {disciplines}. Book a trial session.",
      haloGym: "Halo gym",
      founderGym: "Founding gym",
      members: "members",
      about: "About the gym",
      schedule: "Class schedule",
      noScheduleTitle: "No schedule added yet",
      noScheduleBody: "The gym will publish its class schedule shortly.",
      trialOk: "Trial welcome",
      coaches: "Coaches",
      coachFallbackTitle: "Coach",
      headCoach: "Head coach",
      reviews: "Reviews",
      reviewSummary: "{avg} / 5 · {count} reviews",
      noReviews: "No reviews yet — be the first to write one",
      trialTitle: "Trial session",
      trialBody:
        "First time here? Sign up through the dedicated trial flow — the gym will be expecting you.",
      contact: "Contact",
      website: "Website",
      directions: "Get directions",
      openingHours: "Opening hours",
      closed: "Closed",
      amenities: "Facilities",
    },
  },

  tr: {
    list: {
      meta: {
        title: "Salon Bulucu",
        description:
          "DACH bölgesindeki dövüş sporu salonlarını bul. MMA, boks, BJJ, Muay Thai — deneme antrenmanı için hemen rezervasyon yap.",
      },
      title: "Salon Bulucu",
      subtitle: "Bölgendeki dövüş sporu salonlarını keşfet, deneme antrenmanı ayarla",
      mapCta: "Haritada Gör",
      filterDiscipline: "Disiplin",
      filterCity: "Şehir",
      filterTrial: "Deneme",
      trialAvailable: "Deneme antrenmanı var",
      filterSort: "Sıralama",
      sortMembers: "En çok üye",
      sortRating: "En yüksek puan",
      sortNew: "En yeni",
      searchPlaceholder: "Salon adı veya şehir ara…",
      emptyTitle: "Salon bulunamadı",
      emptyBody: "Filtreleri değiştir ya da salonunu FIGHTNET'e ekle.",
      emptyCta: "Salonumu Ekle",
      resultCount: "{count} salon bulundu",
    },
    detail: {
      notFound: "Salon bulunamadı",
      metaDescription:
        "{name}, {city} — {disciplines}. Deneme antrenmanı için rezervasyon yap.",
      haloGym: "Halo Salon",
      founderGym: "Kurucu Salon",
      members: "üye",
      about: "Salon Hakkında",
      schedule: "Ders Programı",
      noScheduleTitle: "Program henüz eklenmemiş",
      noScheduleBody: "Salon yakında ders programını paylaşacak.",
      trialOk: "Deneme OK",
      coaches: "Antrenörler",
      coachFallbackTitle: "Antrenör",
      headCoach: "Baş Antrenör",
      reviews: "Değerlendirmeler",
      reviewSummary: "{avg} / 5 · {count} değerlendirme",
      noReviews: "Henüz değerlendirme yok — ilk sen yaz",
      trialTitle: "Deneme Antrenmanı",
      trialBody:
        "İlk kez mi geliyorsun? Deneme antrenmanı için özel akışla kayıt ol — salon seni bekliyor olacak.",
      contact: "İletişim",
      website: "Web sitesi",
      directions: "Yol tarifi al",
      openingHours: "Açılış Saatleri",
      closed: "Kapalı",
      amenities: "Olanaklar",
    },
  },
};
