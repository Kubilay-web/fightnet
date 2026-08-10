import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardBody } from "@/components/ui";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  description: "FIGHTNET'e ücretsiz katıl. Doğrulanmış dövüşçü profili oluştur.",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-lg">
      <CardBody className="flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <h1 className="font-display text-2xl font-black">FIGHTNET'e katıl</h1>
          <p className="mt-1 text-sm text-muted">
            Profilini oluştur, antrenmanlarını kaydet, sparring partneri bul.
          </p>
        </div>

        <Suspense fallback={<div className="h-96" />}>
          <RegisterForm />
        </Suspense>

        <p className="text-center text-sm text-muted">
          Zaten üye misin?{" "}
          <Link href="/giris" className="font-bold text-blood-500 hover:underline">
            Giriş yap
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
