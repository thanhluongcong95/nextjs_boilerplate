'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { LoadingOverlay } from '@/shared/components/system/LoadingOverlay';

const ProductList = dynamic(() => import('@/app/(protected)/products/ui/ProductList'), {
  ssr: false,
});

const ProductsPage = () => {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
        <p className="text-sm text-slate-500">
          Manage the catalog, update pricing, and monitor product health in real-time.
        </p>
      </header>
      <Suspense fallback={<LoadingOverlay message="Loading product list" />}>
        <ProductList />
      </Suspense>
    </div>
  );
};

export default ProductsPage;
