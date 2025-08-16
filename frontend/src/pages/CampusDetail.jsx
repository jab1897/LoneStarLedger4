import React from 'react'
import { useParams } from 'react-router-dom'

export default function CampusDetail(){
  const { id } = useParams()
  return (
    <div className="card">
      <h3>Campus {id}</h3>
      <div>Detail view coming next step (campus stats & performance tables).</div>
    </div>
  )
}
