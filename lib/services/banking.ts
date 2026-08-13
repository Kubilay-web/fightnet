import "server-only";
import { createHash } from "node:crypto";

/**
 * §4.6 — Salon sözleşme yönetiminin bankacılık tarafı.
 *
 * Tahsilat Stripe SEPA Direct Debit üzerinden yapılır (BaFin lisansı
 * gerektirmez). Buradaki kod bunun etrafındaki, sağlayıcıdan bağımsız ve
 * yasal olarak zorunlu parçaları içerir:
 *   - IBAN doğrulama (mod-97) ve maskeleme — ham IBAN asla loglanmaz
 *   - SEPA mandate referansı (Creditor Identifier + benzersiz mandat no)
 *   - pain.008.001.02 toplu tahsilat dosyası (kendi bankasını kullanan salonlar)
 *   - GoBD uyumlu boşluksuz fatura numaralandırma ve KDV hesabı
 */

// ---------------------------------------------------------------------------
// IBAN
// ---------------------------------------------------------------------------

const IBAN_LENGTHS: Record<string, number> = {
  DE: 22, AT: 20, CH: 21, LI: 21, NL: 18, FR: 27, IT: 27, ES: 24, BE: 16, LU: 20,
};

export function normalizeIban(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}

/** ISO 13616 mod-97 kontrolü. */
export function isValidIban(input: string): boolean {
  const iban = normalizeIban(input);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) return false;

  const expected = IBAN_LENGTHS[iban.slice(0, 2)];
  if (expected && iban.length !== expected) return false;
  if (iban.length < 15 || iban.length > 34) return false;

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));

  // Büyük sayıyı parça parça mod 97
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

/** Görüntüleme ve loglama için: DE89 **** **** **** **00 */
export function maskIban(input: string): string {
  const iban = normalizeIban(input);
  if (iban.length < 8) return "****";
  return `${iban.slice(0, 4)} ${"*".repeat(iban.length - 8).replace(/(.{4})/g, "$1 ").trim()} ${iban.slice(-4)}`;
}

