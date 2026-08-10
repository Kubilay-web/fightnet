"use client";

import { useState } from "react";
import { createEvent, updateEvent, addFight, updateFightResult } from "@/app/organizator/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Textarea, Select, Field, Checkbox, Switch } from "@/components/ui";
import { DISCIPLINES, EVENT_TYPE_LABEL, FIGHT_METHOD_LABEL, weightClassesFor } from "@/lib/constants";
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
  const [poster, setPoster] = useState<{ url: string; id: string } | null>(
    initial?.posterUrl ? { url: initial.posterUrl, id: initial.posterId ?? "" } : null,
  );

  const action = initial?.id ? updateEvent.bind(null, initial.id) : createEvent;

  return (
    <FormShell action={action} submitLabel={initial?.id ? "Etkinliği Güncelle" : "Etkinliği Oluştur"}>
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <Field label="Afiş" hint="Dikey format (3:4)">
              <ImageUploader folder="event" value={poster?.url} onChange={(a) => setPoster(a ? { url: a.url, id: a.publicId } : null)} aspect="aspect-[3/4]" />
              <input type="hidden" name="posterUrl" value={poster?.url ?? ""} />
              <input type="hidden" name="posterId" value={poster?.id ?? ""} />
            </Field>

            <div className="flex flex-col gap-4">
              <Field label="Etkinlik adı" error={state.fields?.title} required>
                <Input name="title" required defaultValue={initial?.title} maxLength={120} placeholder="Rhein-Main Fight Night 3" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tür">
                  <Select name="type" defaultValue={initial?.type ?? "AMATEUR"}>
                    {Object.entries(EVENT_TYPE_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Yayın durumu">
                  <Select name="status" defaultValue={initial?.status ?? "DRAFT"}>
                    <option value="DRAFT">Taslak</option>
                    <option value="PUBLISHED">Yayında</option>
                    <option value="LIVE">Canlı</option>
                    <option value="FINISHED">Tamamlandı</option>
                    <option value="CANCELLED">İptal</option>
                  </Select>
                </Field>
              </div>
            </div>
          </div>

          <Field label="Açıklama">
            <Textarea name="description" rows={4} maxLength={4000} defaultValue={initial?.description ?? ""} />
          </Field>

          <Field label="Disiplinler" required>
            <div className="grid gap-2 sm:grid-cols-3">
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
            <Field label="Başlangıç" error={state.fields?.startsAt} required>
              <Input type="datetime-local" name="startsAt" required defaultValue={initial?.startsAt} />
            </Field>
            <Field label="Kapı açılış">
              <Input type="datetime-local" name="doorsAt" defaultValue={initial?.doorsAt} />
            </Field>
            <Field label="Bitiş">
              <Input type="datetime-local" name="endsAt" defaultValue={initial?.endsAt} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mekan adı">
              <Input name="venueName" defaultValue={initial?.venueName ?? ""} maxLength={120} />
            </Field>
            <Field label="Adres">
              <Input name="street" defaultValue={initial?.street ?? ""} maxLength={120} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Şehir" error={state.fields?.city} required>
              <Input name="city" required defaultValue={initial?.city} maxLength={60} />
            </Field>
            <Field label="Posta kodu">
              <Input name="postalCode" defaultValue={initial?.postalCode ?? ""} maxLength={10} />
            </Field>
            <Field label="Enlem">
              <Input type="number" step="any" name="lat" defaultValue={initial?.lat ?? ""} />
            </Field>
            <Field label="Boylam">
              <Input type="number" step="any" name="lng" defaultValue={initial?.lng ?? ""} />
            </Field>
          </div>

          <input type="hidden" name="country" value={initial?.country ?? "DE"} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Bilet bağlantısı">
              <Input type="url" name="ticketUrl" defaultValue={initial?.ticketUrl ?? ""} placeholder="https://" />
            </Field>
            <Field label="Bilet fiyatı (€)">
              <Input type="number" step="0.5" name="ticketPrice" defaultValue={initial?.ticketPrice ?? ""} min={0} />
            </Field>
            <Field label="Kapasite">
              <Input type="number" name="capacity" defaultValue={initial?.capacity ?? ""} min={0} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Canlı yayın bağlantısı">
              <Input type="url" name="streamUrl" defaultValue={initial?.streamUrl ?? ""} placeholder="https://" />
            </Field>
            <Field label="PPV fiyatı (€)">
              <Input type="number" step="0.5" name="ppvPrice" defaultValue={initial?.ppvPrice ?? ""} min={0} />
            </Field>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4">
            <Switch name="isPPV" defaultChecked={initial?.isPPV} label="Ücretli canlı yayın (PPV)" />
            <Switch name="registrationOpen" defaultChecked={initial?.registrationOpen} label="Müsabaka kaydı açık" />
          </div>
        </>
      )}
    </FormShell>
  );
}

