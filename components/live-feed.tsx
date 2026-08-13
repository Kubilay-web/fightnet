"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/components/i18n/link";
import { Send, Radio, Loader2 } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Select } from "@/components/ui";
import { cn, timeAgo } from "@/lib/utils";
import type { VerificationLevel } from "@prisma/client";

interface Comment {
  id: string;
  body: string;
  kind: string;
  round: number | null;
  isOfficial: boolean;
  createdAt: string;
  user: {
    name: string; slug: string; avatarUrl: string | null; verification: VerificationLevel;
  } | null;
}

const KIND_LABEL: Record<string, string> = {
  ROUND_START: "Raunt Başladı",
  ROUND_END: "Raunt Bitti",
  RESULT: "Sonuç",
  KNOCKDOWN: "Yere Düşürme",
};

/**
 * §4.1 — Yorumlu canlı skor.
 * Canlı etkinliklerde 8 saniyede bir artımlı çekim (`after` imleci ile
 * yalnızca yeni yorumlar) — tam liste tekrar indirilmez.
 */
export function LiveFeed({
  eventId,
  isLive,
  authed,
  canModerate,
  fights,
}: {
  eventId: string;
  isLive: boolean;
  authed: boolean;
  canModerate: boolean;
  fights: { id: string; label: string }[];
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");
  const [fightId, setFightId] = useState("");
  const [kind, setKind] = useState("COMMENT");
  const cursorRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (incremental: boolean) => {
      const url = new URL(`/api/events/${eventId}/live`, window.location.origin);
      if (incremental && cursorRef.current) url.searchParams.set("after", cursorRef.current);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data: { comments: Comment[] } = await res.json();
      if (!data.comments.length) return;
      cursorRef.current = data.comments[0].createdAt;
      setComments((prev) => (incremental ? [...data.comments, ...prev].slice(0, 200) : data.comments));
    },
    [eventId],
  );

  useEffect(() => {
    load(false).finally(() => setLoading(false));
  }, [load]);

  // Sekme arka plandayken yoklama durur — pil ve bant genişliği korunur
  useEffect(() => {
    if (!isLive) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      timer ??= setInterval(() => load(true), 8000);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVis = () => (document.hidden ? stop() : (load(true), start()));
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isLive, load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    const res = await fetch(`/api/events/${eventId}/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, fightId, body: text, kind: canModerate ? kind : "COMMENT" }),
    });
    if (res.ok) {
      setBody("");
      await load(true);
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSending(false);
  }

  return (
    <Card className={cn(isLive && "border-blood-500/50")}>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <Radio className={cn("size-4", isLive ? "text-blood-500" : "text-muted")} />
        <h2 className="font-bold">Canlı Yorum</h2>
        {isLive && (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold uppercase text-blood-500">
            <span className="size-1.5 rounded-full bg-blood-500 animate-[pulse-live_1.6s_ease-in-out_infinite]" />
            Otomatik yenileniyor
          </span>
        )}
      </div>

      {authed ? (
        <form onSubmit={send} className="flex flex-col gap-2 border-b border-[var(--border)] p-3">
          {(fights.length > 0 || canModerate) && (
            <div className="flex gap-2">
              {fights.length > 0 && (
                <Select value={fightId} onChange={(e) => setFightId(e.target.value)} className="text-xs">
                  <option value="">Genel</option>
                  {fights.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              )}
              {canModerate && (
                <Select value={kind} onChange={(e) => setKind(e.target.value)} className="text-xs">
                  <option value="COMMENT">Yorum</option>
                  <option value="ROUND_START">Raunt Başladı</option>
                  <option value="ROUND_END">Raunt Bitti</option>
                  <option value="KNOCKDOWN">Yere Düşürme</option>
                  <option value="RESULT">Sonuç</option>
                </Select>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
              placeholder="Yorumunu yaz…"
              aria-label="Yorum"
              className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-blood-500 dark:border-ink-700 dark:bg-ink-900"
            />
            <button
              type="submit"
              disabled={sending || !body.trim()}
              aria-label="Gönder"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600 text-white transition-colors hover:bg-blood-500 disabled:opacity-50"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
        </form>
      ) : (
        <div className="border-b border-[var(--border)] p-3 text-center text-sm text-muted">
          Yorum yapmak için{" "}
          <Link href="/giris" className="font-bold text-blood-500 hover:underline">
            giriş yap
          </Link>
        </div>
      )}

      <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="size-5 animate-spin text-muted" />
          </div>
        ) : comments.length === 0 ? (
          <CardBody className="text-center text-sm text-muted">
            Henüz yorum yok. İlk yorumu sen yap.
          </CardBody>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {comments.map((c) => (
              <li key={c.id} className={cn("flex gap-2.5 p-3", c.isOfficial && "bg-blood-500/5")}>
                {c.user ? (
                  <Avatar src={c.user.avatarUrl} name={c.user.name} size="sm" href={`/dovuscular/${c.user.slug}`} />
                ) : (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blood-600 text-white">
                    <Radio className="size-3.5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="truncate text-xs font-bold">{c.user?.name ?? "FIGHTNET"}</span>
                    {c.user && <VerifiedMark level={c.user.verification} />}
                    {c.isOfficial && <Badge tone="red">Resmi</Badge>}
                    {c.kind !== "COMMENT" && <Badge tone="amber">{KIND_LABEL[c.kind] ?? c.kind}</Badge>}
                    {c.round ? <span className="text-[11px] text-muted">R{c.round}</span> : null}
                    <span className="ml-auto shrink-0 text-[11px] text-muted">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 break-words text-sm">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
