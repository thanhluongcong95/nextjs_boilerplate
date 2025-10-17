'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { LoadingOverlay } from '@/shared/components/system/LoadingOverlay';

import { useAuth } from '../hooks/useAuth';

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, token, bootstrap, isBootstrapping, hasBootstrapped } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!isBootstrapping && hasBootstrapped && (!isAuthenticated || !token)) {
      router.replace('/login');
    }
  }, [isAuthenticated, hasBootstrapped, token, router, isBootstrapping]);

  if (isBootstrapping || !hasBootstrapped) {
    return <LoadingOverlay message="Checking session" />;
  }

  return <>{children}</>;
};

export default AuthGuard;
