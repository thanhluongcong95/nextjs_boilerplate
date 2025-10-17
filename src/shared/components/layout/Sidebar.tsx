import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/', label: 'Marketing Site' },
];

export const Sidebar = () => {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
      <div className="mb-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Navigation
      </div>
      <nav className="flex flex-col gap-2 text-sm">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
