import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff, Dumbbell, RefreshCw } from "lucide-react";
import { Card, CardBody, ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Çevrimdışısın",
  robots: { index: false, follow: false },
};

/**
 * Service worker, ağ yokken ve önbellekte sayfa bulunamadığında bu sayfayı
 * gösterir (§5.2). Antrenman günlüğü çevrimdışı çalışmaya devam eder.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
        <WifiOff className="size-8" />
      </span>

      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">Bağlantı yok</h1>
        <p className="mt-2 text-sm text-muted">
          Bu sayfa henüz cihazına kaydedilmemiş. Bağlantın geri geldiğinde otomatik olarak yüklenecek.
        </p>
      </div>

      <Card className="w-full text-left">
        <CardBody className="flex items-start gap-3">
          <Dumbbell className="mt-0.5 size-5 shrink-0 text-blood-500" />
          <div>
            <p className="font-bold">Antrenman günlüğü çevrimdışı çalışır</p>
            <p className="mt-0.5 text-sm text-muted">
              Seansını şimdi kaydet — cihazında saklanır ve bağlantı gelince hesabına eklenir.
            </p>
            <ButtonLink href="/panel/antrenman/yeni" size="sm" className="mt-3">
              Antrenman kaydet
            </ButtonLink>
          </div>
        </CardBody>
      </Card>

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-blood-500 hover:underline"
      >
        <RefreshCw className="size-4" />
        Yeniden dene
      </Link>
    </div>
  );
}
