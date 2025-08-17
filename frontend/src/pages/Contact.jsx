import React from 'react'
import Navbar from '../components/Navbar'

export default function Contact(){
  return (
    <>
      <Navbar />
      <div className="container" style={{marginTop:12}}>
        <h2 style={{margin:'6px 0', color:'var(--blue)'}}>Contact Us</h2>
        <div className="card">
          <p>Questions, data tips, or corrections? Email us at <a href="mailto:info@lonestarledger.org">info@lonestarledger.org</a>.</p>
          <p>We welcome feedback from parents, educators, and policymakers.</p>
        </div>
      </div>
    </>
  )
}
