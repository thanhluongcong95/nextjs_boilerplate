jest.mock('@/app/[locale]/(public)/auth/(_lib)/api/auth.service', () => ({
  authService: {
    requestPasswordReset: jest.fn(),
    verifyResetOtp: jest.fn(),
    resetPassword: jest.fn(),
    resendResetOtp: jest.fn(),
  },
}));

const { authService: mockedAuthService } = jest.requireMock('@/app/[locale]/(public)/auth/(_lib)/api/auth.service') as {
  authService: {
    requestPasswordReset: jest.Mock;
    verifyResetOtp: jest.Mock;
    resetPassword: jest.Mock;
    resendResetOtp: jest.Mock;
  };
};

const mockRequestPasswordReset = mockedAuthService.requestPasswordReset;
const mockVerifyResetOtp = mockedAuthService.verifyResetOtp;
const mockResetPassword = mockedAuthService.resetPassword;
const mockResendResetOtp = mockedAuthService.resendResetOtp;

/**
 * Test suite for useForgotPassword hook
 * Behaviour-driven structure with Jest + React Testing Library
 */

import { act, renderHook } from '@testing-library/react';

import { OTP_TYPE } from '../../model';
import { useForgotPassword } from '../useForgotPassword';

const renderForgotPasswordHook = () => {
  const hook = renderHook(() => useForgotPassword());
  const getState = () => hook.result.current[0];
  const getActions = () => hook.result.current[1];
  const setEmail = (value: string) => act(() => getActions().setEmail(value));
  const setOtp = (value: string) => act(() => getActions().setOtp(value));
  const setPassword = (value: string) => act(() => getActions().setPassword(value));
  const setConfirmPassword = (value: string) => act(() => getActions().setConfirmPassword(value));
  const submit = async () => {
    await act(async () => {
      await getActions().submit();
    });
  };
  const resend = async () => {
    await act(async () => {
      await getActions().resend();
    });
  };
  return { ...hook, getState, getActions, setEmail, setOtp, setPassword, setConfirmPassword, submit, resend };
};

const VALID_EMAIL = 'user@grow-ps.com';
const VALID_PASSWORD = 'Password!1';

// =============================================================================
// Tests
// =============================================================================

