import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'hsl(var(--error) / 0.1)' }}>
              <AlertTriangle className="w-8 h-8" style={{ color: 'hsl(var(--error))' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>
                {this.props.fallbackMessage || 'An unexpected error occurred. You can try refreshing the component or switching themes.'}
              </p>
              {this.state.error && (
                <p className="text-xs mt-3 p-3 rounded-lg text-left overflow-auto max-h-32"
                  style={{ background: 'hsl(var(--surface-overlay) / 0.5)', color: 'hsl(var(--text-dim))' }}>
                  {this.state.error.message}
                </p>
              )}
            </div>
            <Button onClick={this.handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
