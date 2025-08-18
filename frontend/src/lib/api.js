// frontend/src/lib/api.js
// Resolves the API base (Render backend proxied through Vercel, or /api)
const API_BASE =
  (typeof window !== "undefined" && window.ENV_API_BASE) ||
  (import.meta?.env?.VITE_API_BASE) ||
  "/api";

async function get(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, { credentials: "omit", ...opts });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${url} -> ${res.status} ${text}`);
  }
  return res.json();
}

/** Lightweight districts GeoJSON with simplified geometry + properties */
export async function geoDistrictProps() {
  // Expected backend route: GET /geo/districts.props
  return get("/geo/districts.props");
}

/** Full-resolution district geometries (use on district detail) */
export async function geoDistrictsFull() {
  // Expected backend route: GET /geo/districts
  return get("/geo/districts");
}

/** Campus points as GeoJSON FeatureCollection */
export async function campusPoints() {
  // Expected backend route: GET /points/campuses
  return get("/points/campuses");
}

/** Statewide summary numbers/cards */
export async function stateStats() {
  // Expected backend route: GET /stats/state
  return get("/stats/state");
}

/** District summary for cards/tables */
export async function districtSummary(id) {
  return get(`/summary/district/${encodeURIComponent(id)}`);
}

/** Campus summary for cards/tables */
export async function campusSummary(id) {
  return get(`/summary/campus/${encodeURIComponent(id)}`);
}

/** Optional server-side search (not required if using client-only search) */
export async function search(q) {
  return get(`/search?q=${encodeURIComponent(q)}`);
}
