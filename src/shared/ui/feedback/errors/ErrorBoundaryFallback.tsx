'use client';

import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/primitives/Button/Button';

/**
 * Props for the ErrorBoundaryFallback component
 */
interface ErrorBoundaryFallbackProps {
  /** The error object that was caught */
  error: Error;
  /** Callback function to retry the failed operation */
  onRetry: () => void;
  /** Optional additional action buttons or elements */
  actions?: ReactNode;
}

/**
 * ErrorBoundaryFallback - UI component to display when an error boundary catches an error
 *
 * This component provides a user-friendly error display with:
 * - Clear error message presentation
 * - Retry functionality to recover from transient errors
 * - Optional custom actions for specific error scenarios
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <ErrorBoundaryFallback
 *       error={error}
 *       onRetry={reset}
 *       actions={<Button onClick={() => router.push('/')}>Go Home</Button>}
 *     />
 *   )}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @param props - The component props
 * @param props.error - The error that was caught by the error boundary
 * @param props.onRetry - Function to call when the user clicks the Retry button
 * @param props.actions - Optional additional action elements to display alongside Retry
 * @returns A styled error fallback UI
 */
export const ErrorBoundaryFallback = ({ error, onRetry, actions }: Readonly<ErrorBoundaryFallbackProps>) => {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-rose-100 bg-rose-50 p-6">
      <div>
        <h2 className="text-lg font-semibold text-rose-700">An unexpected error occurred</h2>
        <p className="text-sm text-rose-600">{error.message}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={onRetry}>Retry</Button>
        {actions}
      </div>
    </div>
  );
};
