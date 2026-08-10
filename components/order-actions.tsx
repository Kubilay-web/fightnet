"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setOrderStatus } from "@/app/panel/pazar/actions";
import { Button } from "@/components/ui";

/** Satıcının sipariş durumunu ilerletmesi (§4.4) */
export function SellerOrderActions({ orderId, status }: { orderId: string; status: string }) {
  const [pending, start] = useTransition();

  if (status === "DELIVERED" || status === "CANCELLED" || status === "REFUNDED") return null;

  const next =
    status === "PENDING"
      ? ({ value: "PAID", label: "Ödeme alındı" } as const)
      : status === "PAID"
        ? ({ value: "SHIPPED", label: "Kargoya verdim" } as const)
        : ({ value: "DELIVERED", label: "Teslim edildi" } as const);

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button size="sm" disabled={pending} onClick={() => start(() => setOrderStatus(orderId, next.value))}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : next.label}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => start(() => setOrderStatus(orderId, "CANCELLED"))}
      >
        İptal et
      </Button>
    </div>
  );
}
