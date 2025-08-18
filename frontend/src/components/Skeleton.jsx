import React from 'react'

export function KpiRow() {
  return (
    <div className="grid">
      {[...Array(4)].map((_,i)=>(
        <div key={i} className="card skeleton" style={{height:84}} />
      ))}
    </div>
  )
}

export function MapBox() {
  return <div className="card skeleton" style={{height:360, marginTop:12}} />
}
