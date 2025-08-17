import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import { api } from './api'
import SummaryCards from './components/SummaryCards'
import SearchBar from './components/SearchBar'
import DistrictTable from './components/DistrictTable'
import SchoolTable from './components/SchoolTable'
import SpendChart from './components/SpendChart'
import MapView from './components/MapView'

export default function App() {
  const [summary, setSummary] = useState(null)
  const [districts, setDistricts] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const [sum, d, s] = await Promise.all([
          api.summary().catch(()=>({})),
          api.listDistricts(25, 0).then(r => r.items).catch(()=>[]),
          api.listSchools(25, 0).then(r => r.items).catch(()=>[]),
        ])
        if (!mounted) return
        setSummary(sum)
        setDistricts(d)
        setSchools(s)
      } catch (e) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  function handlePick(sel){
    if (!sel) return
    if (sel.type === 'district') {
      const id = sel.data?.district_6 || sel.data?.DISTRICT_N || sel.data?.id
      if (id) nav(`/district/${id}`)
    } else if (sel.type === 'school') {
      const id = sel.data?.campus_9 || sel.data?.CAMPUS || sel.data?.id
      if (id) nav(`/campus/${id}`)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row" style={{justifyContent:'space-between', marginTop:12, marginBottom:12}}>
          <div>
            <div style={{fontWeight:700, color:'var(--blue)'}}>K-12 finance & accountability</div>
            <div style={{fontSize:13, color:'#56627a', maxWidth:680}}>
              Transparent, statewide look at district spending, student performance, and staffing. Search by district or campus, or click the map.
            </div>
          </div>
          <div style={{minWidth:300}}>
            <SearchBar onPick={handlePick} />
          </div>
        </div>

        {loading ? <div className="spinner" /> : error ? <div className="card">Error: {error}</div> :
        <>
          <SummaryCards data={summary} />

          <div className="grid" style={{marginTop:12}}>
            <div className="card">
              <h3>Texas District Map</h3>
              <MapView onFeatureClick={(sel)=>{
                if (!sel) return
                if (sel.type==='district' && sel.data?.district_6) nav(`/district/${sel.data.district_6}`)
                if (sel.type==='school') {
                  const id = sel.data?.campus_9 || sel.data?.id
                  if (id) nav(`/campus/${id}`)
                }
              }} />
            </div>
            <div className="card">
              <h3>Spending Snapshot</h3>
              <SpendChart rows={districts.slice(0,5)} />
            </div>
          </div>

          <div className="grid" style={{marginTop:12}}>
            <div className="card">
              <h3>Top Districts</h3>
              <DistrictTable rows={districts} onSelect={(row)=>{
                const id = row?.district_6 || row?.DISTRICT_N || row?.id
                if (id) nav(`/district/${id}`)
              }}/>
            </div>
            <div className="card">
              <h3>Top Schools</h3>
              <SchoolTable rows={schools} onSelect={(row)=>{
                const id = row?.campus_9 || row?.CAMPUS || row?.id
                if (id) nav(`/campus/${id}`)
              }}/>
            </div>
          </div>
        </>}
      </div>
    </>
  )
}
