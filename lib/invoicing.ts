import "server-only";
import type { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { invoiceNumber, invoiceTotalsFromGross } from "./services/banking";

/**
 * §4.6 — GoBD uyumlu faturalama.
 *
 * İki kural belirleyicidir:
 *   1. Numaralar boşluksuz ve tekrarsız olmalı → sayaç atomik artırılır
 *      (`findAndModify`, Prisma upsert'i eşzamanlı çağrılarda garanti vermez).
 *   2. Kesilen fatura değiştirilemez → düzeltme iptal değil, ters kayıttır (Storno).
 */

export interface InvoiceLine {
  description: string;
  quantity: number;
  /** Brüt birim fiyat (KDV dahil) */
  unitGross: number;
}

/** Yıl bazında bir sonraki sıra numarasını atomik olarak alır. */
export async function nextInvoiceNumber(year = new Date().getFullYear()): Promise<string> {
  const result = (await prisma.$runCommandRaw({
    findAndModify: "invoice_counters",
    query: { year },
    update: { $inc: { sequence: 1 }, $set: { updatedAt: new Date() } },
    upsert: true,
    new: true,
  })) as { value?: { sequence?: number } };

  const sequence = result.value?.sequence;
  if (typeof sequence !== "number") {
    throw new Error("Fatura sayacı okunamadı — GoBD boşluksuzluğu riske girmemesi için işlem durduruldu");
  }
  return invoiceNumber(year, sequence);
}

export interface IssueInvoiceInput {
  lines: InvoiceLine[];
  country: string;
  userId?: string | null;
  gymId?: string | null;
  contractId?: string | null;
  paymentId?: string | null;
  /** Ödeme zaten alındıysa fatura PAID olarak kesilir */
  paid?: boolean;
  dueInDays?: number;
}

export async function issueInvoice(input: IssueInvoiceInput) {
  const gross = input.lines.reduce((sum, l) => sum + l.unitGross * l.quantity, 0);
  const totals = invoiceTotalsFromGross(gross, input.country);
  const invoiceNo = await nextInvoiceNumber();

  const now = new Date();
  const dueAt = new Date(now);
  dueAt.setDate(dueAt.getDate() + (input.dueInDays ?? 14));

  return prisma.invoice.create({
    data: {
      invoiceNo,
      status: input.paid ? "PAID" : "ISSUED",
      userId: input.userId ?? null,
      gymId: input.gymId ?? null,
      contractId: input.contractId ?? null,
      paymentId: input.paymentId ?? null,
      lines: input.lines.map((l) => ({
        description: l.description,
        quantity: l.quantity,
        unitGross: l.unitGross,
        unitNet: Math.round((l.unitGross / (1 + totals.vatRate)) * 100) / 100,
        vatRate: totals.vatRate,
      })) as unknown as Prisma.InputJsonValue,
      net: totals.net,
      vatRate: totals.vatRate,
      vat: totals.vat,
      gross: totals.gross,
      country: input.country.toUpperCase(),
      issuedAt: now,
      dueAt,
      paidAt: input.paid ? now : null,
    },
  });
}

/**
 * Storno — kesilmiş fatura silinmez, negatif tutarlı ters kayıt oluşturulur.
 * Orijinal fatura CANCELLED işaretlenir ama içeriği korunur (10 yıl saklama).
 */
export async function reverseInvoice(invoiceId: string, reason: string) {
  const original = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!original) throw new Error("Fatura bulunamadı");
  if (original.cancelledAt) throw new Error("Bu fatura zaten ters kayıtla kapatılmış");

  const invoiceNo = await nextInvoiceNumber();
  const now = new Date();

  const [reversal] = await prisma.$transaction([
    prisma.invoice.create({
      data: {
        invoiceNo,
        status: "ISSUED",
        userId: original.userId,
        gymId: original.gymId,
        contractId: original.contractId,
        lines: [
          {
            description: `Storno ${original.invoiceNo} — ${reason}`,
            quantity: 1,
            unitGross: -original.gross,
            unitNet: -original.net,
            vatRate: original.vatRate,
          },
        ] as unknown as Prisma.InputJsonValue,
        net: -original.net,
        vatRate: original.vatRate,
        vat: -original.vat,
        gross: -original.gross,
        country: original.country,
        issuedAt: now,
        reversalOfId: original.id,
      },
    }),
    prisma.invoice.update({
      where: { id: original.id },
      data: { status: "CANCELLED", cancelledAt: now },
    }),
  ]);

  return reversal;
}
