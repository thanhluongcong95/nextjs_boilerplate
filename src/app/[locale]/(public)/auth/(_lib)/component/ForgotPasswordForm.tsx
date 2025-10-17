'use client';

import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/primitives/Button/Button';
import { Input } from '@/shared/ui/primitives/Input/Input';

import { useForgotPassword } from '../hooks/useForgotPassword';

export const ForgotPasswordForm = () => {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const [state, actions] = useForgotPassword();
  const { step, email, otp, password, confirmPassword, isBusy, isResending, errorKey, isResetSuccess, resendSuccess } = state;
  const { setEmail, setOtp, setPassword, setConfirmPassword, submit, resend } = actions;

  // Local visibility state for password fields
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(v => !v);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(v => !v);

  // Redirect after successful password reset
  useEffect(() => {
    if (isResetSuccess && !isBusy) {
      // Small delay to show success state before redirect
      const timer = setTimeout(() => {
        router.push(`/${locale}${ROUTES.public.signin}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isResetSuccess, isBusy, locale, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submit();
  };

  return (
    <form
      onSubmit={e => {
        void handleSubmit(e);
      }}
      className="space-y-6"
    >
      <div className="space-y-2 text-left">
        <h2 className="text-xl font-semibold tracking-tight text-black">{t('resetPasswordTitle')}</h2>
        <p className="text-sm text-slate-600">
          {step === 1 && t('resetPasswordDescription')}
          {step === 2 && t('enterOtpDescription')}
          {step === 3 && t('setNewPasswordDescription')}
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <Input
            id="email"
            type="email"
            label={t('workEmail')}
            autoComplete="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="bg-white text-slate-900 placeholder:text-slate-400"
            placeholder={t('emailPlaceholder')}
            required
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <Input
            id="otp"
            type="text"
            label={t('otp6Digits')}
            value={otp}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
            className="bg-white text-slate-900 placeholder:text-slate-400"
            placeholder={t('otpPlaceholder')}
            maxLength={6}
            required
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => void resend()}
              disabled={isResending}
              className="text-sm text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? t('sending') : t('resendOtp')}
            </button>
            {resendSuccess && <span className="text-sm text-green-600">{t('otpResent')}</span>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <Input
            id="newPassword"
            type={isPasswordVisible ? 'text' : 'password'}
            label={t('newPassword')}
            autoComplete="new-password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="bg-white text-slate-900 placeholder:text-slate-400"
            placeholder={t('passwordPlaceholder')}
            required
            endAdornment={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="font-medium uppercase tracking-wide"
                aria-pressed={isPasswordVisible}
                aria-label={t('togglePasswordVisibility')}
              >
                {isPasswordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            }
          />
          <Input
            id="confirmPassword"
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            label={t('confirmPassword')}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            className="bg-white text-slate-900 placeholder:text-slate-400"
            placeholder={t('confirmPassword')}
            required
            endAdornment={
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="font-medium uppercase tracking-wide"
                aria-pressed={isConfirmPasswordVisible}
                aria-label={t('togglePasswordVisibility')}
              >
                {isConfirmPasswordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            }
          />
        </div>
      )}

      {isResetSuccess && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{t('passwordResetSuccess')}</span>
        </div>
      )}
      {resendSuccess && step === 2 && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{t('otpResent')}</span>
        </div>
      )}
      {errorKey && !isResetSuccess && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{t(errorKey)}</span>
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={
            isBusy ||
            (step === 1 && !email?.trim()) ||
            (step === 2 && otp?.trim().length !== 6) ||
            (step === 3 && (!password?.trim() || !confirmPassword?.trim() || password !== confirmPassword))
          }
          className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isBusy
            ? step === 1
              ? t('sendingResetLink')
              : tc('loading')
            : step === 1
              ? t('sendResetLink')
              : step === 2
                ? t('verifyOtp')
                : t('resetPassword')}
        </Button>
      </div>

      <p className="text-center text-sm text-slate-600">
        {t('rememberedPassword')}{' '}
        <Link href={`/${locale}${ROUTES.public.signin}`} className="font-medium text-indigo-600 hover:text-indigo-700">
          {t('backToSignIn')}
        </Link>
      </p>
    </form>
  );
};
