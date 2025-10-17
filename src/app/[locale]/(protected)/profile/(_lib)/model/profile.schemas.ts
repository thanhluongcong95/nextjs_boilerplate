import { z } from 'zod';

import { emailSchema } from '@/shared/infra/validation/schemas';

/**
 * Profile schema - synced with Auth User data
 * Source of truth is auth user from login response
 */
export const profileSchema = z.object({
  id: z.string(),
  email: emailSchema,
  fullName: z.string(),
  phone: z.string(),
  role: z.enum(['admin', 'user']),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
});

/**
 * Update profile payload - only updatable fields
 */
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  avatarUrl: z.string().optional(),
});

export type TProfile = z.infer<typeof profileSchema>;
export type TUpdateProfilePayload = z.infer<typeof updateProfileSchema>;
