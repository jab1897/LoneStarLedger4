// frontend/src/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "https://lonestarledger2-0.onrender.com";

async function j(path, opts={}) {
  const url = path.startsWith("http") ? path : API_BASE + path;
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.json();
}

export const api = {
  // statewide
  stateStats:   () => j("/stats/state"),
  stateSummary: () => j("/summary/state"),

  // geojson
  districts:    () => j("/geojson/districts"),
  campusesPts:  () => j("/geojson/campuses_points"),

  // detail endpoints (if present)
  district: (id) => j(`/stats/district/${encodeURIComponent(id)}`),
  campus:   (id) => j(`/stats/campus/${encodeURIComponent(id)}`),
};

export default api;
