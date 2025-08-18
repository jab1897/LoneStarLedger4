// frontend/src/pages/Home.jsx
import React from "react";
import MapView from "../sections/StatewideMap";

export default function Home(){
  return (
    <div>
      <section style={{padding:"18px 0"}}>
        <h1>K-12 finance & accountability</h1>
        <p>Transparent, statewide look at district spending, student performance, and staffing. Search by district or campus, click the map, or explore the tabs.</p>
      </section>
      <section>
        <h2>Texas District Map</h2>
        <MapView />
      </section>
    </div>
  );
}
