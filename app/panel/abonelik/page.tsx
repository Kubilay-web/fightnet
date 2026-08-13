import type { Metadata } from "next";
import { Check, CreditCard, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { safe } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { Badge, Card, CardBody, Section, Alert, Stat, EmptyState } from "@/components/ui";
import { CheckoutButton } from "@/components/checkout-button";
import { BillingPortalButton, ConnectOnboardButton } from "@/components/billing-buttons";
import { formatMoney, formatDate } from "@/lib/utils";
import { PLATFORM_PLANS } from "@/lib/constants";
import { stripeConfigured } from "@/lib/services/stripe";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { panelBillingCopy } from "@/lib/i18n/pages/panel-billing";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelBillingCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}
export const dynamic = "force-dynamic";

type Copy = (typeof panelBillingCopy)[keyof typeof panelBillingCopy];

export default async function SubscriptionPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = panelBillingCopy[locale];
  const tag = LOCALE_TAG[locale];

  const data = await safe(
    async () => {
      const [account, subs, payments, invoices] = await Promise.all([
        prisma.user.findUnique({
          where: { id: user.id },
          select: {
            premiumUntil: true, coachToolsUntil: true,
            stripeCustomerId: true, stripeAccountId: true, connectStatus: true,
          },
        }),
        prisma.platformSubscription.findMany({
          where: { userId: user.id },
          select: { id: true, plan: true, status: true, price: true, currentPeriodEnd: true, cancelledAt: true },
        }),
        prisma.payment.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, purpose: true, status: true, amount: true, createdAt: true, paidAt: true },
        }),
        prisma.invoice.findMany({
          where: { userId: user.id },
          orderBy: { issuedAt: "desc" },
          take: 20,
          select: { id: true, invoiceNo: true, status: true, gross: true, vat: true, issuedAt: true, pdfUrl: true },
        }),
      ]);
      return { account, subs, payments, invoices };
    },
    { account: null, subs: [], payments: [], invoices: [] },
  );

  const now = new Date();
  const premiumActive = Boolean(data.account?.premiumUntil && data.account.premiumUntil > now);
  const coachToolsActive = Boolean(data.account?.coachToolsUntil && data.account.coachToolsUntil > now);
  const isCoach = user.role === "COACH" || user.role === "ADMIN";

  return (
    <div className="flex flex-col gap-8">
      <Section title={copy.title} subtitle={copy.subtitle} />

      {!stripeConfigured && (
        <Alert tone="amber" title={copy.stripeMissingTitle}>
          {copy.stripeMissingBody}
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <PlanCard
          plan="PREMIUM"
          active={premiumActive}
          until={data.account?.premiumUntil ?? null}
          available
          copy={copy}
          tag={tag}
        />
        <PlanCard
          plan="COACH_TOOLS"
          active={coachToolsActive}
          until={data.account?.coachToolsUntil ?? null}
          available={isCoach}
          lockedReason={copy.planCard.coachToolsLocked}
          copy={copy}
          tag={tag}
        />
      </div>

      {data.account?.stripeCustomerId && (
        <Section title={copy.portal.heading}>
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {copy.portal.body}
              </p>
              <BillingPortalButton />
            </CardBody>
          </Card>
        </Section>
      )}

      {/* §4.7 — Creator/antrenör/organizatör olarak para almak için Connect */}
      <Section title={copy.connect.heading} subtitle={copy.connect.subtitle}>
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-muted" />
              <span className="text-sm">
                {copy.connect.statusPrefix}
                <Badge tone={data.account?.connectStatus === "ACTIVE" ? "green" : "amber"}>
                  {data.account?.connectStatus === "ACTIVE"
                    ? copy.connect.active
                    : data.account?.connectStatus === "ONBOARDING"
                      ? copy.connect.onboarding
                      : data.account?.connectStatus === "RESTRICTED"
                        ? copy.connect.restricted
                        : copy.connect.none}
                </Badge>
              </span>
            </div>
            <ConnectOnboardButton hasAccount={Boolean(data.account?.stripeAccountId)} />
          </CardBody>
        </Card>
        <p className="text-xs text-muted">
          {copy.connect.note}
        </p>
      </Section>

      <Section title={copy.invoices.heading} subtitle={copy.invoices.subtitle}>
        {data.invoices.length === 0 ? (
          <EmptyState title={copy.invoices.emptyTitle} description={copy.invoices.emptyDescription} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.invoices.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="font-mono text-sm font-bold">{inv.invoiceNo}</span>
                  <Badge tone={inv.status === "PAID" ? "green" : inv.status === "CANCELLED" ? "red" : "neutral"}>
                    {copy.invoices.status[inv.status] ?? inv.status}
                  </Badge>
                  <span className="text-sm text-muted">{inv.issuedAt ? formatDate(inv.issuedAt, tag) : "—"}</span>
                  <span className="ml-auto text-sm font-black tabular-nums">{formatMoney(inv.gross, "EUR", tag)}</span>
                  <span className="text-xs text-muted">
                    {copy.invoices.vat.replace("{vat}", formatMoney(inv.vat, "EUR", tag))}
                  </span>
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blood-500 hover:underline"
                    >
                      <ExternalLink className="inline size-3.5" /> PDF
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>

      <Section title={copy.payments.heading}>
        {data.payments.length === 0 ? (
          <EmptyState title={copy.payments.emptyTitle} />
        ) : (
          <Card>
            <ul className="divide-y divide-[var(--border)]">
              {data.payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="text-sm font-semibold">{copy.payments.purpose[p.purpose] ?? p.purpose}</span>
                  <Badge
                    tone={
                      p.status === "PAID" ? "green" : p.status === "FAILED" ? "red" : p.status === "REFUNDED" ? "amber" : "neutral"
                    }
                  >
                    {copy.payments.status[p.status] ?? p.status}
                  </Badge>
                  <span className="text-xs text-muted">{formatDate(p.paidAt ?? p.createdAt, tag)}</span>
                  <span className="ml-auto text-sm font-black tabular-nums">{formatMoney(p.amount, "EUR", tag)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={copy.stats.activeSubscriptions} value={data.subs.filter((s) => s.status === "ACTIVE").length} />
        <Stat label={copy.stats.totalPayments} value={data.payments.filter((p) => p.status === "PAID").length} />
        <Stat
          label={copy.stats.paidThisYear}
          value={formatMoney(
            data.payments
              .filter((p) => p.status === "PAID" && p.createdAt.getFullYear() === now.getFullYear())
              .reduce((sum, p) => sum + p.amount, 0),
            "EUR",
            tag,
          )}
        />
        <Stat label={copy.stats.invoices} value={data.invoices.length} />
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  active,
  until,
  available,
  lockedReason,
  copy,
  tag,
}: {
  plan: "PREMIUM" | "COACH_TOOLS";
  active: boolean;
  until: Date | null;
  available: boolean;
  lockedReason?: string;
  copy: Copy;
  tag: string;
}) {
  // Fiyat tek kaynakta (§4.3/§4.4); ad, slogan ve özellikler dile göre gelir.
  const info = PLATFORM_PLANS[plan];
  const text = copy.plans[plan];

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-black">{text.label}</h3>
            <p className="text-sm text-muted">{text.tagline}</p>
          </div>
          {active && <Badge tone="green">{copy.planCard.active}</Badge>}
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-black">{formatMoney(info.price, "EUR", tag)}</span>
          <span className="text-sm text-muted">{copy.planCard.perMonth}</span>
        </div>

        <ul className="flex flex-col gap-1.5">
          {text.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {active && until && (
          <p className="text-xs text-muted">{copy.planCard.nextRenewal}{formatDate(until, tag)}</p>
        )}

        {!available ? (
          <Alert tone="neutral">{lockedReason}</Alert>
        ) : (
          <CheckoutButton purpose={plan} full variant={active ? "outline" : "primary"}>
            {active ? copy.planCard.extend : copy.planCard.subscribe.replace("{plan}", text.label)}
          </CheckoutButton>
        )}
      </CardBody>
    </Card>
  );
}
