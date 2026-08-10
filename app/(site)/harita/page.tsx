import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { Section } from "@/components/ui";
import { GymMap } from "@/components/gym-map";

export const metadata: Metadata = {
  title: "Harita",
  description: "DACH bölgesindeki dövüş sporu salonlarını ve etkinliklerini harita üzerinde gör.",
};

export const revalidate = 300;

export default async function MapPage() {
  const data = await safe(
    async () => {
      const now = new Date();
      const [gyms, events] = await Promise.all([
        prisma.gym.findMany({
          where: { status: "ACTIVE", lat: { not: null }, lng: { not: null } },
          select: {
            id: true, slug: true, name: true, city: true, lat: true, lng: true,
            disciplines: true, isHalo: true, isFounder: true, trialEnabled: true, memberCount: true,
          },
          take: 500,
        }),
        prisma.event.findMany({
          where: {
            status: { in: ["PUBLISHED", "LIVE"] },
            startsAt: { gte: now },
            lat: { not: null },
            lng: { not: null },
          },
          select: {
            id: true, slug: true, title: true, city: true, lat: true, lng: true,
            startsAt: true, type: true, status: true,
          },
          take: 200,
        }),
      ]);
      return { gyms, events };
    },
    { gyms: [], events: [] },
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Section
        title="Harita"
        subtitle={`${data.gyms.length} salon ve ${data.events.length} etkinlik haritada`}
      >
        <GymMap
          gyms={data.gyms.map((g) => ({
            id: g.id,
            slug: g.slug,
            name: g.name,
            city: g.city,
            lat: g.lat!,
            lng: g.lng!,
            disciplines: g.disciplines,
            isHalo: g.isHalo,
            trialEnabled: g.trialEnabled,
            memberCount: g.memberCount,
          }))}
          events={data.events.map((e) => ({
            id: e.id,
            slug: e.slug,
            title: e.title,
            city: e.city,
            lat: e.lat!,
            lng: e.lng!,
            startsAt: e.startsAt.toISOString(),
            isLive: e.status === "LIVE",
          }))}
        />
      </Section>
    </div>
  );
}
