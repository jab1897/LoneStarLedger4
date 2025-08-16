const BASE = import.meta.env.VITE_BACKEND_URL || 'https://lonestarledger2-0.onrender.com';

async function _json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  base: BASE,
  summary: () => _json(`${BASE}/summary`),
  searchDistricts: (q, limit=10) => _json(`${BASE}/districts?q=${encodeURIComponent(q)}&limit=${limit}`),
  listDistricts: (limit=50, offset=0) => _json(`${BASE}/districts?limit=${limit}&offset=${offset}`),
  getDistrict: (cdn) => _json(`${BASE}/district/${cdn}`),
  searchSchools: (q, limit=10) => _json(`${BASE}/schools?q=${encodeURIComponent(q)}&limit=${limit}`),
  listSchools: (limit=50, offset=0) => _json(`${BASE}/schools?limit=${limit}&offset=${offset}`),
  getSchool: (id) => _json(`${BASE}/school/${id}`),
  geoDistricts: () => _json(`${BASE}/geojson/districts`),
  geoCampuses: () => _json(`${BASE}/geojson/campuses`),
};
