from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from .config import settings
from .data_loader import DataStore, _to_6, _to_9

app = FastAPI(title="LoneStarLedger API", default_response_class=ORJSONResponse)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",")] if settings.cors_origins else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load data once
store = DataStore(settings.data_dir)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/summary")
def summary():
    return store.summary()

@app.get("/districts")
def districts(q: str | None = None, limit: int = 50, offset: int = 0):
    limit = max(1, min(limit, 200))
    return {"items": store.districts_list(q, limit, offset), "limit": limit, "offset": offset}

@app.get("/district/{cdn}")
def district_detail(cdn: str):
    out = store.district_detail(cdn)
    if not out:
        raise HTTPException(status_code=404, detail="district not found")
    return out

@app.get("/schools")
def schools(q: str | None = None, district: str | None = None, limit: int = 50, offset: int = 0):
    limit = max(1, min(limit, 200))
    return {"items": store.schools_list(q, district, limit, offset), "limit": limit, "offset": offset}

@app.get("/school/{campus_id}")
def school_detail(campus_id: str):
    out = store.school_detail(campus_id)
    if not out:
        raise HTTPException(status_code=404, detail="school not found")
    return out

@app.get("/geojson/districts")
def geojson_districts():
    return store.districts_geo()

@app.get("/geojson/campuses")
def geojson_campuses():
    return store.schools_geo()
