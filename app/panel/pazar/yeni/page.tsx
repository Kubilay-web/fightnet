import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { ProductForm } from "@/components/product-forms";
import { MARKETPLACE_FEE_RATE } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import { panelMarketCopy } from "@/lib/i18n/pages/panel-market";

export async function generateMetadata(): Promise<Metadata> {
  const copy = panelMarketCopy[await getLocale()];
  return { title: copy.new.meta.title, robots: { index: false } };
}

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const user = await requireUser();
  if (user.verification === "LEVEL_0") redirect("/panel/dogrulama");

  const copy = panelMarketCopy[await getLocale()].new;

  return (
    <div className="flex flex-col gap-6">
      <Section
        title={copy.title}
        subtitle={copy.subtitle(MARKETPLACE_FEE_RATE * 100)}
      />

      <Alert tone="amber" title={copy.forbidden.title}>
        {copy.forbidden.body}
      </Alert>

      <Card>
        <CardBody>
          <ProductForm />
        </CardBody>
      </Card>
    </div>
  );
}
