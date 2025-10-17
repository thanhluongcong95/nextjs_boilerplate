import { z } from 'zod';

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  inventory: z.number().int().nonnegative(),
  status: z.enum(['draft', 'published', 'archived']),
});

export const productListSchema = z.array(productSchema);

export type TProduct = z.infer<typeof productSchema>;
