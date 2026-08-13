import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { MessageSquare, Pin, Lock, Unlock } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { toggleThreadPin, toggleThreadLock } from "@/app/admin/actions";
import { Badge, Card, CardBody, Section, EmptyState, Button } from "@/components/ui";
import { ForumCategoryForm } from "@/components/forum-category-form";
import { timeAgo } from "@/lib/utils";
import { DISCIPLINE_LABEL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { adminForumCopy } from "@/lib/i18n/pages/admin-ops";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminForumCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function AdminForumPage() {
  await requireAdmin();
  const locale = await getLocale();
  const t = adminForumCopy[locale];

  const data = await safe(
    async () => {
      const [categories, threads] = await Promise.all([
        prisma.forumCategory.findMany({ orderBy: { order: "asc" } }),
        prisma.forumThread.findMany({
          orderBy: { lastPostAt: "desc" },
          take: 40,
          select: {
            id: true, slug: true, title: true, isPinned: true, isLocked: true,
            moderation: true, viewCount: true, replyCount: true, lastPostAt: true,
            user: { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true } },
          },
        }),
      ]);
      return { categories, threads };
    },
    { categories: [], threads: [] },
  );

  return (
    <div className="flex flex-col gap-8">
      <Section title={t.title} subtitle={t.subtitle} />

      <Section title={t.categories}>
        {data.categories.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((c) => (
              <Card key={c.id}>
                <CardBody>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="min-w-0 max-w-full truncate font-bold">{c.name}</h3>
                    {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                    {c.discipline && <Badge tone="red">{DISCIPLINE_LABEL[c.discipline]}</Badge>}
                  </div>
                  {c.description && <p className="mt-1 text-sm text-muted">{c.description}</p>}
                  <p className="mt-2 text-xs text-muted">{t.threadsCount(c.threadCount)} · /{c.slug}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardBody>
            <ForumCategoryForm />
          </CardBody>
        </Card>
      </Section>

      <Section title={t.recentThreads}>
        {data.threads.length === 0 ? (
          <EmptyState icon={<MessageSquare className="size-10" />} title={t.emptyThreads} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.threads.map((th) => (
                <li key={th.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <Link href={`/forum/${th.slug}`} target="_blank" className="truncate font-bold hover:text-blood-500">
                        {th.title}
                      </Link>
                      {th.isPinned && <Badge tone="gold">{t.pinned}</Badge>}
                      {th.isLocked && <Badge tone="neutral">{t.locked}</Badge>}
                      {th.moderation !== "APPROVED" && <Badge tone="red">{th.moderation}</Badge>}
                    </div>
                    <p className="text-xs text-muted">
                      {th.category.name} · {th.user.name} · {th.replyCount} {t.replies} · {th.viewCount} {t.views} ·{" "}
                      {timeAgo(th.lastPostAt, locale)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <form action={toggleThreadPin.bind(null, th.id, !th.isPinned)}>
                      <Button type="submit" size="sm" variant="outline">
                        <Pin className="size-4" /> {th.isPinned ? t.unpin : t.pin}
                      </Button>
                    </form>
                    <form action={toggleThreadLock.bind(null, th.id, !th.isLocked)}>
                      <Button type="submit" size="sm" variant="outline">
                        {th.isLocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                        {th.isLocked ? t.unlock : t.lock}
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>
    </div>
  );
}
