import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import DistrictDetail from './pages/DistrictDetail.jsx'
import CampusDetail from './pages/CampusDetail.jsx'
import Legislators from './pages/Legislators.jsx'
import Contact from './pages/Contact.jsx'
import Newsletter from './pages/Newsletter.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/district/:id" element={<DistrictDetail />} />
      <Route path="/campus/:id" element={<CampusDetail />} />
      <Route path="/legislators" element={<Legislators />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/newsletter" element={<Newsletter />} />
      <Route path="*" element={<App />} />
    </Routes>
  </BrowserRouter>
)
