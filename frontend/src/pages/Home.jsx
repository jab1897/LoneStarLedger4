// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useNavigate } from "react-router-dom";

import DistrictLayer from "../components/DistrictLayer";
import SearchBox from "../components/SearchBox";
import * as api from "../lib/api";
import StatewideStats from "../sections/StatewideStats";

export default function Home() {
  const nav = useNavigate();
  const [districts, setDistricts] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await api.geoDistrictProps(); // props-only GeoJSON
        if (!cancelled) setDistricts(d);
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
      props.district_6 || props.DISTRICT_N || props.LEAID || props.GEOID || props.id || feature.id;
    if (id != null) nav(`/district/${encodeURIComponent(id)}`);
  }

  return (
    <main>
      {/* Hero / Intro */}
      <section className="hero" style={{ padding: "28px 0 16px" }}>
        <h1 style={{ marginBottom: 10 }}>K-12 finance &amp; accountability</h1>
        <p style={{ marginBottom: 12, maxWidth: 920 }}>
          Transparent, statewide look at district spending, student performance, and staffing.
          Search by district or campus, hover the map to see district names, and click a district to drill into details.
        </p>
        <SearchBox />
      </section>

      {/* Map */}
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {districts && (
              <DistrictLayer
                data={districts}
                hoverId={hoverId}
                onHover={setHoverId}
                onClick={onFeatureClick}
              />
            )}
          </MapContainer>
        )}
      </section>

      {/* Statewide Key Stats */}
      <StatewideStats />
    </main>
  );
}
