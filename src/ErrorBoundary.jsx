import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, info: null }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { this.setState({ error, info }); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-page)', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ maxWidth: '560px', width: '100%' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Something went wrong</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your data is safe in this browser. Reloading usually fixes it.</p>
            <button onClick={() => window.location.reload()} style={{ background: 'var(--inverse-bg)', color: 'var(--inverse-text)', border: 'none', borderRadius: '100px', padding: '10px 22px', fontWeight: 600, cursor: 'pointer' }}>
              Reload app
            </button>
            <details style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <summary style={{ cursor: 'pointer' }}>Error details</summary>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{this.state.error && this.state.error.toString()}</pre>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.info && this.state.info.componentStack}</pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
