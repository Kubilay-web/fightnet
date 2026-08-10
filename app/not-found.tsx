import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="absolute inset-0 mesh-hero opacity-60" />
      <div className="absolute inset-0 grid-lines opacity-30" />

      <div className="relative flex flex-col items-center gap-4">
        <Logo />
        <p className="font-display text-7xl font-black text-blood-500 sm:text-9xl">404</p>
        <h1 className="font-display text-2xl font-black sm:text-3xl">Bu ringde kimse yok</h1>
        <p className="max-w-md text-muted">
          Aradığın sayfa taşınmış veya hiç var olmamış olabilir. Ana sayfadan devam et.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Ana Sayfa</ButtonLink>
          <ButtonLink href="/dovuscular" variant="outline">
            Dövüşçüler
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
