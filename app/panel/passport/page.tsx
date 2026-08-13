import type { Metadata } from "next";
import { FileBadge, Trash2, CheckCircle2, Clock, XCircle, ShieldAlert } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { deletePassportDoc } from "@/app/panel/actions";
import { Badge, Card, CardBody, Section, EmptyState, Alert } from "@/components/ui";
import { PassportDocForm } from "@/components/passport-form";
import { formatDate, cn } from "@/lib/utils";
import { PASSPORT_DOC_KINDS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { passportCopy } from "@/lib/i18n/pages/panel-trust";

export async function generateMetadata(): Promise<Metadata> {
  const copy = passportCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = passportCopy[locale];

  const docs = await safe(
    () =>
      prisma.passportDocument.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    [],
  );

  const approved = docs.filter((d) => d.status === "APPROVED").length;

  return (
    <div className="flex flex-col gap-8">
      <Section title={copy.title} subtitle={copy.subtitle}>
        <Alert tone="blue" title={copy.intro.title}>
          {copy.intro.body1}
          <b>{copy.intro.noHealth}</b>
          {copy.intro.body2}
        </Alert>
      </Section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{copy.stats.total}</p>
            <p className="mt-1 text-2xl font-black tabular-nums">{docs.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{copy.stats.approved}</p>
            <p className="mt-1 text-2xl font-black tabular-nums text-emerald-500">{approved}</p>
          </CardBody>
        </Card>
      </div>

      <Section title={copy.docsTitle}>
        {docs.length === 0 ? (
          <EmptyState
            icon={<FileBadge className="size-10" />}
            title={copy.empty.title}
            description={copy.empty.description}
          />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {docs.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-3 p-4">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      d.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : d.status === "REJECTED"
                          ? "bg-blood-500/10 text-blood-500"
                          : "bg-amber-500/10 text-amber-500",
                    )}
                  >
                    {d.status === "APPROVED" ? (
                      <CheckCircle2 className="size-4" />
                    ) : d.status === "REJECTED" ? (
                      <XCircle className="size-4" />
                    ) : (
                      <Clock className="size-4" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{d.title}</p>
                    <p className="text-xs text-muted">
                      {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                      {PASSPORT_DOC_KINDS.find((k) => k.value === d.kind)?.label ?? d.kind}
                      {d.issuer && ` · ${d.issuer}`}
                      {d.issuedAt && ` · ${formatDate(d.issuedAt, LOCALE_TAG[locale])}`}
                    </p>
                    {d.reviewNote && <p className="mt-1 text-xs text-blood-500">{d.reviewNote}</p>}
                  </div>

                  <Badge tone={d.status === "APPROVED" ? "green" : d.status === "REJECTED" ? "red" : "amber"}>
                    {d.status === "APPROVED"
                      ? copy.status.approved
                      : d.status === "REJECTED"
                        ? copy.status.rejected
                        : copy.status.pending}
                  </Badge>

                  <form action={deletePassportDoc.bind(null, d.id)}>
                    <button
                      type="submit"
                      aria-label={copy.deleteDoc}
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

      <Section title={copy.addTitle}>
        <Card>
          <CardBody>
            <PassportDocForm />
          </CardBody>
        </Card>
      </Section>

      <Alert tone="neutral" title={copy.why.title}>
        <span className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {copy.why.body}
        </span>
      </Alert>
    </div>
  );
}
