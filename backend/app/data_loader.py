import json
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd

def _to_6(cdn) -> str:
    """normalize district number to 6 digits as a string"""
    if pd.isna(cdn):
        return ""
    s = str(cdn).strip()
    if s.startswith("'"):
        s = s[1:]
    s = s.replace(".0","")
    s = "".join(ch for ch in s if ch.isdigit())
    return s.zfill(6)[-6:]

def _to_9(campus) -> str:
    """normalize campus number to 9 digits as a string (6 digit district + 3 digit campus)"""
    if pd.isna(campus):
        return ""
    s = str(campus).strip()
    if s.startswith("'"):
        s = s[1:]
    s = s.replace(".0","")
    s = "".join(ch for ch in s if ch.isdigit())
    return s.zfill(9)[-9:]

class DataStore:
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self._load_all()

    def _load_all(self):
        # csvs
        campus_csv = self.data_dir / "Campus Data.csv"
        finances_csv = self.data_dir / "Finances.csv"
        debt_csv = self.data_dir / "ISD GIS Debt.csv"
        salary_csv = self.data_dir / "Staff Salary.csv"
        # geojson
        districts_geo = self.data_dir / "Current_Districts_2025.geojson"
        schools_geo = self.data_dir / "Schools_2024_to_2025.geojson"

        # campuses (performance metrics)
        camp = pd.read_csv(campus_csv)
        camp["campus_9"] = camp["School Number"].apply(_to_9)
        camp["district_6"] = camp["District Number"].apply(_to_6)
        camp = camp.rename(columns={
            "Campus Name": "campus_name",
            "District Name2": "district_name",
            "Reading On Grade-Level": "reading_on_grade",
            "Math On Grade-Level2": "math_on_grade"
        })
        self.campuses_df = camp[[
            "campus_9","CampusTrim","campus_name","district_6","District_N","district_name",
            "reading_on_grade","math_on_grade"
        ]].copy()

        # finances
        fin = pd.read_csv(finances_csv)
        fin["district_6"] = fin["DISTRICT_N"].apply(_to_6)
        fin = fin.rename(columns={
            "District": "district_name",
            "Teacher Compensation": "teacher_comp",
            "Non-Teacher Compensation": "non_teacher_comp",
            "Capital Outlay & Debt Service": "capital_outlay_debt",
            "Other Operating Expenses": "other_ops",
            "Total": "total_spend",
            "Enrollment": "enrollment",
            "Per-Pupil": "per_pupil_spend",
            "Recapture": "recapture"
        })
        self.finances_df = fin[[
            "district_6","district_name","teacher_comp","non_teacher_comp","capital_outlay_debt",
            "other_ops","recapture","total_spend","enrollment","per_pupil_spend"
        ]].copy()

        # debt
        debt = pd.read_csv(debt_csv)
        debt["district_6"] = debt["DISTRICT_N"].apply(_to_6)
        debt = debt.rename(columns={"Debt":"debt_total","Per-Pupil Debt":"per_pupil_debt"})
        self.debt_df = debt[["district_6","debt_total","per_pupil_debt"]].copy()

        # staff salaries
        sal = pd.read_csv(salary_csv)
        sal["district_6"] = sal["District_N"].apply(_to_6)
        sal = sal.rename(columns={
            "Average Teacher Pay":"avg_teacher_pay",
            "Average Superintendent Pay":"avg_superintendent_pay",
            "Average AD Pay":"avg_ad_pay"
        })
        self.salary_df = sal[["district_6","avg_teacher_pay","avg_superintendent_pay","avg_ad_pay"]].copy()

        # geojson raw
        self.districts_geojson = json.loads(Path(districts_geo).read_text(encoding="utf-8"))
        self.schools_geojson_raw = json.loads(Path(schools_geo).read_text(encoding="utf-8"))

        # trim school geojson to small properties and normalized ids
        features = []
        for ft in self.schools_geojson_raw.get("features", []):
            props = ft.get("properties", {})
            campus_9 = _to_9(props.get("USER_School_Number", ""))
            if not campus_9:
                continue
            features.append({
                "type": "Feature",
                "properties": {
                    "campus_9": campus_9,
                    "school_name": props.get("USER_School_Name", ""),
                    "district_6": _to_6(props.get("USER_District_Number", props.get("USER_NCES_District_ID","")))
                },
                "geometry": ft.get("geometry")
            })
        self.schools_geojson = {"type":"FeatureCollection","features":features}

        # build district index joined across data
        d = self.finances_df.merge(self.debt_df, on="district_6", how="left") \
                            .merge(self.salary_df, on="district_6", how="left")
        self.districts_df = d

        # quick lookups
        self.district_index: Dict[str, Dict[str, Any]] = {
            row["district_6"]: row._asdict() if hasattr(row, "_asdict") else row.to_dict()
            for _, row in self.districts_df.iterrows()
        }
        self.campus_index: Dict[str, Dict[str, Any]] = {
            row["campus_9"]: row._asdict() if hasattr(row, "_asdict") else row.to_dict()
            for _, row in self.campuses_df.iterrows()
        }

    # helpers
    def districts_list(self, q: str|None, limit: int, offset: int) -> List[Dict[str, Any]]:
        df = self.districts_df
        if q:
            ql = q.lower()
            df = df[df["district_name"].str.lower().str.contains(ql, na=False)]
        return df.iloc[offset:offset+limit].fillna("").to_dict(orient="records")

    def district_detail(self, cdn_6: str) -> Dict[str, Any] | None:
        cdn_6 = _to_6(cdn_6)
        base = self.district_index.get(cdn_6)
        if not base:
            return None
        # campuses rolled up
        camps = self.campuses_df[self.campuses_df["district_6"] == cdn_6]
        reading_avg = float(camps["reading_on_grade"].mean()) if not camps.empty else None
        math_avg = float(camps["math_on_grade"].mean()) if not camps.empty else None
        base_out = dict(base)
        base_out["reading_on_grade_avg"] = reading_avg
        base_out["math_on_grade_avg"] = math_avg
        base_out["campus_count"] = int(camps.shape[0])
        return base_out

    def schools_list(self, q: str|None, district_6: str|None, limit: int, offset: int) -> List[Dict[str, Any]]:
        df = self.campuses_df
        if district_6:
            df = df[df["district_6"] == _to_6(district_6)]
        if q:
            ql = q.lower()
            df = df[df["campus_name"].str.lower().str.contains(ql, na=False)]
        return df.iloc[offset:offset+limit].fillna("").to_dict(orient="records")

    def school_detail(self, campus_9: str) -> Dict[str, Any] | None:
        return self.campus_index.get(_to_9(campus_9))

    def summary(self) -> Dict[str, Any]:
        d = self.districts_df
        return {
            "district_count": int(d.shape[0]),
            "total_spend": float(d["total_spend"].sum()),
            "total_enrollment": int(d["enrollment"].sum()),
            "avg_per_pupil_spend": float(d["per_pupil_spend"].mean()),
            "debt_total": float(d["debt_total"].sum(skipna=True)),
        }

    def districts_geo(self) -> Dict[str, Any]:
        # pass through, properties already include DISTRICT_N
        return self.districts_geojson

    def schools_geo(self) -> Dict[str, Any]:
        return self.schools_geojson
