import React, { useMemo } from "react";
import { GeoJSON } from "react-leaflet";

export default function DistrictLayer({ data, hoverId, onHover, onClick }) {
  const style = useMemo(() => ({
    color:"#2563eb", weight:1, fillColor:"#60a5fa", fillOpacity:.35
  }), []);

  function featureStyle(feat){
    const id = feat?.properties?.id ?? feat?.id;
    const isHover = hoverId != null && String(id) === String(hoverId);
    return isHover ? { ...style, weight:2, fillOpacity:.55 } : style;
  }

  function onEachFeature(feat, layer){
    layer.on({
      mouseover: () => onHover?.(feat.properties?.id ?? feat.id),
      mouseout:  () => onHover?.(null),
      click:     () => onClick?.(feat)
    });
    const name = feat?.properties?.name ?? "District";
    layer.bindTooltip(name, { sticky:true, opacity:.9 });
  }

  return <GeoJSON data={data} style={featureStyle} onEachFeature={onEachFeature} />;
}
