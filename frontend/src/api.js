const BASE = import.meta.env.VITE_BACKEND_URL || 'https://lonestarledger2-0.onrender.com';

function qs(params = {}) {
  const u = new URLSearchParams()
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== '') u.append(k, v)
  })
  return u.toString()
}

async function _json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  base: BASE,
  summary: () => _json(`${BASE}/summary`),

  // Districts
  searchDistricts: (q, limit=10, extra={}) =>
    _json(`${BASE}/districts?${qs({q, limit, ...extra})}`),
  listDistricts: (limit=50, offset=0, extra={}) =>
    _json(`${BASE}/districts?${qs({limit, offset, ...extra})}`),
  getDistrict: (cdn) => _json(`${BASE}/district/${cdn}`),

  // Schools
  searchSchools: (q, limit=10, extra={}) =>
    _json(`${BASE}/schools?${qs({q, limit, ...extra})}`),
  listSchools: (limit=50, offset=0, extra={}) =>
    _json(`${BASE}/schools?${qs({limit, offset, ...extra})}`),
  getSchool: (id) => _json(`${BASE}/school/${id}`),

  // Map
  geoDistricts: () => _json(`${BASE}/geojson/districts`),
  geoCampuses: () => _json(`${BASE}/geojson/campuses`),
};
