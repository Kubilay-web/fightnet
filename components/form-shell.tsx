"use client";

import { useActionState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button, Alert } from "@/components/ui";
import type { ActionState } from "@/app/panel/actions";

/**
 * Sunucu eylemlerini saran ortak form kabuğu.
 * `useActionState` ile JS olmadan da çalışır (progressive enhancement),
 * JS varsa bekleme durumu ve alan hataları gösterilir.
 */
export function FormShell({
  action,
  submitLabel = "Kaydet",
  children,
  className,
  intercept,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  submitLabel?: string;
  children: (state: ActionState) => React.ReactNode;
  className?: string;
  /**
   * Gönderimi sunucuya iletmeden ele alma imkânı (§5.2 çevrimdışı kuyruk).
   * `true` dönerse sunucu eylemi çalıştırılmaz ve form sıfırlanır.
   */
  intercept?: (fd: FormData) => boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!intercept) return;
    const form = e.currentTarget;
    if (intercept(new FormData(form))) {
      e.preventDefault(); // React 19: preventDefault sunucu eylemini iptal eder
      form.reset();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className={className ?? "flex flex-col gap-4"}>
      {state.error && <Alert tone="red">{state.error}</Alert>}
      {state.ok && state.message && (
        <Alert tone="green">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4" /> {state.message}
          </span>
        </Alert>
      )}

      {children(state)}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? <Loader2 className="size-4 animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
