'use client';

import { LoginForm } from '@/app/(public)/login/ui/LoginForm';

const SECURITY_FEATURES = [
  'Session tokens stay encrypted and never touch localStorage.',
  'HTTP interceptors apply zero-trust policies on every request.',
  'Global monitoring keeps critical journeys observable.',
] as const;

const LoginPage = () => {
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
          Secure access
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Welcome back. Let&apos;s continue building with momentum.
        </h1>
        <p className="max-w-xl text-sm text-slate-200/80 sm:text-base">
          Use your single sign-on credentials to access dashboards, operational insights,
          and collaborative tooling for your team.
        </p>
      </header>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-start">
        {/* Security Features Card */}
        <div className="space-y-6 rounded-2xl border border-white/5 bg-white/5 p-5 text-sm text-slate-200/90 shadow-lg shadow-slate-950/20 sm:p-6">
          <h2 className="text-base font-semibold text-white">
            Why secure sign-in matters
          </h2>
          <ul className="space-y-3">
            {SECURITY_FEATURES.map(feature => (
              <li key={feature} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-300" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl sm:p-6 lg:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
