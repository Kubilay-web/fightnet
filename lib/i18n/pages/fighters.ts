import type { Locale } from "@/lib/i18n/config";

/**
 * `/dovuscular` liste sayfası ve `/dovuscular/[slug]` profil sayfası.
 *
 * Disiplin/seviye/kemer gibi alan adı etiketleri burada TEKRARLANMAZ —
 * onların tek kaynağı `lib/i18n/labels.ts`. Burada yalnızca sayfaya özgü
 * başlıklar, açıklamalar ve boş durum metinleri var.
 */
type Copy = {
  list: {
    meta: { title: string; description: string };
    title: string;
    subtitle: string;
    filterDiscipline: string;
    filterLevel: string;
    filterVerification: string;
    verifiedIdentity: string;
    verifiedStatus: string;
    filterSort: string;
    sortPopular: string;
    sortNew: string;
    sortWins: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    /** {count} → bulunan dövüşçü sayısı */
    resultCount: string;
  };
  detail: {
    notFound: string;
    /** {name} {discipline} {record} */
    metaDescription: string;
    fallbackDiscipline: string;
    editProfile: string;
    support: string;
    statFollowers: string;
    statStreak: string;
    statTrainings: string;
    statVerification: string;
    /** {days} → gün sayısı */
    streakValue: string;
    ageSuffix: string;
    about: string;
    disciplines: string;
    noDisciplines: string;
    professional: string;
    /** {years} → yıl sayısı */
    yearsActive: string;
    primary: string;
    beltSuffix: string;
    /** {stripes} → bant sayısı */
    stripes: string;
    recordWins: string;
    recordLosses: string;
    recordDraws: string;
    recordKo: string;
    weightClass: string;
    posts: string;
    noPostsTitle: string;
    noPostsBody: string;
    gyms: string;
    coaching: string;
    coachFallbackTitle: string;
    headCoach: string;
    /** {count} → kefil olunan sporcu sayısı */
    vouchedForLead: string;
    vouchedForTail: string;
    vouchingCoaches: string;
    links: string;
    website: string;
    memberSince: string;
    longestStreak: string;
  };
};

