"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Plus, WifiOff, CloudUpload } from "lucide-react";
import { createTraining } from "@/app/panel/actions";
import { FormShell } from "@/components/form-shell";
import { Input, Textarea, Select, Field, Alert } from "@/components/ui";
import { DISCIPLINES, VISIBILITY_LABEL } from "@/lib/constants";
import { enqueueTraining, flushTrainingQueue, formDataToTraining, queueSize } from "@/lib/offline";

const TRAINING_TYPES = ["Teknik", "Sparring", "Kondisyon", "Kuvvet", "Drilling", "Open Mat", "Özel Ders"];

/**
 * §5.2 — Çevrimdışı destek.
 * Bağlantı yokken kayıt localStorage kuyruğuna alınır; bağlantı gelince
 * `/api/training/sync` ile toplu gönderilir. clientId tekrarlı yazımı engeller.
 */
export function TrainingForm({ gyms }: { gyms: { id: string; name: string }[] }) {
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
    const t = tech.trim();
    if (!t || techniques.includes(t) || techniques.length >= 20) return;
    setTechniques((prev) => [...prev, t]);
    setTech("");
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {offline && (
        <Alert tone="amber" title="Çevrimdışısın">
          <span className="flex items-center gap-2">
            <WifiOff className="size-4" />
            Kaydın cihazında saklanacak ve bağlantı geri geldiğinde otomatik gönderilecek.
          </span>
        </Alert>
      )}
      {justQueued && (
        <Alert tone="green" title="Antrenman cihazına kaydedildi">
          Bağlantı geri geldiğinde otomatik olarak hesabına eklenecek.
        </Alert>
      )}
      {pendingCount > 0 && (
        <Alert tone="blue">
          <span className="flex items-center gap-2">
            <CloudUpload className="size-4" />
            {pendingCount} kayıt senkronize edilmeyi bekliyor.
          </span>
        </Alert>
      )}

      <FormShell action={createTraining} submitLabel="Antrenmanı Kaydet" intercept={intercept}>
        {(state) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tarih" error={state.fields?.date} required>
                <Input type="date" name="date" defaultValue={today} max={today} required />
              </Field>

              <Field label="Disiplin" error={state.fields?.discipline} required>
                <Select name="discipline" required defaultValue="">
                  <option value="" disabled>
                    Seç
                  </option>
                  {DISCIPLINES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.emoji} {d.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Süre (dk)" error={state.fields?.durationMin} required>
                <Input type="number" name="durationMin" defaultValue={60} min={5} max={600} required />
              </Field>

              <Field label="Yoğunluk" hint="1 hafif — 5 maksimum">
                <Select name="intensity" defaultValue="3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <option key={i} value={i}>
                      {i} / 5
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Tür">
                <Select name="type" defaultValue="">
                  <option value="">Seç</option>
                  {TRAINING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Raunt sayısı">
                <Input type="number" name="rounds" min={0} max={100} />
              </Field>
              <Field label="Kilo (kg)" hint="Takip için opsiyonel">
                <Input type="number" step="0.1" name="weightKg" min={30} max={200} />
              </Field>
              <Field label="Ruh hali">
                <Select name="mood" defaultValue="">
                  <option value="">Seç</option>
                  <option value="1">😩 Çok kötü</option>
                  <option value="2">😕 Kötü</option>
                  <option value="3">😐 Normal</option>
                  <option value="4">🙂 İyi</option>
                  <option value="5">🔥 Harika</option>
                </Select>
              </Field>
            </div>

            {gyms.length > 0 && (
              <Field label="Salon">
                <Select name="gymId" defaultValue="">
                  <option value="">Seç</option>
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field label="Çalışılan teknikler" hint="Enter ile ekle">
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
                  placeholder="Armbar, Jab-Cross, Double Leg…"
                  maxLength={60}
                />
                <button
                  type="button"
                  onClick={addTechnique}
                  aria-label="Teknik ekle"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] transition-colors hover:border-blood-500 hover:text-blood-500"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {techniques.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {techniques.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold dark:bg-ink-800"
                    >
                      {t}
                      <input type="hidden" name="techniques[]" value={t} />
                      <button
                        type="button"
                        onClick={() => setTechniques((prev) => prev.filter((x) => x !== t))}
                        aria-label={`${t} kaldır`}
                        className="text-muted hover:text-blood-500"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Notlar">
              <Textarea name="notes" rows={3} maxLength={1000} placeholder="Nasıl geçti? Neyi geliştirmelisin?" />
            </Field>

            <Field label="Görünürlük" hint="Antrenman kayıtların varsayılan olarak özeldir">
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
