import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'

export default function MapView({ onFeatureClick, selection }) {
  const [districts, setDistricts] = useState(null)
  const [campuses, setCampuses] = useState(null)
  const [showCampuses, setShowCampuses] = useState(false)

  const mapRef = useRef(null)
  const districtLayerRef = useRef(null)
  const campusLayerRef = useRef(null)
  const districtIndex = useRef(new Map())  // id -> layer
  const campusIndex = useRef(new Map())

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
    const p = feature.properties || {}
    if (p.campus_9) {
      campusIndex.current.set(String(p.campus_9), layer)
    } else {
      const id = String(p.DISTRICT_N || p.district_6 || '')
      if (id) districtIndex.current.set(id, layer)
    }
    layer.on('click', () => {
      if (p.campus_9) {
        onFeatureClick?.({ type:'school', data: { campus_name: p.school_name || p.campus_name, campus_9: p.campus_9, district_6: p.district_6 } })
      } else {
        onFeatureClick?.({ type:'district', data: { district_name: p.name || p.DISTNAME, district_6: p.DISTRICT_N || p.district_6 } })
      }
    })
  }

  // zoom-to-selection
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selection) return
    // Leaflet map instance:
    const m = map._leaflet_map
    try {
      if (selection.type === 'district') {
        const li = districtIndex.current.get(String(selection.data.district_6))
        if (li && m) m.fitBounds(li.getBounds(), { maxZoom: 10 })
      } else if (selection.type === 'school') {
        const li = campusIndex.current.get(String(selection.data.campus_9))
        if (li && m) m.fitBounds(li.getBounds(), { maxZoom: 13 })
      }
    } catch {}
  }, [selection])

  return (
    <>
      <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
        <button className="btn" onClick={toggleCampuses}>{showCampuses ? 'Hide' : 'Show'} Campuses</button>
      </div>
      <div style={{height:360, borderRadius:12, overflow:'hidden'}}>
        <MapContainer ref={mapRef} center={[31.0, -99.0]} zoom={6} style={{height:'100%', width:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {districts && (
            <GeoJSON data={districts}
                     ref={districtLayerRef}
                     onEachFeature={onEach}
                     style={{color:'#003366', weight:1, fillOpacity:0.1}} />
          )}
          {showCampuses && campuses && (
            <GeoJSON data={campuses}
                     ref={campusLayerRef}
                     onEachFeature={onEach}
                     style={{color:'#FFD700', weight:1}} />
          )}
        </MapContainer>
      </div>
    </>
  )
}
