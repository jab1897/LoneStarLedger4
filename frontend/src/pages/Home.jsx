import React, { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import SearchBar from '../components/SearchBar'
import DistrictMap from '../components/DistrictMap'
import SummaryCards from '../components/SummaryCards'
import SpendChart from '../components/SpendChart'
import DistrictTable from '../components/DistrictTable'
import SchoolTable from '../components/SchoolTable'
import { api } from '../api'

export default function Home() {
  const [summary, setSummary] = useState(null)
  const [districts, setDistricts] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setLoading(true)
        const [sum, d, s] = await Promise.all([
          api.summary().catch(()=>null),
          api.listDistricts(25, 0).then(r => r.items).catch(()=>[]),
          api.listSchools(25, 0).then(r => r.items).catch(()=>[]),
        ])
        if (!alive) return
        setSummary(sum)
        setDistricts(d)
        setSchools(s)
      } catch (e) {
        if (alive) setError(String(e))
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  return (
    <>
      <Hero>
        <SearchBar onPick={(sel)=>{
          if (!sel) return
          if (sel.type === 'district') window.location.href = `/district/${sel.data.district_6}`
          if (sel.type === 'school') window.location.href = `/campus/${sel.data.campus_9}`
        }} />
      </Hero>

      <div className="container">
        {/* Map directly under the blurb */}
        <div className="card">
          <h3>Texas District Map</h3>
          <DistrictMap />
        </div>

        {/* Stats + tables + charts */}
        {loading ? <div className="spinner" /> :
         error ? <div className="card">Error: {error}</div> :
        <>
          <SummaryCards data={summary || {}} />
          <div className="grid" style={{marginTop:12}}>
            <div className="card">
              <h3>Spending Snapshot</h3>
              <SpendChart rows={districts.slice(0,5)} />
            </div>
            <div className="card">
              <h3>Top Districts</h3>
              <DistrictTable rows={districts} onSelect={(row)=> window.location.href = `/district/${row.district_6}`} />
            </div>
          </div>

          <div className="card" style={{marginTop:12}}>
            <h3>Top Schools</h3>
            <SchoolTable rows={schools} onSelect={(row)=> window.location.href = `/campus/${row.campus_9}`} />
          </div>
        </>}
      </div>
    </>
  )
}
