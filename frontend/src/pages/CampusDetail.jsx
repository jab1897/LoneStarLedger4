import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../api'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'

const dot = L.divIcon({ className:'', html:'<div style="width:12px;height:12px;border-radius:50%;background:#FFD700;border:1px solid #fff"></div>', iconSize:[12,12] })

function Stat({label, value}) {
  return (
    <div className="card" style={{textAlign:'center', padding:'14px'}}>
      <div style={{fontSize:12, color:'#6a7a95'}}>{label}</div>
      <div style={{fontSize:18, fontWeight:700, color:'var(--blue)'}}>{value ?? '—'}</div>
    </div>
  )
}

export default function CampusDetail(){
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [pt, setPt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let m=true
    ;(async()=>{
      try{
        setLoading(true)
        const d = await api.getSchool(id).catch(()=> ({}))
        let p = null
        try {
          const pts = await api.campusPoints()
          p = pts.find(x => String(x.campus_9||x.CAMPUS||x.id) === String(id)) || null
        } catch {}
        if (!p) {
          # fallback: try geojson (expensive)
          try {
            const g = await api.geoCampuses()
            const ft = (g.features||[]).find(ft=> {
              const c = ft.properties||{}
              return String(c.campus_9||c.CAMPUS||c.id) === String(id)
            })
            if (ft && Array.isArray(ft.geometry?.coordinates)) {
              p = { coords: ft.geometry.coordinates, ...ft.properties }
            }
          } catch {}
        }
        if (!m) return
        setDetail(d||{})
        setPt(p)
      } finally { setLoading(false) }
    })()
    return ()=>{ m=false }
  }, [id])

  const pos = useMemo(()=>{
    if (!pt) return [31,-99]
    const lat = pt.lat || pt.latitude || pt.LAT || (Array.isArray(pt.coords)? pt.coords[1] : null)
    const lng = pt.lng || pt.longitude || pt.LON || (Array.isArray(pt.coords)? pt.coords[0] : null)
    return (lat!=null && lng!=null) ? [lat,lng] : [31,-99]
  }, [pt])

  return (
    <>
      <Navbar />
      <div className="container" style={{marginTop:12}}>
        <h2 style={{margin:'6px 0', color:'var(--blue)'}}>Campus {id}</h2>
        {loading ? <div className="spinner" /> :
        <>
          <div className="grid" style={{marginBottom:12}}>
            <div className="card">
              <h3>Location</h3>
              <div style={{height:360, borderRadius:12, overflow:'hidden'}}>
                <MapContainer center={pos} zoom={12} style={{height:'100%', width:'100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {pt && <Marker position={pos} icon={dot}><Tooltip sticky>{pt.school_name || pt.campus_name || 'Campus'}</Tooltip></Marker>}
                </MapContainer>
              </div>
            </div>
            <div className="card">
              <h3>Campus Stats</h3>
              <div className="grid">
                <Stat label="Reading On-Grade" value={detail?.reading_on_grade != null ? `${detail.reading_on_grade}%` : '—'} />
                <Stat label="Math On-Grade" value={detail?.math_on_grade != null ? `${detail.math_on_grade}%` : '—'} />
                <Stat label="Accountability" value={detail?.accountability_rating || '—'} />
                <Stat label="Principal" value={detail?.principal || '—'} />
              </div>
            </div>
          </div>
        </>}
      </div>
    </>
  )
}
