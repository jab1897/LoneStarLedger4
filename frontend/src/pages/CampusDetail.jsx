import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function CampusDetail() {
  const { campusId } = useParams();
  const nav = useNavigate();

  const [campus, setCampus] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const c = await api.campusPoints(); // optional API
        const one = c?.features?.find(f =>
          String(f.properties?.campus_id ?? f.properties?.CAMPUS_ID) === String(campusId)
        );
        if (!dead) setCampus(one || null);
      } catch (e) {
        if (!dead) setErr(e);
      }
    })();
    return () => { dead = true; };
  }, [campusId]);

  const name = useMemo(
    () => campus?.properties?.campus_name ?? campus?.properties?.NAME ?? `Campus ${campusId}`,
    [campus, campusId]
  );

  return (
    <>
      <div className="card" style={{display:"flex", alignItems:"center", gap:12}}>
        <button onClick={() => nav(-1)}>&larr; Back</button>
        <h2 style={{margin:0}}>{name}</h2>
        <span className="badge">Campus ID: {campusId}</span>
      </div>

      {err && <div className="card" style={{background:"#fee", color:"#900"}}>Error: {String(err.message || err)}</div>}

      <div className="card">
        <h3>Performance & profile</h3>
        <p style={{color:"#6b7280", marginTop:0}}>
          Bind to a future <code>/api/summary/campus/:id</code> for STAAR/EOC, accountability, enrollment, staffing, etc.
        </p>
        {campus && (
          <pre style={{whiteSpace:"pre-wrap", background:"#f8fafc", padding:12, borderRadius:8, border:"1px solid #eef2f7"}}>
            {JSON.stringify(campus.properties, null, 2)}
          </pre>
        )}
      </div>
    </>
  );
}