export const fightersCopy: Record<Locale, Copy> = {
  de: {
    list: {
      meta: {
        title: "Kämpfer",
        description:
          "Entdecke verifizierte Kämpferprofile im DACH-Raum. Filtere nach Disziplin, Niveau, Stadt und Gewichtsklasse.",
      },
      title: "Kämpfer",
      subtitle: "Vom Amateur bis zum Profi — verifizierte Profile",
      filterDiscipline: "Disziplin",
      filterLevel: "Niveau",
      filterVerification: "Verifizierung",
      verifiedIdentity: "Identität verifiziert",
      verifiedStatus: "Status verifiziert",
      filterSort: "Sortierung",
      sortPopular: "Am beliebtesten",
      sortNew: "Neueste",
      sortWins: "Meiste Siege",
      searchPlaceholder: "Name oder Benutzername suchen…",
      emptyTitle: "Keine Kämpfer gefunden",
      emptyBody: "Ändere die Filter und versuche es erneut — oder melde dich als Erster an.",
      resultCount: "{count} Kämpfer gefunden",
    },
    detail: {
      notFound: "Kämpfer nicht gefunden",
      metaDescription: "{name} — {discipline} {record}. Sieh dir das FIGHTNET-Profil an.",
      fallbackDiscipline: "Kämpfer",
      editProfile: "Profil bearbeiten",
      support: "Unterstützen",
      statFollowers: "Follower",
      statStreak: "Streak",
      statTrainings: "Trainings",
      statVerification: "Verifizierung",
      streakValue: "{days} Tage",
      ageSuffix: "Jahre",
      about: "Über",
      disciplines: "Disziplinen",
      noDisciplines: "Noch keine Disziplin hinterlegt.",
      professional: "Profi",
      yearsActive: "{years} Jahre",
      primary: "Haupt",
      beltSuffix: "Gürtel",
      stripes: "{stripes} Streifen",
      recordWins: "S",
      recordLosses: "N",
      recordDraws: "U",
      recordKo: "KO",
      weightClass: "Gewichtsklasse",
      posts: "Beiträge",
      noPostsTitle: "Noch keine Beiträge",
      noPostsBody: "Dieser Athlet hat noch nichts geteilt.",
      gyms: "Gyms",
      coaching: "Trainertätigkeit",
      coachFallbackTitle: "Trainer",
      headCoach: "Cheftrainer",
      vouchedForLead: "Dieser Trainer hat für",
      vouchedForTail: "Athleten gebürgt.",
      vouchingCoaches: "Bürgende Trainer",
      links: "Links",
      website: "Website",
      memberSince: "FIGHTNET-Mitglied seit",
      longestStreak: "Längster Streak:",
    },
  },

  en: {
    list: {
      meta: {
        title: "Fighters",
        description:
          "Discover verified fighter profiles across the DACH region. Filter by discipline, level, city and weight class.",
      },
      title: "Fighters",
      subtitle: "From amateur to professional — verified profiles",
      filterDiscipline: "Discipline",
      filterLevel: "Level",
      filterVerification: "Verification",
      verifiedIdentity: "Identity verified",
      verifiedStatus: "Status verified",
      filterSort: "Sorting",
      sortPopular: "Most popular",
      sortNew: "Newest",
      sortWins: "Most wins",
      searchPlaceholder: "Search by name or username…",
      emptyTitle: "No fighters found",
      emptyBody: "Change the filters and try again, or be the first to sign up.",
      resultCount: "{count} fighters found",
    },
    detail: {
      notFound: "Fighter not found",
      metaDescription: "{name} — {discipline} {record}. See the FIGHTNET profile.",
      fallbackDiscipline: "fighter",
      editProfile: "Edit profile",
      support: "Support",
      statFollowers: "Followers",
      statStreak: "Streak",
      statTrainings: "Trainings",
      statVerification: "Verification",
      streakValue: "{days} days",
      ageSuffix: "years old",
      about: "About",
      disciplines: "Disciplines",
      noDisciplines: "No discipline added yet.",
      professional: "Professional",
      yearsActive: "{years} years",
      primary: "Main",
      beltSuffix: "belt",
      stripes: "{stripes} stripes",
      recordWins: "W",
      recordLosses: "L",
      recordDraws: "D",
      recordKo: "KO",
      weightClass: "Weight class",
      posts: "Posts",
      noPostsTitle: "No posts yet",
      noPostsBody: "This athlete has not shared anything yet.",
      gyms: "Gyms",
      coaching: "Coaching",
      coachFallbackTitle: "Coach",
      headCoach: "Head coach",
      vouchedForLead: "This coach has vouched for",
      vouchedForTail: "athletes.",
      vouchingCoaches: "Vouching coaches",
      links: "Links",
      website: "Website",
      memberSince: "FIGHTNET member since",
      longestStreak: "Longest streak:",
    },
  },

  tr: {
    list: {
      meta: {
        title: "Dövüşçüler",
        description:
          "DACH bölgesindeki doğrulanmış dövüşçü profillerini keşfet. Disiplin, seviye, şehir ve kilo sınıfına göre filtrele.",
      },
      title: "Dövüşçüler",
      subtitle: "Amatörden profesyonele — doğrulanmış profiller",
      filterDiscipline: "Disiplin",
      filterLevel: "Seviye",
      filterVerification: "Doğrulama",
      verifiedIdentity: "Kimlik doğrulanmış",
      verifiedStatus: "Durum doğrulanmış",
      filterSort: "Sıralama",
      sortPopular: "En popüler",
      sortNew: "En yeni",
      sortWins: "En çok galibiyet",
      searchPlaceholder: "İsim veya kullanıcı adı ara…",
      emptyTitle: "Dövüşçü bulunamadı",
      emptyBody: "Filtreleri değiştirerek tekrar dene ya da ilk sen kaydol.",
      resultCount: "{count} dövüşçü bulundu",
    },
    detail: {
      notFound: "Dövüşçü bulunamadı",
      metaDescription: "{name} — {discipline} {record}. FIGHTNET profilini gör.",
      fallbackDiscipline: "dövüşçü",
      editProfile: "Profili Düzenle",
      support: "Destekle",
      statFollowers: "Takipçi",
      statStreak: "Streak",
      statTrainings: "Antrenman",
      statVerification: "Doğrulama",
      streakValue: "{days} gün",
      ageSuffix: "yaş",
      about: "Hakkında",
      disciplines: "Disiplinler",
      noDisciplines: "Henüz disiplin eklenmemiş.",
      professional: "Profesyonel",
      yearsActive: "{years} yıl",
      primary: "Ana",
      beltSuffix: "Kemer",
      stripes: "{stripes} bant",
      recordWins: "G",
      recordLosses: "M",
      recordDraws: "B",
      recordKo: "KO",
      weightClass: "Kilo sınıfı",
      posts: "Gönderiler",
      noPostsTitle: "Henüz gönderi yok",
      noPostsBody: "Bu sporcu henüz içerik paylaşmadı.",
      gyms: "Salonlar",
      coaching: "Antrenörlük",
      coachFallbackTitle: "Antrenör",
      headCoach: "Baş Antrenör",
      vouchedForLead: "Bu antrenör",
      vouchedForTail: "sporcuya kefil oldu.",
      vouchingCoaches: "Kefil Antrenörler",
      links: "Bağlantılar",
      website: "Web sitesi",
      memberSince: "FIGHTNET üyesi ·",
      longestStreak: "En uzun streak:",
    },
  },
};
