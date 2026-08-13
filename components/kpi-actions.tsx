"use client";

import { useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { takeKpiSnapshot } from "@/app/admin/actions";
import { useLocale } from "@/components/i18n/provider";
import { Button } from "@/components/ui";
import { kpiActionsCopy } from "@/lib/i18n/pages/admin-forms";

/** §7 — Zamanlanmış görevi beklemeden elle anlık görüntü almak için */
export function SnapshotButton() {
  const t = kpiActionsCopy[useLocale()];
  const [pending, start] = useTransition();

  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => start(() => takeKpiSnapshot())}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
      {t.snapshot}
    </Button>
  );
}
