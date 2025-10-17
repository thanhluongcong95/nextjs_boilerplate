import { z } from 'zod';

import { emailSchema, passwordSchema } from '@/shared/lib/validation/schemas';

export const loginPayloadSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number().optional(),
});

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(['admin', 'user']).default('user'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10),
});

export type TLoginPayload = z.infer<typeof loginPayloadSchema>;
export type TLoginResponse = z.infer<typeof loginResponseSchema>;
export type TAuthUser = z.infer<typeof authUserSchema>;
export type TRefreshTokenPayload = z.infer<typeof refreshTokenSchema>;
