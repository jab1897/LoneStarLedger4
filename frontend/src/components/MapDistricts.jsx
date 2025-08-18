import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

export default function MapDistricts({ height=420, zoom=6, center=[31,-99] }) {
  const [gjson, setGjson] = useState(null)
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    api.geoDistricts()
      .then(g => { if (alive) setGjson(g) })
      .catch(e => { if (alive) setErr(String(e)) })
    return () => { alive = false }
  }, [])

  const onEach = (feature, layer) => {
    const props = feature?.properties || {}
    const name = props.name || props.NAME || props.DISTNAME || 'District'
    try { layer.bindTooltip(name, {sticky:true}) } catch {}
    layer.on('click', () => {
      const id = props.district_6 || props.DISTRICT_N || props.DISTRICT || props.id
      if (id) navigate(`/district/${id}`)
    })
  }

  return (
    <div className="card">
      <div style={{height, borderRadius:12, overflow:'hidden'}}>
        <MapContainer center={center} zoom={zoom} style={{height:'100%', width:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {gjson && <GeoJSON data={gjson} onEachFeature={onEach}
                             style={{ color:'#003366', weight:1, fillOpacity:.08 }}/>}
        </MapContainer>
      </div>
      {err && <div style={{padding:8, color:'#b00020'}}>Map error: {err}</div>}
    </div>
  )
}
