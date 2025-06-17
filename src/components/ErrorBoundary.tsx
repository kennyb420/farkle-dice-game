import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="wooden-panel rounded-xl max-w-md w-full p-8 text-center tavern-glow">
            <div className="bg-gradient-to-r from-red-800 to-red-900 text-amber-100 p-6 rounded-t-xl border-b-2 border-red-700 -m-8 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h1 className="text-2xl font-bold drop-shadow">Game Error</h1>
              </div>
              <p className="text-red-200">Something went wrong with the dice game</p>
            </div>

            <div className="space-y-4 bg-wood-medium wood-grain">
              <p className="text-amber-200">
                Don't worry! Your game progress might be recoverable.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700">
                  <summary className="text-red-300 cursor-pointer font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-200 overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-800 text-amber-100 rounded-lg hover:bg-green-700 transition-colors font-medium border border-green-600"
                  aria-label="Try to recover the game"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try to Recover
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-800 text-amber-100 rounded-lg hover:bg-blue-700 transition-colors font-medium border border-blue-600"
                  aria-label="Refresh the page to start over"
                >
                  <Home className="w-5 h-5" />
                  Refresh Page
                </button>
              </div>

              <p className="text-xs text-amber-400">
                If this problem persists, try clearing your browser cache.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundary for game components
export function GameErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onReset={() => {
        // Clear any corrupted game state
        try {
          localStorage.removeItem('kingdom-dice-game');
        } catch (e) {
          console.warn('Could not clear localStorage:', e);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Error boundary for individual components
export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode;
  componentName: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700 text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-red-300 font-medium">Error in {componentName}</p>
          <p className="text-red-400 text-sm">This component failed to load</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}