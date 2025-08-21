// frontend/src/lib/api.js
// Named exports only (no default). Resilient base detection that prefers
// same-origin (Vercel rewrites) and falls back to Render if not present.

const envBackend = (() => {
  try { return import.meta?.env?.VITE_BACKEND_URL; } catch { return undefined; }
})();

// Prefer same-origin on Vercel (so /api/* rewrites proxy to Render).
let BASE = "https://lonestarledger2-0.onrender.com";
try {
  if (typeof window !== "undefined") {
    if (typeof window.ENV_BACKEND_URL !== "undefined") {
      BASE = window.ENV_BACKEND_URL; // can be "" to force same-origin
    } else if (window.location?.hostname?.includes("vercel.app")) {
      BASE = ""; // use relative /api/* on Vercel
    }
  }
} catch {}
if (envBackend) BASE = envBackend;

async function _json(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

async function _jsonTry(paths) {
  let lastErr;
  for (const p of paths) {
    try { return await _json(`${BASE}${p}`); }
    catch (e) {
      lastErr = e;
      if (!String(e?.message || "").includes("HTTP 404")) break;
    }
  }
  throw lastErr;
}

async function deriveSummary() {
  try {
    const [geo, points] = await Promise.all([
      _jsonTry(["/geojson/districts", "/api/geojson/districts"]).catch(() => null),
      _jsonTry(["/campus_points", "/api/campus_points"]).catch(() => null),
    ]);

    const totalDistricts = Array.isArray(geo?.features) ? geo.features.length
      : Array.isArray(geo) ? geo.length : 0;

    const campusArray = Array.isArray(points) ? points
      : Array.isArray(points?.features) ? points.features.map(f => f?.properties || {})
      : [];

    const totalCampuses = campusArray.length;
    const totalStudents = campusArray.reduce((s, p) =>
      s + (Number(p.students) || Number(p.total_students) || Number(p.enrollment) || 0), 0);

    return { totalDistricts, totalCampuses, totalStudents };
  } catch {
    return { totalDistricts: 0, totalCampuses: 0, totalStudents: 0 };
  }
}

// --- Summary & lists ---
export const summary = async () => {
  try { return await _jsonTry(["/summary", "/api/summary"]); }
  catch (e) {
    if (String(e?.message || "").includes("HTTP 404")) return deriveSummary();
    throw e;
  }
};

export const listDistricts = (limit = 50, offset = 0, q) => {
  const qs = new URLSearchParams({ limit, offset }); if (q) qs.set("q", q);
  const query = `?${qs.toString()}`;
  return _jsonTry([`/districts${query}`, `/api/districts${query}`]);
};

export const listSchools = (limit = 50, offset = 0, q) => {
  const qs = new URLSearchParams({ limit, offset }); if (q) qs.set("q", q);
  const query = `?${qs.toString()}`;
  return _jsonTry([`/schools${query}`, `/api/schools${query}`]);
};

// --- Single records ---
export const getDistrict = (id) =>
  _jsonTry([`/district/${encodeURIComponent(id)}`, `/api/district/${encodeURIComponent(id)}`]);
export const getSchool = (id) =>
  _jsonTry([`/school/${encodeURIComponent(id)}`, `/api/school/${encodeURIComponent(id)}`]);

// --- Geo & points ---
export const geoDistrictProps = () =>
  _jsonTry(["/geojson/districts", "/api/geojson/districts"]);
export const campusPoints = () =>
  _jsonTry(["/campus_points", "/api/campus_points"]);

// For debugging in UI
export const apiBase = BASE;
