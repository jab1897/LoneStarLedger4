import React from 'react'

export default function Drawer({ children, onClose }) {
  return (
    <div className="drawer" role="dialog" aria-modal="true">
      <div className="handle" />
      <div style={{display:'flex', justifyContent:'flex-end'}}>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
      <div style={{marginTop:8}}>{children}</div>
    </div>
  )
}
