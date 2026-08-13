import type { Locale } from "@/lib/i18n/config";

/** `/akis` keşfet akışı ve `/akis/[id]` gönderi sayfası. */
type Copy = {
  list: {
    meta: { title: string; description: string };
    title: string;
    subtitle: string;
    share: string;
    joinAndShare: string;
    filterDiscipline: string;
    filterType: string;
    typeVideo: string;
    typeImage: string;
    typeText: string;
    filterSort: string;
    sortNew: string;
    sortTop: string;
    sortTrending: string;
    emptyTitle: string;
    emptyBody: string;
  };
  detail: {
    notFound: string;
    post: string;
    /** {name} → paylaşan kişinin adı */
    sharedBy: string;
  };
};

export const feedCopy: Record<Locale, Copy> = {
  de: {
    list: {
      meta: {
        title: "Entdecken",
        description:
          "Trainingsvideos, Technikerklärungen und Wettkampfmomente aus der Community.",
      },
      title: "Entdecken",
      subtitle: "Die neuesten Inhalte der Community — kuratierter Feed",
      share: "Teilen",
      joinAndShare: "Beitreten und teilen",
      filterDiscipline: "Disziplin",
      filterType: "Art",
      typeVideo: "Video",
      typeImage: "Bild",
      typeText: "Text",
      filterSort: "Sortierung",
      sortNew: "Neueste",
      sortTop: "Am beliebtesten",
      sortTrending: "Im Aufwind",
      emptyTitle: "Noch keine Inhalte",
      emptyBody: "Mach den ersten Beitrag und bring die Community ins Rollen.",
    },
    detail: {
      notFound: "Beitrag nicht gefunden",
      post: "Beitrag",
      sharedBy: "Geteilt von {name}",
    },
  },

  en: {
    list: {
      meta: {
        title: "Discover",
        description:
          "Training videos, technique breakdowns and competition moments from the community.",
      },
      title: "Discover",
      subtitle: "The newest content from the community — a curated feed",
      share: "Share",
      joinAndShare: "Join and share",
      filterDiscipline: "Discipline",
      filterType: "Type",
      typeVideo: "Video",
      typeImage: "Image",
      typeText: "Text",
      filterSort: "Sorting",
      sortNew: "Newest",
      sortTop: "Most popular",
      sortTrending: "Trending",
      emptyTitle: "No content yet",
      emptyBody: "Make the first post and get the community started.",
    },
    detail: {
      notFound: "Post not found",
      post: "Post",
      sharedBy: "Shared by {name}",
    },
  },

  tr: {
    list: {
      meta: {
        title: "Keşfet",
        description: "Topluluktan antrenman videoları, teknik anlatımları ve müsabaka anları.",
      },
      title: "Keşfet",
      subtitle: "Topluluğun en yeni içerikleri — küratörlü akış",
      share: "Paylaş",
      joinAndShare: "Katıl ve Paylaş",
      filterDiscipline: "Disiplin",
      filterType: "Tür",
      typeVideo: "Video",
      typeImage: "Görsel",
      typeText: "Metin",
      filterSort: "Sıralama",
      sortNew: "En yeni",
      sortTop: "En popüler",
      sortTrending: "Yükselen",
      emptyTitle: "Henüz içerik yok",
      emptyBody: "İlk paylaşımı sen yap ve topluluğu başlat.",
    },
    detail: {
      notFound: "Gönderi bulunamadı",
      post: "Gönderi",
      sharedBy: "{name} tarafından paylaşıldı",
    },
  },
};
