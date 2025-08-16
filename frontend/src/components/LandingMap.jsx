import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

export default function LandingMap(){
  const [districts, setDistricts] = useState(null)
  const nav = useNavigate()
  const mapRef = useRef(null)

  useEffect(()=>{
    let m=true
    api.geoDistricts()
      .then(g => { if(m) setDistricts(g) })
      .catch(()=>{})
    const onCenter = (e) => {
      if (mapRef.current) mapRef.current.setView([e.detail.lat, e.detail.lng], 10)
    }
    window.addEventListener('center-on', onCenter)
    return ()=>{ m=false; window.removeEventListener('center-on', onCenter) }
  },[])

  const onEach = (feature, layer) => {
    const props = feature.properties || {}
    const name = props.name || props.DISTNAME || props.NAME || 'District'
    const id = props.district_6 || props.DISTRICT_N || props.DISTRICT || props.CD || null
    // hover label
    layer.bindTooltip(name, { sticky: true, direction: 'top', offset: L.point(0, -2) })
    // click to district page
    layer.on('click', ()=> {
      if (id) nav(`/district/${id}`)
    })
  }

  return (
    <div style={{height:420, borderRadius:12, overflow:'hidden'}}>
      <MapContainer ref={mapRef} center={[31.0, -99.0]} zoom={6} style={{height:'100%', width:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {districts && <GeoJSON data={districts} onEachFeature={onEach} style={{color:'#003366', weight:1, fillOpacity:0.08}} />}
      </MapContainer>
    </div>
  )
}
