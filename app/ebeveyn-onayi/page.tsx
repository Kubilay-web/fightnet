import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { confirmGuardianConsent } from "@/lib/guardian";
import { Card, CardBody, ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Veli Onayı",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * §11.1 Kapı 1 — Reşit olmayanlar için e-posta tabanlı ebeveyn izni.
 * Veli bu sayfadaki bağlantıyla onayı verir; jeton tek kullanımlıktır.
 */
export default async function GuardianConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await confirmGuardianConsent(token ?? "");

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span
        className={`flex size-16 items-center justify-center rounded-2xl ${
          result.ok ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
        }`}
      >
        {result.ok ? <ShieldCheck className="size-8" /> : <ShieldAlert className="size-8" />}
      </span>

      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">
          {result.ok ? "Onay alındı" : "Onay verilemedi"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {result.ok
            ? `${result.name ?? "Üye"} artık FIGHTNET'i tam olarak kullanabilir.`
            : result.error}
        </p>
      </div>

      <Card className="w-full text-left">
        <CardBody className="flex flex-col gap-3 text-sm">
          <p className="font-bold">Bu onay ne anlama geliyor?</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-muted">
            <li>Kimliği doğrulanmış yetişkinler üyeye doğrudan mesaj gönderebilir.</li>
            <li>Sparring eşleşmesi ve müsabaka kaydı açılır — her sparring sonrası güvenlik değerlendirmesi zorunludur.</li>
            <li>Üyenin profili yaşına uygun içerik filtresiyle korunmaya devam eder.</li>
            <li>Onayı istediğiniz zaman geri çekebilirsiniz.</li>
          </ul>
          <p className="text-xs text-muted">
            Sorularınız için{" "}
            <Link href="/iletisim" className="font-semibold text-blood-500 hover:underline">
              bize yazın
            </Link>
            . Veri işleme detayları{" "}
            <Link href="/gizlilik" className="font-semibold text-blood-500 hover:underline">
              gizlilik açıklamasında
            </Link>
            .
          </p>
        </CardBody>
      </Card>

      <ButtonLink href="/" variant="outline" size="sm">
        FIGHTNET&apos;e git
      </ButtonLink>
    </div>
  );
}
