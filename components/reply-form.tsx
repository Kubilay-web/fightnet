"use client";

import { replyThread } from "@/app/(site)/forum/actions";
import { FormShell } from "@/components/form-shell";
import { Textarea, Field } from "@/components/ui";

export function ReplyForm({ threadId }: { threadId: string }) {
  return (
    <FormShell action={replyThread.bind(null, threadId)} submitLabel="Yanıtla">
      {() => (
        <Field label="Yanıtın" required>
          <Textarea name="body" required rows={4} maxLength={1000} placeholder="Görüşünü paylaş…" />
        </Field>
      )}
    </FormShell>
  );
}
