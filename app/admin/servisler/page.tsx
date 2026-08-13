import type { Metadata } from "next";
import { KeyRound, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { serviceStatuses, type ServiceState } from "@/lib/services";
import { Alert, Badge, Card, CardBody, Section, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/server";
import { adminServicesCopy } from "@/lib/i18n/pages/admin-ops";
import { adminServiceRowsCopy, serviceDetailText } from "@/lib/i18n/pages/admin-services";

export async function generateMetadata(): Promise<Metadata> {
  const copy = adminServicesCopy[await getLocale()];
  return { title: copy.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

/** Durum → rozet tonu ve nokta rengi eşlemesi (etiket copy modülünden gelir) */
const STATE_STYLE: Record<ServiceState, { tone: "green" | "amber" | "red"; dot: string }> = {
  ACTIVE: { tone: "green", dot: "bg-emerald-500" },
  FALLBACK: { tone: "amber", dot: "bg-amber-500" },
  MISSING: { tone: "red", dot: "bg-blood-500" },
};

export default async function ServicesPage() {
  await requireAdmin();
  const locale = await getLocale();
  const t = adminServicesCopy[locale];
  const rows = adminServiceRowsCopy[locale];

  const services = serviceStatuses();
  const count = (state: ServiceState) => services.filter((s) => s.state === state).length;

  return (
    <div className="flex flex-col gap-8">
      <Section title={t.title} subtitle={t.subtitle} />

      <Alert tone="blue" title={t.alert.title}>
        {t.alert.p1}<b>{t.alert.b1}</b>{t.alert.p2}<b>{t.alert.b2}</b>{t.alert.p3}
      </Alert>

      {/* Özet — kaç servis hangi durumda */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label={t.stats.active} value={count("ACTIVE")} hint={t.stats.activeHint} tone="green" />
        <Stat label={t.stats.fallback} value={count("FALLBACK")} hint={t.stats.fallbackHint} tone="amber" />
        <Stat label={t.stats.missing} value={count("MISSING")} hint={t.stats.missingHint} tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => {
          const style = STATE_STYLE[service.state];
          const row = rows.services[service.key];
          return (
            <Card key={service.key}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-2 font-bold">
                      <span className={cn("size-2.5 shrink-0 rounded-full", style.dot)} aria-hidden />
                      {row.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-muted">{row.section}</p>
                  </div>
                  <Badge tone={style.tone}>{t.state[service.state]}</Badge>
                </div>

                <p className="text-sm text-muted">{serviceDetailText(rows, service)}</p>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-muted">
                    <ShieldCheck className="size-3.5" />
                    {t.ifNotConfigured}
                  </p>
                  <p className="mt-1 text-sm text-muted">{row.fallback}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-muted">
                    <KeyRound className="size-3.5" />
                    {t.envVars}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {service.envKeys.map((key) => {
                      // Yalnızca "tanımlı mı" bilgisi okunur — değer hiçbir zaman gösterilmez.
                      const defined = Boolean(process.env[key]);
                      return (
                        <li
                          key={key}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[11px]",
                            defined
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "border-[var(--border)] text-muted",
                          )}
                        >
                          <span
                            className={cn("size-1.5 rounded-full", defined ? "bg-emerald-500" : "bg-ink-400")}
                            aria-hidden
                          />
                          {key}
                          <span className="sr-only">{defined ? t.defined : t.notDefined}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        {t.footer.p1}<b>{t.footer.b}</b>{t.footer.p2}
      </p>
    </div>
  );
}
