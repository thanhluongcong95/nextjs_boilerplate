import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type Variant = 'primary' | 'outline';

type Props = {
  children: ReactNode;
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ children, variant = 'primary', className, ...props }: Props) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition';
  const variants: Record<Variant, string> = {
    primary: 'bg-indigo-600 text-white shadow hover:bg-indigo-500 disabled:bg-indigo-300',
    outline: 'border border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900',
  };

  return (
    <button className={cn(baseClasses, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
