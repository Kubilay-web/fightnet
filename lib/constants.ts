import type { Discipline, SkillLevel, BeltRank, Role, VerificationLevel } from "@prisma/client";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "FIGHTNET";
export const APP_TAGLINE = "DACH'ın bağımsız dövüş sporu platformu";

/** §4.5 — Antrenör başına maksimum kefalet sayısı */
export const MAX_VOUCHES_PER_COACH = 20;

/** §4.7 — Creator abonelik komisyonu */
export const PLATFORM_FEE_RATE = 0.15;

/** §4.4 — Ekipman pazarı komisyonu */
export const MARKETPLACE_FEE_RATE = 0.12;

/** §4.3 — Online koçluk komisyonu (Creator ile aynı oran) */
export const COACHING_FEE_RATE = 0.15;

/** §4.4 — PPV komisyonu; kalanı organizatöre aktarılır */
export const PPV_FEE_RATE = 0.2;

/**
 * §4.3 / §4.4 — Platform abonelikleri.
 * Fiyatlar dokümandaki aralıkların ortasından seçildi; §7.3 MRR bunlardan hesaplanır.
 */
export const PLATFORM_PLANS = {
  PREMIUM: {
    price: 4.99,
    label: "Premium",
    tagline: "Reklamsız FIGHTNET",
    features: [
      "Banner ve akış içi reklam gösterilmez",
      "Gelişmiş antrenman istatistikleri ve dışa aktarım",
      "Sparring aramada öncelikli görünürlük",
      "Profilde Premium rozeti",
    ],
  },
  COACH_TOOLS: {
    price: 14.99,
    label: "Antrenör Araçları",
    tagline: "Antrenörler için SaaS",
    features: [
      "Sınırsız öğrenci takibi ve antrenman planı ataması",
      "Kefalet kotası 20'den 50'ye çıkar",
      "Öğrenci gelişim panosu ve tutulma uyarıları",
      "Online koçluk ilanlarında komisyon indirimi",
      "Sertifika ve lisans son kullanma takibi",
    ],
  },
} as const;

/** §4.3 — Antrenör-Araç abonesi olan antrenörün kefalet kotası */
export const MAX_VOUCHES_COACH_TOOLS = 50;

/** §9.3 — Federasyon/organizatör veri lisansı yıllık ücret aralığı */
export const DATA_LICENSE_FEES = { min: 500, max: 2000, default: 1200 } as const;

/** §4.6 — Salon sözleşmesinde BGB §309 Nr. 9 üst sınırı */
export const MAX_CONTRACT_TERM_MONTHS = 24;

/** §11.2 — Otomatik yasak eşiği */
export const AUTO_BAN_SAFETY_REPORTS = 3;

export const DISCIPLINES: { value: Discipline; label: string; emoji: string; hasBelt: boolean }[] = [
  { value: "MMA", label: "MMA", emoji: "🥊", hasBelt: false },
  { value: "BOXING", label: "Boks", emoji: "🥊", hasBelt: false },
  { value: "BJJ", label: "Brezilya Jiu-Jitsu", emoji: "🥋", hasBelt: true },
  { value: "MUAY_THAI", label: "Muay Thai", emoji: "🦵", hasBelt: false },
  { value: "KICKBOXING", label: "Kick Boks", emoji: "🦵", hasBelt: false },
  { value: "WRESTLING", label: "Güreş", emoji: "🤼", hasBelt: false },
  { value: "JUDO", label: "Judo", emoji: "🥋", hasBelt: true },
  { value: "KARATE", label: "Karate", emoji: "🥋", hasBelt: true },
  { value: "SAMBO", label: "Sambo", emoji: "🤼", hasBelt: false },
  { value: "TAEKWONDO", label: "Taekwondo", emoji: "🦶", hasBelt: true },
  { value: "GRAPPLING", label: "Grappling", emoji: "🤼", hasBelt: false },
  { value: "KRAV_MAGA", label: "Krav Maga", emoji: "🛡️", hasBelt: false },
];

export const DISCIPLINE_LABEL: Record<Discipline, string> = DISCIPLINES.reduce(
  (acc, d) => ({ ...acc, [d.value]: d.label }),
  {} as Record<Discipline, string>,
);

export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "BEGINNER", label: "Başlangıç" },
  { value: "INTERMEDIATE", label: "Orta" },
  { value: "ADVANCED", label: "İleri" },
  { value: "SEMI_PRO", label: "Yarı Profesyonel" },
  { value: "PRO", label: "Profesyonel" },
];

export const SKILL_LABEL: Record<SkillLevel, string> = SKILL_LEVELS.reduce(
  (acc, d) => ({ ...acc, [d.value]: d.label }),
  {} as Record<SkillLevel, string>,
);

