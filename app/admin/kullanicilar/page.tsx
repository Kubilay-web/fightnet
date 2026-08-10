import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, Section, EmptyState, Pagination } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { AdminUserForm } from "@/components/admin-user-form";
import { formatDate, timeAgo } from "@/lib/utils";
import { ROLE_LABEL, PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = { title: "Kullanıcılar", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function AdminUsersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const q = sp.q?.trim();

  const where: Prisma.UserWhereInput = {};
  if (sp.role) where.role = sp.role as never;
  if (sp.verification) where.verification = sp.verification as never;
  if (sp.state === "banned") where.isBanned = true;
  if (sp.state === "founder") where.isFounder = true;
  if (sp.state === "minor") where.isMinor = true;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { username: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    safe(
      () =>
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true, name: true, username: true, slug: true, email: true, avatarUrl: true,
            role: true, verification: true, isActive: true, isBanned: true, isFounder: true,
            isMinor: true, banReason: true, city: true, createdAt: true, lastActiveAt: true,
            followerCount: true, totalTrainings: true,
          },
        }),
      [],
    ),
    safe(() => prisma.user.count({ where }), 0),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Section title="Kullanıcılar" subtitle={`${total} kayıt`}>
        <FilterBar
          basePath="/admin/kullanicilar"
          current={sp}
          filters={[
            {
              key: "role",
              label: "Rol",
              options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
            },
            {
              key: "verification",
              label: "Doğrulama",
              options: [
                { value: "LEVEL_0", label: "Seviye 0" },
                { value: "LEVEL_1", label: "Seviye 1" },
                { value: "LEVEL_2", label: "Seviye 2" },
              ],
            },
            {
              key: "state",
              label: "Durum",
              options: [
                { value: "banned", label: "Askıya alınmış" },
                { value: "founder", label: "Kurucu üye" },
                { value: "minor", label: "18 yaş altı" },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder="İsim, kullanıcı adı veya e-posta…"
        />
      </Section>

      {users.length === 0 ? (
        <EmptyState icon={<Users className="size-10" />} title="Kullanıcı bulunamadı" />
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <Card key={u.id}>
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                  <Avatar src={u.avatarUrl} name={u.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span className="min-w-0 max-w-full truncate font-bold">{u.name}</span>
                      <VerifiedMark level={u.verification} />
                      {u.isFounder && <Badge tone="gold">Kurucu</Badge>}
                      {u.isMinor && <Badge tone="red">18-</Badge>}
                      {u.isBanned && <Badge tone="red">Askıda</Badge>}
                      {!u.isActive && <Badge>Pasif</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted">
                      @{u.username} · {u.email} · {u.city ?? "—"}
                    </p>
                    <p className="text-xs text-muted">
                      Kayıt: {formatDate(u.createdAt)}
                      {u.lastActiveAt && ` · Son aktif: ${timeAgo(u.lastActiveAt)}`}
                      {" · "}{u.followerCount} takipçi · {u.totalTrainings} antrenman
                    </p>
                  </div>
                  <Badge>{ROLE_LABEL[u.role]}</Badge>
                </summary>

                <div className="border-t border-[var(--border)] p-4">
                  <AdminUserForm
                    userId={u.id}
                    initial={{
                      role: u.role,
                      verification: u.verification,
                      isActive: u.isActive,
                      isBanned: u.isBanned,
                      isFounder: u.isFounder,
                      banReason: u.banReason ?? "",
                    }}
                  />
                  <Link
                    href={`/dovuscular/${u.slug}`}
                    target="_blank"
                    className="mt-3 inline-block text-sm font-bold text-blood-500 hover:underline"
                  >
                    Profili aç →
                  </Link>
                </div>
              </details>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        basePath="/admin/kullanicilar"
        params={sp}
      />
    </div>
  );
}
