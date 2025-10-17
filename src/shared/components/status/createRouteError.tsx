'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { ErrorBoundaryFallback } from '@/shared/components/system/ErrorBoundaryFallback';

type Options = {
  onError?: (error: Error) => void;
  actions?: ReactNode;
};

export function createRouteError({ onError, actions }: Options = {}) {
  return ({ error, reset }: { error: Error; reset: () => void }) => {
    useEffect(() => {
      onError?.(error);
    }, [error]);

    return <ErrorBoundaryFallback error={error} onRetry={reset} actions={actions} />;
  };
}
