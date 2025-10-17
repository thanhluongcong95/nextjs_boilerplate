'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

export const ClientOnly = ({ children, fallback = null }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
