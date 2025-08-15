import React from 'react'

export default function SummaryCards({ data }) {
  if (!data) return null
  const items = [
    { label: 'Districts', value: data.district_count?.toLocaleString() },
    { label: 'Enrollment', value: data.total_enrollment?.toLocaleString() },
    { label: 'Total Spend', value: `$${Math.round(data.total_spend||0).toLocaleString()}` },
    { label: 'Avg Per-Pupil', value: `$${Math.round(data.avg_per_pupil_spend||0).toLocaleString()}` },
    { label: 'Debt Total', value: `$${Math.round(data.debt_total||0).toLocaleString()}` },
  ]
  return (
    <div className="grid">
      {items.map((it, i)=>(
        <div key={i} className="card" style={{textAlign:'center', padding:'14px'}}>
          <div style={{fontSize:12, color:'#6a7a95'}}>{it.label}</div>
          <div style={{fontSize:22, fontWeight:700, color:'var(--blue)'}}>{it.value}</div>
        </div>
      ))}
    </div>
  )
}
