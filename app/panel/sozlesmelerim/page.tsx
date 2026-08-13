import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { FileSignature, Landmark, ReceiptEuro, ShieldCheck, ShieldAlert } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { verifySeal, type SignatureSeal } from "@/lib/services/esign";
import { Badge, Card, CardBody, Section, EmptyState, Alert, Divider } from "@/components/ui";
import { ContractSignForm, ContractTerminateForm } from "@/components/contract-forms";
import { formatMoney, formatDate, formatDateTime } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { panelContractsCopy } from "@/lib/i18n/pages/panel-contracts";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelContractsCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}
export const dynamic = "force-dynamic";

/** Durum renkleri dile bağlı değil; etiketler copy modülünden gelir. */
const CONTRACT_TONE: Record<string, "neutral" | "amber" | "green" | "red" | "blue"> = {
  DRAFT: "amber",
  SENT: "amber",
  SIGNED: "blue",
  ACTIVE: "green",
  TERMINATED: "red",
  CANCELLED: "neutral",
};

const INVOICE_TONE: Record<string, "neutral" | "amber" | "green" | "red"> = {
  DRAFT: "neutral",
  ISSUED: "amber",
  PAID: "green",
  OVERDUE: "red",
  CANCELLED: "neutral",
  REFUNDED: "neutral",
};

/** Prisma Json alanı tip güvencesi vermez — mühür yapısını burada doğruluyoruz. */
function asSeal(value: unknown): SignatureSeal | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Partial<SignatureSeal>;
  if (typeof s.documentHash !== "string" || typeof s.seal !== "string" || typeof s.signedAt !== "string") return null;
  return s as SignatureSeal;
}

