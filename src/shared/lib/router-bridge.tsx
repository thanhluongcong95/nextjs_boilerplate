'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

let routerRef: ReturnType<typeof useRouter> | null = null;

export function RouterBridge() {
  const router = useRouter();
  useEffect(() => {
    routerRef = router;
  }, [router]);
  return null;
}

export function getRouter() {
  return routerRef;
}
