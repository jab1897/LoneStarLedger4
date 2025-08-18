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
      try { const c = await api.getSchool(id); if (alive) setCampus(c) } catch {}
      finally { if (alive) setLoading(false) }
    })()
    return () => { alive=false }
  }, [id])

  return (
    <div className="container" style={{paddingTop:12}}>
      <h2 style={{margin:'4px 0 8px'}}>{campus?.campus_name || `Campus ${id}`}</h2>
      {loading ? <KpiRow /> :
        <div className="grid">
          <div className="card kpi"><div className="k-label">Reading % on-grade</div><div className="k-val">{fmtMaybe(campus?.reading_on_grade)}</div></div>
          <div className="card kpi"><div className="k-label">Math % on-grade</div><div className="k-val">{fmtMaybe(campus?.math_on_grade)}</div></div>
          <div className="card kpi"><div className="k-label">District</div><div className="k-val">{campus?.district_6 || '—'}</div></div>
          <div className="card kpi"><div className="k-label">Level</div><div className="k-val">{campus?.level || '—'}</div></div>
        </div>
      }
    </div>
  )
}
