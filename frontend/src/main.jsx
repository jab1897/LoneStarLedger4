import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import MapPage from './pages/Map'
import StatewideStats from './pages/StatewideStats'
import Contact from './pages/Contact'
import DistrictDetail from './pages/DistrictDetail'
import CampusDetail from './pages/CampusDetail'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/stats" element={<StatewideStats />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/district/:id" element={<DistrictDetail />} />
        <Route path="/campus/:id" element={<CampusDetail />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
