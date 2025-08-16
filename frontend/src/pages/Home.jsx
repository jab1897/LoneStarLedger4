import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import SummaryCards from '../components/SummaryCards'
import SearchBar from '../components/SearchBar'
import LandingMap from '../components/LandingMap'

export default function Home(){
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    let m=true
    ;(async()=>{
      try{
        setLoading(true)
        const sum = await api.summary()  // reuses existing /summary
        if(!m) return
        setSummary(sum)
      }catch(e){ setError(String(e)) }
      finally{ setLoading(false) }
    })()
    return ()=>{ m=false }
  },[])

  return (
    <>
      <section className="card" style={{marginBottom:12}}>
        <h2 style={{margin:'6px 0 6px', color:'var(--blue)'}}>LoneStarLedger</h2>
        <div style={{opacity:0.85}}>
          K-12 finance & accountability transparency for Texas. Explore statewide spending, zoom to your district, and view campus performance.
        </div>
        <div className="row" style={{marginTop:10}}>
          <div style={{minWidth:280, flex:'0 1 360px'}}>
            <SearchBar onPick={(sel)=>{
              if (!sel) return
              if (sel.type === 'district') navigate(`/district/${sel.data.district_6}`)
              else if (sel.type === 'school') navigate(`/campus/${sel.data.campus_9}`)
            }} />
          </div>
          <button className="btn" onClick={()=>{
            if (!navigator.geolocation) return alert('Geolocation not available')
            navigator.geolocation.getCurrentPosition(
              pos => window.dispatchEvent(new CustomEvent('center-on', { detail: { lat: pos.coords.latitude, lng: pos.coords.longitude } })),
              () => alert('Location permission denied')
            )
          }}>Use my location</button>
        </div>
      </section>

      <section className="card" style={{marginBottom:12}}>
        <h3>Texas School Districts</h3>
        <LandingMap />
        <div style={{fontSize:12, opacity:0.7, marginTop:8}}>Hover to see district names. Click to open the district page.</div>
      </section>

      <section className="card">
        <h3>Statewide snapshot</h3>
        {loading ? <div className="spinner" /> : error ? <div>Error: {error}</div> : <SummaryCards data={summary} />}
      </section>
    </>
  )
}
