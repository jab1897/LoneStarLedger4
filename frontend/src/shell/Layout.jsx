// frontend/src/shell/Layout.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./layout.css";

export default function Layout({children}) {
  return (
    <>
      <header className="topbar">
        <div className="brand"><Link to="/">LoneStarLedger</Link></div>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/map">Map</NavLink>
          <NavLink to="/statewide">Statewide stats</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>
      <main className="main">{children}</main>
    </>
  );
}
