"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { sendMessage, startConversation } from "@/app/panel/mesajlar/actions";
import { Button, Textarea, Alert } from "@/components/ui";

import type { ActionState } from "@/app/panel/actions";

/** Sohbet içi mesaj kutusu — gönderimden sonra kendini temizler */
export function MessageComposer({ conversationId }: { conversationId: string }) {
  const bound = sendMessage.bind(null, conversationId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(bound, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      {state.error && <Alert tone="red">{state.error}</Alert>}
      <div className="flex items-end gap-2">
        <Textarea
          name="body"
          rows={2}
          maxLength={2000}
          required
          placeholder="Mesajını yaz…"
          className="min-h-11"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
          }}
        />
        <Button type="submit" size="icon" disabled={pending} aria-label="Gönder">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
      <p className="text-[11px] text-muted">
        ⌘/Ctrl + Enter ile gönder · Rahatsız edici mesajları bildirebilirsin
      </p>
    </form>
  );
}

/**
 * Profil sayfasındaki "Mesaj" düğmesi. Sohbeti açar ve oraya götürür.
 * Engel varsa (§11.1 çocuk koruması) gerekçe düğmenin altında görünür.
 */
export function MessageLink({ recipientId }: { recipientId: string }) {
  const bound = startConversation.bind(null, recipientId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(bound, {});

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
        Mesaj
      </Button>
      {state.error && (
        <p className="max-w-xs text-xs font-medium text-amber-500">{state.error}</p>
      )}
    </form>
  );
}
