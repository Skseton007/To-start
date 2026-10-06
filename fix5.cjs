const fs = require('fs');

const code = `import React from 'react';
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, info: null }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, info) { this.setState({ error, info }); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:'20px', color:'red', background:'white'}}>
          <h1>Runtime Error!</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.info && this.state.info.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}`;
fs.writeFileSync('src/ErrorBoundary.jsx', code);

let main = fs.readFileSync('src/main.jsx', 'utf8');
if (!main.includes('ErrorBoundary')) {
  main = main.replace("import App from './App.jsx'", "import App from './App.jsx';\nimport { ErrorBoundary } from './ErrorBoundary.jsx';");
  main = main.replace("<App />", "<ErrorBoundary><App /></ErrorBoundary>");
  fs.writeFileSync('src/main.jsx', main);
}
