import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home.jsx";
import DistrictPage from "./pages/DistrictPage.jsx";
import CampusPage from "./pages/CampusPage.jsx";
import Contact from "./pages/Contact.jsx";
import ErrorBoundary from "./shell/ErrorBoundary.jsx";

function Navbar() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="brand">LoneStarLedger</div>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/map">Map</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Home />} />
          <Route path="/district/:id" element={<DistrictPage />} />
          <Route path="/district/:id/campus/:campusId" element={<CampusPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </ErrorBoundary>
      <footer className="footer">
        Texas K-12 finance & accountability · <a href="https://github.com/jab1897/LoneStarLedger4" target="_blank" rel="noreferrer">Prototype</a>
      </footer>
    </>
  );
}
