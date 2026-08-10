import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, Section, Alert } from "@/components/ui";
import { ProductForm } from "@/components/product-forms";
import { MARKETPLACE_FEE_RATE } from "@/lib/constants";

export const metadata: Metadata = { title: "Yeni İlan", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const user = await requireUser();
  if (user.verification === "LEVEL_0") redirect("/panel/dogrulama");

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Yeni İlan"
        subtitle={`Ekipmanını topluluğa sun — satışta %${MARKETPLACE_FEE_RATE * 100} platform komisyonu`}
      />

      <Alert tone="amber" title="Neler satılamaz">
        Doping maddeleri, takviye iddiası içeren ürünler, kilo düşürme yardımcıları ve ikinci el
        koruyucu ağızlıklar yayınlanamaz. Kurallara aykırı ilanlar kaldırılır.
      </Alert>

      <Card>
        <CardBody>
          <ProductForm />
        </CardBody>
      </Card>
    </div>
  );
}
