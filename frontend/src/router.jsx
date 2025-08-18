// frontend/src/router.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./shell/Layout";

// pages (code-split if you like; keeping simple here)
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import DistrictPage from "./pages/DistrictPage";
import CampusPage from "./pages/CampusPage";
import Contact from "./pages/Contact";
import Statewide from "./pages/Statewide";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div style={{padding:16}}>Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/statewide" element={<Statewide />} />
            <Route path="/district/:district_6" element={<DistrictPage />} />
            <Route path="/campus/:campus_9" element={<CampusPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
