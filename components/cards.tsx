import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Star, CalendarDays, Ticket, Play, Heart, MessageCircle } from "lucide-react";
import { Avatar, VerifiedMark, FounderMark } from "@/components/ui/avatar";
import { Badge, LiveBadge, Card } from "@/components/ui";
import { cld, videoPoster } from "@/lib/image";
import { cn, formatRecord, formatDateTime, compact, truncate, timeAgo, disciplineGradient } from "@/lib/utils";
import { DISCIPLINE_LABEL, SKILL_LABEL, BELT_COLOR, BELT_LABEL, EVENT_TYPE_LABEL } from "@/lib/constants";
import type { Discipline, SkillLevel, BeltRank, VerificationLevel, EventStatus, EventType, PostType } from "@prisma/client";

// ---------------------------------------------------------------------------
// Dövüşçü kartı
// ---------------------------------------------------------------------------

export interface FighterCardData {
  id: string;
  name: string;
  username: string;
  slug: string;
  avatarUrl: string | null;
  city: string | null;
  country: string;
  verification: VerificationLevel;
  isFounder: boolean;
  followerCount: number;
  sportProfiles: {
    discipline: Discipline;
    level: SkillLevel;
    belt: BeltRank;
    weightClass: string | null;
    wins: number;
    losses: number;
    draws: number;
    isPrimary: boolean;
    isPro: boolean;
  }[];
}

