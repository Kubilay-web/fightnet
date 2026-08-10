import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = { title: "Kefaletlerim", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VouchPage() {
  const user = await requireUser();

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
      <Section
        title="Antrenör Kefaleti"
        subtitle="Doğrulanmış antrenörler 20 amatör öğrencisine kadar kefil olabilir (§4.5)"
      >
        <Alert tone="blue" title="Nasıl çalışır">
          Kefil olduğun sporcu otomatik Seviye 1 doğrulanmış olur ve sparring araması açılır.
          <b> İtibarınla sorumlusun</b> — sahte kefalet durumunda antrenör statün geri alınır.
        </Alert>
      </Section>

      {!canVouch ? (
        <Alert tone="amber" title="Kefalet için Seviye 2 antrenör olmalısın">
          Antrenör lisansını yükleyip durum doğrulamasını tamamla.{" "}
          <Link href="/panel/dogrulama" className="font-bold underline">
            Doğrulamayı başlat
          </Link>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Aktif kefalet</p>
                <p className="mt-1 text-2xl font-black tabular-nums">
                  {active.length} <span className="text-base text-muted">/ {MAX_VOUCHES_PER_COACH}</span>
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Kalan hak</p>
                <p className="mt-1 text-2xl font-black tabular-nums text-emerald-500">{remaining}</p>
              </CardBody>
            </Card>
          </div>

          {remaining > 0 && (
            <Section title="Yeni Kefalet">
              <Card>
                <CardBody>
                  <VouchForm />
                </CardBody>
              </Card>
            </Section>
          )}
        </>
      )}

      <Section title="Kefil Olduğum Sporcular">
        {vouches.length === 0 ? (
          <EmptyState
            icon={<Users className="size-10" />}
            title="Henüz kefalet yok"
            description="Öğrencilerinin kullanıcı adını girerek onları doğrula."
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
                      {v.athlete.city && ` · ${v.athlete.city}`} · {formatDate(v.createdAt)}
                    </p>
                    {v.note && <p className="mt-1 text-xs">{v.note}</p>}
                  </div>

                  <Badge tone={v.status === "ACCEPTED" ? "green" : "neutral"}>
                    {v.status === "ACCEPTED" ? "Aktif" : v.status === "REVOKED" ? "Geri alındı" : v.status}
                  </Badge>

                  {v.status === "ACCEPTED" && (
                    <form action={revokeVouch.bind(null, v.id)}>
                      <Button type="submit" size="sm" variant="outline">
                        <XCircle className="size-4" /> Geri Al
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
