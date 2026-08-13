import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { confirmGuardianConsent } from "@/lib/guardian";
import { Card, CardBody, ButtonLink } from "@/components/ui";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: dict.errors.guardianMeta,
    robots: { index: false, follow: false },
  };
}

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
  const [{ token }, dict] = await Promise.all([searchParams, getDict()]);
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
          {result.ok ? dict.errors.guardianOkTitle : dict.errors.guardianFailTitle}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {result.ok
            ? dict.errors.guardianOkBody.replace(
                "{name}",
                result.name ?? dict.errors.guardianMember,
              )
            : result.error}
        </p>
      </div>

      <Card className="w-full text-left">
        <CardBody className="flex flex-col gap-3 text-sm">
          <p className="font-bold">{dict.errors.guardianWhatTitle}</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-muted">
            <li>{dict.errors.guardianPoint1}</li>
            <li>{dict.errors.guardianPoint2}</li>
            <li>{dict.errors.guardianPoint3}</li>
            <li>{dict.errors.guardianPoint4}</li>
          </ul>
          <p className="text-xs text-muted">
            {dict.errors.guardianContactLead}{" "}
            <Link href="/iletisim" className="font-semibold text-blood-500 hover:underline">
              {dict.errors.guardianContactLink}
            </Link>
            . {dict.errors.guardianPrivacyLead}{" "}
            <Link href="/gizlilik" className="font-semibold text-blood-500 hover:underline">
              {dict.errors.guardianPrivacyLink}
            </Link>
            .
          </p>
        </CardBody>
      </Card>

      <ButtonLink href="/" variant="outline" size="sm">
        {dict.errors.guardianCta}
      </ButtonLink>
    </div>
  );
}
