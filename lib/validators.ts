import { z } from "zod";

const DISCIPLINES = [
  "MMA", "BOXING", "BJJ", "MUAY_THAI", "KICKBOXING", "WRESTLING",
  "JUDO", "KARATE", "SAMBO", "TAEKWONDO", "GRAPPLING", "KRAV_MAGA",
] as const;

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "SEMI_PRO", "PRO"] as const;

const BELTS = [
  "WHITE", "BLUE", "PURPLE", "BROWN", "BLACK",
  "YELLOW", "ORANGE", "GREEN", "RED", "NONE",
] as const;

const VISIBILITIES = [
  "PUBLIC", "COMMUNITY", "GYM", "COACH", "ORGANIZER", "FEDERATION", "PRIVATE",
] as const;

export const disciplineEnum = z.enum(DISCIPLINES);
export const levelEnum = z.enum(LEVELS);
export const beltEnum = z.enum(BELTS);
export const visibilityEnum = z.enum(VISIBILITIES);

// ---------------------------------------------------------------------------
// Kimlik
// ---------------------------------------------------------------------------

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "En az 2 karakter").max(60),
    username: z
      .string()
      .trim()
      .min(3, "En az 3 karakter")
      .max(24)
      .regex(/^[a-z0-9_.]+$/, "Sadece küçük harf, rakam, _ ve . kullanın"),
    email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin"),
    password: z
      .string()
      .min(8, "En az 8 karakter")
      .regex(/[A-Za-z]/, "En az bir harf içermeli")
      .regex(/[0-9]/, "En az bir rakam içermeli"),
    birthDate: z.string().optional(),
    city: z.string().trim().max(60).optional(),
    betaCode: z.string().trim().toUpperCase().max(24).optional().or(z.literal("")),
    role: z.enum(["USER", "ATHLETE", "COACH", "GYM_OWNER", "ORGANIZER"]).default("USER"),
    guardianEmail: z.string().email().optional().or(z.literal("")),
    acceptTerms: z.coerce.boolean().refine((v) => v === true, { message: "Şartları kabul etmelisiniz" }),
  })
  .refine(
    (d) => {
      if (!d.birthDate) return true;
      const years = (Date.now() - new Date(d.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000);
      // §11.1 — 18 yaş altı için ebeveyn e-postası zorunlu
      return years >= 18 ? true : !!d.guardianEmail;
    },
    { message: "18 yaş altı üyeler için ebeveyn e-postası zorunludur", path: ["guardianEmail"] },
  );

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const passwordChangeSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(8, "En az 8 karakter").regex(/[0-9]/, "En az bir rakam içermeli"),
});

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  bio: z.string().trim().max(600).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  country: z.string().trim().length(2).default("DE"),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  nationality: z.string().trim().max(60).optional().or(z.literal("")),
  heightCm: z.coerce.number().int().min(100).max(250).optional().nullable(),
  reachCm: z.coerce.number().int().min(100).max(260).optional().nullable(),
  stance: z.enum(["ORTHODOX", "SOUTHPAW", "SWITCH"]).optional().or(z.literal("")),
  website: z.string().url("Geçerli bir URL girin").optional().or(z.literal("")),
  instagram: z.string().trim().max(60).optional().or(z.literal("")),
  youtube: z.string().trim().max(60).optional().or(z.literal("")),
  visibility: visibilityEnum.default("PUBLIC"),
});

export const sportProfileSchema = z.object({
  discipline: disciplineEnum,
  isPrimary: z.coerce.boolean().default(false),
  level: levelEnum.default("BEGINNER"),
  belt: beltEnum.default("NONE"),
  stripes: z.coerce.number().int().min(0).max(4).default(0),
  weightClass: z.string().max(60).optional().or(z.literal("")),
  weightKg: z.coerce.number().min(30).max(200).optional().nullable(),
  yearsActive: z.coerce.number().int().min(0).max(60).default(0),
  isPro: z.coerce.boolean().default(false),
  wins: z.coerce.number().int().min(0).max(999).default(0),
  losses: z.coerce.number().int().min(0).max(999).default(0),
  draws: z.coerce.number().int().min(0).max(999).default(0),
  koWins: z.coerce.number().int().min(0).max(999).default(0),
  subWins: z.coerce.number().int().min(0).max(999).default(0),
  visibility: visibilityEnum.default("PUBLIC"),
});

