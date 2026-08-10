import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, EmptyState } from "@/components/ui";
import { AppealForm } from "@/components/appeal-form";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "İtirazlarım", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "amber" | "green" | "red" | "neutral" }> = {
  OPEN: { label: "İnceleniyor", tone: "amber" },
  UPHELD: { label: "Karar korundu", tone: "red" },
  OVERTURNED: { label: "Karar geri alındı", tone: "green" },
  DISMISSED: { label: "İtiraz reddedildi", tone: "neutral" },
};

const TARGET_LABEL: Record<string, string> = {
  POST: "Gönderi",
  COMMENT: "Yorum",
  USER: "Hesap",
  THREAD: "Forum konusu",
  FORUM_POST: "Forum yanıtı",
  MESSAGE: "Mesaj",
};

export default async function AppealsPage() {
  const user = await requireUser();

  const appeals = await safe(
    () =>
      prisma.appeal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, targetType: true, targetId: true, body: true, status: true, decision: true, createdAt: true, resolvedAt: true },
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-8">
      <Section
        title="İtirazlarım"
        subtitle="Moderasyon kararlarına itiraz — §11.5 DSA şikayet mekanizması"
      />

      <p className="text-sm text-muted">
        İçeriğin kaldırıldıysa, hesabın kısıtlandıysa ya da bir bildirimin sonuçsuz kaldığını
        düşünüyorsan itiraz edebilirsin. İtirazın kararı veren kişiden bağımsız olarak yeniden
        değerlendirilir. Sonuçlar{" "}
        <Link href="/seffaflik" className="font-semibold text-blood-500 hover:underline">
          şeffaflık raporunda
        </Link>{" "}
        toplu olarak yayınlanır.
      </p>

      <Section title="Yeni İtiraz">
        <Card>
          <CardBody>
            <AppealForm />
          </CardBody>
        </Card>
      </Section>

      <Section title="Geçmiş">
        {appeals.length === 0 ? (
          <EmptyState icon={<Scale className="size-8" />} title="Henüz itirazın yok" />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {appeals.map((a) => {
                const s = STATUS[a.status];
                return (
                  <li key={a.id} className="flex flex-col gap-1.5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{TARGET_LABEL[a.targetType] ?? a.targetType}</Badge>
                      <Badge tone={s.tone}>{s.label}</Badge>
                      <span className="text-xs text-muted">{formatDateTime(a.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{a.body}</p>
                    {a.decision && (
                      <p className="rounded-xl bg-ink-100 px-3 py-2 text-sm dark:bg-ink-800">
                        <span className="font-bold">Karar: </span>
                        {a.decision}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </Section>
    </div>
  );
}
