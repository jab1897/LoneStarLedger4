// frontend/src/shell/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <main className="container">
          <section className="card" style={{ marginTop: 20 }}>
            <h2>Something went wrong</h2>
            <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error)}</pre>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
