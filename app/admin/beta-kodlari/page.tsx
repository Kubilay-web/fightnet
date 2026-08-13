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
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { adminBetaCodesCopy } from "@/lib/i18n/pages/admin-ops";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminBetaCodesCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function AdminBetaCodesPage() {
  await requireAdmin();
  const locale = await getLocale();
  const t = adminBetaCodesCopy[locale];

  const codes = await safe(
    () => prisma.betaCode.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    [],
  );

  return (
    <div className="flex flex-col gap-8">
      <Section title={t.title} subtitle={t.subtitle}>
        <Alert tone="blue">
          {t.alert.before}<b>{t.alert.price}</b>{t.alert.after}
        </Alert>
      </Section>

      <Section title={t.newCode}>
        <Card>
          <CardBody>
            <BetaCodeForm />
          </CardBody>
        </Card>
      </Section>

      <Section title={t.codes}>
        {codes.length === 0 ? (
          <EmptyState icon={<KeyRound className="size-10" />} title={t.empty} />
        ) : (
          <Card>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs font-black uppercase tracking-wider text-muted">
                    <th className="p-3">{t.columns.code}</th>
                    <th className="p-3">{t.columns.label}</th>
                    <th className="p-3">{t.columns.usage}</th>
                    <th className="p-3">{t.columns.perk}</th>
                    <th className="p-3">{t.columns.validity}</th>
                    <th className="p-3">{t.columns.status}</th>
                    <th className="p-3">{t.columns.action}</th>
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
                          {c.isFounder && <Badge tone="gold">{t.founder}</Badge>}
                          {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                          {c.grantsRole && <Badge>{ROLE_LABEL[c.grantsRole]}</Badge>}
                          {!c.isFounder && !c.grantsRole && <span className="text-xs text-muted">—</span>}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted">
                        {c.expiresAt ? formatDate(c.expiresAt, LOCALE_TAG[locale]) : t.unlimited}
                      </td>
                      <td className="p-3">
                        <Badge tone={c.isActive && c.useCount < c.maxUses ? "green" : "neutral"}>
                          {!c.isActive ? t.disabled : c.useCount >= c.maxUses ? t.exhausted : t.active}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <form action={toggleBetaCode.bind(null, c.id, !c.isActive)}>
                          <Button type="submit" size="sm" variant="outline">
                            {c.isActive ? t.close : t.open}
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
