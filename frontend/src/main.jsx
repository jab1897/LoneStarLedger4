import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

const Overview  = lazy(()=> import('./pages/Overview.jsx'))
const Districts = lazy(()=> import('./pages/Districts.jsx'))
const Campuses  = lazy(()=> import('./pages/Campuses.jsx'))
const MapPage   = lazy(()=> import('./pages/Map.jsx'))

function Spinner(){ return <div className="spinner" style={{marginTop:20}} /> }

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/districts" element={<Districts />} />
        <Route path="/campuses" element={<Campuses />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)
