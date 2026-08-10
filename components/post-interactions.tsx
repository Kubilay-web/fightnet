"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Send, Loader2, Share2 } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { cn, compact, timeAgo } from "@/lib/utils";
import type { VerificationLevel } from "@prisma/client";

interface CommentData {
  id: string;
  body: string;
  createdAt: string;
  likeCount: number;
  user: { name: string; slug: string; avatarUrl: string | null; verification: VerificationLevel };
}

export function PostInteractions({
  postId,
  initialLiked,
  initialLikes,
  commentCount,
  authed,
  comments: initialComments,
}: {
  postId: string;
  initialLiked: boolean;
  initialLikes: number;
  commentCount: number;
  authed: boolean;
  comments: CommentData[];
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLike, setOptimisticLike] = useOptimistic({ liked, likes });
  const [, startTransition] = useTransition();

  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  function toggleLike() {
    if (!authed) return router.push("/giris");
    const next = !liked;
    startTransition(async () => {
      setOptimisticLike({ liked: next, likes: likes + (next ? 1 : -1) });
      const res = await fetch(`/api/posts/${postId}/like`, { method: next ? "POST" : "DELETE" });
      if (res.ok) {
        setLiked(next);
        setLikes((v) => v + (next ? 1 : -1));
      }
    });
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    if (!authed) return router.push("/giris");
    setSending(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (res.ok) {
      const { comment } = await res.json();
      setComments((c) => [comment, ...c]);
      setBody("");
    }
    setSending(false);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-3">
      <div className="flex items-center gap-1">
        <button
          onClick={toggleLike}
          aria-pressed={optimisticLike.liked}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors",
            optimisticLike.liked ? "text-blood-500" : "text-muted hover:text-blood-500",
          )}
        >
          <Heart className={cn("size-5", optimisticLike.liked && "fill-blood-500")} />
          {compact(optimisticLike.likes)}
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-muted">
          <MessageCircle className="size-5" />
          {compact(commentCount + (comments.length - initialComments.length))}
        </span>

        <button
          onClick={share}
          aria-label="Paylaş"
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-muted transition-colors hover:text-blood-500"
        >
          <Share2 className="size-5" />
        </button>
      </div>

      {authed ? (
        <form onSubmit={submitComment} className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            placeholder="Yorum yaz…"
            aria-label="Yorum"
            className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-blood-500 dark:border-ink-700 dark:bg-ink-900"
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            aria-label="Yorum gönder"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600 text-white transition-colors hover:bg-blood-500 disabled:opacity-50"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          Yorum yapmak için{" "}
          <Link href="/giris" className="font-bold text-blood-500 hover:underline">
            giriş yap
          </Link>
        </p>
      )}

      {comments.length > 0 && (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-2.5">
              <Avatar src={c.user.avatarUrl} name={c.user.name} size="sm" href={`/dovuscular/${c.user.slug}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Link href={`/dovuscular/${c.user.slug}`} className="truncate text-xs font-bold hover:text-blood-500">
                    {c.user.name}
                  </Link>
                  <VerifiedMark level={c.user.verification} />
                  <span className="ml-auto shrink-0 text-[11px] text-muted">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-0.5 break-words text-sm">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
