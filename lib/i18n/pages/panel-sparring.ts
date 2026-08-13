import type { Locale } from "@/lib/i18n/config";

/**
 * Sparring metinleri: `/panel/sparring`, `/panel/sparring/yeni`,
 * `SparringListingForm`, `SparringRequestButton`, `SparringReviewForm`.
 *
 * Feragatname onayının ortasında bir bağlantı olduğu için metin
 * `waiverBefore` / `waiverLink` / `waiverAfter` olarak üçe bölündü —
 * böylece her dil kendi sözdizimine göre bağlantıyı konumlandırabilir.
 */
type Copy = {
  meta: { list: string; create: string };
  list: {
    title: string;
    subtitle: string;
    createListing: string;
    reviewable: { title: string; subtitle: string };
    sparringWith: (name: string) => string;
    incoming: {
      title: string;
      pendingCount: (n: number) => string;
      emptyTitle: string;
      emptyDescription: string;
      proposed: string;
      accept: string;
      decline: string;
      accepted: string;
      declined: string;
      cancelled: string;
    };
    outgoing: {
      title: string;
      pending: string;
      accepted: string;
      declined: string;
      cancelled: string;
    };
    listings: {
      title: string;
      emptyTitle: string;
      emptyDescription: string;
      emptyAction: string;
      open: string;
      matched: string;
      closed: string;
      requestCount: (n: number) => string;
      close: string;
    };
  };
  create: {
    title: string;
    subtitle: string;
    verifyTitle: string;
    verifyBody: string;
    verifyCta: string;
  };
  form: {
    submit: string;
    discipline: string;
    select: string;
    level: string;
    weight: string;
    weightTolerance: string;
    weightToleranceHint: string;
    city: string;
    postalCode: string;
    radius: string;
    gym: string;
    gymHint: string;
    any: string;
    intensity: string;
    intensityHint: string;
    availability: string;
    genderPref: string;
    male: string;
    female: string;
    minAge: string;
    maxAge: string;
    note: string;
    notePlaceholder: string;
  };
  request: {
    button: string;
    doneTitle: string;
    doneBody: (name: string) => string;
    verifyTitle: string;
    verifyBody: string;
    verifyCta: string;
    heading: (name: string) => string;
    message: string;
    messagePlaceholder: string;
    proposedDate: string;
    waiverAlert: string;
    waiverBefore: string;
    waiverLink: string;
    waiverAfter: string;
    cancel: string;
    submit: string;
    error: string;
  };
  review: {
    submit: string;
    safety: string;
    safetyHint: string;
    technique: string;
    techniqueHint: string;
    punctuality: string;
    punctualityHint: string;
    wouldRepeat: (name: string) => string;
    comment: string;
    commentPlaceholder: string;
    flagUnsafe: string;
    starAria: (label: string, n: number) => string;
  };
};

