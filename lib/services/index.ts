import "server-only";
import { stripeConfigured, stripeMode, stripeWebhookConfigured } from "./stripe";
import { searchConfigured } from "./search";
import { analyticsConfigured } from "./analytics";
import { kycConfigured, kycProvider } from "./kyc";
import { geoConfigured, geoProvider } from "./geo";
import { moderationConfigured, moderationProviders } from "./moderation";
import { streamConfigured, streamAuthConfigured } from "./stream";
import { sepaConfigured } from "./banking";
import { esignProvider, qualifiedSignatureAvailable } from "./esign";
import { healthCloudConfigured } from "./health";
import { awsConfigured } from "./aws";

/**
 * Harici servislerin tek bakışta durumu — `/admin/servisler` ekranında gösterilir.
 *
 * Tasarım ilkesi: hiçbir servis zorunlu değildir. Her modül anahtar yokken
 * de çalışır (manuel akış, yerel heuristik, veritabanı araması). Bu tablo
 * "neyin otomatik, neyin elle" olduğunu operasyon ekibine gösterir.
 *
 * §5.2 — Bu modül GÖRÜNEN METİN ÜRETMEZ. Yapılandırmaya bakıp hangi açıklama
 * varyantının geçerli olduğuna karar verir (`detailKey`) ve cümleye gömülecek
 * dinamik değerleri (`detailParams`) taşır. Üç dildeki karşılıkları
 * `lib/i18n/pages/admin-services.ts` içinde durur — tıpkı `lib/kpi.ts` ile
 * `lib/i18n/pages/admin-kpi.ts` ikilisinde olduğu gibi.
 */

export type ServiceState = "ACTIVE" | "FALLBACK" | "MISSING";

/** Tablodaki satırların sabit kimlikleri — copy modülü bu anahtarlardan türer. */
export type ServiceKey =
  | "stripe"
  | "moderation"
  | "kyc"
  | "stream"
  | "sepa"
  | "esign"
  | "search"
  | "analytics"
  | "geo"
  | "health"
  | "aws";

/**
 * Servis başına geçerli açıklama varyantı ve o cümlenin dinamik değerleri.
 *
 * Sağlayıcı adları (onfido, mapbox, perspective, skribble …) marka/tanımlayıcı
 * olduğu için çevrilmez; olduğu gibi parametre olarak geçer.
 */
export type ServiceDetail =
  | {
      key: "stripe";
      detailKey: "connected" | "missing";
      detailParams: { mode: typeof stripeMode; webhook: boolean };
    }
  | {
      key: "moderation";
      detailKey: "providers";
      detailParams: { text: typeof moderationProviders.text; image: typeof moderationProviders.image };
    }
  | { key: "kyc"; detailKey: "provider"; detailParams: { provider: typeof kycProvider } }
  | { key: "stream"; detailKey: "channel" | "missing"; detailParams: { auth: boolean } }
  | { key: "sepa"; detailKey: "configured" | "missing"; detailParams: Record<string, never> }
  | {
      key: "esign";
      detailKey: "qualified" | "advanced";
      detailParams: { provider: typeof esignProvider };
    }
  | { key: "search"; detailKey: "configured" | "missing"; detailParams: Record<string, never> }
  | { key: "analytics"; detailKey: "configured" | "missing"; detailParams: Record<string, never> }
  | { key: "geo"; detailKey: "provider"; detailParams: { provider: typeof geoProvider } }
  | { key: "health"; detailKey: "cloud" | "missing"; detailParams: Record<string, never> }
  | { key: "aws"; detailKey: "configured" | "missing"; detailParams: Record<string, never> };

export type ServiceStatus = ServiceDetail & {
  state: ServiceState;
  envKeys: string[];
};

export function serviceStatuses(): ServiceStatus[] {
  return [
    {
      key: "stripe",
      state: stripeConfigured ? "ACTIVE" : "MISSING",
      detailKey: stripeConfigured ? "connected" : "missing",
      detailParams: { mode: stripeMode, webhook: stripeWebhookConfigured },
      envKeys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
    },
    {
      key: "moderation",
      state: moderationConfigured ? "ACTIVE" : "FALLBACK",
      detailKey: "providers",
      detailParams: { text: moderationProviders.text, image: moderationProviders.image },
      envKeys: ["PERSPECTIVE_API_KEY", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
    },
    {
      key: "kyc",
      state: kycConfigured ? "ACTIVE" : "FALLBACK",
      detailKey: "provider",
      detailParams: { provider: kycProvider },
      envKeys: ["KYC_PROVIDER", "ONFIDO_API_TOKEN", "IDNOW_COMPANY_ID", "IDNOW_API_KEY"],
    },
    {
      key: "stream",
      state: streamConfigured ? "ACTIVE" : "FALLBACK",
      detailKey: streamConfigured ? "channel" : "missing",
      detailParams: { auth: streamAuthConfigured },
      envKeys: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "IVS_PLAYBACK_KEY_ARN", "IVS_PLAYBACK_PRIVATE_KEY"],
    },
    {
      key: "sepa",
      state: sepaConfigured ? "ACTIVE" : "FALLBACK",
      detailKey: sepaConfigured ? "configured" : "missing",
      detailParams: {},
      envKeys: ["SEPA_CREDITOR_ID", "SEPA_CREDITOR_NAME"],
    },
    {
      key: "esign",
      state: qualifiedSignatureAvailable ? "ACTIVE" : "FALLBACK",
      detailKey: qualifiedSignatureAvailable ? "qualified" : "advanced",
      detailParams: { provider: esignProvider },
      envKeys: ["ESIGN_PROVIDER", "ESIGN_SECRET", "SKRIBBLE_API_TOKEN"],
    },
    {
      key: "search",
      state: searchConfigured ? "ACTIVE" : "FALLBACK",
      detailKey: searchConfigured ? "configured" : "missing",
      detailParams: {},
      envKeys: ["ALGOLIA_APP_ID", "ALGOLIA_ADMIN_KEY"],
    },
    {
      key: "analytics",
      state: analyticsConfigured ? "ACTIVE" : "FALLBACK",
      detailKey: analyticsConfigured ? "configured" : "missing",
      detailParams: {},
      envKeys: ["POSTHOG_API_KEY", "NEXT_PUBLIC_POSTHOG_HOST"],
    },
    {
      key: "geo",
      state: geoConfigured ? "ACTIVE" : "FALLBACK",
      detailKey: "provider",
      detailParams: { provider: geoProvider },
      envKeys: ["MAPBOX_ACCESS_TOKEN", "GOOGLE_PLACES_API_KEY"],
    },
    {
      key: "health",
      state: healthCloudConfigured ? "ACTIVE" : "FALLBACK",
      detailKey: healthCloudConfigured ? "cloud" : "missing",
      detailParams: {},
      envKeys: ["GARMIN_CLIENT_ID", "GARMIN_CLIENT_SECRET", "POLAR_CLIENT_ID", "POLAR_CLIENT_SECRET"],
    },
    {
      key: "aws",
      state: awsConfigured ? "ACTIVE" : "MISSING",
      detailKey: awsConfigured ? "configured" : "missing",
      detailParams: {},
      envKeys: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
    },
  ];
}
