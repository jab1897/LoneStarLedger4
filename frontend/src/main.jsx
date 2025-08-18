import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'

// surface prod errors in console too
if (typeof window !== 'undefined'){
  window.addEventListener('error', (e)=>console.error('window.onerror', e.error || e.message))
  window.addEventListener('unhandledrejection', (e)=>console.error('unhandledrejection', e.reason))
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
)
