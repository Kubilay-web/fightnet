import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Users, ShieldCheck, XCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { revokeVouch } from "@/app/panel/actions";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState, Alert, Button } from "@/components/ui";
import { VouchForm } from "@/components/vouch-form";
import { formatDate } from "@/lib/utils";
import { MAX_VOUCHES_PER_COACH } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { vouchCopy } from "@/lib/i18n/pages/panel-trust";

export async function generateMetadata(): Promise<Metadata> {
  const copy = vouchCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function VouchPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = vouchCopy[locale];

  const vouches = await safe(
    () =>
      prisma.vouch.findMany({
        where: { coachId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, status: true, note: true, createdAt: true, revokedAt: true,
          athlete: {
            select: {
              name: true, username: true, slug: true, avatarUrl: true,
              verification: true, city: true,
            },
          },
        },
      }),
    [],
  );

  const active = vouches.filter((v) => v.status === "ACCEPTED");
  const canVouch = user.verification === "LEVEL_2" && (user.role === "COACH" || user.role === "ADMIN");
  const remaining = MAX_VOUCHES_PER_COACH - active.length;

  return (
    <div className="flex flex-col gap-8">
      <Section title={copy.title} subtitle={copy.subtitle}>
        <Alert tone="blue" title={copy.how.title}>
          {copy.how.body1}
          <b>{copy.how.reputation}</b>
          {copy.how.body2}
        </Alert>
      </Section>

      {!canVouch ? (
        <Alert tone="amber" title={copy.needLevel2.title}>
          {copy.needLevel2.body}{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">
            {copy.needLevel2.link}
          </Link>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{copy.stats.active}</p>
                <p className="mt-1 text-2xl font-black tabular-nums">
                  {active.length} <span className="text-base text-muted">/ {MAX_VOUCHES_PER_COACH}</span>
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{copy.stats.remaining}</p>
                <p className="mt-1 text-2xl font-black tabular-nums text-emerald-500">{remaining}</p>
              </CardBody>
            </Card>
          </div>

          {remaining > 0 && (
            <Section title={copy.newTitle}>
              <Card>
                <CardBody>
                  <VouchForm />
                </CardBody>
              </Card>
            </Section>
          )}
        </>
      )}

      <Section title={copy.listTitle}>
        {vouches.length === 0 ? (
          <EmptyState
            icon={<Users className="size-10" />}
            title={copy.empty.title}
            description={copy.empty.description}
          />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {vouches.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-3 p-4">
                  <Avatar src={v.athlete.avatarUrl} name={v.athlete.name} size="md" href={`/dovuscular/${v.athlete.slug}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <Link href={`/dovuscular/${v.athlete.slug}`} className="truncate font-bold hover:text-blood-500">
                        {v.athlete.name}
                      </Link>
                      <VerifiedMark level={v.athlete.verification} />
                    </div>
                    <p className="text-xs text-muted">
                      @{v.athlete.username}
                      {v.athlete.city && ` · ${v.athlete.city}`} · {formatDate(v.createdAt, LOCALE_TAG[locale])}
                    </p>
                    {v.note && <p className="mt-1 text-xs">{v.note}</p>}
                  </div>

                  <Badge tone={v.status === "ACCEPTED" ? "green" : "neutral"}>
                    {v.status === "ACCEPTED"
                      ? copy.status.active
                      : v.status === "REVOKED"
                        ? copy.status.revoked
                        : v.status}
                  </Badge>

                  {v.status === "ACCEPTED" && (
                    <form action={revokeVouch.bind(null, v.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        <XCircle className="size-4" /> {copy.revoke}
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>
    </div>
  );
}
