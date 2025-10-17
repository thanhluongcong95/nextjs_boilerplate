'use client';

import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useAuth } from '@/app/[locale]/(public)/auth/(_lib)/hooks';
import { ROUTES } from '@/shared/config/routes';

type SignInFormValues = {
  email: string;
  password: string;
};

export const SignInForm = () => {
  const locale = useLocale();
  const t = useTranslations('auth');
  const { signIn, isLoading } = useAuth();
  const [form] = Form.useForm<SignInFormValues>();

  // Watch form values to enable/disable submit button
  const email = Form.useWatch('email', form);
  const password = Form.useWatch('password', form);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    if (!email || !password) return false;
    // Basic validation: email format and password length
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const passwordValid = password.trim().length >= 8;
    return emailValid && passwordValid;
  }, [email, password]);

  const handleSubmit = async (values: SignInFormValues) => {
    try {
      await signIn(values);
    } catch {
      // Errors surface through global notification pipeline; nothing else to do here.
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-black">{t('signIn')}</h2>
        <p className="text-sm text-slate-600">{t('signInDescription')}</p>
      </div>

      {/* Form Section */}
      <Form form={form} onFinish={values => void handleSubmit(values)} layout="vertical" size="large" className="space-y-1">
        {/* Email Field */}
        <Form.Item
          name="email"
          label={<span className="font-medium text-black">{t('workEmail')}</span>}
          rules={[
            { required: true, message: t('emailRequired') },
            { type: 'email', message: t('emailInvalid') },
          ]}
          className="mb-5"
        >
          <Input
            prefix={<MailOutlined className="text-slate-500" />}
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            className="rounded-xl border-white/20 bg-white/95 transition-all hover:bg-white focus:bg-white"
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          name="password"
          label={<span className="font-medium text-black">{t('password')}</span>}
          rules={[
            { required: true, message: t('passwordRequired') },
            { min: 8, message: t('passwordMin') },
          ]}
          className="mb-6"
        >
          <Input.Password
            prefix={<LockOutlined className="text-slate-500" />}
            placeholder={t('passwordPlaceholder')}
            autoComplete="current-password"
            className="rounded-xl border-white/20 bg-white/95 transition-all hover:bg-white focus:bg-white"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={!isFormValid || isLoading}
            block
            className="h-12 rounded-full border-none bg-gradient-to-r from-indigo-500 to-sky-500 text-base font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:from-indigo-400 hover:to-sky-400 hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? t('signingIn') : t('signIn')}
          </Button>
        </Form.Item>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <Link href={`/${locale}${ROUTES.public.forgotPassword}`} className="text-sm text-slate-600 transition-colors hover:text-indigo-600">
            {t('forgotPassword')}
          </Link>
        </div>

        {/* Sign Up Link */}
        <div className="mt-4 text-center">
          <span className="text-sm text-slate-600">{t('dontHaveAccount')} </span>
          <Link href={`/${locale}${ROUTES.public.signup}`} className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700">
            {t('signUp')}
          </Link>
        </div>
      </Form>
    </div>
  );
};
