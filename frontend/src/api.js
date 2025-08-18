// Frontend API helper: always use absolute API base from Vite env
const RAW = (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
          || (typeof window !== 'undefined' && window.ENV_API_BASE)
          || '';

const API_BASE = String(RAW).replace(/\/+$/,''); // trim trailing slashes
const toAbs = (p) => /^https?:\/\//i.test(p) ? p : `${API_BASE}${p.startsWith('/') ? '' : '/'}${p}`;

async function getJson(path, init) {
  const url = toAbs(path);
  const r = await fetch(url, {
    headers: { 'Accept': 'application/json', ...(init && init.headers || {}) },
    ...init
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

export const api = {
  state: () => getJson('/stats/state'),
  summary: () => getJson('/summary/state'),
  districtsGeo: () => getJson('/geojson/districts.props.geojson'),
  campusesPoints: () => getJson('/geojson/campuses.points.json'), // enable on backend when ready
};

export default api;
