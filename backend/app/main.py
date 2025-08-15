from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from .data_loader import DataLoader

app = FastAPI(title="LoneStarLedger API")

# ---- CORS -------------------------------------------------
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
if CORS_ORIGINS == "*":
    allow_origins = ["*"]
else:
    allow_origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Data -------------------------------------------------
DATA_DIR = os.getenv("DATA_DIR", "../data/raw")
loader = DataLoader(DATA_DIR)

# ---- Utilities -------------------------------------------
@app.get("/")
def root():
    return {"service": "LoneStarLedger API", "ok": True}

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/__routes")
def routes():
    return sorted([getattr(r, "path", "") for r in app.routes])

# ---- Summaries -------------------------------------------
@app.get("/summary")
def summary():
    try:
        s = loader.summary()
        # Always return 200 with a minimal structure so the UI doesn't white-screen
        return s or {
            "district_count": 0,
            "total_enrollment": 0,
            "total_spend": 0,
            "avg_per_pupil_spend": 0,
            "debt_total": 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- Districts / Schools ---------------------------------
@app.get("/districts")
def districts(q: str = "", limit: int = 25, offset: int = 0):
    try:
        return loader.list_districts(q=q, limit=limit, offset=offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/district/{district_6}")
def district_detail(district_6: str):
    try:
        d = loader.get_district(district_6)
        if not d:
            raise HTTPException(status_code=404, detail="District not found")
        return d
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/schools")
def schools(q: str = "", limit: int = 25, offset: int = 0):
    try:
        return loader.list_schools(q=q, limit=limit, offset=offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/school/{campus_9}")
def school_detail(campus_9: str):
    try:
        s = loader.get_school(campus_9)
        if not s:
            raise HTTPException(status_code=404, detail="School not found")
        return s
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- Maps ------------------------------------------------
@app.get("/geojson/districts")
def geojson_districts():
    try:
        return loader.geojson_districts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/geojson/campuses")
def geojson_campuses():
    try:
        return loader.geojson_campuses()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
