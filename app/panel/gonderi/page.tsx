import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import Image from "next/image";
import { ImageIcon, Trash2, Heart, MessageCircle, Eye } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { deletePost } from "@/app/panel/actions";
import { Badge, Card, ButtonLink, Section, EmptyState } from "@/components/ui";
import { cld, videoPoster } from "@/lib/image";
import { timeAgo, compact, truncate } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/server";
import { panelPostsCopy } from "@/lib/i18n/pages/panel-posts";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelPostsCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function MyPostsPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = panelPostsCopy[locale];

  const posts = await safe(
    () =>
      prisma.post.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true, type: true, body: true, mediaUrl: true, thumbUrl: true,
          moderation: true, visibility: true, likeCount: true, commentCount: true,
          viewCount: true, createdAt: true,
        },
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <Section
        title={copy.title}
        subtitle={copy.subtitle}
        action={
          <ButtonLink href="/panel/gonderi/yeni" size="sm">
            <ImageIcon className="size-4" /> {copy.newPost}
          </ButtonLink>
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="size-10" />}
          title={copy.empty.title}
          description={copy.empty.description}
          action={
            <ButtonLink href="/panel/gonderi/yeni" size="sm" className="mt-2">
              {copy.empty.action}
            </ButtonLink>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-[var(--border)]">
            {posts.map((p) => {
              const poster = p.thumbUrl ?? (p.type === "VIDEO" ? videoPoster(p.mediaUrl) : p.mediaUrl);
              return (
                <li key={p.id} className="flex items-center gap-3 p-3">
                  <Link href={`/akis/${p.id}`} className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink-200 dark:bg-ink-800">
                    {poster ? (
                      <Image src={cld(poster, { w: 128, h: 128 })} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-muted">
                        <ImageIcon className="size-5" />
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link href={`/akis/${p.id}`} className="text-sm font-bold hover:text-blood-500">
                      {p.body ? truncate(p.body, 60) : p.type === "VIDEO" ? copy.videoPost : copy.imagePost}
                    </Link>
                    <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
                      <span>{timeAgo(p.createdAt, locale)}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="size-3" /> {compact(p.likeCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="size-3" /> {compact(p.commentCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" /> {compact(p.viewCount)}
                      </span>
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge tone={p.moderation === "APPROVED" ? "green" : p.moderation === "PENDING" ? "amber" : "red"}>
                        {p.moderation === "APPROVED" ? copy.moderation.approved : p.moderation === "PENDING" ? copy.moderation.pending : p.moderation === "FLAGGED" ? copy.moderation.flagged : copy.moderation.removed}
                      </Badge>
                      <Badge>{p.visibility === "PUBLIC" ? copy.visibility.public : copy.visibility.restricted}</Badge>
                    </div>
                  </div>

                  <form action={deletePost.bind(null, p.id)}>
                    <button
                      type="submit"
                      aria-label={copy.deleteAria}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-blood-500/10 hover:text-blood-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
