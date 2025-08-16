import React, { useEffect, useState } from 'react'
import { api } from '../api'
import SchoolTable from '../components/SchoolTable'

export default function Campuses(){
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let m=true
    ;(async ()=>{
      try{
        setLoading(true)
        const res = await api.listSchools(50, 0)
        if(!m) return
        setRows(res.items || [])
      }catch(e){ setError(String(e)) }
      finally{ setLoading(false) }
    })()
    return ()=>{ m=false }
  },[])

  return (
    <div className="card">
      <h3>Campuses</h3>
      {loading ? <div className="spinner" /> : error ? <div>Error: {error}</div> :
        <SchoolTable rows={rows} />}
    </div>
  )
}
