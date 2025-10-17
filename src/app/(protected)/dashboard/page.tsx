'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { LoadingOverlay } from '@/shared/components/system/LoadingOverlay';

const UsersOverview = dynamic(() => import('@/app/(protected)/dashboard/ui/UserList'), {
  loading: () => <LoadingOverlay message="Loading team members" />,
  ssr: false,
});

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Review key metrics, pending approvals, and the latest activity inside the
          platform.
        </p>
      </header>
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <Suspense fallback={<LoadingOverlay message="Loading user insights" />}>
          <UsersOverview />
        </Suspense>
      </section>
    </div>
  );
};

export default DashboardPage;
