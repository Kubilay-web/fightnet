import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Scale } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, EmptyState } from "@/components/ui";
import { AppealForm } from "@/components/appeal-form";
import { formatDateTime } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { appealsCopy } from "@/lib/i18n/pages/panel-trust";

export async function generateMetadata(): Promise<Metadata> {
  const copy = appealsCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

/** Etiketler copy modülünde; burada yalnızca renk tonu tutulur. */
const STATUS_TONE: Record<string, "amber" | "green" | "red" | "neutral"> = {
  OPEN: "amber",
  UPHELD: "red",
  OVERTURNED: "green",
  DISMISSED: "neutral",
};

export default async function AppealsPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = appealsCopy[locale];

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
      <Section title={copy.title} subtitle={copy.subtitle} />

      <p className="text-sm text-muted">
        {copy.intro1}{" "}
        <Link href="/seffaflik" className="font-semibold text-blood-500 hover:underline">
          {copy.transparencyLink}
        </Link>
        {copy.intro2}
      </p>

      <Section title={copy.newTitle}>
        <Card>
          <CardBody>
            <AppealForm />
          </CardBody>
        </Card>
      </Section>

      <Section title={copy.historyTitle}>
        {appeals.length === 0 ? (
          <EmptyState icon={<Scale className="size-8" />} title={copy.empty} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {appeals.map((a) => {
                const tone = STATUS_TONE[a.status] ?? "neutral";
                const statusLabel =
                  copy.status[a.status as keyof typeof copy.status] ?? a.status;
                return (
                  <li key={a.id} className="flex flex-col gap-1.5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{copy.target[a.targetType as keyof typeof copy.target] ?? a.targetType}</Badge>
                      <Badge tone={tone}>{statusLabel}</Badge>
                      <span className="text-xs text-muted">{formatDateTime(a.createdAt, LOCALE_TAG[locale])}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{a.body}</p>
                    {a.decision && (
                      <p className="rounded-xl bg-ink-100 px-3 py-2 text-sm dark:bg-ink-800">
                        <span className="font-bold">{copy.decision}</span>
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
