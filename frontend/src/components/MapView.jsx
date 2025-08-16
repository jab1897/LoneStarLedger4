import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'

// ---- small LRU cache for bin requests ----
class LRU {
  constructor(limit=80){ this.limit = limit; this.map = new Map() }
  get(k){ if(!this.map.has(k)) return; const v=this.map.get(k); this.map.delete(k); this.map.set(k,v); return v }
  set(k,v){ if(this.map.has(k)) this.map.delete(k); this.map.set(k,v); if(this.map.size>this.limit) this.map.delete(this.map.keys().next().value) }
}
const cache = new LRU()

const clamp = (v,a,b)=>Math.min(b, Math.max(a, v))

function BinsLayer({ onFeatureClick }) {
  const [fc, setFc] = useState(null)
  const [loading, setLoading] = useState(false)
  const debRef = useRef(null)

  async function fetchBins(bbox, zoom) {
    const round=(n,p=3)=>Number(n.toFixed(p))
    const key = `${round(bbox.getWest(),3)},${round(bbox.getSouth(),3)},${round(bbox.getEast(),3)},${round(bbox.getNorth(),3)}@${zoom}`
    const cached = cache.get(key)
    if (cached) return cached
    const url = `${api.base}/geojson/campuses_bins?bbox=${bbox.getWest()},${bbox.getSouth()},${bbox.getEast()},${bbox.getNorth()}&zoom=${zoom}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const gj = await res.json()
    cache.set(key, gj)
    return gj
  }

  useMapEvents({
    load: () => schedule(),
    moveend: () => schedule(),
    zoomend: () => schedule(),
  })

  function schedule(){
    if (debRef.current) clearTimeout(debRef.current)
    debRef.current = setTimeout(update, 160)
  }

  async function update(){
    try {
      const map = window.__rlMap
      if (!map) return
      const z = clamp(map.getZoom(), 4, 18)
      const bbox = map.getBounds()
      setLoading(true)
      const gj = await fetchBins(bbox, z)
      setFc(gj)
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }

  const pointToLayer = (feat, latlng) => {
    const c = Number(feat.properties?.count || 1)
    const r = Math.max(2, Math.min(18, 2 + Math.log2(c+1)*3))
    return L.circleMarker(latlng, {
      radius: r,
      renderer: window.__canvasRenderer,
      color: '#003366',
      weight: 0.5,
      fillColor: '#003366',
      fillOpacity: 0.35,
      bubblingMouseEvents: false,
    })
  }

  const onEach = (feat, layer) => {
    const p = feat.properties || {}
    const label = p.count ? `${p.count} campus${p.count===1?'':'es'}` : 'Campus'
    layer.bindTooltip(label, {sticky:true, direction:'top', offset:[0,-6]})
    layer.on('click', ()=> onFeatureClick?.({ type:'bin', data:p }))
  }

  return (<>{loading && <div className="spinner" />}{fc && <GeoJSON data={fc} pointToLayer={pointToLayer} onEachFeature={onEach} />}</>)
}

// ---- districts polygons (simplified), only visible at low zoom or toggle ----
function DistrictsLayer({ visible }) {
  const [g, setG] = useState(null)
  const fetched = useRef(false)
  useEffect(()=>{
    if (!visible || fetched.current) return
    fetched.current = true
    fetch(`${api.base}/geojson/districts`)
      .then(r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(setG)
      .catch(err => { console.error('districts fetch', err); fetched.current=false })
  }, [visible])

  if (!visible || !g) return null
  const style = () => ({
    color: '#003366',
    weight: 0.6,
    fillOpacity: 0.05,
    renderer: window.__canvasRenderer,
  })
  return <GeoJSON data={g} style={style} />
}

export default function MapView({ onFeatureClick }) {
  const [zoom, setZoom] = useState(6)
  const [showDistricts, setShowDistricts] = useState(true)

  const whenCreated = (m) => {
    window.__rlMap = m
    window.__canvasRenderer = L.canvas({ padding: 0.5 })
  }

  function ZoomWatcher(){
    useMapEvents({
      zoomend: (e)=> setZoom(e.target.getZoom()),
      load: (e)=> setZoom(e.target.getZoom()),
    })
    return null
  }

  const districtsVisible = showDistricts && zoom <= 7

  return (
    <div style={{position:'relative', height:360, borderRadius:12, overflow:'hidden'}}>
      <div style={{
        position:'absolute', zIndex: 500, right: 10, top: 10,
        background:'#fff', borderRadius:8, padding:'6px 10px',
        boxShadow:'0 6px 18px rgba(0,0,0,0.08)', fontSize:13
      }}>
        <label style={{display:'flex', gap:8, alignItems:'center', cursor:'pointer'}}>
          <input type="checkbox" checked={showDistricts} onChange={e=>setShowDistricts(e.target.checked)} />
          Show districts (low zoom)
        </label>
      </div>

      <MapContainer
        center={[31.0, -99.0]}
        zoom={6}
        minZoom={5}
        preferCanvas={true}
        whenCreated={whenCreated}
        style={{height:'100%', width:'100%'}}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomWatcher />
        <DistrictsLayer visible={districtsVisible} />
        <BinsLayer onFeatureClick={onFeatureClick} />
      </MapContainer>
    </div>
  )
}