// ---------------------------------------------------------------------------
// Antrenman
// ---------------------------------------------------------------------------

export const trainingSchema = z.object({
  date: z.string().min(1, "Tarih gerekli"),
  discipline: disciplineEnum,
  durationMin: z.coerce.number().int().min(5).max(600).default(60),
  intensity: z.coerce.number().int().min(1).max(5).default(3),
  type: z.string().max(40).optional().or(z.literal("")),
  gymId: z.string().optional().or(z.literal("")),
  rounds: z.coerce.number().int().min(0).max(100).optional().nullable(),
  techniques: z.array(z.string().max(60)).max(20).default([]),
  notes: z.string().max(1000).optional().or(z.literal("")),
  mood: z.coerce.number().int().min(1).max(5).optional().nullable(),
  weightKg: z.coerce.number().min(30).max(200).optional().nullable(),
  visibility: visibilityEnum.default("PRIVATE"),
  clientId: z.string().max(64).optional(),
});

// ---------------------------------------------------------------------------
// Sparring
// ---------------------------------------------------------------------------

export const sparringListingSchema = z.object({
  discipline: disciplineEnum,
  level: levelEnum,
  weightKg: z.coerce.number().min(30).max(200).optional().nullable(),
  weightTolerance: z.coerce.number().min(1).max(20).default(5),
  city: z.string().trim().min(2, "Şehir gerekli").max(60),
  postalCode: z.string().max(10).optional().or(z.literal("")),
  radiusKm: z.coerce.number().int().min(1).max(200).default(25),
  gymId: z.string().optional().or(z.literal("")),
  availability: z.array(z.string()).max(10).default([]),
  intensity: z.enum(["LIGHT", "MEDIUM", "HARD"]).default("MEDIUM"),
  genderPref: z.enum(["ANY", "MALE", "FEMALE"]).default("ANY"),
  minAge: z.coerce.number().int().min(14).max(80).optional().nullable(),
  maxAge: z.coerce.number().int().min(14).max(80).optional().nullable(),
  note: z.string().max(500).optional().or(z.literal("")),
});

export const sparringRequestSchema = z.object({
  listingId: z.string().min(1),
  message: z.string().max(500).optional().or(z.literal("")),
  proposedDate: z.string().optional().or(z.literal("")),
  waiverAccepted: z.coerce.boolean().refine((v) => v === true, {
    message: "Sparring sorumluluk feragatnamesini onaylamalısınız",
  }),
});

export const sparringReviewSchema = z.object({
  requestId: z.string().min(1),
  safety: z.coerce.number().int().min(1).max(5),
  technique: z.coerce.number().int().min(1).max(5),
  punctuality: z.coerce.number().int().min(1).max(5),
  wouldRepeat: z.coerce.boolean().default(true),
  comment: z.string().max(500).optional().or(z.literal("")),
  flagUnsafe: z.coerce.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Salon
// ---------------------------------------------------------------------------

export const gymSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().max(2000).optional().or(z.literal("")),
  disciplines: z.array(disciplineEnum).min(1, "En az bir disiplin seçin"),
  street: z.string().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Şehir gerekli").max(60),
  postalCode: z.string().max(10).optional().or(z.literal("")),
  country: z.string().length(2).default("DE"),
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  amenities: z.array(z.string().max(40)).max(20).default([]),
  trialEnabled: z.coerce.boolean().default(true),
  dropInPrice: z.coerce.number().min(0).max(500).optional().nullable(),
});

export const gymClassSchema = z.object({
  name: z.string().trim().min(2).max(60),
  discipline: disciplineEnum,
  level: levelEnum.default("BEGINNER"),
  description: z.string().max(500).optional().or(z.literal("")),
  coachName: z.string().max(60).optional().or(z.literal("")),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "SS:DD formatında girin"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "SS:DD formatında girin"),
  capacity: z.coerce.number().int().min(1).max(200).default(20),
  price: z.coerce.number().min(0).max(500).default(0),
  isTrialOk: z.coerce.boolean().default(true),
});

