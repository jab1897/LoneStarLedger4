import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || "An unexpected error occurred." };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container" style={{ padding: "24px 0" }}>
          <div className="alert error" role="alert" style={{ marginTop: 12 }}>
            <strong>Something went wrong</strong>
            <div style={{ marginTop: 8 }}>{this.state.message}</div>
            <button
              style={{ marginTop: 12 }}
              onClick={() => {
                this.setState({ hasError: false, message: "" });
                // best-effort refresh to recover
                if (typeof window !== "undefined") window.location.reload();
              }}
            >
              Reload
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
