from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from functools import lru_cache
import os, json, math

DATA_DIR = os.getenv("DATA_DIR", "data/raw")
PROC_DIR = "data/processed/geo"

app = FastAPI(title="LoneStarLedger API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGINS", "*")],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1024)

def _load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _choose(*paths):
    for p in paths:
        if os.path.exists(p):
            return p
    return None

@lru_cache(maxsize=1)
def _load_campuses_points():
    src = os.path.join(PROC_DIR, "campuses.points.json")
    if not os.path.exists(src):
        return []
    with open(src, "r", encoding="utf-8") as f:
        return json.load(f)  # [{lat,lon,campus_9,school_name,district_6}]

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/geojson/districts")
def geo_districts():
    src = _choose(os.path.join(PROC_DIR, "districts.props.geojson"),
                  os.path.join(DATA_DIR, "Current_Districts_2025.geojson"))
    if not src:
        raise HTTPException(404, "Districts GeoJSON not found")
    return JSONResponse(_load_json(src), headers={"Cache-Control": "public, max-age=86400"})

@app.get("/geojson/campuses")
def geo_campuses_full():
    src = _choose(os.path.join(PROC_DIR, "campuses.props.geojson"),
                  os.path.join(DATA_DIR, "Schools_2024_to_2025.geojson"))
    if not src:
        raise HTTPException(404, "Campuses GeoJSON not found")
    return JSONResponse(_load_json(src), headers={"Cache-Control": "public, max-age=86400"})

@app.get("/geojson/campuses_points")
def campuses_points(bbox: str | None = Query(None, description="west,south,east,north (lon,lat)")):
    items = _load_campuses_points()
    if not items:
        raise HTTPException(503, "Campuses points not ready")
    res = items
    if bbox:
        try:
            west, south, east, north = [float(v) for v in bbox.split(",")]
        except Exception:
            raise HTTPException(400, "Invalid bbox format. Use west,south,east,north")
        res = [p for p in items if (west <= p["lon"] <= east and south <= p["lat"] <= north)]
    return JSONResponse(res, headers={"Cache-Control": "public, max-age=300"})

@app.get("/geojson/campuses_bins")
def campuses_bins(
    bbox: str = Query(..., description="west,south,east,north (lon,lat)"),
    zoom: int = Query(9, ge=0, le=22, description="Map zoom level (int)")
):
    items = _load_campuses_points()
    if not items:
        raise HTTPException(503, "Campuses points not ready")

    try:
        west, south, east, north = [float(v) for v in bbox.split(",")]
    except Exception:
        raise HTTPException(400, "Invalid bbox format. Use west,south,east,north")

    # Filter to bbox first
    pts = [p for p in items if (west <= p["lon"] <= east and south <= p["lat"] <= north)]
    if not pts:
        return JSONResponse([], headers={"Cache-Control": "public, max-age=120"})

    # Dynamic grid size by zoom -> coarser at low zooms; finer as you zoom in
    # Keeps bins under ~1000 in normal metros
    if zoom <= 8:
        grid = 24
    elif zoom == 9:
        grid = 32
    elif zoom == 10:
        grid = 48
    elif zoom == 11:
        grid = 64
    else:
        grid = 80  # still used if someone calls bins at high zoom

    lon_span = max(east - west, 1e-6)
    lat_span = max(north - south, 1e-6)
    lon_cell = lon_span / grid
    lat_cell = lat_span / grid

    bins = {}
    for p in pts:
        gx = int((p["lon"] - west) / lon_cell)
        gy = int((p["lat"] - south) / lat_cell)
        key = (gx, gy)
        b = bins.get(key)
        if b is None:
            bins[key] = {"count": 1, "sum_lat": p["lat"], "sum_lon": p["lon"]}
        else:
            b["count"] += 1
            b["sum_lat"] += p["lat"]
            b["sum_lon"] += p["lon"]

    # Centroid per bin
    out = []
    for (gx, gy), b in bins.items():
        c = b["count"]
        lat = b["sum_lat"] / c
        lon = b["sum_lon"] / c
        out.append({"lat": lat, "lon": lon, "count": c})

    # Optional: cap the bins to avoid clutter (keep the densest up to 1,200 bins)
    out.sort(key=lambda x: x["count"], reverse=True)
    if len(out) > 1200:
        out = out[:1200]

    return JSONResponse(out, headers={"Cache-Control": "public, max-age=120"})
