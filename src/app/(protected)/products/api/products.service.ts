import { mockProducts, simulateDelay } from '@/app/(public)/login/api/mock-data';

import type { TProduct } from '../model/products.schemas';

export const productService = {
  async list() {
    // Mock implementation
    await simulateDelay(300);

    return mockProducts as TProduct[];
  },

  async getById(id: string) {
    // Mock implementation
    await simulateDelay(200);

    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      throw new Error('Không tìm thấy sản phẩm');
    }

    return product as TProduct;
  },
};
