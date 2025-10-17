import { z } from 'zod';

jest.mock('@/shared/config/api', () => ({
  API_ROUTES: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      verifyOtp: '/auth/verify-otp',
      resendOtp: '/auth/resend-otp',
      resendResetOtp: '/auth/resend-reset-otp',
      forgotPassword: '/auth/forgot-password',
      verifyResetOtp: '/auth/verify-reset-otp',
      resetPassword: '/auth/reset-password',
      me: '/auth/me',
      changePassword: '/auth/change-password',
      refresh: '/auth/refresh',
    },
  },
}));

const mockHttpGet = jest.fn();
const mockHttpPost = jest.fn();
const mockHttpPostPublic = jest.fn();

jest.mock('@/shared/infra/http/http.client', () => ({
  httpGet: (...args: unknown[]) => mockHttpGet(...args),
  httpPost: (...args: unknown[]) => mockHttpPost(...args),
  httpPostPublic: (...args: unknown[]) => mockHttpPostPublic(...args),
}));

import { API_ROUTES } from '@/shared/config/api';
import type {
  TAuthUser,
  TChangePasswordPayload,
  TForgotPasswordPayload,
  TRefreshTokenPayload,
  TResetPasswordPayload,
  TSignInPayload,
  TSignUpPayload,
  TSignUpResponse,
  TVerifyOtpPayload,
  TVerifyResetOtpPayload,
} from '../../model';
import { OTP_TYPE, SIGN_UP_ALLOWED_EMAIL_DOMAINS, authUserSchema, signInResponseSchema } from '../../model';
import { authService } from '../auth.service';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    const validPayload: TSignInPayload = {
      email: `user@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}`,
      password: 'Password!1',
    };

    it('should call login API with validated payload', async () => {
      const response = { accessToken: 'token', refreshToken: 'refresh', user: { id: '1' } };
      mockHttpPostPublic.mockResolvedValueOnce(response);

      const result = await authService.signIn(validPayload);

      expect(mockHttpPostPublic).toHaveBeenCalledWith(API_ROUTES.auth.login, {
        body: validPayload,
        schema: signInResponseSchema,
        meta: { withCredentials: true },
      });
      expect(result).toBe(response);
    });

    it('should throw when payload fails validation', async () => {
      const invalidPayload = { ...validPayload, email: 'not-an-email' };

      await expect(authService.signIn(invalidPayload as TSignInPayload)).rejects.toThrow(z.ZodError);
      expect(mockHttpPostPublic).not.toHaveBeenCalled();
    });

    it('should propagate http errors', async () => {
      const error = new Error('Network');
      mockHttpPostPublic.mockRejectedValueOnce(error);

      await expect(authService.signIn(validPayload)).rejects.toThrow(error);
      expect(mockHttpPostPublic).toHaveBeenCalledTimes(1);
    });
  });

  describe('signUp', () => {
    const validPayload: TSignUpPayload = {
      fullName: 'John Doe',
      email: `john@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}`,
      password: 'Password!1',
      confirmPassword: 'Password!1',
    };

    it('should call register API with parsed payload', async () => {
      const mockedResponse: TSignUpResponse = { email: validPayload.email, expiresIn: 120 };
      mockHttpPostPublic.mockResolvedValueOnce(mockedResponse);

      const result = await authService.signUp(validPayload);

      expect(mockHttpPostPublic).toHaveBeenCalledWith(API_ROUTES.auth.register, {
        body: validPayload,
        schema: expect.any(Object),
        meta: { withCredentials: true, showErrorNotification: false },
      });
      expect(result).toEqual(mockedResponse);
    });

    it('should reject invalid payload without hitting network', async () => {
      const invalidPayload = { ...validPayload, confirmPassword: 'Mismatch1!' };

      await expect(authService.signUp(invalidPayload as TSignUpPayload)).rejects.toThrow(z.ZodError);
      expect(mockHttpPostPublic).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    const payload: TVerifyOtpPayload = {
      email: `john@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}`,
      otp: '123456',
      otpType: OTP_TYPE.REGISTRATION,
    };

    it('should transform otp payload and post to verify endpoint', async () => {
      const mockResponse = { id: 'otp-id' };
      mockHttpPostPublic.mockResolvedValueOnce(mockResponse);

      const result = await authService.verifyOtp(payload);

      expect(mockHttpPostPublic).toHaveBeenCalledWith(API_ROUTES.auth.verifyOtp, {
        body: { email: payload.email, code: payload.otp, otp_type: payload.otpType },
        schema: expect.any(Object),
        meta: { withCredentials: true, showErrorNotification: false },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should reject for invalid OTP data', async () => {
      const invalidPayload = { ...payload, otp: 'xxx' };

      await expect(authService.verifyOtp(invalidPayload as TVerifyOtpPayload)).rejects.toThrow(z.ZodError);
      expect(mockHttpPostPublic).not.toHaveBeenCalled();
    });
  });

  describe('resendOtp', () => {
    const payload = { email: `user@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}` };

    it('should call resend OTP endpoint with validated payload', async () => {
      const apiResponse: TSignUpResponse = { email: payload.email, expiresIn: 90 };
      mockHttpPostPublic.mockResolvedValueOnce(apiResponse);

      const result = await authService.resendOtp(payload);

      expect(mockHttpPostPublic).toHaveBeenCalledWith(API_ROUTES.auth.resendOtp, {
        body: payload,
        schema: expect.any(Object),
        meta: { withCredentials: true, showErrorNotification: false },
      });
      expect(result).toEqual(apiResponse);
    });
  });

  describe('resendResetOtp', () => {
    const payload = { email: `user@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}` };

    it('should call resend reset OTP endpoint', async () => {
      mockHttpPostPublic.mockResolvedValueOnce(undefined);

      await authService.resendResetOtp(payload);

      expect(mockHttpPostPublic).toHaveBeenCalledWith(API_ROUTES.auth.resendResetOtp, {
        body: payload,
        meta: { withCredentials: true, showErrorNotification: false },
      });
    });
  });

  describe('requestPasswordReset', () => {
    const payload: TForgotPasswordPayload = { email: `user@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}` };

    it('should send validated forgot password payload', async () => {
      mockHttpPostPublic.mockResolvedValueOnce(undefined);

      await authService.requestPasswordReset(payload);

      expect(mockHttpPostPublic).toHaveBeenCalledWith(API_ROUTES.auth.forgotPassword, {
        body: payload,
        meta: { withCredentials: true, showErrorNotification: false },
      });
    });

    it('should throw for invalid email domain', async () => {
      const invalidPayload = { email: 'user@example.com' };

      await expect(authService.requestPasswordReset(invalidPayload as TForgotPasswordPayload)).rejects.toThrow(z.ZodError);
      expect(mockHttpPostPublic).not.toHaveBeenCalled();
    });
  });

  describe('verifyResetOtp', () => {
    const payload: TVerifyResetOtpPayload = {
      email: `user@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}`,
      otp: '654321',
      otpType: OTP_TYPE.FORGOT_PASSWORD,
    };

    it('should transform reset OTP payload before posting', async () => {
      mockHttpPostPublic.mockResolvedValueOnce(undefined);

      await authService.verifyResetOtp(payload);

      expect(mockHttpPostPublic).toHaveBeenCalledWith(API_ROUTES.auth.verifyResetOtp, {
        body: { email: payload.email, code: payload.otp, otp_type: payload.otpType },
        meta: { withCredentials: true, showErrorNotification: false },
      });
    });
  });

  describe('resetPassword', () => {
    const payload: TResetPasswordPayload = {
      email: `user@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}`,
      password: 'Password!1',
      confirmPassword: 'Password!1',
    };

    it('should send reset password payload with proper meta', async () => {
      mockHttpPostPublic.mockResolvedValueOnce(undefined);

      await authService.resetPassword(payload);

      expect(mockHttpPostPublic).toHaveBeenCalledWith(API_ROUTES.auth.resetPassword, {
        body: {
          email: payload.email,
          password: payload.password,
          confirmPassword: payload.confirmPassword,
        },
        meta: { withCredentials: true, showErrorNotification: true },
      });
    });

    it('should reject when passwords do not match', async () => {
      const invalidPayload = { ...payload, confirmPassword: 'Mismatch1!' };

      await expect(authService.resetPassword(invalidPayload as TResetPasswordPayload)).rejects.toThrow(z.ZodError);
      expect(mockHttpPostPublic).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should retrieve current user with schema validation', async () => {
      const user: TAuthUser = { id: '1', email: `user@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}`, role: 'user' };
      mockHttpGet.mockResolvedValueOnce(user);

      const result = await authService.getMe();

      expect(mockHttpGet).toHaveBeenCalledWith(API_ROUTES.auth.me, {
        schema: authUserSchema,
        meta: { withCredentials: true },
      });
      expect(result).toEqual(user);
    });
  });

  describe('changePassword', () => {
    const payload: TChangePasswordPayload = {
      currentPassword: 'Current#1',
      password: 'NewPass#2',
      confirmPassword: 'NewPass#2',
    };

    it('should call change password endpoint with payload', async () => {
      mockHttpPost.mockResolvedValueOnce(undefined);

      await authService.changePassword(payload);

      expect(mockHttpPost).toHaveBeenCalledWith(API_ROUTES.auth.changePassword, {
        body: {
          currentPassword: payload.currentPassword,
          password: payload.password,
          confirmPassword: payload.confirmPassword,
        },
        meta: { withCredentials: true, showErrorNotification: true },
      });
    });

    it('should reject when new password equals current', async () => {
      const invalidPayload = {
        currentPassword: 'Password!1',
        password: 'Password!1',
        confirmPassword: 'Password!1',
      };

      await expect(authService.changePassword(invalidPayload as TChangePasswordPayload)).rejects.toThrow(z.ZodError);
      expect(mockHttpPost).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    const payload: TRefreshTokenPayload = { refreshToken: 'refresh-token-value' };

    it('should call refresh endpoint with credentials meta', async () => {
      const response = { accessToken: 'new-token' };
      mockHttpPostPublic.mockResolvedValueOnce(response);

      const result = await authService.refreshToken(payload);

      expect(mockHttpPostPublic).toHaveBeenCalledWith(API_ROUTES.auth.refresh, {
        body: payload,
        schema: signInResponseSchema,
        meta: { withCredentials: true },
      });
      expect(result).toEqual(response);
    });

    it('should reject when refresh token too short', async () => {
      await expect(authService.refreshToken({ refreshToken: 'short' } as TRefreshTokenPayload)).rejects.toThrow(z.ZodError);
      expect(mockHttpPostPublic).not.toHaveBeenCalled();
    });
  });
});
