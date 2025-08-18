import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home.jsx";
import MapPage from "./pages/MapPage.jsx";           // keep or remove if unused
import DistrictPage from "./pages/DistrictPage.jsx"; // adjust to your actual file name (e.g., DistrictDetail.jsx)
import CampusPage from "./pages/CampusPage.jsx";     // adjust to your actual file name (e.g., CampusDetail.jsx)
import Contact from "./pages/Contact.jsx";
import ErrorBoundary from "./shell/ErrorBoundary";   // <— NO extension

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <header className="navbar">
          <div className="container">
            <div className="brand">LoneStarLedger</div>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/map">Map</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/district/:id" element={<DistrictPage />} />
          <Route path="/campus/:id" element={<CampusPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>

        <footer className="site-footer">
          <div className="container">
            Texas K-12 finance &amp; accountability · Prototype 2.0
          </div>
        </footer>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
