"use client";

import { useState } from "react";
import { Trash2, Plus, X } from "lucide-react";
import { updateProfile, upsertSportProfile, deleteSportProfile } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { ImageUploader, type UploadedAsset } from "@/components/uploader";
import { Input, Textarea, Select, Field, Card, CardBody, Badge, Button, Checkbox } from "@/components/ui";
import {
  DISCIPLINES, SKILL_LEVELS, BELTS, VISIBILITY_LABEL,
  DISCIPLINE_LABEL, SKILL_LABEL, BELT_LABEL, BELT_COLOR, weightClassesFor,
} from "@/lib/constants";
import { formatRecord } from "@/lib/utils";
import type { BeltRank, Discipline, SkillLevel } from "@prisma/client";

interface ProfileInitial {
  name: string;
  bio: string | null;
  city: string | null;
  country: string;
  postalCode: string | null;
  birthDate: string;
  nationality: string | null;
  heightCm: number | null;
  reachCm: number | null;
  stance: string | null;
  website: string | null;
  visibility: string;
  avatarUrl: string | null;
  avatarId: string | null;
  coverUrl: string | null;
  coverId: string | null;
  instagram: string;
  youtube: string;
}

export function ProfileForm({ initial }: { initial: ProfileInitial }) {
  const [avatar, setAvatar] = useState<{ url: string; id: string } | null>(
    initial.avatarUrl ? { url: initial.avatarUrl, id: initial.avatarId ?? "" } : null,
  );
  const [cover, setCover] = useState<{ url: string; id: string } | null>(
    initial.coverUrl ? { url: initial.coverUrl, id: initial.coverId ?? "" } : null,
  );

  const onAsset = (set: (v: { url: string; id: string } | null) => void) => (a: UploadedAsset | null) =>
    set(a ? { url: a.url, id: a.publicId } : null);

  return (
    <FormShell action={updateProfile} submitLabel="Profili Kaydet">
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <Field label="Profil fotoğrafı">
              <ImageUploader
                folder="avatar"
                value={avatar?.url}
                onChange={onAsset(setAvatar)}
                aspect="aspect-square"
                label="Fotoğraf yükle"
              />
              <input type="hidden" name="avatarUrl" value={avatar?.url ?? ""} />
              <input type="hidden" name="avatarId" value={avatar?.id ?? ""} />
            </Field>

            <Field label="Kapak görseli">
              <ImageUploader
                folder="cover"
                value={cover?.url}
                onChange={onAsset(setCover)}
                aspect="aspect-[16/6]"
                label="Kapak yükle"
              />
              <input type="hidden" name="coverUrl" value={cover?.url ?? ""} />
              <input type="hidden" name="coverId" value={cover?.id ?? ""} />
            </Field>
          </div>

          <Field label="Ad Soyad" error={state.fields?.name} required>
            <Input name="name" defaultValue={initial.name} required maxLength={60} />
          </Field>

          <Field label="Biyografi" error={state.fields?.bio} hint="Sponsorlar ve antrenörler seni burada tanır">
            <Textarea name="bio" defaultValue={initial.bio ?? ""} rows={4} maxLength={600} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Şehir" error={state.fields?.city}>
              <Input name="city" defaultValue={initial.city ?? ""} maxLength={60} />
            </Field>
            <Field label="Posta kodu">
              <Input name="postalCode" defaultValue={initial.postalCode ?? ""} maxLength={10} />
            </Field>
            <Field label="Ülke">
              <Select name="country" defaultValue={initial.country}>
                <option value="DE">Almanya</option>
                <option value="AT">Avusturya</option>
                <option value="CH">İsviçre</option>
                <option value="TR">Türkiye</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Doğum tarihi">
              <Input type="date" name="birthDate" defaultValue={initial.birthDate} />
            </Field>
            <Field label="Boy (cm)" error={state.fields?.heightCm}>
              <Input type="number" name="heightCm" defaultValue={initial.heightCm ?? ""} min={100} max={250} />
            </Field>
            <Field label="Kulaç (cm)">
              <Input type="number" name="reachCm" defaultValue={initial.reachCm ?? ""} min={100} max={260} />
            </Field>
            <Field label="Duruş">
              <Select name="stance" defaultValue={initial.stance ?? ""}>
                <option value="">Seç</option>
                <option value="ORTHODOX">Ortodoks</option>
                <option value="SOUTHPAW">Southpaw</option>
                <option value="SWITCH">Switch</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Web sitesi" error={state.fields?.website}>
              <Input name="website" type="url" defaultValue={initial.website ?? ""} placeholder="https://" />
            </Field>
            <Field label="Instagram" hint="@ olmadan">
              <Input name="instagram" defaultValue={initial.instagram} maxLength={60} />
            </Field>
            <Field label="YouTube" hint="kanal adı">
              <Input name="youtube" defaultValue={initial.youtube} maxLength={60} />
            </Field>
          </div>

          {/* §8.3 — Görünürlük seviyeleri */}
          <Field label="Profil görünürlüğü" hint="Profilini kimler görebilir?">
            <Select name="visibility" defaultValue={initial.visibility}>
              {Object.entries(VISIBILITY_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>

          <input type="hidden" name="nationality" value={initial.nationality ?? ""} />
        </>
      )}
    </FormShell>
  );
}

// ---------------------------------------------------------------------------

interface SportRow {
  id: string;
  discipline: Discipline;
  isPrimary: boolean;
  level: SkillLevel;
  belt: BeltRank;
  stripes: number;
  weightClass: string | null;
  weightKg: number | null;
  yearsActive: number;
  isPro: boolean;
  wins: number;
  losses: number;
  draws: number;
  koWins: number;
  subWins: number;
}

