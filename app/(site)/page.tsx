import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Suspense } from "react";
import {
  ArrowRight, ShieldCheck, Swords, MapPin, Radio, Dumbbell,
  Users, Sparkles, TrendingUp, Award, Zap,
} from "lucide-react";
import { getHomeData } from "@/lib/queries";
import { AdSlot } from "@/components/ad-slot";
import { FighterCard, GymCard, EventCard, PostCard } from "@/components/cards";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, ButtonLink, Card, Section, Skeleton } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { compact, formatRecord } from "@/lib/utils";
import { DISCIPLINES } from "@/lib/constants";
import { getDict, getLocale, metadataAlternates } from "@/lib/i18n/server";
import { homeCopy } from "@/lib/i18n/pages/home";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const copy = homeCopy[await getLocale()];
  return {
    // Ana sayfada şablon ("%s · FIGHTNET") yerine tam marka başlığı kullanılır.
    title: { absolute: copy.meta.title },
    description: copy.meta.description,
    alternates: await metadataAlternates("/"),
  };
}

export default async function HomePage() {
  const [locale, dict] = await Promise.all([getLocale(), getDict()]);
  const copy = homeCopy[locale];

  return (
    <>
      <Hero copy={copy} dict={dict} />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
      <Principles copy={copy} />
      <WaitlistSection copy={copy} />
    </>
  );
}

type Copy = (typeof homeCopy)[keyof typeof homeCopy];

// ---------------------------------------------------------------------------

