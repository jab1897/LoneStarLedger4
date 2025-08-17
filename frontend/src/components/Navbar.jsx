import React from 'react'
import { NavLink, Link } from 'react-router-dom'

export default function Navbar(){
  return (
    <header style={{background:'var(--blue)', color:'#fff', padding:'12px 16px'}}>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link to="/" className="brand" style={{color:'#fff',textDecoration:'none'}}>LoneStarLedger</Link>
        <nav className="tabs">
          <NavLink to="/" end className={({isActive})=>`tab ${isActive?'active':''}`}>Home</NavLink>
          <NavLink to="/legislators" className={({isActive})=>`tab ${isActive?'active':''}`}>Legislators</NavLink>
          <NavLink to="/newsletter" className={({isActive})=>`tab ${isActive?'active':''}`}>Newsletter</NavLink>
          <NavLink to="/contact" className={({isActive})=>`tab ${isActive?'active':''}`}>Contact</NavLink>
        </nav>
      </div>
    </header>
  )
}
