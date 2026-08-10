import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState, Alert } from "@/components/ui";
import { AppealDecision } from "@/components/appeal-decision";
import { formatDateTime, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "İtirazlar", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "amber" | "green" | "red" | "neutral" }> = {
  OPEN: { label: "Açık", tone: "amber" },
  UPHELD: { label: "Karar korundu", tone: "red" },
  OVERTURNED: { label: "Karar geri alındı", tone: "green" },
  DISMISSED: { label: "İşleme alınmadı", tone: "neutral" },
};

export default async function AdminAppealsPage() {
  await requireAdmin();

  const appeals = await safe(
    () =>
      prisma.appeal.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
        take: 100,
        select: {
          id: true, targetType: true, targetId: true, body: true, status: true,
          decision: true, createdAt: true, resolvedAt: true,
          user: { select: { name: true, slug: true, avatarUrl: true, username: true } },
        },
      }),
    [],
  );

  const open = appeals.filter((a) => a.status === "OPEN");

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="İtirazlar"
        subtitle="§11.5 DSA şikayet mekanizması — kararı veren kişiden bağımsız değerlendirme"
      />

      <Alert tone="neutral">
        Sonuçlar{" "}
        <Link href="/seffaflik" className="font-bold underline">
          kamuya açık şeffaflık raporunda
        </Link>{" "}
        toplu sayı olarak yayınlanır. Karar gerekçesi kullanıcıya aynen iletilir — anlaşılır ve
        somut yaz.
      </Alert>

      {open.length > 0 && (
        <Alert tone="amber" title={`${open.length} itiraz karar bekliyor`} />
      )}

      {appeals.length === 0 ? (
        <EmptyState icon={<Scale className="size-10" />} title="İtiraz yok" description="Kuyruk temiz." />
      ) : (
        <div className="flex flex-col gap-3">
          {appeals.map((a) => {
            const s = STATUS[a.status];
            return (
              <Card key={a.id} className={a.status === "OPEN" ? "border-amber-500/40" : undefined}>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Avatar src={a.user.avatarUrl} name={a.user.name} size="sm" href={`/dovuscular/${a.user.slug}`} />
                    <Link href={`/dovuscular/${a.user.slug}`} className="font-bold hover:underline">
                      {a.user.name}
                    </Link>
                    <span className="text-xs text-muted">@{a.user.username}</span>
                    <Badge>{a.targetType}</Badge>
                    <Badge tone={s.tone}>{s.label}</Badge>
                    <span className="ml-auto text-xs text-muted">{timeAgo(a.createdAt)}</span>
                  </div>

                  <p className="break-all text-xs text-muted">Konu: {a.targetId}</p>
                  <p className="whitespace-pre-wrap text-sm">{a.body}</p>

                  {a.status === "OPEN" ? (
                    <AppealDecision id={a.id} />
                  ) : (
                    a.decision && (
                      <p className="rounded-xl bg-ink-100 px-3 py-2 text-sm dark:bg-ink-800">
                        <span className="font-bold">Karar: </span>
                        {a.decision}
                        {a.resolvedAt && (
                          <span className="ml-2 text-xs text-muted">{formatDateTime(a.resolvedAt)}</span>
                        )}
                      </p>
                    )
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
