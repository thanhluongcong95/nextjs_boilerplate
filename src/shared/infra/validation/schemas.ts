import { z, type ZodSchema } from 'zod';

import { ValidationError } from '@/shared/infra/errors/appError';

export const emailSchema = z.string().email('emailInvalid');
export const passwordSchema = z.string().min(8, 'passwordMin');

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
});

export function parseApiResponse<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError('Invalid API response', result.error.issues);
  }
  return result.data;
}
