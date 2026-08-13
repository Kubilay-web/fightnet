"use client";

import { useState } from "react";
import { createEvent, updateEvent, addFight, updateFightResult } from "@/app/organizator/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Textarea, Select, Field, Checkbox, Switch } from "@/components/ui";
import { DISCIPLINES, EVENT_TYPE_LABEL, FIGHT_METHOD_LABEL, weightClassesFor } from "@/lib/constants";
import { useLocale } from "@/components/i18n/provider";
import { organizerCopy } from "@/lib/i18n/pages/organizer";
import type { Discipline } from "@prisma/client";

export interface EventInitial {
  id?: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  disciplines: Discipline[];
  startsAt: string;
  endsAt: string;
  doorsAt: string;
  venueName: string | null;
  street: string | null;
  city: string;
  postalCode: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  ticketUrl: string | null;
  ticketPrice: number | null;
  capacity: number | null;
  streamUrl: string | null;
  isPPV: boolean;
  ppvPrice: number | null;
  registrationOpen: boolean;
  posterUrl: string | null;
  posterId: string | null;
}

export function EventForm({ initial }: { initial?: EventInitial }) {
  const t = organizerCopy[useLocale()].eventForm;
  const [poster, setPoster] = useState<{ url: string; id: string } | null>(
    initial?.posterUrl ? { url: initial.posterUrl, id: initial.posterId ?? "" } : null,
  );

  const action = initial?.id ? updateEvent.bind(null, initial.id) : createEvent;

  return (
    <FormShell action={action} submitLabel={initial?.id ? t.submitUpdate : t.submitCreate}>
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <Field label={t.poster} hint={t.posterHint}>
              <ImageUploader folder="event" value={poster?.url} onChange={(a) => setPoster(a ? { url: a.url, id: a.publicId } : null)} aspect="aspect-[3/4]" />
              <input type="hidden" name="posterUrl" value={poster?.url ?? ""} />
              <input type="hidden" name="posterId" value={poster?.id ?? ""} />
            </Field>

            <div className="flex flex-col gap-4">
              <Field label={t.name} error={state.fields?.title} required>
                <Input name="title" required defaultValue={initial?.title} maxLength={120} placeholder="Rhein-Main Fight Night 3" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.type}>
                  <Select name="type" defaultValue={initial?.type ?? "AMATEUR"}>
                    {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                    {Object.entries(EVENT_TYPE_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={t.status}>
                  <Select name="status" defaultValue={initial?.status ?? "DRAFT"}>
                    <option value="DRAFT">{t.statusOptions.DRAFT}</option>
                    <option value="PUBLISHED">{t.statusOptions.PUBLISHED}</option>
                    <option value="LIVE">{t.statusOptions.LIVE}</option>
                    <option value="FINISHED">{t.statusOptions.FINISHED}</option>
                    <option value="CANCELLED">{t.statusOptions.CANCELLED}</option>
                  </Select>
                </Field>
              </div>
            </div>
          </div>

          <Field label={t.description}>
            <Textarea name="description" rows={4} maxLength={4000} defaultValue={initial?.description ?? ""} />
          </Field>

          <Field label={t.disciplines} required>
            <div className="grid gap-2 sm:grid-cols-3">
              {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
              {DISCIPLINES.map((d) => (
                <Checkbox
                  key={d.value}
                  name="disciplines[]"
                  value={d.value}
                  defaultChecked={initial?.disciplines.includes(d.value)}
                  label={d.label}
                />
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.startsAt} error={state.fields?.startsAt} required>
              <Input type="datetime-local" name="startsAt" required defaultValue={initial?.startsAt} />
            </Field>
            <Field label={t.doorsAt}>
              <Input type="datetime-local" name="doorsAt" defaultValue={initial?.doorsAt} />
            </Field>
            <Field label={t.endsAt}>
              <Input type="datetime-local" name="endsAt" defaultValue={initial?.endsAt} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.venueName}>
              <Input name="venueName" defaultValue={initial?.venueName ?? ""} maxLength={120} />
            </Field>
            <Field label={t.street}>
              <Input name="street" defaultValue={initial?.street ?? ""} maxLength={120} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label={t.city} error={state.fields?.city} required>
              <Input name="city" required defaultValue={initial?.city} maxLength={60} />
            </Field>
            <Field label={t.postalCode}>
              <Input name="postalCode" defaultValue={initial?.postalCode ?? ""} maxLength={10} />
            </Field>
            <Field label={t.lat}>
              <Input type="number" step="any" name="lat" defaultValue={initial?.lat ?? ""} />
            </Field>
            <Field label={t.lng}>
              <Input type="number" step="any" name="lng" defaultValue={initial?.lng ?? ""} />
            </Field>
          </div>

          <input type="hidden" name="country" value={initial?.country ?? "DE"} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.ticketUrl}>
              <Input type="url" name="ticketUrl" defaultValue={initial?.ticketUrl ?? ""} placeholder="https://" />
            </Field>
            <Field label={t.ticketPrice}>
              <Input type="number" step="0.5" name="ticketPrice" defaultValue={initial?.ticketPrice ?? ""} min={0} />
            </Field>
            <Field label={t.capacity}>
              <Input type="number" name="capacity" defaultValue={initial?.capacity ?? ""} min={0} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.streamUrl}>
              <Input type="url" name="streamUrl" defaultValue={initial?.streamUrl ?? ""} placeholder="https://" />
            </Field>
            <Field label={t.ppvPrice}>
              <Input type="number" step="0.5" name="ppvPrice" defaultValue={initial?.ppvPrice ?? ""} min={0} />
            </Field>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4">
            <Switch name="isPPV" defaultChecked={initial?.isPPV} label={t.isPPV} />
            <Switch name="registrationOpen" defaultChecked={initial?.registrationOpen} label={t.registrationOpen} />
          </div>
        </>
      )}
    </FormShell>
  );
}