export const bookingSchema = z.object({
  gymId: z.string().min(1),
  classId: z.string().optional().or(z.literal("")),
  type: z.enum(["TRIAL", "DROP_IN", "CLASS", "PRIVATE"]).default("TRIAL"),
  date: z.string().min(1, "Tarih gerekli"),
  experience: z.string().max(300).optional().or(z.literal("")),
  goals: z.string().max(300).optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Etkinlik & Dövüş
// ---------------------------------------------------------------------------

export const eventSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().max(4000).optional().or(z.literal("")),
  type: z.enum(["AMATEUR", "PROFESSIONAL", "TOURNAMENT", "SEMINAR", "OPEN_MAT", "SMOKER"]).default("AMATEUR"),
  disciplines: z.array(disciplineEnum).min(1),
  startsAt: z.string().min(1, "Başlangıç zamanı gerekli"),
  endsAt: z.string().optional().or(z.literal("")),
  doorsAt: z.string().optional().or(z.literal("")),
  venueName: z.string().max(120).optional().or(z.literal("")),
  street: z.string().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  postalCode: z.string().max(10).optional().or(z.literal("")),
  country: z.string().length(2).default("DE"),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  ticketPrice: z.coerce.number().min(0).max(10000).optional().nullable(),
  capacity: z.coerce.number().int().min(0).max(200000).optional().nullable(),
  streamUrl: z.string().url().optional().or(z.literal("")),
  isPPV: z.coerce.boolean().default(false),
  ppvPrice: z.coerce.number().min(0).max(500).optional().nullable(),
  registrationOpen: z.coerce.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "LIVE", "FINISHED", "CANCELLED"]).default("DRAFT"),
});

export const fightSchema = z.object({
  eventId: z.string().min(1),
  order: z.coerce.number().int().min(0).max(50).default(0),
  isMainEvent: z.coerce.boolean().default(false),
  isTitleFight: z.coerce.boolean().default(false),
  discipline: disciplineEnum,
  weightClass: z.string().max(60).optional().or(z.literal("")),
  rounds: z.coerce.number().int().min(1).max(12).default(3),
  roundMinutes: z.coerce.number().int().min(1).max(10).default(3),
  redId: z.string().optional().or(z.literal("")),
  redName: z.string().trim().min(2).max(80),
  redRecord: z.string().max(30).optional().or(z.literal("")),
  blueId: z.string().optional().or(z.literal("")),
  blueName: z.string().trim().min(2).max(80),
  blueRecord: z.string().max(30).optional().or(z.literal("")),
});

export const fightResultSchema = z.object({
  fightId: z.string().min(1),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED", "CANCELLED", "NO_CONTEST"]),
  winnerCorner: z.enum(["RED", "BLUE"]).optional().or(z.literal("")),
  method: z
    .enum([
      "KO", "TKO", "SUBMISSION", "DECISION_UNANIMOUS", "DECISION_SPLIT",
      "DECISION_MAJORITY", "DQ", "DRAW", "NO_CONTEST", "POINTS",
    ])
    .optional()
    .or(z.literal("")),
  endRound: z.coerce.number().int().min(1).max(12).optional().nullable(),
  endTime: z.string().max(10).optional().or(z.literal("")),
  currentRound: z.coerce.number().int().min(0).max(12).default(0),
  notes: z.string().max(500).optional().or(z.literal("")),
});

/** §4.4 — Müsabaka kayıt aracılığı */
export const eventRegistrationSchema = z.object({
  discipline: disciplineEnum,
  weightClass: z.string().max(60).optional().or(z.literal("")),
  weightKg: z.coerce.number().min(30).max(200).optional().nullable(),
  coachName: z.string().max(60).optional().or(z.literal("")),
  gymName: z.string().max(80).optional().or(z.literal("")),
  emergency: z.string().trim().min(5, "Acil durum iletişimi zorunlu").max(120),
  medicalConfirmed: z.coerce.boolean().refine((v) => v === true, {
    message: "Sağlık beyanını onaylamalısınız",
  }),
  waiverAccepted: z.coerce.boolean().refine((v) => v === true, {
    message: "Sorumluluk feragatnamesini onaylamalısınız",
  }),
  note: z.string().max(500).optional().or(z.literal("")),
});

