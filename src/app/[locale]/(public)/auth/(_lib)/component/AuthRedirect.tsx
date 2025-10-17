'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';

interface AuthRedirectProps {
  redirectTo?: string;
}

export const AuthRedirect = ({ redirectTo = '/dashboard' }: AuthRedirectProps) => {
  const { isAuthenticated, hasBootstrapped, isBootstrapping } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isBootstrapping && hasBootstrapped && isAuthenticated) {
      router.replace(`/${locale}${redirectTo}`);
    }
  }, [isAuthenticated, hasBootstrapped, isBootstrapping, redirectTo, router, locale]);

  return null;
};
