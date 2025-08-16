import React, { useEffect, useState } from 'react'
import { api } from './api'
import SummaryCards from './components/SummaryCards'
import SearchBar from './components/SearchBar'
import DistrictTable from './components/DistrictTable'
import SchoolTable from './components/SchoolTable'
import SpendChart from './components/SpendChart'
import MapView from './components/MapView'
import Drawer from './components/Drawer'
import ErrorBanner from './components/ErrorBanner'

export default function App() {
  const [summary, setSummary] = useState(null)
  const [districts, setDistricts] = useState([])
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selection, setSelection] = useState(null) // { type: 'district'|'school', data: {...} }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const [sum, d, s] = await Promise.all([
          api.summary(),
          api.listDistricts(25, 0).then(r => r.items),
          api.listSchools(25, 0).then(r => r.items),
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

  return (
    <>
      <header>
        <div className="brand">LoneStarLedger</div>
        <div className="tagline">Texas K-12 finance & accountability</div>
      </header>

      <div className="container">
        <div className="row" style={{justifyContent:'space-between', marginBottom:12}}>
          <SearchBar onPick={setSelection} />
          <a className="btn alt" href={api.base} target="_blank" rel="noreferrer">API</a>
        </div>

        {loading ? <div className="spinner" /> :
          <>
            <ErrorBanner message={error} onClose={()=>setError(null)} />
            {!error && <>
              <SummaryCards data={summary} />

              <div className="grid" style={{marginTop:12}}>
                <div className="card">
                  <h3>Top Districts</h3>
                  <DistrictTable rows={districts} onSelect={(row)=>setSelection({type:'district', data:row})}/>
                </div>
                <div className="card">
                  <h3>Top Schools</h3>
                  <SchoolTable rows={schools} onSelect={(row)=>setSelection({type:'school', data:row})}/>
                </div>
              </div>

              <div className="grid" style={{marginTop:12}}>
                <div className="card">
                  <h3>Spending Breakdown (example)</h3>
                  <SpendChart rows={districts.slice(0,5)} />
                </div>
                <div className="card">
                  <h3>Interactive Map</h3>
                  <MapView onFeatureClick={setSelection}/>
                </div>
              </div>
            </>}
          </>
        }
      </div>

      {selection && <Drawer onClose={()=>setSelection(null)}>
        <h3 style={{marginTop:0}}>{selection.type === 'district' ? selection.data.district_name : selection.data.campus_name}</h3>
        {selection.type === 'district' ? (
          <div className="row" style={{gap:16, flexWrap:'wrap'}}>
            <div>Total Spend: ${Number(selection.data.total_spend||0).toLocaleString()}</div>
            <div>Enrollment: {Number(selection.data.enrollment||0).toLocaleString()}</div>
            <div>Per-Pupil: ${Number(selection.data.per_pupil_spend||0).toLocaleString()}</div>
          </div>
        ) : (
          <div className="row" style={{gap:16, flexWrap:'wrap'}}>
            <div>Reading On-Grade: {selection.data.reading_on_grade ?? '—'}%</div>
            <div>Math On-Grade: {selection.data.math_on_grade ?? '—'}%</div>
          </div>
        )}
      </Drawer>}
    </>
  )
}
