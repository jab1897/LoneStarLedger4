import React from 'react'
import { useParams } from 'react-router-dom'

export default function DistrictDetail(){
  const { id } = useParams()
  return (
    <div className="card">
      <h3>District {id}</h3>
      <div>Detail view coming next step (district map + campuses + stats).</div>
    </div>
  )
}
