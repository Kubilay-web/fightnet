import type { Locale } from "@/lib/i18n/config";

/**
 * `/panel/creator` sayfası ile `creator-forms` ve `stream-setup` bileşenleri.
 *
 * Kademe adları (BRONZE/SILVER/GOLD) form değeri olarak İngilizce enum kalır;
 * yalnızca ekranda görünen etiketleri çevrilir.
 */
type Copy = {
  meta: { title: string };
  title: string;
  gateSubtitle: string;
  gate: { title: string; body: string; link: string };
  /** `share` = (1 - PLATFORM_FEE_RATE) * 100 */
  subtitle: (share: number) => string;
  myPage: string;
  stats: { subs: string; gross: string; platformShare: string; net: string };
  tiers: { title: string; subtitle: string };
  content: { title: string; subtitle: string; empty: { title: string; description: string } };
  policy: { title: string; body: string };

  tierForm: {
    submit: string;
    tier: string;
    bronze: string;
    silver: string;
    gold: string;
    name: string;
    namePlaceholder: string;
    price: string;
    description: string;
    descriptionPlaceholder: string;
    perks: string;
    perksHint: string;
    perkPlaceholder: string;
    addPerkAria: string;
    removePerkAria: (perk: string) => string;
  };

  postForm: {
    submit: string;
    title: string;
    type: string;
    typeVideo: string;
    typeImage: string;
    typeText: string;
    minTier: string;
    bronzePlus: string;
    silverPlus: string;
    goldOnly: string;
    media: string;
    body: string;
  };

  stream: {
    createError: string;
    statusLive: string;
    statusEnded: string;
    statusReady: string;
    authorizedPlayback: string;
    viewerPeak: string;
    keyWarning: { title: string; body: string };
    serverRtmps: string;
    streamKey: string;
    playbackUrl: string;
    ppvNote: string;
    closeChannel: string;
    platformChannel: string;
    ownUrl: string;
    ivsInfo: string;
    ivsPpvSuffix: string;
    externalField: string;
    externalHint: string;
    externalPlaceholder: string;
    openChannel: string;
    hide: string;
    show: string;
    copied: string;
    copy: string;
  };
};

