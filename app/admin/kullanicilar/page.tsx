import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
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
// TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir
import { ROLE_LABEL, PAGE_SIZE } from "@/lib/constants";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { adminCoreCopy } from "@/lib/i18n/pages/admin-core";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminCoreCopy[await getLocale()].users;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function AdminUsersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const locale = await getLocale();
  const c = adminCoreCopy[locale].users;
  const tag = LOCALE_TAG[locale];
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
      <Section title={c.title} subtitle={c.subtitle(total)}>
        <FilterBar
          basePath="/admin/kullanicilar"
          current={sp}
          filters={[
            {
              key: "role",
              label: c.roleLabel,
              options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
            },
            {
              key: "verification",
              label: c.verificationLabel,
              options: [
                { value: "LEVEL_0", label: c.level0 },
                { value: "LEVEL_1", label: c.level1 },
                { value: "LEVEL_2", label: c.level2 },
              ],
            },
            {
              key: "state",
              label: c.stateLabel,
              options: [
                { value: "banned", label: c.stateBanned },
                { value: "founder", label: c.stateFounder },
                { value: "minor", label: c.stateMinor },
              ],
            },
          ]}
          searchKey="q"
          searchPlaceholder={c.searchPlaceholder}
        />
      </Section>

      {users.length === 0 ? (
        <EmptyState icon={<Users className="size-10" />} title={c.empty} />
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
                      {u.isFounder && <Badge tone="gold">{c.founderBadge}</Badge>}
                      {u.isMinor && <Badge tone="red">{c.minorBadge}</Badge>}
                      {u.isBanned && <Badge tone="red">{c.bannedBadge}</Badge>}
                      {!u.isActive && <Badge>{c.inactiveBadge}</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted">
                      @{u.username} · {u.email} · {u.city ?? "—"}
                    </p>
                    <p className="text-xs text-muted">
                      {c.registered(formatDate(u.createdAt, tag))}
                      {u.lastActiveAt && c.lastActive(timeAgo(u.lastActiveAt, locale))}
                      {" · "}{c.followers(u.followerCount)} · {c.trainings(u.totalTrainings)}
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
                    {c.openProfile}
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
