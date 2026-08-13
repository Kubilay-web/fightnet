import type { Metadata } from "next";
import { Link } from "@/components/i18n/link";
import { WifiOff, Dumbbell, RefreshCw } from "lucide-react";
import { Card, CardBody, ButtonLink } from "@/components/ui";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: dict.errors.offline,
    description: dict.errors.offlineBody,
    robots: { index: false, follow: false },
  };
}

/**
 * Service worker, ağ yokken ve önbellekte sayfa bulunamadığında bu sayfayı
 * gösterir (§5.2). Antrenman günlüğü çevrimdışı çalışmaya devam eder.
 */
export default async function OfflinePage() {
  const dict = await getDict();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
        <WifiOff className="size-8" />
      </span>

      <div>
        <h1 className="font-display text-3xl font-black tracking-tight">{dict.errors.offlineTitle}</h1>
        <p className="mt-2 text-sm text-muted">{dict.errors.offlineBody}</p>
      </div>

      <Card className="w-full text-left">
        <CardBody className="flex items-start gap-3">
          <Dumbbell className="mt-0.5 size-5 shrink-0 text-blood-500" />
          <div>
            <p className="font-bold">{dict.errors.offlineLogTitle}</p>
            <p className="mt-0.5 text-sm text-muted">{dict.errors.offlineLogBody}</p>
            <ButtonLink href="/panel/antrenman/yeni" size="sm" className="mt-3">
              {dict.errors.offlineLogCta}
            </ButtonLink>
          </div>
        </CardBody>
      </Card>

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-blood-500 hover:underline"
      >
        <RefreshCw className="size-4" />
        {dict.errors.offlineRetry}
      </Link>
    </div>
  );
}
