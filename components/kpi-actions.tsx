"use client";

import { useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { takeKpiSnapshot } from "@/app/admin/actions";
import { Button } from "@/components/ui";

/** §7 — Zamanlanmış görevi beklemeden elle anlık görüntü almak için */
export function SnapshotButton() {
  const [pending, start] = useTransition();

  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => start(() => takeKpiSnapshot())}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
      Anlık görüntü al
    </Button>
  );
}