export function FightForm({ eventId }: { eventId: string }) {
  const t = organizerCopy[useLocale()].fightForm;
  const [discipline, setDiscipline] = useState<Discipline>("MMA");

  return (
    <FormShell action={addFight.bind(null, eventId)} submitLabel={t.submit}>
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label={t.discipline} required>
              <Select
                name="discipline"
                required
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as Discipline)}
              >
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.weightClass}>
              <Select name="weightClass" defaultValue="">
                <option value="">{t.select}</option>
                {weightClassesFor(discipline).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.rounds}>
              <Input type="number" name="rounds" defaultValue={3} min={1} max={12} />
            </Field>
            <Field label={t.roundMinutes}>
              <Input type="number" name="roundMinutes" defaultValue={3} min={1} max={10} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-xl border border-blood-500/40 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-blood-500">{t.redCorner}</p>
              <Field label={t.fighterName} error={state.fields?.redName} required>
                <Input name="redName" required maxLength={80} />
              </Field>
              <Field label={t.username} hint={t.usernameHint}>
                <Input name="redId" maxLength={40} className="lowercase" />
              </Field>
              <Field label={t.record}>
                <Input name="redRecord" maxLength={30} placeholder="12-3-0" />
              </Field>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-blue-500/40 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-blue-500">{t.blueCorner}</p>
              <Field label={t.fighterName} error={state.fields?.blueName} required>
                <Input name="blueName" required maxLength={80} />
              </Field>
              <Field label={t.username} hint={t.usernameHint}>
                <Input name="blueId" maxLength={40} className="lowercase" />
              </Field>
              <Field label={t.record}>
                <Input name="blueRecord" maxLength={30} placeholder="8-1-1" />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.order}>
              <Input type="number" name="order" defaultValue={0} min={0} max={50} />
            </Field>
            <Field label={t.mainEvent}>
              <div className="pt-2">
                <Checkbox name="isMainEvent" label={t.mainEventLabel} />
              </div>
            </Field>
            <Field label={t.titleFight}>
              <div className="pt-2">
                <Checkbox name="isTitleFight" label={t.titleFightLabel} />
              </div>
            </Field>
          </div>
        </>
      )}
    </FormShell>
  );
}

/** §4.1 — Canlı skor girişi */
export function FightResultForm({
  eventId,
  fight,
}: {
  eventId: string;
  fight: {
    id: string;
    redName: string;
    blueName: string;
    rounds: number;
    status: string;
    winnerCorner: string | null;
    method: string | null;
    endRound: number | null;
    endTime: string | null;
    currentRound: number;
  };
}) {
  const t = organizerCopy[useLocale()].fightResultForm;

  return (
    <FormShell action={updateFightResult.bind(null, eventId)} submitLabel={t.submit}>
      {() => (
        <>
          <input type="hidden" name="fightId" value={fight.id} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.status}>
              <Select name="status" defaultValue={fight.status}>
                <option value="SCHEDULED">{t.statusOptions.SCHEDULED}</option>
                <option value="LIVE">{t.statusOptions.LIVE}</option>
                <option value="FINISHED">{t.statusOptions.FINISHED}</option>
                <option value="CANCELLED">{t.statusOptions.CANCELLED}</option>
                <option value="NO_CONTEST">{t.statusOptions.NO_CONTEST}</option>
              </Select>
            </Field>

            <Field label={t.currentRound}>
              <Select name="currentRound" defaultValue={String(fight.currentRound)}>
                <option value="0">—</option>
                {Array.from({ length: fight.rounds }, (_, i) => i + 1).map((r) => (
                  <option key={r} value={r}>
                    {t.round(r)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={t.winner}>
              <Select name="winnerCorner" defaultValue={fight.winnerCorner ?? ""}>
                <option value="">—</option>
                <option value="RED">{fight.redName} ({t.red})</option>
                <option value="BLUE">{fight.blueName} ({t.blue})</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.method}>
              <Select name="method" defaultValue={fight.method ?? ""}>
                <option value="">—</option>
                {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                {Object.entries(FIGHT_METHOD_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.endRound}>
              <Input type="number" name="endRound" defaultValue={fight.endRound ?? ""} min={1} max={fight.rounds} />
            </Field>
            <Field label={t.endTime}>
              <Input name="endTime" defaultValue={fight.endTime ?? ""} maxLength={10} placeholder="3:24" />
            </Field>
          </div>

          <Field label={t.notes}>
            <Input name="notes" maxLength={500} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
