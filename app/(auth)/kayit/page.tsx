import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { Suspense } from "react";
import { Card, CardBody } from "@/components/ui";
import { RegisterForm } from "@/components/auth-forms";
import { getLocale, metadataAlternates } from "@/lib/i18n/server";
import { authCopy } from "@/lib/i18n/pages/auth";

export async function generateMetadata(): Promise<Metadata> {
  const copy = authCopy[await getLocale()].register;
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: await metadataAlternates("/kayit"),
    robots: { index: false },
  };
}

export default async function RegisterPage() {
  const copy = authCopy[await getLocale()].register;

  return (
    <Card className="w-full max-w-lg">
      <CardBody className="flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <h1 className="font-display text-2xl font-black">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
        </div>

        <Suspense fallback={<div className="h-96" />}>
          <RegisterForm copy={copy.form} />
        </Suspense>

        <p className="text-center text-sm text-muted">
          {copy.haveAccount}{" "}
          <Link href="/giris" className="font-bold text-blood-500 hover:underline">
            {copy.login}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
