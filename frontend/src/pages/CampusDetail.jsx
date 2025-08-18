import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import { fmtMaybe } from '../lib/formatters'
import { KpiRow } from '../components/Skeleton'

export default function CampusDetail() {
  const { id } = useParams()
  const [campus, setCampus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const c = await api.getSchool(id)
        if (alive) setCampus(c)
      } catch {}
      finally { if (alive) setLoading(false) }
    })()
    return () => { alive=false }
  }, [id])

  const title = campus?.campus_name || `Campus ${id}`

  return (
    <div className="container" style={{paddingTop:12}}>
      <h2 style={{margin:'4px 0 8px'}}>{title}</h2>
      {loading
        ? <KpiRow />
        : <div className="grid">
            <div className="card kpi"><div className="k-label">Reading %</div><div className="k-val">{fmtMaybe(campus?.reading_on_grade,'number')}</div></div>
            <div className="card kpi"><div className="k-label">Math %</div><div className="k-val">{fmtMaybe(campus?.math_on_grade,'number')}</div></div>
            <div className="card kpi"><div className="k-label">District</div><div className="k-val">{campus?.district_6 || '—'}</div></div>
            <div className="card kpi"><div className="k-label">Level</div><div className="k-val">{campus?.level || '—'}</div></div>
          </div>
      }
      <div className="card" style={{marginTop:12}}>
        <div style={{padding:8}}>More performance & accountability charts coming soon.</div>
      </div>
    </div>
  )
}
