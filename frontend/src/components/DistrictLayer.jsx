// frontend/src/components/DistrictLayer.jsx
import React, { useRef } from "react";
import { GeoJSON, Tooltip } from "react-leaflet";

export default function DistrictLayer({ data, hoverId, onHover, onClick }) {
  const layerRef = useRef();

  const style = (feature) => {
    const props = feature.properties || {};
    const id =
      props.district_6 ||
      props.DISTRICT_N ||
      props.LEAID ||
      props.GEOID ||
      feature.id;

    const isHover = hoverId != null && String(hoverId) === String(id);
    return {
      color: isHover ? "#ff9900" : "#003366",
      weight: isHover ? 2 : 1,
      fillOpacity: isHover ? 0.15 : 0.1,
    };
  };

  const onEach = (feature, layer) => {
    const props = feature.properties || {};
    const id =
      props.district_6 ||
      props.DISTRICT_N ||
      props.LEAID ||
      props.GEOID ||
      feature.id;

    const name = props.name || props.DISTNAME || props.DISTRICT_N || "District";

    layer.on("mouseover", () => onHover?.(id));
    layer.on("mouseout", () => onHover?.(null));
    layer.on("click", () => onClick?.(feature));

    // Add an always-following tooltip on hover
    layer.bindTooltip(name, {
      sticky: true,
      direction: "top",
      opacity: 0.9,
    });
  };

  return <GeoJSON data={data} style={style} onEachFeature={onEach} ref={layerRef} />;
}
