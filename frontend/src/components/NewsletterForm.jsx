import React, { useState } from 'react'
import { api } from '../api'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [name, setName]   = useState('')
  const [status, setStatus] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setStatus('...')
    try {
      const res = await fetch(`${api.base}/newsletter`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email, name})
      })
      if (!res.ok) throw new Error('HTTP '+res.status)
      setStatus('Thanks — you’re on the list!')
      setEmail(''); setName('')
    } catch (err) {
      setStatus('Signup failed. Check email and try again.')
    }
  }

  return (
    <form onSubmit={submit} className="card" style={{padding:12}}>
      <h3>Newsletter</h3>
      <div className="row" style={{gap:8}}>
        <input type="text" placeholder="Name (optional)" value={name}
               onChange={e=>setName(e.target.value)}
               style={{padding:8, border:'1px solid #e1e6f0', borderRadius:8, flex:1, minWidth:160}}/>
        <input type="email" placeholder="Email" required value={email}
               onChange={e=>setEmail(e.target.value)}
               style={{padding:8, border:'1px solid #e1e6f0', borderRadius:8, flex:1, minWidth:220}}/>
        <button className="btn" type="submit">Sign up</button>
      </div>
      {status && <div style={{marginTop:8, fontSize:13}}>{status}</div>}
    </form>
  )
}
