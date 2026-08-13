import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Section } from "@/components/ui";
import { ProfileForm, SportProfileManager } from "@/components/profile-forms";
import { getLocale } from "@/lib/i18n/server";
import { panelProfileCopy } from "@/lib/i18n/pages/panel-profile";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelProfileCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const t = panelProfileCopy[await getLocale()];

  const data = await safe(
    async () => {
      const [full, sports] = await Promise.all([
        prisma.user.findUnique({
          where: { id: user.id },
          select: {
            name: true, bio: true, city: true, country: true, postalCode: true,
            birthDate: true, nationality: true, heightCm: true, reachCm: true, stance: true,
            website: true, socials: true, visibility: true,
            avatarUrl: true, avatarId: true, coverUrl: true, coverId: true,
          },
        }),
        prisma.sportProfile.findMany({
          where: { userId: user.id },
          orderBy: [{ isPrimary: "desc" }, { discipline: "asc" }],
        }),
      ]);
      return { full, sports };
    },
    { full: null, sports: [] },
  );

  if (!data.full) {
    return <p className="text-muted">{t.loadError}</p>;
  }

  const socials = (data.full.socials ?? {}) as { instagram?: string; youtube?: string };

  return (
    <div className="flex flex-col gap-8">
      <Section title={t.profileSection.title} subtitle={t.profileSection.subtitle}>
        <ProfileForm
          initial={{
            ...data.full,
            birthDate: data.full.birthDate ? data.full.birthDate.toISOString().slice(0, 10) : "",
            instagram: socials.instagram ?? "",
            youtube: socials.youtube ?? "",
          }}
        />
      </Section>

      <Section title={t.disciplinesSection.title} subtitle={t.disciplinesSection.subtitle}>
        <SportProfileManager
          sports={data.sports.map((s) => ({
            id: s.id,
            discipline: s.discipline,
            isPrimary: s.isPrimary,
            level: s.level,
            belt: s.belt,
            stripes: s.stripes,
            weightClass: s.weightClass,
            weightKg: s.weightKg,
            yearsActive: s.yearsActive,
            isPro: s.isPro,
            wins: s.wins,
            losses: s.losses,
            draws: s.draws,
            koWins: s.koWins,
            subWins: s.subWins,
          }))}
        />
      </Section>
    </div>
  );
}
