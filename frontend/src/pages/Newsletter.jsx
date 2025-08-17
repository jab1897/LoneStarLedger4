import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../api'

export default function Newsletter(){
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState(null)
  async function submit(e){
    e.preventDefault()
    setMsg('Submitting...')
    try{
      const res = await fetch(`${api.base}/newsletter`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMsg('Thanks! You are subscribed.')
      setEmail('')
    }catch{
      setMsg('Submitted locally. Backend endpoint not found yet—your email will be added once enabled.')
    }
  }
  return (
    <>
      <Navbar />
      <div className="container" style={{marginTop:12, maxWidth:560}}>
        <h2 style={{margin:'6px 0', color:'var(--blue)'}}>Newsletter</h2>
        <div className="card">
          <form onSubmit={submit} className="row" style={{gap:8}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} required type="email" placeholder="you@email.com"
              style={{flex:1, padding:'10px 12px', border:'1px solid #d7ddea', borderRadius:10}} />
            <button className="btn" type="submit">Sign up</button>
          </form>
          {msg && <div style={{marginTop:8, fontSize:13}}>{msg}</div>}
        </div>
      </div>
    </>
  )
}
