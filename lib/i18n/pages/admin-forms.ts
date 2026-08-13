import type { Locale } from "@/lib/i18n/config";

/**
 * §5.2 — Yönetim panelindeki form ve aksiyon bileşenlerinin metinleri.
 *
 * Buradaki metinler yalnızca ARAYÜZ etiketleridir; sunucu eylemlerinin (Zod
 * şemaları ve `actions.ts` dosyaları) döndürdüğü hata metinleri kaynağında
 * kalır. Rol, disiplin ve seviye etiketleri hâlâ `lib/constants.ts` üzerinden
 * gelir.
 */

/* ------------------------------------------------------------------ */
/* admin-user-form.tsx                                                 */
/* ------------------------------------------------------------------ */

type AdminUserFormCopy = {
  submit: string;
  role: string;
  verification: string;
  level0: string;
  level1: string;
  level2: string;
  accountActive: string;
  founderBadge: string;
  ban: string;
  banReason: string;
  banReasonHint: string;
};

export const adminUserFormCopy: Record<Locale, AdminUserFormCopy> = {
  de: {
    submit: "Benutzer aktualisieren",
    role: "Rolle",
    verification: "Verifizierungsstufe",
    level0: "Stufe 0 — E-Mail",
    level1: "Stufe 1 — Identität",
    level2: "Stufe 2 — Status",
    accountActive: "Konto aktiv",
    founderBadge: "Gründungsmitglied-Abzeichen",
    ban: "Sperren",
    banReason: "Sperrgrund",
    banReasonHint: "Wird dem Benutzer angezeigt",
  },
  en: {
    submit: "Update user",
    role: "Role",
    verification: "Verification level",
    level0: "Level 0 — Email",
    level1: "Level 1 — Identity",
    level2: "Level 2 — Status",
    accountActive: "Account active",
    founderBadge: "Founding Member badge",
    ban: "Suspend",
    banReason: "Suspension reason",
    banReasonHint: "Shown to the user",
  },
  tr: {
    submit: "Kullanıcıyı Güncelle",
    role: "Rol",
    verification: "Doğrulama seviyesi",
    level0: "Seviye 0 — E-posta",
    level1: "Seviye 1 — Kimlik",
    level2: "Seviye 2 — Durum",
    accountActive: "Hesap aktif",
    founderBadge: "Kurucu Üye rozeti",
    ban: "Askıya al",
    banReason: "Askıya alma sebebi",
    banReasonHint: "Kullanıcıya gösterilir",
  },
};

/* ------------------------------------------------------------------ */
/* admin-review-actions.tsx                                            */
/* ------------------------------------------------------------------ */

type ReviewActionsCopy = {
  notePlaceholder: string;
  approve: string;
  reject: string;
};

export const reviewActionsCopy: Record<Locale, ReviewActionsCopy> = {
  de: {
    notePlaceholder: "Prüfnotiz (wird dem Benutzer mitgeteilt)",
    approve: "Freigeben",
    reject: "Ablehnen",
  },
  en: {
    notePlaceholder: "Review note (shared with the user)",
    approve: "Approve",
    reject: "Reject",
  },
  tr: {
    notePlaceholder: "İnceleme notu (kullanıcıya iletilir)",
    approve: "Onayla",
    reject: "Reddet",
  },
};

/* ------------------------------------------------------------------ */
/* appeal-decision.tsx                                                 */
/* ------------------------------------------------------------------ */

type AppealDecisionCopy = {
  tooShort: string;
  placeholder: string;
  overturn: string;
  uphold: string;
  dismiss: string;
};

export const appealDecisionCopy: Record<Locale, AppealDecisionCopy> = {
  de: {
    tooShort:
      "Die Begründung muss mindestens 10 Zeichen lang sein — der Benutzer wird diesen Text lesen.",
    placeholder: "Begründung der Entscheidung — geht als Benachrichtigung an den Benutzer",
    overturn: "Entscheidung aufheben",
    uphold: "Entscheidung bestätigen",
    dismiss: "Nicht bearbeiten",
  },
  en: {
    tooShort: "The reasoning must be at least 10 characters — the user will read this text.",
    placeholder: "Reasoning for the decision — sent to the user as a notification",
    overturn: "Overturn decision",
    uphold: "Uphold decision",
    dismiss: "Dismiss",
  },
  tr: {
    tooShort: "Karar gerekçesi en az 10 karakter olmalı — kullanıcı bu metni okuyacak.",
    placeholder: "Kararın gerekçesi — kullanıcıya bildirim olarak gider",
    overturn: "Kararı geri al",
    uphold: "Kararı koru",
    dismiss: "İşleme alma",
  },
};

