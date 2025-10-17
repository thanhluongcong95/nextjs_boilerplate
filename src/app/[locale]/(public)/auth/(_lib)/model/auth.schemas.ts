import { z } from 'zod';

import { emailSchema, passwordSchema } from '@/shared/infra/validation/schemas';

export const signInPayloadSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Base user schema that accepts backend format
const rawAuthUserSchema = z.object({
  id: z.string(),
  email: emailSchema,
  fullName: z.string().optional(),
  name: z.string().optional(), // Legacy field
  avatarUrl: z.string().url().optional(),
  role: z.enum(['admin', 'user', 'USER', 'ADMIN', 'Admin', 'User']),
  password: z.string().optional(), // Include in raw response but exclude from final type
  createdAt: z.string().optional(),
});

// Transform to normalized user format (normalize role, remove password)
export const authUserSchema = rawAuthUserSchema.transform(({ password: _, role, ...rest }) => {
  // Normalize role to lowercase
  let normalizedRole: 'admin' | 'user' = 'user';
  if (role === 'USER' || role === 'User') {
    normalizedRole = 'user';
  } else if (role === 'ADMIN' || role === 'Admin') {
    normalizedRole = 'admin';
  } else {
    normalizedRole = role.toLowerCase() as 'admin' | 'user';
  }

  return {
    ...rest,
    role: normalizedRole,
  };
});

// Backend response wrapper schema
const apiResponseWrapperSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status_code: z.number(),
    message: z.string(),
    success: z.boolean(),
    body: dataSchema,
  });

// Raw response body from backend (includes password)
const signInResponseBodySchema = z.object({
  user: rawAuthUserSchema,
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

// Wrapped response from backend
const signInWrappedResponseSchema = apiResponseWrapperSchema(signInResponseBodySchema);

// Transform to our expected format (exclude password from user)
export const signInResponseSchema = signInWrappedResponseSchema.transform(({ body }) => {
  // Transform user to exclude password
  const { password: _, ...userWithoutPassword } = body.user;
  const normalizedUser = authUserSchema.parse(userWithoutPassword);

  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expiresIn: undefined, // Extract from JWT if needed
    user: normalizedUser,
  };
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});

// Shared email domain whitelist for both signup and forgot password
export const ALLOWED_EMAIL_DOMAINS = ['grow-ps.com', 'horizonfactory.fr', 'yopmail.com'] as const;

// Legacy export for backward compatibility
export const SIGN_UP_ALLOWED_EMAIL_DOMAINS = ALLOWED_EMAIL_DOMAINS;

const signUpPasswordSchema = z
  .string()
  .min(8, 'passwordMin')
  .regex(/[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/, 'passwordSpecialChar');

export const signUpPayloadSchema = z
  .object({
    fullName: z.string().trim().min(2, 'nameMin'),
    email: emailSchema.superRefine((value, ctx) => {
      const domain = value.split('@')[1]?.toLowerCase();
      const isAllowed = domain ? ALLOWED_EMAIL_DOMAINS.some(allowed => domain === allowed) : false;
      if (!isAllowed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'emailDomainInvalid',
          path: ['email'],
        });
      }
    }),
    password: signUpPasswordSchema,
    confirmPassword: z.string().min(8, 'passwordMin'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

export const signUpResponseSchema = z
  .object({
    email: emailSchema.optional(),
    expiresIn: z.number().int().positive().optional(),
  })
  .passthrough();

export const otpCodeSchema = z.string().regex(/^\d{6}$/, 'otpInvalid');

// OTP Type enum
export enum OTP_TYPE {
  REGISTRATION = 'REGISTRATION',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

// Schema for verify OTP payload - accepts 'otp' internally, sends 'code' to API
export const verifyOtpPayloadSchema = z.object({
  email: emailSchema,
  otp: otpCodeSchema, // Internal field name (used in code)
  otpType: z.nativeEnum(OTP_TYPE),
});

// Verify OTP response body schema
const verifyOtpResponseBodySchema = z.object({
  id: z.string(),
  code: z.string(),
  email: emailSchema,
  isUsed: z.boolean(),
  sentCount: z.number(),
  expiresAt: z.string(),
  createdAt: z.string(),
});

// Wrapped response from backend for verify-otp
const verifyOtpWrappedResponseSchema = apiResponseWrapperSchema(verifyOtpResponseBodySchema);

// Transform verify-otp response to our expected format
export const verifyOtpResponseSchema = verifyOtpWrappedResponseSchema.transform(({ body }) => ({
  id: body.id,
  code: body.code,
  email: body.email,
  isUsed: body.isUsed,
  sentCount: body.sentCount,
  expiresAt: body.expiresAt,
  createdAt: body.createdAt,
}));

export const resendOtpPayloadSchema = z.object({
  email: emailSchema,
});

// Forgot password flow
export const forgotPasswordPayloadSchema = z.object({
  email: emailSchema.superRefine((value, ctx) => {
    const domain = value.split('@')[1]?.toLowerCase();
    const isAllowed = domain ? ALLOWED_EMAIL_DOMAINS.some(allowed => domain === allowed) : false;
    if (!isAllowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'emailDomainInvalid',
        path: ['email'],
      });
    }
  }),
});

export const verifyResetOtpPayloadSchema = z.object({
  email: emailSchema,
  otp: otpCodeSchema, // 6 digits
  otpType: z.nativeEnum(OTP_TYPE),
});

// Password schema for reset password (requires special character like signup)
const resetPasswordSchema = z
  .string()
  .min(8, 'passwordMin')
  .regex(/[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/, 'passwordSpecialChar');

export const resetPasswordPayloadSchema = z
  .object({
    email: emailSchema,
    password: resetPasswordSchema,
    confirmPassword: z.string().min(8, 'passwordMin'),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

// Change password schema
export const changePasswordPayloadSchema = z
  .object({
    currentPassword: passwordSchema,
    password: passwordSchema, // Backend expects 'password', not 'newPassword'
    confirmPassword: z.string().min(8, 'passwordMin'),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  })
  .refine(d => d.currentPassword !== d.password, {
    message: 'passwordMustBeDifferent',
    path: ['password'],
  });

export type TSignInPayload = z.infer<typeof signInPayloadSchema>;
export type TSignInResponse = z.infer<typeof signInResponseSchema>;
export type TAuthUser = z.infer<typeof authUserSchema>;
export type TRefreshTokenPayload = z.infer<typeof refreshTokenSchema>;
export type TSignUpPayload = z.infer<typeof signUpPayloadSchema>;
export type TSignUpResponse = z.infer<typeof signUpResponseSchema>;
export type TVerifyOtpPayload = z.infer<typeof verifyOtpPayloadSchema>;
export type TVerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;
export type TResendOtpPayload = z.infer<typeof resendOtpPayloadSchema>;
export type TForgotPasswordPayload = z.infer<typeof forgotPasswordPayloadSchema>;
export type TVerifyResetOtpPayload = z.infer<typeof verifyResetOtpPayloadSchema>;
export type TResetPasswordPayload = z.infer<typeof resetPasswordPayloadSchema>;
export type TChangePasswordPayload = z.infer<typeof changePasswordPayloadSchema>;
