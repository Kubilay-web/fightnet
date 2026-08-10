import type { Metadata } from "next";
import { ListChecks, Send, Download } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { inviteWaitlist } from "@/app/admin/actions";
import { Badge, Card, Section, EmptyState, Button, Stat, Pagination } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { formatDate } from "@/lib/utils";
import { PAGE_SIZE, DISCIPLINE_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Bekleme Listesi", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function AdminWaitlistPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
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
      <Section title="Bekleme Listesi" subtitle="Beta programı kayıtları — davet ve dönüşüm takibi" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Toplam" value={data.total} />
        <Stat label="Bekliyor" value={data.pending} tone="amber" />
        <Stat label="Davet edildi" value={data.invited} />
        <Stat label="Dönüşüm" value={`%${conversionRate}`} tone="green" hint={`${data.converted} üye oldu`} />
      </div>

      <FilterBar
        basePath="/admin/bekleme-listesi"
        current={sp}
        filters={[
          {
            key: "status",
            label: "Durum",
            options: [
              { value: "PENDING", label: "Bekliyor" },
              { value: "INVITED", label: "Davet edildi" },
              { value: "CONVERTED", label: "Üye oldu" },
              { value: "UNSUBSCRIBED", label: "Ayrıldı" },
            ],
          },
          {
            key: "role",
            label: "Rol",
            options: [
              { value: "ATHLETE", label: "Sporcu" },
              { value: "COACH", label: "Antrenör" },
              { value: "GYM_OWNER", label: "Salon" },
              { value: "ORGANIZER", label: "Organizatör" },
              { value: "FAN", label: "Hayran" },
            ],
          },
        ]}
        searchKey="q"
        searchPlaceholder="E-posta, isim, salon veya şehir…"
      />

      {data.entries.length === 0 ? (
        <EmptyState icon={<ListChecks className="size-10" />} title="Kayıt yok" />
      ) : (
        <Card>
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase tracking-wider text-muted">
                  <th className="p-3">E-posta</th>
                  <th className="p-3">İsim</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Şehir / Salon</th>
                  <th className="p-3">Kayıt</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3">İşlem</th>
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
                      {e.discipline && <div>{DISCIPLINE_LABEL[e.discipline]}</div>}
                    </td>
                    <td className="p-3 text-xs text-muted">{formatDate(e.createdAt)}</td>
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
                            <Send className="size-4" /> Davet Et
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
