import { notification } from 'antd';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { ChangeEvent, FormEvent } from 'react';
import { useMemo, useState } from 'react';

import { AppError } from '@/shared/infra/errors/appError';
import { ErrorCode } from '@/shared/infra/errors/error-codes';

import { authService } from '../api/auth.service';
import {
  INITIAL_SIGN_UP_VALUES,
  otpCodeSchema,
  SIGN_UP_ALLOWED_EMAIL_DOMAINS,
  type SignUpFieldErrors,
  signUpPayloadSchema,
  type SignUpStep,
  type TSignUpPayload,
} from '../model';

import { useSignUpOtp } from './useSignUpOtp';

interface UseSignUpFormResult {
  authT: ReturnType<typeof useTranslations>;
  usersT: ReturnType<typeof useTranslations>;
  locale: string;
  step: SignUpStep;
  values: TSignUpPayload;
  otp: string;
  otpEmail: string | null;
  fieldErrors: SignUpFieldErrors;
  allowedDomainList: string;
  isRegistering: boolean;
  isVerifying: boolean;
  isResending: boolean;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  handleChange: (field: keyof TSignUpPayload) => (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleVerifyOtp: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleResendOtp: () => Promise<void>;
  handleOtpChange: (event: ChangeEvent<HTMLInputElement>) => void;
  togglePasswordVisibility: () => void;
  toggleConfirmPasswordVisibility: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ============================================================================
// Utility Functions - Single Responsibility
// ============================================================================

/**
 * Extracts error code from error details
 */
const extractDetailCode = (details: unknown): string | undefined => {
  if (!details) return undefined;
  if (typeof details === 'string') return details;
  if (typeof details !== 'object' || details === null) return undefined;

  const obj = details as Record<string, unknown>;

  if (typeof obj.code === 'string') return obj.code;
  if (typeof obj.error === 'string') return obj.error;
  if (typeof obj.message === 'string') return obj.message;

  return undefined;
};

// ============================================================================
// Email Validator - Single Responsibility: Email validation only
// ============================================================================

const createEmailValidator = (allowedDomains: string[], domainList: string, translate: (key: string, params?: Record<string, string>) => string) => {
  const validate = (email: string): string | undefined => {
    if (!email) return undefined;

    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return translate('emailInvalid');
    }

    const domain = trimmedEmail.split('@')[1]?.toLowerCase();
    if (domain && allowedDomains.includes(domain)) {
      return undefined;
    }

    return translate('emailDomainHint', { domains: domainList });
  };

  return { validate };
};

// ============================================================================
// Notification Service - Single Responsibility: Notification handling only
// ============================================================================

const createNotificationService = () => {
  const showError = (message: string, description?: string): void => {
    notification.error({
      message,
      description,
      placement: 'topRight',
    });
  };

  const showSuccess = (message: string, description?: string): void => {
    notification.success({
      message,
      description,
      placement: 'topRight',
    });
  };

  return {
    error: showError,
    success: showSuccess,
  };
};

// ============================================================================
// Registration Error Handler - Single Responsibility: Registration error handling
// ============================================================================

const createRegistrationErrorHandler = (
  notificationService: ReturnType<typeof createNotificationService>,
  domainList: string,
  setFieldErrors: (updater: (prev: SignUpFieldErrors) => SignUpFieldErrors) => void,
  translate: (key: string, params?: Record<string, string>) => string
) => {
  const handle = (error: AppError): void => {
    const detailCode = extractDetailCode(error.details);

    if (error.statusCode === 409 || detailCode === 'EMAIL_ALREADY_EXISTS') {
      setFieldErrors(prev => ({
        ...prev,
        email: translate('emailAlreadyRegistered'),
      }));
      return;
    }

    if (detailCode === 'INVALID_DOMAIN') {
      setFieldErrors(prev => ({
        ...prev,
        email: translate('emailDomainHint', {
          domains: domainList,
        }),
      }));
      return;
    }

    if (error.code === ErrorCode.NETWORK_ERROR || error.code === ErrorCode.TIMEOUT_ERROR) {
      notificationService.error(translate('networkIssue'));
      return;
    }

    notificationService.error(error.message || translate('registrationFailed'));
  };

  return { handle };
};

// ============================================================================
// OTP Error Handler - Single Responsibility: OTP error handling
// ============================================================================

const createOtpErrorHandler = (notificationService: ReturnType<typeof createNotificationService>, translate: (key: string) => string) => {
  const handle = (error: AppError): void => {
    const detailCode = extractDetailCode(error.details);

    if (detailCode === 'OTP_EXPIRED' || error.statusCode === 410) {
      notificationService.error(translate('otpExpired'));
      return;
    }

    if (detailCode === 'OTP_INVALID' || detailCode === 'CODE_INVALID') {
      notificationService.error(translate('otpInvalid'));
      return;
    }

    if (error.code === ErrorCode.NETWORK_ERROR || error.code === ErrorCode.TIMEOUT_ERROR) {
      notificationService.error(translate('networkIssue'));
      return;
    }

    notificationService.error(error.message || translate('otpInvalid'));
  };

  return { handle };
};

// ============================================================================
// Form Validator - Single Responsibility: Form validation
// ============================================================================

const createFormValidator = (emailValidator: ReturnType<typeof createEmailValidator>, translate: (key: string) => string) => {
  const resolveSchemaMessage = (key?: string): string | undefined => {
    if (!key) return undefined;
    const translator = translate as typeof translate & { has?: (messageKey: string) => boolean };
    if (typeof translator.has === 'function' && translator.has(key)) {
      return translate(key);
    }
    return key;
  };

  const validateEmail = (email: string): string | undefined => {
    return emailValidator.validate(email);
  };

  const validateForm = (
    values: TSignUpPayload,
    setFieldErrors: (updater: (prev: SignUpFieldErrors) => SignUpFieldErrors) => void
  ): { isValid: boolean; data?: TSignUpPayload } => {
    const emailError = validateEmail(values.email);
    if (emailError) {
      setFieldErrors(prev => ({ ...prev, email: emailError }));
      return { isValid: false };
    }

    const parsed = signUpPayloadSchema.safeParse(values);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const path = issue?.path?.[0] as keyof TSignUpPayload | undefined;
      const messageKey = typeof issue?.message === 'string' ? issue.message : undefined;
      const resolvedMessage = resolveSchemaMessage(messageKey);

      if (path) {
        setFieldErrors(prev => ({
          ...prev,
          [path]: resolvedMessage,
        }));
      }

      return { isValid: false };
    }

    return { isValid: true, data: parsed.data };
  };

