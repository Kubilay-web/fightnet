import type { Dictionary } from "./index";

/** Deutsch — Hauptsprache der Plattform (§5.2). */
export const de: Dictionary = {
  meta: {
    tagline: "Die unabhängige Kampfsport-Plattform im DACH-Raum",
    description:
      "Verifizierte Kämpferprofile, Gym-Finder, Sparringsuche, Trainingstagebuch und Livescore.",
  },

  nav: {
    home: "Start",
    fighters: "Kämpfer",
    gyms: "Gyms",
    events: "Events",
    sparring: "Sparring",
    coaching: "Coaching",
    discover: "Entdecken",
    forum: "Forum",
    map: "Karte",
    marketplace: "Marktplatz",
    search: "Suchen",
    menu: "Menü",
    close: "Schließen",
  },

  auth: {
    login: "Anmelden",
    register: "Registrieren",
    logout: "Abmelden",
    dashboard: "Dashboard",
    profile: "Profil",
    settings: "Einstellungen",
    notifications: "Benachrichtigungen",
  },

  common: {
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    send: "Senden",
    back: "Zurück",
    next: "Weiter",
    previous: "Vorherige",
    loading: "Wird geladen…",
    more: "Mehr",
    all: "Alle",
    filter: "Filtern",
    clear: "Zurücksetzen",
    share: "Teilen",
    report: "Melden",
    open: "Öffnen",
    skipToContent: "Zum Inhalt springen",
    required: "Pflichtfeld",
    optional: "Optional",
    yes: "Ja",
    no: "Nein",
    perMonth: "/ Monat",
    verified: "Verifiziert",
    founder: "Gründungsmitglied",
    live: "LIVE",
    premium: "Premium",
  },

  errors: {
    generic: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    notFound: "Seite nicht gefunden",
    notFoundBody: "Die gesuchte Seite wurde verschoben oder hat nie existiert.",
    forbidden: "Du hast keinen Zugriff auf diese Seite",
    offline: "Du bist offline",
    paymentsUnavailable: "Die Zahlungsabwicklung ist noch nicht eingerichtet.",

    notFoundTitle: "In diesem Ring steht niemand",
    notFoundCta: "Mach auf der Startseite weiter.",
    homeCta: "Startseite",

    genericTitle: "Etwas ist schiefgelaufen",
    genericBody:
      "Es ist ein unerwarteter Fehler aufgetreten. Ein erneuter Versuch kann helfen; wenn er bestehen bleibt, sag uns Bescheid.",
    errorCode: "Fehlercode",
    retry: "Erneut versuchen",

    forbiddenMeta: "Kein Zugriff",
    forbiddenTitle: "Du hast keinen Zugriff auf diesen Bereich",
    forbiddenBody:
      "Dir fehlt die nötige Berechtigung für diese Seite. Möglicherweise bist du mit dem falschen Konto angemeldet.",
    dashboardCta: "Mein Dashboard",

    offlineTitle: "Keine Verbindung",
    offlineBody:
      "Diese Seite ist noch nicht auf deinem Gerät gespeichert. Sobald deine Verbindung zurück ist, wird sie automatisch geladen.",
    offlineLogTitle: "Das Trainingstagebuch funktioniert offline",
    offlineLogBody:
      "Trag deine Einheit jetzt ein — sie wird auf deinem Gerät gespeichert und deinem Konto hinzugefügt, sobald die Verbindung zurück ist.",
    offlineLogCta: "Training eintragen",
    offlineRetry: "Erneut versuchen",

    guardianMeta: "Elternfreigabe",
    guardianOkTitle: "Freigabe erteilt",
    guardianFailTitle: "Freigabe nicht möglich",
    guardianOkBody: "{name} kann FIGHTNET jetzt vollständig nutzen.",
    guardianMember: "Das Mitglied",
    guardianWhatTitle: "Was bedeutet diese Freigabe?",
    guardianPoint1: "Verifizierte Erwachsene können dem Mitglied direkt schreiben.",
    guardianPoint2:
      "Sparring-Matching und Wettkampfeinträge werden freigeschaltet — nach jedem Sparring ist eine Sicherheitsbewertung verpflichtend.",
    guardianPoint3:
      "Das Profil des Mitglieds bleibt durch den altersgerechten Inhaltsfilter geschützt.",
    guardianPoint4: "Sie können die Freigabe jederzeit widerrufen.",
    guardianContactLead: "Bei Fragen",
    guardianContactLink: "schreiben Sie uns",
    guardianPrivacyLead: "Details zur Datenverarbeitung finden Sie in der",
    guardianPrivacyLink: "Datenschutzerklärung",
    guardianCta: "Zu FIGHTNET",
  },

  waitlist: {
    doneTitle: "Du stehst auf der Warteliste!",
    doneBody:
      "Sobald dein Beta-Zugangscode bereit ist, melden wir uns per E-Mail. Die Vorteile für Gründungsmitglieder sichern sich die ersten Eingeladenen.",
    email: "E-Mail",
    emailPlaceholder: "name@beispiel.de",
    name: "Vor- und Nachname",
    namePlaceholder: "Dein Name",
    city: "Stadt",
    role: "Wer bist du?",
    roleAthlete: "Athlet",
    roleCoach: "Trainer",
    roleGymOwner: "Gym-Betreiber",
    roleOrganizer: "Veranstalter",
    roleFan: "Fan",
    gymName: "Name des Gyms (falls vorhanden)",
    submit: "Auf die Warteliste eintragen",
    submitCompact: "Eintragen",
    error: "Es ist ein Fehler aufgetreten, bitte versuche es erneut.",
    legalLead: "Mit der Anmeldung akzeptierst du die",
    legalLink: "Datenschutzerklärung",
    legalTail:
      ". Deine Daten werden in der EU gespeichert und können jederzeit gelöscht werden.",
  },

  consent: {
    title: "Deine Privatsphäre liegt in deiner Hand",
    body:
      "Ohne die für Sitzung und Sicherheit notwendigen Cookies funktioniert die Plattform nicht. Alles Weitere entscheidest du selbst — nach DSGVO und TTDSG setzen wir ohne deine Einwilligung keine weiteren Cookies, und FIGHTNET kannst du auch ohne sie vollständig nutzen.",
    privacyLink: "Datenschutzerklärung",
    necessary: "Notwendig",
    necessaryBody: "Sitzung, Sicherheit, Rate-Limiting. Nicht deaktivierbar.",
    alwaysOn: "Immer aktiv",
    analytics: "Statistik",
    analyticsBody:
      "Anonyme Nutzungsstatistik, damit wir verstehen, welche Funktionen wirklich weiterhelfen.",
    marketing: "Werbung",
    marketingBody:
      "Banner von Kampfsportmarken werden personalisiert. Sportwetten-Werbung zeigen wir niemals.",
    health: "Gesundheitsdaten",
    healthBody:
      "Gewichtsverlauf und Smartwatch-Synchronisierung. Erfordert eine gesonderte Einwilligung nach Artikel 9 DSGVO.",
    acceptAll: "Alle akzeptieren",
    saveChoice: "Auswahl speichern",
    necessaryOnly: "Nur notwendige",
    customize: "Einstellen",
    settingsLink: "Cookie-Einstellungen",
  },

  footer: {
    colPlatform: "Plattform",
    colCommunity: "Community",
    colBrand: "FIGHTNET",
    colLegal: "Rechtliches",

    fightersLink: "Kämpfer",
    gymsLink: "Gyms",
    eventsLink: "Events",
    coachingLink: "Online-Coaching",
    mapLink: "Karte",
    forumLink: "Forum",
    sparringSearch: "Sparringsuche",
    discoverFeed: "Entdecken-Feed",
    creators: "Creator",
    marketplace: "Ausrüstungsmarkt",
    sponsorship: "Sponsoring",

    about: "Über uns",
    contact: "Kontakt",
    forGyms: "Für Gyms",
    beta: "Beta-Programm",
    premium: "Premium",
    dataLicense: "Datenlizenz",

    privacy: "Datenschutz (DSGVO)",
    terms: "AGB",
    imprint: "Impressum",
    transparency: "Transparenzbericht (DSA)",
    communityRules: "Community-Richtlinien",
    sparringAgreement: "Sparring-Vereinbarung",

    blurb:
      "Die unabhängige Plattform für Kampfsport im DACH-Raum. Ein digitales Zuhause für Athleten, Trainer, Gyms und Fans.",
    hostedInEu: "Hosting in der EU · DSGVO-konform",
    independent: "Verbandsunabhängig.",
    noBettingAds: "Keine Sportwetten-Werbung · Jugendschutz aktiv",
    rightsReserved: "Alle Rechte vorbehalten.",
    language: "Sprache",
  },

  home: {
    heroTitleTop: "Der Amateurmeister aus Hessen,",
    heroTitleAccent: "so sichtbar wie ein UFC-Kämpfer.",
    heroBody:
      "FIGHTNET bringt Athleten, Trainer, Gyms und Fans des Kampfsports auf einer unabhängigen Plattform zusammen.",
    ctaPrimary: "Kostenlos beitreten",
    ctaSecondary: "Gyms entdecken",
    statAthletes: "Athleten",
    statVerified: "Verifiziert",
    statGyms: "Gyms",
    statEvents: "Events",
    liveNow: "Jetzt live",
    liveNowSub: "Laufende Kämpfe in Echtzeit verfolgen",
    upcoming: "Kommende Events",
    topFighters: "Top-Kämpfer",
    featuredGyms: "Ausgewählte Gyms",
    latestPosts: "Aus dem Feed",
    spotlight: "Athlet des Tages",
  },

  stream: {
    paidTitle: "Dieser Stream ist kostenpflichtig",
    paidBody: "Melde dich an und kaufe anschließend das Stream-Ticket.",
    buyTicket: "Stream-Ticket kaufen",
    accessPriced: "Zugang zum Livestream {price}. Nach dem Event 30 Tage lang erneut abrufbar.",
    accessGeneric: "Für diesen Stream ist ein Zugangsticket erforderlich.",
    readyTitle: "Stream bereit",
    readyBody: "Dein Browser spielt HLS nicht nativ ab. Du kannst den Stream in einem neuen Tab öffnen.",
    openStream: "Stream öffnen",
    purchaseFailed: "Kauf konnte nicht gestartet werden",
    tokenNote: "Dieser Zugang gilt nur für dich und ist mit einem kurzlebigen Token signiert. Den Link zu teilen bringt nichts.",
  },

  ui: {
    pagination: "Seitennavigation",
    sponsored: "Gesponserter Inhalt",
    themeLight: "Zum hellen Modus wechseln",
    themeDark: "Zum dunklen Modus wechseln",
    uploadImage: "Bild hochladen",
    uploadHint: "Klicken oder ziehen",
    uploadRemove: "Entfernen",
    uploadFailed: "Upload fehlgeschlagen",
    uploadSignFailed: "Signatur konnte nicht abgerufen werden",
    uploadNetworkError: "Netzwerkfehler",
    playVideo: "Video abspielen",
  },

  manifest: {
    logTraining: "Training eintragen",
    training: "Training",
    findSparring: "Sparring finden",
    liveEvents: "Live-Events",
  },

  locale: {
    switchLabel: "Sprache wechseln",
    current: "Aktuelle Sprache",
  },

  cards: {
    pro: "Pro",
    athlete: "Athlet",
    halo: "Halo",
    founderGym: "Gründungs-Gym",
    freeTrial: "Probetraining gratis",
    members: "Mitglieder",
    fights: "Kämpfe",
    post: "Beitrag",
  },

  fightCard: {
    empty: "Die Kampfkarte wurde noch nicht veröffentlicht.",
    mainEvent: "Hauptkampf",
    titleFight: "Titelkampf",
    rounds: "Runden",
    finished: "Beendet",
    cancelled: "Abgesagt",
  },

  filters: {
    searchPlaceholder: "Suchen…",
    searchLabel: "Suchen",
    clearSearch: "Suche zurücksetzen",
    clear: "Zurücksetzen",
    openFilters: "Filter öffnen",
  },

  map: {
    layerAll: "Alle",
    layerGyms: "Nur Gyms",
    layerEvents: "Nur Events",
    allDisciplines: "Alle Disziplinen",
    locateMe: "Meinen Standort finden",
    yourLocation: "Dein Standort",
    legendGym: "Gym",
    legendHalo: "Halo",
    legendEvent: "Event",
    members: "Mitglieder",
    directions: "Route berechnen →",
    trial: "Probetraining",
    noGyms: "Mit diesen Filtern gibt es kein Gym",
  },
};
