/**
 * Test Suite for useSignUpForm hook
 * Behaviour-driven structure using React Testing Library renderHook
 */

import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, FormEvent } from 'react';

import { AppError } from '@/shared/infra/errors/appError';
import { ErrorCode } from '@/shared/infra/errors/error-codes';

import type { SignUpFieldErrors, TSignUpPayload } from '../../model';
import { SIGN_UP_ALLOWED_EMAIL_DOMAINS } from '../../model';
import { useSignUpForm } from '../useSignUpForm';

// =============================================================================
// Mocks
// =============================================================================

const mockPush = jest.fn();
const mockRouter = { push: mockPush };
const mockLocale = 'en';

const createTranslator = (map: Record<string, ((params?: Record<string, unknown>) => string) | string>) => {
  const fn = jest.fn((key: string, params?: Record<string, unknown>) => {
    const value = map[key];
    if (typeof value === 'function') {
      return value(params);
    }
    if (typeof value === 'string') {
      return value;
    }
    if (params?.domains) {
      return `domains:${params.domains}`;
    }
    return key;
  }) as jest.Mock<string, [string, Record<string, unknown>?]> & { has: (key: string) => boolean };
  fn.has = (key: string) => key in map;
  return fn;
};

const mockAuthT = createTranslator({
  invalidForm: 'invalidForm',
  registrationFailed: 'registrationFailed',
  otpSent: ({ email, expiresIn }) => `otpSent:${email}:${expiresIn ?? ''}`.trim(),
  networkIssue: 'networkIssue',
  emailInvalid: 'emailInvalid',
  emailAlreadyRegistered: 'emailAlreadyRegistered',
  emailDomainHint: ({ domains }) => `hint:${domains}`,
  otpInvalid: 'otpInvalid',
});
const mockUsersT = createTranslator({});

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

jest.mock('next-intl', () => ({
  useLocale: () => mockLocale,
  useTranslations: (ns: string) => {
    if (ns === 'auth') return mockAuthT;
    if (ns === 'users') return mockUsersT;
    return createTranslator({});
  },
}));

