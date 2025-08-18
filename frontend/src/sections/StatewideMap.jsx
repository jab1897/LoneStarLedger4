// frontend/src/sections/StatewideMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import * as api from "../api"; // named import bundle (works with the shim too)

export default function StatewideMap() {
  const nav = useNavigate();
  const [geo, setGeo] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await api.geoDistrictProps(); // expects FeatureCollection with properties
        if (!cancelled) setGeo(d);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("We couldn’t load district boundaries.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onEachFeature = (feature, layer) => {
    const props = feature?.properties || {};
    const name = props.name || props.DISTNAME || props.DISTRICT || props.LEA_NAME || "District";
    const id =
      props.id ||
      props.district_id ||
      props.DISTRICT_ID ||
      props.LEAID ||
      props.GEOID ||
      feature.id;

    layer.on({
      mouseover: () => setHoverId(id),
      mouseout: () => setHoverId(null),
      click: () => {
        if (id != null) {
          nav(`/district/${encodeURIComponent(id)}`);
        }
      },
    });

    layer.bindTooltip(name, {
      direction: "auto",
      sticky: true,
    });
  };

  const style = (feature) => {
    const props = feature?.properties || {};
    const id =
      props.id ||
      props.district_id ||
      props.DISTRICT_ID ||
      props.LEAID ||
      props.GEOID ||
      feature.id;

    const hovered = hoverId != null && id === hoverId;
    return {
      color: hovered ? "#1d4ed8" : "#2563eb",
      weight: hovered ? 2.5 : 1,
      fillColor: hovered ? "#93c5fd" : "#60a5fa",
      fillOpacity: hovered ? 0.45 : 0.28,
    };
  };

  return (
    <section className="card" style={{ marginTop: 18 }}>
      <h2 style={{ marginBottom: 10 }}>Texas District Map</h2>

      {error ? (
        <div className="alert error">{error}</div>
      ) : (
        <MapContainer
          center={[31.0, -99.0]}
          zoom={6}
          style={{ height: "540px", width: "100%", borderRadius: 12, overflow: "hidden" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {geo && (
            <GeoJSON data={geo} style={style} onEachFeature={onEachFeature} />
          )}
        </MapContainer>
      )}
    </section>
  );
}
