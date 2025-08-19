// frontend/src/pages/Campus.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as api from "../lib/api";

export default function Campus() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const s = await api.getSchool(id); // expects a campus object
        if (!cancel) setDetail(s);
      } catch (e) {
        console.error(e);
        if (!cancel) setErr("Campus not found.");
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  if (err) return <main><div className="card">{err}</div></main>;
  if (!detail) return <main><div className="card"><div className="spinner" /></div></main>;

  const lat = Number(detail.lat), lon = Number(detail.lon);
  const center = (!isNaN(lat) && !isNaN(lon)) ? [lat, lon] : [31.0, -99.0];

  return (
    <main>
      <section className="hero" style={{ padding: "24px 0 8px" }}>
        <h1 style={{ marginBottom: 6 }}>{detail.campus_name || `Campus ${id}`}</h1>
        <p style={{ margin: 0, color: "#6a7a95" }}>
          District: {detail.district_name || detail.district_6}
        </p>
      </section>

      <section className="grid" style={{marginTop:12}}>
        {[
          { label: "Reading On-Grade", value: pct(detail.reading_on_grade) },
          { label: "Math On-Grade", value: pct(detail.math_on_grade) },
          detail.accountability_grade && { label: "Accountability Grade", value: detail.accountability_grade },
        ].filter(Boolean).map((it, i)=>(
          <div key={i} className="card" style={{textAlign:'center', padding:'14px'}}>
            <div style={{fontSize:12, color:'#6a7a95'}}>{it.label}</div>
            <div style={{fontSize:22, fontWeight:700, color:'var(--blue)'}}>{it.value}</div>
          </div>
        ))}
      </section>

      <section className="card" style={{marginTop:12}}>
        <h2 style={{marginBottom:10}}>Location</h2>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "420px", width: "100%", borderRadius: 12, overflow: "hidden" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!isNaN(lat) && !isNaN(lon) && (
            <Marker position={[lat, lon]}>
              <Popup>{detail.campus_name || `Campus ${id}`}</Popup>
            </Marker>
          )}
        </MapContainer>
      </section>
    </main>
  );
}

function pct(x){
  if (x == null || x === "") return "—";
  const n = Number(x);
  return isNaN(n) ? "—" : `${n}%`;
}
