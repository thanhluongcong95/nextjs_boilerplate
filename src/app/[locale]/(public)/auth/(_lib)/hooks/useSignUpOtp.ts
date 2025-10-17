import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AppError } from '@/shared/infra/errors/appError';

import { authService } from '../api/auth.service';
import { OTP_TYPE } from '../model';

type TranslateFn = (key: string, params?: Record<string, string | number | Date>) => string;

type NotificationService = {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
};

type OtpHandler = {
  sanitizeOtp: (value: string) => string;
  validateOtp: (otp: string) => { isValid: boolean; code?: string };
  formatSuccessMessage: (key: string, email: string, expiresIn?: number) => string;
};

type OtpErrorHandler = {
  handle: (error: AppError) => void;
};

type RouterLike = {
  push: (href: string) => void;
};

interface UseSignUpOtpParams {
  locale: string;
  router: RouterLike;
  authT: TranslateFn;
  notificationService: NotificationService;
  otpHandler: OtpHandler;
  otpErrorHandler: OtpErrorHandler;
}

interface UseSignUpOtpResult {
  otp: string;
  otpEmail: string | null;
  isVerifying: boolean;
  isResending: boolean;
  startOtpFlow: (email: string) => void;
  handleOtpChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleVerifyOtp: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleResendOtp: () => Promise<void>;
}

const REDIRECT_DELAY_MS = 1500;

export const useSignUpOtp = ({ locale, router, authT, notificationService, otpHandler, otpErrorHandler }: UseSignUpOtpParams): UseSignUpOtpResult => {
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const scheduleRedirect = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    redirectTimeoutRef.current = setTimeout(() => {
      router.push(`/${locale}/auth/signin`);
    }, REDIRECT_DELAY_MS);
  }, [locale, router]);

  const startOtpFlow = useCallback((email: string) => {
    setOtpEmail(email);
    setOtp('');
  }, []);

  const handleOtpChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOtp(otpHandler.sanitizeOtp(event.target.value));
    },
    [otpHandler]
  );

  const handleVerifyOtp = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!otpEmail) {
        notificationService.error(authT('registrationFailed'));
        return;
      }

      const validation = otpHandler.validateOtp(otp);
      if (!validation.isValid || !validation.code) {
        notificationService.error(authT('otpInvalid'));
        return;
      }

      setIsVerifying(true);
      try {
        await authService.verifyOtp({
          email: otpEmail,
          otp: validation.code,
          otpType: OTP_TYPE.REGISTRATION,
        });

        notificationService.success(authT('otpVerifiedSuccess'));
        setOtp('');
        scheduleRedirect();
      } catch (error) {
        if (error instanceof AppError) {
          otpErrorHandler.handle(error);
        } else {
          notificationService.error(authT('otpInvalid'));
        }
      } finally {
        setIsVerifying(false);
      }
    },
    [authT, notificationService, otp, otpEmail, otpErrorHandler, otpHandler, scheduleRedirect]
  );

  const handleResendOtp = useCallback(async () => {
    if (!otpEmail) {
      notificationService.error(authT('registrationFailed'));
      return;
    }

    setIsResending(true);
    try {
      const response = await authService.resendOtp({ email: otpEmail });

      const message = otpHandler.formatSuccessMessage('otpResent', otpEmail, response.expiresIn);
      notificationService.success(message);
    } catch (error) {
      if (error instanceof AppError) {
        otpErrorHandler.handle(error);
      } else {
        notificationService.error(authT('otpInvalid'));
      }
    } finally {
      setIsResending(false);
    }
  }, [authT, notificationService, otpEmail, otpErrorHandler, otpHandler]);

  return {
    otp,
    otpEmail,
    isVerifying,
    isResending,
    startOtpFlow,
    handleOtpChange,
    handleVerifyOtp,
    handleResendOtp,
  };
};
