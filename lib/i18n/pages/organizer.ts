import type { Locale } from "@/lib/i18n/config";

/**
 * §4.1 / §4.4 — Organizatör alanının metinleri.
 *
 * Kapsam: `/organizator` listesi, `/organizator/[id]` yönetim ekranı,
 * `/organizator/etkinlikler/yeni` ve bunların kullandığı istemci formları
 * (`components/event-forms.tsx`, `components/registration-review.tsx`).
 *
 * Sözlük (`lib/i18n/dictionaries`) yerine sayfa bazlı copy modülü kullanılır:
 * `Record<Locale, Copy>` sayesinde eksik bir çeviri derleme hatası olur.
 */
type Copy = {
  index: {
    meta: { title: string };
    title: string;
    subtitle: string;
    addEvent: string;
    roleAlert: { title: string; body: string; cta: string };
    stats: { total: string; live: string; upcoming: string };
    empty: { title: string; description: string; action: string };
    fights: string;
    comments: string;
    views: string;
    view: string;
    manage: string;
    live: string;
  };
  manage: {
    meta: { title: string };
    fights: string;
    viewPage: string;
    scoring: {
      title: string;
      subtitle: string;
      emptyTitle: string;
      emptyDescription: string;
    };
    mainEvent: string;
    titleFight: string;
    rounds: string;
    deleteFight: string;
    vs: string;
    registrations: {
      title: string;
      openSubtitle: (count: number) => string;
      closedSubtitle: string;
      emptyTitle: string;
      emptyDescription: string;
      status: {
        PENDING: string;
        ACCEPTED: string;
        WAITLISTED: string;
        REJECTED: string;
        WITHDRAWN: string;
      };
      minorApproved: string;
      minorNotApproved: string;
      noMedical: string;
      record: string;
      coach: string;
      emergency: string;
    };
    stream: { title: string; ppv: (price: number) => string; free: string };
    addFight: string;
    eventInfo: string;
  };
  create: {
    meta: { title: string };
    title: string;
    subtitle: string;
  };
  eventForm: {
    submitCreate: string;
    submitUpdate: string;
    poster: string;
    posterHint: string;
    name: string;
    type: string;
    status: string;
    statusOptions: {
      DRAFT: string;
      PUBLISHED: string;
      LIVE: string;
      FINISHED: string;
      CANCELLED: string;
    };
    description: string;
    disciplines: string;
    startsAt: string;
    doorsAt: string;
    endsAt: string;
    venueName: string;
    street: string;
    city: string;
    postalCode: string;
    lat: string;
    lng: string;
    ticketUrl: string;
    ticketPrice: string;
    capacity: string;
    streamUrl: string;
    ppvPrice: string;
    isPPV: string;
    registrationOpen: string;
  };
  fightForm: {
    submit: string;
    discipline: string;
    weightClass: string;
    select: string;
    rounds: string;
    roundMinutes: string;
    redCorner: string;
    blueCorner: string;
    fighterName: string;
    username: string;
    usernameHint: string;
    record: string;
    order: string;
    mainEvent: string;
    mainEventLabel: string;
    titleFight: string;
    titleFightLabel: string;
  };
  fightResultForm: {
    submit: string;
    status: string;
    statusOptions: {
      SCHEDULED: string;
      LIVE: string;
      FINISHED: string;
      CANCELLED: string;
      NO_CONTEST: string;
    };
    currentRound: string;
    round: (n: number) => string;
    winner: string;
    red: string;
    blue: string;
    method: string;
    endRound: string;
    endTime: string;
    notes: string;
  };
  registrationReview: {
    notePlaceholder: string;
    accept: string;
    waitlist: string;
    reject: string;
  };
};

