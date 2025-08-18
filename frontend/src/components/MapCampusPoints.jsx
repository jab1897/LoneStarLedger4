import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

export default function MapCampusPoints({ districtId, center=[31,-99], zoom=9, height=420 }) {
  const [pts, setPts] = useState(null)
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let alive = True
    alive = true
    api.campusPoints()
      .then(p => { if (alive) setPts(Array.isArray(p?.items) ? p.items : p) })
      .catch(e => { if (alive) setErr(String(e)) })
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => {
    if (!pts) return []
    return pts.filter(r => String(r.district_6) == String(districtId))
  }, [pts, districtId])

  return (
    <div className="card">
      <div style={{height, borderRadius:12, overflow:'hidden'}}>
        <MapContainer center={center} zoom={zoom} style={{height:'100%', width:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map((p, i) => {
            const lat = Number(p.lat), lon = Number(p.lon)
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
            return (
              <CircleMarker key={p.campus_9 || i} center={[lat, lon]} radius={5}
                            pathOptions={{color:'#FFD700', weight:1, fillOpacity:.9}}
                            eventHandlers={{ click:()=>navigate(`/campus/${p.campus_9}`) }}>
                <Tooltip sticky>{p.school_name || p.campus_name || 'Campus'}</Tooltip>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
      {err && <div style={{padding:8, color:'#b00020'}}>Map error: {err}</div>}
    </div>
  )
}
