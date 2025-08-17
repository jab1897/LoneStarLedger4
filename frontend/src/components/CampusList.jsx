import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CampusList({ campuses=[] }) {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const rows = useMemo(()=>{
    const t = q.trim().toLowerCase()
    let r = campuses
    if (t) r = r.filter(c => (c.school_name||c.campus_name||'').toLowerCase().includes(t))
    return r.slice(0, 500) // cap for UI
  }, [campuses, q])
  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between', marginBottom:8}}>
        <h3 style={{margin:0}}>Campuses in District</h3>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search campus..." aria-label="search campuses"
          style={{padding:'8px 10px', border:'1px solid #d7ddea', borderRadius:10}} />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Campus</th><th>Level</th><th>Reading %</th><th>Math %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c,i)=>{
            const id = c.campus_9 || c.CAMPUS || c.id
            const name = c.school_name || c.campus_name || c.NAME || 'Campus'
            const level = c.level || c.campus_level || c.SCHOOL_TYPE || '—'
            const r = c.reading_on_grade ?? c.READ_ON ?? c.reading
            const m = c.math_on_grade ?? c.MATH_ON ?? c.math
            return (
              <tr key={i} style={{cursor:'pointer'}} onClick={()=> id && nav(`/campus/${id}`)}>
                <td>{name}</td>
                <td>{level}</td>
                <td>{(r!=null)? `${r}%` : '—'}</td>
                <td>{(m!=null)? `${m}%` : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
