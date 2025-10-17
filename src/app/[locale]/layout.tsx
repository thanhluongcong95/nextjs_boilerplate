import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { defaultLocale, type Locale, locales } from '@/i18n';

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params }: Readonly<LocaleLayoutProps>) {
  const requestedLocale = params.locale as Locale;
  const locale = locales.includes(requestedLocale) ? requestedLocale : defaultLocale;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const requestedLocale = params.locale as Locale;
  const locale = locales.includes(requestedLocale) ? requestedLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: Object.fromEntries(locales.map(l => [l, `/${l}`])),
    },
  };
}
