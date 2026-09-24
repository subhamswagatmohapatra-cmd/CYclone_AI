import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold font-headline text-slate-900 mb-2">
              System Render Notice
            </h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              CycloneAI encountered an issue while loading telemetry views. You can safely reload the dashboard.
            </p>
            {this.state.error && (
              <div className="bg-slate-100 rounded-lg p-3 text-left font-mono text-xs text-red-700 mb-6 overflow-auto max-h-36">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Reload CycloneAI
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
