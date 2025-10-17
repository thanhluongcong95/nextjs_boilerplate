// Intentionally avoid static import of antd to support SSR and test-time mocking of import failures

import type { HttpMeta } from '@/shared/infra/http/http.types';
import { logError } from '@/shared/infra/monitoring/logger';

import { AppError, NetworkError, ValidationError } from './appError';
import { ERROR_MESSAGES, ErrorCode } from './error-codes';

// ============================================================================
// Types & Constants
// ============================================================================
// Allow using require in a very targeted way for runtime-only fallback
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any;

type HandleErrorOptions = {
  meta?: HttpMeta;
  showNotification?: boolean;
};

type NotificationApi = {
  error: (config: { message: string; description?: string; key?: string; placement?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' }) => void;
};

const NOTIFICATION_SUPPRESSED_CODES = new Set<ErrorCode>([ErrorCode.UNAUTHORIZED]);

const RETRYABLE_ERROR_CODES: readonly ErrorCode[] = [
  ErrorCode.NETWORK_ERROR,
  ErrorCode.TIMEOUT_ERROR,
  ErrorCode.SERVICE_UNAVAILABLE,
  ErrorCode.SERVER_ERROR,
] as const;

// ============================================================================
// Notification Management
// ============================================================================

let notificationApi: NotificationApi | null = null;

/**
 * Set the notification API from antd App.useApp() hook
 * This should be called by NotificationBridge component
 */
export function setNotificationApi(api: NotificationApi) {
  notificationApi = api;
}

// ============================================================================
// Error Normalization
// ============================================================================

/**
 * Normalizes unknown error to AppError instance
 */
function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Failed to reach the API');
  }

  // Validation errors (Zod issues)
  if (error instanceof ValidationError) {
    return error;
  }

  // Zod error format (object with issues)
  if (error && typeof error === 'object' && 'issues' in error) {
    return new ValidationError('Validation failed', error);
  }

  // Standard Error instance
  if (error instanceof Error) {
    logError(error);
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, undefined, error);
  }

  // Unknown error type
  logError(new Error('Unknown error type'), { error });
  return new AppError(ErrorCode.UNKNOWN_ERROR);
}

// ============================================================================
// Notification Logic
// ============================================================================

/**
 * Determines if notification should be shown for this error
 */
function shouldShowNotification(appError: AppError, options: HandleErrorOptions): boolean {
  const { showNotification, meta } = options;
  const metaPreference = meta?.showErrorNotification;
  const decision = showNotification ?? metaPreference ?? false;

  // Notification disabled
  if (!decision) {
    return false;
  }

  // Server-side: no notifications (allow test override via __SSR__ flag)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((globalThis as any).window === undefined || (globalThis as any).__SSR__ === true) {
    return false;
  }

  // Suppressed error codes
  if (NOTIFICATION_SUPPRESSED_CODES.has(appError.code)) {
    return false;
  }

  return true;
}

/**
 * Extracts description from error details
 */
function deriveDescription(appError: AppError, message: string): string | undefined {
  if (!appError.details) {
    return undefined;
  }

  // String details
  if (typeof appError.details === 'string') {
    return appError.details === message ? undefined : appError.details;
  }

  // Object with message property
  if (
    typeof appError.details === 'object' &&
    'message' in appError.details &&
    typeof (appError.details as { message?: unknown }).message === 'string'
  ) {
    const detailMessage = (appError.details as { message: string }).message;
    return detailMessage === message ? undefined : detailMessage;
  }

  return undefined;
}

/**
 * Shows error notification using appropriate API
 */
function showErrorNotification(appError: AppError): void {
  const message = appError.message ?? ERROR_MESSAGES[appError.code] ?? 'An unexpected error occurred';
  const description = deriveDescription(appError, message);
  const notificationConfig = {
    message,
    description,
    key: `${appError.code}:${message}`,
    placement: 'topRight' as const,
  };

  // Use App context notification API (preferred)
  if (notificationApi) {
    notificationApi.error(notificationConfig);
    return;
  }

  // Fallback to static notification API
  if (globalThis.window !== undefined) {
    try {
      // Use require here to avoid bundlers pulling antd into SSR bundles and to allow tests to simulate import failures
      // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-commonjs
      const antd = require('antd');
      if (antd?.notification?.error) {
        antd.notification.error(notificationConfig);
      }
    } catch (err) {
      logError(new Error('Failed to import antd notification'), { error: err });
    }
  }
}

/**
 * Handles error notification display
 */
function notifyAppError(appError: AppError): void {
  try {
    showErrorNotification(appError);
  } catch (notifyError) {
    logError(new Error('Failed to render error notification'), {
      notifyError,
      appError,
    });
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Main error handler - normalizes errors and optionally shows notifications
 * @param error - Unknown error to handle
 * @param options - Handling options
 * @returns Normalized AppError instance
 */
export function handleError(error: unknown, options: HandleErrorOptions = {}): AppError {
  const appError = normalizeError(error);

  if (shouldShowNotification(appError, options)) {
    notifyAppError(appError);
  }

  return appError;
}

/**
 * Checks if error is retryable (network, timeout, server errors)
 */
export function isRetryableError(error: AppError): boolean {
  return RETRYABLE_ERROR_CODES.includes(error.code);
}
