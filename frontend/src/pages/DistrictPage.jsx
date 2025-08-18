// frontend/src/pages/DistrictPage.jsx
import React, {useEffect,useState, useMemo} from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function DistrictPage(){
  const { district_6 } = useParams();
  const [districts, setDistricts] = useState(null);
  const [campuses, setCampuses] = useState(null);

  useEffect(()=>{ api.districts().then(setDistricts).catch(()=>setDistricts(null)); },[]);
  useEffect(()=>{ api.campusesPts().then(setCampuses).catch(()=>setCampuses(null)); },[]);

  const feature = useMemo(()=>{
    if(!districts) return null;
    return districts.features.find(f => String(f.properties.district_6)===String(district_6));
  }, [districts, district_6]);

  const filtered = useMemo(()=>{
    if(!campuses) return [];
    return campuses.features.filter(f => String(f.properties.district_6)===String(district_6));
  }, [campuses, district_6]);

  if(!feature) return <div><h1>District {district_6}</h1><p>Loading…</p></div>;

  // compute simple center
  const [lng, lat] = (feature.properties.center || [-97.5,31.0]);
  const bbox = feature.bbox || null;

  return (
    <div>
      <h1>District {district_6}: {feature.properties.name || ""}</h1>
      <MapContainer center={[lat,lng]} zoom={9} style={{height: "70vh", width:"100%"}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                   attribution="&copy; OpenStreetMap" />
        <GeoJSON data={feature} style={{color:"#1E6AA5", weight:2, fillOpacity:0.05}} />
        {filtered.map((c,i)=>(
          <CircleMarker key={i} center={[c.geometry.coordinates[1], c.geometry.coordinates[0]]} radius={4}>
            <Tooltip>{c.properties.school_name}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <p style={{marginTop:12}}>Campuses shown: {filtered.length}</p>
    </div>
  );
}
