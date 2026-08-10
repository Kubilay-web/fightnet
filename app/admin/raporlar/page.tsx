import type { Metadata } from "next";
import Link from "next/link";
import { Flag, ShieldAlert, Trash2, Check, Ban } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { resolveReport, moderatePost } from "@/app/admin/actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState, Button, Alert } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { formatDateTime, timeAgo, cn, truncate } from "@/lib/utils";
import { REPORT_REASON_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Moderasyon", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function AdminReportsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;

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
      return { reports, pendingPosts };
    },
    { reports: [], pendingPosts: [] },
  );

  return (
    <div className="flex flex-col gap-8">
      <Section title="Moderasyon" subtitle="Notice-and-Action: 24 saat içinde tepki (DSA gerekliliği)">
        <Alert tone="blue">
          Öncelikli raporlar (çocuk güvenliği, güvensiz sparring, şiddet, cinsel içerik) listenin başındadır.
        </Alert>
        <FilterBar
          basePath="/admin/raporlar"
          current={sp}
          filters={[
            {
              key: "status",
              label: "Durum",
              options: [
                { value: "OPEN", label: "Açık" },
                { value: "IN_REVIEW", label: "İncelemede" },
                { value: "RESOLVED", label: "Çözüldü" },
                { value: "DISMISSED", label: "Reddedildi" },
              ],
            },
            {
              key: "reason",
              label: "Sebep",
              options: Object.entries(REPORT_REASON_LABEL).map(([value, label]) => ({ value, label })),
            },
          ]}
        />
      </Section>

      {/* İnceleme bekleyen videolar */}
      {data.pendingPosts.length > 0 && (
        <Section title="İnceleme Bekleyen İçerik" subtitle="Otomatik ön filtreden geçen videolar">
          <div className="grid gap-3 sm:grid-cols-2">
            {data.pendingPosts.map((p) => (
              <Card key={p.id}>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={p.user.avatarUrl} name={p.user.name} size="sm" />
                    <span className="truncate text-sm font-bold">{p.user.name}</span>
                    <span className="ml-auto text-xs text-muted">{timeAgo(p.createdAt)}</span>
                  </div>
                  {p.body && <p className="line-clamp-2-safe text-sm text-muted">{p.body}</p>}
                  <div className="flex gap-2">
                    <Link href={`/akis/${p.id}`} target="_blank" className="text-xs font-bold text-blood-500 hover:underline">
                      İçeriği aç →
                    </Link>
                  </div>
                  <div className="flex gap-2 border-t border-[var(--border)] pt-3">
                    <form action={moderatePost.bind(null, p.id, "APPROVED")}>
                      <Button type="submit" size="sm">
                        <Check className="size-4" /> Yayınla
                      </Button>
                    </form>
                    <form action={moderatePost.bind(null, p.id, "REMOVED")}>
                      <Button type="submit" size="sm" variant="outline">
                        <Trash2 className="size-4" /> Kaldır
                      </Button>
                    </form>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section title="Raporlar">
        {data.reports.length === 0 ? (
          <EmptyState icon={<Flag className="size-10" />} title="Rapor yok" description="Bu filtrelerle rapor bulunamadı." />
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
                        {r.priority >= 2 && <Badge tone="red">Acil</Badge>}
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
                        Bildiren: {r.reporter.name} · {formatDateTime(r.createdAt)}
                        {r.reportedUser && (
                          <>
                            {" · Hedef: "}
                            <Link href={`/dovuscular/${r.reportedUser.slug}`} className="font-bold hover:text-blood-500">
                              {r.reportedUser.name}
                            </Link>
                            {r.reportedUser.isBanned && " (askıda)"}
                          </>
                        )}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-muted">ID: {r.targetId}</p>
                    </div>
                  </div>

                  {(r.status === "OPEN" || r.status === "IN_REVIEW") && (
                    <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                      <form action={resolveReport.bind(null, r.id, "REMOVE")}>
                        <Button type="submit" size="sm" variant="danger">
                          <Trash2 className="size-4" /> İçeriği Kaldır
                        </Button>
                      </form>
                      {r.reportedUser && (
                        <form action={resolveReport.bind(null, r.id, "BAN")}>
                          <Button type="submit" size="sm" variant="danger">
                            <Ban className="size-4" /> Kullanıcıyı Askıya Al
                          </Button>
                        </form>
                      )}
                      <form action={resolveReport.bind(null, r.id, "DISMISS")}>
                        <Button type="submit" size="sm" variant="outline">
                          <Check className="size-4" /> Reddet (sorun yok)
                        </Button>
                      </form>
                    </div>
                  )}

                  {r.resolution && (
                    <p className="text-xs text-muted">Karar: {r.resolution}</p>
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
