// frontend/src/sections/StatewideStats.jsx
import React, { useEffect, useState } from "react";
import * as api from "../lib/api";

export default function StatewideStats() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        // Try whichever your backend exposes
        const data =
          (api.stateStats ? await api.stateStats() : null) ||
          (api.summary ? await api.summary() : null);
        if (!cancel) setStats(data);
      } catch (e) {
        console.error(e);
        if (!cancel) setErr("Statewide stats are unavailable right now.");
      }
    })();
    return () => { cancel = true; };
  }, []);

  if (err) return <div className="card" style={{marginTop:12}}>{err}</div>;
  if (!stats) return <div className="card" style={{marginTop:12}}><div className="spinner" /></div>;

  // Try common field names from your API; adjust if yours differ
  const items = [
    { label: "Districts",       value: toNum(stats.district_count) },
    { label: "Enrollment",      value: toNum(stats.total_enrollment) },
    { label: "Total Spend",     value: toMoney(stats.total_spend) },
    { label: "Avg Per-Pupil",   value: toMoney(stats.avg_per_pupil_spend) },
    { label: "Debt Total",      value: toMoney(stats.debt_total) },
    // Add more if you expose them:
    stats.avg_teacher_salary != null && { label: "Avg Teacher Salary", value: toMoney(stats.avg_teacher_salary) },
  ].filter(Boolean);

  return (
    <section className="grid" style={{marginTop:12}}>
      {items.map((it, i)=>(
        <div key={i} className="card" style={{textAlign:'center', padding:'14px'}}>
          <div style={{fontSize:12, color:'#6a7a95'}}>{it.label}</div>
          <div style={{fontSize:22, fontWeight:700, color:'var(--blue)'}}>{it.value}</div>
        </div>
      ))}
    </section>
  );
}

function toNum(n){ return Number(n||0).toLocaleString(); }
function toMoney(n){ return `$${Math.round(Number(n||0)).toLocaleString()}`; }
