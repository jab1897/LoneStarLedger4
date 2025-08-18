// frontend/src/api.js
const base = ""; // stay relative; vercel rewrites proxy to Render

async function j(url, opts={}) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.json();
}

export const api = {
  // statewide
  stateStats:   () => j(`/stats/state`),
  stateSummary: () => j(`/summary/state`),

  // geojson
  districts:    () => j(`/geojson/districts`),
  campusesPts:  () => j(`/geojson/campuses_points`),

  // lookups (optional)
  district: (id) => j(`/stats/district/${encodeURIComponent(id)}`),
  campus:   (id) => j(`/stats/campus/${encodeURIComponent(id)}`)
};
export default api;
