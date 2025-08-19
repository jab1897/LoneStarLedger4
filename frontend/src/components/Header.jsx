// frontend/src/components/Header.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { apiBase } from "../lib/api";

const linkStyle = ({ isActive }) => ({
  padding: "8px 10px",
  borderRadius: 10,
  textDecoration: "none",
  color: isActive ? "#003366" : "#203040",
  background: isActive ? "rgba(0,0,0,0.06)" : "transparent",
  fontWeight: 600,
});

export default function Header() {
  return (
    <header className="site-header">
      <div className="container row spread">
        <Link to="/" className="brand">
          LoneStarLedger
        </Link>
        <nav className="row gap">
          <NavLink to="/" style={linkStyle} end>Home</NavLink>
          <NavLink to="/district" style={linkStyle}>Districts</NavLink>
          <NavLink to="/campus" style={linkStyle}>Campuses</NavLink>
          <a href={apiBase} style={{ ...linkStyle({ isActive:false }), fontWeight:500 }} target="_blank" rel="noreferrer">
            API
          </a>
        </nav>
      </div>
    </header>
  );
}
