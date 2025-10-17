'use client';

import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { globalLoadingState } from '@/shared/state/atoms/loading.atoms';
import { registerGlobalLoading } from '@/shared/state/controllers/loading.controller';

export const HttpLoadingBridge = () => {
  const loadingCount = useRecoilValue(globalLoadingState);
  const setLoadingCount = useSetRecoilState(globalLoadingState);

  useEffect(() => {
    registerGlobalLoading(setLoadingCount);
    return () => registerGlobalLoading(null);
  }, [setLoadingCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.classList.toggle('cursor-progress', loadingCount > 0);
  }, [loadingCount]);

  return null;
};
