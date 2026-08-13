import type { Locale } from "@/lib/i18n/config";

/** `/creator` listesi ve `/creator/[username]` abonelik sayfası. */
type Copy = {
  list: {
    meta: { title: string; description: string };
    title: string;
    /** {rate} → platform komisyonu */
    subtitle: string;
    becomeCreator: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    athlete: string;
    followers: string;
    subscribers: string;
  };
  detail: {
    notFound: string;
    /** {name} */
    metaDescription: string;
    followers: string;
    subscribers: string;
    viewAthleteProfile: string;
    tiersTitle: string;
    currentSubscription: string;
    perMonth: string;
    /** {fee} {rest} {name} */
    feeNote: string;
    exclusiveTitle: string;
    emptyContent: string;
    /** {tier} → kademe adı */
    lockedBody: string;
  };
};

export const creatorCopy: Record<Locale, Copy> = {
  de: {
    list: {
      meta: {
        title: "Creator",
        description:
          "Unterstütze Kämpfer und Trainer mit einem monatlichen Abo. 85 % der Einnahmen bleiben beim Athleten.",
      },
      title: "Creator",
      subtitle: "Unterstütze Athleten direkt — nur {rate} % Provision, der Rest gehört dem Athleten",
      becomeCreator: "Creator werden",
      emptyTitle: "Noch keine Creator",
      emptyBody: "Werde der erste Creator — eröffne deine eigene Abo-Seite.",
      emptyCta: "Meine Creator-Seite eröffnen",
      athlete: "Athlet",
      followers: "Follower",
      subscribers: "Abonnenten",
    },
    detail: {
      notFound: "Creator nicht gefunden",
      metaDescription: "Unterstütze {name} mit einem monatlichen Abo.",
      followers: "Follower",
      subscribers: "Abonnenten",
      viewAthleteProfile: "Athletenprofil ansehen",
      tiersTitle: "Unterstützungsstufen",
      currentSubscription: "Dein Abo",
      perMonth: "/Monat",
      feeNote:
        "FIGHTNET-Provision {fee} % — die verbleibenden {rest} % gehen direkt an {name}.",
      exclusiveTitle: "Exklusive Inhalte",
      emptyContent: "Noch keine Inhalte",
      lockedBody: "Exklusiv für Abonnenten ab {tier}",
    },
  },

  en: {
    list: {
      meta: {
        title: "Creators",
        description:
          "Support fighters and coaches with a monthly subscription. 85 % of the revenue stays with the athlete.",
      },
      title: "Creators",
      subtitle: "Support athletes directly — only {rate} % commission, the rest is theirs",
      becomeCreator: "Become a creator",
      emptyTitle: "No creators yet",
      emptyBody: "Be the first creator — open your own subscription page.",
      emptyCta: "Open my creator page",
      athlete: "Athlete",
      followers: "followers",
      subscribers: "subscribers",
    },
    detail: {
      notFound: "Creator not found",
      metaDescription: "Support {name} with a monthly subscription.",
      followers: "followers",
      subscribers: "subscribers",
      viewAthleteProfile: "View athlete profile",
      tiersTitle: "Support tiers",
      currentSubscription: "Your subscription",
      perMonth: "/month",
      feeNote: "FIGHTNET commission {fee} % — the remaining {rest} % goes straight to {name}.",
      exclusiveTitle: "Exclusive content",
      emptyContent: "No content yet",
      lockedBody: "Exclusive to subscribers at {tier} and above",
    },
  },

  tr: {
    list: {
      meta: {
        title: "Creator'lar",
        description:
          "Dövüşçüleri ve antrenörleri aylık abonelikle destekle. Kazancın %85'i sporcuda kalır.",
      },
      title: "Creator'lar",
      subtitle: "Sporcuları doğrudan destekle — komisyon sadece %{rate}, gerisi sporcunun",
      becomeCreator: "Creator Ol",
      emptyTitle: "Henüz creator yok",
      emptyBody: "İlk creator sen ol — kendi abonelik sayfanı aç.",
      emptyCta: "Creator Sayfamı Aç",
      athlete: "Sporcu",
      followers: "takipçi",
      subscribers: "abone",
    },
    detail: {
      notFound: "Creator bulunamadı",
      metaDescription: "{name}'i aylık abonelikle destekle.",
      followers: "takipçi",
      subscribers: "abone",
      viewAthleteProfile: "Sporcu profilini gör",
      tiersTitle: "Destek Kademeleri",
      currentSubscription: "Aboneliğin",
      perMonth: "/ay",
      feeNote: "FIGHTNET komisyonu %{fee} — kalan %{rest} doğrudan {name}'e gider.",
      exclusiveTitle: "Özel İçerik",
      emptyContent: "Henüz içerik yok",
      lockedBody: "{tier} ve üzeri abonelere özel",
    },
  },
};
