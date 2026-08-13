import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import Image from "next/image";
import { FileBadge, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { reviewPassportDoc } from "@/app/admin/actions";
import { Avatar, VerifiedMark } from "@/components/ui/avatar";
import { Badge, Card, CardBody, Section, EmptyState } from "@/components/ui";
import { ReviewActions } from "@/components/admin-review-actions";
import { cld } from "@/lib/image";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PASSPORT_DOC_KINDS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { adminPassportCopy } from "@/lib/i18n/pages/admin-ops";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminPassportCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function AdminPassportPage() {
  await requireAdmin();
  const locale = await getLocale();
  const t = adminPassportCopy[locale];

  const docs = await safe(
    () =>
      prisma.passportDocument.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 50,
        select: {
          id: true, kind: true, title: true, issuer: true, issuedAt: true,
          expiresAt: true, fileUrl: true, createdAt: true,
          user: {
            select: { name: true, username: true, slug: true, avatarUrl: true, verification: true },
          },
        },
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <Section title={t.title} subtitle={t.subtitle(docs.length)} />

      {docs.length === 0 ? (
        <EmptyState
          icon={<FileBadge className="size-10" />}
          title={t.emptyTitle}
          description={t.emptyDescription}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {docs.map((d) => (
            <Card key={d.id}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={d.user.avatarUrl} name={d.user.name} size="md" href={`/dovuscular/${d.user.slug}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <Link href={`/dovuscular/${d.user.slug}`} className="truncate font-bold hover:text-blood-500">
                        {d.user.name}
                      </Link>
                      <VerifiedMark level={d.user.verification} />
                    </div>
                    <p className="text-xs text-muted">@{d.user.username} · {formatDateTime(d.createdAt, LOCALE_TAG[locale])}</p>
                  </div>
                  {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                  <Badge>{PASSPORT_DOC_KINDS.find((k) => k.value === d.kind)?.label ?? d.kind}</Badge>
                </div>

                <div>
                  <p className="font-bold">{d.title}</p>
                  <p className="text-xs text-muted">
                    {d.issuer && `${d.issuer} · `}
                    {d.issuedAt && `${t.issued}: ${formatDate(d.issuedAt, LOCALE_TAG[locale])}`}
                    {d.expiresAt && ` · ${t.expires}: ${formatDate(d.expiresAt, LOCALE_TAG[locale])}`}
                  </p>
                </div>

                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noopener"
                  className="group relative block aspect-[3/2] overflow-hidden rounded-xl border border-[var(--border)]"
                >
                  <Image src={cld(d.fileUrl, { w: 640, h: 428 })} alt={d.title} fill sizes="320px" className="object-cover" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2 py-1 text-[11px] font-bold text-white">
                    {t.openDocument}
                    <ExternalLink className="size-3" />
                  </span>
                </a>

                <ReviewActions
                  onApprove={reviewPassportDoc.bind(null, d.id, true)}
                  onReject={reviewPassportDoc.bind(null, d.id, false)}
                />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
