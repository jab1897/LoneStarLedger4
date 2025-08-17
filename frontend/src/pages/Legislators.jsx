import React from 'react'
import Navbar from '../components/Navbar'

export default function Legislators(){
  return (
    <>
      <Navbar />
      <div className="container" style={{marginTop:12}}>
        <h2 style={{margin:'6px 0', color:'var(--blue)'}}>Legislators</h2>
        <div className="card">
          <p>Search coming soon: find a legislator by name or district (e.g., "House 52", "Senate 14"), then view K-12 stats for the areas they represent.</p>
          <p>This page will use fast boundary lookups and district/campus summaries with caching.</p>
        </div>
      </div>
    </>
  )
}
