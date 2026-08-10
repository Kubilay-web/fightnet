import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Pin, Lock, Eye } from "lucide-react";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { safe, getForumCategories } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, ButtonLink, Section, EmptyState, Pagination } from "@/components/ui";
import { FilterBar } from "@/components/filter-bar";
import { timeAgo, compact } from "@/lib/utils";
import { DISCIPLINE_LABEL, PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Forum",
  description: "Dövüş sporu topluluğu tartışma forumu — teknik, ekipman, müsabaka ve antrenman.",
};

export const revalidate = 60;

type SP = Promise<Record<string, string | undefined>>;

export default async function ForumPage({ searchParams }: { searchParams: SP }) {
  const [sp, session, categories] = await Promise.all([searchParams, getSession(), getForumCategories()]);
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where: Prisma.ForumThreadWhereInput = { moderation: "APPROVED" };
  if (sp.kategori) {
    const cat = categories.find((c) => c.slug === sp.kategori);
    if (cat) where.categoryId = cat.id;
  }
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { body: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const [threads, total] = await Promise.all([
    safe(
      () =>
        prisma.forumThread.findMany({
          where,
          orderBy: [{ isPinned: "desc" }, { lastPostAt: "desc" }],
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true, slug: true, title: true, isPinned: true, isLocked: true,
            viewCount: true, replyCount: true, lastPostAt: true, tags: true, createdAt: true,
            user: { select: { name: true, slug: true, avatarUrl: true, verification: true } },
            category: { select: { name: true, slug: true } },
          },
        }),
      [],
    ),
    safe(() => prisma.forumThread.count({ where }), 0),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title="Forum"
        subtitle="Topluluk tartışmaları — teknik, ekipman, müsabaka ve antrenman"
        action={
          session ? (
            <ButtonLink href="/forum/yeni" size="sm">
              Konu Aç
            </ButtonLink>
          ) : (
            <ButtonLink href="/kayit" size="sm">
              Katıl
            </ButtonLink>
          )
        }
      >
        {categories.length > 0 && (
          <div className="no-scrollbar scroll-snap-x flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/forum"
              className={`snap-item shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${!sp.kategori ? "border-blood-500 bg-blood-500/10 text-blood-500" : "border-[var(--border)] hover:border-blood-500"}`}
            >
              Tümü
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/forum?kategori=${c.slug}`}
                className={`snap-item shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${sp.kategori === c.slug ? "border-blood-500 bg-blood-500/10 text-blood-500" : "border-[var(--border)] hover:border-blood-500"}`}
              >
                {c.name}
                <span className="ml-1.5 text-xs text-muted">{c.threadCount}</span>
              </Link>
            ))}
          </div>
        )}

        <FilterBar basePath="/forum" current={sp} filters={[]} searchKey="q" searchPlaceholder="Konularda ara…" />

        {threads.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="size-10" />}
            title="Konu bulunamadı"
            description="İlk konuyu sen aç ve tartışmayı başlat."
            action={
              session ? (
                <ButtonLink href="/forum/yeni" size="sm" className="mt-2">
                  Konu Aç
                </ButtonLink>
              ) : null
            }
          />
        ) : (
          <>
            <Card>
              <ul className="divide-y divide-[var(--border)]">
                {threads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/forum/${t.slug}`}
                      className="flex items-start gap-3 p-4 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                    >
                      <Avatar src={t.user.avatarUrl} name={t.user.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          {t.isPinned && <Pin className="size-3.5 shrink-0 text-gold-500" />}
                          {t.isLocked && <Lock className="size-3.5 shrink-0 text-muted" />}
                          <h3 className="min-w-0 max-w-full truncate font-bold">{t.title}</h3>
                        </div>
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                          <span className="font-semibold">{t.category.name}</span>
                          <span>·</span>
                          <span>{t.user.name}</span>
                          <VerifiedMark level={t.user.verification} />
                          <span>·</span>
                          <span>{timeAgo(t.lastPostAt)}</span>
                        </p>
                        {t.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {t.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag}>#{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted">
                        <span className="font-black tabular-nums text-[var(--fg)]">{t.replyCount}</span>
                        <span>yanıt</span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" /> {compact(t.viewCount)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
            <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/forum" params={sp} />
          </>
        )}
      </Section>
    </div>
  );
}
