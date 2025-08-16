import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'

// Simple LRU cache to avoid refetching the same tiles repeatedly
class LRU {
  constructor(limit=40){ this.limit = limit; this.map = new Map() }
  get(k){ if(!this.map.has(k)) return; const v = this.map.get(k); this.map.delete(k); this.map.set(k, v); return v }
  set(k, v){ if(this.map.has(k)) this.map.delete(k); this.map.set(k, v); if(this.map.size>this.limit) this.map.delete(this.map.keys().next().value) }
}

const cache = new LRU(80)
const clamp = (v,a,b)=>Math.min(b, Math.max(a, v))

function BinsLayer({ onFeatureClick }) {
  const [fc, setFc] = useState(null)
  const [loading, setLoading] = useState(false)
  const debRef = useRef(null)
  const inflight = useRef({}) // key -> AbortController

  const fetchBins = async (bbox, zoom) => {
    const round = (n, p=3) => Number(n.toFixed(p))
    const key = `${round(bbox.getWest(),3)},${round(bbox.getSouth(),3)},${round(bbox.getEast(),3)},${round(bbox.getNorth(),3)}@${zoom}`
    const cached = cache.get(key)
    if (cached) return cached

    const ctrl = new AbortController()
    inflight.current[key] = ctrl
    const url = `${api.base}/geojson/campuses_bins?bbox=${bbox.getWest()},${bbox.getSouth()},${bbox.getEast()},${bbox.getNorth()}&zoom=${zoom}`
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const gj = await res.json()
    cache.set(key, gj)
    delete inflight.current[key]
    return gj
  }

  // Debounced viewport listener
  useMapEvents({
    moveend: () => scheduleUpdate(),
    zoomend: ()  => scheduleUpdate(),
    load:    ()  => scheduleUpdate(),
  })

  function scheduleUpdate() {
    if (debRef.current) clearTimeout(debRef.current)
    debRef.current = setTimeout(update, 180) // debounce
  }

  async function update() {
    try {
      const map = window.__rlMap
      if (!map) return
      const z = clamp(map.getZoom(), 4, 18)
      const bbox = map.getBounds()
      setLoading(true)
      const gj = await fetchBins(bbox, z)
      setFc(gj)
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  // Styling: circle bins (canvas renderer is enabled on the MapContainer)
  const pointToLayer = (feat, latlng) => {
    const c = Number(feat.properties?.count || 1)
    const r = Math.max(2, Math.min(18, 2 + Math.log2(c+1)*3))
    return L.circleMarker(latlng, {
      radius: r,
      renderer: window.__canvasRenderer, // force canvas
      color: '#003366',
      weight: 0.5,
      fillColor: '#003366',
      fillOpacity: 0.35,
      bubblingMouseEvents: false,
    })
  }

  const onEach = (feat, layer) => {
    const p = feat.properties||{}
    const label = p.count ? `${p.count} campus${p.count===1?'':'es'}` : 'Campus'
    layer.bindTooltip(label, {sticky: true, direction:'top', offset:[0,-6]})
    layer.on('click', () => onFeatureClick?.({ type:'bin', data: p }))
  }

  return (
    <>
      {loading && <div className="spinner" />}
      {fc && <GeoJSON data={fc} pointToLayer={pointToLayer} onEachFeature={onEach} />}
    </>
  )
}

export default function MapView({ onFeatureClick }) {
  // Stash map + a canvas renderer on window to avoid recreating objects
  const mapRef = useRef(null)
  const whenCreated = (m) => {
    window.__rlMap = m
    window.__canvasRenderer = L.canvas({ padding: 0.5 })
  }

  return (
    <div style={{height:360, borderRadius:12, overflow:'hidden'}}>
      <MapContainer
        center={[31.0, -99.0]}
        zoom={6}
        minZoom={5}
        preferCanvas={true}
        whenCreated={whenCreated}
        ref={mapRef}
        style={{height:'100%', width:'100%'}}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <BinsLayer onFeatureClick={onFeatureClick} />
      </MapContainer>
    </div>
  )
}