/* ------------------------------------------------------------------ */
/* kpi-actions.tsx                                                     */
/* ------------------------------------------------------------------ */

type KpiActionsCopy = {
  snapshot: string;
};

export const kpiActionsCopy: Record<Locale, KpiActionsCopy> = {
  de: { snapshot: "Momentaufnahme erstellen" },
  en: { snapshot: "Take snapshot" },
  tr: { snapshot: "Anlık görüntü al" },
};

/* ------------------------------------------------------------------ */
/* beta-code-form.tsx                                                  */
/* ------------------------------------------------------------------ */

type BetaCodeFormCopy = {
  submit: string;
  code: string;
  codeHint: string;
  codePlaceholder: string;
  label: string;
  labelPlaceholder: string;
  maxUses: string;
  grantsRole: string;
  grantsRoleHint: string;
  roleNone: string;
  roleAthlete: string;
  roleCoach: string;
  roleGymOwner: string;
  roleOrganizer: string;
  expiresAt: string;
  founder: string;
};

export const betaCodeFormCopy: Record<Locale, BetaCodeFormCopy> = {
  de: {
    submit: "Code erstellen",
    code: "Code",
    codeHint: "Wird automatisch erzeugt, wenn das Feld leer bleibt",
    codePlaceholder: "FN-XXXXXX",
    label: "Bezeichnung",
    labelPlaceholder: "MMA Spirit Frankfurt",
    maxUses: "Max. Nutzungen",
    grantsRole: "Rolle vergeben",
    grantsRoleHint: "Rolle, die bei Einlösung des Codes zugewiesen wird",
    roleNone: "Keine",
    roleAthlete: "Athlet",
    roleCoach: "Trainer",
    roleGymOwner: "Gym-Betreiber",
    roleOrganizer: "Veranstalter",
    expiresAt: "Gültig bis",
    founder: "Gründungsmitglied-Privileg vergeben (lebenslang 50 €/Monat + Abzeichen)",
  },
  en: {
    submit: "Create code",
    code: "Code",
    codeHint: "Generated automatically if left empty",
    codePlaceholder: "FN-XXXXXX",
    label: "Label",
    labelPlaceholder: "MMA Spirit Frankfurt",
    maxUses: "Max. uses",
    grantsRole: "Grant role",
    grantsRoleHint: "Role assigned when the code is redeemed",
    roleNone: "None",
    roleAthlete: "Athlete",
    roleCoach: "Coach",
    roleGymOwner: "Gym owner",
    roleOrganizer: "Organizer",
    expiresAt: "Expires on",
    founder: "Grant Founding Member privilege (50 €/month for life + badge)",
  },
  tr: {
    submit: "Kod Oluştur",
    code: "Kod",
    codeHint: "Boş bırakılırsa otomatik üretilir",
    codePlaceholder: "FN-XXXXXX",
    label: "Etiket",
    labelPlaceholder: "MMA Spirit Frankfurt",
    maxUses: "Maks. kullanım",
    grantsRole: "Rol ver",
    grantsRoleHint: "Kod kullanıldığında atanacak rol",
    roleNone: "Yok",
    roleAthlete: "Sporcu",
    roleCoach: "Antrenör",
    roleGymOwner: "Salon İşletmecisi",
    roleOrganizer: "Organizatör",
    expiresAt: "Son geçerlilik",
    founder: "Kurucu Üye ayrıcalığı ver (ömür boyu 50 €/ay + rozet)",
  },
};

/* ------------------------------------------------------------------ */
/* forum-category-form.tsx                                             */
/* ------------------------------------------------------------------ */

