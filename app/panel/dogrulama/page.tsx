import type { Metadata } from "next";
import { ShieldCheck, Mail, IdCard, Award, Clock, CheckCircle2, XCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, Alert } from "@/components/ui";
import { VerificationForm } from "@/components/verification-form";
import { formatDateTime, cn } from "@/lib/utils";
import { VERIFICATION_LABEL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { verificationCopy } from "@/lib/i18n/pages/panel-trust";

export async function generateMetadata(): Promise<Metadata> {
  const copy = verificationCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

const LEVELS = [
  { key: "LEVEL_0", icon: Mail },
  { key: "LEVEL_1", icon: IdCard },
  { key: "LEVEL_2", icon: Award },
] as const;

export default async function VerificationPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = verificationCopy[locale];

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
      <Section title={copy.title} subtitle={copy.subtitle}>
        <Alert tone="blue">
          {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
          {copy.currentLevel} <b>{VERIFICATION_LABEL[user.verification]}</b>
        </Alert>
      </Section>

      <div className="grid gap-4 lg:grid-cols-3">
        {LEVELS.map((l, i) => {
          const reached = i <= currentIndex;
          const Icon = l.icon;
          const level = copy.levels[l.key];
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
                  {reached && <Badge tone="green">{copy.completed}</Badge>}
                </div>
                <h3 className="font-bold">{level.title}</h3>
                <p className="text-sm text-muted">{level.desc}</p>
                <ul className="flex flex-col gap-1">
                  {level.perks.map((p) => (
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
        <Section title={copy.requestsTitle}>
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
                    {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                    <p className="text-sm font-bold">
                      {copy.requestFor.replace("{level}", VERIFICATION_LABEL[r.targetLevel])}
                    </p>
                    <p className="text-xs text-muted">{formatDateTime(r.createdAt, LOCALE_TAG[locale])}</p>
                    {r.reviewNote && <p className="mt-1 text-xs">{r.reviewNote}</p>}
                  </div>
                  <Badge tone={r.status === "APPROVED" ? "green" : r.status === "REJECTED" ? "red" : "amber"}>
                    {r.status === "APPROVED"
                      ? copy.status.approved
                      : r.status === "REJECTED"
                        ? copy.status.rejected
                        : copy.status.pending}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      {/* Yeni talep */}
      {pending ? (
        <Alert tone="amber" title={copy.pending.title}>
          {copy.pending.body}
        </Alert>
      ) : user.verification === "LEVEL_2" ? (
        <Alert tone="green" title={copy.maxLevel.title}>
          {copy.maxLevel.body}
        </Alert>
      ) : (
        <Section
          title={user.verification === "LEVEL_0" ? copy.apply.l1Title : copy.apply.l2Title}
          subtitle={
            user.verification === "LEVEL_0" ? copy.apply.l1Subtitle : copy.apply.l2Subtitle
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
