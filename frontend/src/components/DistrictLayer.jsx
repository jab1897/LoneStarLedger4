// frontend/src/components/DistrictLayer.jsx
import React, { useMemo } from "react";
import { GeoJSON, useMap } from "react-leaflet";

/** Fallback-safe district name */
function getName(p = {}) {
  return (
    p.name ||
    p.dist_name ||
    p.DNAME ||
    p.DistrictName ||
    p.DISTNAME ||
    "District"
  );
}

/** Robustly pull a district id from mixed data sources */
function districtIdFromProps(props = {}, fallback) {
  return (
    props.id ||
    props.district_id ||
    props.DISTRICT_ID ||
    props.LEAID ||
    props.GEOID ||
    fallback
  );
}

/**
 * DistrictLayer
 * - Renders district polygons with hover highlight and sticky tooltip
 * - Calls onHover(id) and onClick(feature)
 */
export default function DistrictLayer({ data, hoverId, onHover, onClick }) {
  // (Not used directly, but kept in case you want to fit bounds later)
  useMap();

  const baseStyle = useMemo(
    () => ({
      color: "#2463EB",     // stroke
      weight: 1,
      opacity: 0.7,
      fillColor: "#60A5FA", // fill
      fillOpacity: 0.20,
    }),
    []
  );

  function styleFor(feature) {
    const id = districtIdFromProps(feature?.properties, feature?.id);
    const isHover =
      hoverId != null && String(hoverId) === String(id);
    return isHover
      ? { ...baseStyle, weight: 2.5, opacity: 1, fillOpacity: 0.35 }
      : baseStyle;
  }

  function onEachFeature(feature, layer) {
    const id = districtIdFromProps(feature?.properties, feature?.id);
    const name = getName(feature?.properties);

    layer.bindTooltip(name, { sticky: true, opacity: 0.9 });

    layer.on("mouseover", () => onHover?.(id));
    layer.on("mouseout", () => onHover?.(null));
    layer.on("click", () => onClick?.(feature));

    // Basic keyboard accessibility
    layer.on("keypress", (e) => {
      if (e.originalEvent?.key === "Enter") onClick?.(feature);
    });
  }

  return <GeoJSON data={data} style={styleFor} onEachFeature={onEachFeature} />;
}
