import { act, render, screen, fireEvent } from '@testing-library/react';

jest.mock('next/link', () => ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>);

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseLocale = jest.fn(() => 'en');
const mockUseTranslations = jest.fn((ns: string) => {
  const dictionaries: Record<string, Record<string, string>> = {
    auth: {
      resetPasswordTitle: 'Reset your password',
      resetPasswordDescription: 'Enter the email associated with your account.',
      enterOtpDescription: 'Enter the 6-digit code we emailed to you.',
      setNewPasswordDescription: 'Choose a new password for your account.',
      workEmail: 'Work email',
      emailPlaceholder: 'you@company.com',
      otp6Digits: 'One-time code',
      otpPlaceholder: '123456',
      sending: 'Sending...',
      resendOtp: 'Resend code',
      otpResent: 'OTP resent!',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      togglePasswordVisibility: 'Toggle password visibility',
      passwordPlaceholder: '••••••••',
      passwordResetSuccess: 'Your password has been reset. Redirecting to sign in...',
      sendResetLink: 'Send reset email',
      sendingResetLink: 'Sending email...',
      verifyOtp: 'Verify OTP',
      resetPassword: 'Reset password',
      rememberedPassword: 'Remembered your password?',
      backToSignIn: 'Back to sign in',
      auth: 'auth',
      rateLimited: 'Too many attempts',
      resetFailed: 'Reset failed',
    },
    common: {
      loading: 'Loading...',
    },
  };

  return (key: string, params?: Record<string, string>) => {
    const value = dictionaries[ns]?.[key] ?? key;
    if (key === 'enterOtpDescription' && params?.email) {
      return `Enter the 6-digit code we emailed to ${params.email}.`;
    }
    return value;
  };
});

jest.mock('next-intl', () => ({
  useLocale: () => mockUseLocale(),
  useTranslations: (ns: string) => mockUseTranslations(ns),
}));

const mockUseForgotPassword = jest.fn();
jest.mock('../../hooks/useForgotPassword', () => ({
  useForgotPassword: () => mockUseForgotPassword(),
}));

import { ForgotPasswordForm } from '../ForgotPasswordForm';
import { ROUTES } from '@/shared/config/routes';

type HookOverrides = {
  state?: Partial<{
    step: 1 | 2 | 3;
    email: string;
    otp: string;
    password: string;
    confirmPassword: string;
    isBusy: boolean;
    isResending: boolean;
    errorKey: string | null;
    isResetSuccess: boolean;
    resendSuccess: boolean;
  }>;
  actions?: Partial<{
    setEmail: (value: string) => void;
    setOtp: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    submit: () => Promise<void>;
    resend: () => Promise<void>;
  }>;
};

const buildHookState = (overrides: HookOverrides = {}) => {
  const state = {
    step: 1 as 1 | 2 | 3,
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    isBusy: false,
    isResending: false,
    errorKey: null as string | null,
    isResetSuccess: false,
    resendSuccess: false,
    ...overrides.state,
  };

  const actions = {
    setEmail: jest.fn(),
    setOtp: jest.fn(),
    setPassword: jest.fn(),
    setConfirmPassword: jest.fn(),
    submit: jest.fn(),
    resend: jest.fn(),
    ...overrides.actions,
  };

  return [state, actions] as const;
};

const setup = (overrides: HookOverrides = {}) => {
  const hookReturn = buildHookState(overrides);
  mockUseForgotPassword.mockReturnValue(hookReturn);
  const [state, actions] = hookReturn;
  const utils = render(<ForgotPasswordForm />);
  return { state, actions, ...utils };
};

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockPush.mockClear();
    mockUseForgotPassword.mockReset();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should match snapshot for initial email step', () => {
    const { asFragment } = setup({
      state: { step: 1 },
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render email input and call setEmail on change', () => {
    const { actions } = setup({
      state: { step: 1, email: '' },
    });

    const input = screen.getByLabelText('Work email');
    fireEvent.change(input, { target: { value: 'user@example.com' } });
    expect(actions.setEmail).toHaveBeenCalledWith('user@example.com');

    const submitButton = screen.getByRole('button', { name: 'Send reset email' });
    expect(submitButton).toBeDisabled();
  });

  it('should show OTP step with resend controls', () => {
    setup({
      state: { step: 2, otp: '', isResending: false, resendSuccess: true },
    });

    expect(screen.getByLabelText('One-time code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend code' })).toBeEnabled();
    expect(screen.getAllByText('OTP resent!').length).toBeGreaterThan(0);
  });

  it('should trigger resend action at OTP step', () => {
    const { actions } = setup({
      state: { step: 2, otp: '123', isResending: false },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Resend code' }));
    expect(actions.resend).toHaveBeenCalled();
  });

  it('should render new password fields on step 3 and toggle visibility', () => {
    const { actions } = setup({
      state: { step: 3, password: '', confirmPassword: '' },
    });

    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();

    const toggleButtons = screen.getAllByRole('button', { name: 'Toggle password visibility' });
    const initialPasswordCalls = actions.setPassword.mock.calls.length;
    fireEvent.click(toggleButtons[0]);
    expect(actions.setPassword.mock.calls.length).toBe(initialPasswordCalls);

    const initialConfirmCalls = actions.setConfirmPassword.mock.calls.length;
    fireEvent.click(toggleButtons[1]);
    expect(actions.setConfirmPassword.mock.calls.length).toBe(initialConfirmCalls);
  });

  it('should call corresponding setters on password fields change', () => {
    const { actions } = setup({
      state: { step: 3, password: '', confirmPassword: '' },
    });

    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'Password!1' } });
    expect(actions.setPassword).toHaveBeenCalledWith('Password!1');

    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password!1' } });
    expect(actions.setConfirmPassword).toHaveBeenCalledWith('Password!1');
  });

  it('should disable submit button when validation fails', () => {
    setup({
      state: {
        step: 3,
        password: 'Password!1',
        confirmPassword: 'Mismatch',
        isBusy: false,
      },
    });

    expect(screen.getByRole('button', { name: 'Reset password' })).toBeDisabled();
  });

  it('should call submit handler when form submitted', () => {
    const { actions } = setup({
      state: { step: 1, email: 'user@grow-ps.com' },
    });

    const form = screen.getByLabelText('Work email').closest('form');
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);
    expect(actions.submit).toHaveBeenCalled();
  });

  it('should display error banner when errorKey present', () => {
    setup({
      state: {
        step: 2,
        errorKey: 'resetFailed',
      },
    });

    expect(screen.getByText('Reset failed')).toBeInTheDocument();
  });

  it('should show success message and redirect after reset success', () => {
    setup({
      state: {
        step: 3,
        isResetSuccess: true,
        isBusy: false,
      },
    });

    expect(screen.getByText('Your password has been reset. Redirecting to sign in...')).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(mockPush).toHaveBeenCalledWith(`/en${ROUTES.public.signin}`);
  });

  it('should render sign-in link with locale', () => {
    setup({
      state: { step: 1 },
    });

    const link = screen.getByRole('link', { name: 'Back to sign in' });
    expect(link).toHaveAttribute('href', `/en${ROUTES.public.signin}`);
  });
});
