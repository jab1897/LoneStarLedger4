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
  throw new Error('All endpoints failed');
}

export const api = {
  base: BASE,

  // statewide summary (if available)
  summary: () => _tryJson([
    `${BASE}/summary`,
    `${BASE}/state/summary`,
  ]),

  // search + detail (kept for future)
  searchDistricts: (q, limit=10) => _json(`${BASE}/districts?q=${encodeURIComponent(q)}&limit=${limit}`),
  listDistricts: (limit=50, offset=0) => _json(`${BASE}/districts?limit=${limit}&offset=${offset}`),
  getDistrict: (id) => _tryJson([
    `${BASE}/district/${id}`,
    `${BASE}/districts/${id}`,
  ]),
  searchSchools: (q, limit=10) => _json(`${BASE}/schools?q=${encodeURIComponent(q)}&limit=${limit}`),
  getSchool: (id) => _tryJson([
    `${BASE}/school/${id}`,
    `${BASE}/schools/${id}`,
  ]),

  // maps
  geoDistricts: () => _tryJson([
    `${BASE}/geojson/districts`,
    `${BASE}/geojson/districts.props`,
    `${BASE}/geojson/districts.props.geojson`,
    `${BASE}/geo/districts`,
    `${BASE}/districts.geojson`,
  ]),
  geoCampuses: () => _tryJson([
    `${BASE}/geojson/campuses`,
    `${BASE}/geojson/campuses.props`,
    `${BASE}/geojson/campuses.props.geojson`,
    `${BASE}/geo/campuses`,
    `${BASE}/campuses.geojson`,
  ]),

  // pre-baked fast points
  campusPoints: () => _tryJson([
    `${BASE}/geo/campuses/points`,
    `${BASE}/campuses/points`,
    `${BASE}/geojson/campuses/points`,
    `${BASE}/campus_points`
  ]),
};
