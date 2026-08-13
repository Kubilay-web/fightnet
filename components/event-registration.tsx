"use client";

import { useState, useTransition } from "react";
import { Link } from "@/components/i18n/link";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { registerForEvent, withdrawRegistration } from "@/app/(site)/etkinlikler/actions";
import { FormShell } from "@/components/form-shell";
import { Button, Input, Select, Textarea, Field, Checkbox, Alert, Badge } from "@/components/ui";
import { DISCIPLINES, DISCIPLINE_LABEL, weightClassesFor } from "@/lib/constants";
import type { Discipline } from "@prisma/client";

const STATUS: Record<string, { label: string; tone: "amber" | "green" | "blue" | "red" | "neutral" }> = {
  PENDING: { label: "Kayıt incelemede", tone: "amber" },
  ACCEPTED: { label: "Kaydın kabul edildi", tone: "green" },
  WAITLISTED: { label: "Yedek listesindesin", tone: "blue" },
  REJECTED: { label: "Kayıt reddedildi", tone: "red" },
  WITHDRAWN: { label: "Kaydını geri çektin", tone: "neutral" },
};

/**
 * §4.4 — Müsabaka kayıt formu.
 * Sağlık beyanı ve sorumluluk feragatnamesi (§11.2) onayı olmadan gönderilemez.
 */
export function EventRegistration({
  eventId,
  disciplines,
  deadline,
  existing,
}: {
  eventId: string;
  disciplines: Discipline[];
  deadline: Date | null;
  existing: { status: string; reviewNote: string | null } | null;
}) {
  const options = disciplines.length ? DISCIPLINES.filter((d) => disciplines.includes(d.value)) : DISCIPLINES;
  const [discipline, setDiscipline] = useState<Discipline>(options[0]?.value ?? "MMA");
  const [pending, start] = useTransition();
  const bound = registerForEvent.bind(null, eventId);

  if (existing && existing.status !== "WITHDRAWN") {
    const s = STATUS[existing.status];
    return (
      <div className="flex flex-col items-start gap-3">
        <Badge tone={s.tone}>{s.label}</Badge>
        {existing.reviewNote && <p className="text-sm text-muted">Organizatör notu: {existing.reviewNote}</p>}
        {existing.status !== "REJECTED" && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => start(() => withdrawRegistration(eventId))}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Kaydımı geri çek"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <FormShell action={bound} submitLabel="Müsabakaya Kaydol">
      {(state) => (
        <>
          <Alert tone="neutral">
            <span className="flex items-start gap-2">
              <ClipboardCheck className="mt-0.5 size-4 shrink-0" />
              Kaydın organizatöre iletilir. Kilo sınıfı ve eşleşme kararı organizatöre aittir;
              müsabaka bilançon disiplin profilinden otomatik okunur.
            </span>
          </Alert>

          {deadline && (
            <p className="text-xs text-muted">
              Son kayıt tarihi: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(deadline)}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Disiplin" error={state.fields?.discipline} required>
              <Select
                name="discipline"
                required
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as Discipline)}
              >
                {options.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.emoji} {d.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Kilo sınıfı" hint={DISCIPLINE_LABEL[discipline]}>
              <Select name="weightClass" defaultValue="">
                <option value="">Organizatör belirlesin</option>
                {weightClassesFor(discipline).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Güncel kilo (kg)" error={state.fields?.weightKg}>
              <Input type="number" step="0.1" name="weightKg" min={30} max={200} />
            </Field>
            <Field label="Antrenör">
              <Input name="coachName" maxLength={60} />
            </Field>
            <Field label="Salon / Takım">
              <Input name="gymName" maxLength={80} />
            </Field>
          </div>

          <Field
            label="Acil durumda aranacak kişi"
            hint="Ad ve telefon — yalnızca organizatör görür"
            error={state.fields?.emergency}
            required
          >
            <Input name="emergency" required maxLength={120} placeholder="Ayşe Yıldız · +49 170 0000000" />
          </Field>

          <Field label="Organizatöre not">
            <Textarea name="note" rows={2} maxLength={500} placeholder="Tercih ettiğin maç sırası, seyahat kısıtı…" />
          </Field>

          <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] p-3">
            <Checkbox
              name="medicalConfirmed"
              required
              label={
                <span>
                  Müsabakaya çıkmama engel bir sağlık durumum olmadığını, son 60 günde nakavt/beyin
                  sarsıntısı geçirmediğimi beyan ederim.
                </span>
              }
            />
            <Checkbox
              name="waiverAccepted"
              required
              label={
                <span>
                  <Link href="/sparring-sozlesmesi" className="font-semibold text-blood-500 hover:underline">
                    Sorumluluk feragatnamesini
                  </Link>{" "}
                  ve{" "}
                  <Link href="/sartlar" className="font-semibold text-blood-500 hover:underline">
                    kullanım şartlarını
                  </Link>{" "}
                  okudum, kabul ediyorum.
                </span>
              }
            />
            {(state.fields?.medicalConfirmed || state.fields?.waiverAccepted) && (
              <p className="text-xs font-medium text-blood-500">
                {state.fields.medicalConfirmed ?? state.fields.waiverAccepted}
              </p>
            )}
          </div>
        </>
      )}
    </FormShell>
  );
}
