import { getTranslations } from 'next-intl/server';

import { RouteLoading } from '@/shared/ui/feedback/loading/RouteLoading';

export default async function RootLoading() {
  const t = await getTranslations('common');

  return <RouteLoading message={t('loading')} description={t('loadingAppShell')} />;
}
