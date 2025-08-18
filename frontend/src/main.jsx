import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function show(msg){
  const el = document.getElementById('fatal')
  if (el){ el.textContent = msg; el.style.display = 'block' }
}
function hide(){
  const el = document.getElementById('fatal')
  if (el){ el.style.display = 'none' }
}

// show a message immediately (in case JS loads but React hasn't mounted yet)
show('Loading app…')

async function bootstrap(){
  try {
    const mod = await import('./App.jsx') // dynamic import so errors are catchable
    const App = mod.default
    const root = createRoot(document.getElementById('root'))
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    hide()
  } catch (e) {
    console.error('Boot error:', e)
    show('Boot error: ' + (e?.message || String(e)))
  }
}

bootstrap()
