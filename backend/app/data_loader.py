import csv, json, os, pathlib

def _norm_keys(row):
    return {(k or "").strip().lower(): v for k, v in row.items()}

def _get(row, *keys, default=None):
    r = _norm_keys(row)
    for k in keys:
        if not k: 
            continue
        k = k.strip().lower()
        if k in r and r[k] not in (None, ""):
            return r[k]
    return default

def _num(x, default=0.0):
    try:
        if isinstance(x, (int, float)): return float(x)
        if x is None: return float(default)
        s = str(x).replace(",", "").strip()
        return float(s) if s else float(default)
    except Exception:
        return float(default)

class DataLoader:
    """
    Lightweight, pandas-free loader. Lazy: files are read on first use and cached.
    It tolerates missing files/columns and returns minimal shapes instead of raising.
    """
    def __init__(self, data_dir="../data/raw"):
        self.data_dir = pathlib.Path(data_dir)
        self._districts = None
        self._schools = None
        self._district_index = {}
        self._school_index = {}
        self._summary = None
        self._gj_districts = None
        self._gj_campuses = None

    def _csv(self, name):
        p = self.data_dir / name
        if not p.exists():
            return []
        rows = []
        with p.open("r", encoding="utf-8", errors="ignore", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)
        return rows

    def _read_geojson(self, name):
        p = self.data_dir / name
        if not p.exists() or p.stat().st_size == 0:
            return {"type":"FeatureCollection","features":[]}
        try:
            with p.open("r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"type":"FeatureCollection","features":[]}

    def _ensure_districts(self):
        if self._districts is not None:
            return
        finances = self._csv("Finances.csv")
        debt_map = {
            _get(r, "district_6","district","district id","district_n","distid","isd","lea"): r
            for r in self._csv("ISD GIS Debt.csv")
        }
        districts = []
        for r in finances:
            rid = _get(r, "district_6","district","district id","district_n","distid","isd","lea")
            name = _get(r, "district_name","distname","district name","name","isd_name") or f"District {rid or ''}".strip()
            enroll = _num(_get(r, "enrollment","students","student_count","ada","pupils"), 0)

            total_spend = _num(_get(r, "total_spend","total","total expenditure","function total"), 0)
            if total_spend == 0:
                cat_keys = ["instruction","instructional","support services","general administration",
                            "co-curricular","facilities","debt service","transportation","food service","other"]
                total_spend = sum(_num(_get(r, k), 0) for k in cat_keys)

            per_pupil = _num(_get(r, "per_pupil_spend","per pupil","per-pupil","perstudent"), 0)
            if per_pupil == 0 and enroll > 0:
                per_pupil = total_spend / max(enroll, 1)

            drow = {
                "district_6": str(rid or "").strip(),
                "district_name": name,
                "enrollment": round(enroll),
                "total_spend": round(total_spend),
                "per_pupil_spend": round(per_pupil),
            }
            dd = debt_map.get(drow["district_6"])
            if dd:
                drow["debt_total"] = _num(_get(dd, "debt_total","total_debt","debt","bond debt"), 0)
            districts.append(drow)

        self._districts = districts
        self._district_index = { d["district_6"]: d for d in districts }

    def _ensure_schools(self):
        if self._schools is not None:
            return
        schools = []
        for r in self._csv("Campus Data.csv"):
            campus_id = _get(r, "campus_9","campus","campus id","campus number","campus_num")
            campus_name = _get(r, "campus_name","school","school name","campusname","name") or f"Campus {campus_id or ''}".strip()
            dist_id = _get(r, "district_6","district","lea","distid","district id")
            read_pct = _num(_get(r, "reading_on_grade","reading %","reading_ongrade","reading"), 0)
            math_pct = _num(_get(r, "math_on_grade","math %","math_ongrade","math"), 0)
            schools.append({
                "campus_9": str(campus_id or "").strip(),
                "campus_name": campus_name,
                "district_6": str(dist_id or "").strip(),
                "reading_on_grade": round(read_pct, 1) if read_pct else None,
                "math_on_grade": round(math_pct, 1) if math_pct else None,
            })
        self._schools = schools
        self._school_index = { s["campus_9"]: s for s in schools }

    def summary(self):
        self._ensure_districts()
        if self._summary is not None:
            return self._summary
        dc = len(self._districts)
        total_enroll = sum(d.get("enrollment",0) for d in self._districts)
        total_spend = sum(d.get("total_spend",0) for d in self._districts)
        avg_pp = round(total_spend / max(total_enroll, 1)) if total_enroll else 0
        debt_total = sum(d.get("debt_total",0) for d in self._districts)
        self._summary = {
            "district_count": dc,
            "total_enrollment": total_enroll,
            "total_spend": total_spend,
            "avg_per_pupil_spend": avg_pp,
            "debt_total": round(debt_total),
        }
        return self._summary

    def list_districts(self, q="", limit=25, offset=0):
        self._ensure_districts()
        ql = (q or "").strip().lower()
        rows = self._districts
        if ql:
            rows = [d for d in rows if ql in d.get("district_name","").lower() or ql in d.get("district_6","").lower()]
        total = len(rows)
        items = rows[offset: offset+limit]
        return {"total": total, "limit": limit, "offset": offset, "items": items}

    def get_district(self, district_6):
        self._ensure_districts()
        return self._district_index.get(str(district_6))

    def list_schools(self, q="", limit=25, offset=0):
        self._ensure_schools()
        ql = (q or "").strip().lower()
        rows = self._schools
        if ql:
            rows = [s for s in rows if ql in s.get("campus_name","").lower() or ql in s.get("campus_9","").lower()]
        total = len(rows)
        items = rows[offset: offset+limit]
        return {"total": total, "limit": limit, "offset": offset, "items": items}

    def get_school(self, campus_9):
        self._ensure_schools()
        return self._school_index.get(str(campus_9))

    def geojson_districts(self):
        if self._gj_districts is None:
            self._gj_districts = self._read_geojson("Current_Districts_2025.geojson")
        return self._gj_districts

    def geojson_campuses(self):
        if self._gj_campuses is None:
            self._gj_campuses = self._read_geojson("Schools_2024_to_2025.geojson")
        return self._gj_campuses