export function FighterCard({ f, priority }: { f: FighterCardData; priority?: boolean }) {
  const primary = f.sportProfiles[0];
  return (
    <Card hover className="group overflow-hidden">
      <Link href={`/dovuscular/${f.slug}`} className="flex flex-col">
        <div className={cn("relative h-20 bg-gradient-to-br", disciplineGradient(primary?.discipline ?? "MMA"))}>
          <div className="absolute inset-0 grid-lines opacity-20" />
          {primary?.isPro && (
            <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
              Pro
            </span>
          )}
        </div>

        <div className="-mt-8 flex flex-col items-center px-4 pb-4 text-center">
          <Avatar src={f.avatarUrl} name={f.name} size="xl" priority={priority} className="ring-4 ring-[var(--bg-elevated)]" />
          <div className="mt-2 flex items-center gap-1">
            <h3 className="truncate font-bold">{f.name}</h3>
            <VerifiedMark level={f.verification} />
          </div>
          <p className="text-xs text-muted">@{f.username}</p>

          {f.isFounder && <FounderMark className="mt-1.5" />}

          {primary && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              <Badge tone="red">{DISCIPLINE_LABEL[primary.discipline]}</Badge>
              <Badge>{SKILL_LABEL[primary.level]}</Badge>
              {primary.belt !== "NONE" && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{ background: `${BELT_COLOR[primary.belt]}22`, color: BELT_COLOR[primary.belt] }}
                >
                  <span className="size-2 rounded-full" style={{ background: BELT_COLOR[primary.belt] }} />
                  {BELT_LABEL[primary.belt]}
                </span>
              )}
            </div>
          )}

          <div className="mt-3 flex w-full items-center justify-center gap-4 border-t border-[var(--border)] pt-3 text-xs">
            {primary && (
              <span className="font-black tabular-nums">
                {formatRecord(primary.wins, primary.losses, primary.draws)}
              </span>
            )}
            <span className="flex items-center gap-1 text-muted">
              <Users className="size-3.5" />
              {compact(f.followerCount)}
            </span>
            {f.city && (
              <span className="flex items-center gap-1 truncate text-muted">
                <MapPin className="size-3.5 shrink-0" />
                {f.city}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function FighterRow({ f }: { f: FighterCardData }) {
  const primary = f.sportProfiles[0];
  return (
    <Link
      href={`/dovuscular/${f.slug}`}
      className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
    >
      <Avatar src={f.avatarUrl} name={f.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-bold">{f.name}</p>
          <VerifiedMark level={f.verification} />
        </div>
        <p className="truncate text-xs text-muted">
          {primary ? DISCIPLINE_LABEL[primary.discipline] : "Sporcu"}
          {f.city ? ` · ${f.city}` : ""}
        </p>
      </div>
      {primary && (
        <span className="shrink-0 text-xs font-black tabular-nums text-muted">
          {formatRecord(primary.wins, primary.losses, primary.draws)}
        </span>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Salon kartı
// ---------------------------------------------------------------------------

export interface GymCardData {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  logoUrl: string | null;
  coverUrl: string | null;
  disciplines: Discipline[];
  isVerified: boolean;
  isFounder: boolean;
  isHalo: boolean;
  memberCount: number;
  ratingAvg: number;
  ratingCount: number;
  trialEnabled: boolean;
  distanceKm?: number;
}

export function GymCard({ g, priority }: { g: GymCardData; priority?: boolean }) {
  return (
    <Card hover className="group overflow-hidden">
      <Link href={`/salonlar/${g.slug}`}>
        <div className="relative aspect-[16/9] overflow-hidden bg-ink-200 dark:bg-ink-800">
          {g.coverUrl ? (
            <Image
              src={cld(g.coverUrl, { w: 640, h: 360 })}
              alt={g.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-900">
              <span className="font-display text-3xl font-black text-white/20">{g.name.slice(0, 3).toUpperCase()}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {g.isHalo && <Badge tone="gold">Halo</Badge>}
            {g.isFounder && <Badge tone="gold">Kurucu Salon</Badge>}
            {g.trialEnabled && <Badge tone="green">Deneme Ücretsiz</Badge>}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            {g.logoUrl && (
              <Image
                src={cld(g.logoUrl, { w: 88, h: 88 })}
                alt=""
                width={44}
                height={44}
                className="-mt-8 size-11 shrink-0 rounded-xl border-2 border-[var(--bg-elevated)] object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold">{g.name}</h3>
              <p className="flex items-center gap-1 truncate text-xs text-muted">
                <MapPin className="size-3.5 shrink-0" />
                {g.city}
                {typeof g.distanceKm === "number" && ` · ${g.distanceKm} km`}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {g.disciplines.slice(0, 3).map((d) => (
              <Badge key={d}>{DISCIPLINE_LABEL[d]}</Badge>
            ))}
            {g.disciplines.length > 3 && <Badge>+{g.disciplines.length - 3}</Badge>}
          </div>

          <div className="mt-3 flex items-center gap-4 border-t border-[var(--border)] pt-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {compact(g.memberCount)} üye
            </span>
            {g.ratingCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-gold-500 text-gold-500" />
                {g.ratingAvg.toFixed(1)} ({g.ratingCount})
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Etkinlik kartı
// ---------------------------------------------------------------------------

export interface EventCardData {
  id: string;
  slug: string;
  title: string;
  posterUrl: string | null;
  startsAt: Date;
  city: string;
  venueName: string | null;
  type: EventType;
  status: EventStatus;
  disciplines: Discipline[];
  ticketPrice: number | null;
  isPPV: boolean;
  _count?: { fights: number };
}

export function EventCard({ e, priority }: { e: EventCardData; priority?: boolean }) {
  return (
    <Card hover className="group overflow-hidden">
      <Link href={`/etkinlikler/${e.slug}`} className="flex gap-0 sm:block">
        <div className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden bg-ink-200 sm:aspect-[16/10] sm:w-full dark:bg-ink-800">
          {e.posterUrl ? (
            <Image
              src={cld(e.posterUrl, { w: 640, h: 400 })}
              alt={e.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={cn("flex size-full items-center justify-center bg-gradient-to-br", disciplineGradient(e.disciplines[0] ?? "MMA"))}>
              <CalendarDays className="size-8 text-white/40" />
            </div>
          )}
          <div className="absolute left-2 top-2">
            {e.status === "LIVE" ? <LiveBadge /> : <Badge tone="neutral">{EVENT_TYPE_LABEL[e.type]}</Badge>}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-blood-500">
            {formatDateTime(e.startsAt)}
          </p>
          <h3 className="mt-1 line-clamp-2-safe font-bold leading-snug">{e.title}</h3>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
            <MapPin className="size-3.5 shrink-0" />
            {e.venueName ? `${e.venueName}, ` : ""}{e.city}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 text-xs text-muted">
            {!!e._count?.fights && <span>{e._count.fights} müsabaka</span>}
            {e.ticketPrice != null && e.ticketPrice > 0 && (
              <span className="flex items-center gap-1">
                <Ticket className="size-3.5" />
                {e.ticketPrice} €
              </span>
            )}
            {e.isPPV && <Badge tone="purple">PPV</Badge>}
          </div>
        </div>
      </Link>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Gönderi kartı (keşfet akışı)
// ---------------------------------------------------------------------------

export interface PostCardData {
  id: string;
  type: PostType;
  body: string | null;
  mediaUrl: string | null;
  thumbUrl: string | null;
  durationSec: number | null;
  discipline: Discipline | null;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  user: {
    id: string; name: string; username: string; slug: string;
    avatarUrl: string | null; verification: VerificationLevel; isFounder: boolean;
  };
}

export function PostCard({ p, priority }: { p: PostCardData; priority?: boolean }) {
  const poster = p.thumbUrl ?? (p.type === "VIDEO" ? videoPoster(p.mediaUrl) : p.mediaUrl);
  return (
    <Card hover className="group overflow-hidden">
      <Link href={`/akis/${p.id}`}>
        {poster && (
          <div className="relative aspect-square overflow-hidden bg-ink-200 dark:bg-ink-800">
            <Image
              src={cld(poster, { w: 600, h: 600 })}
              alt={p.body ? truncate(p.body, 60) : "Gönderi"}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {p.type === "VIDEO" && (
              <>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-black/50 backdrop-blur transition-transform group-hover:scale-110">
                    <Play className="size-5 fill-white text-white" />
                  </span>
                </span>
                {p.durationSec ? (
                  <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
                    {Math.floor(p.durationSec / 60)}:{String(p.durationSec % 60).padStart(2, "0")}
                  </span>
                ) : null}
              </>
            )}
          </div>
        )}

        <div className="p-3">
          <div className="flex items-center gap-2">
            <Avatar src={p.user.avatarUrl} name={p.user.name} size="xs" />
            <span className="truncate text-xs font-bold">{p.user.name}</span>
            <VerifiedMark level={p.user.verification} />
            <span className="ml-auto shrink-0 text-[11px] text-muted">{timeAgo(p.createdAt)}</span>
          </div>
          {p.body && <p className="mt-2 line-clamp-2-safe text-sm text-muted">{p.body}</p>}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Heart className="size-3.5" />
              {compact(p.likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" />
              {compact(p.commentCount)}
            </span>
            {p.discipline && <Badge tone="red" className="ml-auto">{DISCIPLINE_LABEL[p.discipline]}</Badge>}
          </div>
        </div>
      </Link>
    </Card>
  );
}
