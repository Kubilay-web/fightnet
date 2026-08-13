"use client";

import { Download, FileSignature } from "lucide-react";
import {
  createContract,
  signContract,
  terminateContract,
  issueContractInvoice,
  exportDirectDebitBatch,
} from "@/app/salon-yonetimi/[id]/sozlesmeler/actions";
import { FormShell } from "@/components/form-shell";
import { Field, Input, Select, Textarea, Checkbox, Alert } from "@/components/ui";
import { MAX_CONTRACT_TERM_MONTHS } from "@/lib/constants";
import { useLocale } from "@/components/i18n/provider";
import { panelContractsCopy } from "@/lib/i18n/pages/panel-contracts";

/** Bugünün tarihi (YYYY-MM-DD) — date input'unun alt sınırı ve varsayılanı. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function thisMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// ---------------------------------------------------------------------------
// Salon tarafı
// ---------------------------------------------------------------------------

export function ContractCreateForm({ gymId }: { gymId: string }) {
  const t = panelContractsCopy[useLocale()].createForm;

  return (
    <FormShell action={createContract.bind(null, gymId)} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field
            label={t.memberEmail}
            error={state.fields?.memberEmail}
            hint={t.memberEmailHint}
            required
          >
            <Input name="memberEmail" type="email" required placeholder={t.memberEmailPlaceholder} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.planName} error={state.fields?.planName} required>
              <Input name="planName" required maxLength={80} placeholder={t.planNamePlaceholder} />
            </Field>
            <Field label={t.monthlyFee} error={state.fields?.monthlyFee} required>
              <Input type="number" name="monthlyFee" step="0.5" min={1} max={1000} required defaultValue={49.9} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label={t.termMonths}
              error={state.fields?.termMonths}
              hint={t.termMonthsHint.replace("{n}", String(MAX_CONTRACT_TERM_MONTHS))}
              required
            >
              <Input
                type="number"
                name="termMonths"
                min={1}
                max={MAX_CONTRACT_TERM_MONTHS}
                required
                defaultValue={12}
              />
            </Field>
            <Field label={t.noticeDays} error={state.fields?.noticeDays} hint={t.noticeDaysHint}>
              <Input type="number" name="noticeDays" min={0} max={90} defaultValue={30} />
            </Field>
            <Field label={t.startsAt} error={state.fields?.startsAt} required>
              <Input type="date" name="startsAt" required min={today()} defaultValue={today()} />
            </Field>
          </div>

          <Alert tone="blue" title={t.alertTitle}>
            {t.alertBody}
          </Alert>
        </>
      )}
    </FormShell>
  );
}

export function ContractInvoiceForm({ contractId }: { contractId: string }) {
  const t = panelContractsCopy[useLocale()].invoiceForm;

  return (
    <FormShell
      action={issueContractInvoice.bind(null, contractId)}
      submitLabel={t.submit}
      className="flex flex-wrap items-end gap-3"
    >
      {(state) => (
        <Field label={t.period} error={state.fields?.period} className="w-40">
          <Input type="month" name="period" defaultValue={thisMonth()} />
        </Field>
      )}
    </FormShell>
  );
}

export function DirectDebitExportForm({ gymId }: { gymId: string }) {
  const t = panelContractsCopy[useLocale()].sepaForm;

  return (
    <FormShell action={exportDirectDebitBatch.bind(null, gymId)} submitLabel={t.submit}>
      {(state) => (
        <>
          <Field label={t.sequence} hint={t.sequenceHint}>
            <Select name="sequence" defaultValue="FRST" className="w-56">
              <option value="FRST">{t.frst}</option>
              <option value="RCUR">{t.rcur}</option>
            </Select>
          </Field>

          {state.fields?.xml && (
            <div className="flex flex-col gap-2">
              <a
                href={`data:application/xml;charset=utf-8,${encodeURIComponent(state.fields.xml)}`}
                download={`${state.fields.messageId ?? "sepa"}.xml`}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-blood-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-blood-700"
              >
                <Download className="size-4" /> {t.download}
              </a>
              <pre className="max-h-80 overflow-auto rounded-xl bg-[var(--bg-subtle)] p-3 text-[11px] leading-relaxed">
                {state.fields.xml}
              </pre>
              <p className="text-xs text-muted">
                {t.note}
              </p>
            </div>
          )}
        </>
      )}
    </FormShell>
  );
}

// ---------------------------------------------------------------------------
// Üye tarafı
// ---------------------------------------------------------------------------

export function ContractSignForm({
  contractId,
  defaultName,
}: {
  contractId: string;
  defaultName?: string;
}) {
  const t = panelContractsCopy[useLocale()].signForm;

  return (
    <FormShell action={signContract} submitLabel={t.submit}>
      {(state) => (
        <>
          <input type="hidden" name="contractId" value={contractId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.debtorName} error={state.fields?.debtorName} required>
              <Input name="debtorName" required maxLength={70} defaultValue={defaultName} />
            </Field>
            <Field label={t.bic} error={state.fields?.bic} hint={t.bicHint}>
              <Input name="bic" maxLength={11} placeholder={t.bicPlaceholder} className="uppercase" />
            </Field>
          </div>

          <Field
            label={t.iban}
            error={state.fields?.iban}
            hint={t.ibanHint}
            required
          >
            <Input name="iban" required minLength={15} maxLength={42} placeholder={t.ibanPlaceholder} />
          </Field>

          <div className="rounded-xl border border-[var(--border)] p-4">
            <Checkbox
              name="consent"
              required
              label={
                <>
                  {t.consent}
                </>
              }
            />
            {state.fields?.consent && (
              <p className="mt-2 text-xs font-medium text-blood-500">{state.fields.consent}</p>
            )}
          </div>

          <p className="flex items-start gap-2 text-xs text-muted">
            <FileSignature className="mt-0.5 size-4 shrink-0" />
            {t.sealNote}
          </p>
        </>
      )}
    </FormShell>
  );
}

export function ContractTerminateForm({
  contractId,
  submitLabel,
}: {
  contractId: string;
  submitLabel?: string;
}) {
  const t = panelContractsCopy[useLocale()].terminateForm;

  return (
    <FormShell action={terminateContract.bind(null, contractId)} submitLabel={submitLabel ?? t.submit}>
      {(state) => (
        <Field
          label={t.reason}
          error={state.fields?.reason}
          hint={t.reasonHint}
        >
          <Textarea name="reason" rows={2} maxLength={500} placeholder={t.reasonPlaceholder} />
        </Field>
      )}
    </FormShell>
  );
}
