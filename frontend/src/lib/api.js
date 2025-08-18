// frontend/src/lib/api.js

// Resolve API base. Prefer window.ENV_API_BASE (set by HTML), then Vite, then /api proxy.
const API_BASE =
  (typeof window !== "undefined" && window.ENV_API_BASE) ||
  (import.meta?.env?.VITE_API_BASE) ||
  "/api";

// Generic GET with JSON parse
async function getOnce(url, opts = {}) {
  const res = await fetch(url, { credentials: "omit", ...opts });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") || ct.includes("geo+json")
    ? res.json()
    : res.text();
}

// Try a list of candidate URLs and return the first successful JSON/GeoJSON
async function tryMany(candidates) {
  const errors = [];
  for (const make of candidates) {
    const url = make();
    try {
      const data = await getOnce(url);
      return data;
    } catch (e) {
      errors.push(`${e.message}`);
    }
  }
  throw new Error(`All candidates failed:\n${errors.join("\n")}`);
}

/** Lightweight districts GeoJSON with properties (preferred) */
export async function geoDistrictProps() {
  return tryMany([
    // Newer API (Render/Vercel function)
    () => `${API_BASE}/geo/districts.props`,
    // Alt API shapes
    () => `${API_BASE}/geojson/districts.props`,
    // Static public fallbacks
    () => `/geojson/districts.props.geojson`,
    () => `/data/processed/geo/districts.props.geojson`,
    // Last resort: full districts (heavier)
    () => `${API_BASE}/geo/districts`,
    () => `/geojson/districts`,
  ]);
}

/** Full-resolution districts (use on detail pages, not home) */
export async function geoDistrictsFull() {
  return tryMany([
    () => `${API_BASE}/geo/districts`,
    () => `/geojson/districts`,
  ]);
}

/** Campus points (FeatureCollection) */
export async function campusPoints() {
  return tryMany([
    () => `${API_BASE}/points/campuses`,
    () => `/geo/points/campuses.geojson`,
    () => `/data/processed/geo/campuses.points.geojson`,
  ]);
}

/** Statewide summary cards */
export async function stateStats() {
  return tryMany([
    () => `${API_BASE}/stats/state`,
    () => `${API_BASE}/summary/state`,
    () => `/summary/state`,
    () => `/stats/state.json`,
  ]);
}

/** District summary */
export async function districtSummary(id) {
  const safe = encodeURIComponent(id);
  return tryMany([
    () => `${API_BASE}/summary/district/${safe}`,
    () => `/summary/district/${safe}.json`,
  ]);
}

/** Campus summary */
export async function campusSummary(id) {
  const safe = encodeURIComponent(id);
  return tryMany([
    () => `${API_BASE}/summary/campus/${safe}`,
    () => `/summary/campus/${safe}.json`,
  ]);
}

/** Optional server-side search */
export async function search(q) {
  const s = encodeURIComponent(q || "");
  return tryMany([
    () => `${API_BASE}/search?q=${s}`,
  ]);
}
