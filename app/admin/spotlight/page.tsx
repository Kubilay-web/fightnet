import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Sparkles, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { deleteSpotlight } from "@/app/admin/actions";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Card, CardBody, Section, EmptyState } from "@/components/ui";
import { SpotlightForm } from "@/components/spotlight-form";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { adminSpotlightCopy } from "@/lib/i18n/pages/admin-ops";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminSpotlightCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function AdminSpotlightPage() {
  await requireAdmin();
  const locale = await getLocale();
  const t = adminSpotlightCopy[locale];

  const spotlights = await safe(
    () =>
      prisma.spotlight.findMany({
        orderBy: { date: "desc" },
        take: 30,
        select: {
          id: true, date: true, headline: true, blurb: true, isActive: true,
          user: { select: { name: true, username: true, slug: true, avatarUrl: true, verification: true } },
        },
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <Section title={t.title} subtitle={t.subtitle}>
        <Card>
          <CardBody>
            <SpotlightForm />
          </CardBody>
        </Card>
      </Section>

      <Section title={t.scheduled}>
        {spotlights.length === 0 ? (
          <EmptyState icon={<Sparkles className="size-10" />} title={t.empty} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {spotlights.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                  <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400">
                    <span className="text-sm font-black leading-none">{s.date.getDate()}</span>
                    <span className="text-[10px] font-bold uppercase">
                      {s.date.toLocaleDateString(LOCALE_TAG[locale], { month: "short" })}
                    </span>
                  </span>

                  <Avatar src={s.user.avatarUrl} name={s.user.name} size="md" href={`/dovuscular/${s.user.slug}`} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <Link href={`/dovuscular/${s.user.slug}`} className="truncate font-bold hover:text-blood-500">
                        {s.user.name}
                      </Link>
                      <VerifiedMark level={s.user.verification} />
                    </div>
                    {s.headline && <p className="truncate text-sm text-blood-500">{s.headline}</p>}
                    {s.blurb && <p className="line-clamp-2-safe text-xs text-muted">{s.blurb}</p>}
                  </div>

                  <form action={deleteSpotlight.bind(null, s.id)}>
                    <button
                      type="submit"
                      aria-label={t.delete}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-blood-500/10 hover:text-blood-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>
    </div>
  );
}
