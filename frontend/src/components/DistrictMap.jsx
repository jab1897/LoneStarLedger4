import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'

export default function DistrictMap() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const geoRef = useRef(null)

  useEffect(() => {
    let alive = true
    api.geoDistricts()
      .then(g => { if (alive) setData(g) })
      .catch(e => { if (alive) setError(String(e)) })
    return () => { alive = false }
  }, [])

  const style = () => ({
    color: '#0a3a6b',
    weight: 1,
    fillColor: '#5b9bd5',
    fillOpacity: 0.08
  })

  const highlightStyle = { weight: 2, fillOpacity: 0.18 }

  const onEach = (feature, layer) => {
    const props = feature?.properties || {}
    const dName = props.name || props.DISTNAME || 'District'
    const cdn = props.district_6 || props.DISTRICT_N

    // Hover tooltip
    layer.bindTooltip(dName, { permanent: false, sticky: true, direction: 'top' })

    layer.on('mouseover', (e) => {
      e.target.setStyle(highlightStyle)
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) e.target.bringToFront()
    })
    layer.on('mouseout', (e) => geoRef.current?.resetStyle(e.target))

    // Click navigation (avoid router dependency)
    layer.on('click', () => {
      if (cdn) window.location.href = `/district/${cdn}`
    })
  }

  if (error) return <div className="card">Error loading map: {error}</div>
  if (!data) return <div className="spinner" style={{margin:'16px auto'}}/>

  return (
    <div style={{height: 440, borderRadius: 12, overflow:'hidden'}}>
      <MapContainer center={[31.0, -99.0]} zoom={6} style={{height:'100%', width:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON data={data} ref={geoRef} style={style} onEachFeature={onEach} />
      </MapContainer>
    </div>
  )
}
