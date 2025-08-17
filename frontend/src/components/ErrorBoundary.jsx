import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false, err: null }
  }
  static getDerivedStateFromError(err){
    return { hasError: true, err }
  }
  componentDidCatch(err, info){
    console.error('UI error caught by ErrorBoundary:', err, info)
  }
  render(){
    if (this.state.hasError){
      return (
        <div className="container">
          <div className="card" style={{marginTop:12, background:'#fff3f3', border:'1px solid #f5c2c7'}}>
            <h3 style={{marginTop:0}}>Something went wrong</h3>
            <div style={{whiteSpace:'pre-wrap', fontFamily:'monospace'}}>{String(this.state.err)}</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
