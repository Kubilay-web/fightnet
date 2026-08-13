import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel/gonderi` ve `/panel/gonderi/yeni` sayfaları ile `PostForm`,
 * `FollowButton` bileşenlerinin metinleri.
 *
 * Moderasyon ve görünürlük rozetleri burada tutulur; Prisma enum değerleri
 * (`APPROVED`, `PUBLIC` …) anahtar olarak kullanıldığı için eksik bir dil
 * derleme hatası verir.
 */
type Copy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  newPost: string;
  empty: { title: string; description: string; action: string };
  videoPost: string;
  imagePost: string;
  moderation: { approved: string; pending: string; flagged: string; removed: string };
  visibility: { public: string; restricted: string };
  deleteAria: string;

  new: {
    meta: { title: string };
    title: string;
    subtitle: string;
    policy: { title: string; body: string };
  };

  form: {
    submit: string;
    typeLabel: string;
    types: { video: string; image: string; text: string };
    mediaVideo: string;
    mediaImage: string;
    uploadVideo: string;
    uploadImage: string;
    bodyText: string;
    bodyDescription: string;
    bodyPlaceholder: string;
    discipline: string;
    disciplineEmpty: string;
    tags: string;
    tagsHint: string;
    tagsPlaceholder: string;
    visibility: string;
  };

  follow: { following: string; follow: string };
};

export const panelPostsCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Meine Beiträge" },
    title: "Meine Beiträge",
    subtitle: "Deine Trainingsvideos, Technik-Erklärungen und Wettkampfmomente",
    newPost: "Neuer Beitrag",
    empty: {
      title: "Du hast noch keine Beiträge",
      description: "Teile dein erstes Video — damit es im Entdecken-Feed erscheint.",
      action: "Beitrag teilen",
    },
    videoPost: "Video-Beitrag",
    imagePost: "Bild-Beitrag",
    moderation: {
      approved: "Veröffentlicht",
      pending: "In Prüfung",
      flagged: "Markiert",
      removed: "Entfernt",
    },
    visibility: { public: "Öffentlich", restricted: "Eingeschränkt" },
    deleteAria: "Beitrag löschen",

    new: {
      meta: { title: "Neuer Beitrag" },
      title: "Neuer Beitrag",
      subtitle: "Dein Trainingsvideo, deine Technik-Erklärung oder dein Wettkampfmoment",
      policy: {
        title: "Inhaltsrichtlinie",
        body:
          "Sexuelle Inhalte, das Bewerben von Doping und Anleitungen zu extremem Gewichtmachen sind verboten. Videos durchlaufen einen automatischen Vorfilter und werden erst nach Freigabe durch die Moderation veröffentlicht.",
      },
    },

    form: {
      submit: "Teilen",
      typeLabel: "Beitragsart",
      types: { video: "Video", image: "Bild", text: "Text" },
      mediaVideo: "Video",
      mediaImage: "Bild",
      uploadVideo: "Video hochladen (max. 200 MB)",
      uploadImage: "Bild hochladen (max. 10 MB)",
      bodyText: "Dein Text",
      bodyDescription: "Beschreibung",
      bodyPlaceholder: "Was möchtest du erzählen?",
      discipline: "Disziplin",
      disciplineEmpty: "Auswählen",
      tags: "Tags",
      tagsHint: "Mit Komma trennen: Technik, Armbar, Kondition",
      tagsPlaceholder: "Technik, Armbar",
      visibility: "Sichtbarkeit",
    },

    follow: { following: "Du folgst", follow: "Folgen" },
  },

  en: {
    meta: { title: "My posts" },
    title: "My posts",
    subtitle: "Your training videos, technique breakdowns and competition moments",
    newPost: "New post",
    empty: {
      title: "You have no posts yet",
      description: "Share your first video — let it show up in the discover feed.",
      action: "Share a post",
    },
    videoPost: "Video post",
    imagePost: "Image post",
    moderation: {
      approved: "Published",
      pending: "In review",
      flagged: "Flagged",
      removed: "Removed",
    },
    visibility: { public: "Public", restricted: "Restricted" },
    deleteAria: "Delete post",

    new: {
      meta: { title: "New post" },
      title: "New post",
      subtitle: "Your training video, technique breakdown or competition moment",
      policy: {
        title: "Content policy",
        body:
          "Sexual content, promotion of doping and instructions for extreme weight cutting are prohibited. Videos pass through an automatic pre-filter and go live only after moderation approval.",
      },
    },

    form: {
      submit: "Share",
      typeLabel: "Post type",
      types: { video: "Video", image: "Image", text: "Text" },
      mediaVideo: "Video",
      mediaImage: "Image",
      uploadVideo: "Upload video (max. 200 MB)",
      uploadImage: "Upload image (max. 10 MB)",
      bodyText: "Your text",
      bodyDescription: "Description",
      bodyPlaceholder: "What do you want to say?",
      discipline: "Discipline",
      disciplineEmpty: "Select",
      tags: "Tags",
      tagsHint: "Separate with commas: technique, armbar, conditioning",
      tagsPlaceholder: "technique, armbar",
      visibility: "Visibility",
    },

    follow: { following: "Following", follow: "Follow" },
  },

  tr: {
    meta: { title: "Gönderilerim" },
    title: "Gönderilerim",
    subtitle: "Antrenman videoların, teknik anlatımların ve müsabaka anların",
    newPost: "Yeni Gönderi",
    empty: {
      title: "Henüz gönderin yok",
      description: "İlk videonu paylaş — keşfet akışında görünsün.",
      action: "Gönderi Paylaş",
    },
    videoPost: "Video gönderi",
    imagePost: "Görsel gönderi",
    moderation: {
      approved: "Yayında",
      pending: "İncelemede",
      flagged: "İşaretlendi",
      removed: "Kaldırıldı",
    },
    visibility: { public: "Herkese açık", restricted: "Kısıtlı" },
    deleteAria: "Gönderiyi sil",

    new: {
      meta: { title: "Yeni Gönderi" },
      title: "Yeni Gönderi",
      subtitle: "Antrenman videon, teknik anlatımın veya müsabaka anın",
      policy: {
        title: "İçerik politikası",
        body:
          "Cinsel içerik, doping teşviki ve aşırı kilo düşürme talimatı yasaktır. Videolar otomatik ön filtreden geçer ve moderasyon onayı sonrası yayınlanır.",
      },
    },

    form: {
      submit: "Paylaş",
      typeLabel: "Gönderi türü",
      types: { video: "Video", image: "Görsel", text: "Metin" },
      mediaVideo: "Video",
      mediaImage: "Görsel",
      uploadVideo: "Video yükle (maks. 200 MB)",
      uploadImage: "Görsel yükle (maks. 10 MB)",
      bodyText: "Metnin",
      bodyDescription: "Açıklama",
      bodyPlaceholder: "Ne anlatmak istiyorsun?",
      discipline: "Disiplin",
      disciplineEmpty: "Seç",
      tags: "Etiketler",
      tagsHint: "Virgülle ayır: teknik, armbar, kondisyon",
      tagsPlaceholder: "teknik, armbar",
      visibility: "Görünürlük",
    },

    follow: { following: "Takiptesin", follow: "Takip Et" },
  },
};
