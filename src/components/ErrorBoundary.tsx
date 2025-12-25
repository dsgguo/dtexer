import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
        if (this.props.fallback) return this.props.fallback;
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100">
                <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
                <div className="bg-white dark:bg-black/50 p-4 rounded-lg border border-red-200 dark:border-red-800 w-full max-w-2xl overflow-auto mb-6 text-left font-mono text-sm">
                  {this.state.error?.message}
                </div>
                <button 
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg"
                    onClick={() => {
                      this.setState({ hasError: false, error: null });
                      window.location.reload();
                    }}
                >
                    Reload Application
                </button>
            </div>
        );
    }

    return this.props.children;
  }
}
