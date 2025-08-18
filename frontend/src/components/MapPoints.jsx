import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvent } from 'react-leaflet'
import { api } from '../api'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'

function useBounds() {
  const [bounds, setBounds] = useState(null)
  useMapEvent('moveend', (m) => {
    const b = m.target.getBounds()
    setBounds([[b.getSouth(), b.getWest()], [b.getNorth(), b.getEast()]])
  })
  useEffect(() => {
    // first tick bounds
    // eslint-disable-next-line no-undef
    const m = window.__leaflet_map
    if (m) {
      const b = m.getBounds()
      setBounds([[b.getSouth(), b.getWest()], [b.getNorth(), b.getEast()]])
    }
  }, [])
  return bounds
}

export default function MapPoints({ districtId, center=[31,-99], zoom=8 }) {
  const [all, setAll] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    api.campusPoints()
      .then(p => { if (alive) setAll(Array.isArray(p?.items) ? p.items : p) })
      .catch(e => { if (alive) setError(String(e)) })
    return () => { alive=false }
  }, [])

  const filtered = useMemo(() => {
    if (!all) return []
    const rows = all.filter(r => String(r.district_6) === String(districtId))
    return rows
  }, [all, districtId])

  return (
    <div className="card">
      <div style={{height:420, borderRadius:12, overflow:'hidden'}}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{height:'100%', width:'100%'}}
          whenCreated={(m)=>{ window.__leaflet_map = m }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <PointLayer points={filtered} onClick={(id)=>navigate(`/campus/${id}`)} />
        </MapContainer>
      </div>
      {error && <div style={{padding:8, color:'#b00020'}}>Map error: {error}</div>}
    </div>
  )
}

function within(b, lat, lon) {
  if (!b) return true
  const [[s,w],[n,e]] = b
  return lat>=s && lat<=n && lon>=w && lon<=e
}

function PointLayer({ points, onClick }) {
  const bounds = useBounds()
  // only render visible, cap to 600 for perf
  const visible = useMemo(() => {
    if (!points) return []
    const v = []
    for (const p of points) {
      const lat = Number(p.lat), lon = Number(p.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
      if (within(bounds, lat, lon)) v.push(p)
      if (v.length >= 600) break
    }
    return v
  }, [points, bounds])

  return (
    <>
      {visible.map((p, i) => (
        <CircleMarker
          key={p.campus_9 || i}
          center={[Number(p.lat), Number(p.lon)]}
          radius={5}
          pathOptions={{ color: '#FFD700', weight: 1, fillOpacity: 0.9 }}
          eventHandlers={{ click: () => onClick?.(p.campus_9) }}
        >
          <Tooltip sticky>{p.school_name || p.campus_name || 'Campus'}</Tooltip>
        </CircleMarker>
      ))}
    </>
  )
}
