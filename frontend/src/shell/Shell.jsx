import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Shell({ children }) {
  const { pathname } = useLocation();
  return (
    <>
      <header className="navbar">
        <nav className="nav">
          <div className="brand">LoneStarLedger</div>
          <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/" className={({isActive}) => pathname === "/" ? "active" : ""}>Map</NavLink>
          <a href="https://forms.gle/" target="_blank" rel="noreferrer">Contact</a>
        </nav>
      </header>

      {pathname === "/" && (
        <section className="hero">
          <div className="hero-inner">
            <h1>K-12 finance & accountability</h1>
            <p>
              Transparent, statewide look at district spending, student performance, and staffing.
              Search by district or campus, hover the map to see district names, and click a district to drill into details.
            </p>
          </div>
        </section>
      )}

      <main className="container">{children}</main>
      <div className="footer">Texas K-12 finance & accountability · <span className="badge">Prototype 2.0</span></div>
    </>
  );
}