export const BELTS: { value: BeltRank; label: string; color: string }[] = [
  { value: "NONE", label: "Yok", color: "#6b7280" },
  { value: "WHITE", label: "Beyaz", color: "#f4f4f5" },
  { value: "YELLOW", label: "Sarı", color: "#facc15" },
  { value: "ORANGE", label: "Turuncu", color: "#fb923c" },
  { value: "GREEN", label: "Yeşil", color: "#22c55e" },
  { value: "BLUE", label: "Mavi", color: "#3b82f6" },
  { value: "PURPLE", label: "Mor", color: "#a855f7" },
  { value: "BROWN", label: "Kahverengi", color: "#92400e" },
  { value: "BLACK", label: "Siyah", color: "#18181b" },
  { value: "RED", label: "Kırmızı", color: "#ef4444" },
];

export const BELT_COLOR: Record<BeltRank, string> = BELTS.reduce(
  (acc, b) => ({ ...acc, [b.value]: b.color }),
  {} as Record<BeltRank, string>,
);

export const BELT_LABEL: Record<BeltRank, string> = BELTS.reduce(
  (acc, b) => ({ ...acc, [b.value]: b.label }),
  {} as Record<BeltRank, string>,
);

/** Kilo sınıfları — disipline göre */
export const WEIGHT_CLASSES: Record<string, string[]> = {
  MMA: [
    "Strawweight (52,2 kg)",
    "Flyweight (56,7 kg)",
    "Bantamweight (61,2 kg)",
    "Featherweight (65,8 kg)",
    "Lightweight (70,3 kg)",
    "Welterweight (77,1 kg)",
    "Middleweight (83,9 kg)",
    "Light Heavyweight (93,0 kg)",
    "Heavyweight (120,2 kg)",
  ],
  BOXING: [
    "Minimumweight (47,6 kg)",
    "Flyweight (50,8 kg)",
    "Bantamweight (53,5 kg)",
    "Featherweight (57,2 kg)",
    "Lightweight (61,2 kg)",
    "Welterweight (66,7 kg)",
    "Middleweight (72,6 kg)",
    "Light Heavyweight (79,4 kg)",
    "Cruiserweight (90,7 kg)",
    "Heavyweight (90,7+ kg)",
  ],
  BJJ: [
    "Galo (57,5 kg)",
    "Pluma (64 kg)",
    "Pena (70 kg)",
    "Leve (76 kg)",
    "Médio (82,3 kg)",
    "Meio-Pesado (88,3 kg)",
    "Pesado (94,3 kg)",
    "Super-Pesado (100,5 kg)",
    "Pesadíssimo (100,5+ kg)",
  ],
  DEFAULT: [
    "-57 kg",
    "-63 kg",
    "-69 kg",
    "-75 kg",
    "-81 kg",
    "-86 kg",
    "-91 kg",
    "+91 kg",
  ],
};

export function weightClassesFor(d: Discipline): string[] {
  return WEIGHT_CLASSES[d] ?? WEIGHT_CLASSES.DEFAULT;
}

export const ROLE_LABEL: Record<Role, string> = {
  USER: "Kullanıcı",
  ATHLETE: "Sporcu",
  COACH: "Antrenör",
  GYM_OWNER: "Salon İşletmecisi",
  ORGANIZER: "Organizatör",
  MODERATOR: "Moderatör",
  ADMIN: "Yönetici",
};

export const VERIFICATION_LABEL: Record<VerificationLevel, string> = {
  LEVEL_0: "Seviye 0 · E-posta",
  LEVEL_1: "Seviye 1 · Kimlik doğrulanmış",
  LEVEL_2: "Seviye 2 · Durum doğrulanmış",
};

export const VISIBILITY_LABEL: Record<string, string> = {
  PUBLIC: "Herkese Açık",
  COMMUNITY: "Topluluk",
  GYM: "Salon",
  COACH: "Antrenör",
  ORGANIZER: "Organizatör",
  FEDERATION: "Federasyon",
  PRIVATE: "Özel",
};

export const EVENT_TYPE_LABEL: Record<string, string> = {
  AMATEUR: "Amatör",
  PROFESSIONAL: "Profesyonel",
  TOURNAMENT: "Turnuva",
  SEMINAR: "Seminer",
  OPEN_MAT: "Open Mat",
  SMOKER: "Smoker",
};

export const FIGHT_METHOD_LABEL: Record<string, string> = {
  KO: "Nakavt (KO)",
  TKO: "Teknik Nakavt (TKO)",
  SUBMISSION: "Teslim (Submission)",
  DECISION_UNANIMOUS: "Oybirliği Kararı",
  DECISION_SPLIT: "Bölünmüş Karar",
  DECISION_MAJORITY: "Çoğunluk Kararı",
  DQ: "Diskalifiye",
  DRAW: "Berabere",
  NO_CONTEST: "Geçersiz",
  POINTS: "Sayı",
};

