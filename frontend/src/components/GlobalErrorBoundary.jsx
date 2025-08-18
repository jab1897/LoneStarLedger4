import React from 'react';

export default class GlobalErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null, info: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ console.error('🔥 Uncaught error:', error, info); this.setState({ info }); }

  render(){
    if (this.state.error){
      return (
        <div style={{
          padding:'16px', margin:'12px', borderRadius:'12px',
          background:'#fff5f5', color:'#7a0b0b', boxShadow:'0 6px 18px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{marginTop:0}}>Something went wrong</h3>
          <div style={{fontSize:13, whiteSpace:'pre-wrap'}}>{String(this.state.error)}</div>
          <div style={{fontSize:12, opacity:0.8, marginTop:8}}>
            Try reloading. If this keeps happening, please report what you were doing.
          </div>
          <button onClick={()=>location.reload()} style={{
            marginTop:10, background:'#003366', color:'#fff', border:'none',
            borderRadius:8, padding:'8px 12px', cursor:'pointer'
          }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
