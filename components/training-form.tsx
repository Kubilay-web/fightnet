"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Plus, WifiOff, CloudUpload } from "lucide-react";
import { createTraining } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Select, Field, Alert } from "@/components/ui";
import { DISCIPLINES, VISIBILITY_LABEL } from "@/lib/constants";
import { enqueueTraining, flushTrainingQueue, formDataToTraining, queueSize } from "@/lib/offline";
import { useLocale } from "@/components/i18n/provider";
import { panelTrainingCopy, TRAINING_TYPE_VALUES } from "@/lib/i18n/pages/panel-training";

/**
 * §5.2 — Çevrimdışı destek.
 * Bağlantı yokken kayıt localStorage kuyruğuna alınır; bağlantı gelince
 * `/api/training/sync` ile toplu gönderilir. clientId tekrarlı yazımı engeller.
 */
export function TrainingForm({ gyms }: { gyms: { id: string; name: string }[] }) {
  const t = panelTrainingCopy[useLocale()].form;
  const [techniques, setTechniques] = useState<string[]>([]);
  const [tech, setTech] = useState("");
  const [offline, setOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [justQueued, setJustQueued] = useState(false);

  useEffect(() => {
    const sync = () => {
      setOffline(!navigator.onLine);
      setPendingCount(queueSize());
    };
    const onQueueChange = (e: Event) => setPendingCount((e as CustomEvent<number>).detail);
    const onOnline = () => {
      sync();
      void flushTrainingQueue().then(() => setPendingCount(queueSize()));
    };

    sync();
    void flushTrainingQueue().then(() => setPendingCount(queueSize()));

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", sync);
    window.addEventListener("fn-queue-change", onQueueChange);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", sync);
      window.removeEventListener("fn-queue-change", onQueueChange);
    };
  }, []);

  /**
   * Çevrimdışıysa gönderimi sunucuya iletme — kuyruğa al.
   *
   * `clientId` burada, gönderim anında üretilir (render sırasında değil):
   * her kayıt kendi kimliğini alır, böylece aynı oturumda arka arkaya
   * girilen iki antrenman senkronda birbirini bastırmaz.
   */
  const intercept = useCallback((fd: FormData) => {
    if (navigator.onLine) return false;
    enqueueTraining(formDataToTraining(fd));
    setTechniques([]);
    setJustQueued(true);
    return true;
  }, []);

  function addTechnique() {
    const value = tech.trim();
    if (!value || techniques.includes(value) || techniques.length >= 20) return;
    setTechniques((prev) => [...prev, value]);
    setTech("");
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {offline && (
        <Alert tone="amber" title={t.offlineTitle}>
          <span className="flex items-center gap-2">
            <WifiOff className="size-4" />
            {t.offlineBody}
          </span>
        </Alert>
      )}
      {justQueued && (
        <Alert tone="green" title={t.queuedTitle}>
          {t.queuedBody}
        </Alert>
      )}
      {pendingCount > 0 && (
        <Alert tone="blue">
          <span className="flex items-center gap-2">
            <CloudUpload className="size-4" />
            {pendingCount} {t.pendingSuffix}
          </span>
        </Alert>
      )}

      <FormShell action={createTraining} submitLabel={t.submit} intercept={intercept}>
        {(state) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.date} error={state.fields?.date} required>
                <Input type="date" name="date" defaultValue={today} max={today} required />
              </Field>

              <Field label={t.discipline} error={state.fields?.discipline} required>
                <Select name="discipline" required defaultValue="">
                  <option value="" disabled>
                    {t.select}
                  </option>
                  {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
                  {DISCIPLINES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.emoji} {d.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t.duration} error={state.fields?.durationMin} required>
                <Input type="number" name="durationMin" defaultValue={60} min={5} max={600} required />
              </Field>

              <Field label={t.intensity} hint={t.intensityHint}>
                <Select name="intensity" defaultValue="3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <option key={i} value={i}>
                      {i} / 5
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label={t.type}>
                <Select name="type" defaultValue="">
                  <option value="">{t.select}</option>
                  {TRAINING_TYPE_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {t.typeOptions[value]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t.rounds}>
                <Input type="number" name="rounds" min={0} max={100} />
              </Field>
              <Field label={t.weight} hint={t.weightHint}>
                <Input type="number" step="0.1" name="weightKg" min={30} max={200} />
              </Field>
              <Field label={t.mood}>
                <Select name="mood" defaultValue="">
                  <option value="">{t.select}</option>
                  <option value="1">😩 {t.moodOptions.veryBad}</option>
                  <option value="2">😕 {t.moodOptions.bad}</option>
                  <option value="3">😐 {t.moodOptions.ok}</option>
                  <option value="4">🙂 {t.moodOptions.good}</option>
                  <option value="5">🔥 {t.moodOptions.great}</option>
                </Select>
              </Field>
            </div>

            {gyms.length > 0 && (
              <Field label={t.gym}>
                <Select name="gymId" defaultValue="">
                  <option value="">{t.select}</option>
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field label={t.techniques} hint={t.techniquesHint}>
              <div className="flex gap-2">
                <Input
                  value={tech}
                  onChange={(e) => setTech(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTechnique();
                    }
                  }}
                  placeholder={t.techniquesPlaceholder}
                  maxLength={60}
                />
                <button
                  type="button"
                  onClick={addTechnique}
                  aria-label={t.addTechniqueAria}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] transition-colors hover:border-blood-500 hover:text-blood-500"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {techniques.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {techniques.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold dark:bg-ink-800"
                    >
                      {item}
                      <input type="hidden" name="techniques[]" value={item} />
                      <button
                        type="button"
                        onClick={() => setTechniques((prev) => prev.filter((x) => x !== item))}
                        aria-label={t.removeTechniqueAria(item)}
                        className="text-muted hover:text-blood-500"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label={t.notes}>
              <Textarea name="notes" rows={3} maxLength={1000} placeholder={t.notesPlaceholder} />
            </Field>

            <Field label={t.visibility} hint={t.visibilityHint}>
              {/* TODO(i18n): lib/i18n/labels.ts hazır olduğunda labelsFor(locale) ile değiştir */}
              <Select name="visibility" defaultValue="PRIVATE">
                {Object.entries(VISIBILITY_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>

          </>
        )}
      </FormShell>
    </>
  );
}
