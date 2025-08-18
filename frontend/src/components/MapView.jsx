import React, { useEffect, useState } from 'react'
import { api } from '../api'

// Only import leaflet/react-leaflet on the client to avoid SSR/DOM crashes
const isClient = typeof window !== 'undefined';
let MapContainer, TileLayer, GeoJSON;
if (isClient) {
  // eslint-disable-next-line import/no-unresolved
  const RL = require('react-leaflet');
  MapContainer = RL.MapContainer; TileLayer = RL.TileLayer; GeoJSON = RL.GeoJSON;
  require('leaflet/dist/leaflet.css');
}

export default function MapView({ onFeatureClick }) {
  const [districts, setDistricts] = useState(null)
  const [campuses, setCampuses] = useState(null)
  const [showCampuses, setShowCampuses] = useState(false)

  useEffect(() => {
    let mounted = true
    api.geoDistricts().then(g => { if (mounted) setDistricts(g) }).catch(e => console.error(e))
    return () => { mounted=false }
  }, [])

  async function toggleCampuses() {
    if (!campuses) {
      try { setCampuses(await api.geoCampuses()) } catch (e) { console.error(e) }
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

  // Server/SSR or non-browser: render a harmless placeholder
  if (!isClient) return <div style={{height:360}} />

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
