from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import json

app = FastAPI(title="LoneStarLedger API")

# Permissive CORS for demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

# Resolve repo root: backend/app/main.py -> repo root is parents[2]
REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "data"

# Serve /data/* from repo data directory (so /data/processed/geo/... works)
if DATA_DIR.exists():
    app.mount("/data", StaticFiles(directory=str(DATA_DIR), html=False), name="data")

# Helpers to load json file safely
def load_json_file(p: Path):
    if not p.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {p}")
    try:
        with p.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Explicit endpoints expected by the frontend
@app.get("/geojson/districts.props.geojson")
def get_districts_props():
    fp = DATA_DIR / "processed" / "geo" / "districts.props.geojson"
    data = load_json_file(fp)
    return JSONResponse(content=data)

# (Optional legacy) plain districts collection if your frontend calls /geojson/districts
@app.get("/geojson/districts")
def get_districts_collection():
    # Try props file first; otherwise if you kept a full districts file, adjust here.
    fp = DATA_DIR / "processed" / "geo" / "districts.props.geojson"
    data = load_json_file(fp)
    return JSONResponse(content=data)

# (Optional) demo state stats/summary placeholders if you don't have CSV aggregation wired yet
@app.get("/stats/state")
def stats_state():
    # Put real values later; this prevents 404 during wiring.
    return {"districts": 1017, "spend_total": 0, "avg_per_pupil": 0, "enrollment": 0, "debt_total": 0}

@app.get("/summary/state")
def summary_state():
    return {"ok": True}