describe('useForgotPassword', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Initial state', () => {
    it('GIVEN hook renders WHEN no actions THEN returns default state', () => {
      const { getState } = renderForgotPasswordHook();

      const state = getState();
      expect(state.step).toBe(1);
      expect(state.email).toBe('');
      expect(state.otp).toBe('');
      expect(state.password).toBe('');
      expect(state.confirmPassword).toBe('');
      expect(state.isBusy).toBe(false);
      expect(state.isResending).toBe(false);
      expect(state.errorKey).toBeNull();
      expect(state.isResetSuccess).toBe(false);
      expect(state.resendSuccess).toBe(false);
    });
  });

  describe('Step 1 - Request reset', () => {
    it('GIVEN valid email WHEN submit succeeds THEN advances to OTP step', async () => {
      const { getState, setEmail, submit } = renderForgotPasswordHook();

      setEmail(VALID_EMAIL);
      expect(getState().email).toBe(VALID_EMAIL);
      mockRequestPasswordReset.mockResolvedValueOnce(undefined);

      await submit();

      expect(mockRequestPasswordReset).toHaveBeenCalledWith({ email: VALID_EMAIL });
      const state = getState();
      expect(state.step).toBe(2);
      expect(state.errorKey).toBeNull();
      expect(state.isBusy).toBe(false);
    });

    it('GIVEN invalid email WHEN submit THEN sets emailDomainInvalid and stays on step 1', async () => {
      const { getState, setEmail, submit } = renderForgotPasswordHook();

      setEmail('user@example.com');

      await submit();

      expect(mockRequestPasswordReset).not.toHaveBeenCalled();
      const state = getState();
      expect(state.step).toBe(1);
      expect(state.errorKey).toBe('emailDomainInvalid');
      expect(state.isBusy).toBe(false);
    });

    it('GIVEN rate limited response WHEN submit THEN sets rateLimited error', async () => {
      const { getState, setEmail, submit } = renderForgotPasswordHook();

      setEmail(VALID_EMAIL);
      mockRequestPasswordReset.mockRejectedValueOnce({ status: 429 });

      await submit();

      const state = getState();
      expect(state.errorKey).toBe('rateLimited');
      expect(state.step).toBe(1);
      expect(state.isBusy).toBe(false);
    });
  });

  describe('Step 2 - Verify OTP', () => {
    const moveToStep2 = async () => {
      const hook = renderForgotPasswordHook();
      hook.setEmail(VALID_EMAIL);
      mockRequestPasswordReset.mockResolvedValueOnce(undefined);
      await hook.submit();
      return hook;
    };

    it('GIVEN valid OTP WHEN submit succeeds THEN advances to reset step', async () => {
      const hook = await moveToStep2();
      hook.setOtp('123456');
      mockVerifyResetOtp.mockResolvedValueOnce(undefined);

      await hook.submit();

      const state = hook.getState();
      expect(mockVerifyResetOtp).toHaveBeenCalledWith({
        email: VALID_EMAIL,
        otp: '123456',
        otpType: OTP_TYPE.FORGOT_PASSWORD,
      });
      expect(state.step).toBe(3);
      expect(state.errorKey).toBeNull();
    });

    it('GIVEN invalid OTP WHEN submit THEN sets otpInvalid error', async () => {
      const hook = await moveToStep2();
      hook.setOtp('12');

      await hook.submit();

      expect(mockVerifyResetOtp).not.toHaveBeenCalled();
      expect(hook.getState().errorKey).toBe('otpInvalid');
      expect(hook.getState().step).toBe(2);
    });
  });

  describe('Step 3 - Reset password', () => {
    const moveToStep3 = async () => {
      const hook = renderForgotPasswordHook();
      hook.setEmail(VALID_EMAIL);
      mockRequestPasswordReset.mockResolvedValueOnce(undefined);
      await hook.submit();
      hook.setOtp('123456');
      mockVerifyResetOtp.mockResolvedValueOnce(undefined);
      await hook.submit();
      return hook;
    };

    it('GIVEN valid passwords WHEN submit succeeds THEN marks reset success and clears secrets', async () => {
      const hook = await moveToStep3();
      hook.setPassword(VALID_PASSWORD);
      hook.setConfirmPassword(VALID_PASSWORD);
      mockResetPassword.mockResolvedValueOnce(undefined);

      await hook.submit();

      expect(mockResetPassword).toHaveBeenCalledWith({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        confirmPassword: VALID_PASSWORD,
      });
      const state = hook.getState();
      expect(state.isResetSuccess).toBe(true);
      expect(state.password).toBe('');
      expect(state.confirmPassword).toBe('');
      expect(state.otp).toBe('');
      expect(state.errorKey).toBeNull();
    });

    it('GIVEN mismatched passwords WHEN submit THEN sets passwordMismatch error', async () => {
      const hook = await moveToStep3();
      hook.setPassword(VALID_PASSWORD);
      hook.setConfirmPassword('Mismatch1!');

      await hook.submit();

      expect(mockResetPassword).not.toHaveBeenCalled();
      expect(hook.getState().errorKey).toBe('passwordMismatch');
      expect(hook.getState().isResetSuccess).toBe(false);
    });

    it('GIVEN backend failure WHEN submit THEN maps to resetFailed and clears busy flag', async () => {
      const hook = await moveToStep3();
      hook.setPassword(VALID_PASSWORD);
      hook.setConfirmPassword(VALID_PASSWORD);
      mockResetPassword.mockRejectedValueOnce(new Error('Unexpected'));

      await hook.submit();

      expect(hook.getState().errorKey).toBe('resetFailed');
      expect(hook.getState().isBusy).toBe(false);
    });
  });

  describe('Resend OTP', () => {
    it('GIVEN valid email WHEN resend succeeds THEN toggles resendSuccess and clears after timeout', async () => {
      const { getState, setEmail, resend } = renderForgotPasswordHook();

      setEmail(VALID_EMAIL);
      mockResendResetOtp.mockResolvedValueOnce(undefined);

      await resend();

      expect(mockResendResetOtp).toHaveBeenCalledWith({ email: VALID_EMAIL });
      expect(getState().resendSuccess).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      expect(getState().resendSuccess).toBe(false);
      expect(getState().isResending).toBe(false);
    });

    it('GIVEN invalid email WHEN resend THEN does not call API and leaves errorKey null', async () => {
      const { getState, setEmail, resend } = renderForgotPasswordHook();

      setEmail('user@example.com');

      await resend();

      expect(mockResendResetOtp).not.toHaveBeenCalled();
      expect(getState().resendSuccess).toBe(false);
      expect(getState().errorKey).toBeNull();
      expect(getState().isResending).toBe(false);
    });

    it('GIVEN rate limit WHEN resend THEN sets auth.rateLimited error', async () => {
      const { getState, setEmail, resend } = renderForgotPasswordHook();

      setEmail(VALID_EMAIL);
      mockResendResetOtp.mockRejectedValueOnce({ status: 429 });

      await resend();

      expect(getState().errorKey).toBe('auth.rateLimited');
      expect(getState().isResending).toBe(false);
    });
  });

  describe('State resets', () => {
    it('GIVEN resendSuccess true WHEN submit called THEN resend flag resets before processing', async () => {
      const { getState, setEmail, resend, submit } = renderForgotPasswordHook();

      setEmail(VALID_EMAIL);
      mockResendResetOtp.mockResolvedValueOnce(undefined);

      await resend();

      expect(getState().resendSuccess).toBe(true);

      mockRequestPasswordReset.mockResolvedValueOnce(undefined);
      await submit();

      expect(getState().resendSuccess).toBe(false);
    });
  });
});
