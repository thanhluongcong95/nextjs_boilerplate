'use client';

import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';

import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/primitives/Button/Button';
import { Input } from '@/shared/ui/primitives/Input/Input';

import { useSignUpForm } from '../hooks';

export const SignUpForm = () => {
  const {
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
  } = useSignUpForm();

  if (step === 'otp') {
    return (
      <form
        onSubmit={event => {
          void handleVerifyOtp(event);
        }}
        className="space-y-6"
      >
        <div className="space-y-2 text-left">
          <h2 className="text-xl font-semibold tracking-tight text-black">{authT('otpTitle')}</h2>
          <p className="text-sm text-slate-600">{authT('otpDescription', { email: otpEmail ?? '' })}</p>
        </div>

        <Input
          id="otp"
          label={authT('otpCode')}
          value={otp}
          onChange={handleOtpChange}
          inputMode="numeric"
          autoComplete="one-time-code"
          className="bg-white tracking-widest text-slate-900 placeholder:text-slate-400"
          placeholder="------"
          required
          maxLength={6}
        />

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={isVerifying || otp?.trim().length !== 6}
            className="w-full rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isVerifying ? authT('verifyingOtp') : authT('verifyOtp')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void handleResendOtp();
            }}
            disabled={isResending}
            className="w-full rounded-full px-6 py-3 text-sm font-semibold"
          >
            {isResending ? authT('resendingOtp') : authT('resendOtp')}
          </Button>
        </div>

        <p className="text-center text-sm text-slate-600">
          {authT('alreadyHaveAccount')}{' '}
          <Link href={`/${locale}${ROUTES.public.signin}`} className="font-medium text-indigo-600 hover:text-indigo-700">
            {authT('signIn')}
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form
      onSubmit={event => {
        void handleSubmit(event);
      }}
      className="space-y-6"
    >
      <div className="space-y-2 text-left">
        <h2 className="text-xl font-semibold tracking-tight text-black">{authT('signUpTitle')}</h2>
        <p className="text-sm text-slate-600">{authT('signUpDescription')}</p>
      </div>

      <div className="space-y-5">
        <Input
          id="fullName"
          label={usersT('fullName')}
          value={values.fullName}
          onChange={handleChange('fullName')}
          error={fieldErrors.fullName ?? undefined}
          className="bg-white text-slate-900 placeholder:text-slate-400"
          placeholder={usersT('fullNamePlaceholder')}
          required
        />
        <Input
          id="email"
          type="email"
          label={authT('workEmail')}
          autoComplete="email"
          value={values.email}
          onChange={handleChange('email')}
          error={fieldErrors.email ?? undefined}
          className="bg-white text-slate-900 placeholder:text-slate-400"
          placeholder={authT('emailPlaceholder')}
          required
          hint={fieldErrors.email ? undefined : authT('emailDomainHint', { domains: allowedDomainList })}
        />
        <Input
          id="password"
          type={isPasswordVisible ? 'text' : 'password'}
          label={authT('password')}
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange('password')}
          error={fieldErrors.password ?? undefined}
          className="bg-white text-slate-900 placeholder:text-slate-400"
          placeholder={authT('passwordPlaceholder')}
          required
          minLength={8}
          endAdornment={
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="font-medium uppercase tracking-wide"
              aria-pressed={isPasswordVisible}
              aria-label={authT('togglePasswordVisibility')}
            >
              {isPasswordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          }
        />
        <Input
          id="confirmPassword"
          type={isConfirmPasswordVisible ? 'text' : 'password'}
          label={authT('confirmPassword')}
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={fieldErrors.confirmPassword ?? undefined}
          className="bg-white text-slate-900 placeholder:text-slate-400"
          placeholder={authT('passwordPlaceholder')}
          required
          minLength={8}
          endAdornment={
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="font-medium uppercase tracking-wide"
              aria-pressed={isConfirmPasswordVisible}
              aria-label={authT('togglePasswordVisibility')}
            >
              {isConfirmPasswordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          }
        />
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={
            isRegistering ||
            !values.fullName?.trim() ||
            !values.email?.trim() ||
            !values.password?.trim() ||
            !values.confirmPassword?.trim() ||
            !!fieldErrors.fullName ||
            !!fieldErrors.email ||
            !!fieldErrors.password ||
            !!fieldErrors.confirmPassword
          }
          className="w-full rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRegistering ? authT('creatingAccount') : authT('createAccount')}
        </Button>
        <p className="text-center text-xs text-slate-600">{authT('termsNotice')}</p>
      </div>

      <p className="text-center text-sm text-slate-600">
        {authT('alreadyHaveAccount')}{' '}
        <Link href={`/${locale}${ROUTES.public.signin}`} className="font-medium text-indigo-600 hover:text-indigo-700">
          {authT('signIn')}
        </Link>
      </p>
    </form>
  );
};
