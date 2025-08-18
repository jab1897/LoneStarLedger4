import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

// robust helpers for property names that may vary
const distId = (p) => p?.district_id ?? p?.DIST_ID ?? p?.id ?? p?.GEOID ?? null;
const distName = (p) => p?.name ?? p?.district_name ?? p?.NAME ?? "District";

export default function Home() {
  const [propsGeo, setPropsGeo] = useState(null);
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const data = await api.districtsProps();
        if (!dead) setPropsGeo(data);
      } catch (e) {
        if (!dead) setErr(e);
      }
    })();
    return () => { dead = true; };
  }, []);

  const onEach = (feature, layer) => {
    const p = feature?.properties || {};
    const id = distId(p);
    layer.bindTooltip(distName(p), { sticky: true });
    layer.on("click", () => id && nav(`/district/${encodeURIComponent(id)}`));
  };

  return (
    <>
      <div className="card">
        <h3>Texas District Map</h3>
        {err && <div className="card" style={{background:"#fee", color:"#900"}}>Map data failed to load: {String(err.message || err)}</div>}
        <MapContainer center={[31.2, -99.3]} zoom={6} className="leaflet-container" scrollWheelZoom>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors" />
          {propsGeo && <GeoJSON data={propsGeo} onEachFeature={onEach} />}
        </MapContainer>
      </div>

      <div className="card">
        <h3>Statewide snapshot</h3>
        <StatewideStats />
      </div>
    </>
  );
}

function StatewideStats(){
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const s = await api.state();
        if (!dead) setData(s);
      } catch (e) {
        if (!dead) setErr(e);
      }
    })();
    return () => { dead = true; };
  }, []);

  if (err) return <div style={{color:"#900"}}>Failed to load: {String(err.message || err)}</div>;
  if (!data) return <div>Loading…</div>;

  // defensive formatting
  const fmt = (n, d = 0) => n == null ? "—" : (+n).toLocaleString(undefined, { maximumFractionDigits: d });
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
      <StatCard label="Districts" value={fmt(data.districts)} />
      <StatCard label="Enrollment" value={fmt(data.enrollment)} />
      <StatCard label="Total Spend" value={"$" + fmt(data.total_spend)} />
      <StatCard label="Avg Per-Pupil" value={"$" + fmt(data.avg_per_pupil, 0)} />
    </div>
  );
}

function StatCard({label, value}){
  return (
    <div className="card" style={{margin:0}}>
      <div style={{color:"#6b7280", fontSize:13}}>{label}</div>
      <div style={{fontSize:28, fontWeight:700}}>{value}</div>
    </div>
  );
}
