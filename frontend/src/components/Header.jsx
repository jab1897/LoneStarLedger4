
import React from "react";

export default function Header() {
  const link = (href, label) => (
    <a href={href} style={{
      padding: "10px 14px",
      borderRadius: 10,
      textDecoration: "none",
      color: "white",
      opacity: 0.9
    }}>{label}</a>
  );

  return (
    <header style={{
      background: "#0a2a47",
      color: "white",
      padding: "18px 20px",
      boxShadow: "0 2px 12px rgba(0,0,0,.12)",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1180,
        margin: "0 auto",
        gap: 16
      }}>
        <div style={{display:"flex", alignItems:"baseline", gap:12}}>
          <div style={{
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: .3
          }}>LoneStarLedger</div>
          <div style={{opacity:.85, fontSize:13}}>
            Texas K-12 finance & accountability
          </div>
        </div>
        <nav style={{display:"flex", gap:6}}>
          {link("#top", "Home")}
          {link("#map", "Map")}
          {link("#stats", "Statewide stats")}
          {link("#contact", "Contact")}
        </nav>
      </div>
    </header>
  );
}
