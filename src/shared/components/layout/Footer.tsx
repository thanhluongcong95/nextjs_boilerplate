import { siteConfig } from '@/shared/constants/site';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white px-8 py-4 text-xs text-slate-500">
      © {year} {siteConfig.name}. All rights reserved.
    </footer>
  );
};
