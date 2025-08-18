from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Tuple, Dict, Any
from functools import lru_cache
import os, json, math

DATA_DIR = os.environ.get("DATA_DIR", "../data/raw")
PROC_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed", "geo"))
RAW_DIR  = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw"))

app = FastAPI(title="LoneStarLedger API", version="0.2")

# CORS
cors_origins = os.environ.get("CORS_ORIGINS", "*")
if cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [o.strip() for o in cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------- lazy loaders ---------

def _load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@lru_cache(maxsize=1)
def load_districts_geo() -> Dict:
    path = os.path.join(PROC_DIR, "districts.props.geojson")
    if not os.path.exists(path): raise FileNotFoundError(path)
    return _load_json(path)

@lru_cache(maxsize=1)
def load_campuses_geo() -> Dict:
    path = os.path.join(PROC_DIR, "campuses.props.geojson")
    if not os.path.exists(path): raise FileNotFoundError(path)
    return _load_json(path)

@lru_cache(maxsize=1)
def load_campus_points() -> List[Dict[str, Any]]:
    """
    Lightweight points-only dataset produced in Phase 8 (campuses.points.json).
    Each row: {"lat": float, "lon": float, "district_6": str, "campus_9": str, "name": str}
    """
    path = os.path.join(PROC_DIR, "campuses.points.json")
    if not os.path.exists(path):
        # graceful fallback from polygons if needed
        geo = load_campuses_geo()
        pts = []
        for ft in geo.get("features", []):
            props = ft.get("properties", {})
            bbox = ft.get("bbox")
            if bbox and len(bbox) >= 4:
                west, south, east, north = bbox[:4]
                lon = (west + east) / 2.0
                lat = (south + north) / 2.0
            else:
                lon, lat = -99.0, 31.0
            pts.append({
                "lat": lat, "lon": lon,
                "district_6": str(props.get("district_6", "")),
                "campus_9": str(props.get("campus_9", "")),
                "name": props.get("school_name") or props.get("name") or "Campus"
            })
        return pts
    return _load_json(path)

# --------- simple tabulars (placeholder; derived from props) ---------

def _district_rows() -> List[Dict[str, Any]]:
    feats = load_districts_geo().get("features", [])
    rows = []
    for ft in feats:
        p = ft.get("properties", {})
        rows.append({
            "district_6": p.get("district_6"),
            "district_name": p.get("name") or p.get("DISTNAME") or "District",
            "enrollment": None,
            "total_spend": None,
            "per_pupil_spend": None
        })
    return rows

def _campus_rows(limit: int = 1000) -> List[Dict[str, Any]]:
    feats = load_campuses_geo().get("features", [])
    out = []
    for ft in feats[:limit]:
        p = ft.get("properties", {})
        out.append({
            "campus_9": p.get("campus_9"),
            "campus_name": p.get("school_name") or p.get("name") or "School",
            "district_6": p.get("district_6"),
            "reading_on_grade": None,
            "math_on_grade": None
        })
    return out

# --------- endpoints ---------

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/summary")
def summary():
    d = _district_rows()
    return {
        "district_count": len(d),
        "total_enrollment": None,
        "total_spend": None,
        "avg_per_pupil_spend": None,
        "debt_total": None,
    }

@app.get("/districts")
def list_districts(q: Optional[str] = None, limit: int = 50, offset: int = 0):
    rows = _district_rows()
    if q:
        ql = q.lower()
        rows = [r for r in rows if ql in (r["district_name"] or "").lower()]
    return {"items": rows[offset: offset+limit], "total": len(rows)}

@app.get("/schools")
def list_schools(q: Optional[str] = None, limit: int = 50, offset: int = 0):
    rows = _campus_rows(limit=100000)
    if q:
        ql = q.lower()
        rows = [r for r in rows if ql in (r["campus_name"] or "").lower()]
    return {"items": rows[offset: offset+limit], "total": len(rows)}

@app.get("/geojson/districts")
def geo_districts():
    return load_districts_geo()

@app.get("/geojson/campuses")
def geo_campuses():
    return load_campuses_geo()

def _bin_size_for_zoom(z: int) -> Tuple[float, float]:
    z = min(max(z, 5), 13)
    table = {
        5: (1.2, 1.2),
        6: (0.8, 0.8),
        7: (0.4, 0.4),
        8: (0.20, 0.20),
        9: (0.10, 0.10),
        10: (0.05, 0.05),
        11: (0.025, 0.025),
        12: (0.012, 0.012),
        13: (0.006, 0.006),
    }
    return table[z]

@app.get("/geojson/campuses_bins")
def campuses_bins(
    bbox: str = Query(..., description="west,south,east,north"),
    zoom: int = Query(9, ge=1, le=20)
):
    try:
        west, south, east, north = [float(x) for x in bbox.split(",")]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid bbox; expected 'west,south,east,north'")

    lon_step, lat_step = _bin_size_for_zoom(zoom)
    pts = load_campus_points()

    # filter by bbox
    filtered = [p for p in pts if (west <= p["lon"] <= east and south <= p["lat"] <= north)]
    if not filtered:
        return {"type": "FeatureCollection", "features": []}

    # binning
    bins = {}  # (ix,iy) -> {"count": n, "lon": cen_lon, "lat": cen_lat}
    for p in filtered:
        ix = math.floor((p["lon"] - west) / lon_step)
        iy = math.floor((p["lat"] - south) / lat_step)
        key = (ix, iy)
        if key not in bins:
            bin_w = west + ix * lon_step
            bin_s = south + iy * lat_step
            cen_lon = bin_w + lon_step / 2
            cen_lat = bin_s + lat_step / 2
            bins[key] = {"count": 0, "lon": cen_lon, "lat": cen_lat}
        bins[key]["count"] += 1

    features = [{
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [b["lon"], b["lat"]]},
        "properties": {"count": b["count"]}
    } for b in bins.values()]

    return {"type": "FeatureCollection", "features": features}


# ---- Statewide summary (very light) -----------------------------------------
@app.get("/stats/state")
def stats_state():
    """
    Returns lightweight statewide stats.
    - districts_count from processed GeoJSON if present
    - campuses_count from campuses.points.json if present
    - spend/per_pupil/debt left as None until CSV aggregation is wired
    """
    import json, os
    base = Path(__file__).resolve().parent.parent.parent / "data" / "processed"
    geo = base / "geo"

    districts_count = None
    campuses_count = None

    try:
        p = geo / "districts.props.geojson"
        if p.exists():
            with p.open("r", encoding="utf-8") as f:
                gj = json.load(f)
            districts_count = len(gj.get("features", []))
    except Exception:
        pass

    try:
        p = base / "campuses.points.json"
        if p.exists():
            with p.open("r", encoding="utf-8") as f:
                rows = json.load(f)
            campuses_count = len(rows) if isinstance(rows, list) else None
    except Exception:
        pass

    return {
        "districts_count": districts_count,
        "campuses_count": campuses_count,
        "total_spend": None,     # wire from CSV later
        "per_pupil": None,       # wire from CSV later
        "debt_total": None       # wire from CSV later
    }