type ForumCategoryFormCopy = {
  submit: string;
  name: string;
  namePlaceholder: string;
  discipline: string;
  general: string;
  order: string;
  description: string;
};

export const forumCategoryFormCopy: Record<Locale, ForumCategoryFormCopy> = {
  de: {
    submit: "Kategorie erstellen",
    name: "Kategoriename",
    namePlaceholder: "MMA Allgemein",
    discipline: "Disziplin",
    general: "Allgemein",
    order: "Reihenfolge",
    description: "Beschreibung",
  },
  en: {
    submit: "Create category",
    name: "Category name",
    namePlaceholder: "MMA General",
    discipline: "Discipline",
    general: "General",
    order: "Order",
    description: "Description",
  },
  tr: {
    submit: "Kategori Oluştur",
    name: "Kategori adı",
    namePlaceholder: "MMA Genel",
    discipline: "Disiplin",
    general: "Genel",
    order: "Sıra",
    description: "Açıklama",
  },
};

/* ------------------------------------------------------------------ */
/* spotlight-form.tsx                                                  */
/* ------------------------------------------------------------------ */

type SpotlightFormCopy = {
  submit: string;
  athlete: string;
  athleteHint: string;
  athletePlaceholder: string;
  date: string;
  headline: string;
  headlinePlaceholder: string;
  blurb: string;
  blurbPlaceholder: string;
};

export const spotlightFormCopy: Record<Locale, SpotlightFormCopy> = {
  de: {
    submit: "Ins Spotlight nehmen",
    athlete: "Athlet",
    athleteHint: "Benutzername oder ID",
    athletePlaceholder: "ahmetyilmaz",
    date: "Datum",
    headline: "Schlagzeile",
    headlinePlaceholder: "Hessens aufsteigender BJJ-Stern",
    blurb: "Kurztext",
    blurbPlaceholder: "Warum steht dieser Athlet im Vordergrund?",
  },
  en: {
    submit: "Add to Spotlight",
    athlete: "Athlete",
    athleteHint: "Username or ID",
    athletePlaceholder: "ahmetyilmaz",
    date: "Date",
    headline: "Headline",
    headlinePlaceholder: "Hesse's rising BJJ star",
    blurb: "Short text",
    blurbPlaceholder: "Why is this athlete in the spotlight?",
  },
  tr: {
    submit: "Spotlight'a Al",
    athlete: "Sporcu",
    athleteHint: "Kullanıcı adı veya ID",
    athletePlaceholder: "ahmetyilmaz",
    date: "Tarih",
    headline: "Manşet",
    headlinePlaceholder: "Hessen'in yükselen BJJ yıldızı",
    blurb: "Kısa metin",
    blurbPlaceholder: "Neden bu sporcu öne çıkıyor?",
  },
};

/* ------------------------------------------------------------------ */
/* ad-form.tsx                                                         */
/* ------------------------------------------------------------------ */

type AdFormCopy = {
  submit: string;
  campaignName: string;
  campaignNamePlaceholder: string;
  advertiser: string;
  advertiserPlaceholder: string;
  banner: string;
  bannerHint: string;
  linkUrl: string;
  placement: string;
  startsAt: string;
  endsAt: string;
  disciplines: string;
  disciplinesHint: string;
  cities: string;
  citiesHint: string;
  citiesPlaceholder: string;
  activate: string;
};

