import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, GeoJSON, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { api } from '../api'

// Fix default icon URLs for Vite deployments
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const iconUrl       = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const shadowUrl     = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

function ViewportWatcher({ onChange }) {
  const map = useMapEvents({
    moveend() {
      const b = map.getBounds()
      onChange && onChange({ zoom: map.getZoom(), bbox: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] })
    }
  })
  useEffect(() => {
    const b = map.getBounds()
    onChange && onChange({ zoom: map.getZoom(), bbox: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

export default function MapView({ onFeatureClick }) {
  const [districts, setDistricts] = useState(null)
  const [bins, setBins] = useState([])       // [{lat,lon,count}]
  const [points, setPoints] = useState([])   // [{lat,lon,campus_9,school_name,district_6}]
  const [showCampuses, setShowCampuses] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const viewRef = useRef({ zoom: 6, bbox: [-107,25,-93,37] })
  const abortRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    let mounted = true
    api.geoDistricts().then(g => { if (mounted) setDistricts(g) }).catch(()=>{})
    return () => { mounted=false }
  }, [])

  function onViewportChange(v) {
    viewRef.current = v
    // Debounce to avoid spamming during quick pans
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (showCampuses) fetchData()
    }, 220)
  }

  async function fetchData() {
    const { zoom, bbox } = viewRef.current
    if (!showCampuses) return

    // Mode switch: bins for zoom < 12, points for >= 12
    const useBins = zoom < 12

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true); setErr(null)

    try {
      if (useBins) {
        const url = `${api.base}/geojson/campuses_bins?bbox=${bbox.join(',')}&zoom=${zoom}`
        const res = await fetch(url, { signal: ctrl.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setBins(data); setPoints([]) // clear the other layer
      } else {
        const url = `${api.base}/geojson/campuses_points?bbox=${bbox.join(',')}`
        const res = await fetch(url, { signal: ctrl.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        // Guard against absurd loads
        if (data.length > 4000) {
          // Instead of trying to render all, suggest closer zoom
          setBins([]); setPoints([]); throw new Error(`Too many points (${data.length}). Zoom in.`)
        }
        setPoints(data); setBins([])
      }
    } catch (e) {
      if (e.name !== 'AbortError') setErr(String(e))
    } finally {
      setLoading(false)
    }
  }

  function toggleCampuses() {
    setShowCampuses(v => {
      const next = !v
      if (next) fetchData()
      return next
    })
  }

  function BinsLayer() {
    if (!showCampuses || !bins?.length) return null
    // Render bins as compact count markers
    return (
      <>
        {bins.map((b, i) => (
          <Marker key={i}
            position={[b.lat, b.lon]}
            icon={L.divIcon({
              className: 'bin-marker',
              html: `<div class="bin-dot"><span>${b.count}</span></div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
            eventHandlers={{
              click: (e) => {
                // nudge user to detail: zoom in one level at clicked bin
                const map = e.target._map
                map.setView([b.lat, b.lon], Math.min(map.getZoom()+1, 18))
              }
            }}
          />
        ))}
      </>
    )
  }

  function PointsClusterLayer() {
    const items = points || []
    if (!showCampuses || !items.length) return null
    return (
      <MarkerClusterGroup chunkedLoading maxClusterRadius={60}>
        {items.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lon]} eventHandlers={{
            click: () => onFeatureClick?.({ type:'school', data: {
              campus_name: p.school_name || 'Campus',
              campus_9: p.campus_9,
              district_6: p.district_6
            }})
          }} />
        ))}
      </MarkerClusterGroup>
    )
  }

  return (
    <>
      <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
        <div className="row" style={{gap:8, alignItems:'center'}}>
          <button className="btn" onClick={toggleCampuses}>
            {showCampuses ? 'Hide' : 'Show'} Campuses
          </button>
          <div style={{fontSize:12, color:'#6a7a95'}}>
            {showCampuses
              ? (loading ? 'loading…' : (points.length ? `${points.length.toLocaleString()} points` : (bins.length ? `${bins.length} clusters` : 'ready')))
              : 'zoom for details (clusters <12, points ≥12)'}
          </div>
        </div>
        {err && <div style={{fontSize:12, color:'#a33'}}>Error: {err}</div>}
      </div>

      <div style={{height:360, borderRadius:12, overflow:'hidden', position:'relative'}}>
        {loading && <div className="map-loading">Loading…</div>}
        <MapContainer center={[31.0, -99.0]} zoom={6} preferCanvas={true} style={{height:'100%', width:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ViewportWatcher onChange={onViewportChange} />
          {districts && <GeoJSON data={districts} style={{color:'#003366', weight:1, fillOpacity:0.1}}
            onEachFeature={(feature, layer) => {
              layer.on('click', () => {
                const props = feature.properties || {}
                onFeatureClick?.({ type:'district', data: {
                  district_name: props.name || props.DISTNAME || 'District',
                  district_6: props.district_6 || props.DISTRICT_N
                }})
              })
            }}
          />}
          <BinsLayer />
          <PointsClusterLayer />
        </MapContainer>
      </div>
    </>
  )
}
