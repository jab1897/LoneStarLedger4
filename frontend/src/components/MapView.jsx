
import React, { useEffect, useMemo, useState, useCallback } from "react";

/**
 * Client-only Leaflet MapView
 * - No `require()`; uses dynamic ESM import to load react-leaflet in the browser.
 * - Accepts GeoJSON via `data` (or `geojson`/`districts`) and optional `onFeatureClick`.
 * - Keeps a sensible default center/zoom if none supplied.
 */
export default function MapView({
  data,
  geojson,
  districts,
  center = [31.0, -99.0], // Texas-ish
  zoom = 6,
  styleHeight = "480px",
  onFeatureClick,
  tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  tileAttribution = "&copy; OpenStreetMap contributors",
}) {
  const [RL, setRL] = useState(null);

  // Load react-leaflet (and CSS) only on client
  useEffect(() => {
    let mounted = true;
    (async () => {
      // load CSS and react-leaflet in parallel
      await Promise.all([
        import("leaflet/dist/leaflet.css"),
        import("react-leaflet").then((m) => { if (mounted) setRL(m); }),
      ]);
    })();
    return () => { mounted = false; };
  }, []);

  const features = useMemo(() => {
    return data || geojson || districts || null;
  }, [data, geojson, districts]);

  const handleEachFeature = useCallback((feature, layer) => {
    if (!feature || !layer) return;
    // tooltip on hover
    const name =
      feature?.properties?.name ||
      feature?.properties?.DISTNAME ||
      feature?.properties?.DISTRICT_N ||
      feature?.properties?.district_name ||
      "District";

    try { layer.bindTooltip(String(name), { sticky: true }); } catch {}

    // click → bubble up
    if (onFeatureClick) {
      layer.on("click", () => onFeatureClick(feature, layer));
    }
  }, [onFeatureClick]);

  // Don’t render until libs are loaded
  if (!RL) return null;

  const { MapContainer, TileLayer, GeoJSON } = RL;

  return (
    <div style={{ height: styleHeight, width: "100%" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", background: "#f7fafc" }}
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        {features ? (
          <GeoJSON
            data={features}
            onEachFeature={handleEachFeature}
            style={() => ({
              color: "#2563eb",
              weight: 1,
              fillOpacity: 0.15,
            })}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
