import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
});

export const userListResponseSchema = z.object({
  items: z.array(userSchema),
  total: z.number().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export const createUserPayloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateUserPayloadSchema = createUserPayloadSchema.partial();

export type TUser = z.infer<typeof userSchema>;
export type TUserListResponse = z.infer<typeof userListResponseSchema>;
export type TCreateUserPayload = z.infer<typeof createUserPayloadSchema>;
export type TUpdateUserPayload = z.infer<typeof updateUserPayloadSchema>;
