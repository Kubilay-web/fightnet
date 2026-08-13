"use client";

import { replyThread } from "@/app/(site)/forum/actions";
import { FormShell } from "@/components/form-shell";
import { Textarea, Field } from "@/components/ui";
import { useLocale } from "@/components/i18n/provider";
import { communityFormsCopy } from "@/lib/i18n/pages/community-forms";

export function ReplyForm({ threadId }: { threadId: string }) {
  const t = communityFormsCopy[useLocale()].replyForm;

  return (
    <FormShell action={replyThread.bind(null, threadId)} submitLabel={t.submit}>
      {() => (
        <Field label={t.body} required>
          <Textarea name="body" required rows={4} maxLength={1000} placeholder={t.bodyPlaceholder} />
        </Field>
      )}
    </FormShell>
  );
}
