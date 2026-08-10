import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import {
  ArrowRight, ShieldCheck, Swords, MapPin, Radio, Dumbbell,
  Users, Sparkles, TrendingUp, Award, Zap,
} from "lucide-react";
import { getHomeData, getActiveAd } from "@/lib/queries";
import { FighterCard, GymCard, EventCard, PostCard } from "@/components/cards";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, ButtonLink, Card, LiveBadge, Section, Skeleton } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { compact, formatRecord } from "@/lib/utils";
import { DISCIPLINES } from "@/lib/constants";
import { cld } from "@/lib/image";

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
      <Principles />
      <WaitlistSection />
    </>
  );
}

// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="absolute inset-0 mesh-hero" />
      <div className="absolute inset-0 grid-lines opacity-[0.35]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="flex max-w-3xl flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="red">Beta · Davetli Erken Erişim</Badge>
            <Badge tone="gold">Kurucu Üye 50 €/ay</Badge>
          </div>

          <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Hessen'deki amatör şampiyon,
            <span className="block bg-gradient-to-r from-blood-500 to-gold-500 bg-clip-text text-transparent">
              bir UFC dövüşçüsü kadar görünür.
            </span>
          </h1>

          <p className="max-w-2xl text-base text-muted sm:text-lg">
            FIGHTNET, DACH bölgesinde dövüş sporları için bağımsız platformdur.
            Doğrulanmış dövüşçü profilleri, salon bulucu, sparring eşleştirme, canlı skor
            ve topluluk — hepsi tek yerde.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/kayit" size="lg">
              Ücretsiz Katıl
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/dovuscular" variant="outline" size="lg">
              Dövüşçüleri Keşfet
            </ButtonLink>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" />
              3 seviyeli doğrulama
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-blood-500" />
              AB'de barındırma · KVKK
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-4 text-gold-500" />
              Federasyondan bağımsız
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
  const [data, ad] = await Promise.all([getHomeData(), getActiveAd("HOME_TOP")]);
  const { spotlight, liveEvents, upcomingEvents, topFighters, featuredGyms, latestPosts, stats } = data;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-12 sm:px-6 sm:gap-20 sm:py-16">
      {/* Platform istatistikleri */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Users} label="Sporcu" value={compact(stats.fighters)} />
        <StatTile icon={ShieldCheck} label="Doğrulanmış" value={compact(stats.verified)} />
        <StatTile icon={Dumbbell} label="Salon" value={compact(stats.gyms)} />
        <StatTile icon={Award} label="Etkinlik" value={compact(stats.events)} />
      </div>

      {ad && (
        <Link href={ad.linkUrl} target="_blank" rel="sponsored noopener" className="block overflow-hidden rounded-2xl border border-[var(--border)]">
          <Image
            src={cld(ad.imageUrl, { w: 1280, h: 200 })}
            alt={ad.advertiser}
            width={1280}
            height={200}
            className="h-auto w-full object-cover"
          />
        </Link>
      )}

      {/* Canlı etkinlikler */}
      {liveEvents.length > 0 && (
        <Section
          title="Şu An Canlı"
          subtitle="Devam eden müsabakaları anlık takip et"
          action={
            <ButtonLink href="/etkinlikler?status=LIVE" variant="ghost" size="sm">
              Tümü <ArrowRight className="size-4" />
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
        <Section title="Günün Sporcusu" subtitle="Her gün öne çıkan bir dövüşçü">
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
                  <Sparkles className="size-3" /> Spotlight
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
                  <span className="text-muted">{compact(spotlight.user.followerCount)} takipçi</span>
                  {spotlight.user.city && <span className="text-muted">{spotlight.user.city}</span>}
                </div>

                <ButtonLink href={`/dovuscular/${spotlight.user.slug}`} className="mt-2 w-fit" size="sm">
                  Profili Gör <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Section>
      )}

      {/* Yaklaşan etkinlikler */}
      {upcomingEvents.length > 0 && (
        <Section
          title="Yaklaşan Etkinlikler"
          subtitle="Yerel ve küresel dövüş sporu takvimi"
          action={
            <ButtonLink href="/etkinlikler" variant="ghost" size="sm">
              Takvim <ArrowRight className="size-4" />
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
          title="Öne Çıkan Dövüşçüler"
          subtitle="Doğrulanmış profiller — amatörden profesyonele"
          action={
            <ButtonLink href="/dovuscular" variant="ghost" size="sm">
              Tümü <ArrowRight className="size-4" />
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
          title="Salonlar"
          subtitle="Bölgendeki dövüş sporu salonlarını bul, deneme antrenmanı ayarla"
          action={
            <ButtonLink href="/salonlar" variant="ghost" size="sm">
              Salon Bulucu <ArrowRight className="size-4" />
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
          title="Keşfet"
          subtitle="Topluluktan en yeni antrenman ve müsabaka içerikleri"
          action={
            <ButtonLink href="/akis" variant="ghost" size="sm">
              Akış <ArrowRight className="size-4" />
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

      <FeatureGrid />
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

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "3 Seviyeli Doğrulama",
    body: "E-posta, kimlik+selfie (KYC) ve durum doğrulaması. Antrenörler 20 öğrencisine kadar kefil olabilir.",
    href: "/panel/dogrulama",
  },
  {
    icon: Dumbbell,
    title: "Antrenman Günlüğü",
    body: "Her seansı kaydet, streak sayacını büyüt. Çevrimdışı çalışır, bağlantı gelince senkronize olur.",
    href: "/panel/antrenman",
  },
  {
    icon: Swords,
    title: "Sparring Eşleştirme",
    body: "Bölgende disiplin, seviye ve kiloya göre partner bul. Her seans sonrası güvenlik değerlendirmesi.",
    href: "/sparring",
  },
  {
    icon: Radio,
    title: "Yorumlu Canlı Skor",
    body: "Devam eden müsabakaların anlık sonuçları, tur tur canlı yorum akışı.",
    href: "/etkinlikler",
  },
  {
    icon: MapPin,
    title: "Salon Bulucu & Rezervasyon",
    body: "Harita üzerinde salonları gör, deneme antrenmanı için özel akışla kayıt ol.",
    href: "/salonlar",
  },
  {
    icon: TrendingUp,
    title: "Creator Abonelikleri",
    body: "Sporcular kendi abonelik sayfasını açar, hayranlar destekler. %85 sporcuda kalır.",
    href: "/creator",
  },
];

function FeatureGrid() {
  return (
    <Section title="Platformda neler var" subtitle="Topluluk önce — altyapı sonra">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body, href }) => (
          <Link key={title} href={href}>
            <Card hover className="flex h-full flex-col gap-3 p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-blood-600/10 text-blood-500">
                <Icon className="size-5" />
              </span>
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm text-muted">{body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------

const PRINCIPLES = [
  {
    n: "01",
    title: "Community First",
    body: "Önce topluluk FIGHTNET'te yaşasın. Sonra dövüş sporu FIGHTNET üzerinden organize edilsin.",
  },
  {
    n: "02",
    title: "Value First",
    body: "Veri yalnızca kullanıcı net bir fayda gördüğünde toplanır. Gereksiz alan yok, veri toplama refleksi yok.",
  },
  {
    n: "03",
    title: "Görünürlük Seviyeleri",
    body: "Her veri noktası için kimin ne göreceğine sen karar verirsin — herkese açıktan tamamen özele.",
  },
  {
    n: "04",
    title: "Trust by Design",
    body: "Güven pazarlama vaadiyle değil sistem tasarımıyla kurulur: doğrulama, kefalet, şeffaf moderasyon.",
  },
];

function Principles() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg-subtle)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="font-display text-2xl font-black sm:text-4xl">Temel İlkelerimiz</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Dört ilke tüm özellik ve tasarım kararlarımıza pusula olur.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <div key={p.n} className="surface rounded-2xl p-5">
              <span className="font-display text-3xl font-black text-blood-500/30">{p.n}</span>
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

function WaitlistSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 mesh-hero opacity-60" />
      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge tone="red">Beta Programı</Badge>
          <h2 className="font-display text-3xl font-black sm:text-5xl">Erken erişim listesine katıl</h2>
          <p className="max-w-xl text-muted">
            FIGHTNET davetli erken erişimle başlıyor. Kurucu Üyeler ömür boyu 50 €/ay
            ayrıcalıklı fiyatı korur ve profilinde Kurucu rozeti taşır.
          </p>
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
