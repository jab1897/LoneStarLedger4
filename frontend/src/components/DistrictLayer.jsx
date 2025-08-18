// frontend/src/components/DistrictLayer.jsx
import React, { useMemo } from "react";
import { GeoJSON, useMap } from "react-leaflet";

function getName(p = {}) {
  return p.name || p.dist_name || p.DNAME || p.DistrictName || p.DISTNAME || "District";
}

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

export default function DistrictLayer({ data, hoverId, onHover, onClick }) {
  const map = useMap();

  const baseStyle = useMemo(
    () => ({
      color: "#2463EB",      // stroke
      weight: 1,
      opacity: 0.7,
      fillColor: "#60A5FA",  // fill
      fillOpacity: 0.20,
    }),
    []
  );

  function featureStyle(feature) {
    const id = districtIdFromProps(feature?.properties, feature?.id);
    const isHover = hoverId != null && String(hoverId) === String(id);
    return isHover
      ? { ...baseStyle, weight: 2.5, opacity: 1, fillOpacity: 0.35 }
      : baseStyle;
  }

  function eachFeature(feature, layer) {
    const id = districtIdFromProps(feature?.properties, feature?.id);
    const name = getName(feature?.properties);

    layer.bindTooltip(name, { sticky: true, opacity: 0.9 });

    layer.on("mouseover", () => onHover?.(id));
    layer.on("mouseout", () => onHover?.(null));
    layer.on("click", () => onClick?.(feature));

    // Keyboard accessibility (focus/enter)
    layer.on("keypress", (e) => {
      if (e.originalEvent?.key === "Enter") onClick?.(feature);
    });
  }

  return (
    <GeoJSON data={data} style={featureStyle} onEachFeature={eachFeature} />
  );
}
