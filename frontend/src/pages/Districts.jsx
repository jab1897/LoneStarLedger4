import React, { useEffect, useState } from 'react'
import { api } from '../api'
import DistrictTable from '../components/DistrictTable'

export default function Districts(){
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let m=true
    ;(async ()=>{
      try{
        setLoading(true)
        const res = await api.listDistricts(50, 0)
        if(!m) return
        setRows(res.items || [])
      }catch(e){ setError(String(e)) }
      finally{ setLoading(false) }
    })()
    return ()=>{ m=false }
  },[])

  return (
    <div className="card">
      <h3>Districts</h3>
      {loading ? <div className="spinner" /> : error ? <div>Error: {error}</div> :
        <DistrictTable rows={rows} />}
    </div>
  )
}
