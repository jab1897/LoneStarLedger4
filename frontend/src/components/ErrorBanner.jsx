import React from 'react'
export default function ErrorBanner({ message, onClose }) {
  if (!message) return null
  return (
    <div className="card" style={{background:'#fff4f4', border:'1px solid #ffd3d3'}}>
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div style={{color:'#a33'}}>Error: {String(message)}</div>
        <button className="btn" onClick={onClose}>Dismiss</button>
      </div>
    </div>
  )
}
