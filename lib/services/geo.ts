import "server-only";

/**
 * §5.3 — Coğrafi kodlama ve yer arama.
 *
 * Mapbox veya Google Places kullanılabilir; ikisi de ücretlidir. Anahtar
 * yoksa `geoConfigured` false döner ve salon konumu, salon sahibinin elle
 * girdiği koordinatla çalışır. Harita görünümü (`components/gym-map.tsx`)
 * zaten harici SDK'sız çizildiği için harita her koşulda çalışır — burada
 * yapılandırılan yalnızca adresten koordinat üretimi ve yer önerileridir.
 */

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;

export type GeoProvider = "mapbox" | "google" | "none";

export const geoProvider: GeoProvider = MAPBOX_TOKEN ? "mapbox" : GOOGLE_KEY ? "google" : "none";
export const geoConfigured = geoProvider !== "none";

export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
  city: string | null;
  postalCode: string | null;
  country: string | null;
}

/** DACH sınırlarına öncelik verir — platformun hedef pazarı (§1.5). */
const DACH_BBOX = "5.5,45.6,17.2,55.2";

export async function geocode(address: string): Promise<GeoPoint | null> {
  if (!address.trim()) return null;
  if (geoProvider === "mapbox") return geocodeMapbox(address);
  if (geoProvider === "google") return geocodeGoogle(address);
  return null;
}

async function geocodeMapbox(address: string): Promise<GeoPoint | null> {
  try {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json` +
      `?access_token=${MAPBOX_TOKEN}&limit=1&language=de&bbox=${DACH_BBOX}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      features?: {
        center?: [number, number];
        place_name?: string;
        context?: { id: string; text: string }[];
      }[];
    };
    const f = json.features?.[0];
    if (!f?.center) return null;
    const ctx = (prefix: string) => f.context?.find((c) => c.id.startsWith(prefix))?.text ?? null;
    return {
      lng: f.center[0],
      lat: f.center[1],
      label: f.place_name ?? address,
      city: ctx("place"),
      postalCode: ctx("postcode"),
      country: ctx("country"),
    };
  } catch {
    return null;
  }
}

async function geocodeGoogle(address: string): Promise<GeoPoint | null> {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}` +
      `&key=${GOOGLE_KEY}&language=de&region=de`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      results?: {
        geometry?: { location?: { lat: number; lng: number } };
        formatted_address?: string;
        address_components?: { types: string[]; long_name: string; short_name: string }[];
      }[];
    };
    const r = json.results?.[0];
    const loc = r?.geometry?.location;
    if (!loc) return null;
    const comp = (type: string) =>
      r.address_components?.find((c) => c.types.includes(type))?.long_name ?? null;
    return {
      lat: loc.lat,
      lng: loc.lng,
      label: r.formatted_address ?? address,
      city: comp("locality") ?? comp("postal_town"),
      postalCode: comp("postal_code"),
      country: r.address_components?.find((c) => c.types.includes("country"))?.short_name ?? null,
    };
  } catch {
    return null;
  }
}

export interface PlaceSuggestion {
  id: string;
  label: string;
  lat: number | null;
  lng: number | null;
}

/** Salon kaydında adres otomatik tamamlama; yapılandırılmamışsa boş liste. */
export async function suggestPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (!geoConfigured || query.trim().length < 3) return [];
  if (geoProvider === "mapbox") {
    const point = await geocodeMapbox(query);
    return point ? [{ id: point.label, label: point.label, lat: point.lat, lng: point.lng }] : [];
  }
  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}` +
      `&key=${GOOGLE_KEY}&language=de&components=country:de|country:at|country:ch`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { predictions?: { place_id: string; description: string }[] };
    return (json.predictions ?? []).slice(0, 6).map((p) => ({
      id: p.place_id,
      label: p.description,
      lat: null,
      lng: null,
    }));
  } catch {
    return [];
  }
}
