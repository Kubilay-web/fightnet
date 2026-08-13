import type { Locale } from "@/lib/i18n/config";

/**
 * §4.4 / §5.7 — Cihaz ve sağlık verisi bağlantılarının metinleri.
 *
 * Sağlayıcı adları (Apple HealthKit, Garmin Connect …) marka adı olduğu için
 * `HEALTH_PROVIDERS` içinde kalır ve çevrilmez; buradaki `{provider}` yer
 * tutucusuna o adlar geçirilir.
 */

type DevicesCopy = {
  meta: { title: string };
  title: string;
  subtitle: string;
  consent: { title: string; bullets: string[] };
  stats: {
    connected: string;
    samples: string;
    samplesHint: string;
    providers: string;
    providersHint: string;
  };
  providersTitle: string;
  kind: { device: string; cloud: string };
  badge: { linked: string; pending: string };
  desc: { device: string; cloud: string };
  /** `{provider}` yerine sağlayıcı adı geçer. */
  notConfigured: string;
  details: {
    deviceName: string;
    consentAt: string;
    lastSync: string;
    noSync: string;
    sampleCount: string;
  };
  revoke: string;
  pendingHint: string;
  mobile: { title: string; subtitle: string; note1: string; note2: string };
};

export const devicesCopy: Record<Locale, DevicesCopy> = {
  de: {
    meta: { title: "Geräte" },
    title: "Geräte",
    subtitle:
      "§4.4 — Verbinde deine Uhr oder deine Gesundheits-App, damit deine Trainings von selbst im Tagebuch landen",
    consent: {
      title: "Gesundheitsdaten sind besondere Kategorien personenbezogener Daten (Artikel 9 DSGVO)",
      bullets: [
        "Die Verbindung wird mit einer ausdrücklichen Einwilligung hergestellt, die von den übrigen Berechtigungen deines Kontos getrennt ist.",
        "Die erhobenen Daten werden ausschließlich zum Aufbau deines Trainingstagebuchs verwendet; sie werden nicht an Dritte weitergegeben und nicht in die lizenzierte Daten-API aufgenommen.",
        "Wenn du die Einwilligung widerrufst, werden sämtliche Gesundheitsdaten dieser Verbindung sofort gelöscht und das Geräte-Token wird ungültig.",
      ],
    },
    stats: {
      connected: "Verbundene Geräte",
      samples: "Erfasste Datenpunkte",
      samplesHint: "Werden beim Widerruf der Einwilligung gelöscht",
      providers: "Anbieter",
      providersHint: "Apple, Google, Garmin, Polar",
    },
    providersTitle: "Anbieter",
    kind: { device: "Auf dem Gerät", cloud: "Cloud-API" },
    badge: { linked: "Verbunden", pending: "Autorisierung ausstehend" },
    desc: {
      device:
        "Die Daten werden gelesen, ohne dein Telefon zu verlassen; die mobile App sendet nur Trainingszusammenfassungen.",
      cloud:
        "Die Autorisierung läuft über dein Anbieterkonto; neue Aktivitäten werden automatisch übertragen, sobald sie aufgezeichnet sind.",
    },
    notConfigured:
      "Die {provider}-Integration ist in dieser Installation nicht konfiguriert (kein Anbieterschlüssel hinterlegt).",
    details: {
      deviceName: "Gerätename",
      consentAt: "Datum der Einwilligung",
      lastSync: "Letzte Synchronisierung",
      noSync: "Noch keine Daten eingegangen",
      sampleCount: "Anzahl Datenpunkte",
    },
    revoke: "Einwilligung widerrufen und Gesundheitsdaten löschen",
    pendingHint:
      "Falls die Autorisierung abgebrochen wurde, sende das Formular erneut ab; du wirst wieder zum Anbieter weitergeleitet.",
    mobile: {
      title: "Für die mobile App",
      subtitle: "Bei Anbietern auf dem Gerät werden die Datenpunkte an diesen Endpunkt gesendet",
      note1: "Die Antwort gibt die Liste der akzeptierten ",
      note2:
        " zurück. Denselben Datenpunkt ein zweites Mal zu senden erzeugt keinen Eintrag, sodass du die Warteschlange nach einem Verbindungsabbruch gefahrlos erneut senden kannst.",
    },
  },

  en: {
    meta: { title: "Devices" },
    title: "Devices",
    subtitle:
      "§4.4 — Connect your watch or health app so your training sessions land in the log by themselves",
    consent: {
      title: "Health data is a special category of personal data (Article 9 GDPR)",
      bullets: [
        "The connection is established with explicit consent, kept separate from the other permissions on your account.",
        "The data collected is used only to build your training log; it is not shared with third parties and is not included in the licensed data API.",
        "When you withdraw consent, every health sample belonging to the connection is deleted immediately and the device token is invalidated.",
      ],
    },
    stats: {
      connected: "Connected devices",
      samples: "Samples collected",
      samplesHint: "Deleted when consent is withdrawn",
      providers: "Providers",
      providersHint: "Apple, Google, Garmin, Polar",
    },
    providersTitle: "Providers",
    kind: { device: "On-device", cloud: "Cloud API" },
    badge: { linked: "Connected", pending: "Authorization pending" },
    desc: {
      device:
        "The data is read without ever leaving your phone; the mobile app sends training summaries only.",
      cloud:
        "Authorization runs through your provider account; new activities are transferred automatically as they are recorded.",
    },
    notConfigured:
      "The {provider} integration is not configured in this installation (no provider key set).",
    details: {
      deviceName: "Device name",
      consentAt: "Consent date",
      lastSync: "Last sync",
      noSync: "No data received yet",
      sampleCount: "Sample count",
    },
    revoke: "Withdraw consent and delete health data",
    pendingHint:
      "If authorization was left unfinished, submit the form again; you will be redirected to the provider once more.",
    mobile: {
      title: "For the mobile app",
      subtitle: "For on-device providers, samples are sent to this endpoint",
      note1: "The response returns the list of accepted ",
      note2:
        " values. Sending the same sample a second time creates no record, so you can safely re-send the queue after a dropped connection.",
    },
  },

  tr: {
    meta: { title: "Cihazlar" },
    title: "Cihazlar",
    subtitle:
      "§4.4 — Saatini veya sağlık uygulamanı bağla, antrenmanların günlüğe kendiliğinden düşsün",
    consent: {
      title: "Sağlık verisi özel nitelikli kişisel veridir (KVKK Madde 9)",
      bullets: [
        "Bağlantı, hesabındaki diğer izinlerden ayrı ve açık bir rızayla kurulur.",
        "Toplanan veriler yalnızca antrenman günlüğünü oluşturmak için kullanılır; üçüncü taraflarla paylaşılmaz ve lisanslı veri API'sine dahil edilmez.",
        "İzni geri aldığında bağlantıya ait tüm sağlık örnekleri anında silinir, cihaz jetonu geçersiz olur.",
      ],
    },
    stats: {
      connected: "Bağlı cihaz",
      samples: "Toplanan örnek",
      samplesHint: "İzin kaldırılınca silinir",
      providers: "Sağlayıcı",
      providersHint: "Apple, Google, Garmin, Polar",
    },
    providersTitle: "Sağlayıcılar",
    kind: { device: "Cihaz üstü", cloud: "Bulut API" },
    badge: { linked: "Bağlı", pending: "Yetki bekliyor" },
    desc: {
      device:
        "Veriler telefonundan çıkmadan okunur; mobil uygulama yalnızca antrenman özetlerini gönderir.",
      cloud:
        "Sağlayıcı hesabınla yetkilendirilir; yeni aktivite kaydedildikçe otomatik aktarılır.",
    },
    notConfigured:
      "{provider} entegrasyonu bu kurulumda yapılandırılmadı (sağlayıcı anahtarı tanımlı değil).",
    details: {
      deviceName: "Cihaz adı",
      consentAt: "İzin tarihi",
      lastSync: "Son senkron",
      noSync: "Henüz veri gelmedi",
      sampleCount: "Örnek sayısı",
    },
    revoke: "İzni geri al ve sağlık verilerini sil",
    pendingHint:
      "Yetkilendirme yarım kaldıysa formu yeniden gönder; sağlayıcıya tekrar yönlendirilirsin.",
    mobile: {
      title: "Mobil uygulama için",
      subtitle: "Cihaz üstü sağlayıcılarda örnekler bu uca gönderilir",
      note1: "Yanıt kabul edilen ",
      note2:
        " listesini döner. Aynı örneği ikinci kez göndermek kayıt oluşturmaz, böylece bağlantı koptuğunda kuyruğu güvenle tekrar gönderebilirsin.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Cihaz bağlama formu (components/device-forms.tsx)                   */
/* ------------------------------------------------------------------ */

type DeviceFormCopy = {
  /** `{provider}` yerine sağlayıcı adı geçer. */
  authorizeWith: string;
  generateToken: string;
  deviceName: { label: string; hint: string };
  consentBold: string;
  /** `{provider}` yerine sağlayıcı adı geçer. */
  consentBody: string;
  token: { title: string; body: string };
};

export const deviceFormCopy: Record<Locale, DeviceFormCopy> = {
  de: {
    authorizeWith: "Mit {provider} autorisieren",
    generateToken: "Geräte-Token erzeugen",
    deviceName: {
      label: "Gerätename",
      hint: "Hilft dir, mehrere Geräte auseinanderzuhalten.",
    },
    consentBold: "Ausdrückliche Einwilligung:",
    consentBody:
      "Ich willige ein, dass meine Gesundheitsdaten ({provider}) zum Aufbau meines Trainingstagebuchs verarbeitet werden. Mir ist bewusst, dass diese Einwilligung die Verarbeitung besonderer Kategorien personenbezogener Daten nach Artikel 9 DSGVO bedeutet.",
    token: {
      title: "Dieses Token wird kein zweites Mal angezeigt",
      body:
        "Speichere das obige Token jetzt in der mobilen App. Auf dem Server wird nur sein Hash aufbewahrt; wenn du es verlierst, musst du ein neues Token erzeugen — das neue macht das alte ungültig.",
    },
  },

  en: {
    authorizeWith: "Authorize with {provider}",
    generateToken: "Generate device token",
    deviceName: {
      label: "Device name",
      hint: "Helps you tell several devices apart.",
    },
    consentBold: "Explicit consent:",
    consentBody:
      "I consent to my health data ({provider}) being processed in order to build my training log. I understand that this consent means the processing of a special category of personal data under Article 9 GDPR.",
    token: {
      title: "This token will not be shown again",
      body:
        "Save the token above in the mobile app now. Only its hash is kept on the server, so if you lose it you have to generate a new token; the new one invalidates the old.",
    },
  },

  tr: {
    authorizeWith: "{provider} ile yetkilendir",
    generateToken: "Cihaz jetonu üret",
    deviceName: {
      label: "Cihaz adı",
      hint: "Birden fazla cihazın varsa ayırt etmene yarar.",
    },
    consentBold: "Açık rıza:",
    consentBody:
      "Sağlık verilerimin ({provider}) antrenman günlüğümü oluşturmak amacıyla işlenmesine izin veriyorum. Bu iznin KVKK Madde 9 kapsamında özel nitelikli kişisel veri işlenmesi anlamına geldiğini biliyorum.",
    token: {
      title: "Bu jeton bir daha gösterilmez",
      body:
        "Yukarıdaki jetonu şimdi mobil uygulamaya kaydet. Sunucuda yalnızca özeti tutulduğu için kaybedersen yeni bir jeton üretmen gerekir; yeni jeton eskisini geçersiz kılar.",
    },
  },
};
