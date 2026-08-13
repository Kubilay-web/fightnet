import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/components/i18n/link";
import Image from "next/image";
import {
  MapPin, Calendar, Ruler, Dumbbell, Flame, Trophy, Users,
  Building2, ShieldCheck, AtSign, Video, Globe,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { Avatar, VerifiedMark, FounderMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, ButtonLink, Section, EmptyState } from "@/components/ui";
import { FollowButton } from "@/components/follow-button";
import { ReportButton } from "@/components/report-button";
import { MessageLink } from "@/components/message-forms";
import { PostCard } from "@/components/cards";
import { cld } from "@/lib/image";
import { formatRecord, formatDate, compact, age, cn, disciplineGradient } from "@/lib/utils";
import { BELT_COLOR } from "@/lib/constants";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { labelsFor } from "@/lib/i18n/labels";
import { fightersCopy } from "@/lib/i18n/pages/fighters";

export const revalidate = 120;

type Params = Promise<{ slug: string }>;

const profileSelect = {
  id: true, name: true, username: true, slug: true, bio: true,
  avatarUrl: true, coverUrl: true, city: true, country: true, nationality: true,
  birthDate: true, heightCm: true, reachCm: true, stance: true, website: true, socials: true,
  role: true, verification: true, isFounder: true, isMinor: true,
  followerCount: true, followingCount: true, postCount: true,
  trainingStreak: true, longestStreak: true, totalTrainings: true,
  createdAt: true, visibility: true,
  sportProfiles: {
    where: { visibility: { in: ["PUBLIC", "COMMUNITY"] as never } },
    orderBy: { isPrimary: "desc" as const },
  },
  gymMemberships: {
    where: { isActive: true },
    select: {
      isPrimary: true,
      gym: { select: { id: true, slug: true, name: true, city: true, logoUrl: true, isVerified: true } },
    },
  },
  coachAt: {
    select: {
      title: true, isHead: true, verified: true,
      gym: { select: { slug: true, name: true, city: true, logoUrl: true } },
    },
  },
  vouchesReceived: {
    where: { status: "ACCEPTED" as never },
    select: {
      coach: { select: { name: true, slug: true, avatarUrl: true, verification: true } },
    },
    take: 3,
  },
  creatorTiers: { where: { isActive: true }, select: { id: true, tier: true, name: true, price: true }, orderBy: { price: "asc" as const } },
  _count: { select: { vouchesGiven: true, subscribers: true } },
} as const;

async function loadFighter(slug: string) {
  return safe(
    () => prisma.user.findFirst({ where: { slug, isActive: true, isBanned: false }, select: profileSelect }),
    null,
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [f, locale] = await Promise.all([loadFighter(slug), getLocale()]);
  const c = fightersCopy[locale].detail;
  const alternates = await metadataAlternates(`/dovuscular/${slug}`);
  if (!f) return { title: c.notFound, alternates };
  const L = labelsFor(locale);
  const p = f.sportProfiles[0];
  const record = p ? formatRecord(p.wins, p.losses, p.draws) : "";
  return {
    title: f.name,
    description:
      f.bio?.slice(0, 155) ??
      c.metaDescription
        .replace("{name}", f.name)
        .replace("{discipline}", p ? L.discipline[p.discipline] : c.fallbackDiscipline)
        .replace("{record}", record),
    alternates,
    openGraph: {
      title: `${f.name} · FIGHTNET`,
      description: f.bio ?? `${p ? L.discipline[p.discipline] : ""} ${record}`,
      images: f.avatarUrl ? [{ url: cld(f.avatarUrl, { w: 1200, h: 630 }) }] : undefined,
    },
  };
}

export default async function FighterProfilePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [f, session, locale] = await Promise.all([loadFighter(slug), getSession(), getLocale()]);
  if (!f) notFound();

  const c = fightersCopy[locale].detail;
  const L = labelsFor(locale);

  const isSelf = session?.sub === f.id;
  const [isFollowing, posts] = await Promise.all([
    session && !isSelf
      ? safe(
          async () =>
            !!(await prisma.follow.findUnique({
              where: { followerId_followingId: { followerId: session.sub, followingId: f.id } },
              select: { id: true },
            })),
          false,
        )
      : Promise.resolve(false),
    safe(
      () =>
        prisma.post.findMany({
          where: { userId: f.id, visibility: "PUBLIC", moderation: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true, type: true, body: true, mediaUrl: true, thumbUrl: true,
            durationSec: true, discipline: true, likeCount: true, commentCount: true, createdAt: true,
            user: { select: { id: true, name: true, username: true, slug: true, avatarUrl: true, verification: true, isFounder: true } },
          },
        }),
      [],
    ),
  ]);

  const primary = f.sportProfiles[0];
  const socials = (f.socials ?? {}) as { instagram?: string; youtube?: string };
  const userAge = age(f.birthDate);

  return (
    <>
      {/* Kapak */}
      <div className={cn("relative h-40 overflow-hidden bg-gradient-to-br sm:h-56", disciplineGradient(primary?.discipline ?? "MMA"))}>
        {f.coverUrl ? (
          <Image
            src={cld(f.coverUrl, { w: 1600, h: 420 })}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid-lines opacity-25" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Başlık */}
        <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
          <Avatar
            src={f.avatarUrl}
            name={f.name}
            size="3xl"
            priority
            className="ring-4 ring-[var(--bg)]"
          />
          <div className="flex flex-1 flex-col gap-2 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-black sm:text-4xl">{f.name}</h1>
              <VerifiedMark level={f.verification} />
              {f.isFounder && <FounderMark />}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span>@{f.username}</span>
              <span>{L.role[f.role]}</span>
              {f.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {f.city}, {f.country}
                </span>
              )}
              {userAge && !f.isMinor && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {userAge} {c.ageSuffix}
                </span>
              )}
              {f.heightCm && (
                <span className="flex items-center gap-1">
                  <Ruler className="size-3.5" />
                  {f.heightCm} cm
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-1">
            {isSelf ? (
              <ButtonLink href="/panel/profil" variant="outline" size="sm">
                {c.editProfile}
              </ButtonLink>
            ) : (
              <>
                <FollowButton targetId={f.id} initialFollowing={isFollowing} authed={!!session} />
                {session && <MessageLink recipientId={f.id} />}
                {f.creatorTiers.length > 0 && (
                  <ButtonLink href={`/creator/${f.username}`} variant="gold" size="sm">
                    {c.support}
                  </ButtonLink>
                )}
                <ReportButton targetType="USER" targetId={f.id} reportedUserId={f.id} authed={!!session} />
              </>
            )}
          </div>
        </div>

        {/* Sayaçlar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat icon={Users} label={c.statFollowers} value={compact(f.followerCount)} />
          <MiniStat icon={Flame} label={c.statStreak} value={c.streakValue.replace("{days}", String(f.trainingStreak))} tone="red" />
          <MiniStat icon={Dumbbell} label={c.statTrainings} value={compact(f.totalTrainings)} />
          <MiniStat icon={ShieldCheck} label={c.statVerification} value={L.verificationShort[f.verification]} />
        </div>

        <div className="mt-8 grid gap-6 pb-16 lg:grid-cols-[1fr_340px]">
          {/* Sol sütun */}
          <div className="flex flex-col gap-6">
            {f.bio && (
              <Card>
                <CardBody>
                  <h2 className="mb-2 text-xs font-black uppercase tracking-wider text-muted">{c.about}</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{f.bio}</p>
                </CardBody>
              </Card>
            )}

            {/* Spor profilleri — §4.2 çoklu spor */}
            <Section title={c.disciplines}>
              <div className="grid gap-3 sm:grid-cols-2">
                {f.sportProfiles.length === 0 && (
                  <p className="text-sm text-muted">{c.noDisciplines}</p>
                )}
                {f.sportProfiles.map((sp) => (
                  <Card key={sp.id}>
                    <div className={cn("h-1.5 rounded-t-2xl bg-gradient-to-r", disciplineGradient(sp.discipline))} />
                    <CardBody className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold">{L.discipline[sp.discipline]}</h3>
                          <p className="text-xs text-muted">
                            {L.skill[sp.level]}
                            {sp.isPro && ` · ${c.professional}`}
                            {sp.yearsActive > 0 && ` · ${c.yearsActive.replace("{years}", String(sp.yearsActive))}`}
                          </p>
                        </div>
                        {sp.isPrimary && <Badge tone="red">{c.primary}</Badge>}
                      </div>

                      {sp.belt !== "NONE" && (
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-10 rounded-sm" style={{ background: BELT_COLOR[sp.belt] }} />
                          <span className="text-xs font-bold">
                            {L.belt[sp.belt]} {c.beltSuffix}
                            {sp.stripes > 0 && ` · ${c.stripes.replace("{stripes}", String(sp.stripes))}`}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2 rounded-xl bg-[var(--bg-subtle)] p-3 text-center">
                        <RecordCell label={c.recordWins} value={sp.wins} tone="text-emerald-500" />
                        <RecordCell label={c.recordLosses} value={sp.losses} tone="text-blood-500" />
                        <RecordCell label={c.recordDraws} value={sp.draws} />
                        <RecordCell label={c.recordKo} value={sp.koWins} tone="text-gold-500" />
                      </div>

                      {sp.weightClass && (
                        <p className="text-xs text-muted">{c.weightClass}: {sp.weightClass}</p>
                      )}
                      {sp.achievements.length > 0 && (
                        <ul className="flex flex-col gap-1">
                          {sp.achievements.map((a) => (
                            <li key={a} className="flex items-start gap-1.5 text-xs">
                              <Trophy className="mt-0.5 size-3.5 shrink-0 text-gold-500" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </Section>

            {/* Gönderiler */}
            <Section title={c.posts}>
              {posts.length === 0 ? (
                <EmptyState title={c.noPostsTitle} description={c.noPostsBody} />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {posts.map((p) => (
                    <PostCard key={p.id} p={p} />
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Sağ sütun */}
          <aside className="flex flex-col gap-4">
            {/* Salonlar */}
            {f.gymMemberships.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-muted">{c.gyms}</h2>
                  <div className="flex flex-col gap-2">
                    {f.gymMemberships.map((m) => (
                      <Link
                        key={m.gym.id}
                        href={`/salonlar/${m.gym.slug}`}
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                      >
                        {m.gym.logoUrl ? (
                          <Image src={cld(m.gym.logoUrl, { w: 80, h: 80 })} alt="" width={40} height={40} className="size-10 rounded-xl object-cover" />
                        ) : (
                          <span className="flex size-10 items-center justify-center rounded-xl bg-ink-200 dark:bg-ink-800">
                            <Building2 className="size-4 text-muted" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{m.gym.name}</p>
                          <p className="truncate text-xs text-muted">{m.gym.city}</p>
                        </div>
                        {m.isPrimary && <Badge tone="red">{c.primary}</Badge>}
                      </Link>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Antrenörlük */}
            {f.coachAt.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-muted">{c.coaching}</h2>
                  <div className="flex flex-col gap-2">
                    {f.coachAt.map((ca) => (
                      <Link key={ca.gym.slug} href={`/salonlar/${ca.gym.slug}`} className="flex items-center justify-between gap-2 rounded-xl p-2 hover:bg-ink-100 dark:hover:bg-ink-800">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{ca.gym.name}</p>
                          <p className="truncate text-xs text-muted">{ca.title ?? c.coachFallbackTitle}{ca.isHead && ` · ${c.headCoach}`}</p>
                        </div>
                        {ca.verified && <VerifiedMark level="LEVEL_2" />}
                      </Link>
                    ))}
                  </div>
                  {f._count.vouchesGiven > 0 && (
                    <p className="mt-3 rounded-xl bg-[var(--bg-subtle)] px-3 py-2 text-xs text-muted">
                      {c.vouchedForLead} <b className="text-[var(--fg)]">{f._count.vouchesGiven}</b> {c.vouchedForTail}
                    </p>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Kefalet — §4.5 */}
            {f.vouchesReceived.length > 0 && (
              <Card>
                <CardBody>
                  <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-muted">{c.vouchingCoaches}</h2>
                  <div className="flex flex-col gap-2">
                    {f.vouchesReceived.map((v) => (
                      <Link key={v.coach.slug} href={`/dovuscular/${v.coach.slug}`} className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-ink-100 dark:hover:bg-ink-800">
                        <Avatar src={v.coach.avatarUrl} name={v.coach.name} size="sm" />
                        <span className="truncate text-sm font-semibold">{v.coach.name}</span>
                        <VerifiedMark level={v.coach.verification} className="ml-auto" />
                      </Link>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Bağlantılar */}
            {(f.website || socials.instagram || socials.youtube) && (
              <Card>
                <CardBody className="flex flex-col gap-2">
                  <h2 className="text-xs font-black uppercase tracking-wider text-muted">{c.links}</h2>
                  {f.website && (
                    <a href={f.website} target="_blank" rel="noopener nofollow" className="flex items-center gap-2 text-sm hover:text-blood-500">
                      <Globe className="size-4" /> {c.website}
                    </a>
                  )}
                  {socials.instagram && (
                    <a href={`https://instagram.com/${socials.instagram}`} target="_blank" rel="noopener nofollow" className="flex items-center gap-2 text-sm hover:text-blood-500">
                      <AtSign className="size-4" /> @{socials.instagram}
                    </a>
                  )}
                  {socials.youtube && (
                    <a href={`https://youtube.com/@${socials.youtube}`} target="_blank" rel="noopener nofollow" className="flex items-center gap-2 text-sm hover:text-blood-500">
                      <Video className="size-4" /> {socials.youtube}
                    </a>
                  )}
                </CardBody>
              </Card>
            )}

            <Card>
              <CardBody className="text-xs text-muted">
                <p>{c.memberSince} {formatDate(f.createdAt, LOCALE_TAG[locale])}</p>
                <p className="mt-1">{c.longestStreak} {c.streakValue.replace("{days}", String(f.longestStreak))}</p>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone?: "red";
}) {
  return (
    <div className="surface flex items-center gap-3 rounded-2xl p-3.5">
      <Icon className={cn("size-4 shrink-0", tone === "red" ? "text-blood-500" : "text-muted")} />
      <div className="min-w-0">
        <p className="truncate text-base font-black">{value}</p>
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      </div>
    </div>
  );
}

function RecordCell({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div>
      <p className={cn("text-lg font-black tabular-nums", tone)}>{value}</p>
      <p className="text-[10px] font-bold uppercase text-muted">{label}</p>
    </div>
  );
}
