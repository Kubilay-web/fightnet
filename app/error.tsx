"use client";

import { useEffect } from "react";
import { RotateCcw, Home } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { useDict } from "@/components/i18n/provider";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Bu sınır kök düzenin içinde çalışır, yani `LocaleProvider` her zaman kuruludur.
  const dict = useDict();

  useEffect(() => {
    console.error("[FIGHTNET]", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-display text-2xl font-black sm:text-3xl">{dict.errors.genericTitle}</h1>
        <p className="max-w-md text-muted">{dict.errors.genericBody}</p>
        {error.digest && (
          <p className="font-mono text-xs text-muted">
            {dict.errors.errorCode}: {error.digest}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw className="size-4" /> {dict.errors.retry}
        </Button>
        <ButtonLink href="/" variant="outline">
          <Home className="size-4" /> {dict.errors.homeCta}
        </ButtonLink>
      </div>
    </div>
  );
}
