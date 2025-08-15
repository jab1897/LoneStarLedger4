import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function SpendChart({ rows=[] }) {
  const data = rows.map(r=>({
    name: r.district_name?.split(' ISD')[0] || r.district_name,
    perPupil: Number(r.per_pupil_spend||0)
  }))
  if (!data.length) return <div style={{padding:8}}>No data.</div>
  return (
    <div style={{width:'100%', height:260}}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" hide={false} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="perPupil" />
        </BarChart>
      </ResponsiveContainer>
      <div className="legend" style={{marginTop:8}}>
        <span className="swatch" style={{background:'var(--blue)'}}></span> Per-Pupil Spend
      </div>
    </div>
  )
}
