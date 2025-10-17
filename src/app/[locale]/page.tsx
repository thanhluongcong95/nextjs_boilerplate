import { redirect } from 'next/navigation';

import { defaultLocale } from '@/i18n';

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params }: Readonly<HomePageProps>) {
  const locale = params.locale || defaultLocale;
  redirect(`/${locale}/auth/signin`);
}
