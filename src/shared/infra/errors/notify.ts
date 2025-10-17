import type { NotificationInstance } from 'antd/es/notification/interface';

import { AppError } from './appError';
import { ErrorCode } from './error-codes';

type TFunction = (key: string) => string;

function resolveErrorMessage(t: TFunction, error: unknown, fallbackKey: string): string {
  if (error instanceof AppError) {
    const code = error.code;
    switch (code) {
      case ErrorCode.UNAUTHORIZED:
        return t('notifications.errors.unauthorized');
      case ErrorCode.FORBIDDEN:
        return t('notifications.errors.forbidden');
      case ErrorCode.NOT_FOUND:
        return t('notifications.errors.notFound');
      case ErrorCode.VALIDATION_ERROR:
        return t('notifications.errors.validation');
      case ErrorCode.TIMEOUT_ERROR:
      case ErrorCode.NETWORK_ERROR:
        return t('notifications.errors.network');
      case ErrorCode.SERVER_ERROR:
        return t('notifications.errors.server');
      default:
        return t('notifications.errors.unknown');
    }
  }
  return t(fallbackKey);
}

export function notifyApiError(notification: NotificationInstance, t: TFunction, error: unknown, fallbackKey: string): void {
  const message = resolveErrorMessage(t, error, fallbackKey);
  notification.error({ message, placement: 'topRight' });
}