/** DB'de arama/tekillik için — ham IBAN saklanmadan eşleştirme yapar. */
export function ibanFingerprint(input: string): string {
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? ""}:${normalizeIban(input)}`)
    .digest("hex")
    .slice(0, 32);
}

// ---------------------------------------------------------------------------
// SEPA Mandate
// ---------------------------------------------------------------------------

/** Alacaklı kimliği (Gläubiger-ID) — Bundesbank'tan alınır. */
export const CREDITOR_ID = process.env.SEPA_CREDITOR_ID ?? "";
export const CREDITOR_NAME = process.env.SEPA_CREDITOR_NAME ?? "FIGHTNET";
export const sepaConfigured = Boolean(CREDITOR_ID);

export type MandateSequence = "FRST" | "RCUR" | "OOFF" | "FNAL";

/** İnsan tarafından okunabilir, benzersiz mandat referansı (max 35 hane). */
export function mandateReference(gymId: string, createdAt = new Date()): string {
  const stamp = createdAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `FN-${stamp}-${gymId.slice(-10).toUpperCase()}`;
}

/** SEPA Core: ilk tahsilat 5 iş günü, tekrar edenler 2 iş günü önce bildirilir. */
export function collectionDate(sequence: MandateSequence, from = new Date()): Date {
  const businessDays = sequence === "FRST" || sequence === "OOFF" ? 5 : 2;
  const date = new Date(from);
  let added = 0;
  while (added < businessDays) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date;
}

// ---------------------------------------------------------------------------
// pain.008.001.02 — toplu SEPA tahsilat dosyası
// ---------------------------------------------------------------------------

export interface DirectDebitEntry {
  endToEndId: string;
  amount: number;
  debtorName: string;
  debtorIban: string;
  mandateId: string;
  mandateSignedAt: Date;
  remittanceInfo: string;
  sequence: MandateSequence;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function amount(value: number): string {
  return value.toFixed(2);
}

/**
 * Kendi banka hesabından tahsilat yapan salonlar için ISO 20022 dosyası üretir.
 * Stripe akışını kullanan salonlar bu dosyaya ihtiyaç duymaz.
 */
export function buildPain008(input: {
  messageId: string;
  creditorIban: string;
  creditorBic?: string;
  entries: DirectDebitEntry[];
  requestedCollectionDate: Date;
  sequence: MandateSequence;
}): string {
  const now = new Date().toISOString().slice(0, 19);
  const total = input.entries.reduce((sum, e) => sum + e.amount, 0);
  const collection = input.requestedCollectionDate.toISOString().slice(0, 10);

  const transactions = input.entries
    .map(
      (e) => `      <DrctDbtTxInf>
        <PmtId><EndToEndId>${xmlEscape(e.endToEndId)}</EndToEndId></PmtId>
        <InstdAmt Ccy="EUR">${amount(e.amount)}</InstdAmt>
        <DrctDbtTx>
          <MndtRltdInf>
            <MndtId>${xmlEscape(e.mandateId)}</MndtId>
            <DtOfSgntr>${e.mandateSignedAt.toISOString().slice(0, 10)}</DtOfSgntr>
          </MndtRltdInf>
        </DrctDbtTx>
        <Dbtr><Nm>${xmlEscape(e.debtorName.slice(0, 70))}</Nm></Dbtr>
        <DbtrAcct><Id><IBAN>${normalizeIban(e.debtorIban)}</IBAN></Id></DbtrAcct>
        <RmtInf><Ustrd>${xmlEscape(e.remittanceInfo.slice(0, 140))}</Ustrd></RmtInf>
      </DrctDbtTxInf>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>${xmlEscape(input.messageId)}</MsgId>
      <CreDtTm>${now}</CreDtTm>
      <NbOfTxs>${input.entries.length}</NbOfTxs>
      <CtrlSum>${amount(total)}</CtrlSum>
      <InitgPty><Nm>${xmlEscape(CREDITOR_NAME)}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${xmlEscape(input.messageId)}-1</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <NbOfTxs>${input.entries.length}</NbOfTxs>
      <CtrlSum>${amount(total)}</CtrlSum>
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
        <LclInstrm><Cd>CORE</Cd></LclInstrm>
        <SeqTp>${input.sequence}</SeqTp>
      </PmtTpInf>
      <ReqdColltnDt>${collection}</ReqdColltnDt>
      <Cdtr><Nm>${xmlEscape(CREDITOR_NAME)}</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>${normalizeIban(input.creditorIban)}</IBAN></Id></CdtrAcct>
      ${input.creditorBic ? `<CdtrAgt><FinInstnId><BIC>${xmlEscape(input.creditorBic)}</BIC></FinInstnId></CdtrAgt>` : ""}
      <CdtrSchmeId><Id><PrvtId><Othr>
        <Id>${xmlEscape(CREDITOR_ID)}</Id>
        <SchmeNm><Prtry>SEPA</Prtry></SchmeNm>
      </Othr></PrvtId></Id></CdtrSchmeId>
${transactions}
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>`;
}

// ---------------------------------------------------------------------------
// Fatura — GoBD
// ---------------------------------------------------------------------------

/** §4.6 — DACH KDV oranları. */
export const VAT_RATES: Record<string, number> = { DE: 0.19, AT: 0.20, CH: 0.081 };

export function vatRateFor(country: string): number {
  return VAT_RATES[country.toUpperCase()] ?? VAT_RATES.DE;
}

export interface InvoiceTotals {
  net: number;
  vatRate: number;
  vat: number;
  gross: number;
}

/** Brüt tutardan net ve KDV ayrıştırır (fiyatlar KDV dahil gösterilir). */
export function invoiceTotalsFromGross(gross: number, country: string): InvoiceTotals {
  const vatRate = vatRateFor(country);
  const net = Math.round((gross / (1 + vatRate)) * 100) / 100;
  return {
    net,
    vatRate,
    vat: Math.round((gross - net) * 100) / 100,
    gross: Math.round(gross * 100) / 100,
  };
}

/**
 * GoBD: fatura numaraları boşluksuz ve tekrarsız olmalıdır.
 * Sayaç yıl bazında tutulur; çağıran taraf sayacı atomik artırmakla yükümlüdür.
 */
export function invoiceNumber(year: number, sequence: number): string {
  return `FN-${year}-${String(sequence).padStart(5, "0")}`;
}

/** GoBD saklama süresi: 10 yıl. */
export const INVOICE_RETENTION_YEARS = 10;
