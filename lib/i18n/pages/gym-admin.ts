import type { Locale } from "@/lib/i18n/config";

/**
 * §4.2 / §4.6 — Salon yönetimi alanının metinleri.
 *
 * Kapsam: `/salon-yonetimi` listesi, `/salon-yonetimi/yeni`,
 * `/salon-yonetimi/[id]` düzenleme ekranı, `/salon-yonetimi/[id]/sozlesmeler`
 * ve bunların kullandığı istemci formları (`components/gym-forms.tsx`,
 * `components/gym-review-form.tsx`).
 *
 * Olanak (amenity) DEĞERLERİ veritabanında Türkçe saklandığı için sabit kalır;
 * yalnızca ekranda gösterilen etiketleri çevrilir (`amenityLabels`).
 */
type Copy = {
  index: {
    meta: { title: string };
    title: string;
    subtitle: string;
    addGym: string;
    roleAlert: { title: string; body: string; cta: string };
    empty: { title: string; description: string; action: string };
    stats: { gyms: string; members: string; pending: string; classes: string };
    myGyms: string;
    gymStatus: { active: string; pending: string; suspended: string };
    founder: string;
    memberCount: string;
    classCount: string;
    bookingCount: string;
    bookings: {
      title: string;
      subtitle: (count: number) => string;
      empty: string;
      experience: string;
      goals: string;
      confirm: string;
      attended: string;
      noShow: string;
      cancel: string;
    };
  };
  create: {
    meta: { title: string };
    title: string;
    subtitle: string;
    notice: string;
  };
  edit: {
    meta: { title: string };
    gymStatus: { active: string; pending: string; suspended: string };
    contracts: string;
    viewPage: string;
    gymInfo: string;
    schedule: {
      title: string;
      subtitle: (count: number) => string;
      emptyTitle: string;
      emptyDescription: string;
      capacity: (count: number) => string;
      trialOk: string;
      deleteClass: string;
    };
  };
  contracts: {
    meta: { title: string };
    title: string;
    subtitle: (gymName: string) => string;
    pilotAlert: { title: string; body: string };
    automationAlert: { title: string; body: (maxTermMonths: number) => string };
    stats: {
      active: string;
      pending: string;
      monthly: string;
      monthlyHint: string;
      total: string;
    };
    newContract: { title: string; subtitle: string };
    list: {
      title: string;
      subtitle: (count: number) => string;
      emptyTitle: string;
      emptyDescription: string;
    };
    contractStatus: {
      DRAFT: string;
      SENT: string;
      SIGNED: string;
      ACTIVE: string;
      TERMINATED: string;
      CANCELLED: string;
    };
    mandateStatus: {
      PENDING: string;
      ACTIVE: string;
      REVOKED: string;
      FAILED: string;
    };
    invoiceStatus: {
      DRAFT: string;
      ISSUED: string;
      PAID: string;
      OVERDUE: string;
      CANCELLED: string;
      REFUNDED: string;
    };
    perMonth: string;
    minTerm: (months: number) => string;
    noticeDays: (days: number) => string;
    startsAt: (date: string) => string;
    endsAt: (date: string) => string;
    mandateRef: string;
    sequence: string;
    signedAt: string;
    dueAt: (date: string) => string;
    terminate: string;
    sepa: {
      title: string;
      subtitle: string;
      noIbanTitle: string;
      noIbanBody: string;
      note: string;
    };
  };
  gymForm: {
    submitCreate: string;
    submitUpdate: string;
    logo: string;
    cover: string;
    name: string;
    description: string;
    descriptionPlaceholder: string;
    disciplines: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    countryOptions: { DE: string; AT: string; CH: string };
    lat: string;
    latHint: string;
    lng: string;
    phone: string;
    email: string;
    website: string;
    amenities: string;
    amenityLabels: Record<string, string>;
    trialEnabled: string;
    dropInPrice: string;
  };
  classForm: {
    submit: string;
    name: string;
    namePlaceholder: string;
    discipline: string;
    select: string;
    level: string;
    weekday: string;
    startTime: string;
    endTime: string;
    capacity: string;
    coachName: string;
    price: string;
    trial: string;
    trialLabel: string;
    description: string;
  };
  reviewForm: {
    guestBody: string;
    login: string;
    submitCreate: string;
    submitUpdate: string;
    rating: string;
    ratingGroup: string;
    star: (n: number) => string;
    experience: string;
    experienceHint: string;
    guidelines: string;
    guidelinesSuffix: string;
  };
};

