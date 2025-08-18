import React from 'react'
import MapDistricts from '../components/MapDistricts'
export default function MapPage() {
  return <div className="container" style={{paddingTop:12}}>
    <h2>Statewide Map</h2>
    <MapDistricts />
  </div>
}
