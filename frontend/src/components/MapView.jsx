import React, { useEffect, useRef, useState } from "react";

/**
 * Pure Leaflet map (no React-Leaflet)
 * - Loads Leaflet as a real ESM module from CDN (no CommonJS/require at all)
 * - Works in the browser-only environment; lazily imported page-safe
 */
export default function MapView({
  height = 520,
  center = [31.0, -99.0],
  zoom = 6,
  className = "",
}) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let map;
    let alive = true;

    (async () => {
      if (typeof window === "undefined") return;

      // Import Leaflet ESM directly from CDN (CORS-enabled)
      const mod = await import("https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js");
      const L = mod.default || mod;

      // Ensure default marker icons resolve (optional; index.html already links leaflet.css)
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!alive || !ref.current) return;

      map = L.map(ref.current, { center, zoom, preferCanvas: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      setReady(true);

      // (Optional) example marker to verify map is interactive:
      // L.marker(center).addTo(map).bindPopup("Texas").openPopup();
    })();

    return () => {
      alive = false;
      try { map && map.remove(); } catch {}
    };
  }, [center[0], center[1], zoom]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        height,
        borderRadius: 12,
        background: "#f8fafc",
        outline: ready ? "none" : "1px dashed #e2e8f0",
      }}
    />
  );
}
