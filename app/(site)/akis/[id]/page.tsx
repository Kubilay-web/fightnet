import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody } from "@/components/ui";
import { PostInteractions } from "@/components/post-interactions";
import { ReportButton } from "@/components/report-button";
import { VideoPlayer } from "@/components/video-player";
import { cld } from "@/lib/image";
import { timeAgo, truncate } from "@/lib/utils";
import { DISCIPLINE_LABEL } from "@/lib/constants";

type Params = Promise<{ id: string }>;

export const revalidate = 60;

async function loadPost(id: string) {
  return safe(
    () =>
      prisma.post.findFirst({
        where: { id, moderation: { not: "REMOVED" } },
        select: {
          id: true, type: true, body: true, mediaUrl: true, thumbUrl: true,
          width: true, height: true, durationSec: true, discipline: true, tags: true,
          likeCount: true, commentCount: true, viewCount: true, createdAt: true, visibility: true,
          user: {
            select: {
              id: true, name: true, username: true, slug: true, avatarUrl: true,
              verification: true, isFounder: true, followerCount: true,
            },
          },
          comments: {
            where: { moderation: "APPROVED" },
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
              id: true, body: true, createdAt: true, likeCount: true,
              user: { select: { name: true, slug: true, avatarUrl: true, verification: true } },
            },
          },
        },
      }),
    null,
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const p = await loadPost(id);
  if (!p) return { title: "Gönderi bulunamadı" };
  return {
    title: `${p.user.name} — ${p.body ? truncate(p.body, 50) : "Gönderi"}`,
    description: p.body?.slice(0, 155) ?? `${p.user.name} tarafından paylaşıldı`,
    openGraph: { images: p.thumbUrl || p.mediaUrl ? [{ url: cld(p.thumbUrl ?? p.mediaUrl!, { w: 1200 }) }] : undefined },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { id } = await params;
  const [p, session] = await Promise.all([loadPost(id), getSession()]);
  if (!p) notFound();

  const liked = session
    ? await safe(
        async () =>
          !!(await prisma.postLike.findUnique({
            where: { postId_userId: { postId: p.id, userId: session.sub } },
            select: { id: true },
          })),
        false,
      )
    : false;

  prisma.post.update({ where: { id: p.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-16 sm:px-6 sm:py-10">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <Avatar src={p.user.avatarUrl} name={p.user.name} size="md" href={`/dovuscular/${p.user.slug}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Link href={`/dovuscular/${p.user.slug}`} className="truncate font-bold hover:text-blood-500">
                {p.user.name}
              </Link>
              <VerifiedMark level={p.user.verification} />
            </div>
            <p className="text-xs text-muted">
              @{p.user.username} · {timeAgo(p.createdAt)}
            </p>
          </div>
          <ReportButton targetType="POST" targetId={p.id} reportedUserId={p.user.id} authed={!!session} compact />
        </div>

        {p.type === "VIDEO" && p.mediaUrl && (
          <VideoPlayer src={p.mediaUrl} poster={p.thumbUrl} />
        )}

        {p.type === "IMAGE" && p.mediaUrl && (
          <div className="relative aspect-square bg-ink-900">
            <Image
              src={cld(p.mediaUrl, { w: 1080 })}
              alt={p.body ? truncate(p.body, 60) : "Gönderi"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
            />
          </div>
        )}

        <CardBody className="flex flex-col gap-3">
          {p.body && <p className="whitespace-pre-line text-sm leading-relaxed">{p.body}</p>}

          <div className="flex flex-wrap gap-1.5">
            {p.discipline && <Badge tone="red">{DISCIPLINE_LABEL[p.discipline]}</Badge>}
            {p.tags.map((t) => (
              <Link key={t} href={`/akis?q=${encodeURIComponent(t)}`}>
                <Badge>#{t}</Badge>
              </Link>
            ))}
          </div>

          <PostInteractions
            postId={p.id}
            initialLiked={liked}
            initialLikes={p.likeCount}
            commentCount={p.commentCount}
            authed={!!session}
            comments={p.comments.map((c) => ({
              ...c,
              createdAt: c.createdAt.toISOString(),
            }))}
          />
        </CardBody>
      </Card>
    </div>
  );
}
