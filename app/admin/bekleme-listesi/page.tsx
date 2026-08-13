import type { Metadata } from "next";
import { ListChecks, Send } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { inviteWaitlist } from "@/app/admin/actions";
import { Badge, Card, Section, EmptyState, Button, Stat, Pagination } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { formatDate } from "@/lib/utils";
import { PAGE_SIZE, DISCIPLINE_LABEL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { adminWaitlistCopy } from "@/lib/i18n/pages/admin-ops";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminWaitlistCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function AdminWaitlistPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const locale = await getLocale();
  const t = adminWaitlistCopy[locale];
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where: Prisma.WaitlistEntryWhereInput = {};
  if (sp.status) where.status = sp.status as never;
  if (sp.role) where.role = sp.role;
  if (sp.q) {
    where.OR = [
      { email: { contains: sp.q, mode: "insensitive" } },
      { name: { contains: sp.q, mode: "insensitive" } },
      { gymName: { contains: sp.q, mode: "insensitive" } },
      { city: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const data = await safe(
    async () => {
      const [entries, total, pending, invited, converted] = await Promise.all([
        prisma.waitlistEntry.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        prisma.waitlistEntry.count({ where }),
        prisma.waitlistEntry.count({ where: { status: "PENDING" } }),
        prisma.waitlistEntry.count({ where: { status: "INVITED" } }),
        prisma.waitlistEntry.count({ where: { status: "CONVERTED" } }),
      ]);
      return { entries, total, pending, invited, converted };
    },
    { entries: [], total: 0, pending: 0, invited: 0, converted: 0 },
  );

  const conversionRate = data.invited > 0 ? Math.round((data.converted / data.invited) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <Section title={t.title} subtitle={t.subtitle} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t.stats.total} value={data.total} />
        <Stat label={t.stats.pending} value={data.pending} tone="amber" />
        <Stat label={t.stats.invited} value={data.invited} />
        <Stat
          label={t.stats.conversion}
          value={t.stats.conversionValue(conversionRate)}
          tone="green"
          hint={t.stats.convertedHint(data.converted)}
        />
      </div>

      <FilterBar
        basePath="/admin/bekleme-listesi"
        current={sp}
        filters={[
          {
            key: "status",
            label: t.filterStatus,
            options: [
              { value: "PENDING", label: t.status.PENDING },
              { value: "INVITED", label: t.status.INVITED },
              { value: "CONVERTED", label: t.status.CONVERTED },
              { value: "UNSUBSCRIBED", label: t.status.UNSUBSCRIBED },
            ],
          },
          {
            key: "role",
            label: t.filterRole,
            options: [
              { value: "ATHLETE", label: t.roles.ATHLETE },
              { value: "COACH", label: t.roles.COACH },
              { value: "GYM_OWNER", label: t.roles.GYM_OWNER },
              { value: "ORGANIZER", label: t.roles.ORGANIZER },
              { value: "FAN", label: t.roles.FAN },
            ],
          },
        ]}
        searchKey="q"
        searchPlaceholder={t.searchPlaceholder}
      />

      {data.entries.length === 0 ? (
        <EmptyState icon={<ListChecks className="size-10" />} title={t.empty} />
      ) : (
        <Card>
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase tracking-wider text-muted">
                  <th className="p-3">{t.columns.email}</th>
                  <th className="p-3">{t.columns.name}</th>
                  <th className="p-3">{t.columns.role}</th>
                  <th className="p-3">{t.columns.cityGym}</th>
                  <th className="p-3">{t.columns.signedUp}</th>
                  <th className="p-3">{t.columns.status}</th>
                  <th className="p-3">{t.columns.action}</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((e) => (
                  <tr key={e.id} className="border-b border-[var(--border)]">
                    <td className="p-3 font-mono text-xs">{e.email}</td>
                    <td className="p-3">{e.name ?? "—"}</td>
                    <td className="p-3">
                      <Badge>{e.role ?? "—"}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted">
                      {e.city ?? "—"}
                      {e.gymName && <div className="font-semibold">{e.gymName}</div>}
                      {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                      {e.discipline && <div>{DISCIPLINE_LABEL[e.discipline]}</div>}
                    </td>
                    <td className="p-3 text-xs text-muted">{formatDate(e.createdAt, LOCALE_TAG[locale])}</td>
                    <td className="p-3">
                      <Badge
                        tone={
                          e.status === "CONVERTED" ? "green" : e.status === "INVITED" ? "blue" : "amber"
                        }
                      >
                        {e.status}
                      </Badge>
                      {e.betaCode && <div className="mt-1 font-mono text-[11px]">{e.betaCode}</div>}
                    </td>
                    <td className="p-3">
                      {e.status === "PENDING" && (
                        <form action={inviteWaitlist.bind(null, e.id)}>
                          <Button type="submit" size="sm">
                            <Send className="size-4" /> {t.invite}
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Pagination
        page={page}
        totalPages={Math.ceil(data.total / PAGE_SIZE)}
        basePath="/admin/bekleme-listesi"
        params={sp}
      />
    </div>
  );
}