export const REPORT_REASON_LABEL: Record<string, string> = {
  SPAM: "Spam",
  HARASSMENT: "Taciz / Zorbalık",
  VIOLENCE: "Şiddet",
  SEXUAL_CONTENT: "Cinsel İçerik",
  DOPING: "Doping",
  WEIGHT_CUT: "Aşırı Kilo Düşürme",
  UNSAFE_SPARRING: "Güvensiz Sparring",
  FAKE_PROFILE: "Sahte Profil",
  MINOR_SAFETY: "Çocuk Güvenliği",
  COPYRIGHT: "Telif Hakkı",
  OTHER: "Diğer",
};

export const BOOKING_TYPE_LABEL: Record<string, string> = {
  TRIAL: "Deneme Antrenmanı",
  DROP_IN: "Drop-in",
  CLASS: "Ders",
  PRIVATE: "Özel Ders",
};

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylandı",
  ATTENDED: "Katıldı",
  NO_SHOW: "Gelmedi",
  CANCELLED: "İptal",
};

export const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
export const WEEKDAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export const AVAILABILITY_SLOTS = [
  { value: "WEEKDAY_MORNING", label: "Hafta içi sabah" },
  { value: "WEEKDAY_NOON", label: "Hafta içi öğlen" },
  { value: "WEEKDAY_EVENING", label: "Hafta içi akşam" },
  { value: "WEEKEND_MORNING", label: "Hafta sonu sabah" },
  { value: "WEEKEND_AFTERNOON", label: "Hafta sonu öğleden sonra" },
  { value: "WEEKEND_EVENING", label: "Hafta sonu akşam" },
];

export const SPARRING_INTENSITY = [
  { value: "LIGHT", label: "Hafif (teknik)", color: "emerald" },
  { value: "MEDIUM", label: "Orta", color: "amber" },
  { value: "HARD", label: "Sert", color: "red" },
];

export const AD_PLACEMENTS = [
  { value: "HOME_TOP", label: "Ana Sayfa Üst" },
  { value: "FEED_INLINE", label: "Akış İçi" },
  { value: "EVENT_SIDEBAR", label: "Etkinlik Kenar" },
  { value: "GYM_LIST", label: "Salon Listesi" },
];

/** §4.3 — Online koçluk biçimleri */
export const COACHING_FORMATS = [
  { value: "VIDEO_CALL", label: "Görüntülü seans", hint: "Canlı birebir görüşme" },
  { value: "ASYNC_REVIEW", label: "Video analizi", hint: "Sporcu video yükler, antrenör yorumlar" },
  { value: "TRAINING_PLAN", label: "Antrenman planı", hint: "Kişiye özel program hazırlama" },
  { value: "CHAT", label: "Mesajla takip", hint: "Süreli yazışma desteği" },
] as const;

export const COACHING_FORMAT_LABEL: Record<string, string> = COACHING_FORMATS.reduce(
  (acc, f) => ({ ...acc, [f.value]: f.label }),
  {} as Record<string, string>,
);

export const COACHING_STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Ödeme bekleniyor",
  ACCEPTED: "Ödendi — planlanacak",
  SCHEDULED: "Planlandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
  REFUNDED: "İade edildi",
};

export const PASSPORT_DOC_KINDS = [
  { value: "COACH_LICENSE", label: "Antrenör Lisansı" },
  { value: "COMPETITION_DIPLOMA", label: "Müsabaka Diploması" },
  { value: "TOURNAMENT_CERT", label: "Turnuva Katılım Belgesi" },
  { value: "BELT_CERT", label: "Kemer Sertifikası" },
  { value: "FEDERATION_LICENSE", label: "Federasyon Lisansı" },
];

/** §13 — Rhein-Main hedef bölgesi */
export const TARGET_CITIES = [
  "Wetzlar",
  "Frankfurt",
  "Mainz",
  "Wiesbaden",
  "Darmstadt",
  "Hanau",
  "Rüsselsheim",
];

/** §7.4 — Dur/Devam kapıları */
export const KPI_GATES = [
  { month: 4, green: "≥20 bekleme listesi", yellow: "10-19 bekleme", red: "<10 bekleme" },
  { month: 5, green: "≥5 LOI", yellow: "2-4 LOI", red: "<2 LOI" },
  { month: 6, green: "≥5 ödeyen + 50 MAVU", yellow: "3-4 ödeyen veya <30 MAVU", red: "<3 ödeyen" },
  { month: 9, green: "≥10 ödeyen + 200 MAVU", yellow: "5-9 ödeyen veya <100 MAVU", red: "<5 ödeyen" },
  { month: 12, green: "≥20 salon + 500 MAVU", yellow: "10-19 salon veya <300 MAVU", red: "<10 salon" },
];

export const PAGE_SIZE = 20;
export const FEED_PAGE_SIZE = 12;
