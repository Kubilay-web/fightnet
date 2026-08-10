import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Pin, Lock, Unlock } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { toggleThreadPin, toggleThreadLock } from "@/app/admin/actions";
import { Badge, Card, CardBody, Section, EmptyState, Button } from "@/components/ui";
import { ForumCategoryForm } from "@/components/forum-category-form";
import { timeAgo } from "@/lib/utils";
import { DISCIPLINE_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Forum Yönetimi", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminForumPage() {
  await requireAdmin();

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
      <Section title="Forum Yönetimi" subtitle="Kategoriler, konular ve moderasyon" />

      <Section title="Kategoriler">
        {data.categories.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((c) => (
              <Card key={c.id}>
                <CardBody>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="min-w-0 max-w-full truncate font-bold">{c.name}</h3>
                    {c.discipline && <Badge tone="red">{DISCIPLINE_LABEL[c.discipline]}</Badge>}
                  </div>
                  {c.description && <p className="mt-1 text-sm text-muted">{c.description}</p>}
                  <p className="mt-2 text-xs text-muted">{c.threadCount} konu · /{c.slug}</p>
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

      <Section title="Son Konular">
        {data.threads.length === 0 ? (
          <EmptyState icon={<MessageSquare className="size-10" />} title="Konu yok" />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.threads.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <Link href={`/forum/${t.slug}`} target="_blank" className="truncate font-bold hover:text-blood-500">
                        {t.title}
                      </Link>
                      {t.isPinned && <Badge tone="gold">Sabit</Badge>}
                      {t.isLocked && <Badge tone="neutral">Kilitli</Badge>}
                      {t.moderation !== "APPROVED" && <Badge tone="red">{t.moderation}</Badge>}
                    </div>
                    <p className="text-xs text-muted">
                      {t.category.name} · {t.user.name} · {t.replyCount} yanıt · {t.viewCount} görüntülenme ·{" "}
                      {timeAgo(t.lastPostAt)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <form action={toggleThreadPin.bind(null, t.id, !t.isPinned)}>
                      <Button type="submit" size="sm" variant="outline">
                        <Pin className="size-4" /> {t.isPinned ? "Sabiti Kaldır" : "Sabitle"}
                      </Button>
                    </form>
                    <form action={toggleThreadLock.bind(null, t.id, !t.isLocked)}>
                      <Button type="submit" size="sm" variant="outline">
                        {t.isLocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                        {t.isLocked ? "Kilidi Aç" : "Kilitle"}
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
