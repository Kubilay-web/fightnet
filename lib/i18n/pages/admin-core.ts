import type { Locale } from "@/lib/i18n/config";

/**
 * Admin çekirdek sayfalarının metinleri:
 * `/admin`, `/admin/kpi`, `/admin/dogrulama`, `/admin/raporlar`,
 * `/admin/itirazlar`, `/admin/kullanicilar`, `/admin/salonlar`.
 *
 * Sayı içeren metinler fonksiyon olarak tutulur: dile göre ekin yeri değişir
 * ("%20" ↔ "20 %"), bu yüzden şablonu çeviri tarafı belirlemelidir.
 *
 * Not: disiplin/rol/doğrulama/rapor sebebi etiketleri hâlâ `lib/constants.ts`
 * içindeki Türkçe tablolardan gelir — sayfalarda TODO(i18n) ile işaretlendi.
 */
type Copy = {
  /** Yüzde biçimi: tr "%20", de "20 %", en "20%" */
  percent: (n: number) => string;

  home: {
    meta: { title: string };
    title: string;
    subtitle: string;
    queueTitle: (n: number) => string;
    pendingVerifications: (n: number) => string;
    openReportsLink: (n: number) => string;
    pendingPassport: (n: number) => string;
    northStar: string;
    mavuLabel: string;
    dau: string;
    dauTotal: string;
    mrr: string;
    payingGyms: string;
    totalUsers: string;
    last30: (n: number) => string;
    verified: string;
    activeGyms: string;
    payingHint: (n: number) => string;
    waitlist: string;
    liveEvents: string;
    upcomingEvents: string;
    trainingLogs: string;
    openReports: string;
    gates: {
      title: string;
      subtitle: string;
      month: string;
      green: string;
      yellow: string;
      red: string;
      monthCell: (n: number) => string;
    };
    priorityReports: string;
    seeAll: string;
    noReports: { title: string; description: string };
    urgent: string;
    newSignups: string;
    noUsers: string;
  };

  kpi: {
    meta: { title: string };
    title: string;
    programMonth: (n: number) => string;
    startedAt: (date: string) => string;
    noStartDate: string;
    lights: { GREEN: string; YELLOW: string; RED: string; PENDING: string };
    northStar: string;
    mavuLabel: string;
    measurements: (n: number) => string;
    payingGyms: string;
    payingGymsHint: string;
    waitlist: string;
    waitlistHint: string;
    loi: string;
    loiHint: string;
    profileCompletion: string;
    profileCompletionHint: string;
    vouches: string;
    vouchesHint: string;
    dauMau: string;
    dauMauHint: string;
    mrr: string;
    mrrHint: string;
    reports30: string;
    moderationThreshold: (level: string) => string;
    gates: { title: string; subtitle: string; monthPrefix: (n: number) => string };
    trend: { title: string; subtitle: string };
    empty: { title: string; description: string };
    chartLabel: string;
    snapshotTitle: (date: string, mavu: number) => string;
    table: {
      date: string;
      mavu: string;
      dau: string;
      paying: string;
      waitlist: string;
      mrr: string;
    };
  };

  verification: {
    meta: { title: string };
    title: string;
    subtitle: (n: number) => string;
    empty: { title: string; description: string };
    minor: string;
    years: (n: number) => string;
    disciplines: (n: number) => string;
    trainings: (n: number) => string;
    memberSince: (date: string) => string;
    userNote: string;
    idDoc: string;
    selfie: string;
    proof: (i: number) => string;
  };

  reports: {
    meta: { title: string };
    title: string;
    subtitle: string;
    priorityNotice: string;
    statusLabel: string;
    statusOptions: { open: string; inReview: string; resolved: string; dismissed: string };
    reasonLabel: string;
    pendingTitle: string;
    pendingSubtitle: string;
    risk: (percent: string) => string;
    openContent: string;
    publish: string;
    remove: string;
    listTitle: string;
    empty: { title: string; description: string };
    urgent: string;
    reporter: (name: string) => string;
    targetPrefix: string;
    bannedSuffix: string;
    idPrefix: string;
    removeContent: string;
    banUser: string;
    dismiss: string;
    resolution: string;
  };

  appeals: {
    meta: { title: string };
    title: string;
    subtitle: string;
    noticeBefore: string;
    noticeLink: string;
    noticeAfter: string;
    pending: (n: number) => string;
    empty: { title: string; description: string };
    status: { OPEN: string; UPHELD: string; OVERTURNED: string; DISMISSED: string };
    subject: string;
    decision: string;
  };

  users: {
    meta: { title: string };
    title: string;
    subtitle: (n: number) => string;
    roleLabel: string;
    verificationLabel: string;
    level0: string;
    level1: string;
    level2: string;
    stateLabel: string;
    stateBanned: string;
    stateFounder: string;
    stateMinor: string;
    searchPlaceholder: string;
    empty: string;
    founderBadge: string;
    minorBadge: string;
    bannedBadge: string;
    inactiveBadge: string;
    registered: (date: string) => string;
    lastActive: (ago: string) => string;
    followers: (n: number) => string;
    trainings: (n: number) => string;
    openProfile: string;
  };

  gyms: {
    meta: { title: string };
    title: string;
    subtitle: (n: number) => string;
    statusLabel: string;
    statusPending: string;
    statusActive: string;
    statusSuspended: string;
    flagLabel: string;
    flagHalo: string;
    flagFounder: string;
    flagUnverified: string;
    searchPlaceholder: string;
    empty: string;
    verifiedBadge: string;
    haloBadge: string;
    founderBadge: string;
    ownerless: string;
    members: (n: number) => string;
    classes: (n: number) => string;
    bookings: (n: number) => string;
    plan: (name: string) => string;
    perMonth: (money: string) => string;
    approve: string;
    suspend: string;
    haloRemove: string;
    haloAdd: string;
    founderRemove: string;
    founderAdd: string;
  };
};

