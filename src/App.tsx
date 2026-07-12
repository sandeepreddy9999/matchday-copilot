import { Component, type ErrorInfo, type ReactNode } from 'react';
import MatchdayCopilot from './components/MatchdayCopilot';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * A minimal top-level error boundary. A crash in the copilot feature
 * shouldn't take down the whole tab with a blank white screen at a
 * stadium — show something recoverable instead.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Matchday Copilot crashed:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#10231A',
            background: '#F6F8F6',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Something went wrong.</p>
            <p style={{ color: '#4B5D53', fontSize: '0.9rem' }}>Please reload the page.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MatchdayCopilot />
    </ErrorBoundary>
  );
}
