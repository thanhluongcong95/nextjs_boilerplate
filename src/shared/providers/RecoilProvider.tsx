'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import { AppRecoilRoot } from '@/shared/providers/bridges/AppRecoilRoot';
import { RouterBridge } from '@/shared/providers/bridges/RouterBridge';
import { ErrorBoundary } from '@/shared/ui/feedback/errors/ErrorBoundary';

const ClientHttpLoadingBridge = dynamic(
  async () => {
    const mod = await import('@/shared/providers/bridges/HttpLoadingBridge');
    return { default: mod.HttpLoadingBridge };
  },
  { ssr: false }
);

export function RecoilProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ErrorBoundary>
      <AppRecoilRoot>
        <RouterBridge />
        <ClientHttpLoadingBridge />
        {children}
      </AppRecoilRoot>
    </ErrorBoundary>
  );
}
