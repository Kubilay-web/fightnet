import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState } from "@/components/ui";
import { ReviewActions } from "@/components/admin-review-actions";
import { reviewVerification } from "@/app/admin/actions";
import { cld } from "@/lib/image";
import { formatDateTime, age } from "@/lib/utils";
import { VERIFICATION_LABEL, ROLE_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Doğrulama Kuyruğu", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminVerificationPage() {
  await requireAdmin();

  const requests = await safe(
    () =>
      prisma.verificationRequest.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 50,
        select: {
          id: true, targetLevel: true, claimedRole: true, note: true, createdAt: true,
          idDocUrl: true, selfieUrl: true, proofUrls: true,
          user: {
            select: {
              id: true, name: true, username: true, slug: true, avatarUrl: true,
              email: true, city: true, country: true, birthDate: true, isMinor: true,
              verification: true, role: true, createdAt: true,
              _count: { select: { sportProfiles: true, trainingLogs: true } },
            },
          },
        },
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Doğrulama Kuyruğu"
        subtitle={`${requests.length} bekleyen talep — Seviye 1 (KYC) ve Seviye 2 (durum)`}
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={<BadgeCheck className="size-10" />}
          title="Kuyruk temiz"
          description="Bekleyen doğrulama talebi yok."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardBody className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start gap-3">
                  <Avatar src={r.user.avatarUrl} name={r.user.name} size="lg" href={`/dovuscular/${r.user.slug}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/dovuscular/${r.user.slug}`} className="font-bold hover:text-blood-500">
                        {r.user.name}
                      </Link>
                      <VerifiedMark level={r.user.verification} />
                      {r.user.isMinor && <Badge tone="red">18 yaş altı</Badge>}
                    </div>
                    <p className="text-xs text-muted">
                      @{r.user.username} · {r.user.email} · {r.user.city ?? "—"}, {r.user.country}
                    </p>
                    <p className="text-xs text-muted">
                      {age(r.user.birthDate) ? `${age(r.user.birthDate)} yaş · ` : ""}
                      {r.user._count.sportProfiles} disiplin · {r.user._count.trainingLogs} antrenman ·
                      Üyelik: {formatDateTime(r.user.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={r.targetLevel === "LEVEL_2" ? "gold" : "blue"}>
                      {VERIFICATION_LABEL[r.targetLevel]}
                    </Badge>
                    {r.claimedRole && <Badge>{ROLE_LABEL[r.claimedRole]}</Badge>}
                    <span className="text-[11px] text-muted">{formatDateTime(r.createdAt)}</span>
                  </div>
                </div>

                {r.note && (
                  <p className="rounded-xl bg-[var(--bg-subtle)] p-3 text-sm">
                    <b className="text-xs uppercase text-muted">Kullanıcı notu:</b> {r.note}
                  </p>
                )}

                {/* Belgeler */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {r.idDocUrl && <DocPreview url={r.idDocUrl} label="Kimlik Belgesi" />}
                  {r.selfieUrl && <DocPreview url={r.selfieUrl} label="Selfie" />}
                  {r.proofUrls.map((u, i) => (
                    <DocPreview key={u} url={u} label={`Kanıt ${i + 1}`} />
                  ))}
                </div>

                <ReviewActions
                  onApprove={reviewVerification.bind(null, r.id, true)}
                  onReject={reviewVerification.bind(null, r.id, false)}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DocPreview({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      className="group relative block aspect-[3/2] overflow-hidden rounded-xl border border-[var(--border)]"
    >
      <Image src={cld(url, { w: 480, h: 320 })} alt={label} fill sizes="240px" className="object-cover" />
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2 py-1 text-[11px] font-bold text-white">
        {label}
        <ExternalLink className="size-3" />
      </span>
    </a>
  );
}
