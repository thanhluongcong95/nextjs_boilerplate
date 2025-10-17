'use client';

import { useEffect } from 'react';

import { logError } from '@/shared/infra/monitoring/logger';
import { Button } from '@/shared/ui/primitives/Button/Button';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    logError(error, { digest: error.digest });
  }, [error]);

  const handleBackHome = () => {
    globalThis.location.href = '/';
  };

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6 text-center">
          {/* Error Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 sm:h-20 sm:w-20">
            <svg className="h-8 w-8 text-red-600 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Something went wrong</h1>
            <p className="text-sm text-slate-600 sm:text-base">We tracked the issue and will work on a fix as soon as possible.</p>
            {error.digest && <p className="text-xs text-slate-400">Error ID: {error.digest}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button onClick={reset} className="w-full sm:w-auto">
              Try again
            </Button>
            <Button variant="outline" onClick={handleBackHome} className="w-full sm:w-auto">
              Back home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
