import { useCallback, useState } from 'react';

import { authService } from '@/app/[locale]/(public)/auth/(_lib)/api/auth.service';
import {
  forgotPasswordPayloadSchema,
  OTP_TYPE,
  resetPasswordPayloadSchema,
  verifyResetOtpPayloadSchema,
} from '@/app/[locale]/(public)/auth/(_lib)/model';

export type ForgotStep = 1 | 2 | 3;

export interface ForgotFormState {
  step: ForgotStep;
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
  isBusy: boolean;
  isResending: boolean;
  errorKey: string | null; // i18n key
  isResetSuccess: boolean; // true when step 3 reset password succeeds
  resendSuccess: boolean; // true when resend OTP succeeds
}

export interface ForgotActions {
  setEmail: (v: string) => void;
  setOtp: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  submit: () => Promise<void>;
  resend: () => Promise<void>;
}

export function useForgotPassword(): [ForgotFormState, ForgotActions] {
  const [step, setStep] = useState<ForgotStep>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const mapErrorToKey = (err: unknown): string => {
    // Handle API errors with status codes
    const apiError = err as { status?: number; code?: string };
    if (apiError.status === 429) return 'rateLimited';

    // Handle Error objects (thrown from validation)
    if (err instanceof Error) {
      const code = err.message;
      if (code === 'INVALID_DOMAIN' || code === 'EMAIL_INVALID' || code === 'emailDomainInvalid') return 'emailDomainInvalid';
      if (code === 'INVALID_OTP' || code === 'EXPIRED_OTP' || code === 'otpInvalid') return 'otpInvalid';
      if (code === 'PASSWORD_MIN' || code === 'passwordMin') return 'passwordMin';
      if (code === 'PASSWORD_MISMATCH' || code === 'passwordMismatch') return 'passwordMismatch';
      if (code === 'passwordSpecialChar') return 'passwordSpecialChar';
      if (code === 'PASSWORD_INVALID') return 'resetPasswordError';
    }

    // Handle error objects with code property
    if (apiError.code) {
      if (apiError.code === 'INVALID_DOMAIN' || apiError.code === 'EMAIL_INVALID') return 'emailDomainInvalid';
      if (apiError.code === 'INVALID_OTP' || apiError.code === 'EXPIRED_OTP') return 'otpInvalid';
    }

    return 'resetFailed';
  };

  const submit = useCallback(async () => {
    setErrorKey(null);
    setResendSuccess(false);
    try {
      if (step === 1) {
        // Use schema validation instead of manual checks
        const parsed = forgotPasswordPayloadSchema.safeParse({ email });
        if (!parsed.success) {
          const firstError = parsed.error.issues[0];
          throw new Error(firstError?.message || 'EMAIL_INVALID');
        }
        setIsBusy(true);
        await authService.requestPasswordReset({ email });
        setStep(2);
      } else if (step === 2) {
        // Use schema validation for OTP
        const parsed = verifyResetOtpPayloadSchema.safeParse({
          email,
          otp,
          otpType: OTP_TYPE.FORGOT_PASSWORD,
        });
        if (!parsed.success) {
          throw new Error('INVALID_OTP');
        }
        setIsBusy(true);
        await authService.verifyResetOtp({ email, otp, otpType: OTP_TYPE.FORGOT_PASSWORD });
        setStep(3);
      } else if (step === 3) {
        // Use schema validation for password (includes special char requirement)
        const parsed = resetPasswordPayloadSchema.safeParse({
          email,
          password,
          confirmPassword,
        });
        if (!parsed.success) {
          const firstError = parsed.error.issues[0];
          throw new Error(firstError?.message || 'PASSWORD_INVALID');
        }
        setIsBusy(true);
        await authService.resetPassword({ email, password, confirmPassword });
        // Clear sensitive data after successful reset
        setOtp('');
        setPassword('');
        setConfirmPassword('');
        setIsResetSuccess(true);
      }
    } catch (err: unknown) {
      const key = mapErrorToKey(err);
      setErrorKey(key);
    } finally {
      setIsBusy(false);
    }
  }, [confirmPassword, email, otp, password, step]);

  const resend = useCallback(async () => {
    setErrorKey(null);
    setResendSuccess(false);
    setIsResending(true);
    try {
      // Validate email before resending
      const parsed = forgotPasswordPayloadSchema.safeParse({ email });
      if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        throw new Error(firstError?.message || 'EMAIL_INVALID');
      }
      await authService.resendResetOtp({ email });
      setResendSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err: unknown) {
      // swallow details to avoid leaking email existence; still map generic rate limits
      const status = (err as { status?: number })?.status;
      if (status === 429) {
        setErrorKey('auth.rateLimited');
      } else {
        // Don't show error to avoid leaking email existence, but still handle rate limits
      }
    } finally {
      setIsResending(false);
    }
  }, [email]);

  return [
    {
      step,
      email,
      otp,
      password,
      confirmPassword,
      isBusy,
      isResending,
      errorKey,
      isResetSuccess,
      resendSuccess,
    },
    { setEmail, setOtp, setPassword, setConfirmPassword, submit, resend },
  ];
}
