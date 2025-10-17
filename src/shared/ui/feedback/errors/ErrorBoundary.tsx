'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { logError } from '@/shared/infra/monitoring/logger';
import { Button } from '@/shared/ui/primitives/Button/Button';

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** The children components to be wrapped by the error boundary */
  children: ReactNode;
  /** Optional custom fallback UI to display when an error is caught */
  fallback?: ReactNode;
  /** Optional callback function to be called when the error boundary is reset */
  onReset?: () => void;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error object that was caught, if any */
  error?: Error;
}

/**
 * ErrorBoundary - A React error boundary component to catch and handle errors in the component tree
 *
 * This component provides:
 * - Error catching and logging for child components
 * - Customizable fallback UI or default error display
 * - Reset functionality to recover from errors
 * - Development-mode error stack trace display
 *
 * Note: Error Boundaries must be class components as they use lifecycle methods
 * (componentDidCatch and getDerivedStateFromError) that are not available in functional components.
 *
 * @example
 * ```tsx
 * // Basic usage with default fallback
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onReset={() => console.log('Error boundary reset')}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * // Using the functional wrapper
 * <ErrorBoundaryWrapper onReset={handleReset}>
 *   <YourComponent />
 * </ErrorBoundaryWrapper>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  /**
   * Static method to derive state from error
   * Called when an error is thrown in a child component
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called when an error is caught
   * Used for error logging and side effects
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError(error, { componentStack: errorInfo.componentStack });
  }

  /**
   * Handles resetting the error boundary state
   * Calls the optional onReset callback and clears the error state
   */
  private readonly handleReset = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined });
  };

  /**
   * Handles navigation to home page
   */
  private readonly handleBackHome = (): void => {
    globalThis.location.href = '/';
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
        <p className="text-sm text-slate-500">We notified the engineering team. Please try to recover or go back to the home page.</p>
        {process.env.NODE_ENV === 'development' && this.state.error ? (
          <pre className="w-full overflow-auto rounded-md bg-slate-900 p-4 text-left text-xs text-slate-100">{this.state.error.stack}</pre>
        ) : null}
        <div className="flex items-center gap-3">
          <Button onClick={this.handleReset}>Try again</Button>
          <Button variant="outline" onClick={this.handleBackHome}>
            Back home
          </Button>
        </div>
      </div>
    );
  }
}

/**
 * ErrorBoundaryWrapper - Functional wrapper component for ErrorBoundary
 *
 * This wrapper provides a functional component interface for the ErrorBoundary class component,
 * allowing for more consistent usage with other arrow-function components.
 *
 * @example
 * ```tsx
 * <ErrorBoundaryWrapper onReset={handleReset}>
 *   <YourComponent />
 * </ErrorBoundaryWrapper>
 * ```
 *
 * @param props - The ErrorBoundary props
 * @returns The ErrorBoundary class component with the provided props
 */
export const ErrorBoundaryWrapper = (props: Readonly<ErrorBoundaryProps>) => {
  return <ErrorBoundary {...props} />;
};
