import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Erişim Yok", robots: { index: false } };

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <ShieldAlert className="size-12 text-blood-500" />
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-display text-2xl font-black sm:text-3xl">Bu alana erişimin yok</h1>
        <p className="max-w-md text-muted">
          Bu sayfa için gerekli yetkiye sahip değilsin. Yanlış hesapla giriş yapmış olabilirsin.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/panel">Panelim</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Ana Sayfa
        </ButtonLink>
      </div>
    </div>
  );
}
