import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Section } from "@/components/ui";
import { ProfileForm, SportProfileManager } from "@/components/profile-forms";

export const metadata: Metadata = { title: "Profilim", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();

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
    return <p className="text-muted">Profil yüklenemedi. Veritabanı bağlantısını kontrol edin.</p>;
  }

  const socials = (data.full.socials ?? {}) as { instagram?: string; youtube?: string };

  return (
    <div className="flex flex-col gap-8">
      <Section title="Profilim" subtitle="Herkese açık profilinde görünen bilgiler">
        <ProfileForm
          initial={{
            ...data.full,
            birthDate: data.full.birthDate ? data.full.birthDate.toISOString().slice(0, 10) : "",
            instagram: socials.instagram ?? "",
            youtube: socials.youtube ?? "",
          }}
        />
      </Section>

      <Section title="Disiplinlerim" subtitle="Birden fazla dövüş sporu ekleyebilirsin (§4.2 çoklu spor profili)">
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
