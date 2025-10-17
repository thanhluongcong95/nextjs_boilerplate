// API route constants and shared HTTP client
import { API_ROUTES } from '@/shared/config/api';
import { httpGet, httpPost, httpPostPublic } from '@/shared/infra/http/http.client';

// Import types after value imports to satisfy eslint import/order
import type {
  TAuthUser,
  TChangePasswordPayload,
  TForgotPasswordPayload,
  TRefreshTokenPayload,
  TResendOtpPayload,
  TResetPasswordPayload,
  TSignInPayload,
  TSignInResponse,
  TSignUpPayload,
  TSignUpResponse,
  TVerifyOtpPayload,
  TVerifyOtpResponse,
  TVerifyResetOtpPayload,
} from '../model';
// Import value exports first (schemas, constants)
import {
  authUserSchema,
  changePasswordPayloadSchema,
  forgotPasswordPayloadSchema,
  refreshTokenSchema,
  resendOtpPayloadSchema,
  resetPasswordPayloadSchema,
  signInPayloadSchema,
  signInResponseSchema,
  signUpPayloadSchema,
  signUpResponseSchema,
  verifyOtpPayloadSchema,
  verifyOtpResponseSchema,
  verifyResetOtpPayloadSchema,
} from '../model';

// Auth-related API calls
export const authService = {
  // Email/password sign in
  async signIn(payload: TSignInPayload): Promise<TSignInResponse> {
    const parsedPayload = signInPayloadSchema.parse(payload);

    const response = await httpPostPublic<TSignInResponse>(API_ROUTES.auth.login, {
      body: parsedPayload,
      schema: signInResponseSchema,
      meta: { withCredentials: true },
    });

    return response;
  },
  // Register new account
  async signUp(payload: TSignUpPayload): Promise<TSignUpResponse> {
    const parsedPayload = signUpPayloadSchema.parse(payload);
    const { ...body } = parsedPayload;

    return httpPostPublic<TSignUpResponse>(API_ROUTES.auth.register, {
      body,
      schema: signUpResponseSchema,
      meta: { withCredentials: true, showErrorNotification: false },
    });
  },

  // Verify account creation OTP (6 digits)
  async verifyOtp(payload: TVerifyOtpPayload): Promise<TVerifyOtpResponse> {
    const parsedPayload = verifyOtpPayloadSchema.parse(payload);

    // Transform payload: otp -> code, otpType -> otp_type for API
    const apiPayload = {
      email: parsedPayload.email,
      code: parsedPayload.otp,
      otp_type: parsedPayload.otpType,
    };

    return httpPostPublic<TVerifyOtpResponse>(API_ROUTES.auth.verifyOtp, {
      body: apiPayload,
      schema: verifyOtpResponseSchema,
      meta: { withCredentials: true, showErrorNotification: false },
    });
  },

  // Resend account creation OTP
  async resendOtp(payload: TResendOtpPayload): Promise<TSignUpResponse> {
    const parsedPayload = resendOtpPayloadSchema.parse(payload);

    return httpPostPublic<TSignUpResponse>(API_ROUTES.auth.resendOtp, {
      body: parsedPayload,
      schema: signUpResponseSchema,
      meta: { withCredentials: true, showErrorNotification: false },
    });
  },

  // Resend OTP for forgot password flow
  async resendResetOtp(payload: TResendOtpPayload): Promise<void> {
    const parsedPayload = resendOtpPayloadSchema.parse(payload);

    await httpPostPublic<void>(API_ROUTES.auth.resendResetOtp, {
      body: parsedPayload,
      meta: { withCredentials: true, showErrorNotification: false },
    });
  },

  // Forgot password: step 1/3 – request reset (do not leak email existence)
  async requestPasswordReset(payload: TForgotPasswordPayload): Promise<void> {
    const parsed = forgotPasswordPayloadSchema.parse(payload);
    await httpPostPublic<void>(API_ROUTES.auth.forgotPassword, {
      body: parsed,
      meta: { withCredentials: true, showErrorNotification: false },
    });
  },

  // Forgot password: step 2/3 – verify reset OTP
  async verifyResetOtp(payload: TVerifyResetOtpPayload): Promise<void> {
    const parsed = verifyResetOtpPayloadSchema.parse(payload);

    // Transform payload: otp -> code, otpType -> otp_type for API
    const apiPayload = {
      email: parsed.email,
      code: parsed.otp,
      otp_type: parsed.otpType,
    };

    await httpPostPublic<void>(API_ROUTES.auth.verifyResetOtp, {
      body: apiPayload,
      meta: { withCredentials: true, showErrorNotification: false },
    });
  },

  // Forgot password: step 3/3 – set new password
  async resetPassword(payload: TResetPasswordPayload): Promise<void> {
    const parsed = resetPasswordPayloadSchema.parse(payload);

    await httpPostPublic<void>(API_ROUTES.auth.resetPassword, {
      body: {
        email: parsed.email,
        password: parsed.password,
        confirmPassword: parsed.confirmPassword,
      },
      meta: { withCredentials: true, showErrorNotification: true },
    });
  },

  // Get current authenticated user
  async getMe(): Promise<TAuthUser> {
    return httpGet<TAuthUser>(API_ROUTES.auth.me, {
      schema: authUserSchema,
      meta: { withCredentials: true },
    });
  },

  // Change password
  async changePassword(payload: TChangePasswordPayload): Promise<void> {
    // Parse and validate payload (includes validation for password match and difference)
    const parsedPayload = changePasswordPayloadSchema.parse(payload);

    // Send all 3 fields to API: currentPassword, password, confirmPassword
    await httpPost<void>(API_ROUTES.auth.changePassword, {
      body: {
        currentPassword: parsedPayload.currentPassword,
        password: parsedPayload.password,
        confirmPassword: parsedPayload.confirmPassword,
      },
      meta: { withCredentials: true, showErrorNotification: true },
    });
  },

  // Refresh access token using refresh token
  async refreshToken(payload: TRefreshTokenPayload): Promise<TSignInResponse> {
    const parsedPayload = refreshTokenSchema.parse(payload);

    return httpPostPublic<TSignInResponse>(API_ROUTES.auth.refresh, {
      body: parsedPayload,
      schema: signInResponseSchema,
      meta: { withCredentials: true },
    });
  },
};
