'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/Button/Button';
import { logError } from '@/shared/lib/monitoring/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, { componentStack: errorInfo.componentStack });
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
        <p className="text-sm text-slate-500">
          We notified the engineering team. Please try to recover or go back to the home
          page.
        </p>
        {process.env.NODE_ENV === 'development' && this.state.error ? (
          <pre className="w-full overflow-auto rounded-md bg-slate-900 p-4 text-left text-xs text-slate-100">
            {this.state.error.stack}
          </pre>
        ) : null}
        <div className="flex items-center gap-3">
          <Button onClick={this.handleReset}>Try again</Button>
          <Button variant="outline" onClick={() => (globalThis.location.href = '/')}>
            Back home
          </Button>
        </div>
      </div>
    );
  }
}

// Optional functional wrapper for consistency with arrow-function components
// Usage: <ErrorBoundaryWrapper onReset={...}>{children}</ErrorBoundaryWrapper>
export const ErrorBoundaryWrapper = (props: Props) => {
  return <ErrorBoundary {...props} />;
};
