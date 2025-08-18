import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="lsl-header">
      <div className="lsl-header-inner">
        <NavLink to="/" className="brand">LoneStarLedger</NavLink>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/map">Map</NavLink>
          <NavLink to="/stats">Statewide stats</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
    </header>
  )
}
