# backend/app/main.py
import os, csv, json, re, time, io
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Query, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse

# ------------ config ------------
DATA_DIR = os.getenv("DATA_DIR", "../data/raw")
CORS = os.getenv("CORS_ORIGINS", "*")

app = FastAPI(title="LoneStarLedger API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS.split(",")] if CORS != "*" else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------ tiny utils ------------
def _norm_keys(row: Dict[str, Any]) -> Dict[str, Any]:
    return {(k or "").strip().lower(): v for k, v in row.items()}

def _get(row: Dict[str, Any], *keys, default=None):
    r = _norm_keys(row)
    for k in keys:
        k = (k or "").strip().lower()
        if k and (k in r) and r[k] not in (None, ""):
            return r[k]
    return default

def _num(x, default=0.0) -> float:
    try:
        if isinstance(x, (int, float)): return float(x)
        s = "" if x is None else str(x)
        s = s.replace(",", "").strip()
        return float(s) if s else float(default)
    except Exception:
        return float(default)

def _read_csv(path) -> List[Dict[str, Any]]:
    rows = []
    if not os.path.exists(path): return rows
    with open(path, "r", encoding="utf-8", errors="ignore", newline="") as f:
        reader = csv.DictReader(f)
        for r in reader: rows.append(r)
    return rows

def _read_geo(path) -> Dict[str, Any]:
    if not os.path.exists(path):
        return {"type": "FeatureCollection", "features": []}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# ------------ data cache ------------
_cache = {
    "districts": None,  # list of dict
    "schools": None,    # list of dict
    "geo_districts": None,
    "geo_campuses": None,
    "by_district": {},
    "by_school": {},
    "loaded_at": None,
}

def _load_all():
    # CSV sources (your Phase 6 files also work; we’ll read raw CSVs for now)
    fin_path   = os.path.join(DATA_DIR, "Finances.csv")
    debt_path  = os.path.join(DATA_DIR, "ISD GIS Debt.csv")
    campus_path= os.path.join(DATA_DIR, "Campus Data.csv")

    finances = _read_csv(fin_path)
    debt     = _read_csv(debt_path)
    campus   = _read_csv(campus_path)

    # debt map
    debt_map = {
        str(_get(r, "district_6","district","district id","district_n","distid","lea") or "").strip(): r
        for r in debt
    }

    districts = []
    for r in finances:
        did   = str(_get(r, "district_6","district","district id","district_n","distid","lea") or "").strip()
        name  = _get(r, "district_name","distname","district name","name","isd_name") or f"District {did}".strip()
        enroll= _num(_get(r, "enrollment","students","student_count","ada","pupils"), 0)
        total = _num(_get(r, "total_spend","total","total expenditure","function total"), 0)
        if total == 0:
            cat_keys = ["instruction","instructional","support services","general administration",
                        "co-curricular","facilities","debt service","transportation","food service","other"]
            total = sum(_num(_get(r, k), 0) for k in cat_keys)
        per_pupil = _num(_get(r, "per_pupil_spend","per pupil","per-pupil","perstudent"), 0)
        if per_pupil == 0 and enroll > 0:
            per_pupil = total / max(enroll, 1)
        row = {
            "district_6": did,
            "district_name": name,
            "enrollment": round(enroll),
            "total_spend": round(total),
            "per_pupil_spend": round(per_pupil),
        }
        d = debt_map.get(did)
        if d:
            row["debt_total"] = round(_num(_get(d, "debt_total","total_debt","debt","bond debt"), 0))
        districts.append(row)

    schools = []
    for r in campus:
        cid   = str(_get(r, "campus_9","campus","campus id","campus number","campus_num") or "").strip()
        name  = _get(r, "campus_name","school","school name","campusname","name") or f"Campus {cid}".strip()
        did   = str(_get(r, "district_6","district","lea","distid","district id") or "").strip()
        readp = _num(_get(r, "reading_on_grade","reading %","reading_ongrade","reading"), 0)
        mathp = _num(_get(r, "math_on_grade","math %","math_ongrade","math"), 0)
        schools.append({
            "campus_9": cid,
            "campus_name": name,
            "district_6": did,
            "reading_on_grade": round(readp,1) if readp else None,
            "math_on_grade": round(mathp,1) if mathp else None,
        })

    # GeoJSON preference: use processed/trimmed if available, else raw
    proc_geo = os.path.join(os.path.dirname(DATA_DIR), "processed", "geo")
    gd_proc = os.path.join(proc_geo, "districts.props.geojson")
    gc_proc = os.path.join(proc_geo, "campuses.props.geojson")
    gd_raw  = os.path.join(DATA_DIR, "Current_Districts_2025.geojson")
    gc_raw  = os.path.join(DATA_DIR, "Schools_2024_to_2025.geojson")

    geo_districts = _read_geo(gd_proc if os.path.exists(gd_proc) else gd_raw)
    geo_campuses  = _read_geo(gc_proc if os.path.exists(gc_proc) else gc_raw)

    by_d = {d["district_6"]: d for d in districts if d.get("district_6")}
    by_s = {s["campus_9"]  : s for s in schools   if s.get("campus_9")}

    _cache.update({
        "districts": districts,
        "schools": schools,
        "geo_districts": geo_districts,
        "geo_campuses": geo_campuses,
        "by_district": by_d,
        "by_school": by_s,
        "loaded_at": int(time.time()),
    })

def _ensure_loaded():
    if _cache["districts"] is None: _load_all()

_ensure_loaded()

# ------------ helpers (filter/paging) ------------
def _fuzzy_match(text: str, q: str) -> bool:
    return q.lower() in text.lower()

def _paginate(items: List[Dict[str, Any]], limit: int, offset: int):
    return items[offset: offset + limit]

# ------------ routes ------------
@app.get("/")
def root():
    return {"service": "LoneStarLedger API", "ok": True, "loaded_at": _cache["loaded_at"]}

@app.get("/__routes")
def __routes(req: Request):
    return [{"path": r.path, "methods": list(r.methods)} for r in app.router.routes]

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/summary")
def summary():
    _ensure_loaded()
    districts = _cache["districts"]
    total_enroll = sum(d.get("enrollment",0) for d in districts)
    total_spend  = sum(d.get("total_spend",0) for d in districts)
    avg_pp       = round(total_spend / max(total_enroll, 1)) if total_enroll else 0
    debt_total   = sum(d.get("debt_total",0) for d in districts)
    return {
        "district_count": len(districts),
        "total_enrollment": total_enroll,
        "total_spend": total_spend,
        "avg_per_pupil_spend": avg_pp,
        "debt_total": debt_total
    }

@app.get("/districts")
def districts(
    q: Optional[str] = Query(default=None, description="fuzzy name match"),
    min_per_pupil: Optional[float] = None,
    max_per_pupil: Optional[float] = None,
    limit: int = 50,
    offset: int = 0
):
    _ensure_loaded()
    items = _cache["districts"]
    if q:
        items = [d for d in items if _fuzzy_match(d.get("district_name",""), q)]
    if min_per_pupil is not None:
        items = [d for d in items if (d.get("per_pupil_spend") or 0) >= min_per_pupil]
    if max_per_pupil is not None:
        items = [d for d in items if (d.get("per_pupil_spend") or 0) <= max_per_pupil]
    total = len(items)
    return {"total": total, "items": _paginate(items, limit, offset)}

@app.get("/district/{district_6}")
def get_district(district_6: str):
    _ensure_loaded()
    d = _cache["by_district"].get(district_6)
    if not d: raise HTTPException(status_code=404, detail="District not found")
    return d

@app.get("/schools")
def schools(
    q: Optional[str] = Query(default=None, description="fuzzy campus name match"),
    min_reading: Optional[float] = None,
    min_math: Optional[float] = None,
    limit: int = 50,
    offset: int = 0
):
    _ensure_loaded()
    items = _cache["schools"]
    if q:
        items = [s for s in items if _fuzzy_match(s.get("campus_name",""), q)]
    if min_reading is not None:
        items = [s for s in items if (s.get("reading_on_grade") or 0) >= min_reading]
    if min_math is not None:
        items = [s for s in items if (s.get("math_on_grade") or 0) >= min_math]
    total = len(items)
    return {"total": total, "items": _paginate(items, limit, offset)}

@app.get("/school/{campus_9}")
def get_school(campus_9: str):
    _ensure_loaded()
    s = _cache["by_school"].get(campus_9)
    if not s: raise HTTPException(status_code=404, detail="School not found")
    return s

@app.get("/geojson/districts")
def geojson_districts():
    _ensure_loaded()
    return JSONResponse(_cache["geo_districts"])

@app.get("/geojson/campuses")
def geojson_campuses():
    _ensure_loaded()
    return JSONResponse(_cache["geo_campuses"])

# ------------ newsletter capture ------------
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

@app.post("/newsletter")
def newsletter_signup(payload: Dict[str, Any] = Body(...), request: Request = None):
    email = (payload.get("email") or "").strip()
    name  = (payload.get("name") or "").strip()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Invalid email")

    row = {
        "email": email,
        "name": name,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "ua": request.headers.get("user-agent") if request else ""
    }

    out_path = "/tmp/newsletter.csv"  # ephemeral but fine for prototype
    file_exists = os.path.exists(out_path)
    with open(out_path, "a", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["email","name","created_at","ua"])
        if not file_exists: w.writeheader()
        w.writerow(row)

    return {"ok": True}

@app.get("/newsletter/export")
def newsletter_export():
    out_path = "/tmp/newsletter.csv"
    if not os.path.exists(out_path):
        return PlainTextResponse("", media_type="text/csv")
    with open(out_path, "r", encoding="utf-8") as f:
        content = f.read()
    return PlainTextResponse(content, media_type="text/csv")
