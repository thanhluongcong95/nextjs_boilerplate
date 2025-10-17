'use client';

import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, token, bootstrap, isBootstrapping, hasBootstrapped } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth');

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!isBootstrapping && hasBootstrapped && (!isAuthenticated || !token)) {
      router.replace(`/${locale}/auth/signin`);
    }
  }, [isAuthenticated, hasBootstrapped, token, router, isBootstrapping, locale]);

  if (isBootstrapping || !hasBootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" tip={t('checkingSession')}>
          <div className="min-h-[100px]" />
        </Spin>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
