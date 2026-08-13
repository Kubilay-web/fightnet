import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.errors.forbiddenMeta, robots: { index: false } };
}

export default async function ForbiddenPage() {
  const dict = await getDict();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <ShieldAlert className="size-12 text-blood-500" />
      <div className="flex flex-col items-center gap-2">
        <h1 className="font-display text-2xl font-black sm:text-3xl">{dict.errors.forbiddenTitle}</h1>
        <p className="max-w-md text-muted">{dict.errors.forbiddenBody}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/panel">{dict.errors.dashboardCta}</ButtonLink>
        <ButtonLink href="/" variant="outline">
          {dict.errors.homeCta}
        </ButtonLink>
      </div>
    </div>
  );
}
