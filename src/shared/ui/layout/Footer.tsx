'use client';

import { useTranslations } from 'next-intl';

export const Footer = () => {
  const year = new Date().getFullYear();
  const t = useTranslations('layout.footer');

  return <footer className="border-t border-slate-200 bg-white px-8 py-4 text-xs text-slate-500">{t('copyright', { year })}</footer>;
};
