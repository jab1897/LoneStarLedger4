// frontend/src/sections/StatewideMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import DistrictLayer from "../components/DistrictLayer";
import * as api from "../lib/api";

export default function StatewideMap() {
  const nav = useNavigate();
  const [districts, setDistricts] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const g = await api.geoDistrictProps();
        if (!cancelled) setDistricts(g);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("We couldn’t load district boundaries.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function onFeatureClick(feature) {
    const props = feature?.properties || {};
    const id =
      props.district_6 ||
      props.DISTRICT_N ||
      props.LEAID ||
      props.GEOID ||
      feature.id;
    if (id != null) nav(`/district/${encodeURIComponent(id)}`);
  }

  if (error) return <div className="alert error">{error}</div>;
  if (!districts) return <div className="spinner" />;

  return (
    <MapContainer
      center={[31.0, -99.0]}
      zoom={6}
      style={{ height: "540px", width: "100%", borderRadius: 12, overflow: "hidden" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DistrictLayer
        data={districts}
        hoverId={hoverId}
        onHover={setHoverId}
        onClick={onFeatureClick}
      />
    </MapContainer>
  );
}
