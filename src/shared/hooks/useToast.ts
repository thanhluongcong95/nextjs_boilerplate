'use client';

import { useCallback } from 'react';

export function useToast() {
  const showMessage = useCallback((message: string, level: 'info' | 'success' | 'error') => {
    if (typeof window !== 'undefined') {
      // Placeholder implementation - connect to a toast system later.
      // eslint-disable-next-line no-console
      console[level === 'error' ? 'error' : level === 'success' ? 'log' : 'info'](message);
    }
  }, []);

  return {
    showInfo: (message: string) => showMessage(message, 'info'),
    showSuccess: (message: string) => showMessage(message, 'success'),
    showError: (message: string) => showMessage(message, 'error'),
  };
}
