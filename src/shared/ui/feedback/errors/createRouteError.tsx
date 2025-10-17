'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { ErrorBoundaryFallback } from '@/shared/ui/feedback/errors/ErrorBoundaryFallback';

/**
 * Options for configuring the route error handler
 */
interface CreateRouteErrorOptions {
  /** Optional callback function to be called when an error occurs */
  onError?: (error: Error) => void;
  /** Optional additional action buttons or elements to display in the error UI */
  actions?: ReactNode;
}

/**
 * Props passed to the error component by Next.js error boundary
 */
interface RouteErrorProps {
  /** The error object that was caught */
  error: Error;
  /** Function to reset the error boundary and retry rendering */
  reset: () => void;
}

/**
 * createRouteError - Factory function to create a Next.js error.tsx component with custom behavior
 *
 * This factory function creates a route error component that can be used as an error.tsx
 * file in Next.js App Router. It provides:
 * - Automatic error logging via onError callback
 * - Customizable error UI with additional actions
 * - Integration with ErrorBoundaryFallback component
 * - Proper error boundary reset functionality
 *
 * The created component automatically calls the onError callback when an error occurs,
 * and renders a user-friendly error UI with retry functionality.
 *
 * @example
 * ```tsx
 * // app/dashboard/error.tsx
 * 'use client';
 *
 * import { createRouteError } from '@/shared/ui/feedback/errors/createRouteError';
 * import { logError } from '@/shared/infra/monitoring/logger';
 *
 * export default createRouteError({
 *   onError: (error) => {
 *     logError(error, { page: 'dashboard' });
 *   },
 *   actions: <Button onClick={() => router.push('/')}>Go Home</Button>
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Simple usage without options
 * export default createRouteError();
 * ```
 *
 * @param options - Configuration options for the error handler
 * @param options.onError - Optional callback to be invoked when an error occurs
 * @param options.actions - Optional custom action elements to display in the error UI
 * @returns A React component that can be used as error.tsx in Next.js App Router
 */
export const createRouteError = ({ onError, actions }: CreateRouteErrorOptions = {}) => {
  /**
   * RouteErrorComponent - The actual error component rendered by Next.js
   *
   * @param props - The error props provided by Next.js error boundary
   * @param props.error - The error that was caught
   * @param props.reset - Function to reset the error boundary
   * @returns The error fallback UI
   */
  const RouteErrorComponent = ({ error, reset }: RouteErrorProps) => {
    useEffect(() => {
      // Call the onError callback when the error changes
      onError?.(error);
    }, [error]);

    return <ErrorBoundaryFallback error={error} onRetry={reset} actions={actions} />;
  };

  // Set display name for better debugging
  RouteErrorComponent.displayName = 'RouteErrorComponent';

  return RouteErrorComponent;
};
