// frontend/src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="container">
      <section className="card" style={{ marginTop: 20 }}>
        <h2>Page not found</h2>
        <p>That route doesn’t exist.</p>
        <Link to="/" className="btn">← Go Home</Link>
      </section>
    </main>
  );
}
