// frontend/src/sections/StatewideMap.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

function FitTexas(){ // gentle initial view
  const map = useMap();
  useEffect(()=>{ map.setView([31.0,-99.3], 6) },[map]);
  return null;
}

export default function StatewideMap(){
  const [fc, setFc] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{ api.districts().then(setFc).catch(()=>setFc(null)); },[]);

  const onEach = (feature, layer) => {
    const p = feature.properties || {};
    const id = p.district_6;
    const name = p.name || `District ${id}`;
    layer.bindTooltip(name, {direction:"auto", sticky:true});
    layer.on("click", () => navigate(`/district/${id}`));
    layer.on("mouseover", () => layer.setStyle({weight:3, color:"#0b6aa4"}));
    layer.on("mouseout",  () => layer.setStyle({weight:1, color:"#3388ff"}));
  };

  return (
    <div style={{height:"70vh", width:"100%", borderRadius:12, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,.08)"}}>
      <MapContainer center={[31.0,-99.3]} zoom={6} style={{height:"100%", width:"100%"}}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <FitTexas />
        {fc && <GeoJSON data={fc} onEachFeature={onEach} style={{weight:1, color:"#3388ff", fillOpacity:0.02}} />}
      </MapContainer>
    </div>
  );
}
