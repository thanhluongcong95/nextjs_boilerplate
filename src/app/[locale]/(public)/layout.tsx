'use client';

import { Spin } from 'antd';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { ClientOnly } from '@/shared/ui/app-shell/ClientOnly';

interface PublicLayoutProps {
  children: ReactNode;
}

const renderSsrFallback = (message: string) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-rose-50 text-slate-800">
    <div className="text-center">
      <Spin size="large" />
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </div>
  </div>
);

export default function PublicLayout({ children }: Readonly<PublicLayoutProps>) {
  const t = useTranslations('common');

  return (
    <ClientOnly fallback={renderSsrFallback(t('loading'))}>
      <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-rose-50 font-sans text-slate-800 antialiased">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-rose-400/20 blur-3xl" />
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.2) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-8 shadow-xl backdrop-blur-xl transition-all duration-500 hover:shadow-purple-400/20">
              <div className="relative z-10">{children}</div>
            </div>
          </div>
        </main>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) }
            50% { transform: translateY(-10px) }
          }
        `}</style>
      </div>
    </ClientOnly>
  );
}
