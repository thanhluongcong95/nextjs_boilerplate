'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/shared/components/system/ErrorBoundary';
import { AppRecoilRoot } from '@/shared/lib/recoil-bridge';
import { RouterBridge } from '@/shared/lib/router-bridge';

const ClientHttpLoadingBridge = dynamic(
  async () => {
    const mod = await import('@/shared/components/system/HttpLoadingBridge');
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