export const adFormCopy: Record<Locale, AdFormCopy> = {
  de: {
    submit: "Anzeige erstellen",
    campaignName: "Kampagnenname",
    campaignNamePlaceholder: "Venum Frühjahrskampagne",
    advertiser: "Werbetreibender",
    advertiserPlaceholder: "Venum",
    banner: "Bannerbild",
    bannerHint: "Empfohlen: 1280×200 px",
    linkUrl: "Ziel-Link",
    placement: "Platzierung",
    startsAt: "Beginn",
    endsAt: "Ende",
    disciplines: "Ziel-Disziplinen",
    disciplinesHint: "Wird bei leerem Feld allen angezeigt",
    cities: "Zielstädte",
    citiesHint: "Mit Komma trennen — bei leerem Feld alle",
    citiesPlaceholder: "Frankfurt, Mainz, Wiesbaden",
    activate: "Sofort veröffentlichen",
  },
  en: {
    submit: "Create ad",
    campaignName: "Campaign name",
    campaignNamePlaceholder: "Venum Spring Campaign",
    advertiser: "Advertiser",
    advertiserPlaceholder: "Venum",
    banner: "Banner image",
    bannerHint: "Recommended: 1280×200 px",
    linkUrl: "Target link",
    placement: "Placement",
    startsAt: "Start",
    endsAt: "End",
    disciplines: "Target disciplines",
    disciplinesHint: "Shown to everyone if left empty",
    cities: "Target cities",
    citiesHint: "Separate with commas — all cities if left empty",
    citiesPlaceholder: "Frankfurt, Mainz, Wiesbaden",
    activate: "Publish immediately",
  },
  tr: {
    submit: "Reklamı Oluştur",
    campaignName: "Kampanya adı",
    campaignNamePlaceholder: "Venum Bahar Kampanyası",
    advertiser: "Reklamveren",
    advertiserPlaceholder: "Venum",
    banner: "Banner görseli",
    bannerHint: "Önerilen: 1280×200 px",
    linkUrl: "Hedef bağlantı",
    placement: "Yerleşim",
    startsAt: "Başlangıç",
    endsAt: "Bitiş",
    disciplines: "Hedef disiplinler",
    disciplinesHint: "Boş bırakılırsa tümüne gösterilir",
    cities: "Hedef şehirler",
    citiesHint: "Virgülle ayır — boş bırakılırsa tümü",
    citiesPlaceholder: "Frankfurt, Mainz, Wiesbaden",
    activate: "Hemen yayına al",
  },
};

/* ------------------------------------------------------------------ */
/* sponsor-admin-forms.tsx                                             */
/* ------------------------------------------------------------------ */

type SponsorAdminCopy = {
  sponsor: {
    submit: string;
    name: string;
    namePlaceholder: string;
    website: string;
    budget: string;
    budgetMin: string;
    budgetMax: string;
    about: string;
    disciplines: string;
    logo: string;
    logoUpload: string;
  };
  offer: {
    empty: string;
    submit: string;
    sponsor: string;
    select: string;
    title: string;
    titlePlaceholder: string;
    description: string;
    minFollowers: string;
    minLevel: string;
    region: string;
    regionPlaceholder: string;
    value: string;
    valueHint: string;
    valuePlaceholder: string;
    deadline: string;
    disciplines: string;
  };
  status: { close: string; reopen: string };
  application: { accept: string; reject: string };
};

