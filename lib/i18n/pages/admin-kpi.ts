import type { Locale } from "@/lib/i18n/config";
import type { GateKey, GateLight, ModerationTier } from "@/lib/kpi";

/**
 * §7.4 Dur/Devam kapıları ve §11.7 moderasyon kademeleri için metinler.
 *
 * `lib/kpi.ts` yalnızca ölçüm yapar ve bir anahtar döndürür; eşik sayıları
 * orada tek kaynakta durur. Burada sadece o anahtarların dile göre okunuşu
 * var — bir eşik değişirse metin cümlesi de burada güncellenir.
 *
 * Ölçüm cümleleri fonksiyon olarak tutuldu: Almancada birim sayının ardından,
 * Türkçede tamlama hâlinde gelir, bu yüzden dize birleştirme dile bırakılamaz.
 */
type Copy = {
  gateTitles: Record<GateKey, string>;
  gateDetails: {
    waitlist: (n: number) => string;
    loi: (n: number) => string;
    firstPaying: (gyms: number, mavu: number) => string;
    beta3: (gyms: number, mavu: number) => string;
    launch: (gyms: number, mavu: number) => string;
  };
  /** Ayına gelinmemiş kapı */
  pendingDetail: (month: number) => string;
  /** §7.5 — her ışık için ne yapılır */
  actions: Record<GateLight, string>;
  moderation: Record<ModerationTier, { level: string; note: string }>;
};

