import React from "react";
import { useParams, Link } from "react-router-dom";

export default function CampusPage(){
  const { id, campusId } = useParams();
  return (
    <main className="container">
      <section className="card">
        <h2>Campus: {campusId}</h2>
        <p>District: {id}</p>
        <p>This is a placeholder. You’ll show campus profile, outcomes, staffing, etc.</p>
        <p style={{marginTop:12}}><Link to={`/district/${encodeURIComponent(id)}`}>Back to district</Link></p>
      </section>
    </main>
  );
}