export const sponsorAdminCopy: Record<Locale, SponsorAdminCopy> = {
  de: {
    sponsor: {
      submit: "Sponsor hinzufügen",
      name: "Markenname",
      namePlaceholder: "Fairtex Deutschland",
      website: "Website",
      budget: "Budgetrahmen (€/Jahr)",
      budgetMin: "Min",
      budgetMax: "Max",
      about: "Über die Marke",
      disciplines: "Disziplinen von Interesse",
      logo: "Logo",
      logoUpload: "Logo hochladen",
    },
    offer: {
      empty: "Füge zuerst mindestens eine Sponsorenmarke hinzu.",
      submit: "Angebot veröffentlichen",
      sponsor: "Sponsor",
      select: "Auswählen",
      title: "Titel",
      titlePlaceholder: "Amateur-MMA-Kämpfer gesucht",
      description: "Beschreibung",
      minFollowers: "Min. Follower",
      minLevel: "Min. Niveau",
      region: "Region",
      regionPlaceholder: "Rhein-Main",
      value: "Wert des Angebots",
      valueHint: "Produktunterstützung, Geld, Ausrüstung…",
      valuePlaceholder: "Jährliches Ausrüstungspaket + 1.200 €",
      deadline: "Bewerbungsschluss",
      disciplines: "Disziplinen",
    },
    status: { close: "Schließen", reopen: "Wieder öffnen" },
    application: { accept: "Annehmen", reject: "Ablehnen" },
  },
  en: {
    sponsor: {
      submit: "Add sponsor",
      name: "Brand name",
      namePlaceholder: "Fairtex Deutschland",
      website: "Website",
      budget: "Budget range (€/year)",
      budgetMin: "Min",
      budgetMax: "Max",
      about: "About",
      disciplines: "Disciplines of interest",
      logo: "Logo",
      logoUpload: "Upload logo",
    },
    offer: {
      empty: "Add at least one sponsor brand first.",
      submit: "Publish offer",
      sponsor: "Sponsor",
      select: "Select",
      title: "Title",
      titlePlaceholder: "Looking for an amateur MMA athlete",
      description: "Description",
      minFollowers: "Min. followers",
      minLevel: "Min. level",
      region: "Region",
      regionPlaceholder: "Rhein-Main",
      value: "Value of the offer",
      valueHint: "Product support, cash, gear…",
      valuePlaceholder: "Annual gear package + 1.200 €",
      deadline: "Application deadline",
      disciplines: "Disciplines",
    },
    status: { close: "Close", reopen: "Reopen" },
    application: { accept: "Accept", reject: "Reject" },
  },
  tr: {
    sponsor: {
      submit: "Sponsoru Ekle",
      name: "Marka adı",
      namePlaceholder: "Fairtex Deutschland",
      website: "Web sitesi",
      budget: "Bütçe aralığı (€/yıl)",
      budgetMin: "Min",
      budgetMax: "Maks",
      about: "Hakkında",
      disciplines: "İlgilendiği disiplinler",
      logo: "Logo",
      logoUpload: "Logo yükle",
    },
    offer: {
      empty: "Önce en az bir sponsor markası ekle.",
      submit: "Teklifi Yayınla",
      sponsor: "Sponsor",
      select: "Seç",
      title: "Başlık",
      titlePlaceholder: "Amatör MMA sporcusu aranıyor",
      description: "Açıklama",
      minFollowers: "Min. takipçi",
      minLevel: "Min. seviye",
      region: "Bölge",
      regionPlaceholder: "Rhein-Main",
      value: "Teklifin değeri",
      valueHint: "Ürün desteği, nakit, ekipman…",
      valuePlaceholder: "Yıllık ekipman paketi + 1.200 €",
      deadline: "Son başvuru",
      disciplines: "Disiplinler",
    },
    status: { close: "Kapat", reopen: "Yeniden aç" },
    application: { accept: "Kabul", reject: "Ret" },
  },
};

/* ------------------------------------------------------------------ */
/* data-license-admin-forms.tsx                                        */
/* ------------------------------------------------------------------ */

type DataLicenseAdminCopy = {
  submit: string;
  decision: string;
  approve: string;
  reject: string;
  suspend: string;
  annualFee: string;
  annualFeeHint: string;
  rateLimit: string;
  rateLimitHint: string;
  reviewNote: string;
};

export const dataLicenseAdminCopy: Record<Locale, DataLicenseAdminCopy> = {
  de: {
    submit: "Entscheidung anwenden",
    decision: "Entscheidung",
    approve: "Genehmigen — Schlüssel erzeugen",
    reject: "Ablehnen",
    suspend: "Aussetzen",
    annualFee: "Jahresgebühr (€)",
    annualFeeHint: "§9.3: 500-2.000",
    rateLimit: "Anfragen/Minute",
    rateLimitHint: "10-6000",
    reviewNote: "Prüfnotiz",
  },
  en: {
    submit: "Apply decision",
    decision: "Decision",
    approve: "Approve — generate key",
    reject: "Reject",
    suspend: "Suspend",
    annualFee: "Annual fee (€)",
    annualFeeHint: "§9.3: 500-2.000",
    rateLimit: "Requests/minute",
    rateLimitHint: "10-6000",
    reviewNote: "Review note",
  },
  tr: {
    submit: "Kararı Uygula",
    decision: "Karar",
    approve: "Onayla — anahtar üret",
    reject: "Reddet",
    suspend: "Askıya al",
    annualFee: "Yıllık ücret (€)",
    annualFeeHint: "§9.3: 500-2.000",
    rateLimit: "İstek/dakika",
    rateLimitHint: "10-6000",
    reviewNote: "Değerlendirme notu",
  },
};
