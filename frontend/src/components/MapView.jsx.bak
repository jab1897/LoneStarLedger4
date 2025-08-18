import React, { useEffect, useState } from "react";

/**
 * Minimal, module-safe MapView.
 * - Loads leaflet & react-leaflet with dynamic ESM imports (no `require`)
 * - Renders a base map only to guarantee runtime stability
 * - We’ll progressively add districts/campuses (and clustering) after confirming this deploy
 */
export default function MapView({ height = 520, center=[31.0, -99.0], zoom=6 }) {
  const [mods, setMods] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Load only in browser
      if (typeof window === "undefined") return;

      // Dynamic ESM imports; keep the bundle SSR-safe and avoid CommonJS `require`
      const RL = await import("react-leaflet");
      const Lmod = await import("leaflet");
      // Ensure Leaflet default icon URLs work when bundling (optional; index.html already has leaflet.css)
      // await import("leaflet/dist/leaflet.css");

      // Fix missing marker icons in some bundlers (optional safeguard)
      const L = Lmod.default || Lmod;
      if (L && L.Icon && L.Icon.Default) {
        const iconRetina = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
        const icon = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
        const shadow = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
        L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl: icon, shadowUrl: shadow });
      }

      if (mounted) {
        setMods({
          MapContainer: RL.MapContainer,
          TileLayer: RL.TileLayer
        });
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!mods) {
    return <div style={{ height, background: "#f8fafc", borderRadius: 12 }} />;
  }

  const { MapContainer, TileLayer } = mods;

  return (
    <MapContainer
      style={{ height, borderRadius: 12 }}
      center={center}
      zoom={zoom}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* TODO: after confirming stability, add districts/campuses layers & clustering again */}
    </MapContainer>
  );
}
