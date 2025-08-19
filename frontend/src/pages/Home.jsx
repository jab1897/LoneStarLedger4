// frontend/src/pages/Home.jsx
import React from "react";
import StatewideMap from "../sections/StatewideMap";
import SearchBox from "../components/SearchBox";

export default function Home() {
  return (
    <main className="container">
      {/* Hero / Intro (single blurb – avoid duplicates) */}
      <section className="hero" style={{ padding: "28px 0 16px" }}>
        <h1 style={{ marginBottom: 10 }}>K-12 finance & accountability</h1>
        <p style={{ marginBottom: 12, maxWidth: 920 }}>
          Transparent, statewide look at district spending, student performance, and staffing.
          Search by district or campus, hover the map to see district names, and click a district to drill into details.
        </p>
        <SearchBox />
      </section>

      {/* Map Card */}
      <section className="card" style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 10 }}>Texas District Map</h2>
        <StatewideMap />
      </section>
    </main>
  );
}
