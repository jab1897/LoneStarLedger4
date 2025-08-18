import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

export default function MapView() {
  const [districts, setDistricts] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    api.geoDistricts().then(g => { if (alive) setDistricts(g) }).catch(()=>{})
    return () => { alive = false }
  }, [])

  const onEach = (feature, layer) => {
    const props = feature?.properties || {}
    const name = props.name || props.NAME || props.DISTNAME || 'District'
    try { layer.bindTooltip(name, {sticky:true}) } catch {}
    layer.on('click', () => {
      const id = props.district_6 || props.DISTRICT_N
      if (id) navigate(`/district/${id}`)
    })
  }

  return (
    <div className="card">
      <div style={{height:420, borderRadius:12, overflow:'hidden'}}>
        <MapContainer center={[31.0, -99.0]} zoom={6} style={{height:'100%', width:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {districts && <GeoJSON data={districts} onEachFeature={onEach} style={{color:'#003366', weight:1, fillOpacity:0.08}} />}
        </MapContainer>
      </div>
    </div>
  )
}
