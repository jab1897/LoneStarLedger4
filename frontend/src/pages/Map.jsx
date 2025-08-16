import React, { useState } from 'react'
import MapView from '../components/MapView'
import Drawer from '../components/Drawer'

export default function MapPage(){
  const [selection, setSelection] = useState(null)
  return (
    <>
      <div className="card" style={{marginBottom:12}}>
        <h3>Interactive Map</h3>
        <p style={{marginTop:0}}>Fast, binned campus dots. District outlines appear at low zoom for context.</p>
        <MapView onFeatureClick={setSelection} />
      </div>

      {selection && <Drawer onClose={()=>setSelection(null)}>
        <h3 style={{marginTop:0}}>{selection.type === 'district' ? selection.data.district_name : (selection.data.school_name || 'Selection')}</h3>
        {selection.type === 'bin' ? (
          <div>Cluster of {selection.data.count} campus(es).</div>
        ) : null}
      </Drawer>}
    </>
  )
}
