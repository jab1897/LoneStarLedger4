// frontend/src/lib/api.js
// Named exports only (no default). Safe env detection for both dev and build.

const envBackend = (() => {
  try {
    // import.meta is valid in ESM; optional chaining keeps this safe in tooling
    return import.meta?.env?.VITE_BACKEND_URL;
  } catch {
    return undefined;
  }
})();

const BASE =
  (typeof window !== "undefined" && window.ENV_BACKEND_URL) ||
  envBackend ||
  "https://lonestarledger2-0.onrender.com"; // fallback; adjust if needed

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
export const getDistrict = (id) =>
  _json(`${BASE}/district/${encodeURIComponent(id)}`);

export const getSchool = (id) =>
  _json(`${BASE}/school/${encodeURIComponent(id)}`);

// --- Geo & lightweight points ---
export const geoDistrictProps = () => _json(`${BASE}/geojson/districts`);
export const campusPoints = () => _json(`${BASE}/campus_points`);

// Expose base for links/debugging
export const apiBase = BASE;