export const panelCreatorCopy: Record<Locale, Copy> = {
  de: {
    meta: { title: "Creator" },
    title: "Creator",
    gateSubtitle: "Eröffne deine eigene Abo-Seite, damit deine Fans dich unterstützen",
    gate: {
      title: "Verifizierung erforderlich",
      body: "Für eine Creator-Seite ist mindestens eine Verifizierung der Stufe 1 nötig.",
      link: "Verifizierung starten",
    },
    subtitle: (share) => `Deine Fans unterstützen dich mit einem Monatsabo. Du bekommst ${share} %.`,
    myPage: "Meine Seite ansehen →",
    stats: {
      subs: "Aktive Abos",
      gross: "Brutto monatlich",
      platformShare: "Plattformanteil",
      net: "Nettoverdienst",
    },
    tiers: {
      title: "Abo-Stufen",
      subtitle: "Bronze, Silber, Gold — jede mit eigenen Vorteilen",
    },
    content: {
      title: "Exklusive Inhalte",
      subtitle: "Inhalte, die nur deine Abonnenten sehen",
      empty: {
        title: "Noch keine Inhalte",
        description: "Teile Trainingsvideos, Momente hinter den Kulissen und Vlogs vor dem Wettkampf.",
      },
    },
    policy: {
      title: "Inhaltsrichtlinie",
      body:
        "Sexuelle Inhalte, Dopingverstöße und Anleitungen zu extremem Gewichtmachen sind verboten. Bei einem Verstoß wird die Creator-Seite geschlossen.",
    },

    tierForm: {
      submit: "Stufe speichern",
      tier: "Stufe",
      bronze: "Bronze",
      silver: "Silber",
      gold: "Gold",
      name: "Name der Stufe",
      namePlaceholder: "Unterstützer",
      price: "Monatspreis (€)",
      description: "Beschreibung",
      descriptionPlaceholder: "Was steckt in dieser Stufe?",
      perks: "Vorteile",
      perksHint: "Mit Enter hinzufügen",
      perkPlaceholder: "Wöchentliches Trainingsvideo",
      addPerkAria: "Vorteil hinzufügen",
      removePerkAria: (perk) => `${perk} entfernen`,
    },

    postForm: {
      submit: "Inhalt veröffentlichen",
      title: "Titel",
      type: "Art",
      typeVideo: "Video",
      typeImage: "Bild",
      typeText: "Text",
      minTier: "Mindeststufe",
      bronzePlus: "Bronze+",
      silverPlus: "Silber+",
      goldOnly: "Gold",
      media: "Medien",
      body: "Inhalt",
    },

    stream: {
      createError: "Kanal konnte nicht erstellt werden",
      statusLive: "Live",
      statusEnded: "Beendet",
      statusReady: "Bereit",
      authorizedPlayback: "Autorisierte Wiedergabe",
      viewerPeak: "Zuschauer-Peak:",
      keyWarning: {
        title: "Teile deinen Stream-Key mit niemandem",
        body:
          "Dieser Key ist die Berechtigung zum Senden. Trage ihn in OBS oder eine ähnliche Software ein und zeige ihn nicht auf dem Bildschirm.",
      },
      serverRtmps: "Server (RTMPS)",
      streamKey: "Stream-Key",
      playbackUrl: "Stream-Adresse",
      ppvNote:
        "Dieses Event ist PPV. Die Wiedergabe-Adresse wird den Zuschauern erst nach bestätigter Zahlung ausgegeben — als kurzlebiger, signierter Link.",
      closeChannel: "Kanal schließen",
      platformChannel: "Plattform-Kanal (IVS)",
      ownUrl: "Meine eigene Stream-Adresse",
      ivsInfo:
        "FIGHTNET erstellt einen Streaming-Kanal für dich und stellt dir die RTMPS-Serveradresse samt Stream-Key bereit.",
      ivsPpvSuffix: " Da es sich um ein PPV-Event handelt, wird der Kanal im autorisierten Modus erstellt.",
      externalField: "HLS- oder DASH-Adresse",
      externalHint: "z. B. https://cdn.example.com/live/event.m3u8",
      externalPlaceholder: "https://…/playlist.m3u8",
      openChannel: "Streaming-Kanal erstellen",
      hide: "Verbergen",
      show: "Anzeigen",
      copied: "Kopiert",
      copy: "Kopieren",
    },
  },

  en: {
    meta: { title: "Creator" },
    title: "Creator",
    gateSubtitle: "Open your own subscription page so your fans can support you",
    gate: {
      title: "Verification required",
      body: "Opening a Creator page requires at least Level 1 verification.",
      link: "Start verification",
    },
    subtitle: (share) => `Your fans support you with a monthly subscription. You keep ${share}%.`,
    myPage: "View my page →",
    stats: {
      subs: "Active subscribers",
      gross: "Gross monthly",
      platformShare: "Platform share",
      net: "Net earnings",
    },
    tiers: {
      title: "Subscription tiers",
      subtitle: "Bronze, Silver, Gold — each with its own perks",
    },
    content: {
      title: "Exclusive content",
      subtitle: "Content only your subscribers can see",
      empty: {
        title: "No content yet",
        description: "Share training videos, behind-the-scenes moments and pre-fight vlogs.",
      },
    },
    policy: {
      title: "Content policy",
      body:
        "Sexual content, doping violations and instructions for extreme weight cutting are prohibited. Any violation closes the Creator page.",
    },

    tierForm: {
      submit: "Save tier",
      tier: "Tier",
      bronze: "Bronze",
      silver: "Silver",
      gold: "Gold",
      name: "Tier name",
      namePlaceholder: "Supporter",
      price: "Monthly price (€)",
      description: "Description",
      descriptionPlaceholder: "What does this tier include?",
      perks: "Perks",
      perksHint: "Press Enter to add",
      perkPlaceholder: "Weekly training video",
      addPerkAria: "Add perk",
      removePerkAria: (perk) => `Remove ${perk}`,
    },

    postForm: {
      submit: "Publish content",
      title: "Title",
      type: "Type",
      typeVideo: "Video",
      typeImage: "Image",
      typeText: "Text",
      minTier: "Minimum tier",
      bronzePlus: "Bronze+",
      silverPlus: "Silver+",
      goldOnly: "Gold",
      media: "Media",
      body: "Content",
    },

    stream: {
      createError: "Could not create the channel",
      statusLive: "Live",
      statusEnded: "Ended",
      statusReady: "Ready",
      authorizedPlayback: "Authorized playback",
      viewerPeak: "Peak viewers:",
      keyWarning: {
        title: "Never share your stream key",
        body:
          "This key is the permission to broadcast. Enter it in OBS or similar software and never show it on screen.",
      },
      serverRtmps: "Server (RTMPS)",
      streamKey: "Stream key",
      playbackUrl: "Stream URL",
      ppvNote:
        "This event is PPV. The playback URL is handed to viewers only after payment is confirmed, as a short-lived signed link.",
      closeChannel: "Close channel",
      platformChannel: "Platform channel (IVS)",
      ownUrl: "My own stream URL",
      ivsInfo:
        "FIGHTNET creates a streaming channel for you and gives you the RTMPS server address along with the stream key.",
      ivsPpvSuffix: " Since this is a PPV event, the channel is created in authorized mode.",
      externalField: "HLS or DASH URL",
      externalHint: "e.g. https://cdn.example.com/live/event.m3u8",
      externalPlaceholder: "https://…/playlist.m3u8",
      openChannel: "Create streaming channel",
      hide: "Hide",
      show: "Show",
      copied: "Copied",
      copy: "Copy",
    },
  },

  tr: {
    meta: { title: "Creator" },
    title: "Creator",
    gateSubtitle: "Kendi abonelik sayfanı aç, hayranların seni desteklesin",
    gate: {
      title: "Doğrulama gerekli",
      body: "Creator sayfası açmak için en az Seviye 1 doğrulaması gerekir.",
      link: "Doğrulamayı başlat",
    },
    subtitle: (share) => `Hayranların seni aylık abonelikle destekler. Sen %${share} alırsın.`,
    myPage: "Sayfamı gör →",
    stats: {
      subs: "Aktif abone",
      gross: "Brüt aylık",
      platformShare: "Platform payı",
      net: "Net kazanç",
    },
    tiers: {
      title: "Abonelik Kademeleri",
      subtitle: "Bronz, Gümüş, Altın — her biri farklı ayrıcalıklar",
    },
    content: {
      title: "Özel İçerik",
      subtitle: "Sadece abonelerinin göreceği içerikler",
      empty: {
        title: "Henüz içerik yok",
        description: "Antrenman videoları, kulis anları, dövüş öncesi vlog'lar paylaş.",
      },
    },
    policy: {
      title: "İçerik politikası",
      body:
        "Cinsel içerik, doping ihlali ve aşırı kilo düşürme talimatı içeren içerikler yasaktır. İhlal durumunda Creator sayfası kapatılır.",
    },

    tierForm: {
      submit: "Kademeyi Kaydet",
      tier: "Kademe",
      bronze: "Bronz",
      silver: "Gümüş",
      gold: "Altın",
      name: "Kademe adı",
      namePlaceholder: "Destekçi",
      price: "Aylık fiyat (€)",
      description: "Açıklama",
      descriptionPlaceholder: "Bu kademede neler var?",
      perks: "Ayrıcalıklar",
      perksHint: "Enter ile ekle",
      perkPlaceholder: "Haftalık antrenman videosu",
      addPerkAria: "Ayrıcalık ekle",
      removePerkAria: (perk) => `${perk} kaldır`,
    },

    postForm: {
      submit: "İçeriği Yayınla",
      title: "Başlık",
      type: "Tür",
      typeVideo: "Video",
      typeImage: "Görsel",
      typeText: "Metin",
      minTier: "Minimum kademe",
      bronzePlus: "Bronz+",
      silverPlus: "Gümüş+",
      goldOnly: "Altın",
      media: "Medya",
      body: "İçerik",
    },

    stream: {
      createError: "Kanal açılamadı",
      statusLive: "Yayında",
      statusEnded: "Bitti",
      statusReady: "Hazır",
      authorizedPlayback: "Yetkili oynatma",
      viewerPeak: "Zirve izleyici:",
      keyWarning: {
        title: "Yayın anahtarını kimseyle paylaşma",
        body:
          "Bu anahtar yayın yapma yetkisidir. OBS veya benzeri bir yazılıma gir, ekranda gösterme.",
      },
      serverRtmps: "Sunucu (RTMPS)",
      streamKey: "Yayın anahtarı",
      playbackUrl: "Yayın adresi",
      ppvNote:
        "Bu etkinlik PPV. İzleyiciye oynatma adresi yalnızca ödeme doğrulandıktan sonra, kısa ömürlü imzalı bir bağlantı olarak verilir.",
      closeChannel: "Kanalı kapat",
      platformChannel: "Platform kanalı (IVS)",
      ownUrl: "Kendi yayın adresim",
      ivsInfo:
        "FIGHTNET senin için bir yayın kanalı açar ve RTMPS sunucu adresi ile yayın anahtarını verir.",
      ivsPpvSuffix: " PPV etkinliği olduğu için kanal yetkili modda açılır.",
      externalField: "HLS veya DASH adresi",
      externalHint: "Örn. https://cdn.example.com/live/etkinlik.m3u8",
      externalPlaceholder: "https://…/playlist.m3u8",
      openChannel: "Yayın kanalını aç",
      hide: "Gizle",
      show: "Göster",
      copied: "Kopyalandı",
      copy: "Kopyala",
    },
  },
};
