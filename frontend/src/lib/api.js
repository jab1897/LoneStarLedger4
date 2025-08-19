// frontend/src/lib/api.js
// Named exports only (avoid default) to fix "default is not exported" build errors.

const BASE =
  (typeof import !== "undefined" &&
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_BACKEND_URL) ||
  "https://lonestarledger2-0.onrender.com"; // fallback; change if needed

async function _json(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

// --- Summary / lists ---
export const summary = () => _json(`${BASE}/summary`);

export const listDistricts = (limit = 50, offset = 0, q) => {
  const qs = new URLSearchParams({ limit, offset });
  if (q) qs.set("q", q);
  return _json(`${BASE}/districts?${qs.toString()}`);
};

export const listSchools = (limit = 50, offset = 0, q) => {
  const qs = new URLSearchParams({ limit, offset });
  if (q) qs.set("q", q);
  return _json(`${BASE}/schools?${qs.toString()}`);
};

// --- Single records ---
export const getDistrict = (id) => _json(`${BASE}/district/${encodeURIComponent(id)}`);
export const getSchool = (id) => _json(`${BASE}/school/${encodeURIComponent(id)}`);

// --- Geo endpoints ---
// Simplified districts with {district_6, name} in properties
export const geoDistrictProps = () => _json(`${BASE}/geojson/districts`);

// Lightweight campus points: [{id, campus_name, district_6, lat, lon, ...}]
export const campusPoints = () => _json(`${BASE}/campus_points`);

// expose BASE (handy for linking to API)
export const apiBase = BASE;
