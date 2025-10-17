/**
 * Test Suite for useSignUpOtp hook
 * Behaviour-driven TDD using React Testing Library renderHook
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import type { ChangeEvent, FormEvent } from 'react';

import { AppError } from '@/shared/infra/errors/appError';
import { ErrorCode } from '@/shared/infra/errors/error-codes';

import { OTP_TYPE, otpCodeSchema } from '../../model';
import { useSignUpOtp } from '../useSignUpOtp';

jest.useFakeTimers();

// =============================================================================
// Mocks
// =============================================================================

const mockPush = jest.fn();
const mockRouter = { push: mockPush };

const createTranslator = () => {
  const translate = jest.fn((key: string, params?: Record<string, unknown>) => {
    if (params?.email) return `${key}:${params.email}:${params.expiresIn ?? ''}`.trim();
    return key;
  }) as jest.Mock<string, [string, Record<string, unknown>?]> & { has?: (key: string) => boolean };
  translate.has = () => true;
  return translate;
};

const mockNotificationSuccess = jest.fn();
const mockNotificationError = jest.fn();

const mockVerifyOtp = jest.fn();
const mockResendOtp = jest.fn();

jest.mock('../../api/auth.service', () => ({
  authService: {
    verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    resendOtp: (...args: unknown[]) => mockResendOtp(...args),
  },
}));

const createOtpHandler = (translate: ReturnType<typeof createTranslator>) => ({
  sanitizeOtp: jest.fn((value: string) => value.replace(/\D/g, '').slice(0, 6)),
  validateOtp: jest.fn((otp: string) => {
    const parsed = otpCodeSchema.safeParse(otp.trim());
    return parsed.success ? { isValid: true, code: parsed.data } : { isValid: false };
  }),
  formatSuccessMessage: jest.fn((key: string, email: string, expiresIn?: number) => translate(key, { email, expiresIn })),
});

const mockOtpErrorHandler = {
  handle: jest.fn(),
};

const createHook = () => {
  const authT = createTranslator();
  const otpHandler = createOtpHandler(authT);
  const notificationService = {
    success: mockNotificationSuccess,
    error: mockNotificationError,
  };

  return {
    authT,
    otpHandler,
    notificationService,
    render: () =>
      renderHook(() =>
        useSignUpOtp({
          locale: 'en',
          router: mockRouter,
          authT,
          notificationService,
          otpHandler,
          otpErrorHandler: mockOtpErrorHandler,
        })
      ),
  };
};

// =============================================================================
// Helpers
// =============================================================================

const createChangeEvent = (value: string) => ({ target: { value } }) as ChangeEvent<HTMLInputElement>;
const createFormEvent = () => ({ preventDefault: jest.fn() }) as unknown as FormEvent<HTMLFormElement>;

// =============================================================================
// Tests
// =============================================================================

describe('useSignUpOtp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('GIVEN hook renders WHEN nothing happens THEN exposes initial state', () => {
      const { render } = createHook();
      const { result } = render();

      expect(result.current.otp).toBe('');
      expect(result.current.otpEmail).toBeNull();
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.isResending).toBe(false);
      expect(typeof result.current.startOtpFlow).toBe('function');
      expect(typeof result.current.handleOtpChange).toBe('function');
      expect(typeof result.current.handleVerifyOtp).toBe('function');
      expect(typeof result.current.handleResendOtp).toBe('function');
    });
  });

  describe('OTP flow management', () => {
    it('GIVEN startOtpFlow is called WHEN email is provided THEN otp state resets and email stored', () => {
      const { render } = createHook();
      const { result } = render();

      act(() => {
        result.current.startOtpFlow('user@grow-ps.com');
      });

      expect(result.current.otpEmail).toBe('user@grow-ps.com');
      expect(result.current.otp).toBe('');
    });

    it('GIVEN handleOtpChange receives mixed input WHEN invoked THEN sanitises to six digits', () => {
      const { render } = createHook();
      const { result } = render();

      act(() => {
        result.current.handleOtpChange(createChangeEvent('12-3a4567'));
      });

      expect(result.current.otp).toBe('123456');
    });
  });

  describe('Verification', () => {
    it('GIVEN valid OTP WHEN handleVerifyOtp succeeds THEN notifies success and navigates to signin', async () => {
      const { render, authT } = createHook();
      const { result } = render();

      act(() => {
        result.current.startOtpFlow('john@grow-ps.com');
        result.current.handleOtpChange(createChangeEvent('123456'));
      });

      mockVerifyOtp.mockResolvedValueOnce({});

      await act(async () => {
        await result.current.handleVerifyOtp(createFormEvent());
      });

      await waitFor(() => expect(result.current.isVerifying).toBe(false));
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: 'john@grow-ps.com',
        otp: '123456',
        otpType: OTP_TYPE.REGISTRATION,
      });
      expect(mockNotificationSuccess).toHaveBeenCalledWith('otpVerifiedSuccess');

      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(mockPush).toHaveBeenCalledWith('/en/auth/signin');
    });

    it('GIVEN invalid OTP WHEN handleVerifyOtp runs THEN shows otpInvalid feedback', async () => {
      const { render } = createHook();
      const { result } = render();

      act(() => {
        result.current.startOtpFlow('john@grow-ps.com');
        result.current.handleOtpChange(createChangeEvent('12345'));
      });

      await act(async () => {
        await result.current.handleVerifyOtp(createFormEvent());
      });

      expect(mockNotificationError).toHaveBeenCalledWith('otpInvalid');
      expect(mockVerifyOtp).not.toHaveBeenCalled();
    });

    it('GIVEN otpEmail not set WHEN handleVerifyOtp THEN shows registrationFailed', async () => {
      const { render } = createHook();
      const { result } = render();

      await act(async () => {
        await result.current.handleVerifyOtp(createFormEvent());
      });

      expect(mockNotificationError).toHaveBeenCalledWith('registrationFailed');
      expect(mockVerifyOtp).not.toHaveBeenCalled();
    });

    it('GIVEN otpHandler rejects code WHEN handleVerifyOtp THEN shows otpInvalid', async () => {
      const { render, authT, otpHandler } = createHook();
      otpHandler.validateOtp.mockReturnValueOnce({ isValid: true });

      const { result } = render();

      act(() => {
        result.current.startOtpFlow('john@grow-ps.com');
        result.current.handleOtpChange(createChangeEvent('123456'));
      });

      await act(async () => {
        await result.current.handleVerifyOtp(createFormEvent());
      });

      expect(mockNotificationError).toHaveBeenCalledWith('otpInvalid');
      expect(authT).toHaveBeenCalledWith('otpInvalid');
      expect(mockVerifyOtp).not.toHaveBeenCalled();
    });

    it('GIVEN AppError WHEN handleVerifyOtp THEN delegates to otpErrorHandler', async () => {
      const { render } = createHook();
      const { result } = render();

      act(() => {
        result.current.startOtpFlow('john@grow-ps.com');
        result.current.handleOtpChange(createChangeEvent('123456'));
      });

      const error = new AppError(ErrorCode.BAD_REQUEST, 'OTP invalid');
      mockVerifyOtp.mockRejectedValueOnce(error);

      await act(async () => {
        await result.current.handleVerifyOtp(createFormEvent());
      });

      expect(mockOtpErrorHandler.handle).toHaveBeenCalledWith(error);
    });

    it('GIVEN unexpected error WHEN handleVerifyOtp THEN shows otpInvalid message', async () => {
      const { render } = createHook();
      const { result } = render();

      act(() => {
        result.current.startOtpFlow('john@grow-ps.com');
        result.current.handleOtpChange(createChangeEvent('123456'));
      });

      mockVerifyOtp.mockRejectedValueOnce(new Error('Network down'));

      await act(async () => {
        await result.current.handleVerifyOtp(createFormEvent());
      });

      expect(mockNotificationError).toHaveBeenCalledWith('otpInvalid');
    });

    it('GIVEN redirect scheduled WHEN component unmounts THEN navigation is cancelled', async () => {
      const { render } = createHook();
      const { result, unmount } = render();

      act(() => {
        result.current.startOtpFlow('john@grow-ps.com');
        result.current.handleOtpChange(createChangeEvent('123456'));
      });

      mockVerifyOtp.mockResolvedValueOnce({});

      await act(async () => {
        await result.current.handleVerifyOtp(createFormEvent());
      });

      unmount();

      act(() => {
        jest.runAllTimers();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Resend OTP', () => {
    it('GIVEN valid email WHEN handleResendOtp succeeds THEN notifies success', async () => {
      const { render, otpHandler } = createHook();
      const { result } = render();

      act(() => {
        result.current.startOtpFlow('john@grow-ps.com');
      });

      mockResendOtp.mockResolvedValueOnce({ expiresIn: 90 });

      await act(async () => {
        await result.current.handleResendOtp();
      });

      expect(mockResendOtp).toHaveBeenCalledWith({ email: 'john@grow-ps.com' });
      expect(mockNotificationSuccess).toHaveBeenCalledWith('otpResent:john@grow-ps.com:90');
    });

    it('GIVEN no email WHEN handleResendOtp THEN shows registrationFailed', async () => {
      const { render } = createHook();
      const { result } = render();

      await act(async () => {
        await result.current.handleResendOtp();
      });

      expect(mockNotificationError).toHaveBeenCalledWith('registrationFailed');
      expect(mockResendOtp).not.toHaveBeenCalled();
    });

    it('GIVEN AppError WHEN handleResendOtp THEN delegates to otpErrorHandler', async () => {
      const { render } = createHook();
      const { result } = render();

      act(() => {
        result.current.startOtpFlow('john@grow-ps.com');
      });

      const error = new AppError(ErrorCode.BAD_REQUEST, 'Otp expired');
      mockResendOtp.mockRejectedValueOnce(error);

      await act(async () => {
        await result.current.handleResendOtp();
      });

      expect(mockOtpErrorHandler.handle).toHaveBeenCalledWith(error);
    });

    it('GIVEN unexpected error WHEN handleResendOtp THEN shows otpInvalid', async () => {
      const { render } = createHook();
      const { result } = render();

      act(() => {
        result.current.startOtpFlow('john@grow-ps.com');
      });

      mockResendOtp.mockRejectedValueOnce(new Error('boom'));

      await act(async () => {
        await result.current.handleResendOtp();
      });

      expect(mockNotificationError).toHaveBeenCalledWith('otpInvalid');
    });
  });
});
