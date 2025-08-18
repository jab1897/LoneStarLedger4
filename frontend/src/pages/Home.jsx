import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { fmtMaybe } from '../lib/formatters'
import MapDistricts from '../components/MapDistricts'
import { KpiRow, MapBox } from '../components/Skeleton'

export default function Home() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try { const s = await api.summary(); if (alive) setSummary(s) } catch {}
      finally { if (alive) setLoading(false) }
    })()
    return () => { alive=false }
  }, [])

  return (
    <>
      <section className="hero"><div className="hero-overlay" />
        <div className="hero-inner">
          <h1>K-12 finance & accountability</h1>
          <p className="blurb">Transparent, statewide look at district spending, student performance, and staffing. Search by district or campus, click the map, or explore the tabs.</p>
        </div>
      </section>

      <div className="container">
        <h3 className="section-title">Texas Overview</h3>
        {loading ? <KpiRow /> :
          <div className="grid">
            <div className="card kpi"><div className="k-label">Districts</div><div className="k-val">{fmtMaybe(summary?.district_count)}</div></div>
            <div className="card kpi"><div className="k-label">Enrollment</div><div className="k-val">{fmtMaybe(summary?.total_enrollment)}</div></div>
            <div className="card kpi"><div className="k-label">Total Spend</div><div className="k-val">{fmtMaybe(summary?.total_spend,'money')}</div></div>
            <div className="card kpi"><div className="k-label">Avg Per-Pupil</div><div className="k-val">{fmtMaybe(summary?.avg_per_pupil_spend,'money')}</div></div>
          </div>
        }

        <h3 className="section-title" style={{marginTop:16}}>Texas District Map</h3>
        {loading ? <MapBox /> : <MapDistricts />}
      </div>
    </>
  )
}
