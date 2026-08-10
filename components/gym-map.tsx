"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Building2, CalendarDays, Navigation, Radio } from "lucide-react";
import { Badge, Card, CardBody, Select } from "@/components/ui";
import { cn, distanceKm, formatDate } from "@/lib/utils";
import { DISCIPLINE_LABEL, DISCIPLINES } from "@/lib/constants";
import type { Discipline } from "@prisma/client";

interface GymPin {
  id: string; slug: string; name: string; city: string;
  lat: number; lng: number; disciplines: Discipline[];
  isHalo: boolean; trialEnabled: boolean; memberCount: number;
}

interface EventPin {
  id: string; slug: string; title: string; city: string;
  lat: number; lng: number; startsAt: string; isLive: boolean;
}

/**
 * Harici harita SDK'sı olmadan çalışan interaktif konum görünümü.
 * Pinler DACH sınırlarına göre normalize edilmiş SVG düzleminde çizilir —
 * ek JS paketi indirilmez, ilk boyama anında gerçekleşir.
 * Yol tarifi için Google Maps derin bağlantısı kullanılır.
 */
const BOUNDS = { minLat: 45.6, maxLat: 55.2, minLng: 5.5, maxLng: 17.2 };

export function GymMap({ gyms, events }: { gyms: GymPin[]; events: EventPin[] }) {
  const [discipline, setDiscipline] = useState<string>("");
  const [layer, setLayer] = useState<"ALL" | "GYMS" | "EVENTS">("ALL");
  const [selected, setSelected] = useState<{ kind: "gym" | "event"; id: string } | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);

  const visibleGyms = useMemo(
    () =>
      layer === "EVENTS"
        ? []
        : gyms.filter((g) => !discipline || g.disciplines.includes(discipline as Discipline)),
    [gyms, discipline, layer],
  );
  const visibleEvents = layer === "GYMS" ? [] : events;

  function project(lat: number, lng: number) {
    const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
    const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  }

  function locate() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  const selectedGym = selected?.kind === "gym" ? gyms.find((g) => g.id === selected.id) : null;
  const selectedEvent = selected?.kind === "event" ? events.find((e) => e.id === selected.id) : null;

  const sortedGyms = useMemo(() => {
    if (!me) return visibleGyms;
    return [...visibleGyms].sort(
      (a, b) => distanceKm(me.lat, me.lng, a.lat, a.lng) - distanceKm(me.lat, me.lng, b.lat, b.lng),
    );
  }, [visibleGyms, me]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Select value={layer} onChange={(e) => setLayer(e.target.value as typeof layer)} className="w-auto">
          <option value="ALL">Tümü</option>
          <option value="GYMS">Sadece salonlar</option>
          <option value="EVENTS">Sadece etkinlikler</option>
        </Select>

        <Select value={discipline} onChange={(e) => setDiscipline(e.target.value)} className="w-auto">
          <option value="">Tüm disiplinler</option>
          {DISCIPLINES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>

        <button
          onClick={locate}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3.5 py-2.5 text-sm font-semibold transition-colors hover:border-blood-500 hover:text-blood-500"
        >
          <Navigation className="size-4" />
          Konumumu bul
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Harita düzlemi */}
        <div className="surface relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10]">
          <div className="absolute inset-0 grid-lines opacity-40" />
          <div className="absolute inset-0 mesh-hero opacity-30" />

          {visibleGyms.map((g) => {
            const { x, y } = project(g.lat, g.lng);
            const active = selected?.kind === "gym" && selected.id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelected({ kind: "gym", id: g.id })}
                aria-label={g.name}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-full transition-transform hover:z-20 hover:scale-125",
                  active && "z-20 scale-125",
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <MapPin
                  className={cn(
                    "size-5 drop-shadow",
                    g.isHalo ? "fill-gold-500 text-gold-600" : "fill-blood-600 text-blood-800",
                  )}
                />
              </button>
            );
          })}

          {visibleEvents.map((e) => {
            const { x, y } = project(e.lat, e.lng);
            const active = selected?.kind === "event" && selected.id === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setSelected({ kind: "event", id: e.id })}
                aria-label={e.title}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:z-20 hover:scale-125",
                  active && "z-20 scale-125",
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span
                  className={cn(
                    "block size-3 rounded-full ring-2 ring-white/70",
                    e.isLive ? "bg-blood-500 animate-[pulse-live_1.6s_ease-in-out_infinite]" : "bg-blue-500",
                  )}
                />
              </button>
            );
          })}

          {me && (
            <span
              className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/30"
              style={{ left: `${project(me.lat, me.lng).x}%`, top: `${project(me.lat, me.lng).y}%` }}
              title="Konumun"
            />
          )}

          <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 rounded-xl bg-[var(--bg)]/85 px-2.5 py-1.5 text-[11px] font-semibold backdrop-blur">
            <span className="flex items-center gap-1">
              <MapPin className="size-3 fill-blood-600 text-blood-800" /> Salon
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3 fill-gold-500 text-gold-600" /> Halo
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-blue-500" /> Etkinlik
            </span>
          </div>
        </div>

        {/* Detay / liste */}
        <div className="flex flex-col gap-3">
          {selectedGym && (
            <Card className="border-blood-500/50">
              <CardBody className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-blood-500" />
                  <Link href={`/salonlar/${selectedGym.slug}`} className="font-bold hover:text-blood-500">
                    {selectedGym.name}
                  </Link>
                </div>
                <p className="text-xs text-muted">
                  {selectedGym.city} · {selectedGym.memberCount} üye
                  {me && ` · ${distanceKm(me.lat, me.lng, selectedGym.lat, selectedGym.lng)} km`}
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedGym.disciplines.slice(0, 4).map((d) => (
                    <Badge key={d}>{DISCIPLINE_LABEL[d]}</Badge>
                  ))}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedGym.lat},${selectedGym.lng}`}
                  target="_blank"
                  rel="noopener"
                  className="text-xs font-bold text-blood-500 hover:underline"
                >
                  Yol tarifi al →
                </a>
              </CardBody>
            </Card>
          )}

          {selectedEvent && (
            <Card className="border-blood-500/50">
              <CardBody className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {selectedEvent.isLive ? (
                    <Radio className="size-4 text-blood-500" />
                  ) : (
                    <CalendarDays className="size-4 text-blue-500" />
                  )}
                  <Link href={`/etkinlikler/${selectedEvent.slug}`} className="font-bold hover:text-blood-500">
                    {selectedEvent.title}
                  </Link>
                </div>
                <p className="text-xs text-muted">
                  {selectedEvent.city} · {formatDate(selectedEvent.startsAt)}
                </p>
              </CardBody>
            </Card>
          )}

          <Card className="max-h-[420px] overflow-y-auto">
            <ul className="divide-y divide-[var(--border)]">
              {sortedGyms.slice(0, 40).map((g) => (
                <li key={g.id}>
                  <button
                    onClick={() => setSelected({ kind: "gym", id: g.id })}
                    className="flex w-full items-center gap-2.5 p-3 text-left transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                  >
                    <MapPin className={cn("size-4 shrink-0", g.isHalo ? "text-gold-500" : "text-blood-500")} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{g.name}</p>
                      <p className="truncate text-xs text-muted">
                        {g.city}
                        {me && ` · ${distanceKm(me.lat, me.lng, g.lat, g.lng)} km`}
                      </p>
                    </div>
                    {g.trialEnabled && <Badge tone="green">Deneme</Badge>}
                  </button>
                </li>
              ))}
              {sortedGyms.length === 0 && (
                <li className="p-6 text-center text-sm text-muted">Bu filtrelerle salon yok</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
