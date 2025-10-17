import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

type Props = {
  label: string;
  id: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ label, id, hint, error, className, ...props }: Props) => {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm text-slate-600">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        id={id}
        className={cn(
          'rounded-md border px-3 py-2 text-sm outline-none transition',
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100',
          className
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      {error ? <span className="text-xs text-rose-500">{error}</span> : null}
    </label>
  );
};
