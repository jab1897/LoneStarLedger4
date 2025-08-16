import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { api } from './api'
import './styles.css'

export default function App(){
  return (
    <>
      <header>
        <div className="brand">LoneStarLedger</div>
        <div className="tagline">Texas K-12 finance & accountability</div>
      </header>

      <nav className="tabs" role="navigation" aria-label="Primary">
        <NavLink to="/" end className={({isActive}) => isActive ? 'tab active' : 'tab'}>Overview</NavLink>
        <NavLink to="/districts" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Districts</NavLink>
        <NavLink to="/campuses" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Campuses</NavLink>
        <NavLink to="/map" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Map</NavLink>
        <a className="tab right" href={api.base} target="_blank" rel="noreferrer">API</a>
      </nav>

      <main className="container">
        <Outlet />
      </main>
    </>
  )
}
