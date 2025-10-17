'use client';

import { Spin } from 'antd';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import AuthGuard from '@/app/[locale]/(public)/auth/(_lib)/component/AuthGuard';
import { ClientOnly } from '@/shared/ui/app-shell/ClientOnly';
import { ErrorBoundary } from '@/shared/ui/feedback/errors/ErrorBoundary';
import { Footer } from '@/shared/ui/layout/Footer';
import { Header } from '@/shared/ui/layout/Header';

const renderSsrFallback = (message: string) => (
  <div className="flex min-h-screen bg-slate-100">
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <Spin size="large" tip={message}>
          <div className="min-h-[100px]" />
        </Spin>
      </main>
    </div>
  </div>
);

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout = ({ children }: Readonly<ProtectedLayoutProps>) => {
  const t = useTranslations('common');

  return (
    <ClientOnly fallback={renderSsrFallback(t('loading'))}>
      {/* <AuthGuard> */}
      <div className="flex min-h-screen flex-col bg-slate-50">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Main Content with Error Boundary */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
      {/* </AuthGuard> */}
    </ClientOnly>
  );
};

export default ProtectedLayout;
