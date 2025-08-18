// Unified API base with robust fallbacks.
// Order: Vite build-time env -> runtime global -> window origin (disabled).
const ENV_BASE =
  (import.meta && import.meta.env && (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API)) ||
  (typeof window !== "undefined" && (window.__API_BASE__ || window.ENV_API_BASE)) ||
  "";

if (!ENV_BASE) {
  // Do NOT silently fall back to same-origin; force explicit config.
  console.warn("API base is empty; falling back to relative URLs will 404 on Vercel.");
}
const BASE = ENV_BASE.replace(/\/+$/, ""); // strip trailing slash

const jget = async (path) => {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status} for ${url}: ${msg}`);
  }
  return res.json();
};

export const api = {
  // state-level summaries
  stateStats: () => jget("/stats/state"),
  stateSummary: () => jget("/summary/state"),

  // district geometry (props-only geojson)
  districtsProps: () => jget("/geojson/districts.props.geojson"),

  // campus points (if you expose later)
  campusesPoints: () => jget("/geojson/campuses.points.json"),
};
