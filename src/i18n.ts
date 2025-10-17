import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid, fallback to default if not
  const validLocale = locale ?? defaultLocale;
  const normalizedLocale = locales.includes(validLocale as Locale) ? validLocale : defaultLocale;

  return {
    locale: normalizedLocale,
    messages: (await import(`./lang/${normalizedLocale}.json`)).default,
  };
});
