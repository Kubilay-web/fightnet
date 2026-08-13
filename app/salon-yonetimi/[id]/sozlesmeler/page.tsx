import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/components/i18n/link";
import { FileSignature, Landmark, ReceiptEuro, ShieldCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, EmptyState, Alert, Stat, Divider } from "@/components/ui";
import { ContractCreateForm, ContractInvoiceForm, ContractTerminateForm, DirectDebitExportForm } from "@/components/contract-forms";
import { formatMoney, formatDate } from "@/lib/utils";
import { MAX_CONTRACT_TERM_MONTHS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { gymAdminCopy } from "@/lib/i18n/pages/gym-admin";

export async function generateMetadata(): Promise<Metadata> {
  const copy = gymAdminCopy[await getLocale()].contracts;
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

/** Rozet tonları dilden bağımsızdır; etiketler copy modülünden gelir. */
const CONTRACT_TONE: Record<string, "neutral" | "amber" | "green" | "red" | "blue"> = {
  DRAFT: "amber",
  SENT: "amber",
  SIGNED: "blue",
  ACTIVE: "green",
  TERMINATED: "red",
  CANCELLED: "neutral",
};

const MANDATE_TONE: Record<string, "neutral" | "amber" | "green" | "red"> = {
  PENDING: "amber",
  ACTIVE: "green",
  REVOKED: "neutral",
  FAILED: "red",
};

const INVOICE_TONE: Record<string, "neutral" | "amber" | "green" | "red"> = {
  DRAFT: "neutral",
  ISSUED: "amber",
  PAID: "green",
  OVERDUE: "red",
  CANCELLED: "neutral",
  REFUNDED: "neutral",
};

export default async function GymContractsPage({ params }: { params: Params }) {
  const [{ id }, user, locale] = await Promise.all([params, requireUser(), getLocale()]);
  const t = gymAdminCopy[locale].contracts;
  const tag = LOCALE_TAG[locale];

  const gym = await safe(
    () =>
      prisma.gym.findUnique({
        where: { id },
        select: {
          id: true, name: true, city: true, country: true, ownerId: true,
          contractsEnabled: true, billingIban: true,
          contracts: {
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
              id: true, contractNo: true, status: true, planName: true, monthlyFee: true,
              termMonths: true, noticeDays: true, startsAt: true, endsAt: true, signedAt: true,
              member: { select: { name: true, email: true, slug: true } },
              mandate: { select: { mandateRef: true, status: true, ibanMasked: true, sequence: true, signedAt: true } },
              invoices: {
                orderBy: { createdAt: "desc" },
                take: 6,
                select: { id: true, invoiceNo: true, status: true, gross: true, issuedAt: true, dueAt: true },
              },
            },
          },
        },
      }),
    null,
  );

  if (!gym) notFound();
  if (gym.ownerId !== user.id && user.role !== "ADMIN") notFound();

  const active = gym.contracts.filter((c) => c.status === "ACTIVE");
  const pending = gym.contracts.filter((c) => c.status === "DRAFT" || c.status === "SENT");
  const monthlyRevenue = active.reduce((sum, c) => sum + c.monthlyFee, 0);

  return (
    <div className="flex flex-col gap-8">
      <Section title={t.title} subtitle={t.subtitle(gym.name)} />

      {!gym.contractsEnabled ? (
        <Alert tone="amber" title={t.pilotAlert.title}>
          {t.pilotAlert.body}
        </Alert>
      ) : (
        <Alert tone="blue" title={t.automationAlert.title}>
          {t.automationAlert.body(MAX_CONTRACT_TERM_MONTHS)}
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t.stats.active} value={active.length} tone="green" />
        <Stat label={t.stats.pending} value={pending.length} tone={pending.length ? "amber" : "neutral"} />
        <Stat
          label={t.stats.monthly}
          value={formatMoney(monthlyRevenue, "EUR", tag)}
          hint={t.stats.monthlyHint}
        />
        <Stat label={t.stats.total} value={gym.contracts.length} />
      </div>

      {gym.contractsEnabled && (
        <Section title={t.newContract.title} subtitle={t.newContract.subtitle}>
          <Card>
            <CardBody>
              <ContractCreateForm gymId={gym.id} />
            </CardBody>
          </Card>
        </Section>
      )}

      <Section title={t.list.title} subtitle={t.list.subtitle(gym.contracts.length)}>
        {gym.contracts.length === 0 ? (
          <EmptyState
            icon={<FileSignature className="size-10" />}
            title={t.list.emptyTitle}
            description={t.list.emptyDescription}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {gym.contracts.map((c) => {
              const statusLabel = t.contractStatus[c.status] ?? t.contractStatus.DRAFT;
              const statusTone = CONTRACT_TONE[c.status] ?? "amber";
              const mandateLabel = c.mandate ? t.mandateStatus[c.mandate.status] ?? t.mandateStatus.PENDING : null;
              const mandateTone = c.mandate ? MANDATE_TONE[c.mandate.status] ?? "amber" : "amber";
              const billable = c.status === "ACTIVE" || c.status === "TERMINATED";

              return (
                <Card key={c.id}>
                  <CardBody className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="font-bold">{c.contractNo}</h3>
                          <Badge tone={statusTone}>{statusLabel}</Badge>
                          {mandateLabel && <Badge tone={mandateTone}>{mandateLabel}</Badge>}
                        </div>
                        <p className="mt-0.5 text-sm">
                          <Link href={`/dovuscular/${c.member.slug}`} className="font-semibold hover:underline">
                            {c.member.name}
                          </Link>{" "}
                          <span className="text-muted">· {c.member.email}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {c.planName} · {formatMoney(c.monthlyFee, "EUR", tag)}
                          {t.perMonth} · {t.minTerm(c.termMonths)} · {t.noticeDays(c.noticeDays)} ·{" "}
                          {t.startsAt(formatDate(c.startsAt, tag))}
                          {c.endsAt && ` · ${t.endsAt(formatDate(c.endsAt, tag))}`}
                        </p>
                      </div>
                    </div>

                    {c.mandate && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-[var(--bg-subtle)] p-3 text-xs">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Landmark className="size-3.5" /> {c.mandate.ibanMasked}
                        </span>
                        <span className="text-muted">{t.mandateRef} {c.mandate.mandateRef}</span>
                        <span className="text-muted">{t.sequence} {c.mandate.sequence}</span>
                        {c.mandate.signedAt && (
                          <span className="text-muted">{t.signedAt} {formatDate(c.mandate.signedAt, tag)}</span>
                        )}
                      </div>
                    )}

                    {c.invoices.length > 0 && (
                      <ul className="flex flex-col gap-1 text-xs">
                        {c.invoices.map((inv) => {
                          const invoiceLabel = t.invoiceStatus[inv.status] ?? t.invoiceStatus.DRAFT;
                          const invoiceTone = INVOICE_TONE[inv.status] ?? "neutral";
                          return (
                            <li key={inv.id} className="flex flex-wrap items-center gap-2">
                              <ReceiptEuro className="size-3.5 text-muted" />
                              <span className="font-semibold tabular-nums">{inv.invoiceNo}</span>
                              <Badge tone={invoiceTone}>{invoiceLabel}</Badge>
                              <span className="tabular-nums">{formatMoney(inv.gross, "EUR", tag)}</span>
                              {inv.issuedAt && <span className="text-muted">{formatDate(inv.issuedAt, tag)}</span>}
                              {inv.dueAt && <span className="text-muted">{t.dueAt(formatDate(inv.dueAt, tag))}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {billable && (
                      <>
                        <Divider />
                        <div className="grid gap-4 lg:grid-cols-2">
                          <ContractInvoiceForm contractId={c.id} />
                          {c.status === "ACTIVE" && <ContractTerminateForm contractId={c.id} submitLabel={t.terminate} />}
                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      <Section title={t.sepa.title} subtitle={t.sepa.subtitle}>
        {!gym.billingIban ? (
          <Alert tone="neutral" title={t.sepa.noIbanTitle}>
            {t.sepa.noIbanBody}
          </Alert>
        ) : (
          <Card>
            <CardBody className="flex flex-col gap-4">
              <p className="flex items-start gap-2 text-sm text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                {t.sepa.note}
              </p>
              <DirectDebitExportForm gymId={gym.id} />
            </CardBody>
          </Card>
        )}
      </Section>
    </div>
  );
}