export const organizerCopy: Record<Locale, Copy> = {
  de: {
    index: {
      meta: { title: "Meine Veranstaltungen" },
      title: "Meine Veranstaltungen",
      subtitle: "Veranstaltung erstellen, Fightcard aufbauen, Livescore steuern",
      addEvent: "Veranstaltung hinzufügen",
      roleAlert: {
        title: "Veranstalter-Rolle erforderlich",
        body:
          "Um eine Veranstaltung zu erstellen, musst du mit der Verifizierung Stufe 2 in die Veranstalter-Rolle wechseln.",
        cta: "Verifizierung starten",
      },
      stats: { total: "Gesamt", live: "Live", upcoming: "Bevorstehend" },
      empty: {
        title: "Du hast noch keine Veranstaltung",
        description:
          "Erstelle deine erste Veranstaltung — Fightcard, Tickets und Livescore an einem Ort.",
        action: "Veranstaltung hinzufügen",
      },
      fights: "Kämpfe",
      comments: "Kommentare",
      views: "Aufrufe",
      view: "Ansehen",
      manage: "Verwalten",
      live: "Live",
    },
    manage: {
      meta: { title: "Veranstaltungsverwaltung" },
      fights: "Kämpfe",
      viewPage: "Seite ansehen",
      scoring: {
        title: "Livescore-Steuerung",
        subtitle: "Runde weiterschalten, Ergebnis eintragen — für Zuschauer sofort sichtbar",
        emptyTitle: "Keine Kämpfe",
        emptyDescription: "Erstelle zuerst die Fightcard.",
      },
      mainEvent: "Main Event",
      titleFight: "Titel",
      rounds: "Runden",
      deleteFight: "Kampf löschen",
      vs: "vs",
      registrations: {
        title: "Wettkampf-Anmeldungen",
        openSubtitle: (count) => `${count} Anmeldungen · Anmeldung geöffnet`,
        closedSubtitle:
          "Anmeldung geschlossen — du kannst sie im Bereich Veranstaltungsdaten öffnen",
        emptyTitle: "Noch keine Anmeldungen",
        emptyDescription: "Sobald du die Anmeldung öffnest, bewerben sich Athleten hier.",
        status: {
          PENDING: "Ausstehend",
          ACCEPTED: "Angenommen",
          WAITLISTED: "Warteliste",
          REJECTED: "Abgelehnt",
          WITHDRAWN: "Zurückgezogen",
        },
        minorApproved: "Unter 18 · Elternfreigabe liegt vor",
        minorNotApproved: "Unter 18 · keine Freigabe",
        noMedical: "Keine Gesundheitserklärung",
        record: "Bilanz",
        coach: "Trainer",
        emergency: "Notfallkontakt",
      },
      stream: {
        title: "Livestream",
        ppv: (price) => `PPV — ${price} € / Zuschauer`,
        free: "Kostenloser Stream",
      },
      addFight: "Kampf hinzufügen",
      eventInfo: "Veranstaltungsdaten",
    },
    create: {
      meta: { title: "Veranstaltung hinzufügen" },
      title: "Veranstaltung hinzufügen",
      subtitle: "Erstelle die Veranstaltung, danach baust du die Fightcard auf",
    },
    eventForm: {
      submitCreate: "Veranstaltung erstellen",
      submitUpdate: "Veranstaltung aktualisieren",
      poster: "Plakat",
      posterHint: "Hochformat (3:4)",
      name: "Name der Veranstaltung",
      type: "Art",
      status: "Veröffentlichungsstatus",
      statusOptions: {
        DRAFT: "Entwurf",
        PUBLISHED: "Veröffentlicht",
        LIVE: "Live",
        FINISHED: "Beendet",
        CANCELLED: "Abgesagt",
      },
      description: "Beschreibung",
      disciplines: "Disziplinen",
      startsAt: "Beginn",
      doorsAt: "Einlass",
      endsAt: "Ende",
      venueName: "Name der Location",
      street: "Adresse",
      city: "Stadt",
      postalCode: "PLZ",
      lat: "Breitengrad",
      lng: "Längengrad",
      ticketUrl: "Ticket-Link",
      ticketPrice: "Ticketpreis (€)",
      capacity: "Kapazität",
      streamUrl: "Livestream-Link",
      ppvPrice: "PPV-Preis (€)",
      isPPV: "Kostenpflichtiger Livestream (PPV)",
      registrationOpen: "Wettkampf-Anmeldung geöffnet",
    },
    fightForm: {
      submit: "Kampf hinzufügen",
      discipline: "Disziplin",
      weightClass: "Gewichtsklasse",
      select: "Auswählen",
      rounds: "Runden",
      roundMinutes: "Rundendauer (Min.)",
      redCorner: "Rote Ecke",
      blueCorner: "Blaue Ecke",
      fighterName: "Name",
      username: "FIGHTNET-Benutzername",
      usernameHint: "Zur Verknüpfung mit dem Profil (optional)",
      record: "Bilanz",
      order: "Reihenfolge",
      mainEvent: "Hauptkampf",
      mainEventLabel: "Main Event",
      titleFight: "Titelkampf",
      titleFightLabel: "Title Fight",
    },
    fightResultForm: {
      submit: "Score aktualisieren",
      status: "Status",
      statusOptions: {
        SCHEDULED: "Angesetzt",
        LIVE: "Live",
        FINISHED: "Beendet",
        CANCELLED: "Abgesagt",
        NO_CONTEST: "No Contest",
      },
      currentRound: "Aktuelle Runde",
      round: (n) => `Runde ${n}`,
      winner: "Sieger",
      red: "Rot",
      blue: "Blau",
      method: "Entscheidungsart",
      endRound: "Endrunde",
      endTime: "Endzeit",
      notes: "Notiz",
    },
    registrationReview: {
      notePlaceholder: "Notiz an den Athleten (optional) — Matchup, Wiegezeit …",
      accept: "Annehmen",
      waitlist: "Warteliste",
      reject: "Ablehnen",
    },
  },

  en: {
    index: {
      meta: { title: "My events" },
      title: "My events",
      subtitle: "Create an event, build the fight card, run the live score",
      addEvent: "Add event",
      roleAlert: {
        title: "Organizer role required",
        body:
          "To create an event you need to switch to the Organizer role with Level 2 verification.",
        cta: "Start verification",
      },
      stats: { total: "Total", live: "Live", upcoming: "Upcoming" },
      empty: {
        title: "You have no events",
        description:
          "Create your first event — fight card, tickets and live scoring all in one place.",
        action: "Add event",
      },
      fights: "fights",
      comments: "comments",
      views: "views",
      view: "View",
      manage: "Manage",
      live: "Live",
    },
    manage: {
      meta: { title: "Event management" },
      fights: "fights",
      viewPage: "View page",
      scoring: {
        title: "Live score control",
        subtitle: "Advance the round, enter the result — viewers see it instantly",
        emptyTitle: "No fights",
        emptyDescription: "Build the fight card first.",
      },
      mainEvent: "Main Event",
      titleFight: "Title",
      rounds: "rounds",
      deleteFight: "Delete fight",
      vs: "vs",
      registrations: {
        title: "Fight registrations",
        openSubtitle: (count) => `${count} applications · registration open`,
        closedSubtitle: "Registration closed — you can open it in the Event details section",
        emptyTitle: "No registrations yet",
        emptyDescription: "Once you open registration, athletes will apply here.",
        status: {
          PENDING: "Pending",
          ACCEPTED: "Accepted",
          WAITLISTED: "Waitlisted",
          REJECTED: "Rejected",
          WITHDRAWN: "Withdrawn",
        },
        minorApproved: "Under 18 · guardian approved",
        minorNotApproved: "Under 18 · no approval",
        noMedical: "No medical declaration",
        record: "Record",
        coach: "Coach",
        emergency: "Emergency contact",
      },
      stream: {
        title: "Live stream",
        ppv: (price) => `PPV — ${price} € / viewer`,
        free: "Free stream",
      },
      addFight: "Add fight",
      eventInfo: "Event details",
    },
    create: {
      meta: { title: "Add event" },
      title: "Add event",
      subtitle: "Create the event, then build the fight card",
    },
    eventForm: {
      submitCreate: "Create event",
      submitUpdate: "Update event",
      poster: "Poster",
      posterHint: "Portrait format (3:4)",
      name: "Event name",
      type: "Type",
      status: "Publication status",
      statusOptions: {
        DRAFT: "Draft",
        PUBLISHED: "Published",
        LIVE: "Live",
        FINISHED: "Finished",
        CANCELLED: "Cancelled",
      },
      description: "Description",
      disciplines: "Disciplines",
      startsAt: "Start",
      doorsAt: "Doors open",
      endsAt: "End",
      venueName: "Venue name",
      street: "Address",
      city: "City",
      postalCode: "Postcode",
      lat: "Latitude",
      lng: "Longitude",
      ticketUrl: "Ticket link",
      ticketPrice: "Ticket price (€)",
      capacity: "Capacity",
      streamUrl: "Live stream link",
      ppvPrice: "PPV price (€)",
      isPPV: "Paid live stream (PPV)",
      registrationOpen: "Fight registration open",
    },
    fightForm: {
      submit: "Add fight",
      discipline: "Discipline",
      weightClass: "Weight class",
      select: "Select",
      rounds: "Rounds",
      roundMinutes: "Round length (min)",
      redCorner: "Red corner",
      blueCorner: "Blue corner",
      fighterName: "Name",
      username: "FIGHTNET username",
      usernameHint: "To link the profile (optional)",
      record: "Record",
      order: "Order",
      mainEvent: "Main bout",
      mainEventLabel: "Main Event",
      titleFight: "Title bout",
      titleFightLabel: "Title Fight",
    },
    fightResultForm: {
      submit: "Update score",
      status: "Status",
      statusOptions: {
        SCHEDULED: "Scheduled",
        LIVE: "Live",
        FINISHED: "Finished",
        CANCELLED: "Cancelled",
        NO_CONTEST: "No contest",
      },
      currentRound: "Current round",
      round: (n) => `Round ${n}`,
      winner: "Winner",
      red: "Red",
      blue: "Blue",
      method: "Finish method",
      endRound: "Finishing round",
      endTime: "Finishing time",
      notes: "Note",
    },
    registrationReview: {
      notePlaceholder: "Note to the athlete (optional) — matchup, weigh-in time…",
      accept: "Accept",
      waitlist: "Waitlist",
      reject: "Reject",
    },
  },

  tr: {
    index: {
      meta: { title: "Etkinliklerim" },
      title: "Etkinliklerim",
      subtitle: "Etkinlik oluştur, dövüş kartını hazırla, canlı skoru yönet",
      addEvent: "Etkinlik Ekle",
      roleAlert: {
        title: "Organizatör rolü gerekli",
        body: "Etkinlik oluşturmak için Seviye 2 doğrulaması ile Organizatör rolüne geçmelisin.",
        cta: "Doğrulamayı başlat",
      },
      stats: { total: "Toplam", live: "Canlı", upcoming: "Yaklaşan" },
      empty: {
        title: "Etkinliğin yok",
        description: "İlk etkinliğini oluştur — dövüş kartı, bilet ve canlı skor tek yerde.",
        action: "Etkinlik Ekle",
      },
      fights: "müsabaka",
      comments: "yorum",
      views: "görüntülenme",
      view: "Gör",
      manage: "Yönet",
      live: "Canlı",
    },
    manage: {
      meta: { title: "Etkinlik Yönetimi" },
      fights: "müsabaka",
      viewPage: "Sayfayı gör",
      scoring: {
        title: "Canlı Skor Kontrolü",
        subtitle: "Raunt ilerlet, sonuç gir — izleyicilere anlık yansır",
        emptyTitle: "Müsabaka yok",
        emptyDescription: "Önce dövüş kartını oluştur.",
      },
      mainEvent: "Ana Müsabaka",
      titleFight: "Ünvan",
      rounds: "raunt",
      deleteFight: "Müsabakayı sil",
      vs: "vs",
      registrations: {
        title: "Müsabaka Kayıtları",
        openSubtitle: (count) => `${count} başvuru · kayıtlar açık`,
        closedSubtitle: "Kayıtlar kapalı — Etkinlik Bilgileri bölümünden açabilirsin",
        emptyTitle: "Henüz kayıt yok",
        emptyDescription: "Kayıtları açtığında sporcular buradan başvurur.",
        status: {
          PENDING: "Beklemede",
          ACCEPTED: "Kabul",
          WAITLISTED: "Yedek",
          REJECTED: "Ret",
          WITHDRAWN: "Geri çekildi",
        },
        minorApproved: "18 yaş altı · veli onaylı",
        minorNotApproved: "18 yaş altı · onay yok",
        noMedical: "Sağlık beyanı yok",
        record: "Bilanço",
        coach: "Antrenör",
        emergency: "Acil durum",
      },
      stream: {
        title: "Canlı Yayın",
        ppv: (price) => `PPV — ${price} € / izleyici`,
        free: "Ücretsiz yayın",
      },
      addFight: "Müsabaka Ekle",
      eventInfo: "Etkinlik Bilgileri",
    },
    create: {
      meta: { title: "Etkinlik Ekle" },
      title: "Etkinlik Ekle",
      subtitle: "Etkinliği oluştur, sonra dövüş kartını hazırla",
    },
    eventForm: {
      submitCreate: "Etkinliği Oluştur",
      submitUpdate: "Etkinliği Güncelle",
      poster: "Afiş",
      posterHint: "Dikey format (3:4)",
      name: "Etkinlik adı",
      type: "Tür",
      status: "Yayın durumu",
      statusOptions: {
        DRAFT: "Taslak",
        PUBLISHED: "Yayında",
        LIVE: "Canlı",
        FINISHED: "Tamamlandı",
        CANCELLED: "İptal",
      },
      description: "Açıklama",
      disciplines: "Disiplinler",
      startsAt: "Başlangıç",
      doorsAt: "Kapı açılış",
      endsAt: "Bitiş",
      venueName: "Mekan adı",
      street: "Adres",
      city: "Şehir",
      postalCode: "Posta kodu",
      lat: "Enlem",
      lng: "Boylam",
      ticketUrl: "Bilet bağlantısı",
      ticketPrice: "Bilet fiyatı (€)",
      capacity: "Kapasite",
      streamUrl: "Canlı yayın bağlantısı",
      ppvPrice: "PPV fiyatı (€)",
      isPPV: "Ücretli canlı yayın (PPV)",
      registrationOpen: "Müsabaka kaydı açık",
    },
    fightForm: {
      submit: "Müsabakayı Ekle",
      discipline: "Disiplin",
      weightClass: "Kilo sınıfı",
      select: "Seç",
      rounds: "Raunt",
      roundMinutes: "Raunt süresi (dk)",
      redCorner: "Kırmızı Köşe",
      blueCorner: "Mavi Köşe",
      fighterName: "İsim",
      username: "FIGHTNET kullanıcı adı",
      usernameHint: "Profile bağlamak için (opsiyonel)",
      record: "Bilanço",
      order: "Sıra",
      mainEvent: "Ana müsabaka",
      mainEventLabel: "Main Event",
      titleFight: "Ünvan maçı",
      titleFightLabel: "Title Fight",
    },
    fightResultForm: {
      submit: "Skoru Güncelle",
      status: "Durum",
      statusOptions: {
        SCHEDULED: "Planlandı",
        LIVE: "Canlı",
        FINISHED: "Bitti",
        CANCELLED: "İptal",
        NO_CONTEST: "Geçersiz",
      },
      currentRound: "Mevcut raunt",
      round: (n) => `Raunt ${n}`,
      winner: "Kazanan",
      red: "Kırmızı",
      blue: "Mavi",
      method: "Bitiş yöntemi",
      endRound: "Bitiş raundu",
      endTime: "Bitiş süresi",
      notes: "Not",
    },
    registrationReview: {
      notePlaceholder: "Sporcuya not (opsiyonel) — eşleşme, tartı saati…",
      accept: "Kabul",
      waitlist: "Yedek",
      reject: "Ret",
    },
  },
};
