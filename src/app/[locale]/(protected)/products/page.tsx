'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';

import { LoadingOverlay } from '@/shared/ui/feedback/loading/LoadingOverlay';

const ProductList = dynamic(() => import('@/app/[locale]/(protected)/products/ui/ProductList'), {
  ssr: false,
});

const ProductsPage = () => {
  const t = useTranslations('products');

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{t('title')}</h1>
        <p className="text-sm text-slate-500">{t('subtitle')}</p>
      </header>
      <Suspense fallback={<LoadingOverlay message={t('loadingList')} />}>
        <ProductList />
      </Suspense>
    </div>
  );
};

export default ProductsPage;
