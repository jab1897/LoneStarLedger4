import React, { useState } from 'react'

export default function FiltersBar({ onApply }) {
  const [minPP, setMinPP] = useState('')
  const [minR, setMinR]   = useState('')
  const [minM, setMinM]   = useState('')

  function apply() {
    onApply?.({
      min_per_pupil: minPP ? Number(minPP) : undefined,
      min_reading:   minR  ? Number(minR)  : undefined,
      min_math:      minM  ? Number(minM)  : undefined
    })
  }

  return (
    <div className="card" style={{display:'flex', gap:8, alignItems:'center'}}>
      <div style={{fontWeight:600, color:'var(--blue)'}}>Filters</div>
      <input type="number" placeholder="Min Per-Pupil $" value={minPP} onChange={e=>setMinPP(e.target.value)}
             style={{padding:8, border:'1px solid #e1e6f0', borderRadius:8, width:140}} />
      <input type="number" placeholder="Min Reading %" value={minR} onChange={e=>setMinR(e.target.value)}
             style={{padding:8, border:'1px solid #e1e6f0', borderRadius:8, width:140}} />
      <input type="number" placeholder="Min Math %" value={minM} onChange={e=>setMinM(e.target.value)}
             style={{padding:8, border:'1px solid #e1e6f0', borderRadius:8, width:140}} />
      <button className="btn" onClick={apply}>Apply</button>
    </div>
  )
}
