import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Flag, ShieldAlert, Trash2, Check, Ban } from "lucide-react";
import type { Prisma, PostType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { resolveReport, moderatePost } from "@/app/admin/actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState, Button, Alert } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { formatDateTime, timeAgo, cn, truncate } from "@/lib/utils";
// TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir
import { REPORT_REASON_LABEL } from "@/lib/constants";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { adminCoreCopy } from "@/lib/i18n/pages/admin-core";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminCoreCopy[await getLocale()].reports;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

/** `safe` fallback'inin tipini pendingPosts ile hizalar */
const EMPTY_POST = {} as {
  id: string;
  type: PostType;
  body: string | null;
  thumbUrl: string | null;
  mediaUrl: string | null;
  createdAt: Date;
  user: { name: string; slug: string; avatarUrl: string | null };
  filter: { targetId: string; score: number; labels: string[]; provider: string; reason: string | null } | null;
};

export default async function AdminReportsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const locale = await getLocale();
  const all = adminCoreCopy[locale];
  const c = all.reports;
  const tag = LOCALE_TAG[locale];

  const where: Prisma.ReportWhereInput = {};
  where.status = sp.status ? (sp.status as never) : { in: ["OPEN", "IN_REVIEW"] };
  if (sp.reason) where.reason = sp.reason as never;

  const data = await safe(
    async () => {
      const [reports, pendingPosts] = await Promise.all([
        prisma.report.findMany({
          where,
          orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
          take: 60,
          select: {
            id: true, targetType: true, targetId: true, reason: true, description: true,
            status: true, priority: true, createdAt: true, resolution: true,
            reporter: { select: { name: true, slug: true, avatarUrl: true } },
            reportedUser: { select: { name: true, slug: true, avatarUrl: true, isBanned: true } },
          },
        }),
        // §11.3 — Video ön filtre kuyruğu
        prisma.post.findMany({
          where: { moderation: "PENDING" },
          orderBy: { createdAt: "asc" },
          take: 20,
          select: {
            id: true, type: true, body: true, thumbUrl: true, mediaUrl: true, createdAt: true,
            user: { select: { name: true, slug: true, avatarUrl: true } },
          },
        }),
      ]);

      // §11.3 — Ön filtrenin bu içerikler için verdiği kararı yanına iliştir:
      // moderatör neyin neden kuyruğa düştüğünü görmeden karar vermemeli.
      const results = pendingPosts.length
        ? await prisma.moderationResult.findMany({
            where: { targetType: "POST", targetId: { in: pendingPosts.map((p) => p.id) } },
            orderBy: { createdAt: "desc" },
            select: { targetId: true, score: true, labels: true, provider: true, reason: true },
          })
        : [];
      const byTarget = new Map(results.map((r) => [r.targetId, r]));

      return {
        reports,
        pendingPosts: pendingPosts.map((p) => ({ ...p, filter: byTarget.get(p.id) ?? null })),
      };
    },
    { reports: [], pendingPosts: [] as (typeof EMPTY_POST)[] },
  );

  return (
    <div className="flex flex-col gap-8">
      <Section title={c.title} subtitle={c.subtitle}>
        <Alert tone="blue">{c.priorityNotice}</Alert>
        <FilterBar
          basePath="/admin/raporlar"
          current={sp}
          filters={[
            {
              key: "status",
              label: c.statusLabel,
              options: [
                { value: "OPEN", label: c.statusOptions.open },
                { value: "IN_REVIEW", label: c.statusOptions.inReview },
                { value: "RESOLVED", label: c.statusOptions.resolved },
                { value: "DISMISSED", label: c.statusOptions.dismissed },
              ],
            },
            {
              key: "reason",
              label: c.reasonLabel,
              options: Object.entries(REPORT_REASON_LABEL).map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      </Section>

      {/* İnceleme bekleyen videolar */}
      {data.pendingPosts.length > 0 && (
        <Section title={c.pendingTitle} subtitle={c.pendingSubtitle}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.pendingPosts.map((p) => (
              <Card key={p.id}>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={p.user.avatarUrl} name={p.user.name} size="sm" />
                    <span className="truncate text-sm font-bold">{p.user.name}</span>
                    <span className="ml-auto text-xs text-muted">{timeAgo(p.createdAt, locale)}</span>
                  </div>
                  {p.body && <p className="line-clamp-2-safe text-sm text-muted">{p.body}</p>}
                  {p.filter && (
                    <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[var(--surface-2)] px-2.5 py-2">
                      <Badge tone={p.filter.score >= 0.6 ? "red" : p.filter.score >= 0.35 ? "amber" : "neutral"}>
                        {c.risk(all.percent(Math.round(p.filter.score * 100)))}
                      </Badge>
                      {p.filter.labels.map((l) => (
                        <Badge key={l} tone="neutral">{l}</Badge>
                      ))}
                      <span className="ml-auto text-[11px] text-muted">{p.filter.provider}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/akis/${p.id}`} target="_blank" className="text-xs font-bold text-blood-500 hover:underline">
                      {c.openContent}
                    </Link>
                  </div>
                  <div className="flex gap-2 border-t border-[var(--border)] pt-3">
                    <form action={moderatePost.bind(null, p.id, "APPROVED")}>
                      <Button type="submit" size="sm">
                        <Check className="size-4" /> {c.publish}
                      </Button>
                    </form>
                    <form action={moderatePost.bind(null, p.id, "REMOVED")}>
                      <Button type="submit" size="sm" variant="outline">
                        <Trash2 className="size-4" /> {c.remove}
                      </Button>
                    </form>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section title={c.listTitle}>
        {data.reports.length === 0 ? (
          <EmptyState icon={<Flag className="size-10" />} title={c.empty.title} description={c.empty.description} />
        ) : (
          <div className="flex flex-col gap-3">
            {data.reports.map((r) => (
              <Card key={r.id} className={cn(r.priority >= 2 && "border-blood-500/50")}>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start gap-3">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        r.priority >= 2 ? "bg-blood-500/10 text-blood-500" : "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      <ShieldAlert className="size-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{REPORT_REASON_LABEL[r.reason]}</h3>
                        <Badge>{r.targetType}</Badge>
                        {r.priority >= 2 && <Badge tone="red">{c.urgent}</Badge>}
                        <Badge
                          tone={
                            r.status === "OPEN" ? "amber" : r.status === "RESOLVED" ? "green" : "neutral"
                          }
                        >
                          {r.status}
                        </Badge>
                      </div>
                      {r.description && <p className="mt-1 text-sm">{r.description}</p>}
                      <p className="mt-1 text-xs text-muted">
                        {c.reporter(r.reporter.name)} · {formatDateTime(r.createdAt, tag)}
                        {r.reportedUser && (
                          <>
                            {c.targetPrefix}
                            <Link href={`/dovuscular/${r.reportedUser.slug}`} className="font-bold hover:text-blood-500">
                              {r.reportedUser.name}
                            </Link>
                            {r.reportedUser.isBanned && c.bannedSuffix}
                          </>
                        )}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-muted">{c.idPrefix}{r.targetId}</p>
                    </div>
                  </div>

                  {(r.status === "OPEN" || r.status === "IN_REVIEW") && (
                    <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                      <form action={resolveReport.bind(null, r.id, "REMOVE")}>
                        <Button type="submit" size="sm" variant="danger">
                          <Trash2 className="size-4" /> {c.removeContent}
                        </Button>
                      </form>
                      {r.reportedUser && (
                        <form action={resolveReport.bind(null, r.id, "BAN")}>
                          <Button type="submit" size="sm" variant="danger">
                            <Ban className="size-4" /> {c.banUser}
                          </Button>
                        </form>
                      )}
                      <form action={resolveReport.bind(null, r.id, "DISMISS")}>
                        <Button type="submit" size="sm" variant="outline">
                          <Check className="size-4" /> {c.dismiss}
                        </Button>
                      </form>
                    </div>
                  )}

                  {r.resolution && (
                    <p className="text-xs text-muted">{c.resolution}{r.resolution}</p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
