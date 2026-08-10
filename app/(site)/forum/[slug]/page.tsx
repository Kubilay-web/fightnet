import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pin, Lock, Eye, MessageSquare } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark, FounderMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Alert } from "@/components/ui";
import { ReplyForm } from "@/components/reply-form";
import { ReportButton } from "@/components/report-button";
import { formatDateTime, timeAgo, compact, truncate } from "@/lib/utils";

export const revalidate = 30;

type Params = Promise<{ slug: string }>;

async function loadThread(slug: string) {
  return safe(
    () =>
      prisma.forumThread.findFirst({
        where: { slug, moderation: { not: "REMOVED" } },
        select: {
          id: true, slug: true, title: true, body: true, tags: true,
          isPinned: true, isLocked: true, viewCount: true, replyCount: true, createdAt: true,
          category: { select: { name: true, slug: true } },
          user: {
            select: {
              id: true, name: true, slug: true, avatarUrl: true,
              verification: true, isFounder: true, role: true,
            },
          },
          posts: {
            where: { moderation: "APPROVED" },
            orderBy: { createdAt: "asc" },
            take: 100,
            select: {
              id: true, body: true, likeCount: true, createdAt: true,
              user: {
                select: {
                  id: true, name: true, slug: true, avatarUrl: true,
                  verification: true, isFounder: true,
                },
              },
            },
          },
        },
      }),
    null,
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const t = await loadThread(slug);
  if (!t) return { title: "Konu bulunamadı" };
  return {
    title: t.title,
    description: truncate(t.body, 155),
  };
}

export default async function ThreadPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [t, session] = await Promise.all([loadThread(slug), getSession()]);
  if (!t) notFound();

  prisma.forumThread.update({ where: { id: t.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-16 sm:px-6 sm:py-10">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/forum" className="hover:text-blood-500">
          Forum
        </Link>
        {" / "}
        <Link href={`/forum?kategori=${t.category.slug}`} className="hover:text-blood-500">
          {t.category.name}
        </Link>
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {t.isPinned && <Badge tone="gold"><Pin className="size-3" /> Sabit</Badge>}
        {t.isLocked && <Badge><Lock className="size-3" /> Kilitli</Badge>}
        <span className="flex items-center gap-1 text-xs text-muted">
          <Eye className="size-3.5" /> {compact(t.viewCount)}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted">
          <MessageSquare className="size-3.5" /> {t.replyCount}
        </span>
      </div>

      <h1 className="font-display text-2xl font-black sm:text-3xl">{t.title}</h1>

      {t.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {t.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
      )}

      {/* Ana gönderi */}
      <Card className="mt-5">
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar src={t.user.avatarUrl} name={t.user.name} size="md" href={`/dovuscular/${t.user.slug}`} />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <Link href={`/dovuscular/${t.user.slug}`} className="truncate font-bold hover:text-blood-500">
                  {t.user.name}
                </Link>
                <VerifiedMark level={t.user.verification} />
                {t.user.isFounder && <FounderMark />}
              </div>
              <p className="text-xs text-muted">{formatDateTime(t.createdAt)}</p>
            </div>
            <ReportButton targetType="THREAD" targetId={t.id} reportedUserId={t.user.id} authed={!!session} compact />
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed">{t.body}</p>
        </CardBody>
      </Card>

      {/* Yanıtlar */}
      {t.posts.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {t.posts.map((p) => (
            <li key={p.id}>
              <Card>
                <CardBody className="flex gap-3">
                  <Avatar src={p.user.avatarUrl} name={p.user.name} size="sm" href={`/dovuscular/${p.user.slug}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <Link href={`/dovuscular/${p.user.slug}`} className="truncate text-sm font-bold hover:text-blood-500">
                        {p.user.name}
                      </Link>
                      <VerifiedMark level={p.user.verification} />
                      <span className="ml-auto shrink-0 text-[11px] text-muted">{timeAgo(p.createdAt)}</span>
                      <ReportButton targetType="FORUM_POST" targetId={p.id} reportedUserId={p.user.id} authed={!!session} compact />
                    </div>
                    <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed">{p.body}</p>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Yanıt formu */}
      <div className="mt-6">
        {t.isLocked ? (
          <Alert tone="neutral" title="Konu kilitli">
            Bu konuya yeni yanıt eklenemez.
          </Alert>
        ) : session ? (
          <Card>
            <CardBody>
              <ReplyForm threadId={t.id} />
            </CardBody>
          </Card>
        ) : (
          <Alert tone="blue">
            Yanıt vermek için{" "}
            <Link href="/giris" className="font-bold underline">
              giriş yap
            </Link>
          </Alert>
        )}
      </div>
    </div>
  );
}
