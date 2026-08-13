import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Scale } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState, Alert } from "@/components/ui";
import { AppealDecision } from "@/components/appeal-decision";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { adminCoreCopy } from "@/lib/i18n/pages/admin-core";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminCoreCopy[await getLocale()].appeals;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

/** Ton dilden bağımsız; etiket copy modülündeki `appeals.status` tablosundan gelir. */
const STATUS_TONE: Record<string, "amber" | "green" | "red" | "neutral"> = {
  OPEN: "amber",
  UPHELD: "red",
  OVERTURNED: "green",
  DISMISSED: "neutral",
};

export default async function AdminAppealsPage() {
  await requireAdmin();
  const locale = await getLocale();
  const c = adminCoreCopy[locale].appeals;
  const tag = LOCALE_TAG[locale];

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
        title={c.title}
        subtitle={c.subtitle}
      />

      <Alert tone="neutral">
        {c.noticeBefore}
        <Link href="/seffaflik" className="font-bold underline">
          {c.noticeLink}
        </Link>
        {c.noticeAfter}
      </Alert>

      {open.length > 0 && (
        <Alert tone="amber" title={c.pending(open.length)} />
      )}

      {appeals.length === 0 ? (
        <EmptyState icon={<Scale className="size-10" />} title={c.empty.title} description={c.empty.description} />
      ) : (
        <div className="flex flex-col gap-3">
          {appeals.map((a) => {
            const tone = STATUS_TONE[a.status];
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
                    <Badge tone={tone}>{c.status[a.status]}</Badge>
                    <span className="ml-auto text-xs text-muted">{timeAgo(a.createdAt, locale)}</span>
                  </div>

                  <p className="break-all text-xs text-muted">{c.subject}{a.targetId}</p>
                  <p className="whitespace-pre-wrap text-sm">{a.body}</p>

                  {a.status === "OPEN" ? (
                    <AppealDecision id={a.id} />
                  ) : (
                    a.decision && (
                      <p className="rounded-xl bg-ink-100 px-3 py-2 text-sm dark:bg-ink-800">
                        <span className="font-bold">{c.decision}</span>
                        {a.decision}
                        {a.resolvedAt && (
                          <span className="ml-2 text-xs text-muted">{formatDateTime(a.resolvedAt, tag)}</span>
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
