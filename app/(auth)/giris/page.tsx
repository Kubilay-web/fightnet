import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardBody } from "@/components/ui";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "FIGHTNET hesabına giriş yap.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardBody className="flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <h1 className="font-display text-2xl font-black">Tekrar hoş geldin</h1>
          <p className="mt-1 text-sm text-muted">Antrenmanına kaldığın yerden devam et.</p>
        </div>

        <Suspense fallback={<div className="h-56" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-muted">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="font-bold text-blood-500 hover:underline">
            Ücretsiz katıl
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
