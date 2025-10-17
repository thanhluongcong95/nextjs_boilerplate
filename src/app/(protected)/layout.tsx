'use client';

import type { ReactNode } from 'react';

import { AuthGuard } from '@/app/(public)/login';
import { Footer } from '@/shared/components/layout/Footer';
import { Header } from '@/shared/components/layout/Header';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { ClientOnly } from '@/shared/components/system/ClientOnly';
import { ErrorBoundary } from '@/shared/components/system/ErrorBoundary';
import { LoadingOverlay } from '@/shared/components/system/LoadingOverlay';

const SSR_FALLBACK = (
  <div className="flex min-h-screen bg-slate-100">
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <LoadingOverlay message="Loading..." />
      </main>
    </div>
  </div>
);

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout = ({ children }: Readonly<ProtectedLayoutProps>) => {
  return (
    <ClientOnly fallback={SSR_FALLBACK}>
      <AuthGuard>
        <div className="flex min-h-screen bg-slate-100">
          {/* Sidebar Navigation */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col">
            {/* Top Header */}
            <Header />

            {/* Main Content with Error Boundary */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </AuthGuard>
    </ClientOnly>
  );
};

export default ProtectedLayout;
