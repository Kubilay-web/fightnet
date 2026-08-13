import type { Locale } from "@/lib/i18n/config";

/** `/forum`, `/forum/[slug]` ve `/forum/yeni`. */
type Copy = {
  list: {
    meta: { title: string; description: string };
    title: string;
    subtitle: string;
    newThread: string;
    join: string;
    allCategories: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    replies: string;
  };
  thread: {
    notFound: string;
    breadcrumb: string;
    pinned: string;
    locked: string;
    lockedTitle: string;
    lockedBody: string;
    replyLead: string;
    replyLink: string;
  };
  create: {
    meta: { title: string };
    title: string;
    subtitle: string;
    rulesTitle: string;
    rulesBody: string;
  };
};

export const forumCopy: Record<Locale, Copy> = {
  de: {
    list: {
      meta: {
        title: "Forum",
        description:
          "Diskussionsforum der Kampfsport-Community — Technik, Ausrüstung, Wettkampf und Training.",
      },
      title: "Forum",
      subtitle: "Diskussionen der Community — Technik, Ausrüstung, Wettkampf und Training",
      newThread: "Thema eröffnen",
      join: "Beitreten",
      allCategories: "Alle",
      searchPlaceholder: "In Themen suchen…",
      emptyTitle: "Kein Thema gefunden",
      emptyBody: "Eröffne das erste Thema und starte die Diskussion.",
      replies: "Antworten",
    },
    thread: {
      notFound: "Thema nicht gefunden",
      breadcrumb: "Forum",
      pinned: "Angepinnt",
      locked: "Geschlossen",
      lockedTitle: "Thema geschlossen",
      lockedBody: "Zu diesem Thema können keine neuen Antworten hinzugefügt werden.",
      replyLead: "Zum Antworten bitte",
      replyLink: "anmelden",
    },
    create: {
      meta: { title: "Thema eröffnen" },
      title: "Neues Thema",
      subtitle: "Stell der Community deine Frage oder teile deine Erfahrung",
      rulesTitle: "Community-Richtlinien",
      rulesBody:
        "Bleib respektvoll, gib keine Ratschläge zu Doping oder extremem Gewichtmachen und teile keine personenbezogenen Daten.",
    },
  },

  en: {
    list: {
      meta: {
        title: "Forum",
        description:
          "The combat sports community discussion forum — technique, gear, competition and training.",
      },
      title: "Forum",
      subtitle: "Community discussions — technique, gear, competition and training",
      newThread: "Start a thread",
      join: "Join",
      allCategories: "All",
      searchPlaceholder: "Search the threads…",
      emptyTitle: "No thread found",
      emptyBody: "Start the first thread and get the discussion going.",
      replies: "replies",
    },
    thread: {
      notFound: "Thread not found",
      breadcrumb: "Forum",
      pinned: "Pinned",
      locked: "Locked",
      lockedTitle: "Thread locked",
      lockedBody: "No new replies can be added to this thread.",
      replyLead: "To reply, please",
      replyLink: "log in",
    },
    create: {
      meta: { title: "Start a thread" },
      title: "New thread",
      subtitle: "Ask the community a question or share your experience",
      rulesTitle: "Community guidelines",
      rulesBody:
        "Be respectful, do not give advice on doping or extreme weight cutting, and do not share personal data.",
    },
  },

  tr: {
    list: {
      meta: {
        title: "Forum",
        description:
          "Dövüş sporu topluluğu tartışma forumu — teknik, ekipman, müsabaka ve antrenman.",
      },
      title: "Forum",
      subtitle: "Topluluk tartışmaları — teknik, ekipman, müsabaka ve antrenman",
      newThread: "Konu Aç",
      join: "Katıl",
      allCategories: "Tümü",
      searchPlaceholder: "Konularda ara…",
      emptyTitle: "Konu bulunamadı",
      emptyBody: "İlk konuyu sen aç ve tartışmayı başlat.",
      replies: "yanıt",
    },
    thread: {
      notFound: "Konu bulunamadı",
      breadcrumb: "Forum",
      pinned: "Sabit",
      locked: "Kilitli",
      lockedTitle: "Konu kilitli",
      lockedBody: "Bu konuya yeni yanıt eklenemez.",
      replyLead: "Yanıt vermek için",
      replyLink: "giriş yap",
    },
    create: {
      meta: { title: "Konu Aç" },
      title: "Yeni Konu",
      subtitle: "Topluluğa sorunu sor veya deneyimini paylaş",
      rulesTitle: "Topluluk kuralları",
      rulesBody:
        "Saygılı ol, doping ve aşırı kilo düşürme tavsiyesi verme, kişisel veri paylaşma.",
    },
  },
};
