'use client';

import { useTranslations } from 'next-intl';

import { LoadingOverlay } from '@/shared/ui/feedback/loading/LoadingOverlay';

import { useProducts } from '../hooks/useProducts';

import { ProductCard } from './ProductCard';

export default function ProductList() {
  const { searchTerm, setSearchTerm, filteredProducts, isLoading } = useProducts();
  const t = useTranslations('products');

  if (isLoading) {
    return <LoadingOverlay message={t('loadingProducts')} />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t('catalogTitle')}</h2>
          <p className="text-sm text-slate-500">{t('catalogDescription')}</p>
        </div>
        <input
          type="search"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