export function SportProfileManager({ sports }: { sports: SportRow[] }) {
  const [adding, setAdding] = useState(sports.length === 0);
  const [editing, setEditing] = useState<SportRow | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {sports.map((s) => (
          <Card key={s.id}>
            <CardBody className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">{DISCIPLINE_LABEL[s.discipline]}</h3>
                  <p className="text-xs text-muted">
                    {SKILL_LABEL[s.level]}
                    {s.isPro && " · Pro"}
                    {s.yearsActive > 0 && ` · ${s.yearsActive} yıl`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {s.isPrimary && <Badge tone="red">Ana</Badge>}
                  <button
                    onClick={() => setEditing(s)}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-muted hover:text-blood-500"
                  >
                    Düzenle
                  </button>
                  <form action={deleteSportProfile.bind(null, s.id)}>
                    <button
                      type="submit"
                      aria-label="Sil"
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-blood-500/10 hover:text-blood-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              </div>

              <p className="text-lg font-black tabular-nums">{formatRecord(s.wins, s.losses, s.draws)}</p>

              {s.belt !== "NONE" && (
                <span className="flex items-center gap-2 text-xs font-bold">
                  <span className="h-3 w-8 rounded-sm" style={{ background: BELT_COLOR[s.belt] }} />
                  {BELT_LABEL[s.belt]}
                  {s.stripes > 0 && ` · ${s.stripes} bant`}
                </span>
              )}
              {s.weightClass && <p className="text-xs text-muted">{s.weightClass}</p>}
            </CardBody>
          </Card>
        ))}
      </div>

      {editing && (
        <Card className="border-blood-500/40">
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">{DISCIPLINE_LABEL[editing.discipline]} düzenle</h3>
              <button onClick={() => setEditing(null)} aria-label="Kapat" className="text-muted hover:text-blood-500">
                <X className="size-4" />
              </button>
            </div>
            <SportForm initial={editing} onDone={() => setEditing(null)} />
          </CardBody>
        </Card>
      )}

      {adding ? (
        <Card className="border-blood-500/40">
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">Yeni disiplin ekle</h3>
              {sports.length > 0 && (
                <button onClick={() => setAdding(false)} aria-label="Kapat" className="text-muted hover:text-blood-500">
                  <X className="size-4" />
                </button>
              )}
            </div>
            <SportForm onDone={() => setAdding(false)} />
          </CardBody>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)} className="self-start">
          <Plus className="size-4" /> Disiplin Ekle
        </Button>
      )}
    </div>
  );
}

function SportForm({ initial, onDone }: { initial?: SportRow; onDone: () => void }) {
  const [discipline, setDiscipline] = useState<Discipline>(initial?.discipline ?? "MMA");
  const hasBelt = DISCIPLINES.find((d) => d.value === discipline)?.hasBelt;

  return (
    <FormShell action={upsertSportProfile} submitLabel={initial ? "Güncelle" : "Ekle"}>
      {() => (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Disiplin" required>
              <Select
                name="discipline"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as Discipline)}
                disabled={!!initial}
              >
                {DISCIPLINES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.emoji} {d.label}
                  </option>
                ))}
              </Select>
              {initial && <input type="hidden" name="discipline" value={discipline} />}
            </Field>

            <Field label="Seviye">
              <Select name="level" defaultValue={initial?.level ?? "BEGINNER"}>
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Kilo sınıfı">
              <Select name="weightClass" defaultValue={initial?.weightClass ?? ""}>
                <option value="">Seç</option>
                {weightClassesFor(discipline).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {hasBelt && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kemer">
                <Select name="belt" defaultValue={initial?.belt ?? "NONE"}>
                  {BELTS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Bant sayısı">
                <Input type="number" name="stripes" defaultValue={initial?.stripes ?? 0} min={0} max={4} />
              </Field>
            </div>
          )}
          {!hasBelt && <input type="hidden" name="belt" value="NONE" />}

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Kilo (kg)">
              <Input type="number" step="0.1" name="weightKg" defaultValue={initial?.weightKg ?? ""} min={30} max={200} />
            </Field>
            <Field label="Aktif yıl">
              <Input type="number" name="yearsActive" defaultValue={initial?.yearsActive ?? 0} min={0} max={60} />
            </Field>
            <Field label="Durum">
              <div className="pt-2">
                <Checkbox name="isPro" defaultChecked={initial?.isPro} label="Profesyonel sporcuyum" />
              </div>
            </Field>
          </div>

          <Field label="Müsabaka bilançosu">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              <Input type="number" name="wins" defaultValue={initial?.wins ?? 0} min={0} placeholder="Galibiyet" aria-label="Galibiyet" />
              <Input type="number" name="losses" defaultValue={initial?.losses ?? 0} min={0} placeholder="Mağlubiyet" aria-label="Mağlubiyet" />
              <Input type="number" name="draws" defaultValue={initial?.draws ?? 0} min={0} placeholder="Berabere" aria-label="Berabere" />
              <Input type="number" name="koWins" defaultValue={initial?.koWins ?? 0} min={0} placeholder="KO" aria-label="KO galibiyeti" />
              <Input type="number" name="subWins" defaultValue={initial?.subWins ?? 0} min={0} placeholder="Sub" aria-label="Submission galibiyeti" />
            </div>
          </Field>

          <Checkbox name="isPrimary" defaultChecked={initial?.isPrimary} label="Ana disiplinim olsun" />
          <input type="hidden" name="visibility" value="PUBLIC" />
        </>
      )}
    </FormShell>
  );
}
