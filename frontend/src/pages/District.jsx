// frontend/src/pages/District.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as api from "../lib/api";

export default function District() {
  const { id } = useParams();
  const nav = useNavigate();

  const [detail, setDetail] = useState(null);
  const [points, setPoints] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const d = await api.getDistrict(id); // expects district object
        if (!cancel) setDetail(d);
      } catch (e) {
        console.error(e);
        if (!cancel) setErr("District not found.");
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const pts = await api.campusPoints(); // array of {lat, lon, campus_9, campus_name, district_6, ...}
        if (!cancel) setPoints(pts);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const campusesInDistrict = useMemo(() => {
    if (!points) return [];
    return points.filter(p =>
      String(p.district_6 || "").replace(/^0+/, "") === String(id).replace(/^0+/, "")
    );
  }, [points, id]);

  const center = useMemo(() => {
    if (campusesInDistrict.length) {
      const [first] = campusesInDistrict;
      return [Number(first.lat) || 31.0, Number(first.lon) || -99.0];
    }
    return [31.0, -99.0];
  }, [campusesInDistrict]);

  if (err) return <main><div className="card">{err}</div></main>;
  if (!detail) return <main><div className="card"><div className="spinner" /></div></main>;

  const name = detail.district_name || detail.name || `District ${id}`;
  const enrollment = n(detail.enrollment);
  const perPupil = money(detail.per_pupil_spend);
  const totalSpend = money(detail.total_spend);
  const debt = money(detail.debt_total);

  return (
    <main>
      <section className="hero" style={{ padding: "24px 0 8px" }}>
        <h1 style={{ marginBottom: 6 }}>{name}</h1>
        <p style={{ margin: 0, color: "#6a7a95" }}>District overview • ID: {id}</p>
      </section>

      <section className="grid" style={{marginTop:12}}>
        {[
          { label: "Enrollment", value: enrollment },
          { label: "Per-Pupil Spend", value: perPupil },
          { label: "Total Spend", value: totalSpend },
          { label: "Debt Total", value: debt },
        ].map((it, i)=>(
          <div key={i} className="card" style={{textAlign:'center', padding:'14px'}}>
            <div style={{fontSize:12, color:'#6a7a95'}}>{it.label}</div>
            <div style={{fontSize:22, fontWeight:700, color:'var(--blue)'}}>{it.value}</div>
          </div>
        ))}
      </section>

      <section className="card" style={{marginTop:12}}>
        <h2 style={{marginBottom:10}}>Campuses</h2>
        <MapContainer
          center={center}
          zoom={9}
          style={{ height: "480px", width: "100%", borderRadius: 12, overflow: "hidden" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {campusesInDistrict.map((c) => {
            const lat = Number(c.lat), lon = Number(c.lon);
            if (isNaN(lat) || isNaN(lon)) return null;
            return (
              <Marker key={c.campus_9} position={[lat, lon]}>
                <Popup>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    <div style={{fontWeight:600}}>{c.campus_name}</div>
                    <button className="btn" onClick={()=>nav(`/campus/${encodeURIComponent(c.campus_9)}`)}>
                      Open Campus
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </section>
    </main>
  );
}

function n(x){ return Number(x||0).toLocaleString(); }
function money(x){ return `$${Math.round(Number(x||0)).toLocaleString()}`; }
