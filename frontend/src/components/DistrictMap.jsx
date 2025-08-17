import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'

function FitToFeatureBounds({ feature }) {
  const map = useMap()
  useEffect(() => {
    if (!feature) return
    try {
      const layer = new L.GeoJSON(feature)
      const b = layer.getBounds()
      if (b && b.isValid()) map.fitBounds(b, { padding: [20,20] })
    } catch {}
  }, [feature, map])
  return null
}

function getDistrictName(props) {
  return props?.name || props?.DISTNAME || props?.NAME || 'District'
}
function getDistrictId(props) {
  return props?.district_6 || props?.DISTRICT_N || props?.DISTRICT || props?.CD
}
function levelFromProps(p) {
  const v = (p?.level || p?.campus_level || p?.SCHOOL_TYPE || p?.type || p?.SCHOOLLEVEL || "").toString().toLowerCase()
  if (v.includes('elementary') || v.includes('elem')) return 'elementary'
  if (v.includes('middle') || v.includes('junior')) return 'middle'
  if (v.includes('high')) return 'high'
  const n = (p?.school_name || p?.NAME || "").toLowerCase()
  if (n.includes('elementary')) return 'elementary'
  if (n.includes('middle')) return 'middle'
  if (n.includes('high')) return 'high'
  return 'other'
}
function ratingFromProps(p) {
  const raw = (p?.accountability_rating || p?.rating || p?.AF || p?.GRADE || "").toString().toUpperCase()
  const letter = raw.match(/[A-F]/)?.[0] || 'NR'
  return letter
}

const COLORS = {
  level: { elementary: '#FFD700', middle: '#003366', high: '#4CAF50', other: '#888' },
  rating: { A:'#2E7D32', B:'#4CAF50', C:'#F9A825', D:'#EF6C00', F:'#C62828', NR:'#9E9E9E' }
}

function makeDotIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:1px solid #ffffff;box-shadow:0 0 0 1px rgba(0,0,0,.2)"></div>`,
    iconSize: [12, 12]
  })
}

export default function DistrictMap({ districtId, colorMode='level', campuses=[], onCampusClick }) {
  const [districts, setDistricts] = useState(null)
  const [feature, setFeature] = useState(null)

  // load districts once
  useEffect(()=>{
    let m=true
    api.geoDistricts().then(g=>{ if(m) setDistricts(g) }).catch(()=>{})
    return ()=>{ m=false }
  },[])

  // pick current district feature
  useEffect(()=>{
    if (!districts || !districtId) return
    const f = (districts.features || []).find(ft=>{
      const props = ft.properties || {}
      const id = getDistrictId(props)
      return String(id) == String(districtId)
    })
    setFeature(f || null)
  }, [districts, districtId])

  const points = useMemo(()=>{
    return (campuses||[]).filter(c => String(c.district_6||c.DISTRICT_N||c.district) === String(districtId))
  }, [campuses, districtId])

  return (
    <div style={{height:420, borderRadius:12, overflow:'hidden'}}>
      <MapContainer center={[31,-99]} zoom={8} style={{height:'100%', width:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {feature && <GeoJSON data={feature} style={{color:'#003366', weight:2, fillOpacity:0.08}} />}
        {feature && <FitToFeatureBounds feature={feature} />}

        <MarkerClusterGroup chunkedLoading>
          {points.map((p, i) => {
            const lat = p.lat || p.latitude || p.LAT || (Array.isArray(p.coords)? p.coords[1] : null)
            const lng = p.lng || p.longitude || p.LON || (Array.isArray(p.coords)? p.coords[0] : null)
            if (lat==null || lng==null) return null
            const color = (colorMode === 'level')
              ? (COLORS.level[levelFromProps(p)] || '#888')
              : (COLORS.rating[ratingFromProps(p)] || '#9E9E9E')
            const name = p.school_name || p.campus_name || p.NAME || 'Campus'
            const id = p.campus_9 || p.CAMPUS || p.CAMPUS_ID || p.id
            return (
              <Marker key={i} position={[lat,lng]} icon={makeDotIcon(color)} eventHandlers={{
                click: ()=> id && onCampusClick?.(id)
              }}>
                <Tooltip sticky>{name}</Tooltip>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
