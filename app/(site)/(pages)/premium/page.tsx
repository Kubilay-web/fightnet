import type { Metadata } from "next";
import { Fragment } from "react";
import { Check } from "lucide-react";
import { Badge, ButtonLink, Card, CardBody } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { COACHING_FEE_RATE, PLATFORM_FEE_RATE, PLATFORM_PLANS } from "@/lib/constants";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { premiumCopy } from "@/lib/i18n/pages/premium";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const copy = premiumCopy[await getLocale()];
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: await metadataAlternates("/premium"),
  };
}

const PLAN_ORDER = ["PREMIUM", "COACH_TOOLS"] as const;

/** Fiyat ve oranlar tek kaynaktan (lib/constants) gelir — sözlükte tutulmaz. */
export default async function PremiumPage() {
  const locale = await getLocale();
  const copy = premiumCopy[locale];
  const session = await getSession();

  // Girişliyse doğrudan abonelik ekranına, değilse kayda yönlendirilir.
  const ctaHref = session ? "/panel/abonelik" : "/kayit";
  const ctaLabel = session ? copy.cta.subscription : copy.cta.register;

  const percent = (rate: number) =>
    copy.fees.percentFormat.replace("{n}", String(Math.round(rate * 100)));

  return (
    <>
      <Badge tone="gold" className="w-fit">{copy.badge}</Badge>
      <h1 className="font-display text-3xl font-black sm:text-5xl">{copy.title}</h1>

      <p>{copy.intro}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLAN_ORDER.map((key) => {
          const plan = PLATFORM_PLANS[key];
          const text = copy.plans[key];
          return (
            <Card key={key} hover className={key === "PREMIUM" ? "border-gold-500/40" : undefined}>
              <CardBody className="flex h-full flex-col gap-4">
                <div>
                  <h2 className="font-display text-xl font-black">{text.label}</h2>
                  <p className="text-sm text-muted">{text.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-black">
                    {formatMoney(plan.price, "EUR", LOCALE_TAG[locale])}
                  </span>
                  <span className="text-sm text-muted">{copy.perMonth}</span>
                </div>

                {/* Sarmalayıcı layout tüm <ul>/<li> öğelerine madde imi verdiği için
                    kart içindeki özellik listesi rol tabanlı div ile kuruldu. */}
                <div role="list" className="flex flex-col gap-2">
                  {text.features.map((feature) => (
                    <div role="listitem" key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <ButtonLink
                  href={ctaHref}
                  full
                  variant={key === "PREMIUM" ? "primary" : "outline"}
                  className="mt-auto"
                >
                  {ctaLabel}
                </ButtonLink>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <p>{copy.vatNote}</p>

      <h2>{copy.free.heading}</h2>
      <ul>
        {copy.free.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{copy.fees.heading}</h2>
      <p>
        {copy.fees.body
          .replace("{platform}", percent(PLATFORM_FEE_RATE))
          .replace("{coaching}", percent(COACHING_FEE_RATE))}
      </p>

      <h2>{copy.faq.heading}</h2>

      {copy.faq.items.map((item) => (
        <Fragment key={item.q}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </Fragment>
      ))}

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink>
        <ButtonLink href="/hakkinda" variant="outline">
          {copy.cta.about}
        </ButtonLink>
      </div>
    </>
  );
}
