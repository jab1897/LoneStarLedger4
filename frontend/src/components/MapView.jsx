import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'

export default function MapView({ onFeatureClick }) {
  const [districts, setDistricts] = useState(null)
  const [campuses, setCampuses] = useState(null)
  const [showCampuses, setShowCampuses] = useState(false)

  useEffect(() => {
    let mounted = true
    api.geoDistricts().then(g => { if (mounted) setDistricts(g) }).catch(()=>{})
    return () => { mounted=false }
  }, [])

  async function toggleCampuses() {
    if (!campuses) {
      try { setCampuses(await api.geoCampuses()) } catch {}
    }
    setShowCampuses(v => !v)
  }

  const onEach = (feature, layer) => {
    layer.on('click', () => {
      const props = feature.properties || {}
      if (props.campus_9) {
        onFeatureClick?.({ type:'school', data: { campus_name: props.school_name, campus_9: props.campus_9, district_6: props.district_6 } })
      } else {
        onFeatureClick?.({ type:'district', data: { district_name: props.name || props.DISTNAME || 'District', district_6: props.DISTRICT_N || props.district_6 } })
      }
    })
  }

  return (
    <>
      <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
        <button className="btn" onClick={toggleCampuses}>{showCampuses ? 'Hide' : 'Show'} Campuses</button>
      </div>
      <div style={{height:360, borderRadius:12, overflow:'hidden'}}>
        <MapContainer center={[31.0, -99.0]} zoom={6} style={{height:'100%', width:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {districts && <GeoJSON data={districts} onEachFeature={onEach} style={{color:'#003366', weight:1, fillOpacity:0.1}} />}
          {showCampuses && campuses && <GeoJSON data={campuses} onEachFeature={onEach} style={{color:'#FFD700', weight:1}} />}
        </MapContainer>
      </div>
    </>
  )
}
