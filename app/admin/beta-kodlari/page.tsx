import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireAdmin } from "@/lib/auth";
import { toggleBetaCode } from "@/app/admin/actions";
import { Badge, Card, CardBody, Section, EmptyState, Button, Alert } from "@/components/ui";
import { BetaCodeForm } from "@/components/beta-code-form";
import { formatDate } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Beta Kodları", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminBetaCodesPage() {
  await requireAdmin();

  const codes = await safe(
    () => prisma.betaCode.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    [],
  );

  return (
    <div className="flex flex-col gap-8">
      <Section title="Beta Erişim Kodları" subtitle="Davetli erken erişim — Kurucu Üye ayrıcalıkları (§6)">
        <Alert tone="blue">
          Kurucu işaretli kodlar, kullanıcıya ömür boyu <b>50 €/ay</b> ayrıcalıklı fiyat ve
          profilinde Kurucu rozeti verir.
        </Alert>
      </Section>

      <Section title="Yeni Kod">
        <Card>
          <CardBody>
            <BetaCodeForm />
          </CardBody>
        </Card>
      </Section>

      <Section title="Kodlar">
        {codes.length === 0 ? (
          <EmptyState icon={<KeyRound className="size-10" />} title="Kod yok" />
        ) : (
          <Card>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase tracking-wider text-muted">
                    <th className="p-3">Kod</th>
                    <th className="p-3">Etiket</th>
                    <th className="p-3">Kullanım</th>
                    <th className="p-3">Ayrıcalık</th>
                    <th className="p-3">Geçerlilik</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className="border-b border-[var(--border)]">
                      <td className="p-3 font-mono font-bold">{c.code}</td>
                      <td className="p-3 text-xs text-muted">{c.label ?? "—"}</td>
                      <td className="p-3 tabular-nums">
                        {c.useCount} / {c.maxUses}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {c.isFounder && <Badge tone="gold">Kurucu</Badge>}
                          {c.grantsRole && <Badge>{ROLE_LABEL[c.grantsRole]}</Badge>}
                          {!c.isFounder && !c.grantsRole && <span className="text-xs text-muted">—</span>}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted">
                        {c.expiresAt ? formatDate(c.expiresAt) : "Süresiz"}
                      </td>
                      <td className="p-3">
                        <Badge tone={c.isActive && c.useCount < c.maxUses ? "green" : "neutral"}>
                          {!c.isActive ? "Kapalı" : c.useCount >= c.maxUses ? "Tükendi" : "Aktif"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <form action={toggleBetaCode.bind(null, c.id, !c.isActive)}>
                          <Button type="submit" size="sm" variant="outline">
                            {c.isActive ? "Kapat" : "Aç"}
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </Section>
    </div>
  );
}
