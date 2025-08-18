import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, err: null }; }
  static getDerivedStateFromError(error){ return { hasError: true, err: error }; }
  componentDidCatch(error, info){ console.error("[LSL] ErrorBoundary", error, info); }
  render(){
    if(!this.state.hasError) return this.props.children;
    return (
      <div className="card" style={{background:"#fee", borderColor:"#f4c"}}>
        <h3>Something went wrong</h3>
        <pre>{String(this.state.err?.message || this.state.err || "Unknown error")}</pre>
        <button onClick={() => location.reload()}>Reload</button>
      </div>
    );
  }
}
