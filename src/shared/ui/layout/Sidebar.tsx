'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const navItems = [
  { href: '/dashboard', labelKey: 'dashboard' },
  { href: '/products', labelKey: 'products' },
];

export const Sidebar = () => {
  const locale = useLocale();
  const t = useTranslations('layout.sidebar');

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
      <div className="mb-8 text-sm font-semibold uppercase tracking-wide text-slate-500">{t('navigation')}</div>
      <nav className="flex flex-col gap-2 text-sm">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
