import { API_ROUTES } from '@/shared/config/api';
import { httpGet } from '@/shared/infra/http/http.client';

import type { TProduct } from '../model/products.schemas';
import { productListSchema, productSchema } from '../model/products.schemas';

export const productService = {
  async list(): Promise<TProduct[]> {
    return httpGet<TProduct[]>(API_ROUTES.products.list, {
      schema: productListSchema,
      meta: { showErrorNotification: false },
    });
  },

  async getById(id: string): Promise<TProduct> {
    return httpGet<TProduct>(API_ROUTES.products.byId(id), {
      schema: productSchema,
      meta: { showErrorNotification: false },
    });
  },
};
