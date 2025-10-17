import Link from 'next/link';

import { siteConfig } from '@/shared/constants/site';

const HIGHLIGHTS = [
  {
    id: 'architecture',
    title: 'Architecture-first foundation',
    description:
      'Double-down on maintainability with a documented layering strategy, feature modules, and typed contracts.',
  },
  {
    id: 'developer-experience',
    title: 'DX you can trust',
    description:
      'Scaffolded testing utilities, lint rules, and sensible defaults help teams ship confidently from day one.',
  },
  {
    id: 'user-experience',
    title: 'Production-grade UX',
    description:
      'Performance-minded patterns, graceful loading states, and resilient error handling out of the box.',
  },
] as const;

const PublicHomePage = () => {
  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Hero Section */}
      <div className="space-y-5 sm:space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200 sm:px-4">
          Enterprise-ready starter
        </span>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Build confident, compliant frontends without reinventing your architecture.
        </h1>
        <p className="max-w-2xl text-sm text-slate-200 sm:text-base lg:text-lg">
          {siteConfig.name} is a curated Next.js 14 reference implementation that
          demonstrates how to blend clean domain boundaries, runtime safety, and
          delightful product polish.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-sky-400 sm:px-6 sm:py-3"
          >
            Access dashboard
          </Link>
          <a
            href={siteConfig.marketing.architectureGuideUrl}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-indigo-300/40 hover:text-indigo-100 sm:px-6 sm:py-3"
            target="_blank"
            rel="noreferrer"
          >
            View documentation
          </a>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
        {HIGHLIGHTS.map(highlight => (
          <article
            key={highlight.id}
            className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-5 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 sm:rounded-2xl sm:p-6"
          >
            {/* Hover Gradient Effect */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_70%)]" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">
              {highlight.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-200 sm:mt-3 sm:text-sm">
              {highlight.description}
            </p>
          </article>
        ))}
      </div>

      {/* Security CTA Section */}
      <div className="flex flex-col gap-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:p-6">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-emerald-100 sm:text-lg">
            Security-first defaults
          </h2>
          <p className="text-xs text-emerald-200/80 sm:text-sm">
            Token handling, HTTP interceptors, and error boundaries are wired in so teams
            can focus on business logic.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-700 shadow transition hover:bg-emerald-50 sm:flex-shrink-0"
        >
          Preview the experience
        </Link>
      </div>
    </div>
  );
};

export default PublicHomePage;
