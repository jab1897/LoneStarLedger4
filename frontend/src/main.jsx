import React, { Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

const Home      = lazy(()=> import('./pages/Home.jsx'))
const Overview  = lazy(()=> import('./pages/Overview.jsx'))   // keep existing
const Districts = lazy(()=> import('./pages/Districts.jsx'))
const Campuses  = lazy(()=> import('./pages/Campuses.jsx'))
const MapPage   = lazy(()=> import('./pages/Map.jsx'))
const DistrictDetail = lazy(()=> import('./pages/DistrictDetail.jsx'))
const CampusDetail   = lazy(()=> import('./pages/CampusDetail.jsx'))

function Spinner(){ return <div className="spinner" style={{marginTop:20}} /> }

function AnalyticsTracker(){
  const loc = useLocation()
  useEffect(()=>{
    if (window.gtag) {
      window.gtag('event', 'page_view', { page_path: loc.pathname + loc.search })
    }
  }, [loc])
  return null
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AnalyticsTracker />
    <App />
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/districts" element={<Districts />} />
        <Route path="/campuses" element={<Campuses />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/district/:id" element={<DistrictDetail />} />
        <Route path="/campus/:id" element={<CampusDetail />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)