export const adminKpiGatesCopy: Record<Locale, Copy> = {
  de: {
    gateTitles: {
      waitlist: "Interesse an der Warteliste",
      loi: "Absichtserklärungen (LOI)",
      firstPaying: "Erste zahlende Gründungsmitglieder",
      beta3: "Beta 3 offen",
      launch: "Vollständiger Launch",
    },
    gateDetails: {
      waitlist: (n) => `${n} Warteliste-Einträge (Ziel ≥20)`,
      loi: (n) => `${n} LOI (Ziel ≥5)`,
      firstPaying: (gyms, mavu) => `${gyms} zahlende Gyms · ${mavu} MAVN (Ziel ≥5 und ≥50)`,
      beta3: (gyms, mavu) => `${gyms} zahlende Gyms · ${mavu} MAVN (Ziel ≥10 und ≥200)`,
      launch: (gyms, mavu) => `${gyms} Gyms · ${mavu} MAVN (Ziel ≥20 und ≥500)`,
    },
    pendingDetail: (month) => `Wird in Monat ${month} gemessen`,
    actions: {
      GREEN: "Weiter wie geplant, Tempo erhöhen.",
      YELLOW: "Warum unter Plan? Zwei bis drei Anpassungen vornehmen und erneut messen.",
      RED: "Mini-Pivot bewerten. Nach acht Wochen weiterhin rot: Full-Pivot oder Abbruch.",
      PENDING: "Noch nicht an der Reihe.",
    },
    moderation: {
      PART_TIME: {
        level: "Teilzeit-Moderator",
        note: "1.500–2.500 €/Monat — Schwelle von 5.000 MAVN oder 300+ Meldungen pro Monat überschritten.",
      },
      WERKSTUDENT_REQUIRED: {
        level: "Werkstudent verpflichtend",
        note: "Schwelle von 2.500 MAVN oder 150+ Meldungen pro Monat überschritten.",
      },
      WERKSTUDENT_SEARCH: {
        level: "Werkstudent-Suche starten",
        note: "500–1.000 €/Monat — Schwelle von 1.000 MAVN oder 50+ Meldungen pro Monat überschritten.",
      },
    },
  },

  en: {
    gateTitles: {
      waitlist: "Waitlist interest",
      loi: "Letters of intent (LOI)",
      firstPaying: "First paying Founding Members",
      beta3: "Beta 3 open",
      launch: "Full launch",
    },
    gateDetails: {
      waitlist: (n) => `${n} waitlist sign-ups (target ≥20)`,
      loi: (n) => `${n} LOIs (target ≥5)`,
      firstPaying: (gyms, mavu) => `${gyms} paying gyms · ${mavu} MAVU (target ≥5 and ≥50)`,
      beta3: (gyms, mavu) => `${gyms} paying gyms · ${mavu} MAVU (target ≥10 and ≥200)`,
      launch: (gyms, mavu) => `${gyms} gyms · ${mavu} MAVU (target ≥20 and ≥500)`,
    },
    pendingDetail: (month) => `Will be measured in month ${month}`,
    actions: {
      GREEN: "Carry on as planned, pick up the pace.",
      YELLOW: "Why are we below plan? Make two or three adjustments and measure again.",
      RED: "Evaluate a mini-pivot. Still red after eight weeks: full pivot or stop.",
      PENDING: "Not due yet.",
    },
    moderation: {
      PART_TIME: {
        level: "Part-time moderator",
        note: "€1,500–2,500/month — threshold of 5,000 MAVU or 300+ reports per month exceeded.",
      },
      WERKSTUDENT_REQUIRED: {
        level: "Working student required",
        note: "Threshold of 2,500 MAVU or 150+ reports per month exceeded.",
      },
      WERKSTUDENT_SEARCH: {
        level: "Start working-student search",
        note: "€500–1,000/month — threshold of 1,000 MAVU or 50+ reports per month exceeded.",
      },
    },
  },

  tr: {
    gateTitles: {
      waitlist: "Bekleme listesi ilgisi",
      loi: "Niyet mektupları (LOI)",
      firstPaying: "İlk ödeyen Kurucu Üyeler",
      beta3: "Beta 3 açık",
      launch: "Tam lansman",
    },
    gateDetails: {
      waitlist: (n) => `${n} bekleme listesi kaydı (hedef ≥20)`,
      loi: (n) => `${n} LOI (hedef ≥5)`,
      firstPaying: (gyms, mavu) => `${gyms} ödeyen salon · ${mavu} MAVU (hedef ≥5 ve ≥50)`,
      beta3: (gyms, mavu) => `${gyms} ödeyen salon · ${mavu} MAVU (hedef ≥10 ve ≥200)`,
      launch: (gyms, mavu) => `${gyms} salon · ${mavu} MAVU (hedef ≥20 ve ≥500)`,
    },
    pendingDetail: (month) => `Ay ${month}'de ölçülecek`,
    actions: {
      GREEN: "Planlanan gibi devam et, hızlandır.",
      YELLOW: "Neden plan altında? 2-3 ayarlama yap, tekrar ölç.",
      RED: "Mini-Pivot değerlendirmesi. 8 hafta sonra hâlâ kırmızıysa Full-Pivot veya vazgeçme.",
      PENDING: "Henüz sırası gelmedi.",
    },
    moderation: {
      PART_TIME: {
        level: "Yarı zamanlı moderatör",
        note: "1.500–2.500 €/ay — 5.000 MAVU veya 300+ rapor/ay eşiği aşıldı.",
      },
      WERKSTUDENT_REQUIRED: {
        level: "Werkstudent zorunlu",
        note: "2.500 MAVU veya 150+ rapor/ay eşiği aşıldı.",
      },
      WERKSTUDENT_SEARCH: {
        level: "Werkstudent araması başlat",
        note: "500–1.000 €/ay — 1.000 MAVU veya 50+ rapor/ay eşiği aşıldı.",
      },
    },
  },
};

/** Kapı sonucunu dile göre tek satırlık açıklamaya çevirir. */
export function gateDetailText(
  copy: Copy,
  gate: { key: GateKey; month: number; light: GateLight; metrics: { gyms?: number; mavu?: number; count?: number } },
): string {
  if (gate.light === "PENDING") return copy.pendingDetail(gate.month);
  const { gyms = 0, mavu = 0, count = 0 } = gate.metrics;
  switch (gate.key) {
    case "waitlist":
      return copy.gateDetails.waitlist(count);
    case "loi":
      return copy.gateDetails.loi(count);
    case "firstPaying":
      return copy.gateDetails.firstPaying(gyms, mavu);
    case "beta3":
      return copy.gateDetails.beta3(gyms, mavu);
    case "launch":
      return copy.gateDetails.launch(gyms, mavu);
  }
}
