'use client';

import { LockOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, notification } from 'antd';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { authService } from '@/app/[locale]/(public)/auth/(_lib)/api/auth.service';
import { useToast } from '@/shared/hooks/useToast';
import { AppError } from '@/shared/infra/errors/appError';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

interface ChangePasswordFormData {
  currentPassword: string;
  password: string; // Changed from newPassword to match backend
  confirmPassword: string;
}

/**
 * Extracts error message from API error response
 * Handles both array and string message formats
 */
function extractApiErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof AppError && error.details) {
    const details = error.details;

    // Handle object with message property (can be array or string)
    if (typeof details === 'object' && details !== null && 'message' in details) {
      const messageValue = (details as { message?: unknown }).message;

      // If message is an array, join them
      if (Array.isArray(messageValue)) {
        const messages = messageValue.filter((msg): msg is string => typeof msg === 'string');
        if (messages.length > 0) {
          return messages.join('. ');
        }
      }

      // If message is a string
      if (typeof messageValue === 'string' && messageValue.trim()) {
        return messageValue;
      }
    }

    // Handle direct string details
    if (typeof details === 'string' && details.trim()) {
      return details;
    }
  }

  // Fallback to error message or default
  if (error instanceof AppError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return defaultMessage;
}

export const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => {
  const t = useTranslations('auth');
  const { showError } = useToast();
  const [form] = Form.useForm<ChangePasswordFormData>();
  const [loading, setLoading] = useState(false);

  // Watch form values to enable/disable submit button
  const currentPassword = Form.useWatch('currentPassword', form);
  const password = Form.useWatch('password', form);
  const confirmPassword = Form.useWatch('confirmPassword', form);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    if (!currentPassword || !password || !confirmPassword) return false;
    // All fields must have at least 8 characters
    const allFieldsValid = currentPassword.trim().length >= 8 && password.trim().length >= 8 && confirmPassword.trim().length >= 8;
    // Passwords must match
    const passwordsMatch = password === confirmPassword;
    // New password must be different from current password
    const passwordDifferent = currentPassword !== password;
    return allFieldsValid && passwordsMatch && passwordDifferent;
  }, [currentPassword, password, confirmPassword]);

  const handleSubmit = (values: ChangePasswordFormData) => {
    // Validation: passwords must match
    if (values.password !== values.confirmPassword) {
      showError(t('passwordMismatch'));
      return;
    }

    // Validation: new password must be different from current password
    if (values.currentPassword === values.password) {
      showError(t('passwordMustBeDifferent') || 'New password must be different from current password');
      return;
    }

    setLoading(true);

    authService
      .changePassword({
        currentPassword: values.currentPassword,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      .then(() => {
        // Show success notification
        notification.success({
          message: t('changePasswordSuccess'),
          placement: 'topRight',
          duration: 3,
        });
        form.resetFields();
        onClose();
      })
      .catch(error => {
        // Extract error message from API response or use default
        const errorMessage = extractApiErrorMessage(error, t('changePasswordError') || 'Failed to change password');

        // Show error notification
        notification.error({
          message: t('changePasswordError') || 'Failed to change password',
          description: errorMessage,
          placement: 'topRight',
          duration: 5,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <LockOutlined className="text-blue-600" />
          <span>{t('changePassword')}</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
      className="change-password-modal"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4" requiredMark={false}>
        <Form.Item name="currentPassword" label={t('currentPassword')} rules={[{ required: true, message: t('passwordRequired') }]}>
          <Input.Password placeholder={t('passwordPlaceholder')} size="large" className="rounded-lg" />
        </Form.Item>

        <Form.Item
          name="password"
          label={t('newPassword')}
          rules={[
            { required: true, message: t('passwordRequired') },
            { min: 8, message: t('passwordMin') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const currentPassword = getFieldValue('currentPassword');
                if (currentPassword && value === currentPassword) {
                  return Promise.reject(new Error(t('passwordMustBeDifferent') || 'New password must be different from current password'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password placeholder={t('passwordPlaceholder')} size="large" className="rounded-lg" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={t('confirmPassword')}
          rules={[
            { required: true, message: t('passwordRequired') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('passwordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password placeholder={t('passwordPlaceholder')} size="large" className="rounded-lg" />
        </Form.Item>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={handleCancel} size="large" className="rounded-lg px-6">
            {t('cancel')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!isFormValid || loading}
            size="large"
            className="rounded-lg bg-blue-600 px-6 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t('changePassword')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
