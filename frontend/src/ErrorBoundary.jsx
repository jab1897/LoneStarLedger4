import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary caught:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:16, background:'#f8d7da', color:'#721c24',
                     border:'1px solid #f5c6cb', borderRadius:8, margin:12}}>
          <strong>App error:</strong> {String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}
