// frontend/src/pages/Home.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsBar from "../components/StatsBar";
import { summary, apiBase, geoDistrictProps } from "../lib/api";

// Map libs
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";

function normalizeSummary(s) {
  const districts =
    s.totalDistricts ?? s.districts ?? s.total_districts ?? s.countDistricts ?? 0;
  const campuses =
    s.totalCampuses ?? s.campuses ?? s.total_schools ?? s.schools ?? 0;
  const students =
    s.totalStudents ?? s.students ?? s.enrollment ?? s.total_enrollment ?? 0;
  return { districts, campuses, students };
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);
  const [districtGeo, setDistrictGeo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    summary()
      .then((s) => !cancelled && setStats(normalizeSummary(s)))
      .catch((e) => !cancelled && setErr(e));
    geoDistrictProps()
      .then((g) => !cancelled && setDistrictGeo(g))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="container">
      <h1>Transparency ISD</h1>
      <p style={{ marginTop: 4, color: "#6b7280" }}>
        Data source: <code>{apiBase}</code>
      </p>

      <div style={{ height: 520, marginTop: 12 }}>
        <TexasDistrictMap geo={districtGeo} />
      </div>

      {err && <p style={{ color: "crimson" }}>Could not load summary</p>}

      {stats && (
        <StatsBar
          items={[
            { label: "Total districts", value: stats.districts.toLocaleString() },
            { label: "Total campuses", value: stats.campuses.toLocaleString() },
            { label: "Students", value: stats.students.toLocaleString() },
          ]}
        />
      )}
    </main>
  );
}

function TexasDistrictMap({ geo }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  // Default statewide view for Texas
  const center = [31.0, -99.0];
  const zoom = 6;

  // When geo loads, fit bounds
  useEffect(() => {
    if (!geo || !mapRef.current) return;
    // Create bounds from the feature collection
    const gj = L.geoJSON(geo);
    const b = gj.getBounds();
    if (b.isValid()) {
      mapRef.current.fitBounds(b.pad(0.05));
    }
  }, [geo]);

  const baseStyle = {
    weight: 1,
    opacity: 1,
    color: "#1f2937",
    fillOpacity: 0.18,
    fillColor: "#3b82f6",
  };

  const onEachFeature = (feature, layer) => {
    const props = feature?.properties || {};
    const id =
      props.DISTRICT_N ?? props.district_n ?? props.id ?? props.DISTRICT ?? null;

    layer.on({
      mouseover: () => {
        layer.setStyle({
          weight: 2,
          fillOpacity: 0.35,
        });
        layer.getElement()?.classList.add("hovered");
      },
      mouseout: () => {
        layer.setStyle(baseStyle);
        layer.getElement()?.classList.remove("hovered");
      },
      click: () => {
        if (id != null) {
          navigate(`/district/${encodeURIComponent(id)}`);
        }
      },
    });

    // Simple tooltip with name and id
    const label = props.name ?? props.NAME ?? `District ${id ?? ""}`;
    layer.bindTooltip(label, { sticky: true });
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      ref={mapRef}
      style={{ height: "100%", width: "100%", borderRadius: 12, overflow: "hidden" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // Proper attribution is required by OSM
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {geo && (
        <GeoJSON
          key="districts"
          data={geo}
          style={() => baseStyle}
          onEachFeature={onEachFeature}
          ref={layerRef}
        />
      )}
    </MapContainer>
  );
}
