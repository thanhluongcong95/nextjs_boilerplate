'use client';

import { LoadingOverlay } from '@/shared/components/system/LoadingOverlay';

import { useProducts } from '../hooks/useProducts';

import { ProductCard } from './ProductCard';

export default function ProductList() {
  const { searchTerm, setSearchTerm, filteredProducts, isLoading } = useProducts();

  if (isLoading) {
    return <LoadingOverlay message="Loading products" />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Catalog</h2>
          <p className="text-sm text-slate-500">Filter and manage product inventory.</p>
        </div>
        <input
          type="search"
          placeholder="Search products"
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
