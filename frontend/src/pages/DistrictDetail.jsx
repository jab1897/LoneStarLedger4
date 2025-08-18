import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import { fmtMaybe } from '../lib/formatters'
import MapPoints from '../components/MapPoints'
import { KpiRow, MapBox } from '../components/Skeleton'

export default function DistrictDetail() {
  const { id } = useParams()
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const d = await api.getDistrict(id)
        if (alive) setDetails(d)
      } catch {}
      finally { if (alive) setLoading(false) }
    })()
    return () => { alive=false }
  }, [id])

  const name = details?.district_name || `District ${id}`
  const center = [31,-99] // optional: compute centroid later

  return (
    <>
      <div className="container" style={{paddingTop:12}}>
        <h2 style={{margin:'4px 0 8px'}}>{name}</h2>
        {loading
          ? <KpiRow />
          : <div className="grid">
              <div className="card kpi"><div className="k-label">Enrollment</div><div className="k-val">{fmtMaybe(details?.enrollment,'number')}</div></div>
              <div className="card kpi"><div className="k-label">Total Spend</div><div className="k-val">{fmtMaybe(details?.total_spend,'money')}</div></div>
              <div className="card kpi"><div className="k-label">Per-Pupil</div><div className="k-val">{fmtMaybe(details?.per_pupil_spend,'money')}</div></div>
              <div className="card kpi"><div className="k-label">Debt</div><div className="k-val">{fmtMaybe(details?.debt_total,'money')}</div></div>
            </div>
        }

        <h3 className="section-title" style={{marginTop:16}}>Campuses</h3>
        {loading ? <MapBox /> : <MapPoints districtId={id} center={center} zoom={9} />}
      </div>
    </>
  )
}