jest.mock('antd', () => ({
  notification: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const { notification: antdNotification } = jest.requireMock('antd') as {
  notification: {
    error: jest.Mock;
    success: jest.Mock;
  };
};

const mockNotificationError = antdNotification.error;
const mockNotificationSuccess = antdNotification.success;

const mockSignUp = jest.fn();

jest.mock('../../api/auth.service', () => ({
  authService: {
    signUp: (...args: unknown[]) => mockSignUp(...args),
  },
}));

const mockStartOtpFlow = jest.fn();
const mockHandleOtpChange = jest.fn();
const mockHandleVerifyOtp = jest.fn();
const mockHandleResendOtp = jest.fn();

const useSignUpOtpMock = jest.fn(() => ({
  otp: '',
  otpEmail: null,
  isVerifying: false,
  isResending: false,
  startOtpFlow: mockStartOtpFlow,
  handleOtpChange: mockHandleOtpChange,
  handleVerifyOtp: mockHandleVerifyOtp,
  handleResendOtp: mockHandleResendOtp,
}));

jest.mock('../useSignUpOtp', () => ({
  useSignUpOtp: (...args: unknown[]) => useSignUpOtpMock(...args),
}));

// =============================================================================
// Helpers
// =============================================================================

const createChangeEvent = (value: string): ChangeEvent<HTMLInputElement> => ({ target: { value } }) as ChangeEvent<HTMLInputElement>;
const createFormEvent = (): FormEvent<HTMLFormElement> => ({ preventDefault: jest.fn() }) as unknown as FormEvent<HTMLFormElement>;

const buildValidPayload = (): TSignUpPayload => ({
  fullName: 'John Doe',
  email: `john@${SIGN_UP_ALLOWED_EMAIL_DOMAINS[0]}`,
  password: 'Password!1',
  confirmPassword: 'Password!1',
});

// =============================================================================
// Tests
// =============================================================================

describe('useSignUpForm', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSignUp.mockReset();
    mockNotificationError.mockClear();
    mockNotificationSuccess.mockClear();
    mockAuthT.mockClear();
    mockUsersT.mockClear();
    mockStartOtpFlow.mockClear();
    mockHandleOtpChange.mockClear();
    mockHandleVerifyOtp.mockClear();
    mockHandleResendOtp.mockClear();
    useSignUpOtpMock.mockReset();
    useSignUpOtpMock.mockReturnValue({
      otp: '',
      otpEmail: null,
      isVerifying: false,
      isResending: false,
      startOtpFlow: mockStartOtpFlow,
      handleOtpChange: mockHandleOtpChange,
      handleVerifyOtp: mockHandleVerifyOtp,
      handleResendOtp: mockHandleResendOtp,
    });
  });

  describe('Initialization', () => {
    it('GIVEN hook renders WHEN no interactions THEN returns base state and handlers', () => {
      const { result } = renderHook(() => useSignUpForm());

      expect(result.current.step).toBe('form');
      expect(result.current.locale).toBe(mockLocale);
      expect(result.current.values).toEqual({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      expect(result.current.allowedDomainList).toBe(SIGN_UP_ALLOWED_EMAIL_DOMAINS.map(domain => `@${domain}`).join(', '));
      expect(result.current.fieldErrors).toEqual({});
      expect(result.current.isRegistering).toBe(false);
      expect(result.current.isPasswordVisible).toBe(false);
      expect(result.current.isConfirmPasswordVisible).toBe(false);
      expect(result.current.handleVerifyOtp).toBe(mockHandleVerifyOtp);
      expect(result.current.handleResendOtp).toBe(mockHandleResendOtp);
      expect(result.current.handleOtpChange).toBe(mockHandleOtpChange);
    });
  });

  describe('Field Updates', () => {
    it('GIVEN user types in a field WHEN handleChange invoked THEN values update and email validated', () => {
      const { result } = renderHook(() => useSignUpForm());

      act(() => {
        result.current.handleChange('fullName')(createChangeEvent('Jane'));
        result.current.handleChange('email')(createChangeEvent('jane@example.com'));
      });

      expect(result.current.values.fullName).toBe('Jane');
      expect(result.current.values.email).toBe('jane@example.com');
      expect(result.current.fieldErrors.email).toBe('hint:@grow-ps.com, @horizonfactory.fr, @yopmail.com');
    });

    it('GIVEN visibility toggles WHEN triggered THEN flags flip', () => {
      const { result } = renderHook(() => useSignUpForm());

      act(() => {
        result.current.togglePasswordVisibility();
        result.current.toggleConfirmPasswordVisibility();
      });

      expect(result.current.isPasswordVisible).toBe(true);
      expect(result.current.isConfirmPasswordVisible).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('GIVEN invalid form WHEN handleSubmit THEN shows invalidForm notification', async () => {
      const { result } = renderHook(() => useSignUpForm());
      mockSignUp.mockResolvedValueOnce({});

      await act(async () => {
        await result.current.handleSubmit(createFormEvent());
      });

      expect(mockNotificationError).toHaveBeenCalledWith(expect.objectContaining({ message: 'invalidForm' }));
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('GIVEN valid payload WHEN handleSubmit succeeds THEN transitions to otp step', async () => {
      const { result } = renderHook(() => useSignUpForm());
      const payload = buildValidPayload();

      act(() => {
        (Object.keys(payload) as (keyof TSignUpPayload)[]).forEach(field => {
          result.current.handleChange(field)(createChangeEvent(payload[field]));
        });
      });

      mockSignUp.mockResolvedValueOnce({ expiresIn: 120 });

      await act(async () => {
        await result.current.handleSubmit(createFormEvent());
      });

      expect(mockSignUp).toHaveBeenCalledWith(payload);
      expect(mockStartOtpFlow).toHaveBeenCalledWith(payload.email);
      expect(result.current.step).toBe('otp');
      expect(result.current.values.email).toBe(payload.email);
      expect(mockNotificationSuccess).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining(`otpSent:${payload.email}`) }));
    });

    it('GIVEN email already registered WHEN handleSubmit THEN sets email field error', async () => {
      const { result } = renderHook(() => useSignUpForm());
      const payload = buildValidPayload();

      act(() => {
        (Object.keys(payload) as (keyof TSignUpPayload)[]).forEach(field => {
          result.current.handleChange(field)(createChangeEvent(payload[field]));
        });
      });

      const error = new AppError(ErrorCode.BAD_REQUEST, 'exists', 409, 'EMAIL_ALREADY_EXISTS');
      mockSignUp.mockRejectedValueOnce(error);

      await act(async () => {
        await result.current.handleSubmit(createFormEvent());
      });

      expect(result.current.fieldErrors.email).toBe('emailAlreadyRegistered');
    });

    it('GIVEN invalid domain error WHEN handleSubmit THEN populates email hint', async () => {
      const { result } = renderHook(() => useSignUpForm());
      const payload = buildValidPayload();

      act(() => {
        (Object.keys(payload) as (keyof TSignUpPayload)[]).forEach(field => {
          result.current.handleChange(field)(createChangeEvent(payload[field]));
        });
      });

      const error = new AppError(ErrorCode.BAD_REQUEST, 'invalid', 400, { code: 'INVALID_DOMAIN' });
      mockSignUp.mockRejectedValueOnce(error);

      await act(async () => {
        await result.current.handleSubmit(createFormEvent());
      });

      expect(result.current.fieldErrors.email).toBe(`hint:${SIGN_UP_ALLOWED_EMAIL_DOMAINS.map(domain => `@${domain}`).join(', ')}`);
    });

    it('GIVEN network issue WHEN handleSubmit THEN shows networkIssue notification', async () => {
      const { result } = renderHook(() => useSignUpForm());
      const payload = buildValidPayload();

      act(() => {
        (Object.keys(payload) as (keyof TSignUpPayload)[]).forEach(field => {
          result.current.handleChange(field)(createChangeEvent(payload[field]));
        });
      });

      const error = new AppError(ErrorCode.NETWORK_ERROR, 'offline');
      mockSignUp.mockRejectedValueOnce(error);

      await act(async () => {
        await result.current.handleSubmit(createFormEvent());
      });

      expect(mockNotificationError).toHaveBeenCalledWith(expect.objectContaining({ message: 'networkIssue' }));
    });

    it('GIVEN unexpected error WHEN handleSubmit THEN shows registrationFailed notification', async () => {
      const { result } = renderHook(() => useSignUpForm());
      const payload = buildValidPayload();

      act(() => {
        (Object.keys(payload) as (keyof TSignUpPayload)[]).forEach(field => {
          result.current.handleChange(field)(createChangeEvent(payload[field]));
        });
      });

      mockSignUp.mockRejectedValueOnce(new Error('boom'));

      await act(async () => {
        await result.current.handleSubmit(createFormEvent());
      });

      expect(mockNotificationError).toHaveBeenCalledWith(expect.objectContaining({ message: 'registrationFailed' }));
    });
  });

  describe('Schema error message fallback', () => {
    it('GIVEN translation missing WHEN Zod returns message THEN fallback uses raw message', async () => {
      const { result } = renderHook(() => useSignUpForm());

      act(() => {
        result.current.handleChange('fullName')(createChangeEvent('J'));
        result.current.handleChange('email')(createChangeEvent('jane@grow-ps.com'));
        result.current.handleChange('password')(createChangeEvent('12345678'));
        result.current.handleChange('confirmPassword')(createChangeEvent('12345678'));
      });

      await act(async () => {
        await result.current.handleSubmit(createFormEvent());
      });

      expect((result.current.fieldErrors as SignUpFieldErrors).fullName).toBe('nameMin');
    });
  });
});
