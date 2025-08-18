// frontend/src/lib/api.js
// Robust, environment-aware API with fallbacks for static files in /public

const BASE = (import.meta.env?.VITE_API_BASE || "").replace(/\/$/, ""); // no trailing slash

async function getJson(url, init) {
  const r = await fetch(url, init);
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`${r.status} ${url}\n${txt || ""}`);
  }
  return r.json();
}

// Try a list of candidate URLs (first one that returns 200 wins)
async function firstJson(candidates) {
  let lastErr;
  for (const u of candidates) {
    try {
      return await getJson(u);
    } catch (e) {
      lastErr = e;
      // continue
    }
  }
  throw new Error(`All candidates failed:\n${candidates.join("\n")}\n\n${lastErr || ""}`);
}

// ---- Public functions used across the app ----

// Statewide summary numbers
export async function stateStats() {
  return firstJson([
    BASE && `${BASE}/api/stats/state`,
    "/summary/state", // optional alt route if you ever expose it statically
  ].filter(Boolean));
}

// GeoJSON: district polygons with props
export async function geoDistrictProps() {
  return firstJson([
    BASE && `${BASE}/api/geo/districts.props`,
    "/geojson/districts.props", // if you publish a short props feed here
    "/data/processed/geo/districts.props.geojson", // full static file under /public
  ].filter(Boolean));
}

// Points: campuses for search/autocomplete
export async function campusPoints() {
  return firstJson([
    BASE && `${BASE}/api/points/campuses`,
    "/geo/points/campuses.geojson",
    "/data/processed/geo/campuses.points.geojson",
  ].filter(Boolean));
}

// Example: district-level stats by id
export async function districtStats(districtId) {
  const id = encodeURIComponent(districtId);
  return firstJson([
    BASE && `${BASE}/api/stats/district/${id}`,
    `/summary/district/${id}`, // optional alt if ever exposed
  ].filter(Boolean));
}
