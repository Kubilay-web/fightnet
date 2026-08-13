import "server-only";
import type { ModerationState } from "@prisma/client";
import prisma from "./prisma";
import { audit } from "./notify";
import { screenContent, type ScreenInput } from "./services/moderation";

/**
 * §11.3 — Ön filtre ile veritabanı arasındaki köprü.
 *
 * Her kullanıcı içeriği yayına girmeden buradan geçer. Karar `ModerationResult`
 * olarak saklanır; şeffaflık raporu (§11.5) ve otomatik kararın isabet oranı
 * bu kayıtlardan üretilir.
 */

export type ModeratedTarget =
  | "POST"
  | "COMMENT"
  | "THREAD"
  | "FORUM_POST"
  | "MESSAGE"
  | "PRODUCT"
  | "COACHING_OFFER"
  | "GYM_REVIEW";

export interface ModerationDecision {
  state: ModerationState;
  /** Kullanıcıya gösterilecek gerekçe — otomatik ret durumunda dolu */
  message: string | null;
  score: number;
  labels: string[];
}

/**
 * İçeriği tarar ve sonucu kaydeder.
 *
 * @param targetId Kayıt önce oluşturulup sonra taranıyorsa kimliği; henüz
 *   yoksa null geçilir ve sonuç `attachResult` ile bağlanır.
 */
export async function moderate(
  input: ScreenInput & { targetType: ModeratedTarget; targetId?: string | null; userId?: string | null },
): Promise<ModerationDecision> {
  const outcome = await screenContent(input);

  const state: ModerationState =
    outcome.verdict === "REJECTED" ? "REMOVED" : outcome.verdict === "PENDING" ? "PENDING" : "APPROVED";

  if (input.targetId) {
    await prisma.moderationResult
      .create({
        data: {
          targetType: input.targetType,
          targetId: input.targetId,
          verdict: state,
          score: outcome.score,
          labels: outcome.labels,
          provider: outcome.provider,
          reason: outcome.reason,
        },
      })
      .catch(() => {});
  }

  if (state === "REMOVED") {
    audit({
      userId: input.userId ?? null,
      action: "AUTO_MODERATION_BLOCK",
      targetType: input.targetType,
      targetId: input.targetId ?? undefined,
      meta: { score: outcome.score, labels: outcome.labels, provider: outcome.provider },
    });
  }

  return {
    state,
    message:
      state === "REMOVED"
        ? "İçeriğin topluluk kurallarına takıldı. Sebep: " +
          (labelText(outcome.labels) ?? "otomatik ön filtre") +
          ". İtiraz için /panel/itirazlar sayfasını kullanabilirsin."
        : null,
    score: outcome.score,
    labels: outcome.labels,
  };
}

/** Kayıt sonradan oluşturulduğunda tarama sonucunu ona bağlar. */
export async function attachResult(input: {
  targetType: ModeratedTarget;
  targetId: string;
  decision: ModerationDecision;
  provider?: string;
}): Promise<void> {
  await prisma.moderationResult
    .create({
      data: {
        targetType: input.targetType,
        targetId: input.targetId,
        verdict: input.decision.state,
        score: input.decision.score,
        labels: input.decision.labels,
        provider: input.provider ?? "auto",
      },
    })
    .catch(() => {});
}

const LABEL_TEXT: Record<string, string> = {
  WEIGHT_CUT: "aşırı kilo düşürme yönlendirmesi",
  DOPING: "doping/yasaklı madde içeriği",
  EATING_DISORDER: "yeme bozukluğunu teşvik",
  SEXUAL_CONTENT: "cinsel içerik",
  HARASSMENT: "taciz veya tehdit",
  MINOR_SAFETY: "çocuk güvenliği ihlali",
  TOXICITY: "saldırgan dil",
  SEVERE_TOXICITY: "ağır saldırgan dil",
  THREAT: "tehdit",
  INSULT: "hakaret",
  IDENTITY_ATTACK: "kimliğe yönelik saldırı",
  Explicit: "müstehcen görsel",
  "Explicit Nudity": "müstehcen görsel",
  Violence: "şiddet içeren görsel",
  "Drugs & Tobacco": "uyuşturucu içeriği",
};

function labelText(labels: string[]): string | null {
  const named = labels.map((l) => LABEL_TEXT[l]).filter(Boolean);
  return named.length ? named.join(", ") : null;
}

/** §11.5 — Şeffaflık raporu için otomatik filtre istatistikleri. */
export async function moderationStats(sinceDays = 365) {
  const since = new Date(Date.now() - sinceDays * 86400_000);
  const [total, blocked, review, reviewed] = await Promise.all([
    prisma.moderationResult.count({ where: { createdAt: { gte: since } } }),
    prisma.moderationResult.count({ where: { createdAt: { gte: since }, verdict: "REMOVED" } }),
    prisma.moderationResult.count({ where: { createdAt: { gte: since }, verdict: "PENDING" } }),
    prisma.moderationResult.count({ where: { createdAt: { gte: since }, humanVerdict: { not: null } } }),
  ]);
  return { total, blocked, review, reviewed, approved: total - blocked - review };
}