function Hero({ copy, dict }: { copy: Copy; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="absolute inset-0 mesh-hero" />
      <div className="absolute inset-0 grid-lines opacity-[0.35]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="flex max-w-3xl flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="red">{copy.hero.badgeBeta}</Badge>
            <Badge tone="gold">{copy.hero.badgeFounder}</Badge>
          </div>

          <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {dict.home.heroTitleTop}
            <span className="block bg-gradient-to-r from-blood-500 to-gold-500 bg-clip-text text-transparent">
              {dict.home.heroTitleAccent}
            </span>
          </h1>

          <p className="max-w-2xl text-base text-muted sm:text-lg">{dict.home.heroBody}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/kayit" size="lg">
              {dict.home.ctaPrimary}
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/dovuscular" variant="outline" size="lg">
              {copy.hero.ctaFighters}
            </ButtonLink>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" />
              {copy.hero.trustVerification}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-blood-500" />
              {copy.hero.trustHosting}
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-4 text-gold-500" />
              {copy.hero.trustIndependent}
            </span>
          </div>
        </div>

        <div className="no-scrollbar scroll-snap-x mt-12 flex gap-2 overflow-x-auto pb-2">
          {DISCIPLINES.map((d) => (
            <Link
              key={d.value}
              href={`/dovuscular?discipline=${d.value}`}
              className="snap-item shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-semibold transition-colors hover:border-blood-500 hover:text-blood-500"
            >
              <span className="mr-1.5">{d.emoji}</span>
              {d.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

async function HomeContent() {
  const [data, locale, dict] = await Promise.all([getHomeData(), getLocale(), getDict()]);
  const copy = homeCopy[locale];
  const { spotlight, liveEvents, upcomingEvents, topFighters, featuredGyms, latestPosts, stats } = data;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-12 sm:px-6 sm:gap-20 sm:py-16">
      {/* Platform istatistikleri */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Users} label={dict.home.statAthletes} value={compact(stats.fighters)} />
        <StatTile icon={ShieldCheck} label={dict.home.statVerified} value={compact(stats.verified)} />
        <StatTile icon={Dumbbell} label={dict.home.statGyms} value={compact(stats.gyms)} />
        <StatTile icon={Award} label={dict.home.statEvents} value={compact(stats.events)} />
      </div>

      {/* §4.4 — Premium abonelere sunucuda hiç render edilmez */}
      <AdSlot placement="HOME_TOP" />

      {/* Canlı etkinlikler */}
      {liveEvents.length > 0 && (
        <Section
          title={dict.home.liveNow}
          subtitle={dict.home.liveNowSub}
          action={
            <ButtonLink href="/etkinlikler?status=LIVE" variant="ghost" size="sm">
              {dict.common.all} <ArrowRight className="size-4" />
            </ButtonLink>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveEvents.map((e, i) => (
              <EventCard key={e.id} e={e} priority={i === 0} />
            ))}
          </div>
        </Section>
      )}

      {/* Günün sporcusu — §4.1 Spotlight */}
      {spotlight?.user && (
        <Section title={dict.home.spotlight} subtitle={copy.sections.spotlightSub}>
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-[280px_1fr]">
              <div className="relative flex items-center justify-center bg-gradient-to-br from-blood-600 to-blood-900 p-8">
                <div className="absolute inset-0 grid-lines opacity-20" />
                <Avatar
                  src={spotlight.user.avatarUrl}
                  name={spotlight.user.name}
                  size="3xl"
                  priority
                  className="relative ring-4 ring-white/20"
                />
              </div>
              <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
                <Badge tone="gold" className="w-fit">
                  <Sparkles className="size-3" /> {copy.sections.spotlightBadge}
                </Badge>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-2xl font-black sm:text-3xl">{spotlight.user.name}</h3>
                  <VerifiedMark level={spotlight.user.verification} showLabel />
                </div>
                {spotlight.headline && <p className="font-semibold text-blood-500">{spotlight.headline}</p>}
                {spotlight.blurb && <p className="text-sm text-muted">{spotlight.blurb}</p>}

                <div className="flex flex-wrap gap-4 pt-1 text-sm">
                  {spotlight.user.sportProfiles[0] && (
                    <span className="font-black tabular-nums">
                      {formatRecord(
                        spotlight.user.sportProfiles[0].wins,
                        spotlight.user.sportProfiles[0].losses,
                        spotlight.user.sportProfiles[0].draws,
                      )}
                    </span>
                  )}
                  <span className="text-muted">
                    {compact(spotlight.user.followerCount)} {copy.sections.followers}
                  </span>
                  {spotlight.user.city && <span className="text-muted">{spotlight.user.city}</span>}
                </div>

                <ButtonLink href={`/dovuscular/${spotlight.user.slug}`} className="mt-2 w-fit" size="sm">
                  {copy.sections.viewProfile} <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Section>
      )}

      {/* Yaklaşan etkinlikler */}
      {upcomingEvents.length > 0 && (
        <Section
          title={dict.home.upcoming}
          subtitle={copy.sections.upcomingSub}
          action={
            <ButtonLink href="/etkinlikler" variant="ghost" size="sm">
              {copy.sections.calendar} <ArrowRight className="size-4" />
            </ButtonLink>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        </Section>
      )}

      {/* Öne çıkan dövüşçüler */}
      {topFighters.length > 0 && (
        <Section
          title={dict.home.topFighters}
          subtitle={copy.sections.fightersSub}
          action={
            <ButtonLink href="/dovuscular" variant="ghost" size="sm">
              {dict.common.all} <ArrowRight className="size-4" />
            </ButtonLink>
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {topFighters.map((f) => (
              <FighterCard key={f.id} f={f} />
            ))}
          </div>
        </Section>
      )}

      {/* Salonlar */}
      {featuredGyms.length > 0 && (
        <Section
          title={dict.home.featuredGyms}
          subtitle={copy.sections.gymsSub}
          action={
            <ButtonLink href="/salonlar" variant="ghost" size="sm">
              {dict.home.ctaSecondary} <ArrowRight className="size-4" />
            </ButtonLink>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredGyms.map((g) => (
              <GymCard key={g.id} g={g} />
            ))}
          </div>
        </Section>
      )}

      {/* Keşfet */}
      {latestPosts.length > 0 && (
        <Section
          title={dict.home.latestPosts}
          subtitle={copy.sections.postsSub}
          action={
            <ButtonLink href="/akis" variant="ghost" size="sm">
              {copy.sections.feed} <ArrowRight className="size-4" />
            </ButtonLink>
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {latestPosts.map((p) => (
              <PostCard key={p.id} p={p} />
            ))}
          </div>
        </Section>
      )}

      <FeatureGrid copy={copy} />
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="surface flex items-center gap-3 rounded-2xl p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-black tabular-nums sm:text-2xl">{value}</p>
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

/** İkon ve hedef; başlık/metin `homeCopy.features.items` içinde AYNI SIRADA. */
const FEATURES = [
  { icon: ShieldCheck, href: "/panel/dogrulama" },
  { icon: Dumbbell, href: "/panel/antrenman" },
  { icon: Swords, href: "/sparring" },
  { icon: Radio, href: "/etkinlikler" },
  { icon: MapPin, href: "/salonlar" },
  { icon: TrendingUp, href: "/creator" },
];

function FeatureGrid({ copy }: { copy: Copy }) {
  return (
    <Section title={copy.features.heading} subtitle={copy.features.subtitle}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, href }, i) => (
          <Link key={href} href={href}>
            <Card hover className="flex h-full flex-col gap-3 p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
                <Icon className="size-5" />
              </span>
              <h3 className="font-bold">{copy.features.items[i].title}</h3>
              <p className="text-sm text-muted">{copy.features.items[i].body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------

function Principles({ copy }: { copy: Copy }) {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg-subtle)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="font-display text-2xl font-black sm:text-4xl">{copy.principles.heading}</h2>
        <p className="mt-2 max-w-2xl text-muted">{copy.principles.subtitle}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.principles.items.map((p, i) => (
            <div key={p.title} className="surface rounded-2xl p-5">
              <span className="font-display text-3xl font-black text-blood-500/30">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-bold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function WaitlistSection({ copy }: { copy: Copy }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 mesh-hero opacity-60" />
      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge tone="red">{copy.waitlist.badge}</Badge>
          <h2 className="font-display text-3xl font-black sm:text-5xl">{copy.waitlist.heading}</h2>
          <p className="max-w-xl text-muted">{copy.waitlist.body}</p>
        </div>
        <Card className="mt-8 p-5 sm:p-7">
          <WaitlistForm />
        </Card>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
