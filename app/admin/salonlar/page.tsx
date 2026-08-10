import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Check, Pause, Star } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { setGymStatus } from "@/app/admin/actions";
import { Badge, Card, Section, EmptyState, Button, Pagination } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { formatDate, formatMoney } from "@/lib/utils";
import { DISCIPLINE_LABEL, PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = { title: "Salonlar", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function AdminGymsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const q = sp.q?.trim();

  const where: Prisma.GymWhereInput = {};
  if (sp.status) where.status = sp.status as never;
  if (sp.flag === "halo") where.isHalo = true;
  if (sp.flag === "founder") where.isFounder = true;
  if (sp.flag === "unverified") where.isVerified = false;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const [gyms, total] = await Promise.all([
    safe(
      () =>
        prisma.gym.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true, slug: true, name: true, city: true, country: true, status: true,
            isVerified: true, isFounder: true, isHalo: true, plan: true, planPrice: true,
            disciplines: true, memberCount: true, createdAt: true,
            owner: { select: { name: true, slug: true } },
            _count: { select: { memberships: true, bookings: true, classes: true } },
          },
        }),
      [],
    ),
    safe(() => prisma.gym.count({ where }), 0),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Salonlar" subtitle={`${total} salon — onay, doğrulama ve Halo işaretleme`}>
        <FilterBar
          basePath="/admin/salonlar"
          current={sp}
          filters={[
            {
              key: "status",
              label: "Durum",
              options: [
                { value: "PENDING", label: "Onay bekliyor" },
                { value: "ACTIVE", label: "Aktif" },
                { value: "SUSPENDED", label: "Askıda" },
              ],
            },
            {
              key: "flag",
              label: "İşaret",
              options: [
                { value: "halo", label: "Halo salon" },
                { value: "founder", label: "Kurucu salon" },
                { value: "unverified", label: "Doğrulanmamış" },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder="Salon adı veya şehir…"
        />
      </Section>

      {gyms.length === 0 ? (
        <EmptyState icon={<Building2 className="size-10" />} title="Salon bulunamadı" />
      ) : (
        <div className="flex flex-col gap-3">
          {gyms.map((g) => (
            <Card key={g.id}>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <Link href={`/salonlar/${g.slug}`} target="_blank" className="font-bold hover:text-blood-500">
                        {g.name}
                      </Link>
                      {g.isVerified && <Badge tone="green">Doğrulanmış</Badge>}
                      {g.isHalo && <Badge tone="gold">Halo</Badge>}
                      {g.isFounder && <Badge tone="gold">Kurucu</Badge>}
                      <Badge
                        tone={g.status === "ACTIVE" ? "green" : g.status === "PENDING" ? "amber" : "red"}
                      >
                        {g.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted">
                      {g.city}, {g.country} · {g.owner?.name ?? "Sahipsiz"} · {formatDate(g.createdAt)}
                    </p>
                    <p className="text-xs text-muted">
                      {g._count.memberships} üye · {g._count.classes} ders · {g._count.bookings} rezervasyon ·
                      Plan: {g.plan} {g.planPrice > 0 && `(${formatMoney(g.planPrice)}/ay)`}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {g.disciplines.slice(0, 5).map((d) => (
                        <Badge key={d}>{DISCIPLINE_LABEL[d]}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                  {g.status !== "ACTIVE" && (
                    <form action={setGymStatus.bind(null, g.id, { status: "ACTIVE", isVerified: true })}>
                      <Button type="submit" size="sm">
                        <Check className="size-4" /> Onayla & Yayınla
                      </Button>
                    </form>
                  )}
                  {g.status === "ACTIVE" && (
                    <form action={setGymStatus.bind(null, g.id, { status: "SUSPENDED" })}>
                      <Button type="submit" size="sm" variant="outline">
                        <Pause className="size-4" /> Askıya Al
                      </Button>
                    </form>
                  )}
                  <form action={setGymStatus.bind(null, g.id, { isHalo: !g.isHalo })}>
                    <Button type="submit" size="sm" variant={g.isHalo ? "outline" : "gold"}>
                      <Star className="size-4" /> {g.isHalo ? "Halo Kaldır" : "Halo Yap"}
                    </Button>
                  </form>
                  <form action={setGymStatus.bind(null, g.id, { isFounder: !g.isFounder })}>
                    <Button type="submit" size="sm" variant="outline">
                      {g.isFounder ? "Kurucu Kaldır" : "Kurucu Salon Yap"}
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/admin/salonlar" params={sp} />
    </div>
  );
}
