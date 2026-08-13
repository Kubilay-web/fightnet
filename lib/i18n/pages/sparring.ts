import type { Locale } from "@/lib/i18n/config";

/** `/sparring` — partner arama sayfası. */
type Copy = {
  meta: { title: string; description: string };
  title: string;
  subtitle: string;
  createListing: string;
  safetyTitle: string;
  safetyBody: string;
  safetyLink: string;
  filterDiscipline: string;
  filterLevel: string;
  filterIntensity: string;
  filterWeight: string;
  weightUnder65: string;
  weight65to80: string;
  weight80to95: string;
  weightOver95: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyBody: string;
  /** {count} → açık ilan sayısı */
  resultCount: string;
  /** {km} → yarıçap */
  radius: string;
  ownListing: string;
  requestSent: string;
  requestAccepted: string;
  requestRejected: string;
};

export const sparringCopy: Record<Locale, Copy> = {
  de: {
    meta: {
      title: "Sparringpartner suchen",
      description:
        "Finde in deiner Region einen Sparringpartner nach Disziplin, Niveau und Gewicht. Sichere Vermittlung mit Sicherheitsbewertung nach jeder Einheit.",
    },
    title: "Sparringpartner suchen",
    subtitle: "Finde einen Partner, der zu deinem Niveau und Gewicht passt — sicher, verifiziert, regional",
    createListing: "Anzeige aufgeben",
    safetyTitle: "Sparring-Sicherheit",
    safetyBody:
      "Wer eine Sparring-Anzeige aufgibt oder darauf antwortet, bestätigt die Haftungsfreistellung. Nach jeder Einheit erfolgt eine Sicherheitsbewertung; drei Meldungen wegen unsicheren Sparrings führen zur automatischen Sperre.",
    safetyLink: "Sparring-Vereinbarung",
    filterDiscipline: "Disziplin",
    filterLevel: "Niveau",
    filterIntensity: "Intensität",
    filterWeight: "Gewicht",
    weightUnder65: "-65 kg",
    weight65to80: "65-80 kg",
    weight80to95: "80-95 kg",
    weightOver95: "95+ kg",
    searchPlaceholder: "Stadt oder Postleitzahl…",
    emptyTitle: "Keine Anzeige gefunden",
    emptyBody: "Mit diesen Filtern gibt es keine offene Sparring-Anzeige. Gib die erste auf.",
    resultCount: "{count} offene Anzeigen",
    radius: "{km} km Umkreis",
    ownListing: "Deine eigene Anzeige",
    requestSent: "Anfrage gesendet",
    requestAccepted: "Angenommen",
    requestRejected: "Abgelehnt",
  },

  en: {
    meta: {
      title: "Find a sparring partner",
      description:
        "Find a sparring partner near you by discipline, level and weight. Safe matching with a safety rating after every session.",
    },
    title: "Find a sparring partner",
    subtitle: "Find a partner who matches your level and weight — safe, verified, local",
    createListing: "Post a listing",
    safetyTitle: "Sparring safety",
    safetyBody:
      "Everyone who posts or answers a sparring listing accepts the liability waiver. A safety rating follows every session; three unsafe-sparring reports lead to an automatic suspension.",
    safetyLink: "Sparring agreement",
    filterDiscipline: "Discipline",
    filterLevel: "Level",
    filterIntensity: "Intensity",
    filterWeight: "Weight",
    weightUnder65: "-65 kg",
    weight65to80: "65-80 kg",
    weight80to95: "80-95 kg",
    weightOver95: "95+ kg",
    searchPlaceholder: "City or postcode…",
    emptyTitle: "No listing found",
    emptyBody: "There is no open sparring listing matching these filters. Post the first one.",
    resultCount: "{count} open listings",
    radius: "{km} km radius",
    ownListing: "Your own listing",
    requestSent: "Request sent",
    requestAccepted: "Accepted",
    requestRejected: "Declined",
  },

  tr: {
    meta: {
      title: "Sparring Partneri Ara",
      description:
        "Bölgende disiplin, seviye ve kiloya göre sparring partneri bul. Her seans sonrası güvenlik değerlendirmesi ile güvenli eşleşme.",
    },
    title: "Sparring Partneri Ara",
    subtitle: "Seviyene ve kilona uygun partner bul — güvenli, doğrulanmış, bölgesel",
    createListing: "İlan Ver",
    safetyTitle: "Sparring güvenliği",
    safetyBody:
      "Sparring ilanı veren ve talep eden herkes sorumluluk feragatnamesini onaylar. Her seans sonrası güvenlik değerlendirmesi yapılır; 3 güvensizlik raporu otomatik askıya alma ile sonuçlanır.",
    safetyLink: "Sparring Sözleşmesi",
    filterDiscipline: "Disiplin",
    filterLevel: "Seviye",
    filterIntensity: "Yoğunluk",
    filterWeight: "Kilo",
    weightUnder65: "-65 kg",
    weight65to80: "65-80 kg",
    weight80to95: "80-95 kg",
    weightOver95: "95+ kg",
    searchPlaceholder: "Şehir veya posta kodu…",
    emptyTitle: "İlan bulunamadı",
    emptyBody: "Bu filtrelerle açık sparring ilanı yok. İlk ilanı sen ver.",
    resultCount: "{count} açık ilan",
    radius: "{km} km çevre",
    ownListing: "Kendi ilanın",
    requestSent: "Talep gönderildi",
    requestAccepted: "Kabul edildi",
    requestRejected: "Reddedildi",
  },
};
