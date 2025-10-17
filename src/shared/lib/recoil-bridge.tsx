'use client';

import type { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

export function AppRecoilRoot({ children }: { children: ReactNode }) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
