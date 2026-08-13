import type { Locale } from "@/lib/i18n/config";

/**
 * Topluluk tarafındaki istemci formlarının metinleri.
 *
 * Kapsam: `components/sponsor-apply.tsx` (§4.7 sponsorluk başvurusu),
 * `components/thread-form.tsx` ve `components/reply-form.tsx` (§4.5 forum).
 *
 * Sunucu eylemlerinin döndürdüğü hata metinleri (Zod ve `actions.ts`) burada
 * DEĞİLDİR; yalnızca istemcide üretilen yedek hata metni çevrilir.
 */
type Copy = {
  sponsorApply: {
    apply: string;
    submitFailed: string;
    sentTitle: string;
    sentBody: (sponsorName: string) => string;
    verificationTitle: string;
    verificationBody: string;
    verificationCta: string;
    formTitle: (sponsorName: string) => string;
    pitch: string;
    pitchHint: string;
    cancel: string;
    submit: string;
  };
  threadForm: {
    submit: string;
    category: string;
    select: string;
    title: string;
    titlePlaceholder: string;
    body: string;
    tags: string;
    tagsHint: string;
  };
  replyForm: {
    submit: string;
    body: string;
    bodyPlaceholder: string;
  };
};

export const communityFormsCopy: Record<Locale, Copy> = {
  de: {
    sponsorApply: {
      apply: "Bewerben",
      submitFailed: "Bewerbung konnte nicht gesendet werden",
      sentTitle: "Deine Bewerbung ist raus",
      sentBody: (sponsorName) => `${sponsorName} prüft sie und meldet sich bei dir.`,
      verificationTitle: "Verifizierung erforderlich",
      verificationBody: "Für eine Sponsoring-Bewerbung ist mindestens Stufe 1 der Verifizierung nötig.",
      verificationCta: "Verifizierung starten",
      formTitle: (sponsorName) => `Sponsoring-Bewerbung bei ${sponsorName}`,
      pitch: "Stell dich vor",
      pitchHint: "Warum du? Deine Social-Media-Reichweite, deine Ziele …",
      cancel: "Abbrechen",
      submit: "Bewerbung senden",
    },
    threadForm: {
      submit: "Thema eröffnen",
      category: "Kategorie",
      select: "Auswählen",
      title: "Titel",
      titlePlaceholder: "Ein kurzer, klarer Titel",
      body: "Inhalt",
      tags: "Tags",
      tagsHint: "Mit Komma trennen: Technik, Ausrüstung",
    },
    replyForm: {
      submit: "Antworten",
      body: "Deine Antwort",
      bodyPlaceholder: "Teile deine Meinung …",
    },
  },

  en: {
    sponsorApply: {
      apply: "Apply",
      submitFailed: "Application could not be sent",
      sentTitle: "Your application has been sent",
      sentBody: (sponsorName) => `${sponsorName} will review it and get back to you.`,
      verificationTitle: "Verification required",
      verificationBody: "A sponsorship application requires at least Level 1 verification.",
      verificationCta: "Start verification",
      formTitle: (sponsorName) => `Sponsorship application to ${sponsorName}`,
      pitch: "Introduce yourself",
      pitchHint: "Why you? Your social media reach, your goals…",
      cancel: "Cancel",
      submit: "Send application",
    },
    threadForm: {
      submit: "Start thread",
      category: "Category",
      select: "Select",
      title: "Title",
      titlePlaceholder: "A short, clear title",
      body: "Content",
      tags: "Tags",
      tagsHint: "Separate with commas: technique, gear",
    },
    replyForm: {
      submit: "Reply",
      body: "Your reply",
      bodyPlaceholder: "Share your view…",
    },
  },

  tr: {
    sponsorApply: {
      apply: "Başvur",
      submitFailed: "Başvuru gönderilemedi",
      sentTitle: "Başvurun gönderildi",
      sentBody: (sponsorName) => `${sponsorName} inceleyip sana dönecek.`,
      verificationTitle: "Doğrulama gerekli",
      verificationBody: "Sponsorluk başvurusu için en az Seviye 1 doğrulaması gerekir.",
      verificationCta: "Doğrulamayı başlat",
      formTitle: (sponsorName) => `${sponsorName} sponsorluk başvurusu`,
      pitch: "Kendini tanıt",
      pitchHint: "Neden sen? Sosyal medya erişimin, hedeflerin…",
      cancel: "Vazgeç",
      submit: "Başvuruyu Gönder",
    },
    threadForm: {
      submit: "Konuyu Aç",
      category: "Kategori",
      select: "Seç",
      title: "Başlık",
      titlePlaceholder: "Kısa ve net bir başlık",
      body: "İçerik",
      tags: "Etiketler",
      tagsHint: "Virgülle ayır: teknik, ekipman",
    },
    replyForm: {
      submit: "Yanıtla",
      body: "Yanıtın",
      bodyPlaceholder: "Görüşünü paylaş…",
    },
  },
};
