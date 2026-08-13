/**
 * Türkçe sözlük — tip kaynağı.
 *
 * Diğer diller bu nesnenin şeklini `Dictionary` tipiyle taahhüt eder, böylece
 * bir anahtar eklendiğinde eksik çeviri derleme hatası olarak çıkar; sessizce
 * boş kalmaz.
 */
export const tr = {
  meta: {
    tagline: "DACH'ın bağımsız dövüş sporu platformu",
    description:
      "Doğrulanmış dövüşçü profilleri, salon bulucu, sparring arama, antrenman günlüğü ve canlı skor.",
  },

  nav: {
    home: "Ana",
    fighters: "Dövüşçüler",
    gyms: "Salonlar",
    events: "Etkinlikler",
    sparring: "Sparring",
    coaching: "Koçluk",
    discover: "Keşfet",
    forum: "Forum",
    map: "Harita",
    marketplace: "Pazar",
    search: "Ara",
    menu: "Menü",
    close: "Kapat",
  },

  auth: {
    login: "Giriş yap",
    register: "Kayıt ol",
    logout: "Çıkış yap",
    dashboard: "Panel",
    profile: "Profil",
    settings: "Ayarlar",
    notifications: "Bildirimler",
  },

  common: {
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    send: "Gönder",
    back: "Geri",
    next: "İleri",
    previous: "Önceki",
    loading: "Yükleniyor…",
    more: "Daha fazla",
    all: "Tümü",
    filter: "Filtrele",
    clear: "Temizle",
    share: "Paylaş",
    report: "Bildir",
    open: "Aç",
    skipToContent: "İçeriğe atla",
    required: "Zorunlu",
    optional: "İsteğe bağlı",
    yes: "Evet",
    no: "Hayır",
    perMonth: "/ ay",
    verified: "Doğrulanmış",
    founder: "Kurucu Üye",
    live: "CANLI",
    premium: "Premium",
  },

  errors: {
    generic: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
    notFound: "Sayfa bulunamadı",
    notFoundBody: "Aradığın sayfa taşınmış veya hiç var olmamış olabilir.",
    forbidden: "Bu sayfaya erişim yetkin yok",
    offline: "Çevrimdışısın",
    paymentsUnavailable: "Ödeme altyapısı henüz yapılandırılmadı.",

    // 404
    notFoundTitle: "Bu ringde kimse yok",
    notFoundCta: "Ana sayfadan devam et.",
    homeCta: "Ana Sayfa",

    // Hata sınırı
    genericTitle: "Bir şeyler ters gitti",
    genericBody: "Beklenmeyen bir hata oluştu. Tekrar denemek sorunu çözebilir; sürerse bize bildir.",
    errorCode: "Hata kodu",
    retry: "Tekrar Dene",

    // 403
    forbiddenMeta: "Erişim Yok",
    forbiddenTitle: "Bu alana erişimin yok",
    forbiddenBody: "Bu sayfa için gerekli yetkiye sahip değilsin. Yanlış hesapla giriş yapmış olabilirsin.",
    dashboardCta: "Panelim",

    // Çevrimdışı
    offlineTitle: "Bağlantı yok",
    offlineBody: "Bu sayfa henüz cihazına kaydedilmemiş. Bağlantın geri geldiğinde otomatik olarak yüklenecek.",
    offlineLogTitle: "Antrenman günlüğü çevrimdışı çalışır",
    offlineLogBody: "Seansını şimdi kaydet — cihazında saklanır ve bağlantı gelince hesabına eklenir.",
    offlineLogCta: "Antrenman kaydet",
    offlineRetry: "Yeniden dene",

    // §11.1 — veli onayı
    guardianMeta: "Veli Onayı",
    guardianOkTitle: "Onay alındı",
    guardianFailTitle: "Onay verilemedi",
    /** {name} → onaylanan üyenin adı */
    guardianOkBody: "{name} artık FIGHTNET'i tam olarak kullanabilir.",
    guardianMember: "Üye",
    guardianWhatTitle: "Bu onay ne anlama geliyor?",
    guardianPoint1: "Kimliği doğrulanmış yetişkinler üyeye doğrudan mesaj gönderebilir.",
    guardianPoint2:
      "Sparring eşleşmesi ve müsabaka kaydı açılır — her sparring sonrası güvenlik değerlendirmesi zorunludur.",
    guardianPoint3: "Üyenin profili yaşına uygun içerik filtresiyle korunmaya devam eder.",
    guardianPoint4: "Onayı istediğiniz zaman geri çekebilirsiniz.",
    guardianContactLead: "Sorularınız için",
    guardianContactLink: "bize yazın",
    guardianPrivacyLead: "Veri işleme detayları",
    guardianPrivacyLink: "gizlilik açıklamasında",
    guardianCta: "FIGHTNET'e git",
  },

  waitlist: {
    doneTitle: "Bekleme listesindesin!",
    doneBody:
      "Beta erişim kodun hazır olduğunda e-posta ile haber vereceğiz. Kurucu Üye ayrıcalıklarını ilk davetliler kapar.",
    email: "E-posta",
    emailPlaceholder: "ornek@eposta.com",
    name: "Ad Soyad",
    namePlaceholder: "Adın",
    city: "Şehir",
    role: "Sen kimsin?",
    roleAthlete: "Sporcu",
    roleCoach: "Antrenör",
    roleGymOwner: "Salon İşletmecisi",
    roleOrganizer: "Organizatör",
    roleFan: "Hayran",
    gymName: "Salon adı (varsa)",
    submit: "Bekleme Listesine Katıl",
    submitCompact: "Listeye Katıl",
    error: "Bir hata oluştu, lütfen tekrar deneyin.",
    legalLead: "Kaydolarak",
    legalLink: "gizlilik politikasını",
    legalTail: " kabul edersin. Verilerin AB'de saklanır, istediğin zaman silinebilir.",
  },

  consent: {
    title: "Gizliliğin senin kontrolünde",
    body:
      "Oturum ve güvenlik için gereken çerezler olmadan platform çalışmaz. Diğer her şey tamamen sana bağlı — hiçbirini açmadan da FIGHTNET'i tam olarak kullanabilirsin.",
    privacyLink: "Gizlilik açıklaması",
    necessary: "Zorunlu",
    necessaryBody: "Oturum, güvenlik, hız sınırlama. Devre dışı bırakılamaz.",
    alwaysOn: "Her zaman açık",
    analytics: "Ölçüm",
    analyticsBody: "Hangi özelliklerin işe yaradığını anlamak için anonim kullanım istatistiği.",
    marketing: "Reklam",
    marketingBody:
      "Dövüş sporu markalarının banner'ları kişiselleştirilir. Spor bahis reklamı asla gösterilmez.",
    health: "Sağlık verileri",
    healthBody: "Kilo takibi ve akıllı saat senkronu. KVKK md. 9 kapsamında ayrı izin gerektirir.",
    acceptAll: "Tümünü kabul et",
    saveChoice: "Seçimimi kaydet",
    necessaryOnly: "Yalnızca zorunlu",
    customize: "Ayarla",
    settingsLink: "Çerez tercihleri",
  },

  footer: {
    colPlatform: "Platform",
    colCommunity: "Topluluk",
    colBrand: "FIGHTNET",
    colLegal: "Yasal",

    fightersLink: "Dövüşçüler",
    gymsLink: "Salonlar",
    eventsLink: "Etkinlikler",
    coachingLink: "Online Koçluk",
    mapLink: "Harita",
    forumLink: "Forum",
    sparringSearch: "Sparring Arama",
    discoverFeed: "Keşfet Akışı",
    creators: "Creator'lar",
    marketplace: "Ekipman Pazarı",
    sponsorship: "Sponsorluk",

    about: "Hakkımızda",
    contact: "İletişim",
    forGyms: "Salonlar İçin",
    beta: "Beta Programı",
    premium: "Premium",
    dataLicense: "Veri Lisansı",

    privacy: "Gizlilik (GDPR)",
    terms: "Kullanım Şartları",
    imprint: "Künye (Impressum)",
    transparency: "Şeffaflık Raporu (DSA)",
    communityRules: "Topluluk Kuralları",
    sparringAgreement: "Sparring Sözleşmesi",

    blurb:
      "DACH bölgesinde dövüş sporları için bağımsız platform. Sporcular, antrenörler, salonlar ve hayranlar için tek dijital ev.",
    hostedInEu: "AB'de barındırılır · GDPR uyumlu",
    independent: "Federasyondan bağımsız.",
    noBettingAds: "Spor bahis reklamı yayınlamıyoruz · 18 yaş altı koruma aktif",
    rightsReserved: "Tüm hakları saklıdır.",
    language: "Dil",
  },

  home: {
    heroTitleTop: "Hessen'deki amatör şampiyon,",
    heroTitleAccent: "bir UFC dövüşçüsü kadar görünür.",
    heroBody:
      "FIGHTNET, dövüş sporlarında sporcuları, antrenörleri, salonları ve hayranları tek çatı altında buluşturan bağımsız platformdur.",
    ctaPrimary: "Ücretsiz katıl",
    ctaSecondary: "Salonları keşfet",
    statAthletes: "Sporcu",
    statVerified: "Doğrulanmış",
    statGyms: "Salon",
    statEvents: "Etkinlik",
    liveNow: "Şu An Canlı",
    liveNowSub: "Devam eden müsabakaları anlık takip et",
    upcoming: "Yaklaşan Etkinlikler",
    topFighters: "Öne Çıkan Dövüşçüler",
    featuredGyms: "Öne Çıkan Salonlar",
    latestPosts: "Akıştan",
    spotlight: "Günün Sporcusu",
  },

  stream: {
    paidTitle: "Bu yayın ücretli",
    paidBody: "İzlemek için giriş yap, ardından yayın biletini al.",
    buyTicket: "Yayın biletini al",
    accessPriced: "Canlı yayına erişim {price}. Etkinlik sonrası 30 gün tekrar izleyebilirsin.",
    accessGeneric: "Bu yayın için erişim bileti gerekiyor.",
    readyTitle: "Yayın hazır",
    readyBody: "Tarayıcın HLS akışını yerleşik olarak oynatmıyor. Yayını yeni sekmede açabilirsin.",
    openStream: "Yayını aç",
    purchaseFailed: "Satın alma başlatılamadı",
    tokenNote: "Bu erişim sana özeldir ve kısa ömürlü bir jetonla imzalanmıştır. Bağlantıyı paylaşmak işe yaramaz.",
  },

  ui: {
    pagination: "Sayfalama",
    sponsored: "Sponsorlu içerik",
    themeLight: "Açık moda geç",
    themeDark: "Karanlık moda geç",
    uploadImage: "Görsel yükle",
    uploadHint: "Tıkla veya sürükle",
    uploadRemove: "Kaldır",
    uploadFailed: "Yükleme başarısız",
    uploadSignFailed: "İmza alınamadı",
    uploadNetworkError: "Ağ hatası",
    playVideo: "Videoyu oynat",
  },

  manifest: {
    logTraining: "Antrenman kaydet",
    training: "Antrenman",
    findSparring: "Sparring ara",
    liveEvents: "Canlı etkinlikler",
  },

  locale: {
    switchLabel: "Dili değiştir",
    current: "Geçerli dil",
  },

  /** Liste/ızgara kartları — `components/cards.tsx` */
  cards: {
    pro: "Pro",
    athlete: "Sporcu",
    halo: "Halo",
    founderGym: "Kurucu Salon",
    freeTrial: "Deneme Ücretsiz",
    members: "üye",
    fights: "müsabaka",
    post: "Gönderi",
  },

  /** Müsabaka kartı — `components/fight-card.tsx` */
  fightCard: {
    empty: "Dövüş kartı henüz açıklanmadı.",
    mainEvent: "Ana Müsabaka",
    titleFight: "Ünvan Maçı",
    rounds: "raunt",
    finished: "Bitti",
    cancelled: "İptal",
  },

  /** Filtre çubuğu — `components/filter-bar.tsx` */
  filters: {
    searchPlaceholder: "Ara…",
    searchLabel: "Ara",
    clearSearch: "Aramayı temizle",
    clear: "Temizle",
    openFilters: "Filtreleri aç",
  },

  /** Harita — `components/gym-map.tsx` */
  map: {
    layerAll: "Tümü",
    layerGyms: "Sadece salonlar",
    layerEvents: "Sadece etkinlikler",
    allDisciplines: "Tüm disiplinler",
    locateMe: "Konumumu bul",
    yourLocation: "Konumun",
    legendGym: "Salon",
    legendHalo: "Halo",
    legendEvent: "Etkinlik",
    members: "üye",
    directions: "Yol tarifi al →",
    trial: "Deneme",
    noGyms: "Bu filtrelerle salon yok",
  },
} as const;
