from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from .data_loader import DataLoader

app = FastAPI(title="LoneStarLedger API")

# ---- CORS ----
origins_env = os.getenv("CORS_ORIGINS", "*")
allow_origins = ["*"] if origins_env == "*" else [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

DATA_DIR = os.getenv("DATA_DIR", "../data/raw")
loader = DataLoader(DATA_DIR)

@app.get("/")
def root():
    return {"service": "LoneStarLedger API", "ok": True}

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/__routes")
def routes():
    return sorted([getattr(r, "path", "") for r in app.routes])

@app.get("/summary")
def summary():
    try:
        return loader.summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/districts")
def districts(q: str = "", limit: int = 25, offset: int = 0):
    try:
        return loader.list_districts(q=q, limit=limit, offset=offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/district/{district_6}")
def district_detail(district_6: str):
    d = loader.get_district(district_6)
    if not d:
        raise HTTPException(status_code=404, detail="District not found")
    return d

@app.get("/schools")
def schools(q: str = "", limit: int = 25, offset: int = 0):
    try:
        return loader.list_schools(q=q, limit=limit, offset=offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/school/{campus_9}")
def school_detail(campus_9: str):
    s = loader.get_school(campus_9)
    if not s:
        raise HTTPException(status_code=404, detail="School not found")
    return s

@app.get("/geojson/districts")
def geojson_districts():
    return loader.geojson_districts()

@app.get("/geojson/campuses")
def geojson_campuses():
    return loader.geojson_campuses()
