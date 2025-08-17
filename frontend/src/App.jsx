import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import DistrictDetail from './pages/DistrictDetail'
import CampusDetail from './pages/CampusDetail'
import './styles.css'
import ErrorBoundary from './components/ErrorBoundary'

export default function App(){
  return (
    <BrowserRouter>
      <header className="appbar">
        <div className="appbar__inner">
          <Link to="/" className="brand">LoneStarLedger</Link>
          <div className="tagline">Texas K-12 finance & accountability</div>
          <a className="btn alt" href={import.meta.env.VITE_BACKEND_URL || '#'} target="_blank" rel="noreferrer">API</a>
        </div>
      </header>

      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/district/:cdn" element={<DistrictDetail />} />
        <Route path="/campus/:id" element={<CampusDetail />} />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