export default async function MyContractsPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = panelContractsCopy[locale];
  const tag = LOCALE_TAG[locale];

  const contracts = await safe(
    () =>
      prisma.gymContract.findMany({
        where: { memberId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true, contractNo: true, status: true, planName: true, monthlyFee: true,
          termMonths: true, noticeDays: true, startsAt: true, endsAt: true,
          signedAt: true, signature: true, documentText: true, terminationReason: true,
          gym: { select: { name: true, slug: true, city: true } },
          mandate: { select: { mandateRef: true, status: true, ibanMasked: true, sequence: true } },
          invoices: {
            orderBy: { createdAt: "desc" },
            select: { id: true, invoiceNo: true, status: true, gross: true, net: true, vat: true, issuedAt: true, dueAt: true },
          },
        },
      }),
    [],
  );

  const awaiting = contracts.filter((c) => c.status === "DRAFT" || c.status === "SENT");

  return (
    <div className="flex flex-col gap-8">
      <Section
        title={copy.title}
        subtitle={copy.subtitle}
      />

      {awaiting.length > 0 && (
        <Alert tone="amber" title={copy.awaitingTitle.replace("{count}", String(awaiting.length))}>
          {copy.awaitingBody}
        </Alert>
      )}

      {contracts.length === 0 ? (
        <EmptyState
          icon={<FileSignature className="size-10" />}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {contracts.map((c) => {
            const statusLabel = copy.contractStatus[c.status] ?? copy.contractStatus.DRAFT;
            const statusTone = CONTRACT_TONE[c.status] ?? CONTRACT_TONE.DRAFT;
            const seal = asSeal(c.signature);
            // Mühür belgenin özetine bağlıdır: metin sonradan oynandıysa burada anlaşılır.
            const sealValid = seal ? verifySeal(seal, c.documentText) : false;
            const signable = c.status === "DRAFT" || c.status === "SENT";

            return (
              <Card key={c.id}>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-bold">{c.gym.name}</h3>
                    <Badge tone={statusTone}>{statusLabel}</Badge>
                    <span className="text-xs text-muted">{c.contractNo}</span>
                  </div>

                  <p className="text-sm text-muted">
                    {c.planName} · {copy.perMonth.replace("{fee}", formatMoney(c.monthlyFee, "EUR", tag))} ·{" "}
                    {copy.minTerm.replace("{n}", String(c.termMonths))} ·{" "}
                    {copy.noticePeriod.replace("{n}", String(c.noticeDays))} ·{" "}
                    {copy.startsAt.replace("{date}", formatDate(c.startsAt, tag))}
                    {c.endsAt && ` · ${copy.endsAt.replace("{date}", formatDate(c.endsAt, tag))}`}
                  </p>
                  {c.terminationReason && (
                    <p className="text-xs text-muted">{copy.terminationReason}{c.terminationReason}</p>
                  )}

                  <details className="rounded-xl border border-[var(--border)]">
                    <summary className="cursor-pointer px-3 py-2 text-sm font-bold">
                      {copy.readDocument}
                    </summary>
                    <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap px-3 pb-3 text-[13px] leading-relaxed">
                      {c.documentText}
                    </pre>
                  </details>

                  {seal && (
                    <div className="flex flex-col gap-1 rounded-xl bg-[var(--bg-subtle)] p-3 text-xs">
                      <p className="flex items-center gap-1.5 font-bold">
                        {sealValid ? (
                          <>
                            <ShieldCheck className="size-4 text-emerald-500" /> {copy.sealValid}
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="size-4 text-blood-500" /> {copy.sealInvalid}
                          </>
                        )}
                        <Badge tone={sealValid ? "green" : "red"}>{seal.level}</Badge>
                      </p>
                      <p className="text-muted">{copy.signedAt}{formatDateTime(seal.signedAt, tag)}</p>
                      <p className="text-muted">{copy.provider}{seal.provider}</p>
                      <p className="break-all text-muted">SHA-256: {seal.documentHash}</p>
                    </div>
                  )}

                  {c.mandate && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-[var(--bg-subtle)] p-3 text-xs">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Landmark className="size-3.5" /> {c.mandate.ibanMasked}
                      </span>
                      <span className="text-muted">{copy.mandate}{c.mandate.mandateRef}</span>
                      <span className="text-muted">{copy.sequence}{c.mandate.sequence}</span>
                      <span className="text-muted">
                        {c.mandate.status === "ACTIVE" ? copy.mandateActive : copy.mandateInactive}
                      </span>
                    </div>
                  )}

                  {c.invoices.length > 0 && (
                    <ul className="flex flex-col gap-1 text-xs">
                      {c.invoices.map((inv) => {
                        const invLabel = copy.invoiceStatus[inv.status] ?? copy.invoiceStatus.DRAFT;
                        const invTone = INVOICE_TONE[inv.status] ?? INVOICE_TONE.DRAFT;
                        return (
                          <li key={inv.id} className="flex flex-wrap items-center gap-2">
                            <ReceiptEuro className="size-3.5 text-muted" />
                            <span className="font-semibold tabular-nums">{inv.invoiceNo}</span>
                            <Badge tone={invTone}>{invLabel}</Badge>
                            <span className="tabular-nums">{formatMoney(inv.gross, "EUR", tag)}</span>
                            <span className="text-muted">
                              {copy.invoiceNet
                                .replace("{net}", formatMoney(inv.net, "EUR", tag))
                                .replace("{vat}", formatMoney(inv.vat, "EUR", tag))}
                            </span>
                            {inv.dueAt && (
                              <span className="text-muted">
                                {copy.invoiceDue.replace("{date}", formatDate(inv.dueAt, tag))}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {signable && (
                    <>
                      <Divider />
                      <ContractSignForm contractId={c.id} defaultName={user.name} />
                    </>
                  )}

                  {c.status === "ACTIVE" && (
                    <>
                      <Divider />
                      <details>
                        <summary className="cursor-pointer text-sm font-bold">{copy.terminateSummary}</summary>
                        <div className="pt-3">
                          <p className="mb-3 text-xs text-muted">
                            {copy.terminateBody}
                          </p>
                          <ContractTerminateForm contractId={c.id} submitLabel={copy.terminateSubmit} />
                        </div>
                      </details>
                    </>
                  )}

                  <p className="text-xs text-muted">
                    {copy.gymPage}
                    <Link href={`/salonlar/${c.gym.slug}`} className="font-semibold hover:underline">
                      {c.gym.name}
                    </Link>{" "}
                    · {c.gym.city}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