export const gymAdminCopy: Record<Locale, Copy> = {
  de: {
    index: {
      meta: { title: "Gym-Verwaltung" },
      title: "Gym-Verwaltung",
      subtitle: "Deine Gyms, dein Kursplan und die Buchungsanfragen",
      addGym: "Gym hinzufügen",
      roleAlert: {
        title: "Rolle Gym-Betreiber erforderlich",
        body:
          "Um ein Gym anzulegen, musst du mit der Verifizierung Stufe 2 in die Rolle Gym-Betreiber wechseln.",
        cta: "Verifizierung starten",
      },
      empty: {
        title: "Du hast noch kein Gym",
        description:
          "Trag dein Gym bei FIGHTNET ein — damit Mitglieder dich finden und ein Probetraining buchen.",
        action: "Mein Gym eintragen",
      },
      stats: {
        gyms: "Gyms",
        members: "Mitglieder gesamt",
        pending: "Offene Anfragen",
        classes: "Kurse gesamt",
      },
      myGyms: "Meine Gyms",
      gymStatus: {
        active: "Veröffentlicht",
        pending: "Wartet auf Freigabe",
        suspended: "Gesperrt",
      },
      founder: "Gründer",
      memberCount: "Mitglieder",
      classCount: "Kurse",
      bookingCount: "Buchungen",
      bookings: {
        title: "Buchungsanfragen",
        subtitle: (count) => `${count} warten auf Bestätigung`,
        empty: "Keine Anfragen",
        experience: "Erfahrung:",
        goals: "Ziel:",
        confirm: "Bestätigen",
        attended: "Teilgenommen",
        noShow: "Nicht erschienen",
        cancel: "Stornieren",
      },
    },
    create: {
      meta: { title: "Gym hinzufügen" },
      title: "Gym hinzufügen",
      subtitle: "Registriere dein Gym bei FIGHTNET — nach der Freigabe geht es online",
      notice:
        "Dein Gym geht nach der Freigabe durch das Admin-Team online. Die Prüfung dauert in der Regel 24–48 Stunden.",
    },
    edit: {
      meta: { title: "Gym bearbeiten" },
      gymStatus: {
        active: "Veröffentlicht",
        pending: "Wartet auf Freigabe",
        suspended: "Gesperrt",
      },
      contracts: "Verträge",
      viewPage: "Seite ansehen",
      gymInfo: "Gym-Daten",
      schedule: {
        title: "Kursplan",
        subtitle: (count) => `${count} Kurse`,
        emptyTitle: "Keine Kurse",
        emptyDescription:
          "Trag deinen Wochenplan ein — damit Mitglieder wissen, wann sie kommen können.",
        capacity: (count) => `${count} Plätze`,
        trialOk: "Probetraining OK",
        deleteClass: "Kurs löschen",
      },
    },
    contracts: {
      meta: { title: "Verträge" },
      title: "Verträge",
      subtitle: (gymName) => `${gymName} · digitaler Mitgliedsvertrag, SEPA-Mandat und Rechnung`,
      pilotAlert: {
        title: "Regionaler Pilot — das Modul ist für dieses Gym noch nicht freigeschaltet",
        body:
          "Die Vertragsverwaltung wird gemäß §4.6 schrittweise freigeschaltet: zuerst in Hessen / Rhein-Main und nur für neue Gyms, die noch keine Mitgliederverwaltungssoftware einsetzen. Wenn du dein bestehendes System migrieren möchtest, melde dich beim Support — wir setzen dich auf die Liste. Auf diesem Bildschirm kannst du bestehende Verträge einsehen, das Anlegen neuer Verträge ist jedoch deaktiviert.",
      },
      automationAlert: {
        title: "Was läuft automatisch?",
        body: (maxTermMonths) =>
          `Der Vertragstext wird nach BGB §309 Nr. 9 (Mindestlaufzeit höchstens ${maxTermMonths} Monate), dem Fernabsatz-Widerrufsrecht (14 Tage) und den SEPA-Core-Regeln (5 Bankarbeitstage Vorabankündigung, 8 Wochen Erstattungsrecht) erzeugt. Sobald das Mitglied unterschreibt, entstehen das eIDAS-FES-Siegel und das SEPA-Mandat gemeinsam. Die Klartext-IBAN des Mitglieds wird zu keinem Zeitpunkt gespeichert.`,
      },
      stats: {
        active: "Laufend",
        pending: "Wartet auf Unterschrift",
        monthly: "Monatsbeitrag",
        monthlyHint: "inkl. MwSt.",
        total: "Verträge gesamt",
      },
      newContract: {
        title: "Neuer Vertrag",
        subtitle:
          "Erstelle mit der E-Mail-Adresse des Mitglieds einen Entwurf — unterschrieben wird vom Mitglied selbst",
      },
      list: {
        title: "Vertragsliste",
        subtitle: (count) => `${count} Einträge`,
        emptyTitle: "Noch keine Verträge",
        emptyDescription:
          "Gib die E-Mail-Adresse des Mitglieds ein, dann landet der Vertragsentwurf im Dashboard des Mitglieds.",
      },
      contractStatus: {
        DRAFT: "Wartet auf Unterschrift",
        SENT: "An Mitglied gesendet",
        SIGNED: "Unterschrieben",
        ACTIVE: "Laufend",
        TERMINATED: "Gekündigt",
        CANCELLED: "Storniert",
      },
      mandateStatus: {
        PENDING: "Mandat ausstehend",
        ACTIVE: "Mandat aktiv",
        REVOKED: "Mandat widerrufen",
        FAILED: "Einzug fehlgeschlagen",
      },
      invoiceStatus: {
        DRAFT: "Entwurf",
        ISSUED: "Ausgestellt",
        PAID: "Bezahlt",
        OVERDUE: "Überfällig",
        CANCELLED: "Storno",
        REFUNDED: "Erstattet",
      },
      perMonth: "/Monat",
      minTerm: (months) => `${months} Monate Mindestlaufzeit`,
      noticeDays: (days) => `${days} Tage Kündigungsfrist`,
      startsAt: (date) => `Beginn ${date}`,
      endsAt: (date) => `Ende ${date}`,
      mandateRef: "Mandat:",
      sequence: "Sequenz:",
      signedAt: "Unterschrift:",
      dueAt: (date) => `fällig ${date}`,
      terminate: "Kündigen",
      sepa: {
        title: "SEPA-Sammeleinzug",
        subtitle: "pain.008.001.02-Datei für Gyms, die über ihr eigenes Bankkonto einziehen",
        noIbanTitle: "Kein Einzugskonto hinterlegt",
        noIbanBody:
          "Um eine Sammeleinzugsdatei zu erzeugen, muss die Gläubiger-IBAN des Gyms (billingIban) hinterlegt sein. Gyms, die den Stripe-SEPA-Lastschriftfluss nutzen, brauchen diese Datei nicht — der Einzug läuft über den Zahlungsdienstleister.",
        note:
          "Die Datei umfasst ausschließlich laufende Verträge mit aktivem Mandat. Für den Ersteinzug (FRST) wird das Fälligkeitsdatum auf 5 Bankarbeitstage, für Folgeeinzüge (RCUR) auf 2 Bankarbeitstage später berechnet.",
      },
    },
    gymForm: {
      submitCreate: "Gym erstellen",
      submitUpdate: "Gym aktualisieren",
      logo: "Logo",
      cover: "Titelbild",
      name: "Name des Gyms",
      description: "Beschreibung",
      descriptionPlaceholder: "Die Geschichte des Gyms, die Philosophie, für wen es passt …",
      disciplines: "Disziplinen",
      street: "Straße / Nr.",
      city: "Stadt",
      postalCode: "PLZ",
      country: "Land",
      countryOptions: { DE: "Deutschland", AT: "Österreich", CH: "Schweiz" },
      lat: "Breitengrad (lat)",
      latHint: "Damit das Gym auf der Karte erscheint",
      lng: "Längengrad (lng)",
      phone: "Telefon",
      email: "E-Mail",
      website: "Webseite",
      amenities: "Ausstattung",
      amenityLabels: {
        "Duş": "Dusche",
        "Soyunma odası": "Umkleide",
        "Otopark": "Parkplatz",
        "Kadınlara özel saat": "Frauenzeiten",
        "Çocuk grubu": "Kindergruppe",
        "Sauna": "Sauna",
        "Ağırlık salonu": "Kraftraum",
        "Kafe": "Café",
        "Engelli erişimi": "Barrierefreier Zugang",
        "Klima": "Klimaanlage",
      },
      trialEnabled: "Kostenloses Probetraining anbieten",
      dropInPrice: "Drop-in-Preis (€)",
    },
    classForm: {
      submit: "Kurs hinzufügen",
      name: "Kursname",
      namePlaceholder: "MMA Anfänger",
      discipline: "Disziplin",
      select: "Auswählen",
      level: "Niveau",
      weekday: "Tag",
      startTime: "Beginn",
      endTime: "Ende",
      capacity: "Kapazität",
      coachName: "Trainer",
      price: "Preis (€)",
      trial: "Probetraining",
      trialLabel: "Für Probetraining geeignet",
      description: "Beschreibung",
    },
    reviewForm: {
      guestBody:
        "Wenn du in diesem Gym trainiert hast, kannst du deine Erfahrung teilen. Zum Schreiben einer Bewertung bitte anmelden.",
      login: "Anmelden",
      submitCreate: "Bewertung absenden",
      submitUpdate: "Meine Bewertung aktualisieren",
      rating: "Deine Bewertung",
      ratingGroup: "Bewertung",
      star: (n) => `${n} Sterne`,
      experience: "Deine Erfahrung",
      experienceHint:
        "Trainingsqualität, Atmosphäre, Sauberkeit, Umgang mit Neulingen. Kommentare mit persönlichen Angriffen werden entfernt.",
      guidelines: "Community-Richtlinien",
      guidelinesSuffix: " gelten auch für Bewertungen.",
    },
  },

  en: {
    index: {
      meta: { title: "Gym admin" },
      title: "Gym admin",
      subtitle: "Your gyms, your class schedule and booking requests",
      addGym: "Add gym",
      roleAlert: {
        title: "Gym owner role required",
        body:
          "To add a gym you need to switch to the Gym owner role with Level 2 verification.",
        cta: "Start verification",
      },
      empty: {
        title: "You have no gyms yet",
        description:
          "Add your gym to FIGHTNET — so members can find you and book a trial session.",
        action: "Add my gym",
      },
      stats: {
        gyms: "Gyms",
        members: "Total members",
        pending: "Pending requests",
        classes: "Total classes",
      },
      myGyms: "My gyms",
      gymStatus: {
        active: "Published",
        pending: "Awaiting approval",
        suspended: "Suspended",
      },
      founder: "Founder",
      memberCount: "members",
      classCount: "classes",
      bookingCount: "bookings",
      bookings: {
        title: "Booking requests",
        subtitle: (count) => `${count} awaiting confirmation`,
        empty: "No requests",
        experience: "Experience:",
        goals: "Goal:",
        confirm: "Confirm",
        attended: "Attended",
        noShow: "No-show",
        cancel: "Cancel",
      },
    },
    create: {
      meta: { title: "Add gym" },
      title: "Add gym",
      subtitle: "Register your gym with FIGHTNET — it goes live once approved",
      notice:
        "Your gym goes live after admin approval. Review usually takes 24-48 hours.",
    },
    edit: {
      meta: { title: "Edit gym" },
      gymStatus: {
        active: "Published",
        pending: "Awaiting approval",
        suspended: "Suspended",
      },
      contracts: "Contracts",
      viewPage: "View page",
      gymInfo: "Gym details",
      schedule: {
        title: "Class schedule",
        subtitle: (count) => `${count} classes`,
        emptyTitle: "No classes",
        emptyDescription:
          "Add your weekly schedule — so members know when to show up.",
        capacity: (count) => `${count} spots`,
        trialOk: "Trial OK",
        deleteClass: "Delete class",
      },
    },
    contracts: {
      meta: { title: "Contracts" },
      title: "Contracts",
      subtitle: (gymName) => `${gymName} · digital membership contract, SEPA mandate and invoicing`,
      pilotAlert: {
        title: "Regional pilot — the module is not enabled for this gym yet",
        body:
          "Contract management is being rolled out gradually under §4.6: first in Hessen / Rhein-Main, and only for new gyms that are not already using membership software. If you want to migrate your existing system, get in touch with support — we will add you to the queue. You can view existing contracts on this screen, but creating new contracts is disabled.",
      },
      automationAlert: {
        title: "What happens automatically?",
        body: (maxTermMonths) =>
          `The contract text is generated in line with BGB §309 No. 9 (minimum term of at most ${maxTermMonths} months), the distance-selling right of withdrawal (14 days) and the SEPA Core rules (5 business days of pre-notification, 8 weeks of refund rights). When the member signs, the eIDAS FES seal and the SEPA mandate are created together. The member's plain IBAN is never stored.`,
      },
      stats: {
        active: "Active",
        pending: "Awaiting signature",
        monthly: "Monthly fees",
        monthlyHint: "incl. VAT",
        total: "Total contracts",
      },
      newContract: {
        title: "New contract",
        subtitle:
          "Create a draft with the member's email address — the member signs it themselves",
      },
      list: {
        title: "Contract list",
        subtitle: (count) => `${count} records`,
        emptyTitle: "No contracts yet",
        emptyDescription:
          "Enter the member's email address and the contract draft lands in their dashboard.",
      },
      contractStatus: {
        DRAFT: "Awaiting signature",
        SENT: "Sent to member",
        SIGNED: "Signed",
        ACTIVE: "Active",
        TERMINATED: "Terminated",
        CANCELLED: "Cancelled",
      },
      mandateStatus: {
        PENDING: "Mandate pending",
        ACTIVE: "Mandate active",
        REVOKED: "Mandate revoked",
        FAILED: "Collection failed",
      },
      invoiceStatus: {
        DRAFT: "Draft",
        ISSUED: "Issued",
        PAID: "Paid",
        OVERDUE: "Overdue",
        CANCELLED: "Cancelled",
        REFUNDED: "Refunded",
      },
      perMonth: "/month",
      minTerm: (months) => `${months}-month minimum term`,
      noticeDays: (days) => `${days} days' notice`,
      startsAt: (date) => `starts ${date}`,
      endsAt: (date) => `ends ${date}`,
      mandateRef: "Mandate:",
      sequence: "Sequence:",
      signedAt: "Signed:",
      dueAt: (date) => `due ${date}`,
      terminate: "Terminate",
      sepa: {
        title: "SEPA batch collection",
        subtitle: "pain.008.001.02 file for gyms collecting from their own bank account",
        noIbanTitle: "No collection account configured",
        noIbanBody:
          "To generate a batch collection file, the gym's creditor IBAN (billingIban) has to be configured. Gyms using the Stripe SEPA Direct Debit flow do not need this file — collection runs through the payment provider.",
        note:
          "The file only covers active contracts that have an active mandate. The collection date is calculated 5 business days ahead for the first collection (FRST) and 2 business days ahead for recurring ones (RCUR).",
      },
    },
    gymForm: {
      submitCreate: "Create gym",
      submitUpdate: "Update gym",
      logo: "Logo",
      cover: "Cover image",
      name: "Gym name",
      description: "Description",
      descriptionPlaceholder: "The gym's story, its philosophy, who it suits…",
      disciplines: "Disciplines",
      street: "Street / no.",
      city: "City",
      postalCode: "Postcode",
      country: "Country",
      countryOptions: { DE: "Germany", AT: "Austria", CH: "Switzerland" },
      lat: "Latitude (lat)",
      latHint: "So the gym shows up on the map",
      lng: "Longitude (lng)",
      phone: "Phone",
      email: "Email",
      website: "Website",
      amenities: "Facilities",
      amenityLabels: {
        "Duş": "Showers",
        "Soyunma odası": "Changing room",
        "Otopark": "Parking",
        "Kadınlara özel saat": "Women-only hours",
        "Çocuk grubu": "Kids group",
        "Sauna": "Sauna",
        "Ağırlık salonu": "Weight room",
        "Kafe": "Café",
        "Engelli erişimi": "Step-free access",
        "Klima": "Air conditioning",
      },
      trialEnabled: "Offer a free trial session",
      dropInPrice: "Drop-in price (€)",
    },
    classForm: {
      submit: "Add class",
      name: "Class name",
      namePlaceholder: "MMA Beginners",
      discipline: "Discipline",
      select: "Select",
      level: "Level",
      weekday: "Day",
      startTime: "Start",
      endTime: "End",
      capacity: "Capacity",
      coachName: "Coach",
      price: "Price (€)",
      trial: "Trial",
      trialLabel: "Suitable for a trial session",
      description: "Description",
    },
    reviewForm: {
      guestBody:
        "If you have trained at this gym, you can share your experience. Log in to write a review.",
      login: "Log in",
      submitCreate: "Submit review",
      submitUpdate: "Update my review",
      rating: "Your rating",
      ratingGroup: "Rating",
      star: (n) => `${n} stars`,
      experience: "Your experience",
      experienceHint:
        "Training quality, atmosphere, cleanliness, how newcomers are treated. Comments containing personal attacks are removed.",
      guidelines: "Community guidelines",
      guidelinesSuffix: " apply to reviews as well.",
    },
  },

  tr: {
    index: {
      meta: { title: "Salon Yönetimi" },
      title: "Salon Yönetimi",
      subtitle: "Salonların, ders programın ve rezervasyon talepleri",
      addGym: "Salon Ekle",
      roleAlert: {
        title: "Salon İşletmecisi rolü gerekli",
        body:
          "Salon eklemek için Seviye 2 doğrulaması ile Salon İşletmecisi rolüne geçmelisin.",
        cta: "Doğrulamayı başlat",
      },
      empty: {
        title: "Henüz salonun yok",
        description:
          "Salonunu FIGHTNET'e ekle — üyelerin seni bulsun, deneme antrenmanı alsın.",
        action: "Salonumu Ekle",
      },
      stats: {
        gyms: "Salon",
        members: "Toplam üye",
        pending: "Bekleyen talep",
        classes: "Toplam ders",
      },
      myGyms: "Salonlarım",
      gymStatus: {
        active: "Yayında",
        pending: "Onay bekliyor",
        suspended: "Askıda",
      },
      founder: "Kurucu",
      memberCount: "üye",
      classCount: "ders",
      bookingCount: "rezervasyon",
      bookings: {
        title: "Rezervasyon Talepleri",
        subtitle: (count) => `${count} onay bekliyor`,
        empty: "Talep yok",
        experience: "Deneyim:",
        goals: "Hedef:",
        confirm: "Onayla",
        attended: "Katıldı",
        noShow: "Gelmedi",
        cancel: "İptal Et",
      },
    },
    create: {
      meta: { title: "Salon Ekle" },
      title: "Salon Ekle",
      subtitle: "Salonunu FIGHTNET'e kaydet — onay sonrası yayına alınır",
      notice: "Salonun admin onayından sonra yayına alınır. Onay genelde 24-48 saat sürer.",
    },
    edit: {
      meta: { title: "Salon Düzenle" },
      gymStatus: {
        active: "Yayında",
        pending: "Onay bekliyor",
        suspended: "Askıda",
      },
      contracts: "Sözleşmeler",
      viewPage: "Sayfayı gör",
      gymInfo: "Salon Bilgileri",
      schedule: {
        title: "Ders Programı",
        subtitle: (count) => `${count} ders`,
        emptyTitle: "Ders yok",
        emptyDescription: "Haftalık programını ekle — üyeler ne zaman geleceğini bilsin.",
        capacity: (count) => `${count} kişi`,
        trialOk: "Deneme OK",
        deleteClass: "Dersi sil",
      },
    },
    contracts: {
      meta: { title: "Sözleşmeler" },
      title: "Sözleşmeler",
      subtitle: (gymName) => `${gymName} · dijital üyelik sözleşmesi, SEPA mandatı ve fatura`,
      pilotAlert: {
        title: "Bölgesel pilot — modül bu salonda henüz açık değil",
        body:
          "Sözleşme yönetimi §4.6 uyarınca kademeli açılıyor: önce Hessen / Rhein-Main bölgesinde, yalnızca hâlihazırda bir üyelik yazılımı kullanmayan yeni salonlarda. Mevcut sistemini taşımak istiyorsan destek ekibiyle iletişime geç — sıraya alalım. Bu ekranda mevcut sözleşmeleri görüntüleyebilirsin, ancak yeni sözleşme oluşturma kapalı.",
      },
      automationAlert: {
        title: "Neler otomatik yapılıyor?",
        body: (maxTermMonths) =>
          `Sözleşme metni BGB §309 Nr. 9 (asgari süre en fazla ${maxTermMonths} ay), Fernabsatz cayma hakkı (14 gün) ve SEPA Core kuralları (5 iş günü ön bildirim, 8 hafta itiraz hakkı) ile üretilir. Üye imzaladığında eIDAS FES mührü ve SEPA mandatı birlikte oluşur. Üyenin açık IBAN'ı hiçbir zaman saklanmaz.`,
      },
      stats: {
        active: "Yürürlükte",
        pending: "İmza bekleyen",
        monthly: "Aylık aidat",
        monthlyHint: "KDV dahil",
        total: "Toplam sözleşme",
      },
      newContract: {
        title: "Yeni Sözleşme",
        subtitle: "Üye e-postasıyla taslak oluştur, imzayı üye kendisi atar",
      },
      list: {
        title: "Sözleşme Listesi",
        subtitle: (count) => `${count} kayıt`,
        emptyTitle: "Henüz sözleşme yok",
        emptyDescription: "Üyenin e-postasını gir, sözleşme taslağı üyenin paneline düşsün.",
      },
      contractStatus: {
        DRAFT: "İmza bekliyor",
        SENT: "Üyeye iletildi",
        SIGNED: "İmzalandı",
        ACTIVE: "Yürürlükte",
        TERMINATED: "Feshedildi",
        CANCELLED: "İptal",
      },
      mandateStatus: {
        PENDING: "Mandat bekliyor",
        ACTIVE: "Mandat aktif",
        REVOKED: "Mandat geri alındı",
        FAILED: "Tahsilat başarısız",
      },
      invoiceStatus: {
        DRAFT: "Taslak",
        ISSUED: "Kesildi",
        PAID: "Ödendi",
        OVERDUE: "Gecikti",
        CANCELLED: "Storno",
        REFUNDED: "İade",
      },
      perMonth: "/ay",
      minTerm: (months) => `${months} ay asgari süre`,
      noticeDays: (days) => `${days} gün ihbar`,
      startsAt: (date) => `başlangıç ${date}`,
      endsAt: (date) => `bitiş ${date}`,
      mandateRef: "Mandat:",
      sequence: "Dizi:",
      signedAt: "İmza:",
      dueAt: (date) => `vade ${date}`,
      terminate: "Feshet",
      sepa: {
        title: "SEPA Toplu Tahsilat",
        subtitle: "Kendi banka hesabından tahsilat yapan salonlar için pain.008.001.02 dosyası",
        noIbanTitle: "Tahsilat hesabı tanımlı değil",
        noIbanBody:
          "Toplu tahsilat dosyası üretebilmek için salonun alacaklı IBAN'ı (billingIban) tanımlanmalı. Stripe SEPA Direct Debit akışını kullanan salonlar bu dosyaya ihtiyaç duymaz — tahsilat ödeme kuruluşu üzerinden yürür.",
        note:
          "Dosya yalnızca aktif mandatı olan yürürlükteki sözleşmeleri kapsar. İlk tahsilat (FRST) için tahsilat tarihi 5 iş günü, tekrar edenler (RCUR) için 2 iş günü sonrası olarak hesaplanır.",
      },
    },
    gymForm: {
      submitCreate: "Salonu Oluştur",
      submitUpdate: "Salonu Güncelle",
      logo: "Logo",
      cover: "Kapak görseli",
      name: "Salon adı",
      description: "Açıklama",
      descriptionPlaceholder: "Salonun hikayesi, felsefesi, kimler için uygun…",
      disciplines: "Disiplinler",
      street: "Sokak / No",
      city: "Şehir",
      postalCode: "Posta kodu",
      country: "Ülke",
      countryOptions: { DE: "Almanya", AT: "Avusturya", CH: "İsviçre" },
      lat: "Enlem (lat)",
      latHint: "Haritada görünmesi için",
      lng: "Boylam (lng)",
      phone: "Telefon",
      email: "E-posta",
      website: "Web sitesi",
      amenities: "Olanaklar",
      amenityLabels: {
        "Duş": "Duş",
        "Soyunma odası": "Soyunma odası",
        "Otopark": "Otopark",
        "Kadınlara özel saat": "Kadınlara özel saat",
        "Çocuk grubu": "Çocuk grubu",
        "Sauna": "Sauna",
        "Ağırlık salonu": "Ağırlık salonu",
        "Kafe": "Kafe",
        "Engelli erişimi": "Engelli erişimi",
        "Klima": "Klima",
      },
      trialEnabled: "Ücretsiz deneme antrenmanı sun",
      dropInPrice: "Drop-in fiyatı (€)",
    },
    classForm: {
      submit: "Dersi Ekle",
      name: "Ders adı",
      namePlaceholder: "MMA Başlangıç",
      discipline: "Disiplin",
      select: "Seç",
      level: "Seviye",
      weekday: "Gün",
      startTime: "Başlangıç",
      endTime: "Bitiş",
      capacity: "Kapasite",
      coachName: "Antrenör",
      price: "Fiyat (€)",
      trial: "Deneme",
      trialLabel: "Deneme antrenmanına uygun",
      description: "Açıklama",
    },
    reviewForm: {
      guestBody:
        "Bu salonda antrenman yaptıysan deneyimini paylaşabilirsin. Değerlendirme yazmak için giriş yap.",
      login: "Giriş yap",
      submitCreate: "Değerlendirmeyi Gönder",
      submitUpdate: "Değerlendirmemi Güncelle",
      rating: "Puanın",
      ratingGroup: "Puan",
      star: (n) => `${n} yıldız`,
      experience: "Deneyimin",
      experienceHint:
        "Antrenman kalitesi, atmosfer, temizlik, yeni gelenlere yaklaşım. Kişisel saldırı içeren yorumlar kaldırılır.",
      guidelines: "Topluluk kuralları",
      guidelinesSuffix: " değerlendirmeler için de geçerlidir.",
    },
  },
};
