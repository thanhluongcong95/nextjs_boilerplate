'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { LoadingOverlay } from '@/shared/components/system/LoadingOverlay';

const UserListContent = dynamic(() => import('./UserListContent'), {
  loading: () => <LoadingOverlay message="Loading team members" />,
  ssr: false,
});

export default function UserList() {
  return (
    <Suspense fallback={<LoadingOverlay message="Loading users" />}>
      <UserListContent />
    </Suspense>
  );
}
