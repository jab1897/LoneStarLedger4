import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import DistrictDetail from './pages/DistrictDetail'
import CampusDetail from './pages/CampusDetail'

const el = document.getElementById('root')
createRoot(el).render(
  <BrowserRouter>
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Home />} />
        <Route path="/district/:id" element={<DistrictDetail />} />
        <Route path="/campus/:id" element={<CampusDetail />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
