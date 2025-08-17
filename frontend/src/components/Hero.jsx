import React from 'react'

export default function Hero({ children }) {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__text">
          <h1 className="hero__title">LoneStarLedger</h1>
          <p className="hero__tagline">Texas K-12 finance & accountability</p>
          <p className="hero__blurb">
            Transparent, statewide look at district spending, student performance, and staffing.
            Search by district or campus, or click the map.
          </p>
        </div>
        <div className="hero__aside">
          {children /* e.g., SearchBar */}
        </div>
      </div>
    </section>
  )
}
