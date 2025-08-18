import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { api } from "../api";

const distId = (p) => p?.district_id ?? p?.DIST_ID ?? p?.id ?? p?.GEOID ?? null;
const distName = (p) => p?.name ?? p?.district_name ?? p?.NAME ?? "District";

export default function DistrictDetail() {
  const { districtId } = useParams();
  const nav = useNavigate();

  const [poly, setPoly] = useState(null);
  const [propsGeo, setPropsGeo] = useState(null);
  const [campus, setCampus] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let dead = false;

    (async () => {
      try {
        // try full district polygons
        try {
          const ds = await api.districts();
          const one = ds?.features?.find(f => String(distId(f.properties)) === String(districtId));
          if (!dead) setPoly(one || null);
        } catch {}

        // props (for fallback/label)
        try {
          const p = await api.districtsProps();
          if (!dead) setPropsGeo(p);
        } catch {}

        // campus points (optional API)
        try {
          const c = await api.campusPoints();
          const filtered = c?.features?.filter(f =>
            String(f.properties?.district_id ?? f.properties?.DIST_ID) === String(districtId)
          ) || [];
          if (!dead) setCampus(filtered);
        } catch {}
      } catch (e) {
        if (!dead) setErr(e);
      }
    })();

    return () => { dead = true; };
  }, [districtId]);

  const info = useMemo(() => {
    if (poly) return { name: distName(poly.properties) };
    const f = propsGeo?.features?.find(x => String(distId(x.properties)) === String(districtId));
    return { name: f ? distName(f.properties) : `District ${districtId}` };
  }, [poly, propsGeo, districtId]);

  const center = useMemo(() => {
    if (poly?.geometry?.type && poly.geometry.coordinates?.length) {
      const bounds = L.geoJSON(poly).getBounds();
      return bounds.getCenter();
    }
    return L.latLng(31.2, -99.3);
  }, [poly]);

  return (
    <>
      <div className="card" style={{display:"flex", alignItems:"center", gap:12}}>
        <button onClick={() => nav(-1)}>&larr; Back</button>
        <h2 style={{margin:0}}>{info.name}</h2>
        <span className="badge">District ID: {districtId}</span>
      </div>

      {err && <div className="card" style={{background:"#fee", color:"#900"}}>Error: {String(err.message || err)}</div>}

      <div className="card">
        <h3>District map & campuses</h3>
        <MapContainer center={center} zoom={10} className="leaflet-container" scrollWheelZoom>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors" />
          {poly && <GeoJSON data={poly} style={{ color:"#0b6efd", weight: 2 }} />}
          {campus?.map((f, i) => {
            const [lng, lat] = f.geometry?.coordinates || [];
            if (!(lat && lng)) return null;
            const name = f.properties?.campus_name ?? f.properties?.NAME ?? "Campus";
            const cid = f.properties?.campus_id ?? f.properties?.CAMPUS_ID ?? null;
            return (
              <Marker key={i} position={[lat, lng]} eventHandlers={{
                click: () => cid && nav(`/campus/${encodeURIComponent(cid)}`)
              }}>
                <Popup>
                  <div style={{fontWeight:700}}>{name}</div>
                  {cid && <div>ID: {cid}</div>}
                  <div style={{marginTop:6}}>
                    <a onClick={() => cid && nav(`/campus/${encodeURIComponent(cid)}`)}
                       style={{cursor:"pointer", color:"#0b6efd"}}>Open campus</a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="card">
        <h3>At-a-glance</h3>
        <p style={{color:"#6b7280", marginTop:0}}>
          Hook this to a future endpoint like <code>/api/summary/district/:id</code>
          for enrollment, per-pupil spend, debt, staffing, accountability, etc.
        </p>
      </div>
    </>
  );
}