export const registrationReviewSchema = z.object({
  registrationId: z.string().min(1),
  status: z.enum(["ACCEPTED", "WAITLISTED", "REJECTED"]),
  reviewNote: z.string().max(500).optional().or(z.literal("")),
});

export const liveCommentSchema = z.object({
  eventId: z.string().min(1),
  fightId: z.string().optional().or(z.literal("")),
  body: z.string().trim().min(1, "Yorum boş olamaz").max(500),
  round: z.coerce.number().int().min(0).max(12).optional().nullable(),
  kind: z.enum(["COMMENT", "ROUND_START", "ROUND_END", "RESULT", "KNOCKDOWN"]).default("COMMENT"),
});

// ---------------------------------------------------------------------------
// İçerik
// ---------------------------------------------------------------------------

export const postSchema = z.object({
  type: z.enum(["VIDEO", "IMAGE", "TEXT"]).default("TEXT"),
  body: z.string().max(2000).optional().or(z.literal("")),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  mediaId: z.string().optional().or(z.literal("")),
  thumbUrl: z.string().url().optional().or(z.literal("")),
  durationSec: z.coerce.number().int().min(0).max(3600).optional().nullable(),
  discipline: disciplineEnum.optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).max(10).default([]),
  visibility: visibilityEnum.default("PUBLIC"),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Yorum boş olamaz").max(1000),
  parentId: z.string().optional().or(z.literal("")),
});

export const threadSchema = z.object({
  categoryId: z.string().min(1, "Kategori seçin"),
  title: z.string().trim().min(5, "En az 5 karakter").max(140),
  body: z.string().trim().min(10, "En az 10 karakter").max(8000),
  tags: z.array(z.string().max(30)).max(6).default([]),
  linkedUserId: z.string().optional().or(z.literal("")),
  linkedEventId: z.string().optional().or(z.literal("")),
});