  return { validateEmail, validateForm };
};

// ============================================================================
// OTP Handler - Single Responsibility: OTP operations
// ============================================================================

const createOtpHandler = (
  notificationService: ReturnType<typeof createNotificationService>,
  errorHandler: ReturnType<typeof createOtpErrorHandler>,
  translate: (key: string, params?: Record<string, string | number | Date>) => string
) => {
  const sanitizeOtp = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 6);
  };

  const validateOtp = (otp: string): { isValid: boolean; code?: string } => {
    const parsed = otpCodeSchema.safeParse(otp.trim());
    if (!parsed.success) {
      return { isValid: false };
    }
    return { isValid: true, code: parsed.data };
  };

  const formatSuccessMessage = (key: string, email: string, expiresIn?: number): string => {
    const params: Record<string, string | number | Date> = { email };
    if (typeof expiresIn === 'number') {
      params.expiresIn = expiresIn;
    }
    return translate(key, params);
  };

  return { sanitizeOtp, validateOtp, formatSuccessMessage };
};

// ============================================================================
// Main Hook - Orchestrates all services
// ============================================================================

export const useSignUpForm = (): UseSignUpFormResult => {
  const router = useRouter();
  const locale = useLocale();
  const authT = useTranslations('auth');
  const usersT = useTranslations('users');

  // State management
  const [step, setStep] = useState<SignUpStep>('form');
  const [values, setValues] = useState<TSignUpPayload>(INITIAL_SIGN_UP_VALUES);
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Memoized values
  const allowedDomains = useMemo(() => SIGN_UP_ALLOWED_EMAIL_DOMAINS.map(domain => domain.toLowerCase()), []);

  const allowedDomainList = useMemo(() => SIGN_UP_ALLOWED_EMAIL_DOMAINS.map(domain => `@${domain}`).join(', '), []);

  // Initialize services (with dependency injection via closures)
  const notificationService = useMemo(() => createNotificationService(), []);

  const emailValidator = useMemo(() => createEmailValidator(allowedDomains, allowedDomainList, authT), [allowedDomains, allowedDomainList, authT]);

  const formValidator = useMemo(() => createFormValidator(emailValidator, authT), [emailValidator, authT]);

  const registrationErrorHandler = useMemo(
    () => createRegistrationErrorHandler(notificationService, allowedDomainList, setFieldErrors, authT),
    [notificationService, allowedDomainList, authT]
  );

  const otpErrorHandler = useMemo(() => createOtpErrorHandler(notificationService, authT), [notificationService, authT]);

  const otpHandler = useMemo(() => createOtpHandler(notificationService, otpErrorHandler, authT), [notificationService, otpErrorHandler, authT]);

  const { otp, otpEmail, isVerifying, isResending, startOtpFlow, handleOtpChange, handleVerifyOtp, handleResendOtp } = useSignUpOtp({
    locale,
    router,
    authT,
    notificationService,
    otpHandler,
    otpErrorHandler,
  });

  // Event handlers
  const handleChange = (field: keyof TSignUpPayload) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues(current => ({ ...current, [field]: value }));

    setFieldErrors(current => ({
      ...current,
      [field]: field === 'email' ? emailValidator.validate(value) : undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = formValidator.validateForm(values, setFieldErrors);
    if (!validation.isValid || !validation.data) {
      notificationService.error(authT('invalidForm'));
      return;
    }

    setIsRegistering(true);
    try {
      setFieldErrors({});
      const response = await authService.signUp(validation.data);

      startOtpFlow(validation.data.email);
      setStep('otp');

      const message = otpHandler.formatSuccessMessage('otpSent', validation.data.email, response.expiresIn);
      notificationService.success(message);

      setValues({ ...INITIAL_SIGN_UP_VALUES, email: validation.data.email });
    } catch (error) {
      if (error instanceof AppError) {
        registrationErrorHandler.handle(error);
      } else {
        notificationService.error(authT('registrationFailed'));
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((current: boolean) => !current);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((current: boolean) => !current);
  };

  return {
    authT,
    usersT,
    locale,
    step,
    values,
    otp,
    otpEmail,
    fieldErrors,
    allowedDomainList,
    isRegistering,
    isVerifying,
    isResending,
    isPasswordVisible,
    isConfirmPasswordVisible,
    handleChange,
    handleSubmit,
    handleVerifyOtp,
    handleResendOtp,
    handleOtpChange,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  };
};
