import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('next/link', () => {
  return ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>;
});

const mockedUseSignUpForm = jest.fn();

jest.mock('../../hooks', () => ({
  useSignUpForm: (...args: unknown[]) => mockedUseSignUpForm(...args),
}));

import { SignUpForm } from '../SignUpForm';
import { ROUTES } from '@/shared/config/routes';

type HookState = ReturnType<typeof buildHookState>;

function buildHookState(overrides?: Partial<HookState>): HookState {
  const translations: Record<string, string> = {
    otpTitle: 'Verify your email',
    otpDescription: 'Enter the code sent to {email}',
    otpCode: 'OTP Code',
    verifyingOtp: 'Verifying...',
    verifyOtp: 'Verify OTP',
    resendingOtp: 'Resending...',
    resendOtp: 'Resend OTP',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    signUpTitle: 'Create your account',
    signUpDescription: 'Enter your details below.',
    workEmail: 'Work email',
    emailPlaceholder: 'you@company.com',
    password: 'Password',
    passwordPlaceholder: '••••••••',
    confirmPassword: 'Confirm password',
    togglePasswordVisibility: 'Toggle password visibility',
    createAccount: 'Create account',
    creatingAccount: 'Creating...',
    termsNotice: 'By continuing you accept the terms.',
    otpSent: 'OTP sent!',
  };

  const authT = jest.fn((key: string, params?: Record<string, string>) => {
    if (key === 'otpDescription') {
      return `Enter the code sent to ${params?.email ?? ''}`;
    }
    if (key === 'emailDomainHint') {
      return `Allowed domains: ${params?.domains ?? ''}`;
    }
    return translations[key] ?? key;
  });

  const usersT = jest.fn((key: string) => {
    const dict: Record<string, string> = {
      fullName: 'Full name',
      fullNamePlaceholder: 'John Doe',
    };
    return dict[key] ?? key;
  });

  return {
    authT,
    usersT,
    locale: 'en',
    step: 'form' as const,
    values: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    otp: '',
    otpEmail: null as string | null,
    fieldErrors: {} as Record<string, string | undefined>,
    allowedDomainList: '@grow-ps.com',
    isRegistering: false,
    isVerifying: false,
    isResending: false,
    isPasswordVisible: false,
    isConfirmPasswordVisible: false,
    handleChange: jest.fn(() => jest.fn()),
    handleSubmit: jest.fn(),
    handleVerifyOtp: jest.fn(),
    handleResendOtp: jest.fn(),
    handleOtpChange: jest.fn(),
    togglePasswordVisibility: jest.fn(),
    toggleConfirmPasswordVisibility: jest.fn(),
    ...overrides,
  };
}

const setup = (overrides?: Partial<HookState>) => {
  const state = buildHookState(overrides);
  mockedUseSignUpForm.mockReturnValue(state);
  const result = render(<SignUpForm />);
  return { state, ...result };
};

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot for initial form view', () => {
    const { asFragment } = setup();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render base fields and supporting text', () => {
    setup();

    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument();
    expect(screen.getByText('Enter your details below.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
    expect(screen.getByText('Allowed domains: @grow-ps.com')).toBeInTheDocument();
  });

  it('should disable submit button when required fields missing or errors present', () => {
    setup({
      values: {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      fieldErrors: {
        email: 'Email invalid',
      },
    });

    const button = screen.getByRole('button', { name: 'Create account' });
    expect(button).toBeDisabled();
  });

  it('should call handleChange handlers when typing inputs', () => {
    const { state } = setup();

    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: 'John' } });
    expect(state.handleChange).toHaveBeenCalledWith('fullName');

    fireEvent.change(screen.getByLabelText(/Work email/i), { target: { value: 'john@example.com' } });
    expect(state.handleChange).toHaveBeenCalledWith('email');
  });

  it('should call handleSubmit on form submit', () => {
    const { state } = setup();

    const form = screen.getByText('Create account').closest('form');
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);

    expect(state.handleSubmit).toHaveBeenCalled();
  });

  it('should toggle password visibility buttons', () => {
    const { state } = setup();

    const toggleButtons = screen.getAllByRole('button', { name: 'Toggle password visibility' });
    fireEvent.click(toggleButtons[0]);
    expect(state.togglePasswordVisibility).toHaveBeenCalled();

    fireEvent.click(toggleButtons[1]);
    expect(state.toggleConfirmPasswordVisibility).toHaveBeenCalled();
  });

  it('should render OTP step when step is otp', () => {
    setup({
      step: 'otp',
      otp: '123',
      otpEmail: 'john@grow-ps.com',
    });

    expect(screen.getByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
    expect(screen.getByText('Enter the code sent to john@grow-ps.com')).toBeInTheDocument();
    expect(screen.getByLabelText('OTP Code')).toHaveValue('123');
  });

  it('should call OTP handlers on submit and resend', () => {
    const { state } = setup({
      step: 'otp',
      otp: '123456',
      otpEmail: 'john@grow-ps.com',
    });

    const otpForm = screen.getByLabelText('OTP Code').closest('form');
    expect(otpForm).toBeInTheDocument();
    fireEvent.submit(otpForm!);
    expect(state.handleVerifyOtp).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Resend OTP' }));
    expect(state.handleResendOtp).toHaveBeenCalled();
  });

  it('should render sign-in link with locale-aware href', () => {
    setup();
    const links = screen.getAllByRole('link', { name: 'Sign in' });
    expect(links[0]).toHaveAttribute('href', `/en${ROUTES.public.signin}`);
  });
});
