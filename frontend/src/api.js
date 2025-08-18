const BASE = import.meta.env.VITE_BACKEND_URL || 'https://lonestarledger2-0.onrender.com';

async function _json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function _tryJson(urls) {
  for (const u of urls) {
    try { return await _json(u); } catch (e) {}
  }
  throw new Error('All campus points endpoints failed');
}

export const api = {
  base: BASE,

  // state-wide
  summary: () => _json(`${BASE}/summary`),

  // search/list (kept for future pages)
  searchDistricts: (q, limit=10) => _json(`${BASE}/districts?q=${encodeURIComponent(q)}&limit=${limit}`),
  listDistricts: (limit=50, offset=0) => _json(`${BASE}/districts?limit=${limit}&offset=${offset}`),
  getDistrict: (id) => _json(`${BASE}/district/${id}`),

  searchSchools: (q, limit=10) => _json(`${BASE}/schools?q=${encodeURIComponent(q)}&limit=${limit}`),
  listSchools: (limit=50, offset=0) => _json(`${BASE}/schools?limit=${limit}&offset=${offset}`),
  getSchool: (id) => _json(`${BASE}/school/${id}`),

  // maps
  geoDistricts: () => _json(`${BASE}/geojson/districts`),
  geoCampuses: () => _json(`${BASE}/geojson/campuses`),

  // fast points (multiple fallbacks)
  campusPoints: () => _tryJson([
    `${BASE}/geo/campuses/points`,
    `${BASE}/campuses/points`,
    `${BASE}/geojson/campuses/points`,
    `${BASE}/campus_points`,
  ]),
};
