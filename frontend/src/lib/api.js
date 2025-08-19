// Unified API with graceful fallbacks to public data
const API_BASE = "/api";

// small helper
async function getJSON(url) {
  const r = await fetch(url, { credentials: "omit" });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}
async function firstGood(urls) {
  let lastErr;
  for (const u of urls) {
    try { return await getJSON(u); } catch(e){ lastErr = e; }
  }
  throw lastErr || new Error("No sources succeeded");
}

/** GeoJSON of districts with {id,name} in properties */
export async function geoDistrictProps() {
  return firstGood([
    `${API_BASE}/geo/districts.props`,
    "/data/processed/geo/districts.props.geojson"
  ]);
}

/** GeoJSON of campus points with {id,name} in properties */
export async function geoCampusPoints() {
  return firstGood([
    `${API_BASE}/geo/campuses.points`,
    "/data/processed/geo/campuses.points.geojson"
  ]);
}

/** Optional high-level stats for the landing snapshot */
export async function stateSummary() {
  return firstGood([
    `${API_BASE}/summary/state`,
    `${API_BASE}/stats/state`
  ]);
}

/** Lightweight search list composed from the geo fallbacks */
export async function searchIndex() {
  const [d, c] = await Promise.allSettled([geoDistrictProps(), geoCampusPoints()]);
  const out = [];
  if (d.status === "fulfilled") {
    for (const f of d.value.features || []) {
      const p = f.properties || {};
      out.push({ type:"district", id: p.id ?? p.DISTRICT_ID ?? p.GEOID, name: p.name ?? p.NAME ?? "Unknown district" });
    }
  }
  if (c.status === "fulfilled") {
    for (const f of c.value.features || []) {
      const p = f.properties || {};
      out.push({ type:"campus", id: p.id ?? p.CAMPUS_ID, name: p.name ?? p.NAME ?? "Unknown campus", districtId: p.district_id ?? p.DISTRICT_ID });
    }
  }
  return out;
}
