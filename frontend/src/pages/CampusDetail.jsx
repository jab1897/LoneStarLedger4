// frontend/src/pages/CampusDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "../lib/api";

export default function CampusDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        // Prefer dedicated endpoint if available; fallback to list filter:
        try {
          const s = await api.getSchool(id);
          if (!cancel) setData(s);
        } catch {
          const list = await api.listSchools(1, 0, id);
          const item = (list.items || [])[0];
          if (!cancel) setData(item);
        }
      } catch (e) {
        console.error(e);
        if (!cancel) setErr("Couldn’t load campus details.");
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  if (err) return <main className="container"><div className="alert error">{err}</div></main>;
  if (!data) return <main className="container"><div className="spinner" /></main>;

  const c = data || {};
  return (
    <main className="container">
      <section className="hero" style={{ padding: "20px 0 10px" }}>
        <h1 style={{ marginBottom: 8 }}>{c.campus_name || c.name || id}</h1>
        <p style={{ margin: 0, color: "#506080" }}>
          District: {c.district_name || c.district_6 || "—"} •
          &nbsp;Reading on-grade: {c.reading_on_grade ?? "—"}% •
          &nbsp;Math on-grade: {c.math_on_grade ?? "—"}%
        </p>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Performance Snapshot</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Accountability grade: {c.accountability || c.grade || "—"}</li>
          <li>Enrollment: {Number(c.enrollment || 0).toLocaleString()}</li>
          <li>Principal: {c.principal || "—"}</li>
          <li>Contact: {c.phone || "—"} • {c.address || "—"}</li>
        </ul>
      </section>

      <div style={{ marginTop: 16 }}>
        {c.district_6 && (
          <Link to={`/district/${encodeURIComponent(c.district_6)}`} className="btn">
            ← Back to District
          </Link>
        )}
        &nbsp;&nbsp;
        <Link to="/" className="btn alt">Statewide</Link>
      </div>
    </main>
  );
}
