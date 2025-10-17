'use client';

import { useState } from 'react';

import { useAuth } from '@/app/(public)/login/hooks/useAuth';
import { loginPayloadSchema } from '@/app/(public)/login/model/auth.schemas';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';

export const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const result = loginPayloadSchema.safeParse({ email, password });
    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? 'Invalid credentials');
      return;
    }

    try {
      await login(result.data);
    } catch (unknownError: unknown) {
      setErrorMessage(
        unknownError instanceof Error ? unknownError.message : 'Authentication failed'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-left">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Sign in to your workspace
        </h2>
        <p className="text-sm text-slate-300/80">
          New to the platform? Request access from your manager and we&apos;ll provision
          an account in minutes.
        </p>
      </div>

      <div className="space-y-5">
        <Input
          id="email"
          type="email"
          label="Work email"
          autoComplete="email"
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(event.target.value)
          }
          className="bg-white/90 text-slate-900 placeholder:text-slate-400"
          placeholder="you@company.com"
          required
        />
        <Input
          id="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(event.target.value)
          }
          className="bg-white/90 text-slate-900 placeholder:text-slate-400"
          placeholder="••••••••"
          required
          minLength={8}
        />
      </div>

      {errorMessage ? (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
        >
          <span className="mt-1 h-2 w-2 rounded-full bg-rose-300" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? 'Signing in…' : 'Sign in securely'}
        </Button>
        <p className="text-center text-xs text-slate-400/80">
          Protected by enterprise-grade security &amp; observability policies.
        </p>
      </div>
    </form>
  );
};
