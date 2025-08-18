import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="lsl-header">
      <div className="lsl-header-inner">
        <Link to="/" className="brand">LoneStarLedger</Link>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/legislators">Legislators</NavLink>
          <NavLink to="/newsletter">Newsletter</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
    </header>
  )
}
