import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("CRITICAL APP CRASH:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#FFF1F2', 
          color: '#881337',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something broke.</h1>
          <p style={{ maxWidth: '400px', marginBottom: '2rem' }}>
            The application encountered a critical error. This usually happens due to configuration issues.
          </p>
          <pre style={{ 
            background: 'rgba(0,0,0,0.05)', 
            padding: '10px', 
            borderRadius: '8px', 
            fontSize: '0.8rem', 
            marginBottom: '20px',
            overflow: 'auto',
            maxWidth: '100%'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '12px 24px', 
              background: '#881337', 
              color: 'white', 
              border: 'none', 
              borderRadius: '99px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Restart Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global Safety Check
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  console.error("Failed to mount React application:", e);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: red;">
      <h1>Fatal Error</h1>
      <p>Failed to mount application. Check console for details.</p>
      <pre>${e}</pre>
    </div>
  `;
}