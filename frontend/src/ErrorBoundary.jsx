import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, error }; }
  componentDidCatch(err, info){ console.error("ErrorBoundary", err, info); }

  render(){
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="container">
        <div className="card alert error">
          <h3>Something went wrong</h3>
          <div style={{whiteSpace:"pre-wrap",fontFamily:"ui-monospace,Consolas,monospace",fontSize:13}}>
            {String(this.state.error?.message || this.state.error || "Unknown error")}
          </div>
        </div>
      </main>
    );
  }
}
