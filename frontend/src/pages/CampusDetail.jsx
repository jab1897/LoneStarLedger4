// frontend/src/pages/DistrictDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";

export default function DistrictDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const d = await api.getDistrict(id);
        if (!cancel) setData(d);
      } catch (e) {
        console.error(e);
        if (!cancel) setErr("Couldn’t load district details.");
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  if (err) return <main className="container"><div className="alert error">{err}</div></main>;
  if (!data) return <main className="container"><div className="spinner" /></main>;

  const d = data || {};
  return (
    <main className="container">
      <section className="hero" style={{ padding: "20px 0 10px" }}>
        <h1 style={{ marginBottom: 8 }}>{d.district_name || d.name || id}</h1>
        <p style={{ margin: 0, color: "#506080" }}>
          Enrollment: {Number(d.enrollment || 0).toLocaleString()} •
          &nbsp;Per-pupil: ${Number(d.per_pupil_spend || 0).toLocaleString()} •
          &nbsp;Total spend: ${Number(d.total_spend || 0).toLocaleString()}
        </p>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Campuses</h2>
        <DistrictCampuses districtId={d.district_6 || id} />
      </section>

      <div style={{ marginTop: 16 }}>
        <Link to="/" className="btn">← Back to Statewide</Link>
      </div>
    </main>
  );
}

function DistrictCampuses({ districtId }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        // lightweight points list then filter by district_6
        const pts = await api.campusPoints();
        const filtered = (pts || []).filter((p) => String(p.district_6) === String(districtId));
        if (!cancel) setRows(filtered);
      } catch (e) {
        console.error(e);
        if (!cancel) setErr("Couldn’t load campuses.");
      }
    })();
    return () => { cancel = true; };
  }, [districtId]);

  if (err) return <div className="alert error">{err}</div>;
  if (!rows) return <div className="spinner" />;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Campus</th>
            <th>Level</th>
            <th>Accountability</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id || r.campus_9}>
              <td>
                <Link to={`/campus/${encodeURIComponent(r.id || r.campus_9)}`}>
                  {r.campus_name || r.name || r.campus_9}
                </Link>
              </td>
              <td>{r.level || r.campus_type || "—"}</td>
              <td>{r.accountability || r.grade || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
