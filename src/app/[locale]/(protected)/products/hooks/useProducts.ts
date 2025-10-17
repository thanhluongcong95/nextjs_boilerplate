'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { productService } from '@/app/[locale]/(protected)/products/api/products.service';
import type { TProduct } from '@/app/[locale]/(protected)/products/model/products.schemas';
import { useToast } from '@/shared/hooks/useToast';
import { handleError } from '@/shared/infra/errors/error-handler';

export function useProducts() {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setLoading] = useState(false);
  const { showError } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.list();
      setProducts(data);
    } catch (error) {
      showError(handleError(error).message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lower = searchTerm.toLowerCase();
    return products.filter(product => product.name.toLowerCase().includes(lower));
  }, [products, searchTerm]);

  return {
    products,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    isLoading,
    refetch: loadProducts,
  };
}