export function FightForm({ eventId }: { eventId: string }) {
  const [discipline, setDiscipline] = useState<Discipline>("MMA");

  return (
    <FormShell action={addFight.bind(null, eventId)} submitLabel="Müsabakayı Ekle">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Disiplin" required>
              <Select
                name="discipline"
                required
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as Discipline)}
              >
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Kilo sınıfı">
              <Select name="weightClass" defaultValue="">
                <option value="">Seç</option>
                {weightClassesFor(discipline).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Raunt">
              <Input type="number" name="rounds" defaultValue={3} min={1} max={12} />
            </Field>
            <Field label="Raunt süresi (dk)">
              <Input type="number" name="roundMinutes" defaultValue={3} min={1} max={10} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-xl border border-blood-500/40 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-blood-500">Kırmızı Köşe</p>
              <Field label="İsim" error={state.fields?.redName} required>
                <Input name="redName" required maxLength={80} />
              </Field>
              <Field label="FIGHTNET kullanıcı adı" hint="Profile bağlamak için (opsiyonel)">
                <Input name="redId" maxLength={40} className="lowercase" />
              </Field>
              <Field label="Bilanço">
                <Input name="redRecord" maxLength={30} placeholder="12-3-0" />
              </Field>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-blue-500/40 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-blue-500">Mavi Köşe</p>
              <Field label="İsim" error={state.fields?.blueName} required>
                <Input name="blueName" required maxLength={80} />
              </Field>
              <Field label="FIGHTNET kullanıcı adı" hint="Profile bağlamak için (opsiyonel)">
                <Input name="blueId" maxLength={40} className="lowercase" />
              </Field>
              <Field label="Bilanço">
                <Input name="blueRecord" maxLength={30} placeholder="8-1-1" />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Sıra">
              <Input type="number" name="order" defaultValue={0} min={0} max={50} />
            </Field>
            <Field label="Ana müsabaka">
              <div className="pt-2">
                <Checkbox name="isMainEvent" label="Main Event" />
              </div>
            </Field>
            <Field label="Ünvan maçı">
              <div className="pt-2">
                <Checkbox name="isTitleFight" label="Title Fight" />
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
  return (
    <FormShell action={updateFightResult.bind(null, eventId)} submitLabel="Skoru Güncelle">
      {() => (
        <>
          <input type="hidden" name="fightId" value={fight.id} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Durum">
              <Select name="status" defaultValue={fight.status}>
                <option value="SCHEDULED">Planlandı</option>
                <option value="LIVE">Canlı</option>
                <option value="FINISHED">Bitti</option>
                <option value="CANCELLED">İptal</option>
                <option value="NO_CONTEST">Geçersiz</option>
              </Select>
            </Field>

            <Field label="Mevcut raunt">
              <Select name="currentRound" defaultValue={String(fight.currentRound)}>
                <option value="0">—</option>
                {Array.from({ length: fight.rounds }, (_, i) => i + 1).map((r) => (
                  <option key={r} value={r}>
                    Raunt {r}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Kazanan">
              <Select name="winnerCorner" defaultValue={fight.winnerCorner ?? ""}>
                <option value="">—</option>
                <option value="RED">{fight.redName} (Kırmızı)</option>
                <option value="BLUE">{fight.blueName} (Mavi)</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Bitiş yöntemi">
              <Select name="method" defaultValue={fight.method ?? ""}>
                <option value="">—</option>
                {Object.entries(FIGHT_METHOD_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Bitiş raundu">
              <Input type="number" name="endRound" defaultValue={fight.endRound ?? ""} min={1} max={fight.rounds} />
            </Field>
            <Field label="Bitiş süresi">
              <Input name="endTime" defaultValue={fight.endTime ?? ""} maxLength={10} placeholder="3:24" />
            </Field>
          </div>

          <Field label="Not">
            <Input name="notes" maxLength={500} />
          </Field>
        </>
      )}
    </FormShell>
  );
}
