'use client';

import { Select } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

import type { Locale } from '@/i18n';

const languages = [
  { code: 'en' as Locale, label: 'English', flag: '🇬🇧' },
  { code: 'fr' as Locale, label: 'Français', flag: '🇫🇷' },
];

export const LanguageSwitcher = () => {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLanguageChange = (newLocale: Locale) => {
    const segments = pathname.split('/').filter(Boolean);
    const nextSegments = [newLocale, ...segments.slice(1)];
    const qs = searchParams?.toString();
    const newPath = `/${nextSegments.join('/')}${qs ? `?${qs}` : ''}`;

    router.push(newPath || `/${newLocale}`);
  };

  return (
    <Select
      value={locale}
      onChange={handleLanguageChange}
      className="min-w-[100px] border-0 bg-transparent sm:min-w-[120px]"
      size="middle"
      variant="borderless"
      suffixIcon={null}
      options={languages.map(lang => ({
        value: lang.code,
        label: (
          <span className="flex items-center gap-2">
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm font-medium">{lang.label}</span>
          </span>
        ),
      }))}
    />
  );
};
