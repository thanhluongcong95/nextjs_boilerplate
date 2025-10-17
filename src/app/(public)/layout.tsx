'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { ClientOnly } from '@/shared/components/system/ClientOnly';
import { LoadingOverlay } from '@/shared/components/system/LoadingOverlay';
import { siteConfig } from '@/shared/constants/site';

const SSR_FALLBACK = (
  <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <div className="flex min-h-screen items-center justify-center">
      <LoadingOverlay message="Loading..." />
    </div>
  </div>
);

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: Readonly<PublicLayoutProps>) => {
  const currentYear = new Date().getFullYear();

  return (
    <ClientOnly fallback={SSR_FALLBACK}>
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
        {/* Background Gradient Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-[-20%] h-[50vh] bg-gradient-to-br from-indigo-500/40 via-transparent to-violet-500/20 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute left-[-20%] top-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:gap-14 sm:px-6 sm:py-12 lg:px-12 lg:py-16">
          {/* Header */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-slate-100 transition hover:text-indigo-200 sm:text-lg"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-200 sm:h-9 sm:w-9 sm:text-base">
                {siteConfig.shortName}
              </span>{' '}
              {siteConfig.name}
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-slate-100 transition hover:border-indigo-300/60 hover:bg-indigo-500/20 hover:text-white sm:px-4 sm:py-2"
              >
                Sign in
              </Link>
              <a
                href={siteConfig.marketing.architectureGuideUrl}
                className="inline-flex items-center gap-2 text-slate-300 transition hover:text-indigo-200"
                target="_blank"
                rel="noreferrer"
              >
                Architecture guide &rarr;
              </a>
            </nav>
          </header>

          {/* Content Section */}
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)] backdrop-blur-xl sm:rounded-3xl sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
            {children}
          </section>

          {/* Footer */}
          <footer className="pb-6 text-center text-xs text-slate-400/80 sm:pb-10">
            &copy; {currentYear} {siteConfig.title} &middot; Crafted for high-trust teams
          </footer>
        </main>
      </div>
    </ClientOnly>
  );
};

export default PublicLayout;
