import type { Metadata } from "next";
import { ShieldCheck, Mail, IdCard, Award, Clock, CheckCircle2, XCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, Alert } from "@/components/ui";
import { VerificationForm } from "@/components/verification-form";
import { formatDateTime, cn } from "@/lib/utils";
import { VERIFICATION_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Doğrulama", robots: { index: false } };
export const dynamic = "force-dynamic";

const LEVELS = [
  {
    key: "LEVEL_0",
    icon: Mail,
    title: "Seviye 0 — Temel",
    desc: "Sadece e-posta onayı. Kısıtlamalarla okuyabilir ve yorum yapabilirsin.",
    perks: ["Profil oluşturma", "Gönderileri görme", "Sınırlı yorum"],
  },
  {
    key: "LEVEL_1",
    icon: IdCard,
    title: "Seviye 1 — Kimlik doğrulanmış",
    desc: "Kimlik belgesi + selfie eşleştirme (KYC). Gerçek isim profili açılır.",
    perks: ["Sparring araması", "Canlı yorum", "Gerçek isim rozeti", "Rezervasyon önceliği"],
  },
  {
    key: "LEVEL_2",
    icon: Award,
    title: "Seviye 2 — Durum doğrulanmış",
    desc: "Seviye 1 + durum kanıtı (federasyon üyeliği, antrenör lisansı, salon belgesi).",
    perks: ["Öğrencilere kefil olma", "Salon/etkinlik yönetimi", "Sponsor portalı", "Creator sayfası"],
  },
];

export default async function VerificationPage() {
  const user = await requireUser();

  const requests = await safe(
    () =>
      prisma.verificationRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true, targetLevel: true, status: true, claimedRole: true,
          reviewNote: true, reviewedAt: true, createdAt: true,
        },
      }),
    [],
  );

  const pending = requests.find((r) => r.status === "PENDING");
  const currentIndex = LEVELS.findIndex((l) => l.key === user.verification);

  return (
    <div className="flex flex-col gap-8">
      <Section title="Doğrulama" subtitle="Güven, sistem tasarımıyla kurulur — 3 seviyeli doğrulama (§4.5)">
        <Alert tone="blue">
          Mevcut seviyen: <b>{VERIFICATION_LABEL[user.verification]}</b>
        </Alert>
      </Section>

      <div className="grid gap-4 lg:grid-cols-3">
        {LEVELS.map((l, i) => {
          const reached = i <= currentIndex;
          const Icon = l.icon;
          return (
            <Card key={l.key} className={cn(reached && "border-emerald-500/50")}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl",
                      reached ? "bg-emerald-500/10 text-emerald-500" : "bg-ink-100 text-muted dark:bg-ink-800",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  {reached && <Badge tone="green">Tamamlandı</Badge>}
                </div>
                <h3 className="font-bold">{l.title}</h3>
                <p className="text-sm text-muted">{l.desc}</p>
                <ul className="flex flex-col gap-1">
                  {l.perks.map((p) => (
                    <li key={p} className="flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className={cn("size-3.5 shrink-0", reached ? "text-emerald-500" : "text-ink-400")} />
                      {p}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Talep geçmişi */}
      {requests.length > 0 && (
        <Section title="Taleplerim">
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {requests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-3 p-4">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      r.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : r.status === "REJECTED"
                          ? "bg-blood-500/10 text-blood-500"
                          : "bg-amber-500/10 text-amber-500",
                    )}
                  >
                    {r.status === "APPROVED" ? (
                      <CheckCircle2 className="size-4" />
                    ) : r.status === "REJECTED" ? (
                      <XCircle className="size-4" />
                    ) : (
                      <Clock className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{VERIFICATION_LABEL[r.targetLevel]} talebi</p>
                    <p className="text-xs text-muted">{formatDateTime(r.createdAt)}</p>
                    {r.reviewNote && <p className="mt-1 text-xs">{r.reviewNote}</p>}
                  </div>
                  <Badge tone={r.status === "APPROVED" ? "green" : r.status === "REJECTED" ? "red" : "amber"}>
                    {r.status === "APPROVED" ? "Onaylandı" : r.status === "REJECTED" ? "Reddedildi" : "İnceleniyor"}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      {/* Yeni talep */}
      {pending ? (
        <Alert tone="amber" title="Talebin inceleniyor">
          Doğrulama ekibimiz belgelerini kontrol ediyor. Sonuçlandığında bildirim alacaksın.
          Genelde 24-48 saat sürer.
        </Alert>
      ) : user.verification === "LEVEL_2" ? (
        <Alert tone="green" title="En yüksek seviyedesin">
          Tüm platform özellikleri hesabına açık. Artık öğrencilerine kefil olabilirsin.
        </Alert>
      ) : (
        <Section
          title={user.verification === "LEVEL_0" ? "Seviye 1 Başvurusu" : "Seviye 2 Başvurusu"}
          subtitle={
            user.verification === "LEVEL_0"
              ? "Kimlik belgesi ve selfie ile kimliğini doğrula"
              : "Sporcu / antrenör / salon durumunu belgele"
          }
        >
          <Card>
            <CardBody>
              <VerificationForm targetLevel={user.verification === "LEVEL_0" ? "LEVEL_1" : "LEVEL_2"} />
            </CardBody>
          </Card>
        </Section>
      )}
    </div>
  );
}
