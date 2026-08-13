/**
 * §5.2 — Alan adı etiketlerinin üç dilli karşılıkları.
 *
 * `lib/constants.ts` içindeki Türkçe tablolar yerinde kalır: orası hem panel/
 * admin tarafının hem de tohumlama (seed) betiklerinin tek kaynağıdır ve
 * `value` listelerinin sırasını belirler. Burada yalnızca KAMUYA AÇIK yüzeyin
 * ihtiyaç duyduğu çeviriler tutulur; sabitlerden sadece değer listeleri
 * (DISCIPLINES, SKILL_LEVELS, BELTS …) alınır, hiçbir Türkçe metin alınmaz.
 *
 * Böylece bir enum'a yeni değer eklendiğinde `Record<Key, string>` tipleri
 * üç dilde birden derleme hatası verir — eksik çeviri sessizce üretime çıkamaz.
 */

import type { BeltRank, Discipline, Role, SkillLevel, VerificationLevel } from "@prisma/client";
import type { Locale } from "./config";
import {
  AVAILABILITY_SLOTS,
  BELTS,
  COACHING_FORMATS,
  DISCIPLINES,
  SKILL_LEVELS,
  SPARRING_INTENSITY,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Anahtar tipleri
// ---------------------------------------------------------------------------

export type VisibilityKey =
  | "PUBLIC"
  | "COMMUNITY"
  | "GYM"
  | "COACH"
  | "ORGANIZER"
  | "FEDERATION"
  | "PRIVATE";

export type EventTypeKey =
  | "AMATEUR"
  | "PROFESSIONAL"
  | "TOURNAMENT"
  | "SEMINAR"
  | "OPEN_MAT"
  | "SMOKER";

export type FightMethodKey =
  | "KO"
  | "TKO"
  | "SUBMISSION"
  | "DECISION_UNANIMOUS"
  | "DECISION_SPLIT"
  | "DECISION_MAJORITY"
  | "DQ"
  | "DRAW"
  | "NO_CONTEST"
  | "POINTS";

export type ReportReasonKey =
  | "SPAM"
  | "HARASSMENT"
  | "VIOLENCE"
  | "SEXUAL_CONTENT"
  | "DOPING"
  | "WEIGHT_CUT"
  | "UNSAFE_SPARRING"
  | "FAKE_PROFILE"
  | "MINOR_SAFETY"
  | "COPYRIGHT"
  | "OTHER";

export type BookingTypeKey = "TRIAL" | "DROP_IN" | "CLASS" | "PRIVATE";

export type BookingStatusKey = "PENDING" | "CONFIRMED" | "ATTENDED" | "NO_SHOW" | "CANCELLED";

export type CoachingFormatKey = (typeof COACHING_FORMATS)[number]["value"];

export type CoachingStatusKey =
  | "REQUESTED"
  | "ACCEPTED"
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type SparringIntensityKey = "LIGHT" | "MEDIUM" | "HARD";

export type AvailabilitySlotKey =
  | "WEEKDAY_MORNING"
  | "WEEKDAY_NOON"
  | "WEEKDAY_EVENING"
  | "WEEKEND_MORNING"
  | "WEEKEND_AFTERNOON"
  | "WEEKEND_EVENING";

// ---------------------------------------------------------------------------
// Disiplinler
// ---------------------------------------------------------------------------

export const DISCIPLINE_LABELS: Record<Locale, Record<Discipline, string>> = {
  de: {
    MMA: "MMA",
    BOXING: "Boxen",
    BJJ: "Brazilian Jiu-Jitsu",
    MUAY_THAI: "Muay Thai",
    KICKBOXING: "Kickboxen",
    WRESTLING: "Ringen",
    JUDO: "Judo",
    KARATE: "Karate",
    SAMBO: "Sambo",
    TAEKWONDO: "Taekwondo",
    GRAPPLING: "Grappling",
    KRAV_MAGA: "Krav Maga",
  },
  en: {
    MMA: "MMA",
    BOXING: "Boxing",
    BJJ: "Brazilian Jiu-Jitsu",
    MUAY_THAI: "Muay Thai",
    KICKBOXING: "Kickboxing",
    WRESTLING: "Wrestling",
    JUDO: "Judo",
    KARATE: "Karate",
    SAMBO: "Sambo",
    TAEKWONDO: "Taekwondo",
    GRAPPLING: "Grappling",
    KRAV_MAGA: "Krav Maga",
  },
  tr: {
    MMA: "MMA",
    BOXING: "Boks",
    BJJ: "Brezilya Jiu-Jitsu",
    MUAY_THAI: "Muay Thai",
    KICKBOXING: "Kick Boks",
    WRESTLING: "Güreş",
    JUDO: "Judo",
    KARATE: "Karate",
    SAMBO: "Sambo",
    TAEKWONDO: "Taekwondo",
    GRAPPLING: "Grappling",
    KRAV_MAGA: "Krav Maga",
  },
};

// ---------------------------------------------------------------------------
// Seviyeler
// ---------------------------------------------------------------------------

export const SKILL_LABELS: Record<Locale, Record<SkillLevel, string>> = {
  de: {
    BEGINNER: "Anfänger",
    INTERMEDIATE: "Mittelstufe",
    ADVANCED: "Fortgeschritten",
    SEMI_PRO: "Halbprofi",
    PRO: "Profi",
  },
  en: {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    SEMI_PRO: "Semi-professional",
    PRO: "Professional",
  },
  tr: {
    BEGINNER: "Başlangıç",
    INTERMEDIATE: "Orta",
    ADVANCED: "İleri",
    SEMI_PRO: "Yarı Profesyonel",
    PRO: "Profesyonel",
  },
};

// ---------------------------------------------------------------------------
// Kemerler
// ---------------------------------------------------------------------------

export const BELT_LABELS: Record<Locale, Record<BeltRank, string>> = {
  de: {
    NONE: "Kein Gürtel",
    WHITE: "Weiß",
    YELLOW: "Gelb",
    ORANGE: "Orange",
    GREEN: "Grün",
    BLUE: "Blau",
    PURPLE: "Lila",
    BROWN: "Braun",
    BLACK: "Schwarz",
    RED: "Rot",
  },
  en: {
    NONE: "No belt",
    WHITE: "White",
    YELLOW: "Yellow",
    ORANGE: "Orange",
    GREEN: "Green",
    BLUE: "Blue",
    PURPLE: "Purple",
    BROWN: "Brown",
    BLACK: "Black",
    RED: "Red",
  },
  tr: {
    NONE: "Yok",
    WHITE: "Beyaz",
    YELLOW: "Sarı",
    ORANGE: "Turuncu",
    GREEN: "Yeşil",
    BLUE: "Mavi",
    PURPLE: "Mor",
    BROWN: "Kahverengi",
    BLACK: "Siyah",
    RED: "Kırmızı",
  },
};

/** "Kemer" sözcüğünün kendisi — kemer rozetinin başlığı olarak kullanılır. */
export const BELT_WORD: Record<Locale, string> = {
  de: "Gürtel",
  en: "Belt",
  tr: "Kemer",
};

// ---------------------------------------------------------------------------
// Roller ve doğrulama seviyeleri
// ---------------------------------------------------------------------------

export const ROLE_LABELS: Record<Locale, Record<Role, string>> = {
  de: {
    USER: "Nutzer",
    ATHLETE: "Athlet",
    COACH: "Trainer",
    GYM_OWNER: "Gym-Betreiber",
    ORGANIZER: "Veranstalter",
    MODERATOR: "Moderator",
    ADMIN: "Administrator",
  },
  en: {
    USER: "User",
    ATHLETE: "Athlete",
    COACH: "Coach",
    GYM_OWNER: "Gym owner",
    ORGANIZER: "Organizer",
    MODERATOR: "Moderator",
    ADMIN: "Administrator",
  },
  tr: {
    USER: "Kullanıcı",
    ATHLETE: "Sporcu",
    COACH: "Antrenör",
    GYM_OWNER: "Salon İşletmecisi",
    ORGANIZER: "Organizatör",
    MODERATOR: "Moderatör",
    ADMIN: "Yönetici",
  },
};

export const VERIFICATION_LABELS: Record<Locale, Record<VerificationLevel, string>> = {
  de: {
    LEVEL_0: "Stufe 0 · E-Mail",
    LEVEL_1: "Stufe 1 · Identität verifiziert",
    LEVEL_2: "Stufe 2 · Status verifiziert",
  },
  en: {
    LEVEL_0: "Level 0 · Email",
    LEVEL_1: "Level 1 · Identity verified",
    LEVEL_2: "Level 2 · Status verified",
  },
  tr: {
    LEVEL_0: "Seviye 0 · E-posta",
    LEVEL_1: "Seviye 1 · Kimlik doğrulanmış",
    LEVEL_2: "Seviye 2 · Durum doğrulanmış",
  },
};

/** Rozet/sayaç için seviye numarası olmadan kısa biçim. */
export const VERIFICATION_SHORT_LABELS: Record<Locale, Record<VerificationLevel, string>> = {
  de: {
    LEVEL_0: "E-Mail",
    LEVEL_1: "Identität verifiziert",
    LEVEL_2: "Status verifiziert",
  },
  en: {
    LEVEL_0: "Email",
    LEVEL_1: "Identity verified",
    LEVEL_2: "Status verified",
  },
  tr: {
    LEVEL_0: "E-posta",
    LEVEL_1: "Kimlik doğrulanmış",
    LEVEL_2: "Durum doğrulanmış",
  },
};

// ---------------------------------------------------------------------------
// Görünürlük
// ---------------------------------------------------------------------------

export const VISIBILITY_LABELS: Record<Locale, Record<VisibilityKey, string>> = {
  de: {
    PUBLIC: "Öffentlich",
    COMMUNITY: "Community",
    GYM: "Gym",
    COACH: "Trainer",
    ORGANIZER: "Veranstalter",
    FEDERATION: "Verband",
    PRIVATE: "Privat",
  },
  en: {
    PUBLIC: "Public",
    COMMUNITY: "Community",
    GYM: "Gym",
    COACH: "Coach",
    ORGANIZER: "Organizer",
    FEDERATION: "Federation",
    PRIVATE: "Private",
  },
  tr: {
    PUBLIC: "Herkese Açık",
    COMMUNITY: "Topluluk",
    GYM: "Salon",
    COACH: "Antrenör",
    ORGANIZER: "Organizatör",
    FEDERATION: "Federasyon",
    PRIVATE: "Özel",
  },
};

// ---------------------------------------------------------------------------
// Etkinlik türleri
// ---------------------------------------------------------------------------

export const EVENT_TYPE_LABELS: Record<Locale, Record<EventTypeKey, string>> = {
  de: {
    AMATEUR: "Amateur",
    PROFESSIONAL: "Profi",
    TOURNAMENT: "Turnier",
    SEMINAR: "Seminar",
    OPEN_MAT: "Open Mat",
    SMOKER: "Smoker",
  },
  en: {
    AMATEUR: "Amateur",
    PROFESSIONAL: "Professional",
    TOURNAMENT: "Tournament",
    SEMINAR: "Seminar",
    OPEN_MAT: "Open Mat",
    SMOKER: "Smoker",
  },
  tr: {
    AMATEUR: "Amatör",
    PROFESSIONAL: "Profesyonel",
    TOURNAMENT: "Turnuva",
    SEMINAR: "Seminer",
    OPEN_MAT: "Open Mat",
    SMOKER: "Smoker",
  },
};

// ---------------------------------------------------------------------------
// Dövüş sonucu yöntemleri
// ---------------------------------------------------------------------------

export const FIGHT_METHOD_LABELS: Record<Locale, Record<FightMethodKey, string>> = {
  de: {
    KO: "K.o. (KO)",
    TKO: "Technischer K.o. (TKO)",
    SUBMISSION: "Aufgabe (Submission)",
    DECISION_UNANIMOUS: "Einstimmige Entscheidung",
    DECISION_SPLIT: "Geteilte Entscheidung",
    DECISION_MAJORITY: "Mehrheitsentscheidung",
    DQ: "Disqualifikation",
    DRAW: "Unentschieden",
    NO_CONTEST: "Ohne Wertung",
    POINTS: "Nach Punkten",
  },
  en: {
    KO: "Knockout (KO)",
    TKO: "Technical knockout (TKO)",
    SUBMISSION: "Submission",
    DECISION_UNANIMOUS: "Unanimous decision",
    DECISION_SPLIT: "Split decision",
    DECISION_MAJORITY: "Majority decision",
    DQ: "Disqualification",
    DRAW: "Draw",
    NO_CONTEST: "No contest",
    POINTS: "Points",
  },
  tr: {
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
  },
};

// ---------------------------------------------------------------------------
// Rapor sebepleri
// ---------------------------------------------------------------------------

export const REPORT_REASON_LABELS: Record<Locale, Record<ReportReasonKey, string>> = {
  de: {
    SPAM: "Spam",
    HARASSMENT: "Belästigung / Mobbing",
    VIOLENCE: "Gewalt",
    SEXUAL_CONTENT: "Sexuelle Inhalte",
    DOPING: "Doping",
    WEIGHT_CUT: "Extremes Gewichtmachen",
    UNSAFE_SPARRING: "Unsicheres Sparring",
    FAKE_PROFILE: "Fake-Profil",
    MINOR_SAFETY: "Jugendschutz",
    COPYRIGHT: "Urheberrecht",
    OTHER: "Sonstiges",
  },
  en: {
    SPAM: "Spam",
    HARASSMENT: "Harassment / bullying",
    VIOLENCE: "Violence",
    SEXUAL_CONTENT: "Sexual content",
    DOPING: "Doping",
    WEIGHT_CUT: "Extreme weight cutting",
    UNSAFE_SPARRING: "Unsafe sparring",
    FAKE_PROFILE: "Fake profile",
    MINOR_SAFETY: "Child safety",
    COPYRIGHT: "Copyright",
    OTHER: "Other",
  },
  tr: {
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
  },
};

// ---------------------------------------------------------------------------
// Rezervasyon türü ve durumu
// ---------------------------------------------------------------------------

export const BOOKING_TYPE_LABELS: Record<Locale, Record<BookingTypeKey, string>> = {
  de: {
    TRIAL: "Probetraining",
    DROP_IN: "Drop-in",
    CLASS: "Kurs",
    PRIVATE: "Privatstunde",
  },
  en: {
    TRIAL: "Trial session",
    DROP_IN: "Drop-in",
    CLASS: "Class",
    PRIVATE: "Private lesson",
  },
  tr: {
    TRIAL: "Deneme Antrenmanı",
    DROP_IN: "Drop-in",
    CLASS: "Ders",
    PRIVATE: "Özel Ders",
  },
};

export const BOOKING_STATUS_LABELS: Record<Locale, Record<BookingStatusKey, string>> = {
  de: {
    PENDING: "Ausstehend",
    CONFIRMED: "Bestätigt",
    ATTENDED: "Teilgenommen",
    NO_SHOW: "Nicht erschienen",
    CANCELLED: "Storniert",
  },
  en: {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    ATTENDED: "Attended",
    NO_SHOW: "No-show",
    CANCELLED: "Cancelled",
  },
  tr: {
    PENDING: "Beklemede",
    CONFIRMED: "Onaylandı",
    ATTENDED: "Katıldı",
    NO_SHOW: "Gelmedi",
    CANCELLED: "İptal",
  },
};

// ---------------------------------------------------------------------------
// Online koçluk biçimi ve durumu
// ---------------------------------------------------------------------------

export const COACHING_FORMAT_LABELS: Record<Locale, Record<CoachingFormatKey, string>> = {
  de: {
    VIDEO_CALL: "Videosession",
    ASYNC_REVIEW: "Videoanalyse",
    TRAINING_PLAN: "Trainingsplan",
    CHAT: "Betreuung per Nachricht",
  },
  en: {
    VIDEO_CALL: "Video session",
    ASYNC_REVIEW: "Video analysis",
    TRAINING_PLAN: "Training plan",
    CHAT: "Messaging support",
  },
  tr: {
    VIDEO_CALL: "Görüntülü seans",
    ASYNC_REVIEW: "Video analizi",
    TRAINING_PLAN: "Antrenman planı",
    CHAT: "Mesajla takip",
  },
};

export const COACHING_FORMAT_HINTS: Record<Locale, Record<CoachingFormatKey, string>> = {
  de: {
    VIDEO_CALL: "Live-Einzelgespräch",
    ASYNC_REVIEW: "Der Athlet lädt ein Video hoch, der Trainer kommentiert",
    TRAINING_PLAN: "Individuell erstelltes Programm",
    CHAT: "Schriftliche Betreuung auf Zeit",
  },
  en: {
    VIDEO_CALL: "Live one-to-one session",
    ASYNC_REVIEW: "The athlete uploads a video, the coach comments on it",
    TRAINING_PLAN: "A programme built for one person",
    CHAT: "Written support for a fixed period",
  },
  tr: {
    VIDEO_CALL: "Canlı birebir görüşme",
    ASYNC_REVIEW: "Sporcu video yükler, antrenör yorumlar",
    TRAINING_PLAN: "Kişiye özel program hazırlama",
    CHAT: "Süreli yazışma desteği",
  },
};

export const COACHING_STATUS_LABELS: Record<Locale, Record<CoachingStatusKey, string>> = {
  de: {
    REQUESTED: "Zahlung ausstehend",
    ACCEPTED: "Bezahlt — Termin wird vereinbart",
    SCHEDULED: "Terminiert",
    COMPLETED: "Abgeschlossen",
    CANCELLED: "Storniert",
    REFUNDED: "Erstattet",
  },
  en: {
    REQUESTED: "Awaiting payment",
    ACCEPTED: "Paid — to be scheduled",
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  },
  tr: {
    REQUESTED: "Ödeme bekleniyor",
    ACCEPTED: "Ödendi — planlanacak",
    SCHEDULED: "Planlandı",
    COMPLETED: "Tamamlandı",
    CANCELLED: "İptal",
    REFUNDED: "İade edildi",
  },
};

// ---------------------------------------------------------------------------
// Sparring yoğunluğu
// ---------------------------------------------------------------------------

export const SPARRING_INTENSITY_LABELS: Record<Locale, Record<SparringIntensityKey, string>> = {
  de: {
    LIGHT: "Leicht (technisch)",
    MEDIUM: "Mittel",
    HARD: "Hart",
  },
  en: {
    LIGHT: "Light (technical)",
    MEDIUM: "Medium",
    HARD: "Hard",
  },
  tr: {
    LIGHT: "Hafif (teknik)",
    MEDIUM: "Orta",
    HARD: "Sert",
  },
};

// ---------------------------------------------------------------------------
// Müsaitlik dilimleri
// ---------------------------------------------------------------------------

export const AVAILABILITY_SLOT_LABELS: Record<Locale, Record<AvailabilitySlotKey, string>> = {
  de: {
    WEEKDAY_MORNING: "Wochentags morgens",
    WEEKDAY_NOON: "Wochentags mittags",
    WEEKDAY_EVENING: "Wochentags abends",
    WEEKEND_MORNING: "Wochenende morgens",
    WEEKEND_AFTERNOON: "Wochenende nachmittags",
    WEEKEND_EVENING: "Wochenende abends",
  },
  en: {
    WEEKDAY_MORNING: "Weekday morning",
    WEEKDAY_NOON: "Weekday midday",
    WEEKDAY_EVENING: "Weekday evening",
    WEEKEND_MORNING: "Weekend morning",
    WEEKEND_AFTERNOON: "Weekend afternoon",
    WEEKEND_EVENING: "Weekend evening",
  },
  tr: {
    WEEKDAY_MORNING: "Hafta içi sabah",
    WEEKDAY_NOON: "Hafta içi öğlen",
    WEEKDAY_EVENING: "Hafta içi akşam",
    WEEKEND_MORNING: "Hafta sonu sabah",
    WEEKEND_AFTERNOON: "Hafta sonu öğleden sonra",
    WEEKEND_EVENING: "Hafta sonu akşam",
  },
};

// ---------------------------------------------------------------------------
// Hafta günleri — dizinler Pazartesi = 0 sırasını korur
// ---------------------------------------------------------------------------

export const WEEKDAY_LABELS: Record<Locale, string[]> = {
  de: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  tr: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
};

export const WEEKDAY_SHORT_LABELS: Record<Locale, string[]> = {
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  tr: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
};

// ---------------------------------------------------------------------------
// Tek giriş noktası
// ---------------------------------------------------------------------------

export interface Labels {
  discipline: Record<Discipline, string>;
  skill: Record<SkillLevel, string>;
  belt: Record<BeltRank, string>;
  beltWord: string;
  role: Record<Role, string>;
  verification: Record<VerificationLevel, string>;
  verificationShort: Record<VerificationLevel, string>;
  visibility: Record<VisibilityKey, string>;
  eventType: Record<EventTypeKey, string>;
  fightMethod: Record<FightMethodKey, string>;
  reportReason: Record<ReportReasonKey, string>;
  bookingType: Record<BookingTypeKey, string>;
  bookingStatus: Record<BookingStatusKey, string>;
  coachingFormat: Record<CoachingFormatKey, string>;
  coachingFormatHint: Record<CoachingFormatKey, string>;
  coachingStatus: Record<CoachingStatusKey, string>;
  sparringIntensity: Record<SparringIntensityKey, string>;
  availabilitySlot: Record<AvailabilitySlotKey, string>;
  weekdays: string[];
  weekdaysShort: string[];
}

/**
 * Aktif dilin bütün etiket tabloları. Sayfa başına tek çağrı yeterli:
 * `const L = labelsFor(locale)` sonra `L.discipline[d]`.
 */
export function labelsFor(locale: Locale): Labels {
  return {
    discipline: DISCIPLINE_LABELS[locale],
    skill: SKILL_LABELS[locale],
    belt: BELT_LABELS[locale],
    beltWord: BELT_WORD[locale],
    role: ROLE_LABELS[locale],
    verification: VERIFICATION_LABELS[locale],
    verificationShort: VERIFICATION_SHORT_LABELS[locale],
    visibility: VISIBILITY_LABELS[locale],
    eventType: EVENT_TYPE_LABELS[locale],
    fightMethod: FIGHT_METHOD_LABELS[locale],
    reportReason: REPORT_REASON_LABELS[locale],
    bookingType: BOOKING_TYPE_LABELS[locale],
    bookingStatus: BOOKING_STATUS_LABELS[locale],
    coachingFormat: COACHING_FORMAT_LABELS[locale],
    coachingFormatHint: COACHING_FORMAT_HINTS[locale],
    coachingStatus: COACHING_STATUS_LABELS[locale],
    sparringIntensity: SPARRING_INTENSITY_LABELS[locale],
    availabilitySlot: AVAILABILITY_SLOT_LABELS[locale],
    weekdays: WEEKDAY_LABELS[locale],
    weekdaysShort: WEEKDAY_SHORT_LABELS[locale],
  };
}

// ---------------------------------------------------------------------------
// Filtre/seçim listeleri — sıra `lib/constants.ts`'teki değer listelerinden
// gelir, metin buradan. Böylece sıralama tek yerde kalır.
// ---------------------------------------------------------------------------

export interface LabelOption {
  value: string;
  label: string;
}

export function disciplineOptions(locale: Locale): LabelOption[] {
  return DISCIPLINES.map((d) => ({ value: d.value, label: DISCIPLINE_LABELS[locale][d.value] }));
}

export function skillOptions(locale: Locale): LabelOption[] {
  return SKILL_LEVELS.map((s) => ({ value: s.value, label: SKILL_LABELS[locale][s.value] }));
}

export function beltOptions(locale: Locale): LabelOption[] {
  return BELTS.map((b) => ({ value: b.value, label: BELT_LABELS[locale][b.value] }));
}

export function coachingFormatOptions(locale: Locale): LabelOption[] {
  return COACHING_FORMATS.map((f) => ({
    value: f.value,
    label: COACHING_FORMAT_LABELS[locale][f.value],
  }));
}

export function sparringIntensityOptions(locale: Locale): LabelOption[] {
  return SPARRING_INTENSITY.map((i) => ({
    value: i.value,
    label: SPARRING_INTENSITY_LABELS[locale][i.value as SparringIntensityKey],
  }));
}

export function availabilitySlotOptions(locale: Locale): LabelOption[] {
  return AVAILABILITY_SLOTS.map((s) => ({
    value: s.value,
    label: AVAILABILITY_SLOT_LABELS[locale][s.value as AvailabilitySlotKey],
  }));
}

export function eventTypeOptions(locale: Locale): LabelOption[] {
  return (Object.keys(EVENT_TYPE_LABELS.tr) as EventTypeKey[]).map((value) => ({
    value,
    label: EVENT_TYPE_LABELS[locale][value],
  }));
}

export function reportReasonOptions(locale: Locale): LabelOption[] {
  return (Object.keys(REPORT_REASON_LABELS.tr) as ReportReasonKey[]).map((value) => ({
    value,
    label: REPORT_REASON_LABELS[locale][value],
  }));
}