export const panelSparringCopy: Record<Locale, Copy> = {
  de: {
    meta: { list: "Sparring", create: "Sparring-Anzeige aufgeben" },
    list: {
      title: "Sparring",
      subtitle: "Deine Anzeigen, eingegangene Anfragen und Bewertungen",
      createListing: "Anzeige aufgeben",
      reviewable: {
        title: "Offene Bewertungen",
        subtitle: "Für eine sichere Community: bewerte nach jeder Einheit",
      },
      sparringWith: (name) => `Sparring mit ${name}`,
      incoming: {
        title: "Eingegangene Anfragen",
        pendingCount: (n) => `${n} offen`,
        emptyTitle: "Keine Anfragen",
        emptyDescription: "Sobald du eine Anzeige aufgibst, erscheinen die Anfragen hier.",
        proposed: "Vorgeschlagen:",
        accept: "Annehmen",
        decline: "Ablehnen",
        accepted: "Angenommen",
        declined: "Abgelehnt",
        cancelled: "Storniert",
      },
      outgoing: {
        title: "Gesendete Anfragen",
        pending: "Offen",
        accepted: "Angenommen",
        declined: "Abgelehnt",
        cancelled: "Storniert",
      },
      listings: {
        title: "Meine Anzeigen",
        emptyTitle: "Du hast keine Anzeige",
        emptyDescription:
          "Gib eine Sparring-Anzeige auf, damit Athletinnen und Athleten aus deiner Region dich finden.",
        emptyAction: "Anzeige aufgeben",
        open: "Offen",
        matched: "Gematcht",
        closed: "Geschlossen",
        requestCount: (n) => `${n} Anfragen`,
        close: "Anzeige schließen",
      },
    },
    create: {
      title: "Sparring-Anzeige aufgeben",
      subtitle: "Lass passende Sparringpartner aus deiner Region dich finden",
      verifyTitle: "Verifizierung erforderlich",
      verifyBody:
        "Um eine Sparring-Anzeige aufzugeben, brauchst du Stufe 1 (Identität verifiziert). Das ist zur Sicherheit aller verpflichtend.",
      verifyCta: "Verifizierung starten",
    },
    form: {
      submit: "Anzeige veröffentlichen",
      discipline: "Disziplin",
      select: "Auswählen",
      level: "Dein Level",
      weight: "Dein Gewicht (kg)",
      weightTolerance: "Gewichtstoleranz (±kg)",
      weightToleranceHint: "Partner in dieser Spanne werden gematcht",
      city: "Stadt",
      postalCode: "Postleitzahl",
      radius: "Umkreis (km)",
      gym: "Gym",
      gymHint: "In welchem Gym möchtest du sparren?",
      any: "Egal",
      intensity: "Intensität",
      intensityHint: "Sag klar, was du erwartest — wichtig für die Sicherheit",
      availability: "Verfügbarkeit",
      genderPref: "Partnerpräferenz",
      male: "Männlich",
      female: "Weiblich",
      minAge: "Min. Alter",
      maxAge: "Max. Alter",
      note: "Deine Notiz",
      notePlaceholder: "Wonach suchst du? Welche Techniken möchtest du trainieren?",
    },
    request: {
      button: "Sparring anfragen",
      doneTitle: "Deine Anfrage ist raus",
      doneBody: (name) => `Du bekommst eine Benachrichtigung, sobald ${name} antwortet.`,
      verifyTitle: "Verifizierung erforderlich",
      verifyBody:
        "Die Sparringsuche steht Mitgliedern ab Stufe 1 (Identität verifiziert) offen. Das ist zur Sicherheit aller verpflichtend.",
      verifyCta: "Verifizierung starten",
      heading: (name) => `Sparring mit ${name}`,
      message: "Deine Nachricht",
      messagePlaceholder: "Hallo! Mein Level passt, unter der Woche abends habe ich Zeit…",
      proposedDate: "Vorgeschlagenes Datum",
      waiverAlert:
        "Sparring ist ein kontrolliertes Training, kein Wettkampf. Du akzeptierst das Verletzungsrisiko und bestätigst, dass du für die Sicherheit deines Partners mitverantwortlich bist.",
      waiverBefore: "Ich habe die ",
      waiverLink: "Sparring-Vereinbarung",
      waiverAfter: " und den Haftungsausschluss gelesen und akzeptiere beides.",
      cancel: "Abbrechen",
      submit: "Anfrage senden",
      error: "Anfrage konnte nicht gesendet werden",
    },
    review: {
      submit: "Bewertung senden",
      safety: "Sicherheit",
      safetyHint: "War es kontrolliert?",
      technique: "Technik",
      techniqueHint: "Technisches Niveau",
      punctuality: "Pünktlichkeit",
      punctualityHint: "War die Person pünktlich?",
      wouldRepeat: (name) => `Ich würde wieder mit ${name} sparren`,
      comment: "Kommentar",
      commentPlaceholder: "Kurzes Feedback (optional)",
      flagUnsafe: "Unsicheres Verhalten melden (geht an die Moderation)",
      starAria: (label, n) => `${label}: ${n} Sterne`,
    },
  },

  en: {
    meta: { list: "Sparring", create: "Post a sparring listing" },
    list: {
      title: "Sparring",
      subtitle: "Your listings, incoming requests and reviews",
      createListing: "Post a listing",
      reviewable: {
        title: "Reviews pending",
        subtitle: "For a safe community: leave a review after every session",
      },
      sparringWith: (name) => `Sparring with ${name}`,
      incoming: {
        title: "Incoming requests",
        pendingCount: (n) => `${n} pending`,
        emptyTitle: "No requests",
        emptyDescription: "Once you post a listing, requests will show up here.",
        proposed: "Proposed:",
        accept: "Accept",
        decline: "Decline",
        accepted: "Accepted",
        declined: "Declined",
        cancelled: "Cancelled",
      },
      outgoing: {
        title: "Requests I sent",
        pending: "Pending",
        accepted: "Accepted",
        declined: "Declined",
        cancelled: "Cancelled",
      },
      listings: {
        title: "My listings",
        emptyTitle: "You have no listings",
        emptyDescription: "Post a sparring listing so athletes in your area can reach you.",
        emptyAction: "Post a listing",
        open: "Open",
        matched: "Matched",
        closed: "Closed",
        requestCount: (n) => `${n} requests`,
        close: "Close listing",
      },
    },
    create: {
      title: "Post a sparring listing",
      subtitle: "Let the right partners in your area find you",
      verifyTitle: "Verification required",
      verifyBody:
        "To post a sparring listing you need Level 1 (identity verified). This is mandatory for everyone's safety.",
      verifyCta: "Start verification",
    },
    form: {
      submit: "Publish listing",
      discipline: "Discipline",
      select: "Select",
      level: "Your level",
      weight: "Your weight (kg)",
      weightTolerance: "Weight tolerance (±kg)",
      weightToleranceHint: "Partners within this range will be matched",
      city: "City",
      postalCode: "Postcode",
      radius: "Radius (km)",
      gym: "Gym",
      gymHint: "Which gym would you like to spar at?",
      any: "No preference",
      intensity: "Intensity",
      intensityHint: "Be clear about your expectations — it matters for safety",
      availability: "Availability",
      genderPref: "Partner preference",
      male: "Male",
      female: "Female",
      minAge: "Min. age",
      maxAge: "Max. age",
      note: "Your note",
      notePlaceholder: "What are you looking for? Which techniques do you want to drill?",
    },
    request: {
      button: "Request sparring",
      doneTitle: "Your request has been sent",
      doneBody: (name) => `You will get a notification once ${name} replies.`,
      verifyTitle: "Verification required",
      verifyBody:
        "Sparring search is open to members at Level 1 (identity verified). This is mandatory for everyone's safety.",
      verifyCta: "Start verification",
      heading: (name) => `Sparring with ${name}`,
      message: "Your message",
      messagePlaceholder: "Hi! My level is a good fit, I'm free on weekday evenings…",
      proposedDate: "Proposed date",
      waiverAlert:
        "Sparring is controlled training, not a competition. You accept the risk of injury and confirm that you are responsible for your partner's safety.",
      waiverBefore: "I have read and accept the ",
      waiverLink: "Sparring Agreement",
      waiverAfter: " and the liability waiver.",
      cancel: "Cancel",
      submit: "Send request",
      error: "Request could not be sent",
    },
    review: {
      submit: "Submit review",
      safety: "Safety",
      safetyHint: "Was it controlled?",
      technique: "Technique",
      techniqueHint: "Technical level",
      punctuality: "Punctuality",
      punctualityHint: "Did they show up on time?",
      wouldRepeat: (name) => `I would spar with ${name} again`,
      comment: "Comment",
      commentPlaceholder: "Short feedback (optional)",
      flagUnsafe: "Report unsafe behaviour (sent to moderation)",
      starAria: (label, n) => `${label}: ${n} stars`,
    },
  },

  tr: {
    meta: { list: "Sparring", create: "Sparring İlanı Ver" },
    list: {
      title: "Sparring",
      subtitle: "İlanların, gelen talepler ve değerlendirmeler",
      createListing: "İlan Ver",
      reviewable: {
        title: "Değerlendirme Bekleyenler",
        subtitle: "Güvenli topluluk için her seans sonrası değerlendir",
      },
      sparringWith: (name) => `${name} ile sparring`,
      incoming: {
        title: "Gelen Talepler",
        pendingCount: (n) => `${n} bekleyen`,
        emptyTitle: "Talep yok",
        emptyDescription: "İlan verdiğinde talepler burada görünür.",
        proposed: "Önerilen:",
        accept: "Kabul",
        decline: "Reddet",
        accepted: "Kabul edildi",
        declined: "Reddedildi",
        cancelled: "İptal",
      },
      outgoing: {
        title: "Gönderdiğim Talepler",
        pending: "Bekliyor",
        accepted: "Kabul",
        declined: "Red",
        cancelled: "İptal",
      },
      listings: {
        title: "İlanlarım",
        emptyTitle: "İlanın yok",
        emptyDescription: "Sparring ilanı ver, bölgendeki sporcular sana ulaşsın.",
        emptyAction: "İlan Ver",
        open: "Açık",
        matched: "Eşleşti",
        closed: "Kapalı",
        requestCount: (n) => `${n} talep`,
        close: "İlanı Kapat",
      },
    },
    create: {
      title: "Sparring İlanı Ver",
      subtitle: "Bölgendeki uygun partnerler seni bulsun",
      verifyTitle: "Doğrulama gerekli",
      verifyBody:
        "Sparring ilanı vermek için Seviye 1 (kimlik doğrulanmış) olmalısın. Bu, herkesin güvenliği için zorunludur.",
      verifyCta: "Doğrulamayı başlat",
    },
    form: {
      submit: "İlanı Yayınla",
      discipline: "Disiplin",
      select: "Seç",
      level: "Seviyen",
      weight: "Kilon (kg)",
      weightTolerance: "Kilo toleransı (±kg)",
      weightToleranceHint: "Bu aralıktaki partnerler eşleşir",
      city: "Şehir",
      postalCode: "Posta kodu",
      radius: "Yarıçap (km)",
      gym: "Salon",
      gymHint: "Sparring'i hangi salonda yapmak istiyorsun?",
      any: "Fark etmez",
      intensity: "Yoğunluk",
      intensityHint: "Beklentini net belirt — güvenlik için önemli",
      availability: "Müsaitlik",
      genderPref: "Partner tercihi",
      male: "Erkek",
      female: "Kadın",
      minAge: "Min. yaş",
      maxAge: "Maks. yaş",
      note: "Notun",
      notePlaceholder: "Ne arıyorsun? Hangi teknikleri çalışmak istiyorsun?",
    },
    request: {
      button: "Sparring Talebi",
      doneTitle: "Talebin gönderildi",
      doneBody: (name) => `${name} yanıtladığında bildirim alacaksın.`,
      verifyTitle: "Doğrulama gerekli",
      verifyBody:
        "Sparring araması Seviye 1 (kimlik doğrulanmış) üyelere açıktır. Bu, herkesin güvenliği için zorunludur.",
      verifyCta: "Doğrulamayı başlat",
      heading: (name) => `${name} ile sparring`,
      message: "Mesajın",
      messagePlaceholder: "Merhaba! Seviyem uygun, hafta içi akşamları müsaitim…",
      proposedDate: "Önerilen tarih",
      waiverAlert:
        "Sparring kontrollü bir antrenmandır, müsabaka değildir. Yaralanma riskini kabul eder, partnerinin güvenliğinden sorumlu olduğunu onaylarsın.",
      waiverBefore: "",
      waiverLink: "Sparring Sözleşmesi",
      waiverAfter: " ve sorumluluk feragatnamesini okudum, kabul ediyorum.",
      cancel: "Vazgeç",
      submit: "Talep Gönder",
      error: "Talep gönderilemedi",
    },
    review: {
      submit: "Değerlendirmeyi Gönder",
      safety: "Güvenlik",
      safetyHint: "Kontrollü müydü?",
      technique: "Teknik",
      techniqueHint: "Teknik seviye",
      punctuality: "Dakiklik",
      punctualityHint: "Zamanında geldi mi?",
      wouldRepeat: (name) => `${name} ile tekrar sparring yaparım`,
      comment: "Yorum",
      commentPlaceholder: "Kısa geri bildirim (opsiyonel)",
      flagUnsafe: "Güvensiz davranış bildir (moderasyona iletilir)",
      starAria: (label, n) => `${label} ${n} yıldız`,
    },
  },
};
