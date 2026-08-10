"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { reviewRegistration } from "@/app/organizator/actions";
import { Button, Input, Alert } from "@/components/ui";
import type { ActionState } from "@/app/panel/actions";

/** §4.4 — Organizatörün kayıt kararı: kabul / yedek / ret */
export function RegistrationReview({
  eventId,
  registrationId,
  status,
}: {
  eventId: string;
  registrationId: string;
  status: string;
}) {
  const bound = reviewRegistration.bind(null, eventId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(bound, {});

  if (status === "WITHDRAWN") return null;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      {state.error && <Alert tone="red">{state.error}</Alert>}
      <input type="hidden" name="registrationId" value={registrationId} />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          name="reviewNote"
          maxLength={500}
          placeholder="Sporcuya not (opsiyonel) — eşleşme, tartı saati…"
          className="min-w-48 flex-1"
        />
        <Button type="submit" name="status" value="ACCEPTED" size="sm" disabled={pending || status === "ACCEPTED"}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Kabul"}
        </Button>
        <Button type="submit" name="status" value="WAITLISTED" size="sm" variant="outline" disabled={pending}>
          Yedek
        </Button>
        <Button type="submit" name="status" value="REJECTED" size="sm" variant="ghost" disabled={pending}>
          Ret
        </Button>
      </div>
    </form>
  );
}
