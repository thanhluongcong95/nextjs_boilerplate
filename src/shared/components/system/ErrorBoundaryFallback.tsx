'use client';

import type { ReactNode } from 'react';

import { Button } from '@/shared/components/ui/Button/Button';

type Props = {
  error: Error;
  onRetry: () => void;
  actions?: ReactNode;
};

export const ErrorBoundaryFallback = ({ error, onRetry, actions }: Props) => {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-rose-100 bg-rose-50 p-6">
      <div>
        <h2 className="text-lg font-semibold text-rose-700">
          An unexpected error occurred
        </h2>
        <p className="text-sm text-rose-600">{error.message}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={onRetry}>Retry</Button>
        {actions}
      </div>
    </div>
  );
};
