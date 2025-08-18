// Frontend API wrapper. Always call the relative /api base.
// Vercel rewrites /api/* -> Render, and Vite dev uses a proxy.

const BASE =
  (import.meta?.env?.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) ||
  "/api";

const ok = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0,160)}`);
  }
  return res.json();
};

export const api = {
  // Statewide aggregates/summary
  state:   () => fetch(`${BASE}/stats/state`).then(ok),
  summary: () => fetch(`${BASE}/summary/state`).then(ok),

  // GeoJSON sources
  districtsProps: () => fetch(`${BASE}/geojson/districts.props.geojson`).then(ok),
  districts:      () => fetch(`${BASE}/geojson/districts`).then(ok),

  // Optional (if backend exposes this)
  campusPoints:   () => fetch(`${BASE}/geojson/campuses.points.geojson`).then(ok),
};

if (typeof window !== "undefined") {
  console.info("[LSL] API base =", BASE);
}
