import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/shared/constants/site';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/', label: 'Marketing Site' },
];

export const Header = () => {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <div className="flex items-center gap-3">
        <Image src="/assets/logo.svg" alt="Logo" width={32} height={32} />
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{siteConfig.name}</h1>
          <p className="text-xs text-slate-500">Operational dashboard</p>
        </div>
      </div>
      <nav className="flex items-center gap-6 text-sm text-slate-600">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className="hover:text-slate-900">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};