export const adminCoreCopy: Record<Locale, Copy> = {
  de: {
    percent: (n) => `${n} %`,

    home: {
      meta: { title: "Admin" },
      title: "Übersicht",
      subtitle: "Plattform-Gesundheit und KPI-Tracking",
      queueTitle: (n) => `${n} Vorgänge warten`,
      pendingVerifications: (n) => `${n} Verifizierungsanträge`,
      openReportsLink: (n) => `${n} offene Meldungen`,
      pendingPassport: (n) => `${n} Passport-Dokumente`,
      northStar: "North Star Metric",
      mavuLabel: "MAVN — Monatlich aktive verifizierte Nutzer",
      dau: "DAU",
      dauTotal: "DAU/Gesamt",
      mrr: "MRR",
      payingGyms: "Zahlende Gyms",
      totalUsers: "Nutzer gesamt",
      last30: (n) => `+${n} in den letzten 30 Tagen`,
      verified: "Verifiziert",
      activeGyms: "Aktive Gyms",
      payingHint: (n) => `${n} zahlend`,
      waitlist: "Warteliste",
      liveEvents: "Live-Events",
      upcomingEvents: "Kommende Events",
      trainingLogs: "Trainingseinträge",
      openReports: "Offene Meldungen",
      gates: {
        title: "Stop-/Go-Gates",
        subtitle: "Meilensteine des Beta-Programms",
        month: "Monat",
        green: "🟢 Grün",
        yellow: "🟡 Gelb",
        red: "🔴 Rot",
        monthCell: (n) => `Monat ${n}`,
      },
      priorityReports: "Priorisierte Meldungen",
      seeAll: "Alle →",
      noReports: { title: "Keine offenen Meldungen", description: "Die Moderations-Warteschlange ist leer." },
      urgent: "Dringend",
      newSignups: "Neue Registrierungen",
      noUsers: "Noch keine Nutzer",
    },

    kpi: {
      meta: { title: "KPI-Tracking" },
      title: "KPI-Tracking",
      programMonth: (n) => `Programmmonat ${n}`,
      startedAt: (date) => `Start ${date}`,
      noStartDate: "Startdatum nicht gesetzt",
      lights: { GREEN: "Grün", YELLOW: "Gelb", RED: "Rot", PENDING: "Ausstehend" },
      northStar: "North Star Metric",
      mavuLabel: "MAVN — Monatlich aktive verifizierte Nutzer",
      measurements: (n) => `letzte ${n} Messungen`,
      payingGyms: "Zahlende Gyms",
      payingGymsHint: "wöchentliche Nachverfolgung",
      waitlist: "Warteliste",
      waitlistHint: "Interesse vor dem Launch",
      loi: "LOI",
      loiHint: "Absichtserklärungen",
      profileCompletion: "Profilvollständigkeit",
      profileCompletionHint: "Ziel ≥ 60 % (H2)",
      vouches: "Trainer-Bürgschaften",
      vouchesHint: "Skalierungsmechanismus (H3)",
      dauMau: "DAU/MAU",
      dauMauHint: "Bindung, Ziel ≥ 20 % (H5)",
      mrr: "MRR",
      mrrHint: "monatlich wiederkehrender Umsatz",
      reports30: "Meldungen / 30 Tage",
      moderationThreshold: (level) => `Moderationsschwelle überschritten: ${level}`,
      gates: {
        title: "Stop-/Go-Gates",
        subtitle: "§7.4 — mit Live-Daten bewertet",
        monthPrefix: (n) => `Monat ${n}`,
      },
      trend: { title: "MAVN-Trend", subtitle: "Tägliche Snapshots" },
      empty: {
        title: "Noch keine Snapshots",
        description:
          "Nimm den ersten mit der Schaltfläche oben auf oder binde den Endpunkt /api/cron/kpi an einen täglichen Cron-Job.",
      },
      chartLabel: "MAVN-Trenddiagramm",
      snapshotTitle: (date, mavu) => `${date}: ${mavu} MAVN`,
      table: {
        date: "Datum",
        mavu: "MAVN",
        dau: "DAU",
        paying: "Zahlend",
        waitlist: "Warteliste",
        mrr: "MRR",
      },
    },

    verification: {
      meta: { title: "Verifizierungs-Warteschlange" },
      title: "Verifizierungs-Warteschlange",
      subtitle: (n) => `${n} offene Anträge — Stufe 1 (KYC) und Stufe 2 (Status)`,
      empty: { title: "Warteschlange leer", description: "Keine offenen Verifizierungsanträge." },
      minor: "Unter 18",
      years: (n) => `${n} Jahre`,
      disciplines: (n) => `${n} Disziplinen`,
      trainings: (n) => `${n} Trainings`,
      memberSince: (date) => `Mitglied seit: ${date}`,
      userNote: "Notiz des Nutzers:",
      idDoc: "Ausweisdokument",
      selfie: "Selfie",
      proof: (i) => `Nachweis ${i}`,
    },

    reports: {
      meta: { title: "Moderation" },
      title: "Moderation",
      subtitle: "Notice-and-Action: Reaktion innerhalb von 24 Stunden (DSA-Pflicht)",
      priorityNotice:
        "Priorisierte Meldungen (Kinderschutz, unsicheres Sparring, Gewalt, sexuelle Inhalte) stehen oben in der Liste.",
      statusLabel: "Status",
      statusOptions: {
        open: "Offen",
        inReview: "In Prüfung",
        resolved: "Erledigt",
        dismissed: "Abgelehnt",
      },
      reasonLabel: "Grund",
      pendingTitle: "Inhalte in Prüfung",
      pendingSubtitle: "Videos aus dem automatischen Vorfilter",
      risk: (percent) => `Risiko ${percent}`,
      openContent: "Inhalt öffnen →",
      publish: "Veröffentlichen",
      remove: "Entfernen",
      listTitle: "Meldungen",
      empty: { title: "Keine Meldungen", description: "Mit diesen Filtern wurden keine Meldungen gefunden." },
      urgent: "Dringend",
      reporter: (name) => `Gemeldet von: ${name}`,
      targetPrefix: " · Ziel: ",
      bannedSuffix: " (gesperrt)",
      idPrefix: "ID: ",
      removeContent: "Inhalt entfernen",
      banUser: "Nutzer sperren",
      dismiss: "Ablehnen (kein Verstoß)",
      resolution: "Entscheidung: ",
    },

    appeals: {
      meta: { title: "Einsprüche" },
      title: "Einsprüche",
      subtitle: "§11.5 DSA-Beschwerdemechanismus — Prüfung unabhängig von der entscheidenden Person",
      noticeBefore: "Die Ergebnisse werden ",
      noticeLink: "im öffentlichen Transparenzbericht",
      noticeAfter:
        " als aggregierte Zahlen veröffentlicht. Die Begründung wird der Nutzerin oder dem Nutzer wortgleich übermittelt — schreibe verständlich und konkret.",
      pending: (n) => `${n} Einsprüche warten auf eine Entscheidung`,
      empty: { title: "Keine Einsprüche", description: "Die Warteschlange ist leer." },
      status: {
        OPEN: "Offen",
        UPHELD: "Entscheidung bestätigt",
        OVERTURNED: "Entscheidung aufgehoben",
        DISMISSED: "Nicht bearbeitet",
      },
      subject: "Betreff: ",
      decision: "Entscheidung: ",
    },

    users: {
      meta: { title: "Nutzer" },
      title: "Nutzer",
      subtitle: (n) => `${n} Einträge`,
      roleLabel: "Rolle",
      verificationLabel: "Verifizierung",
      level0: "Stufe 0",
      level1: "Stufe 1",
      level2: "Stufe 2",
      stateLabel: "Status",
      stateBanned: "Gesperrt",
      stateFounder: "Gründungsmitglied",
      stateMinor: "Unter 18",
      searchPlaceholder: "Name, Nutzername oder E-Mail…",
      empty: "Keine Nutzer gefunden",
      founderBadge: "Gründungsmitglied",
      minorBadge: "18-",
      bannedBadge: "Gesperrt",
      inactiveBadge: "Inaktiv",
      registered: (date) => `Registriert: ${date}`,
      lastActive: (ago) => ` · Zuletzt aktiv: ${ago}`,
      followers: (n) => `${n} Follower`,
      trainings: (n) => `${n} Trainings`,
      openProfile: "Profil öffnen →",
    },

    gyms: {
      meta: { title: "Gyms" },
      title: "Gyms",
      subtitle: (n) => `${n} Gyms — Freigabe, Verifizierung und Halo-Markierung`,
      statusLabel: "Status",
      statusPending: "Wartet auf Freigabe",
      statusActive: "Aktiv",
      statusSuspended: "Gesperrt",
      flagLabel: "Markierung",
      flagHalo: "Halo-Gym",
      flagFounder: "Gründungs-Gym",
      flagUnverified: "Nicht verifiziert",
      searchPlaceholder: "Gym-Name oder Stadt…",
      empty: "Keine Gyms gefunden",
      verifiedBadge: "Verifiziert",
      haloBadge: "Halo",
      founderBadge: "Gründungsmitglied",
      ownerless: "Ohne Inhaber",
      members: (n) => `${n} Mitglieder`,
      classes: (n) => `${n} Kurse`,
      bookings: (n) => `${n} Buchungen`,
      plan: (name) => `Abo: ${name}`,
      perMonth: (money) => `(${money}/Monat)`,
      approve: "Freigeben & veröffentlichen",
      suspend: "Sperren",
      haloRemove: "Halo entfernen",
      haloAdd: "Halo setzen",
      founderRemove: "Gründungsstatus entfernen",
      founderAdd: "Als Gründungs-Gym markieren",
    },
  },

  en: {
    percent: (n) => `${n}%`,

    home: {
      meta: { title: "Admin" },
      title: "Overview",
      subtitle: "Platform health and KPI tracking",
      queueTitle: (n) => `${n} items waiting`,
      pendingVerifications: (n) => `${n} verification requests`,
      openReportsLink: (n) => `${n} open reports`,
      pendingPassport: (n) => `${n} passport documents`,
      northStar: "North Star Metric",
      mavuLabel: "MAVU — Monthly Active Verified Users",
      dau: "DAU",
      dauTotal: "DAU/Total",
      mrr: "MRR",
      payingGyms: "Paying gyms",
      totalUsers: "Total users",
      last30: (n) => `+${n} in the last 30 days`,
      verified: "Verified",
      activeGyms: "Active gyms",
      payingHint: (n) => `${n} paying`,
      waitlist: "Waitlist",
      liveEvents: "Live events",
      upcomingEvents: "Upcoming events",
      trainingLogs: "Training logs",
      openReports: "Open reports",
      gates: {
        title: "Stop/Go gates",
        subtitle: "Beta programme milestones",
        month: "Month",
        green: "🟢 Green",
        yellow: "🟡 Amber",
        red: "🔴 Red",
        monthCell: (n) => `Month ${n}`,
      },
      priorityReports: "Priority reports",
      seeAll: "See all →",
      noReports: { title: "No open reports", description: "The moderation queue is clear." },
      urgent: "Urgent",
      newSignups: "New sign-ups",
      noUsers: "No users yet",
    },

    kpi: {
      meta: { title: "KPI tracking" },
      title: "KPI tracking",
      programMonth: (n) => `Programme month ${n}`,
      startedAt: (date) => `started ${date}`,
      noStartDate: "start date not set",
      lights: { GREEN: "Green", YELLOW: "Amber", RED: "Red", PENDING: "Pending" },
      northStar: "North Star Metric",
      mavuLabel: "MAVU — Monthly Active Verified Users",
      measurements: (n) => `last ${n} measurements`,
      payingGyms: "Paying gyms",
      payingGymsHint: "tracked weekly",
      waitlist: "Waitlist",
      waitlistHint: "pre-launch interest",
      loi: "LOI",
      loiHint: "letters of intent",
      profileCompletion: "Profile completion",
      profileCompletionHint: "target ≥60% (H2)",
      vouches: "Coach vouches",
      vouchesHint: "scaling mechanism (H3)",
      dauMau: "DAU/MAU",
      dauMauHint: "stickiness, target ≥20% (H5)",
      mrr: "MRR",
      mrrHint: "monthly recurring revenue",
      reports30: "Reports / 30 days",
      moderationThreshold: (level) => `Moderation threshold exceeded: ${level}`,
      gates: {
        title: "Stop/Go gates",
        subtitle: "§7.4 — evaluated against live data",
        monthPrefix: (n) => `Month ${n}`,
      },
      trend: { title: "MAVU trend", subtitle: "Daily snapshots" },
      empty: {
        title: "No snapshots yet",
        description:
          "Take the first one with the button above, or wire the /api/cron/kpi endpoint to a daily scheduled job.",
      },
      chartLabel: "MAVU trend chart",
      snapshotTitle: (date, mavu) => `${date}: ${mavu} MAVU`,
      table: {
        date: "Date",
        mavu: "MAVU",
        dau: "DAU",
        paying: "Paying",
        waitlist: "Waitlist",
        mrr: "MRR",
      },
    },

    verification: {
      meta: { title: "Verification queue" },
      title: "Verification queue",
      subtitle: (n) => `${n} pending requests — Level 1 (KYC) and Level 2 (status)`,
      empty: { title: "Queue is clear", description: "No pending verification requests." },
      minor: "Under 18",
      years: (n) => `${n} years old`,
      disciplines: (n) => `${n} disciplines`,
      trainings: (n) => `${n} training sessions`,
      memberSince: (date) => `Member since: ${date}`,
      userNote: "User note:",
      idDoc: "ID document",
      selfie: "Selfie",
      proof: (i) => `Proof ${i}`,
    },

    reports: {
      meta: { title: "Moderation" },
      title: "Moderation",
      subtitle: "Notice-and-action: respond within 24 hours (DSA requirement)",
      priorityNotice:
        "Priority reports (child safety, unsafe sparring, violence, sexual content) appear at the top of the list.",
      statusLabel: "Status",
      statusOptions: {
        open: "Open",
        inReview: "In review",
        resolved: "Resolved",
        dismissed: "Dismissed",
      },
      reasonLabel: "Reason",
      pendingTitle: "Content awaiting review",
      pendingSubtitle: "Videos flagged by the automatic pre-filter",
      risk: (percent) => `Risk ${percent}`,
      openContent: "Open content →",
      publish: "Publish",
      remove: "Remove",
      listTitle: "Reports",
      empty: { title: "No reports", description: "No reports found with these filters." },
      urgent: "Urgent",
      reporter: (name) => `Reported by: ${name}`,
      targetPrefix: " · Target: ",
      bannedSuffix: " (suspended)",
      idPrefix: "ID: ",
      removeContent: "Remove content",
      banUser: "Suspend user",
      dismiss: "Dismiss (no issue)",
      resolution: "Decision: ",
    },

    appeals: {
      meta: { title: "Appeals" },
      title: "Appeals",
      subtitle: "§11.5 DSA complaint mechanism — reviewed independently of whoever made the decision",
      noticeBefore: "Outcomes are published as aggregate numbers in the ",
      noticeLink: "public transparency report",
      noticeAfter:
        ". The reasoning is passed on to the user word for word — write it clearly and concretely.",
      pending: (n) => `${n} appeals awaiting a decision`,
      empty: { title: "No appeals", description: "The queue is clear." },
      status: {
        OPEN: "Open",
        UPHELD: "Decision upheld",
        OVERTURNED: "Decision overturned",
        DISMISSED: "Not processed",
      },
      subject: "Subject: ",
      decision: "Decision: ",
    },

    users: {
      meta: { title: "Users" },
      title: "Users",
      subtitle: (n) => `${n} records`,
      roleLabel: "Role",
      verificationLabel: "Verification",
      level0: "Level 0",
      level1: "Level 1",
      level2: "Level 2",
      stateLabel: "Status",
      stateBanned: "Suspended",
      stateFounder: "Founding member",
      stateMinor: "Under 18",
      searchPlaceholder: "Name, username or email…",
      empty: "No users found",
      founderBadge: "Founder",
      minorBadge: "18-",
      bannedBadge: "Suspended",
      inactiveBadge: "Inactive",
      registered: (date) => `Registered: ${date}`,
      lastActive: (ago) => ` · Last active: ${ago}`,
      followers: (n) => `${n} followers`,
      trainings: (n) => `${n} training sessions`,
      openProfile: "Open profile →",
    },

    gyms: {
      meta: { title: "Gyms" },
      title: "Gyms",
      subtitle: (n) => `${n} gyms — approval, verification and Halo flagging`,
      statusLabel: "Status",
      statusPending: "Awaiting approval",
      statusActive: "Active",
      statusSuspended: "Suspended",
      flagLabel: "Flag",
      flagHalo: "Halo gym",
      flagFounder: "Founding gym",
      flagUnverified: "Not verified",
      searchPlaceholder: "Gym name or city…",
      empty: "No gyms found",
      verifiedBadge: "Verified",
      haloBadge: "Halo",
      founderBadge: "Founder",
      ownerless: "No owner",
      members: (n) => `${n} members`,
      classes: (n) => `${n} classes`,
      bookings: (n) => `${n} bookings`,
      plan: (name) => `Plan: ${name}`,
      perMonth: (money) => `(${money}/month)`,
      approve: "Approve & publish",
      suspend: "Suspend",
      haloRemove: "Remove Halo",
      haloAdd: "Mark as Halo",
      founderRemove: "Remove founder status",
      founderAdd: "Mark as founding gym",
    },
  },

  tr: {
    percent: (n) => `%${n}`,

    home: {
      meta: { title: "Admin" },
      title: "Genel Bakış",
      subtitle: "Platform sağlığı ve KPI takibi",
      queueTitle: (n) => `${n} işlem bekliyor`,
      pendingVerifications: (n) => `${n} doğrulama talebi`,
      openReportsLink: (n) => `${n} açık rapor`,
      pendingPassport: (n) => `${n} passport belgesi`,
      northStar: "North Star Metric",
      mavuLabel: "MAVU — Aylık Aktif Doğrulanmış Kullanıcı",
      dau: "DAU",
      dauTotal: "DAU/Toplam",
      mrr: "MRR",
      payingGyms: "Ödeyen salon",
      totalUsers: "Toplam kullanıcı",
      last30: (n) => `+${n} son 30 gün`,
      verified: "Doğrulanmış",
      activeGyms: "Aktif salon",
      payingHint: (n) => `${n} ödeyen`,
      waitlist: "Bekleme listesi",
      liveEvents: "Canlı etkinlik",
      upcomingEvents: "Yaklaşan etkinlik",
      trainingLogs: "Antrenman kaydı",
      openReports: "Açık rapor",
      gates: {
        title: "Dur/Devam Kapıları",
        subtitle: "Beta programı kilometre taşları",
        month: "Ay",
        green: "🟢 Yeşil",
        yellow: "🟡 Sarı",
        red: "🔴 Kırmızı",
        monthCell: (n) => `Ay ${n}`,
      },
      priorityReports: "Öncelikli Raporlar",
      seeAll: "Tümü →",
      noReports: { title: "Açık rapor yok", description: "Moderasyon kuyruğu temiz." },
      urgent: "Acil",
      newSignups: "Yeni Kayıtlar",
      noUsers: "Henüz kullanıcı yok",
    },

    kpi: {
      meta: { title: "KPI Takibi" },
      title: "KPI Takibi",
      programMonth: (n) => `Program ayı ${n}`,
      startedAt: (date) => `başlangıç ${date}`,
      noStartDate: "başlangıç tarihi ayarlanmamış",
      lights: { GREEN: "Yeşil", YELLOW: "Sarı", RED: "Kırmızı", PENDING: "Sırada" },
      northStar: "North Star Metric",
      mavuLabel: "MAVU — Aylık Aktif Doğrulanmış Kullanıcı",
      measurements: (n) => `son ${n} ölçüm`,
      payingGyms: "Ödeyen salon",
      payingGymsHint: "haftalık takip",
      waitlist: "Bekleme listesi",
      waitlistHint: "uygulama öncesi ilgi",
      loi: "LOI",
      loiHint: "niyet mektupları",
      profileCompletion: "Profil tamamlanma",
      profileCompletionHint: "hedef ≥%60 (H2)",
      vouches: "Antrenör kefaleti",
      vouchesHint: "ölçekleme mekanizması (H3)",
      dauMau: "DAU/MAU",
      dauMauHint: "yapışkanlık, hedef ≥%20 (H5)",
      mrr: "MRR",
      mrrHint: "aylık yinelenen ciro",
      reports30: "Rapor / 30 gün",
      moderationThreshold: (level) => `Moderasyon eşiği aşıldı: ${level}`,
      gates: {
        title: "Dur/Devam Kapıları",
        subtitle: "§7.4 — canlı verilerle değerlendirildi",
        monthPrefix: (n) => `Ay ${n}`,
      },
      trend: { title: "MAVU Trendi", subtitle: "Günlük anlık görüntüler" },
      empty: {
        title: "Henüz anlık görüntü yok",
        description:
          "Yukarıdaki düğmeyle ilkini al veya /api/cron/kpi uç noktasını günlük zamanlanmış göreve bağla.",
      },
      chartLabel: "MAVU trend grafiği",
      snapshotTitle: (date, mavu) => `${date}: ${mavu} MAVU`,
      table: {
        date: "Tarih",
        mavu: "MAVU",
        dau: "DAU",
        paying: "Ödeyen",
        waitlist: "Bekleme",
        mrr: "MRR",
      },
    },

    verification: {
      meta: { title: "Doğrulama Kuyruğu" },
      title: "Doğrulama Kuyruğu",
      subtitle: (n) => `${n} bekleyen talep — Seviye 1 (KYC) ve Seviye 2 (durum)`,
      empty: { title: "Kuyruk temiz", description: "Bekleyen doğrulama talebi yok." },
      minor: "18 yaş altı",
      years: (n) => `${n} yaş`,
      disciplines: (n) => `${n} disiplin`,
      trainings: (n) => `${n} antrenman`,
      memberSince: (date) => `Üyelik: ${date}`,
      userNote: "Kullanıcı notu:",
      idDoc: "Kimlik Belgesi",
      selfie: "Selfie",
      proof: (i) => `Kanıt ${i}`,
    },

    reports: {
      meta: { title: "Moderasyon" },
      title: "Moderasyon",
      subtitle: "Notice-and-Action: 24 saat içinde tepki (DSA gerekliliği)",
      priorityNotice:
        "Öncelikli raporlar (çocuk güvenliği, güvensiz sparring, şiddet, cinsel içerik) listenin başındadır.",
      statusLabel: "Durum",
      statusOptions: {
        open: "Açık",
        inReview: "İncelemede",
        resolved: "Çözüldü",
        dismissed: "Reddedildi",
      },
      reasonLabel: "Sebep",
      pendingTitle: "İnceleme Bekleyen İçerik",
      pendingSubtitle: "Otomatik ön filtreden geçen videolar",
      risk: (percent) => `Risk ${percent}`,
      openContent: "İçeriği aç →",
      publish: "Yayınla",
      remove: "Kaldır",
      listTitle: "Raporlar",
      empty: { title: "Rapor yok", description: "Bu filtrelerle rapor bulunamadı." },
      urgent: "Acil",
      reporter: (name) => `Bildiren: ${name}`,
      targetPrefix: " · Hedef: ",
      bannedSuffix: " (askıda)",
      idPrefix: "ID: ",
      removeContent: "İçeriği Kaldır",
      banUser: "Kullanıcıyı Askıya Al",
      dismiss: "Reddet (sorun yok)",
      resolution: "Karar: ",
    },

    appeals: {
      meta: { title: "İtirazlar" },
      title: "İtirazlar",
      subtitle: "§11.5 DSA şikayet mekanizması — kararı veren kişiden bağımsız değerlendirme",
      noticeBefore: "Sonuçlar ",
      noticeLink: "kamuya açık şeffaflık raporunda",
      noticeAfter:
        " toplu sayı olarak yayınlanır. Karar gerekçesi kullanıcıya aynen iletilir — anlaşılır ve somut yaz.",
      pending: (n) => `${n} itiraz karar bekliyor`,
      empty: { title: "İtiraz yok", description: "Kuyruk temiz." },
      status: {
        OPEN: "Açık",
        UPHELD: "Karar korundu",
        OVERTURNED: "Karar geri alındı",
        DISMISSED: "İşleme alınmadı",
      },
      subject: "Konu: ",
      decision: "Karar: ",
    },

    users: {
      meta: { title: "Kullanıcılar" },
      title: "Kullanıcılar",
      subtitle: (n) => `${n} kayıt`,
      roleLabel: "Rol",
      verificationLabel: "Doğrulama",
      level0: "Seviye 0",
      level1: "Seviye 1",
      level2: "Seviye 2",
      stateLabel: "Durum",
      stateBanned: "Askıya alınmış",
      stateFounder: "Kurucu üye",
      stateMinor: "18 yaş altı",
      searchPlaceholder: "İsim, kullanıcı adı veya e-posta…",
      empty: "Kullanıcı bulunamadı",
      founderBadge: "Kurucu",
      minorBadge: "18-",
      bannedBadge: "Askıda",
      inactiveBadge: "Pasif",
      registered: (date) => `Kayıt: ${date}`,
      lastActive: (ago) => ` · Son aktif: ${ago}`,
      followers: (n) => `${n} takipçi`,
      trainings: (n) => `${n} antrenman`,
      openProfile: "Profili aç →",
    },

    gyms: {
      meta: { title: "Salonlar" },
      title: "Salonlar",
      subtitle: (n) => `${n} salon — onay, doğrulama ve Halo işaretleme`,
      statusLabel: "Durum",
      statusPending: "Onay bekliyor",
      statusActive: "Aktif",
      statusSuspended: "Askıda",
      flagLabel: "İşaret",
      flagHalo: "Halo salon",
      flagFounder: "Kurucu salon",
      flagUnverified: "Doğrulanmamış",
      searchPlaceholder: "Salon adı veya şehir…",
      empty: "Salon bulunamadı",
      verifiedBadge: "Doğrulanmış",
      haloBadge: "Halo",
      founderBadge: "Kurucu",
      ownerless: "Sahipsiz",
      members: (n) => `${n} üye`,
      classes: (n) => `${n} ders`,
      bookings: (n) => `${n} rezervasyon`,
      plan: (name) => `Plan: ${name}`,
      perMonth: (money) => `(${money}/ay)`,
      approve: "Onayla & Yayınla",
      suspend: "Askıya Al",
      haloRemove: "Halo Kaldır",
      haloAdd: "Halo Yap",
      founderRemove: "Kurucu Kaldır",
      founderAdd: "Kurucu Salon Yap",
    },
  },
};