export const reportSchema = z.object({
  targetType: z.enum(["POST", "COMMENT", "USER", "THREAD", "FORUM_POST", "MESSAGE", "GYM", "EVENT"]),
  targetId: z.string().min(1),
  reportedUserId: z.string().optional().or(z.literal("")),
  reason: z.enum([
    "SPAM", "HARASSMENT", "VIOLENCE", "SEXUAL_CONTENT", "DOPING", "WEIGHT_CUT",
    "UNSAFE_SPARRING", "FAKE_PROFILE", "MINOR_SAFETY", "COPYRIGHT", "OTHER",
  ]),
  description: z.string().max(1000).optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Doğrulama / Passport
// ---------------------------------------------------------------------------

export const verificationSchema = z.object({
  targetLevel: z.enum(["LEVEL_1", "LEVEL_2"]),
  claimedRole: z.enum(["ATHLETE", "COACH", "GYM_OWNER", "ORGANIZER"]).optional().or(z.literal("")),
  idDocUrl: z.string().url().optional().or(z.literal("")),
  idDocId: z.string().optional().or(z.literal("")),
  selfieUrl: z.string().url().optional().or(z.literal("")),
  selfieId: z.string().optional().or(z.literal("")),
  proofUrls: z.array(z.string().url()).max(5).default([]),
  proofIds: z.array(z.string()).max(5).default([]),
  note: z.string().max(1000).optional().or(z.literal("")),
});

export const passportDocSchema = z.object({
  kind: z.enum([
    "COACH_LICENSE", "COMPETITION_DIPLOMA", "TOURNAMENT_CERT", "BELT_CERT", "FEDERATION_LICENSE",
  ]),
  title: z.string().trim().min(2).max(120),
  issuer: z.string().max(120).optional().or(z.literal("")),
  issuedAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  fileUrl: z.string().url("Belge yükleyin"),
  fileId: z.string().optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Creator / Sponsor / Pazar
// ---------------------------------------------------------------------------

export const creatorTierSchema = z.object({
  tier: z.enum(["BRONZE", "SILVER", "GOLD"]),
  name: z.string().trim().min(2).max(40),
  price: z.coerce.number().min(1).max(500),
  description: z.string().max(500).optional().or(z.literal("")),
  perks: z.array(z.string().max(120)).max(10).default([]),
});

export const creatorPostSchema = z.object({
  title: z.string().trim().min(2).max(140),
  body: z.string().max(5000).optional().or(z.literal("")),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  mediaId: z.string().optional().or(z.literal("")),
  thumbUrl: z.string().url().optional().or(z.literal("")),
  type: z.enum(["VIDEO", "IMAGE", "TEXT"]).default("TEXT"),
  minTier: z.enum(["BRONZE", "SILVER", "GOLD"]).default("BRONZE"),
});

export const productSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(3000),
  category: z.string().min(2).max(60),
  discipline: disciplineEnum.optional().or(z.literal("")),
  condition: z.enum(["NEW", "LIKE_NEW", "USED"]).default("NEW"),
  price: z.coerce.number().min(0).max(100000),
  stock: z.coerce.number().int().min(0).max(9999).default(1),
  city: z.string().max(60).optional().or(z.literal("")),
  shipping: z.coerce.boolean().default(true),
  images: z.array(z.object({ url: z.string().url(), publicId: z.string().optional() })).max(8).default([]),
});

export const sponsorOfferSchema = z.object({
  sponsorId: z.string().min(1),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(3000),
  disciplines: z.array(disciplineEnum).default([]),
  minFollowers: z.coerce.number().int().min(0).max(1000000).default(0),
  minLevel: levelEnum.default("BEGINNER"),
  region: z.string().max(60).optional().or(z.literal("")),
  value: z.string().max(120).optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Pazarlama / Admin
// ---------------------------------------------------------------------------

export const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin"),
  name: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  role: z.enum(["ATHLETE", "COACH", "GYM_OWNER", "FAN", "ORGANIZER"]).default("ATHLETE"),
  gymName: z.string().max(80).optional().or(z.literal("")),
  discipline: disciplineEnum.optional().or(z.literal("")),
  message: z.string().max(500).optional().or(z.literal("")),
  source: z.string().max(60).optional().or(z.literal("")),
});

export const betaCodeSchema = z.object({
  code: z.string().trim().toUpperCase().min(4).max(24).optional().or(z.literal("")),
  label: z.string().max(80).optional().or(z.literal("")),
  maxUses: z.coerce.number().int().min(1).max(10000).default(1),
  isFounder: z.coerce.boolean().default(false),
  grantsRole: z.enum(["USER", "ATHLETE", "COACH", "GYM_OWNER", "ORGANIZER"]).optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
});

export const adSchema = z.object({
  name: z.string().trim().min(2).max(80),
  advertiser: z.string().trim().min(2).max(80),
  imageUrl: z.string().url("Görsel yükleyin"),
  imageId: z.string().optional().or(z.literal("")),
  linkUrl: z.string().url("Geçerli bir bağlantı girin"),
  placement: z.enum(["HOME_TOP", "FEED_INLINE", "EVENT_SIDEBAR", "GYM_LIST"]),
  disciplines: z.array(disciplineEnum).default([]),
  cities: z.array(z.string().max(60)).max(30).default([]),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  isActive: z.coerce.boolean().default(true),
});

export const spotlightSchema = z.object({
  userId: z.string().min(1, "Sporcu seçin"),
  date: z.string().min(1),
  headline: z.string().max(120).optional().or(z.literal("")),
  blurb: z.string().max(500).optional().or(z.literal("")),
});

export const adminUserSchema = z.object({
  role: z.enum(["USER", "ATHLETE", "COACH", "GYM_OWNER", "ORGANIZER", "MODERATOR", "ADMIN"]),
  verification: z.enum(["LEVEL_0", "LEVEL_1", "LEVEL_2"]),
  isActive: z.coerce.boolean(),
  isBanned: z.coerce.boolean(),
  isFounder: z.coerce.boolean(),
  banReason: z.string().max(300).optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TrainingInput = z.infer<typeof trainingSchema>;
export type GymInput = z.infer<typeof gymSchema>;
export type EventInput = z.infer<typeof eventSchema>;
